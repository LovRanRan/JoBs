"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import MatchBadge from "@/components/MatchBadge";

interface JobDetailData {
  id: string;
  title: string;
  company: string;
  location: string;
  remote: boolean;
  salary?: string | null;
  source: string;
  postedAt: string;
  tags: string[];
  jdSummary: string;
  url: string;
  score: number;
  matched: string[];
  gaps: string[];
}

const BASE_BULLET =
  "Built internal web tools with React and Node.js; collaborated with team to ship features.";

export default function JobDetail({ params }: { params: { id: string } }) {
  const [job, setJob] = useState<JobDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [tailored, setTailored] = useState(false);
  const [tailoring, setTailoring] = useState(false);
  const [inPipeline, setInPipeline] = useState(false);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    fetch(`/api/jobs/${params.id}`)
      .then((r) => (r.ok ? r.json() : { job: null }))
      .then((d) => setJob(d.job))
      .finally(() => setLoading(false));
  }, [params.id]);

  if (loading) return <p className="text-sm text-gray-400">加载中…</p>;
  if (!job)
    return (
      <div>
        <p>岗位不存在。</p>
        <Link href="/jobs" className="text-brand-600">← 返回</Link>
      </div>
    );

  const tailoredBullet = `Designed and shipped a full-stack ${
    job.tags.includes("PostgreSQL") ? "PostgreSQL-backed" : "TypeScript"
  } platform with ${job.tags.slice(0, 2).join(" & ")}, improving API latency by 40% — directly matching ${job.company}'s focus on ${job.tags[0] ?? "engineering"}.`;

  const generate = () => {
    setTailoring(true);
    setTimeout(() => {
      setTailored(true);
      setTailoring(false);
    }, 900);
  };

  const addToPipeline = async () => {
    setAdding(true);
    const res = await fetch("/api/applications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jobId: job.id, stage: "to_apply" }),
    });
    setAdding(false);
    if (res.ok) setInPipeline(true);
  };

  return (
    <div>
      <Link href="/jobs" className="text-sm text-brand-600 hover:underline">← 返回岗位列表</Link>

      <div className="mt-3 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">{job.title}</h1>
          <div className="text-gray-500 mt-1">
            {job.company} · {job.location}{job.remote && " · Remote"}
          </div>
          <div className="mt-1 font-medium text-gray-700">{job.salary}</div>
        </div>
        <MatchBadge score={job.score} />
      </div>

      <div className="mt-6 grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <h2 className="font-semibold mb-2">职位描述 (JD)</h2>
            <p className="text-sm text-gray-600">{job.jdSummary}</p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {job.tags.map((t) => (
                <span key={t} className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-600">{t}</span>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <h2 className="font-semibold mb-3">匹配分析</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-xs font-semibold text-green-600 mb-2">✓ 命中技能</div>
                <div className="flex flex-wrap gap-1.5">
                  {job.matched.length ? job.matched.map((m) => (
                    <span key={m} className="rounded bg-green-50 px-2 py-0.5 text-xs text-green-700">{m}</span>
                  )) : <span className="text-xs text-gray-400">—</span>}
                </div>
              </div>
              <div>
                <div className="text-xs font-semibold text-amber-600 mb-2">△ 缺口 / 建议补强</div>
                <div className="flex flex-wrap gap-1.5">
                  {job.gaps.length ? job.gaps.map((g) => (
                    <span key={g} className="rounded bg-amber-50 px-2 py-0.5 text-xs text-amber-700">{g}</span>
                  )) : <span className="text-xs text-gray-400">无明显缺口 🎉</span>}
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <div className="flex items-center justify-between mb-1">
              <h2 className="font-semibold">按 JD 定制简历</h2>
              <span className="text-xs text-gray-400">由 Claude 生成(Phase 3 接真实 API)</span>
            </div>
            <p className="text-xs text-gray-400 mb-4">
              AI 对比 JD 与你的 Master Resume,重写要点、补关键词以通过 ATS。原始简历不变。
            </p>

            {!tailored ? (
              <button onClick={generate} disabled={tailoring}
                className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-60">
                {tailoring ? "AI 生成中…" : "✨ 为该岗位生成定制简历"}
              </button>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs font-semibold text-gray-400 mb-1">原始(Master)</div>
                  <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm text-gray-600">{BASE_BULLET}</div>
                </div>
                <div>
                  <div className="text-xs font-semibold text-brand-600 mb-1">定制后(针对 {job.company})</div>
                  <div className="rounded-lg border border-brand-100 bg-brand-50 p-3 text-sm text-gray-800">{tailoredBullet}</div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <h2 className="font-semibold mb-3">一键投递助手</h2>
            <ol className="space-y-3 text-sm">
              <li className="flex gap-2"><span className={tailored ? "text-green-600" : "text-gray-300"}>{tailored ? "✓" : "○"}</span> 定制简历 {tailored ? "已生成" : "待生成"}</li>
              <li className="flex gap-2"><span className="text-gray-300">○</span> 生成求职信</li>
              <li className="flex gap-2"><span className={inPipeline ? "text-green-600" : "text-gray-300"}>{inPipeline ? "✓" : "○"}</span> 加入看板 {inPipeline ? "(已加)" : ""}</li>
              <li className="flex gap-2"><span className="text-gray-300">○</span> 你确认提交 → 回写看板</li>
            </ol>

            <button onClick={addToPipeline} disabled={adding || inPipeline}
              className="mt-4 block w-full rounded-lg border border-brand-600 px-4 py-2 text-center text-sm font-medium text-brand-700 hover:bg-brand-50 disabled:opacity-60">
              {inPipeline ? "已在看板中" : adding ? "添加中…" : "加入看板(待投)"}
            </button>
            <a href={job.url} target="_blank" rel="noopener noreferrer"
              className="mt-2 block rounded-lg bg-brand-600 px-4 py-2 text-center text-sm font-medium text-white hover:bg-brand-700">
              打开投递页 ↗
            </a>
            <p className="mt-2 text-[11px] text-gray-400">提交动作由你确认完成(合规,不自动代投)。</p>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-5 text-sm">
            <h2 className="font-semibold mb-2">来源</h2>
            <p className="text-gray-500 capitalize">{job.source} · {job.postedAt.slice(0, 10)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
