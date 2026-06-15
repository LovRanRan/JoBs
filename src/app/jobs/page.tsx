"use client";

import { useEffect, useMemo, useState } from "react";
import JobCard, { JobCardData } from "@/components/JobCard";

type ApiJob = JobCardData & { score: number; stage: string | null };
type Sort = "match" | "new";

const today = new Date().toISOString().slice(0, 10);

export default function JobsPage() {
  const [jobs, setJobs] = useState<JobCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState<Sort>("match");
  const [onlyNew, setOnlyNew] = useState(false);
  const [q, setQ] = useState("");
  const [syncing, setSyncing] = useState(false);
  const [syncMsg, setSyncMsg] = useState("");

  const load = () => {
    setLoading(true);
    return fetch("/api/jobs")
      .then((r) => r.json())
      .then((d) => {
        const list: JobCardData[] = (d.jobs ?? []).map((j: ApiJob) => ({
          ...j,
          matchScore: j.score,
          isNew: typeof j.postedAt === "string" && j.postedAt.slice(0, 10) === today,
        }));
        setJobs(list);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const sync = async () => {
    setSyncing(true);
    setSyncMsg("");
    const res = await fetch("/api/jobs/sync", { method: "POST" });
    const d = await res.json().catch(() => ({}));
    setSyncing(false);
    if (res.ok) {
      setSyncMsg(`抓取完成:新增/更新 ${d.upserted ?? 0} 条`);
      await load();
    } else {
      setSyncMsg("抓取失败");
    }
  };

  const list = useMemo(() => {
    let l = jobs.filter((j) => {
      if (onlyNew && !j.isNew) return false;
      if (q && !`${j.title} ${j.company} ${j.tags.join(" ")}`.toLowerCase().includes(q.toLowerCase()))
        return false;
      return true;
    });
    l = [...l].sort((a, b) =>
      sort === "match" ? b.matchScore - a.matchScore : a.postedAt < b.postedAt ? 1 : -1
    );
    return l;
  }, [jobs, sort, onlyNew, q]);

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Jobs</h1>
          <p className="text-sm text-gray-500 mt-1">基于你的 Profile 个性化推荐 · 每日自动抓取</p>
        </div>
        <div className="flex items-center gap-2">
          {syncMsg && <span className="text-xs text-gray-400">{syncMsg}</span>}
          <button
            onClick={sync}
            disabled={syncing}
            className="rounded-lg border border-brand-600 px-4 py-2 text-sm font-medium text-brand-700 hover:bg-brand-50 disabled:opacity-60"
          >
            {syncing ? "抓取中…" : "↻ 立即同步岗位"}
          </button>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="搜索职位 / 公司 / 技术栈…"
          className="flex-1 min-w-[220px] rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-brand-500"
        />
        <div className="flex rounded-lg border border-gray-200 overflow-hidden text-sm">
          <button onClick={() => setSort("match")} className={`px-3 py-2 ${sort === "match" ? "bg-brand-50 text-brand-700 font-medium" : "text-gray-600"}`}>按匹配度</button>
          <button onClick={() => setSort("new")} className={`px-3 py-2 ${sort === "new" ? "bg-brand-50 text-brand-700 font-medium" : "text-gray-600"}`}>按时间</button>
        </div>
        <label className="flex items-center gap-2 text-sm text-gray-600">
          <input type="checkbox" checked={onlyNew} onChange={(e) => setOnlyNew(e.target.checked)} />
          只看今日新增
        </label>
      </div>

      <div className="mt-3 text-xs text-gray-400">
        {loading ? "加载中…" : `${list.length} 个岗位`}
      </div>

      <div className="mt-3 grid grid-cols-2 gap-4">
        {list.map((j) => (
          <JobCard key={j.id} job={j} />
        ))}
      </div>
      {!loading && !list.length && (
        <p className="mt-6 text-sm text-gray-400">没有岗位。粘贴一个 JD,或等待每日抓取。</p>
      )}
    </div>
  );
}
