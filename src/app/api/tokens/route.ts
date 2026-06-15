import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getUserId, generateApiToken } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// 列出当前用户的插件 token(不含原文)
export async function GET() {
  const uid = await getUserId();
  if (!uid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const tokens = await prisma.apiToken.findMany({
    where: { userId: uid },
    select: { id: true, prefix: true, label: true, createdAt: true, lastUsedAt: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ tokens });
}

// 创建一个新 token,原文仅此一次返回
export async function POST(req: Request) {
  const uid = await getUserId();
  if (!uid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { label } = await req.json().catch(() => ({}));
  const { raw, tokenHash, prefix } = generateApiToken();
  await prisma.apiToken.create({ data: { userId: uid, tokenHash, prefix, label: label ?? "Browser extension" } });
  return NextResponse.json({ token: raw, prefix });
}
