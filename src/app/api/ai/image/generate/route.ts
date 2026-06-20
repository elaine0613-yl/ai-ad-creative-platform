import { NextRequest } from "next/server";
import { z } from "zod";
import { jsonOk, handleApiError } from "@/lib/api/response";
import { requireAuth } from "@/lib/auth/session";
import { getImageProvider, getActiveProviders } from "@/lib/ai";
import { buildImagePrompt } from "@/lib/ai/types";
import { prisma } from "@/lib/db/client";
import { enqueueTask } from "@/lib/queue/task-processor";

const schema = z.object({
  productName: z.string().optional(),
  industry: z.string().optional(),
  scene: z.string().optional(),
  mainTitle: z.string().optional(),
  subTitle: z.string().optional(),
  sellingPoints: z.string().optional(),
  otherRequirements: z.string().optional(),
  promotion: z.string().optional(),
  style: z.string().optional(),
  width: z.number().int().positive().default(1024),
  height: z.number().int().positive().default(1024),
  count: z.number().int().min(1).max(4).default(1),
  async: z.boolean().optional().default(false),
});

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    const body = schema.parse(await req.json());
    const prompt = buildImagePrompt(body);
    const providers = getActiveProviders();

    if (body.async) {
      const task = await prisma.task.create({
        data: {
          userId: user.id,
          name: `${body.productName || "文生广告图"} x${body.count}`,
          type: "image",
          mode: "文生图",
          totalCount: body.count,
          payload: JSON.stringify({ ...body, prompt }),
        },
      });
      enqueueTask(task.id);
      return jsonOk({ taskId: task.id, providers, async: true });
    }

    const provider = getImageProvider();
    const results = await provider.generateImage({
      prompt,
      width: body.width,
      height: body.height,
      count: body.count,
      style: body.style,
    });

    for (const r of results) {
      await prisma.material.create({
        data: {
          userId: user.id,
          name: `${body.productName || "广告图"} - ${r.id.slice(0, 6)}`,
          type: "image",
          url: r.url,
          thumbnailUrl: r.url,
          width: r.width,
          height: r.height,
          tags: JSON.stringify([body.industry, body.scene].filter(Boolean)),
          metadata: JSON.stringify({ provider: r.provider }),
        },
      });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { credits: { decrement: body.count } },
    });

    return jsonOk({ images: results, providers });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function GET() {
  return jsonOk({ providers: getActiveProviders() });
}
