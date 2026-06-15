"use client";

import { useEffect, useState } from "react";

const ALL_PLATFORMS = [
  { key: "greenhouse", label: "Greenhouse" },
  { key: "lever", label: "Lever" },
  { key: "ashby", label: "Ashby" },
];

interface Config {
  enabled: boolean;
  dailyLimit: number | null;
  platforms: string[];
  dryRun: boolean;
  minIntervalSec: number;
}
interface TokenRow {
  id: string;
  prefix: string;
  label?: string | null;
  createdAt: string;
  lastUsedAt?: string | null;
}
interface LogRow {
  id: string;
  company: string;
  title: string;
  platform: string;
  status: string;
  message?: string | null;
  createdAt: string;
}

const statusStyle: Record<string, string> = {
  submitted: "bg-green-100 text-green-700",
  filled: "bg-brand-50 text-brand-700",
  failed: "bg-red-100 text-red-700",
  skipped: "bg-gray-100 text-gray-500",
};

export default function AutoApplySettings() {
  const [cfg, setCfg] = useState<Config | null>(null);
  const [tokens, setTokens] = useState<TokenRow[]>([]);
  const [logs, setLogs] = useState<LogRow[]>([]);
  const [newToken, setNewToken] = useState("");
  const [saved, setSaved] = useState(false);

  const loadAll = () => {
    fetch("/api/autoapply/config").then((r) => r.json()).then((d) => setCfg(d.config));
    fetch("/api/tokens").then((r) => r.json()).then((d) => setTokens(d.tokens ?? []));
    fetch("/api/autoapply/logs").then((r) => r.json()).then((d) => setLogs(d.logs ?? []));
  };
  useEffect(loadAll, []);

  const save = async () => {
    if (!cfg) return;
    await fetch("/api/autoapply/config", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(cfg),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  const createToken = async () => {
    const res = await fetch("/api/tokens", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({}) });
    const d = await res.json();
    setNewToken(d.token ?? "");
    loadAll();
  };
  const delToken = async (id: string) => {
    await fetch(`/api/tokens/${id}`, { method: "DELETE" });
    loadAll();
  };

  const togglePlatform = (k: string) => {
    if (!cfg) return;
    const has = cfg.platforms.includes(k);
    setCfg({ ...cfg, platforms: has ? cfg.platforms.filter((p) => p !== k) : [...cfg.platforms, k] });
  };

  if (!cfg) return <p className="text-sm text-gray-400">加载中…</p>;

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold">自动投递</h1>
      <p className="text-sm text-gray-500 mt-1">
        配置由本地浏览器插件执行的自动投递。提交在你自己的浏览器里完成 —— 合规、不代管账号。
      </p>

      {/* 配置 */}
      <div className="mt-6 rounded-xl border border-gray-200 bg-white p-6 space-y-5">
        <label className="flex items-center justify-between">
          <span className="text-sm font-medium">启用自动投递</span>
          <input type="checkbox" checked={cfg.enabled} onChange={(e) => setCfg({ ...cfg, enabled: e.target.checked })} />
        </label>

        <label className="flex items-center justify-between">
          <span className="text-sm font-medium">
            Dry-run(只填不交,截图给你看)
            <span className="block text-xs text-gray-400">建议头几天开着,确认无误再关</span>
          </span>
          <input type="checkbox" checked={cfg.dryRun} onChange={(e) => setCfg({ ...cfg, dryRun: e.target.checked })} />
        </label>

        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">
            每日上限
            <span className="block text-xs text-gray-400">留空 = 不限。低频(如 15–20)更安全</span>
          </span>
          <input
            type="number"
            min={1}
            placeholder="不限"
            value={cfg.dailyLimit ?? ""}
            onChange={(e) => setCfg({ ...cfg, dailyLimit: e.target.value === "" ? null : Number(e.target.value) })}
            className="w-28 rounded-lg border border-gray-200 px-3 py-1.5 text-sm outline-none focus:border-brand-500"
          />
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">
            投递间隔(秒)
            <span className="block text-xs text-gray-400">模拟真人节奏,降低风控</span>
          </span>
          <input
            type="number"
            min={10}
            value={cfg.minIntervalSec}
            onChange={(e) => setCfg({ ...cfg, minIntervalSec: Number(e.target.value) })}
            className="w-28 rounded-lg border border-gray-200 px-3 py-1.5 text-sm outline-none focus:border-brand-500"
          />
        </div>

        <div>
          <div className="text-sm font-medium mb-2">平台白名单</div>
          <div className="flex gap-2">
            {ALL_PLATFORMS.map((p) => (
              <button
                key={p.key}
                onClick={() => togglePlatform(p.key)}
                className={`rounded-lg border px-3 py-1.5 text-sm ${
                  cfg.platforms.includes(p.key)
                    ? "border-brand-600 bg-brand-50 text-brand-700"
                    : "border-gray-200 text-gray-500"
                }`}
              >
                {p.label}
              </button>
            ))}
            <span className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-300 cursor-not-allowed">
              LinkedIn(自动跳过)
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={save} className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700">
            保存配置
          </button>
          {saved && <span className="text-sm text-green-600">已保存 ✓</span>}
        </div>
      </div>

      {/* 插件 Token */}
      <div className="mt-6 rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="font-semibold">浏览器插件连接</h2>
        <p className="text-xs text-gray-400 mt-1 mb-3">
          生成一个 Token,粘贴到 JoBs 浏览器插件里,它就能拉取你的待投队列并执行。
        </p>

        {newToken && (
          <div className="mb-3 rounded-lg border border-amber-200 bg-amber-50 p-3">
            <div className="text-xs text-amber-700 mb-1">复制此 Token(仅显示这一次):</div>
            <code className="block break-all text-xs bg-white rounded p-2 border border-amber-200">{newToken}</code>
          </div>
        )}

        <div className="space-y-2">
          {tokens.map((t) => (
            <div key={t.id} className="flex items-center justify-between rounded-lg border border-gray-200 px-3 py-2 text-sm">
              <div>
                <code className="text-xs">{t.prefix}…</code>
                <span className="ml-2 text-xs text-gray-400">
                  {t.lastUsedAt ? `上次使用 ${t.lastUsedAt.slice(0, 10)}` : "未使用"}
                </span>
              </div>
              <button onClick={() => delToken(t.id)} className="text-xs text-red-500 hover:underline">撤销</button>
            </div>
          ))}
          {!tokens.length && <p className="text-xs text-gray-400">还没有 Token。</p>}
        </div>

        <button onClick={createToken} className="mt-3 rounded-lg border border-brand-600 px-4 py-2 text-sm font-medium text-brand-700 hover:bg-brand-50">
          + 生成新 Token
        </button>
      </div>

      {/* 投递历史 */}
      <div className="mt-6 rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="font-semibold">投了哪些</h2>
        <p className="text-xs text-gray-400 mt-1 mb-3">插件回写的每次投递结果</p>
        <div className="space-y-2">
          {logs.map((l) => (
            <div key={l.id} className="flex items-center justify-between border-b border-gray-100 py-2 last:border-0 text-sm">
              <div>
                <span className="font-medium">{l.title}</span>
                <span className="text-gray-500"> · {l.company}</span>
                <span className="ml-2 text-xs text-gray-400">{l.platform} · {l.createdAt.slice(0, 16).replace("T", " ")}</span>
              </div>
              <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusStyle[l.status] ?? "bg-gray-100 text-gray-500"}`}>
                {l.status}
              </span>
            </div>
          ))}
          {!logs.length && <p className="text-xs text-gray-400">还没有投递记录。装好插件、开启自动投递后,这里会显示。</p>}
        </div>
      </div>
    </div>
  );
}
