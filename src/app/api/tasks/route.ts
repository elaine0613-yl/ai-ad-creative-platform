import { NextRequest } from "next/server";
import { jsonOk, handleApiError } from "@/lib/api/response";
import { requireAuth } from "@/lib/auth/session";
import { prisma } from "@/lib/db/client";
import { enqueueTask } from "@/lib/queue/task-processor";
import { parseTaskPayload } from "@/lib/tasks/display";

function serializeTask(task: {
  id: string;
  name: string;
  type: string;
  mode: string;
  status: string;
  progress: number;
  totalCount: number;
  successCount: number;
  failCount: number;
  payload: string;
  result: string;
  errorMessage: string | null;
  createdAt: Date;
  completedAt: Date | null;
  user?: { name: string | null; email: string };
}) {
  const payload = parseTaskPayload(task.payload);
  return {
    id: task.id,
    name: task.name,
    type: task.type,
    mode: task.mode,
    status: task.status,
    progress: task.progress,
    totalCount: task.totalCount,
    successCount: task.successCount,
    failCount: task.failCount,
    payload: task.payload,
    result: task.result,
    errorMessage: task.errorMessage,
    createdAt: task.createdAt.toISOString(),
    completedAt: task.completedAt?.toISOString() ?? null,
    initiatorName: payload.initiatorName ?? task.user?.name ?? task.user?.email ?? "—",
  };
}

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth();
    const status = req.nextUrl.searchParams.get("status");
    const dateFrom = req.nextUrl.searchParams.get("dateFrom");
    const dateTo = req.nextUrl.searchParams.get("dateTo");

    const createdAt: { gte?: Date; lte?: Date } = {};
    if (dateFrom) {
      createdAt.gte = new Date(`${dateFrom}T00:00:00.000`);
    }
    if (dateTo) {
      const end = new Date(`${dateTo}T23:59:59.999`);
      createdAt.lte = end;
    }

    const tasks = await prisma.task.findMany({
      where: {
        userId: user.id,
        ...(status && status !== "all" ? { status } : {}),
        ...(Object.keys(createdAt).length ? { createdAt } : {}),
      },
      include: { user: { select: { name: true, email: true } } },
      orderBy: { createdAt: "desc" },
      take: 100,
    });
    return jsonOk({ tasks: tasks.map(serializeTask) });
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
        payload: JSON.stringify({
          ...(body.payload ?? {}),
          initiatorName: user.name || user.email,
        }),
      },
    });

    if (body.autoStart !== false) enqueueTask(task.id);
    return jsonOk({ task: serializeTask({ ...task, user }) });
  } catch (err) {
    return handleApiError(err);
  }
}
