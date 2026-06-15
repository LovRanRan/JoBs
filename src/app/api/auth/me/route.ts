import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getUserId } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const uid = await getUserId();
  if (!uid) return NextResponse.json({ user: null }, { status: 401 });
  const user = await prisma.user.findUnique({
    where: { id: uid },
    select: { id: true, email: true, name: true, profile: true },
  });
  return NextResponse.json({ user });
}
