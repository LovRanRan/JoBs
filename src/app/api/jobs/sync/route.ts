import { NextResponse } from "next/server";
import { getUserId } from "@/lib/auth";
import { runScrape } from "@/lib/ats";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

// 登录用户手动触发抓取("立即同步")。
export async function POST() {
  const uid = await getUserId();
  if (!uid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const result = await runScrape();
  return NextResponse.json({ ok: true, ...result });
}
