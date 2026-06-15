import Link from "next/link";
import { applications, funnel, jobById, jobs } from "@/lib/mock";
import { STAGES } from "@/lib/types";
import MatchBadge from "@/components/MatchBadge";

function Stat({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <div className="text-sm text-gray-500">{label}</div>
      <div className="mt-1 text-3xl font-bold text-gray-900">{value}</div>
      {sub && <div className="mt-1 text-xs text-gray-400">{sub}</div>}
    </div>
  );
}

export default function Dashboard() {
  const f = funnel();
  const newToday = jobs.filter((j) => j.isNew).length;
  const activeApps = applications.filter((a) => !["new", "closed"].includes(a.stage)).length;
  const interviews = applications.filter((a) => a.stage === "interview").length;

  const funnelSteps = [
    { label: "Scraped", value: f.scraped },
    { label: "Applied", value: f.applied },
    { label: "OA", value: f.oa },
    { label: "Interview", value: f.interview },
    { label: "Offer", value: f.offer },
  ];
  const max = Math.max(...funnelSteps.map((s) => s.value), 1);

  const topMatches = [...jobs].sort((a, b) => b.matchScore - a.matchScore).slice(0, 3);

  return (
    <div>
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p className="text-sm text-gray-500 mt-1">早上好,David。这是你今天的求职概览。</p>

      <div className="mt-6 grid grid-cols-4 gap-4">
        <Stat label="今日新增岗位" value={newToday} sub="来自 Greenhouse / Lever / Ashby" />
        <Stat label="进行中的投递" value={activeApps} sub="已投 + 笔试 + 面试" />
        <Stat label="面试中" value={interviews} sub="保持跟进" />
        <Stat label="平均匹配度" value={`${Math.round(jobs.reduce((s, j) => s + j.matchScore, 0) / jobs.length)}%`} sub="基于你的 Profile" />
      </div>

      <div className="mt-8 grid grid-cols-3 gap-6">
        {/* Funnel */}
        <div className="col-span-2 rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="font-semibold">投递漏斗</h2>
          <p className="text-xs text-gray-400 mb-4">从抓取到 Offer 的各阶段转化</p>
          <div className="space-y-3">
            {funnelSteps.map((s) => (
              <div key={s.label} className="flex items-center gap-3">
                <div className="w-20 text-sm text-gray-600">{s.label}</div>
                <div className="flex-1 bg-gray-100 rounded-full h-6 overflow-hidden">
                  <div
                    className="h-6 rounded-full bg-brand-500 flex items-center justify-end pr-2 text-xs font-semibold text-white"
                    style={{ width: `${Math.max((s.value / max) * 100, 8)}%` }}
                  >
                    {s.value}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pipeline summary */}
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="font-semibold">看板概览</h2>
          <p className="text-xs text-gray-400 mb-4">各阶段数量</p>
          <div className="space-y-2">
            {STAGES.map((st) => {
              const n = applications.filter((a) => a.stage === st.key).length;
              return (
                <div key={st.key} className="flex justify-between text-sm">
                  <span className="text-gray-600">{st.label}</span>
                  <span className="font-semibold">{n}</span>
                </div>
              );
            })}
          </div>
          <Link href="/applications" className="mt-4 inline-block text-sm text-brand-600 hover:underline">
            打开看板 →
          </Link>
        </div>
      </div>

      {/* Top matches */}
      <div className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">为你推荐(匹配度最高)</h2>
          <Link href="/jobs" className="text-sm text-brand-600 hover:underline">查看全部 →</Link>
        </div>
        <div className="mt-3 space-y-2">
          {topMatches.map((j) => (
            <Link
              key={j.id}
              href={`/jobs/${j.id}`}
              className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-3 hover:border-brand-500"
            >
              <div>
                <div className="font-medium text-sm">{j.title} · {j.company}</div>
                <div className="text-xs text-gray-500">{j.location} · {j.salary}</div>
              </div>
              <MatchBadge score={j.matchScore} />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
