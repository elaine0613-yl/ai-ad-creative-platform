import { jsonOk } from "@/lib/api/response";
import { getSession, COOKIE_NAME } from "@/lib/auth/session";
import { prisma } from "@/lib/db/client";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getSession();
  if (!session) return jsonOk({ user: null });

  const user = await prisma.user.findUnique({
    where: { id: session.id },
    select: { id: true, email: true, name: true, plan: true, credits: true, totalCredits: true },
  });
  return jsonOk({ user });
}

export async function DELETE() {
  const res = NextResponse.json({ success: true });
  res.cookies.set(COOKIE_NAME, "", { httpOnly: true, path: "/", maxAge: 0 });
  return res;
}
