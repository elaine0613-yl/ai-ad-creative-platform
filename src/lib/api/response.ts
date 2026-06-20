import { NextResponse } from "next/server";
import { AuthError } from "@/lib/auth/session";
import { ZodError } from "zod";

export function jsonOk<T>(data: T, status = 200) {
  return NextResponse.json({ success: true, data }, { status });
}

export function jsonError(message: string, status = 400, details?: unknown) {
  return NextResponse.json({ success: false, error: message, details }, { status });
}

export function handleApiError(err: unknown) {
  if (err instanceof AuthError) return jsonError(err.message, 401);
  if (err instanceof ZodError) {
    return jsonError("参数校验失败", 400, err.flatten().fieldErrors);
  }
  console.error("[API Error]", err);
  const message = err instanceof Error ? err.message : "服务器内部错误";
  return jsonError(message, 500);
}
