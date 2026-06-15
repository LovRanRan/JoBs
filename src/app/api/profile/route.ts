import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getUserId } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const uid = await getUserId();
  if (!uid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const profile = await prisma.profile.findUnique({ where: { userId: uid } });
  return NextResponse.json({ profile });
}

export async function PUT(req: Request) {
  const uid = await getUserId();
  if (!uid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const b = await req.json();
  const data = {
    title: b.title ?? undefined,
    yearsExp: b.yearsExp ?? undefined,
    location: b.location ?? undefined,
    targetRoles: b.targetRoles ?? undefined,
    targetLocations: b.targetLocations ?? undefined,
    minSalary: b.minSalary ?? undefined,
    workAuth: b.workAuth ?? undefined,
    skills: b.skills ?? undefined,
  };
  const profile = await prisma.profile.upsert({
    where: { userId: uid },
    update: data,
    create: { userId: uid, ...data, targetRoles: b.targetRoles ?? [], targetLocations: b.targetLocations ?? [], skills: b.skills ?? [] },
  });
  return NextResponse.json({ profile });
}
