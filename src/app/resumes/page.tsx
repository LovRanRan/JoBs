import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function Resumes() {
  const user = await requireUser();
  const resumes = await prisma.resume.findMany({
    where: { userId: user.id },
    orderBy: [{ base: "desc" }, { updatedAt: "desc" }],
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Resumes</h1>
          <p className="text-sm text-gray-500 mt-1">维护一份 Master Resume,每个岗位自动派生定制版本</p>
        </div>
        <button className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700">
          + 上传简历
        </button>
      </div>

      <div className="mt-6 space-y-3">
        {resumes.map((r) => (
          <div key={r.id} className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-5">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-gray-900">{r.name}</span>
                {r.base && (
                  <span className="rounded bg-brand-50 px-2 py-0.5 text-[10px] font-bold text-brand-700">MASTER</span>
                )}
              </div>
              {r.tailoredFor && <div className="text-xs text-gray-500 mt-0.5">定制自:{r.tailoredFor}</div>}
              <div className="mt-2 flex flex-wrap gap-1.5">
                {r.keywords.map((k) => (
                  <span key={k} className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-600">{k}</span>
                ))}
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-gray-400">更新 {r.updatedAt.toISOString().slice(0, 10)}</div>
              <div className="mt-2 flex gap-2">
                <button className="rounded border border-gray-200 px-3 py-1 text-xs hover:bg-gray-50">编辑</button>
                <button className="rounded border border-gray-200 px-3 py-1 text-xs hover:bg-gray-50">导出 PDF</button>
              </div>
            </div>
          </div>
        ))}
        {!resumes.length && <p className="text-sm text-gray-400">还没有简历。</p>}
      </div>
    </div>
  );
}
