import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getUserId } from "@/lib/auth";
import { computeMatch } from "@/lib/match";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const uid = await getUserId();
  if (!uid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const job = await prisma.job.findUnique({ where: { id: params.id } });
  if (!job) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const profile = await prisma.profile.findUnique({ where: { userId: uid } });
  const m = computeMatch(profile?.skills ?? [], job.tags);
  return NextResponse.json({ job: { ...job, ...m } });
}
