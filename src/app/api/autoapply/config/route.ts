import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getUserId } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DEFAULTS = {
  enabled: false,
  dailyLimit: null as number | null,
  platforms: ["greenhouse", "lever", "ashby"],
  dryRun: true,
  minIntervalSec: 45,
};

export async function GET() {
  const uid = await getUserId();
  if (!uid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const cfg = await prisma.autoApplyConfig.findUnique({ where: { userId: uid } });
  return NextResponse.json({ config: cfg ?? { userId: uid, ...DEFAULTS } });
}

export async function PUT(req: Request) {
  const uid = await getUserId();
  if (!uid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const b = await req.json();
  const data = {
    enabled: !!b.enabled,
    dailyLimit:
      b.dailyLimit === null || b.dailyLimit === "" || typeof b.dailyLimit === "undefined"
        ? null
        : Math.max(1, Number(b.dailyLimit)),
    platforms: Array.isArray(b.platforms) ? b.platforms : DEFAULTS.platforms,
    dryRun: b.dryRun !== false,
    minIntervalSec: Math.max(10, Number(b.minIntervalSec ?? DEFAULTS.minIntervalSec)),
  };
  const cfg = await prisma.autoApplyConfig.upsert({
    where: { userId: uid },
    update: data,
    create: { userId: uid, ...data },
  });
  return NextResponse.json({ config: cfg });
}
