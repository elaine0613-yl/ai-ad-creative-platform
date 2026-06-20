import { NextRequest } from "next/server";
import { z } from "zod";
import { jsonOk, jsonError, handleApiError } from "@/lib/api/response";
import { createToken, verifyPassword, COOKIE_NAME } from "@/lib/auth/session";
import { prisma } from "@/lib/db/client";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export async function POST(req: NextRequest) {
  try {
    const body = loginSchema.parse(await req.json());
    const user = await prisma.user.findUnique({ where: { email: body.email } });
    if (!user || !(await verifyPassword(body.password, user.passwordHash))) {
      return jsonError("邮箱或密码错误", 401);
    }

    const token = await createToken({
      id: user.id,
      email: user.email,
      name: user.name,
      plan: user.plan,
      credits: user.credits,
    });

    const res = jsonOk({
      user: { id: user.id, email: user.email, name: user.name, plan: user.plan, credits: user.credits, totalCredits: user.totalCredits },
    });
    res.cookies.set(COOKIE_NAME, token, { httpOnly: true, sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 7 });
    return res;
  } catch (err) {
    return handleApiError(err);
  }
}
