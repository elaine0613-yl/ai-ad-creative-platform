import { NextRequest } from "next/server";
import { z } from "zod";
import { jsonOk, jsonError, handleApiError } from "@/lib/api/response";
import { createToken, hashPassword, COOKIE_NAME } from "@/lib/auth/session";
import { prisma } from "@/lib/db/client";

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(1),
});

export async function POST(req: NextRequest) {
  try {
    const body = registerSchema.parse(await req.json());
    const existing = await prisma.user.findUnique({ where: { email: body.email } });
    if (existing) return jsonError("邮箱已注册", 409);

    const user = await prisma.user.create({
      data: {
        email: body.email,
        name: body.name,
        passwordHash: await hashPassword(body.password),
      },
    });

    const token = await createToken({
      id: user.id,
      email: user.email,
      name: user.name,
      plan: user.plan,
      credits: user.credits,
    });

    const res = jsonOk({ user: { id: user.id, email: user.email, name: user.name, plan: user.plan, credits: user.credits } });
    res.cookies.set(COOKIE_NAME, token, { httpOnly: true, sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 7 });
    return res;
  } catch (err) {
    return handleApiError(err);
  }
}
