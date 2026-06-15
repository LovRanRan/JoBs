import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getUserIdFromBearer } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// 浏览器插件拉取「待投队列」+ 用于 autofill 的资料。Bearer token 鉴权。
export async function GET(req: Request) {
  const uid = await getUserIdFromBearer(req);
  if (!uid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [cfg, profile, user, baseResume, apps] = await Promise.all([
    prisma.autoApplyConfig.findUnique({ where: { userId: uid } }),
    prisma.profile.findUnique({ where: { userId: uid } }),
    prisma.user.findUnique({ where: { id: uid }, select: { name: true, email: true } }),
    prisma.resume.findFirst({ where: { userId: uid, base: true } }),
    prisma.application.findMany({
      where: { userId: uid, stage: "to_apply" },
      include: { job: true },
      orderBy: { matchScore: "desc" },
    }),
  ]);

  const platforms = cfg?.platforms ?? ["greenhouse", "lever", "ashby"];
  // 今天已投数量(用于配合 dailyLimit;插件也会自查)
  const since = new Date();
  since.setHours(0, 0, 0, 0);
  const appliedToday = await prisma.applicationLog.count({
    where: { userId: uid, status: "submitted", createdAt: { gte: since } },
  });

  const queue = apps
    .filter((a) => platforms.includes(a.job.source))
    .map((a) => ({
      applicationId: a.id,
      jobId: a.jobId,
      title: a.job.title,
      company: a.job.company,
      platform: a.job.source,
      url: a.job.url,
    }));

  return NextResponse.json({
    config: {
      enabled: cfg?.enabled ?? false,
      dailyLimit: cfg?.dailyLimit ?? null,
      dryRun: cfg?.dryRun ?? true,
      minIntervalSec: cfg?.minIntervalSec ?? 45,
      platforms,
    },
    appliedToday,
    profile: {
      name: user?.name ?? "",
      email: user?.email ?? "",
      location: profile?.location ?? "",
      skills: profile?.skills ?? [],
      workAuth: profile?.workAuth ?? "",
    },
    resume: baseResume ? { name: baseResume.name, content: baseResume.content ?? "" } : null,
    queue,
  });
}
