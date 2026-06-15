import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getUserId } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const uid = await getUserId();
  if (!uid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const t = await prisma.apiToken.findUnique({ where: { id: params.id } });
  if (!t || t.userId !== uid) return NextResponse.json({ error: "Not found" }, { status: 404 });
  await prisma.apiToken.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
