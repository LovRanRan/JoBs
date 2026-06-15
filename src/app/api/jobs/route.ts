import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getUserId } from "@/lib/auth";
import { computeMatch } from "@/lib/match";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET /api/jobs — personalized list (jobs + computed match for current user)
export async function GET() {
  const uid = await getUserId();
  if (!uid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [jobs, profile, apps] = await Promise.all([
    prisma.job.findMany({ orderBy: { postedAt: "desc" } }),
    prisma.profile.findUnique({ where: { userId: uid } }),
    prisma.application.findMany({ where: { userId: uid }, select: { jobId: true, stage: true } }),
  ]);

  const skills = profile?.skills ?? [];
  const appByJob = new Map(apps.map((a) => [a.jobId, a.stage]));

  const result = jobs.map((j) => {
    const m = computeMatch(skills, j.tags);
    return { ...j, ...m, stage: appByJob.get(j.id) ?? null };
  });
  result.sort((a, b) => b.score - a.score);

  return NextResponse.json({ jobs: result });
}

// POST /api/jobs — manually add a job (paste JD)
export async function POST(req: Request) {
  const uid = await getUserId();
  if (!uid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const b = await req.json();
  if (!b.title || !b.company) {
    return NextResponse.json({ error: "title and company required" }, { status: 400 });
  }
  const job = await prisma.job.create({
    data: {
      title: b.title,
      company: b.company,
      location: b.location ?? "",
      remote: !!b.remote,
      salary: b.salary ?? null,
      source: "manual",
      externalId: `manual-${Date.now()}`,
      postedAt: new Date(),
      tags: b.tags ?? [],
      jdSummary: b.jdSummary ?? "",
      jdFull: b.jdFull ?? null,
      url: b.url ?? "",
    },
  });
  return NextResponse.json({ job });
}
