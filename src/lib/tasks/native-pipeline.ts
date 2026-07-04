import { prisma } from "@/lib/db/client";
import { getImageProvider, getVideoProvider } from "@/lib/ai";
import { buildImagePrompt } from "@/lib/ai/types";
import { auditNativeImageCreative, auditNativeVideoCreative } from "@/lib/tasks/native-audit";
import type { TaskPayload, TaskResultMeta } from "@/lib/tasks/display";

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function buildNativeImagePrompt(payload: TaskPayload): string {
  const req = payload.requirement;
  const creative = payload.imageCreative;
  if (creative) {
    return buildImagePrompt({
      productName: req?.productKeywords,
      mainTitle: creative.mainTitle,
      subTitle: creative.subTitle,
      sellingPoints: req?.sellingPoints,
      otherRequirements: creative.creativeStoryKernel,
      promotion: req?.promotion,
      industry: req?.industry,
      scene: `${creative.visualThemeForm} · ${creative.sceneEnvironment}`,
      style: `${creative.lightingTexture} · ${creative.creativeAtmosphere}`,
    });
  }
  return buildImagePrompt(payload as Parameters<typeof buildImagePrompt>[0]);
}

export async function processNativeImageTask(
  taskId: string,
  task: { userId: string; name: string; totalCount: number; payload: string }
) {
  const payload = JSON.parse(task.payload) as TaskPayload;

  await prisma.task.update({
    where: { id: taskId },
    data: { status: "processing", progress: 20, errorMessage: null },
  });

  await sleep(1200);

  const provider = getImageProvider();
  const prompt = buildNativeImagePrompt(payload);
  const creative = payload.imageCreative;
  const results = await provider.generateImage({
    prompt,
    width: 800,
    height: 800,
    count: payload.requirement?.creativesPerProduct ?? 1,
    style: creative?.lightingTexture,
  });

  await prisma.task.update({
    where: { id: taskId },
    data: { status: "auditing", progress: 65 },
  });

  await sleep(1800);

  const audit = auditNativeImageCreative(payload.imageCreative);
  const materialIds: string[] = [];

  if (!audit.pass) {
    const result: TaskResultMeta = {
      auditStatus: "rejected",
      auditReason: audit.auditReason,
      aiHint: audit.aiHint,
      fieldsToFix: audit.fieldsToFix,
    };
    await prisma.task.update({
      where: { id: taskId },
      data: {
        status: "audit_failed",
        progress: 100,
        errorMessage: audit.auditReason ?? "合规审核未通过",
        result: JSON.stringify(result),
      },
    });
    return;
  }

  for (const r of results) {
    const material = await prisma.material.create({
      data: {
        userId: task.userId,
        name: `${payload.requirement?.taskName ?? task.name} · ${r.id.slice(0, 6)}`,
        type: "image",
        url: r.url,
        thumbnailUrl: r.url,
        width: r.width,
        height: r.height,
        tags: JSON.stringify([
          payload.requirement?.media,
          payload.requirement?.channel,
          payload.imageCreative?.visualThemeForm,
        ].filter(Boolean)),
        lifecycleStatus: "in_library",
        metadata: JSON.stringify({
          provider: r.provider,
          taskId,
          imageCreative: payload.imageCreative,
        }),
      },
    });
    materialIds.push(material.id);
  }

  const result: TaskResultMeta = {
    auditStatus: "passed",
    materialIds,
  };

  await prisma.task.update({
    where: { id: taskId },
    data: {
      status: "completed",
      progress: 100,
      successCount: results.length,
      result: JSON.stringify({ ...result, images: results }),
      completedAt: new Date(),
      errorMessage: null,
    },
  });
}

export async function processNativeVideoTask(
  taskId: string,
  task: { userId: string; name: string; totalCount: number; payload: string }
) {
  const payload = JSON.parse(task.payload) as TaskPayload;

  await prisma.task.update({
    where: { id: taskId },
    data: { status: "processing", progress: 20, errorMessage: null },
  });

  await sleep(1500);

  const provider = getVideoProvider();
  const creative = payload.videoCreative;
  const req = payload.requirement;
  const result = await provider.generateVideo({
    prompt: creative?.fullVideoScript ?? creative?.creativeStoryKernel,
    imageUrls: [],
    duration: parseInt(req?.videoDurationTier ?? "15", 10) || 15,
    aspectRatio: req?.aspectRatio ?? "9:16",
    productName: req?.productKeywords,
    sellingPoints: req?.sellingPoints,
    otherRequirements: creative?.lensCompositionForm,
  });

  await prisma.task.update({
    where: { id: taskId },
    data: { status: "auditing", progress: 65 },
  });

  await sleep(2000);

  const audit = auditNativeVideoCreative(payload.videoCreative);
  const materialIds: string[] = [];

  if (!audit.pass) {
    const auditResult: TaskResultMeta = {
      auditStatus: "rejected",
      auditReason: audit.auditReason,
      aiHint: audit.aiHint,
      fieldsToFix: audit.fieldsToFix,
    };
    await prisma.task.update({
      where: { id: taskId },
      data: {
        status: "audit_failed",
        progress: 100,
        errorMessage: audit.auditReason ?? "合规审核未通过",
        result: JSON.stringify(auditResult),
      },
    });
    return;
  }

  const material = await prisma.material.create({
    data: {
      userId: task.userId,
      name: `${req?.taskName ?? task.name} · 视频`,
      type: "video",
      url: result.url,
      thumbnailUrl: result.thumbnailUrl,
      width: 1080,
      height: 1920,
      tags: JSON.stringify([req?.media, req?.channel, creative?.videoPlotStructure].filter(Boolean)),
      lifecycleStatus: "in_library",
      metadata: JSON.stringify({ provider: result.provider, taskId, videoCreative: creative }),
    },
  });
  materialIds.push(material.id);

  await prisma.task.update({
    where: { id: taskId },
    data: {
      status: "completed",
      progress: 100,
      successCount: 1,
      result: JSON.stringify({ auditStatus: "passed", materialIds, video: result }),
      completedAt: new Date(),
      errorMessage: null,
    },
  });
}

export function isNativeDemoPayload(payload: Record<string, unknown>): boolean {
  return !!(payload.campaignId || payload.imageCreative || payload.videoCreative);
}
