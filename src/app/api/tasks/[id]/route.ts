import { jsonOk, handleApiError, jsonError } from "@/lib/api/response";
import { requireAuth } from "@/lib/auth/session";
import { prisma } from "@/lib/db/client";
import { enqueueTask } from "@/lib/queue/task-processor";
import { parseTaskPayload, parseTaskResult } from "@/lib/tasks/display";
import type { ImageCreativePlanFields, RequirementBrief, VideoCreativePlanFields } from "@/lib/campaign/types";

function serializeTaskDetail(task: {
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
  user: { name: string | null; email: string };
}) {
  const payload = parseTaskPayload(task.payload);
  const result = parseTaskResult(task.result);
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
    errorMessage: task.errorMessage,
    createdAt: task.createdAt.toISOString(),
    completedAt: task.completedAt?.toISOString() ?? null,
    initiatorName: payload.initiatorName ?? task.user.name ?? task.user.email,
    requirement: payload.requirement ?? null,
    imageCreative: payload.imageCreative ?? null,
    videoCreative: payload.videoCreative ?? null,
    audit: {
      reason: result.auditReason ?? task.errorMessage,
      aiHint: result.aiHint,
      fieldsToFix: result.fieldsToFix ?? [],
      materialIds: result.materialIds ?? [],
    },
  };
}

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireAuth();
    const { id } = await params;
    const task = await prisma.task.findFirst({
      where: { id, userId: user.id },
      include: { user: { select: { name: true, email: true } } },
    });
    if (!task) return jsonError("任务不存在", 404);
    return jsonOk({ task: serializeTaskDetail(task) });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireAuth();
    const { id } = await params;
    const body = await req.json();
    const action = body.action as string | undefined;

    const task = await prisma.task.findFirst({
      where: { id, userId: user.id },
      include: { user: { select: { name: true, email: true } } },
    });
    if (!task) return jsonError("任务不存在", 404);

    if (action === "resubmit_audit") {
      if (task.status !== "audit_failed") return jsonError("当前任务状态不可重新提交审核");

      const payload = parseTaskPayload(task.payload);
      const requirement = (body.requirement ?? payload.requirement) as RequirementBrief | undefined;
      const imageCreative = (body.imageCreative ?? payload.imageCreative) as
        | ImageCreativePlanFields
        | undefined;
      const videoCreative = (body.videoCreative ?? payload.videoCreative) as
        | VideoCreativePlanFields
        | undefined;

      if (!imageCreative && !videoCreative) return jsonError("缺少创意方案配置");

      const nextPayload = {
        ...payload,
        requirement: requirement ?? payload.requirement,
        ...(videoCreative ? { videoCreative } : { imageCreative: imageCreative! }),
      };

      await prisma.task.update({
        where: { id },
        data: {
          status: "queued",
          progress: 0,
          errorMessage: null,
          result: "{}",
          payload: JSON.stringify(nextPayload),
        },
      });
      enqueueTask(id);
      const updated = await prisma.task.findFirst({
        where: { id },
        include: { user: { select: { name: true, email: true } } },
      });
      return jsonOk({ task: serializeTaskDetail(updated!), message: "已重新提交审核" });
    }

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

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireAuth();
    const { id } = await params;
    const body = await req.json();

    const task = await prisma.task.findFirst({ where: { id, userId: user.id } });
    if (!task) return jsonError("任务不存在", 404);
    if (task.status !== "audit_failed") return jsonError("仅审核失败任务可修改字段");

    const payload = parseTaskPayload(task.payload);
    const nextPayload = {
      ...payload,
      requirement: body.requirement ?? payload.requirement,
      ...(body.videoCreative || payload.videoCreative
        ? { videoCreative: body.videoCreative ?? payload.videoCreative }
        : { imageCreative: body.imageCreative ?? payload.imageCreative }),
    };

    await prisma.task.update({
      where: { id },
      data: { payload: JSON.stringify(nextPayload) },
    });

    const updated = await prisma.task.findFirst({
      where: { id },
      include: { user: { select: { name: true, email: true } } },
    });
    if (!updated) return jsonError("任务不存在", 404);

    return jsonOk({ task: serializeTaskDetail(updated) });
  } catch (err) {
    return handleApiError(err);
  }
}
