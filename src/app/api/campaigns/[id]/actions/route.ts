import { jsonOk, handleApiError, jsonError } from "@/lib/api/response";
import { requireAuth } from "@/lib/auth/session";
import {
  agentReplyForStage,
  applyCreativeTweak,
  applyRequirementTweak,
  buildCreativeBrief,
  newMessage,
} from "@/lib/campaign/parser";
import { applyFieldUpdates } from "@/lib/campaign/field-map";
import { loadSkuPool, toSnapshot } from "@/lib/campaign/service";
import { findSkuById } from "@/lib/mock/skus";
import type { AgentMessage, CreativeBrief, RequirementBrief } from "@/lib/campaign/types";
import { prisma } from "@/lib/db/client";

async function getCampaign(id: string, userId: string) {
  return prisma.campaign.findFirst({ where: { id, userId } });
}

function parseMessages(json: string): AgentMessage[] {
  return JSON.parse(json || "[]");
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireAuth();
    const { id } = await params;
    const body = await req.json();
    const action = body.action as string;

    const campaign = await getCampaign(id, user.id);
    if (!campaign) return jsonError("Campaign 不存在", 404);

    const skuPool = await loadSkuPool();
    const messages = parseMessages(campaign.messagesJson);
    const requirement = JSON.parse(campaign.requirementJson) as RequirementBrief;

    if (action === "confirm_requirement") {
      messages.push(newMessage("user", "需求确认 OK"));
      messages.push(
        newMessage("agent", agentReplyForStage("product_review", { requirement }))
      );
      const updated = await prisma.campaign.update({
        where: { id },
        data: {
          stage: "product_review",
          messagesJson: JSON.stringify(messages),
        },
      });
      return jsonOk({ campaign: toSnapshot(updated, skuPool) });
    }

    if (action === "confirm_product") {
      const skuId = body.skuId as string;
      if (!skuId) return jsonError("请选择 SKU");
      const sku = findSkuById(skuId, skuPool);
      if (!sku) return jsonError("SKU 不存在");

      const creative = buildCreativeBrief(requirement, sku.name);
      messages.push(newMessage("user", `选品确认：${sku.name}`));
      messages.push(
        newMessage("agent", agentReplyForStage("creative_review", { productName: sku.name }))
      );

      const updated = await prisma.campaign.update({
        where: { id },
        data: {
          stage: "creative_review",
          selectedSkuId: skuId,
          creativeJson: JSON.stringify(creative),
          messagesJson: JSON.stringify(messages),
        },
      });
      return jsonOk({ campaign: toSnapshot(updated, skuPool) });
    }

    if (action === "tweak_creative" || action === "tweak") {
      const text = String(body.message ?? "");
      let creative = JSON.parse(campaign.creativeJson || "{}") as CreativeBrief;
      const nextRequirement = applyRequirementTweak(requirement, text);
      creative = applyCreativeTweak(creative, text);
      messages.push(newMessage("user", text));
      messages.push(newMessage("agent", "已更新右侧字段清单，请继续确认或一键生成。"));

      const updated = await prisma.campaign.update({
        where: { id },
        data: {
          requirementJson: JSON.stringify(nextRequirement),
          creativeJson: JSON.stringify(creative),
          messagesJson: JSON.stringify(messages),
        },
      });
      return jsonOk({ campaign: toSnapshot(updated, skuPool) });
    }

    if (action === "update_fields") {
      const fields = (body.fields ?? {}) as Record<string, string>;
      let creative = campaign.creativeJson
        ? (JSON.parse(campaign.creativeJson) as CreativeBrief)
        : null;
      const { requirement: nextRequirement, creative: nextCreative } = applyFieldUpdates(
        requirement,
        creative,
        fields
      );

      const updated = await prisma.campaign.update({
        where: { id },
        data: {
          requirementJson: JSON.stringify(nextRequirement),
          creativeJson: nextCreative ? JSON.stringify(nextCreative) : campaign.creativeJson,
        },
      });
      return jsonOk({ campaign: toSnapshot(updated, skuPool) });
    }

    if (action === "select_sku") {
      const skuId = body.skuId as string;
      if (!skuId) return jsonError("请选择 SKU");
      const sku = findSkuById(skuId, skuPool);
      if (!sku) return jsonError("SKU 不存在");
      const creative = buildCreativeBrief(requirement, sku.name);
      const updated = await prisma.campaign.update({
        where: { id },
        data: {
          selectedSkuId: skuId,
          creativeJson: JSON.stringify(creative),
        },
      });
      return jsonOk({ campaign: toSnapshot(updated, skuPool) });
    }

    if (action === "confirm_and_generate") {
      const skuId = (body.skuId as string) || campaign.selectedSkuId;
      if (!skuId) return jsonError("请先选择商品");
      const sku = findSkuById(skuId, skuPool);
      if (!sku) return jsonError("SKU 不存在");

      let creative = JSON.parse(campaign.creativeJson || "{}") as CreativeBrief;
      if (!campaign.creativeJson || campaign.selectedSkuId !== skuId) {
        creative = buildCreativeBrief(requirement, sku.name);
      }

      messages.push(newMessage("user", "确认并生成"));
      messages.push(newMessage("agent", agentReplyForStage("generating", {})));

      const updated = await prisma.campaign.update({
        where: { id },
        data: {
          stage: "generating",
          selectedSkuId: skuId,
          creativeJson: JSON.stringify(creative),
          messagesJson: JSON.stringify(messages),
        },
      });
      return jsonOk({ campaign: toSnapshot(updated, skuPool) });
    }

    if (action === "confirm_creative") {
      messages.push(newMessage("user", "创意方案确认 OK"));
      messages.push(newMessage("agent", agentReplyForStage("generating", {})));

      const updated = await prisma.campaign.update({
        where: { id },
        data: {
          stage: "generating",
          messagesJson: JSON.stringify(messages),
        },
      });
      return jsonOk({ campaign: toSnapshot(updated, skuPool) });
    }

    return jsonError("未知 action");
  } catch (err) {
    return handleApiError(err);
  }
}
