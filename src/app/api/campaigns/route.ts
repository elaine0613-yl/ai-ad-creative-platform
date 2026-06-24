import { jsonError, jsonOk, handleApiError } from "@/lib/api/response";
import { requireAuth } from "@/lib/auth/session";
import {
  agentReplyForStage,
  buildCreativeBrief,
  newMessage,
  parseRequirementFromIntent,
} from "@/lib/campaign/parser";
import { buildRecommendations, toSnapshot } from "@/lib/campaign/service";
import { matchTemplate } from "@/lib/campaign/parser";
import { loadSkuPool } from "@/lib/campaign/service";
import type { MaterialType } from "@/lib/types";
import { prisma } from "@/lib/db/client";

export async function POST(req: Request) {
  try {
    const user = await requireAuth();
    const body = await req.json();
    const userIntent = String(body.message ?? body.userIntent ?? "").trim();
    const materialType = (body.materialType as MaterialType) || undefined;
    if (!userIntent) return jsonError("请输入诉求");

    const template = matchTemplate(userIntent, materialType);
    const requirement = parseRequirementFromIntent(userIntent, materialType);
    requirement.materialType = template.materialType;

    const skuPool = await loadSkuPool();
    const recommendations = buildRecommendations(requirement, skuPool);
    const topSku = recommendations[0]?.sku;
    const creative = buildCreativeBrief(
      requirement,
      topSku?.name ?? requirement.productKeywords
    );

    const messages = [
      newMessage("user", userIntent),
      newMessage("agent", agentReplyForStage("confirm", { requirement })),
    ];

    const campaign = await prisma.campaign.create({
      data: {
        userId: user.id,
        templateId: template.id,
        stage: "confirm",
        userIntent,
        requirementJson: JSON.stringify(requirement),
        recommendationsJson: JSON.stringify(recommendations),
        selectedSkuId: topSku?.id ?? null,
        creativeJson: JSON.stringify(creative),
        messagesJson: JSON.stringify(messages),
      },
    });

    return jsonOk({ campaign: toSnapshot(campaign, skuPool) });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function GET() {
  try {
    const user = await requireAuth();
    const skuPool = await loadSkuPool();
    const rows = await prisma.campaign.findMany({
      where: { userId: user.id },
      orderBy: { updatedAt: "desc" },
      take: 20,
    });
    return jsonOk({ campaigns: rows.map((r) => toSnapshot(r, skuPool)) });
  } catch (err) {
    return handleApiError(err);
  }
}
