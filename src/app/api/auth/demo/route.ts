import { jsonOk, handleApiError } from "@/lib/api/response";
import { createToken, hashPassword, COOKIE_NAME } from "@/lib/auth/session";
import { prisma } from "@/lib/db/client";

const DEMO_EMAIL = "demo@ad-creative.local";
const DEMO_PASSWORD = "demo123456";

export async function POST() {
  try {
    let user = await prisma.user.findUnique({ where: { email: DEMO_EMAIL } });
    if (!user) {
      user = await prisma.user.create({
        data: {
          email: DEMO_EMAIL,
          name: "演示用户",
          passwordHash: await hashPassword(DEMO_PASSWORD),
          plan: "pro",
          credits: 900,
          totalCredits: 1000,
        },
      });
    }

    const token = await createToken({
      id: user.id,
      email: user.email,
      name: user.name,
      plan: user.plan,
      credits: user.credits,
    });

    const res = jsonOk({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        plan: user.plan,
        credits: user.credits,
        totalCredits: user.totalCredits,
      },
    });
    res.cookies.set(COOKIE_NAME, token, { httpOnly: true, sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 7 });
    return res;
  } catch (err) {
    return handleApiError(err);
  }
}
