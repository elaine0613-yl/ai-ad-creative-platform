import { prisma } from "@/lib/db/client";
import { getImageProvider, getVideoProvider } from "@/lib/ai";
import { buildImagePrompt } from "@/lib/ai/types";

export async function processTask(taskId: string) {
  const task = await prisma.task.findUnique({ where: { id: taskId } });
  if (!task || task.status === "processing" || task.status === "completed") return;

  await prisma.task.update({
    where: { id: taskId },
    data: { status: "processing", progress: 10 },
  });

  try {
    const payload = JSON.parse(task.payload);

    if (task.type === "image") {
      const provider = getImageProvider();
      const prompt = buildImagePrompt(payload);
      const results = await provider.generateImage({
        prompt,
        width: payload.width ?? 1024,
        height: payload.height ?? 1024,
        count: payload.count ?? 1,
        style: payload.style,
        ...payload,
      });

      for (const r of results) {
        await prisma.material.create({
          data: {
            userId: task.userId,
            name: `${payload.productName || "广告图"} - ${r.id.slice(0, 6)}`,
            type: "image",
            url: r.url,
            thumbnailUrl: r.url,
            width: r.width,
            height: r.height,
            tags: JSON.stringify([payload.industry, payload.scene].filter(Boolean)),
            metadata: JSON.stringify({ provider: r.provider, taskId }),
          },
        });
      }

      await prisma.task.update({
        where: { id: taskId },
        data: {
          status: "completed",
          progress: 100,
          successCount: results.length,
          result: JSON.stringify({ images: results }),
          completedAt: new Date(),
        },
      });
    } else if (task.type === "video") {
      const provider = getVideoProvider();
      const result = await provider.generateVideo({
        prompt: payload.prompt,
        imageUrls: payload.imageUrls ?? [],
        duration: payload.duration ?? 15,
        aspectRatio: payload.aspectRatio ?? "9:16",
        productName: payload.productName,
        sellingPoints: payload.sellingPoints,
      });

      await prisma.material.create({
        data: {
          userId: task.userId,
          name: `${payload.productName || "广告视频"} - ${result.id.slice(0, 6)}`,
          type: "video",
          url: result.url,
          thumbnailUrl: result.thumbnailUrl,
          width: 1080,
          height: 1920,
          tags: JSON.stringify(["video"]),
          metadata: JSON.stringify({ provider: result.provider, taskId }),
        },
      });

      await prisma.task.update({
        where: { id: taskId },
        data: {
          status: "completed",
          progress: 100,
          successCount: 1,
          result: JSON.stringify({ video: result }),
          completedAt: new Date(),
        },
      });
    } else if (task.type === "batch") {
      const items = payload.items as Record<string, unknown>[];
      let success = 0;
      let fail = 0;

      for (let i = 0; i < items.length; i++) {
        try {
          const item = items[i];
          const provider = getImageProvider();
          const prompt = buildImagePrompt(item as Parameters<typeof buildImagePrompt>[0]);
          const results = await provider.generateImage({
            prompt,
            width: (item.width as number) ?? 1024,
            height: (item.height as number) ?? 1024,
            count: 1,
          });
          if (results[0]) {
            await prisma.material.create({
              data: {
                userId: task.userId,
                name: String(item.productName || `批量素材 ${i + 1}`),
                type: "image",
                url: results[0].url,
                thumbnailUrl: results[0].url,
                width: results[0].width,
                height: results[0].height,
                tags: JSON.stringify(["batch"]),
                metadata: JSON.stringify({ batchTaskId: taskId, row: i + 1 }),
              },
            });
            success++;
          }
        } catch {
          fail++;
        }
        await prisma.task.update({
          where: { id: taskId },
          data: {
            progress: Math.round(((i + 1) / items.length) * 100),
            successCount: success,
            failCount: fail,
          },
        });
      }

      await prisma.task.update({
        where: { id: taskId },
        data: {
          status: fail === items.length ? "failed" : "completed",
          progress: 100,
          successCount: success,
          failCount: fail,
          completedAt: new Date(),
          errorMessage: fail > 0 ? `${fail} 条任务失败` : null,
        },
      });
    }
  } catch (err) {
    await prisma.task.update({
      where: { id: taskId },
      data: {
        status: "failed",
        errorMessage: err instanceof Error ? err.message : "任务处理失败",
      },
    });
  }
}

export function enqueueTask(taskId: string) {
  setImmediate(() => {
    processTask(taskId).catch(console.error);
  });
}
