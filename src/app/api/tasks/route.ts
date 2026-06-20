import { NextRequest } from "next/server";
import { jsonOk, handleApiError } from "@/lib/api/response";
import { requireAuth } from "@/lib/auth/session";
import { prisma } from "@/lib/db/client";
import { enqueueTask } from "@/lib/queue/task-processor";

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth();
    const status = req.nextUrl.searchParams.get("status");
    const tasks = await prisma.task.findMany({
      where: { userId: user.id, ...(status && status !== "all" ? { status } : {}) },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    return jsonOk({ tasks });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await req.json();

    const task = await prisma.task.create({
      data: {
        userId: user.id,
        name: body.name ?? "新任务",
        type: body.type ?? "image",
        mode: body.mode ?? "未知",
        totalCount: body.totalCount ?? 1,
        payload: JSON.stringify(body.payload ?? {}),
      },
    });

    if (body.autoStart !== false) enqueueTask(task.id);
    return jsonOk({ task });
  } catch (err) {
    return handleApiError(err);
  }
}
