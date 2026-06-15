import { redirect } from "next/navigation";
import { getUserId } from "./auth";
import { prisma } from "./db";

/** Server-component guard: returns the current user (+profile) or redirects to /login. */
export async function requireUser() {
  const uid = await getUserId();
  if (!uid) redirect("/login");
  const user = await prisma.user.findUnique({
    where: { id: uid },
    include: { profile: true },
  });
  if (!user) redirect("/login");
  return user;
}
