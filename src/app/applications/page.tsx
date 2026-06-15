"use client";

import { useState } from "react";
import { applications as seed, jobById } from "@/lib/mock";
import { AppStage, STAGES } from "@/lib/types";

export default function Tracker() {
  const [apps, setApps] = useState(seed);

  const move = (id: string, dir: 1 | -1) => {
    setApps((prev) =>
      prev.map((a) => {
        if (a.id !== id) return a;
        const idx = STAGES.findIndex((s) => s.key === a.stage);
        const next = Math.min(Math.max(idx + dir, 0), STAGES.length - 1);
        return { ...a, stage: STAGES[next].key as AppStage };
      })
    );
  };

  return (
    <div>
      <h1 className="text-2xl font-bold">Tracker</h1>
      <p className="text-sm text-gray-500 mt-1">投递追踪看板 · 用 ← → 移动卡片到下一阶段</p>

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
                  const job = jobById(a.jobId);
                  if (!job) return null;
                  const idx = STAGES.findIndex((s) => s.key === a.stage);
                  return (
                    <div key={a.id} className="rounded-lg border border-gray-200 bg-white p-3 text-sm">
                      <div className="font-medium text-gray-900">{job.title}</div>
                      <div className="text-xs text-gray-500">{job.company}</div>
                      {a.nextStep && (
                        <div className="mt-1.5 rounded bg-amber-50 px-2 py-1 text-[11px] text-amber-700">
                          ⏰ {a.nextStep}
                        </div>
                      )}
                      {a.resumeVersion && (
                        <div className="mt-1 text-[11px] text-gray-400">📄 {a.resumeVersion}</div>
                      )}
                      {a.contact && (
                        <div className="text-[11px] text-gray-400">👤 {a.contact}</div>
                      )}
                      <div className="mt-2 flex justify-between">
                        <button
                          onClick={() => move(a.id, -1)}
                          disabled={idx === 0}
                          className="text-xs text-gray-400 hover:text-gray-700 disabled:opacity-30"
                        >
                          ←
                        </button>
                        <button
                          onClick={() => move(a.id, 1)}
                          disabled={idx === STAGES.length - 1}
                          className="text-xs text-brand-600 hover:text-brand-700 disabled:opacity-30"
                        >
                          →
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
