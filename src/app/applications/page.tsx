"use client";

import { useEffect, useState } from "react";
import { AppStage, STAGES } from "@/lib/types";

interface AppRow {
  id: string;
  stage: AppStage;
  nextStep?: string | null;
  contact?: string | null;
  job: { title: string; company: string };
}

export default function Tracker() {
  const [apps, setApps] = useState<AppRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/applications")
      .then((r) => r.json())
      .then((d) => setApps(d.applications ?? []))
      .finally(() => setLoading(false));
  }, []);

  const move = async (id: string, dir: 1 | -1) => {
    const app = apps.find((a) => a.id === id);
    if (!app) return;
    const idx = STAGES.findIndex((s) => s.key === app.stage);
    const next = Math.min(Math.max(idx + dir, 0), STAGES.length - 1);
    const stage = STAGES[next].key as AppStage;
    // optimistic
    setApps((prev) => prev.map((a) => (a.id === id ? { ...a, stage } : a)));
    await fetch(`/api/applications/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stage }),
    });
  };

  if (loading) return <p className="text-sm text-gray-400">加载中…</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold">Tracker</h1>
      <p className="text-sm text-gray-500 mt-1">投递追踪看板 · 用 ← → 移动卡片(改动会保存)</p>

      <div className="mt-6 flex gap-3 overflow-x-auto pb-4">
        {STAGES.map((st) => {
          const cards = apps.filter((a) => a.stage === st.key);
          return (
            <div key={st.key} className="w-60 shrink-0">
              <div className="flex items-center justify-between mb-2 px-1">
                <span className="text-sm font-semibold text-gray-700">{st.label}</span>
                <span className="text-xs text-gray-400">{cards.length}</span>
              </div>
              <div className="space-y-2 min-h-[100px] rounded-lg bg-gray-100/60 p-2">
                {cards.map((a) => {
                  const idx = STAGES.findIndex((s) => s.key === a.stage);
                  return (
                    <div key={a.id} className="rounded-lg border border-gray-200 bg-white p-3 text-sm">
                      <div className="font-medium text-gray-900">{a.job.title}</div>
                      <div className="text-xs text-gray-500">{a.job.company}</div>
                      {a.nextStep && (
                        <div className="mt-1.5 rounded bg-amber-50 px-2 py-1 text-[11px] text-amber-700">⏰ {a.nextStep}</div>
                      )}
                      {a.contact && <div className="text-[11px] text-gray-400">👤 {a.contact}</div>}
                      <div className="mt-2 flex justify-between">
                        <button onClick={() => move(a.id, -1)} disabled={idx === 0}
                          className="text-xs text-gray-400 hover:text-gray-700 disabled:opacity-30">←</button>
                        <button onClick={() => move(a.id, 1)} disabled={idx === STAGES.length - 1}
                          className="text-xs text-brand-600 hover:text-brand-700 disabled:opacity-30">→</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
      {!apps.length && <p className="text-sm text-gray-400">看板为空。去 Jobs 页把岗位加入看板。</p>}
    </div>
  );
}
