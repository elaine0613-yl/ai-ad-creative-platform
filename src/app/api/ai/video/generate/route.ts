import { NextRequest } from "next/server";
import { z } from "zod";
import { jsonOk, handleApiError } from "@/lib/api/response";
import { requireAuth } from "@/lib/auth/session";
import { getVideoProvider, getActiveProviders } from "@/lib/ai";
import { prisma } from "@/lib/db/client";
import { enqueueTask } from "@/lib/queue/task-processor";

const schema = z.object({
  productName: z.string().optional(),
  sellingPoints: z.string().optional(),
  otherRequirements: z.string().optional(),
  marketingInfo: z.string().optional(),
  style: z.string().optional(),
  duration: z.number().int().positive().default(15),
  aspectRatio: z.string().default("9:16"),
  imageUrls: z.array(z.string()).optional(),
  imageBase64List: z.array(z.string()).optional(),
  async: z.boolean().optional().default(false),
});

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    const body = schema.parse(await req.json());
    const providers = getActiveProviders();

    const uploadedUrls: string[] = [];

    if (body.imageBase64List?.length) {
      const { saveBase64Image } = await import("@/lib/storage/files");
      for (const b64 of body.imageBase64List) {
        const saved = await saveBase64Image(b64, "uploads");
        uploadedUrls.push(saved.url);
      }
    }

    const imageUrls = [...(body.imageUrls ?? []), ...uploadedUrls];

    const payload = { ...body, imageUrls };

    if (body.async || imageUrls.length === 0) {
      const task = await prisma.task.create({
        data: {
          userId: user.id,
          name: `${body.productName || "图文转视频"}`,
          type: "video",
          mode: "图文转视频",
          payload: JSON.stringify(payload),
        },
      });
      enqueueTask(task.id);
      return jsonOk({ taskId: task.id, providers, async: true });
    }

    const provider = getVideoProvider();
    const prompt = [body.productName, body.sellingPoints, body.otherRequirements, body.marketingInfo, body.style]
      .filter(Boolean)
      .join(". ");

    const result = await provider.generateVideo({
      prompt,
      imageUrls,
      duration: body.duration,
      aspectRatio: body.aspectRatio,
      productName: body.productName,
      sellingPoints: body.sellingPoints,
    });

    await prisma.material.create({
      data: {
        userId: user.id,
        name: `${body.productName || "广告视频"}`,
        type: "video",
        url: result.url,
        thumbnailUrl: result.thumbnailUrl,
        width: 1080,
        height: 1920,
        tags: JSON.stringify(["video"]),
        metadata: JSON.stringify({ provider: result.provider }),
      },
    });

    return jsonOk({ video: result, providers });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function GET() {
  return jsonOk({ providers: getActiveProviders() });
}
