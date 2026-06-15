import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getUserId } from "@/lib/auth";
import { computeMatch } from "@/lib/match";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET /api/applications — current user's pipeline (with job)
export async function GET() {
  const uid = await getUserId();
  if (!uid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const apps = await prisma.application.findMany({
    where: { userId: uid },
    include: { job: true },
    orderBy: { updatedAt: "desc" },
  });
  return NextResponse.json({ applications: apps });
}

// POST /api/applications — add a job to the pipeline
export async function POST(req: Request) {
  const uid = await getUserId();
  if (!uid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { jobId, stage } = await req.json();
  const job = await prisma.job.findUnique({ where: { id: jobId } });
  if (!job) return NextResponse.json({ error: "Job not found" }, { status: 404 });

  const profile = await prisma.profile.findUnique({ where: { userId: uid } });
  const m = computeMatch(profile?.skills ?? [], job.tags);

  const app = await prisma.application.upsert({
    where: { userId_jobId: { userId: uid, jobId } },
    update: { stage: stage ?? undefined },
    create: {
      userId: uid,
      jobId,
      stage: stage ?? "to_apply",
      matchScore: m.score,
      matched: m.matched,
      gaps: m.gaps,
    },
    include: { job: true },
  });
  return NextResponse.json({ application: app });
}
