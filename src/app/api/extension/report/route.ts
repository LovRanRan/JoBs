import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getUserIdFromBearer } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// 插件回写一次投递结果。status: filled | submitted | failed | skipped
export async function POST(req: Request) {
  const uid = await getUserIdFromBearer(req);
  if (!uid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const b = await req.json();
  const { applicationId, jobId, company, title, platform, status, message, screenshotUrl } = b;

  await prisma.applicationLog.create({
    data: {
      userId: uid,
      jobId: jobId ?? null,
      company: company ?? "",
      title: title ?? "",
      platform: platform ?? "",
      status: status ?? "failed",
      message: message ?? null,
      screenshotUrl: screenshotUrl ?? null,
    },
  });

  // 真正提交成功 → 推进看板到 applied
  if (status === "submitted" && applicationId) {
    await prisma.application
      .updateMany({
        where: { id: applicationId, userId: uid },
        data: { stage: "applied", appliedAt: new Date() },
      })
      .catch(() => {});
  }

  return NextResponse.json({ ok: true });
}
