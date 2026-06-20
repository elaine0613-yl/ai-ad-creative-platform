import { jsonOk, handleApiError } from "@/lib/api/response";
import { requireAuth } from "@/lib/auth/session";
import { prisma } from "@/lib/db/client";
import { enqueueTask } from "@/lib/queue/task-processor";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireAuth();
    const { id } = await params;
    const task = await prisma.task.findFirst({ where: { id, userId: user.id } });
    if (!task) throw new Error("任务不存在");
    return jsonOk({ task });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireAuth();
    const { id } = await params;
    const task = await prisma.task.findFirst({ where: { id, userId: user.id } });
    if (!task) throw new Error("任务不存在");

    await prisma.task.update({
      where: { id },
      data: { status: "queued", progress: 0, errorMessage: null },
    });
    enqueueTask(id);
    return jsonOk({ message: "已重新加入队列" });
  } catch (err) {
    return handleApiError(err);
  }
}
