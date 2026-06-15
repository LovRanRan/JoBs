import { requireUser } from "@/lib/session";

export const dynamic = "force-dynamic";

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between border-b border-gray-100 py-3 last:border-0">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="text-sm font-medium text-gray-900 text-right">{value || "—"}</span>
    </div>
  );
}

export default async function ProfilePage() {
  const user = await requireUser();
  const p = user.profile;

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold">Profile</h1>
      <p className="text-sm text-gray-500 mt-1">系统据此个性化推荐岗位、计算匹配度</p>

      <div className="mt-6 grid grid-cols-2 gap-6">
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="font-semibold mb-2">基本信息</h2>
          <Row label="姓名" value={user.name ?? ""} />
          <Row label="邮箱" value={user.email} />
          <Row label="当前职位" value={p?.title ?? ""} />
          <Row label="经验" value={p?.yearsExp ? `${p.yearsExp} 年` : ""} />
          <Row label="所在地" value={p?.location ?? ""} />
          <Row label="工作授权" value={p?.workAuth ?? ""} />
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="font-semibold mb-2">求职偏好</h2>
          <Row label="目标职位" value={(p?.targetRoles ?? []).join(", ")} />
          <Row label="目标城市" value={(p?.targetLocations ?? []).join(", ")} />
          <Row label="最低薪资" value={p?.minSalary ? `$${p.minSalary.toLocaleString()}` : ""} />
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="font-semibold mb-3">技能栈</h2>
        <div className="flex flex-wrap gap-2">
          {(p?.skills ?? []).map((s) => (
            <span key={s} className="rounded-lg bg-brand-50 px-3 py-1 text-sm text-brand-700">{s}</span>
          ))}
          {!(p?.skills ?? []).length && <span className="text-sm text-gray-400">尚未填写技能</span>}
        </div>
      </div>

      <p className="mt-6 text-xs text-gray-400">编辑功能即将上线(Phase 2b+)。</p>
    </div>
  );
}
