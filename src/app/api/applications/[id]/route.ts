import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getUserId } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// PATCH /api/applications/[id] — move stage / edit fields
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const uid = await getUserId();
  if (!uid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const existing = await prisma.application.findUnique({ where: { id: params.id } });
  if (!existing || existing.userId !== uid) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const b = await req.json();
  const app = await prisma.application.update({
    where: { id: params.id },
    data: {
      stage: b.stage ?? undefined,
      appliedAt: b.appliedAt ? new Date(b.appliedAt) : undefined,
      contact: b.contact ?? undefined,
      nextStep: b.nextStep ?? undefined,
      resumeId: b.resumeId ?? undefined,
    },
  });
  return NextResponse.json({ application: app });
}

// DELETE /api/applications/[id]
export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const uid = await getUserId();
  if (!uid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const existing = await prisma.application.findUnique({ where: { id: params.id } });
  if (!existing || existing.userId !== uid) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  await prisma.application.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
