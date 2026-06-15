import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import { createHash, randomBytes } from "crypto";
import { prisma } from "./db";

const COOKIE = "jobs_session";
const ALG = "HS256";

function secret() {
  const s = process.env.AUTH_SECRET;
  if (!s) throw new Error("AUTH_SECRET is not set");
  return new TextEncoder().encode(s);
}

export async function createToken(userId: string) {
  return await new SignJWT({ uid: userId })
    .setProtectedHeader({ alg: ALG })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret());
}

export async function verifyToken(token: string): Promise<string | null> {
  try {
    const { payload } = await jwtVerify(token, secret());
    return (payload.uid as string) ?? null;
  } catch {
    return null;
  }
}

export function setSessionCookie(token: string) {
  cookies().set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export function clearSessionCookie() {
  cookies().set(COOKIE, "", { path: "/", maxAge: 0 });
}

/** For route handlers (Node runtime). Returns userId or null. */
export async function getUserId(): Promise<string | null> {
  const token = cookies().get(COOKIE)?.value;
  if (!token) return null;
  return verifyToken(token);
}

export const SESSION_COOKIE = COOKIE;

// ---- API Token(浏览器插件鉴权)----

export function hashToken(raw: string) {
  return createHash("sha256").update(raw).digest("hex");
}

/** 生成一个新的插件 token,返回原文(仅此一次)+ 入库所需字段。 */
export function generateApiToken() {
  const raw = "jobs_" + randomBytes(24).toString("hex");
  return { raw, tokenHash: hashToken(raw), prefix: raw.slice(0, 12) };
}

/** 从 Authorization: Bearer <token> 解析用户 id,并更新 lastUsedAt。 */
export async function getUserIdFromBearer(req: Request): Promise<string | null> {
  const auth = req.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) return null;
  const raw = auth.slice(7).trim();
  if (!raw) return null;
  const rec = await prisma.apiToken.findUnique({ where: { tokenHash: hashToken(raw) } });
  if (!rec) return null;
  await prisma.apiToken.update({ where: { id: rec.id }, data: { lastUsedAt: new Date() } }).catch(() => {});
  return rec.userId;
}
