import { NextRequest } from "next/server";
import { z } from "zod";
import { jsonOk, handleApiError } from "@/lib/api/response";
import { requireAuth } from "@/lib/auth/session";
import { prisma } from "@/lib/db/client";
import { enqueueTask } from "@/lib/queue/task-processor";

const schema = z.object({
  items: z.array(z.record(z.unknown())).min(1).max(500),
  name: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    const body = schema.parse(await req.json());

    const task = await prisma.task.create({
      data: {
        userId: user.id,
        name: body.name ?? `批量生成 ${body.items.length} 条`,
        type: "batch",
        mode: "Excel批量",
        totalCount: body.items.length,
        payload: JSON.stringify({ items: body.items }),
      },
    });

    enqueueTask(task.id);
    return jsonOk({ taskId: task.id });
  } catch (err) {
    return handleApiError(err);
  }
}
