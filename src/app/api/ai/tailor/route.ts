import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getUserId } from "@/lib/auth";
import { tailorResume } from "@/lib/ai";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const DEFAULT_MASTER =
  "Software Engineer with experience building full-stack web apps. Built internal tools with React and Node.js; collaborated with team to ship features.";

export async function POST(req: Request) {
  const uid = await getUserId();
  if (!uid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { jobId } = await req.json();
  const [job, profile, master] = await Promise.all([
    prisma.job.findUnique({ where: { id: jobId } }),
    prisma.profile.findUnique({ where: { userId: uid } }),
    prisma.resume.findFirst({ where: { userId: uid, base: true } }),
  ]);
  if (!job) return NextResponse.json({ error: "Job not found" }, { status: 404 });

  const result = await tailorResume({
    jobTitle: job.title,
    company: job.company,
    jd: job.jdFull || job.jdSummary,
    skills: profile?.skills ?? [],
    masterResume: master?.content || DEFAULT_MASTER,
  });

  return NextResponse.json(result);
}
