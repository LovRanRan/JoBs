import Link from "next/link";
import { Job } from "@/lib/types";
import MatchBadge from "./MatchBadge";

const sourceLabel: Record<string, string> = {
  greenhouse: "Greenhouse",
  lever: "Lever",
  ashby: "Ashby",
  manual: "Manual",
};

export default function JobCard({ job }: { job: Job }) {
  return (
    <Link
      href={`/jobs/${job.id}`}
      className="block rounded-xl border border-gray-200 bg-white p-5 hover:border-brand-500 hover:shadow-sm transition"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-gray-900">{job.title}</h3>
            {job.isNew && (
              <span className="rounded bg-green-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
                NEW
              </span>
            )}
          </div>
          <div className="text-sm text-gray-500">
            {job.company} · {job.location}
            {job.remote && " · Remote"}
          </div>
        </div>
        <MatchBadge score={job.matchScore} />
      </div>

      {job.salary && (
        <div className="mt-2 text-sm font-medium text-gray-700">{job.salary}</div>
      )}

      <p className="mt-2 text-sm text-gray-600 line-clamp-2">{job.jdSummary}</p>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {job.tags.map((t) => (
          <span key={t} className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
            {t}
          </span>
        ))}
      </div>

      <div className="mt-3 flex items-center justify-between text-xs text-gray-400">
        <span>via {sourceLabel[job.source]}</span>
        <span>{job.postedAt}</span>
      </div>
    </Link>
  );
}
