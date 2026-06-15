import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getUserId } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const uid = await getUserId();
  if (!uid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const resumes = await prisma.resume.findMany({
    where: { userId: uid },
    orderBy: [{ base: "desc" }, { updatedAt: "desc" }],
  });
  return NextResponse.json({ resumes });
}

export async function POST(req: Request) {
  const uid = await getUserId();
  if (!uid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const b = await req.json();
  if (!b.name) return NextResponse.json({ error: "name required" }, { status: 400 });
  const resume = await prisma.resume.create({
    data: {
      userId: uid,
      name: b.name,
      base: !!b.base,
      tailoredFor: b.tailoredFor ?? null,
      keywords: b.keywords ?? [],
      content: b.content ?? null,
    },
  });
  return NextResponse.json({ resume });
}
