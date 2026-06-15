import { NextResponse } from "next/server";
import { runScrape } from "@/lib/ats";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

// 每日由 Vercel Cron 调用(见 vercel.json)。用 CRON_SECRET 校验。
export async function GET(req: Request) {
  const auth = req.headers.get("authorization");
  if (process.env.CRON_SECRET && auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const result = await runScrape();
  return NextResponse.json({ ok: true, ...result });
}
