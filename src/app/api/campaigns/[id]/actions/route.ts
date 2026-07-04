import { jsonOk, handleApiError, jsonError } from "@/lib/api/response";
import { requireAuth } from "@/lib/auth/session";
import { applyFieldUpdates } from "@/lib/campaign/field-map";
import { buildFullCreativePlan, parseCreativePackage } from "@/lib/campaign/creative-plan";
import { IMAGE_TASK_SUBMITTED_HINT } from "@/lib/campaign/image-native-flow";
import { VIDEO_TASK_SUBMITTED_HINT } from "@/lib/campaign/video-native-flow";
import {
  agentReplyForStage,
  applyCreativeTweak,
  applyRequirementTweak,
  buildCreativeBrief,
  newMessage,
} from "@/lib/campaign/parser";
import { loadSkuPool, toSnapshot } from "@/lib/campaign/service";
import { prisma } from "@/lib/db/client";
import { findSkuById } from "@/lib/mock/skus";
import { enqueueTask } from "@/lib/queue/task-processor";
import type { AgentMessage, CreativeBrief, ImageCreativePlanFields, RequirementBrief, VideoCreativePlanFields } from "@/lib/campaign/types";

async function getCampaign(id: string, userId: string) {
  return prisma.campaign.findFirst({ where: { id, userId } });
}

function parseMessages(json: string): AgentMessage[] {
  return JSON.parse(json || "[]");
}

function parseCreative(json: string | null) {
  return parseCreativePackage(json)?.brief ?? null;
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
    const stage = campaign.stage;

    if (action === "confirm_requirement") {
      if (stage !== "confirm" && stage !== "requirement_review") {
        return jsonError("当前阶段无法确认需求");
      }
      messages.push(newMessage("user", "确认基础信息"));
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

    if (action === "run_selection") {
      if (stage !== "confirm" && stage !== "product_review") {
        return jsonError("当前阶段无法执行选品");
      }
      if (requirement.landingType && requirement.landingType !== "商品") {
        return jsonError("非商品承接类型，无法选品");
      }
      const { buildRecommendations } = await import("@/lib/campaign/service");
      const recommendations = buildRecommendations(requirement, skuPool);
      messages.push(newMessage("user", "Agent 智能选品"));
      messages.push(
        newMessage(
          "agent",
          `已按选品策略筛选 ${recommendations.length} 个商品，请核对并多选确认。`
        )
      );
      const updated = await prisma.campaign.update({
        where: { id },
        data: {
          stage: "product_review",
          recommendationsJson: JSON.stringify(recommendations),
          messagesJson: JSON.stringify(messages),
        },
      });
      return jsonOk({ campaign: toSnapshot(updated, skuPool) });
    }

    if (action === "select_sku") {
      const skuId = body.skuId as string;
      if (!skuId) return jsonError("请选择 SKU");
      const sku = findSkuById(skuId, skuPool);
      if (!sku) return jsonError("SKU 不存在");
      const updated = await prisma.campaign.update({
        where: { id },
        data: { selectedSkuId: skuId },
      });
      return jsonOk({ campaign: toSnapshot(updated, skuPool) });
    }

    if (action === "confirm_product") {
      if (stage !== "product_review") return jsonError("请先完成基础信息确认");
      const skuIds = (body.skuIds as string[] | undefined) ?? [];
      const single = (body.skuId as string) || campaign.selectedSkuId;
      const ids = skuIds.length > 0 ? skuIds : single ? [single] : [];
      if (ids.length === 0) return jsonError("请至少选择一个商品");

      for (const sid of ids) {
        if (!findSkuById(sid, skuPool)) return jsonError(`SKU 不存在: ${sid}`);
      }

      const nextRequirement = {
        ...requirement,
        confirmedSkuIds: ids,
      };

      const skus = ids
        .map((sid) => findSkuById(sid, skuPool))
        .filter((s): s is NonNullable<typeof s> => !!s);
      const primarySku = skus[0]!;
      const plan = buildFullCreativePlan(nextRequirement, primarySku, campaign.userIntent, skus);

      const nativeFlow = body.nativeFlow === true;

      messages.push(newMessage("user", `选品确认：${ids.length} 个商品`));
      messages.push(
        newMessage(
          "agent",
          nativeFlow
            ? "选品已确认，已生成创意方案，请核对下方字段后进入预览。"
            : `选品已确认，已结合诉求与 ${ids.length} 个商品生成创意方案。请查看下方「创意生成」模块，点击「一键配置」写入各模块配置。`
        )
      );

      const updated = await prisma.campaign.update({
        where: { id },
        data: {
          stage: "creative_review",
          selectedSkuId: ids[0],
          requirementJson: JSON.stringify(nextRequirement),
          creativeJson: JSON.stringify(plan),
          messagesJson: JSON.stringify(messages),
        },
      });
      return jsonOk({ campaign: toSnapshot(updated, skuPool) });
    }

    if (action === "generate_creative") {
      if (stage !== "creative_review") return jsonError("请先完成选品确认");
      const skuId = campaign.selectedSkuId;
      if (!skuId) return jsonError("请先选择商品");
      const sku = findSkuById(skuId, skuPool);
      if (!sku) return jsonError("SKU 不存在");

      const confirmedIds = requirement.confirmedSkuIds ?? [skuId];
      const skus = confirmedIds
        .map((sid) => findSkuById(sid, skuPool))
        .filter((s): s is NonNullable<typeof s> => !!s);

      const plan = buildFullCreativePlan(requirement, sku, campaign.userIntent, skus);
      messages.push(newMessage("user", "重新生成创意"));
      messages.push(
        newMessage(
          "agent",
          `创意方案已更新。请查看「创意生成」长文描述，点击「一键配置」同步至下方各模块。`
        )
      );

      const updated = await prisma.campaign.update({
        where: { id },
        data: {
          creativeJson: JSON.stringify(plan),
          messagesJson: JSON.stringify(messages),
        },
      });
      return jsonOk({ campaign: toSnapshot(updated, skuPool) });
    }

    if (action === "confirm_creative") {
      if (stage !== "creative_review") return jsonError("当前阶段无法开始生成");
      if (!parseCreative(campaign.creativeJson)) return jsonError("请先生成创意方案");

      messages.push(newMessage("user", "确认创意，开始生成"));
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

    if (action === "tweak_creative" || action === "tweak") {
      const text = String(body.message ?? "");
      const nextRequirement = applyRequirementTweak(requirement, text);
      let creative = parseCreative(campaign.creativeJson);

      if (creative && (stage === "creative_review" || stage === "confirm")) {
        creative = applyCreativeTweak(creative, text);
      }

      messages.push(newMessage("user", text));
      messages.push(
        newMessage(
          "agent",
          creative
            ? "已更新需求清单与创意方案，请继续确认。"
            : "已更新右侧字段清单，请继续补充或确认。"
        )
      );

      const updated = await prisma.campaign.update({
        where: { id },
        data: {
          requirementJson: JSON.stringify(nextRequirement),
          creativeJson: creative ? JSON.stringify(creative) : campaign.creativeJson,
          messagesJson: JSON.stringify(messages),
        },
      });
      return jsonOk({ campaign: toSnapshot(updated, skuPool) });
    }

    if (action === "update_fields") {
      const fields = (body.fields ?? {}) as Record<string, string>;
      const creative = parseCreative(campaign.creativeJson);
      const { requirement: nextRequirement, creative: nextCreative } = applyFieldUpdates(
        requirement,
        creative,
        fields
      );

      let recommendationsJson = campaign.recommendationsJson;
      if (
        ("selectionCount" in fields || "selectionStrategy" in fields || "productKeywords" in fields) &&
        (stage === "confirm" || stage === "requirement_review")
      ) {
        const { buildRecommendations } = await import("@/lib/campaign/service");
        recommendationsJson = JSON.stringify(buildRecommendations(nextRequirement, skuPool));
      }

      const updated = await prisma.campaign.update({
        where: { id },
        data: {
          requirementJson: JSON.stringify(nextRequirement),
          creativeJson: nextCreative ? JSON.stringify(nextCreative) : campaign.creativeJson,
          recommendationsJson,
        },
      });
      return jsonOk({ campaign: toSnapshot(updated, skuPool) });
    }

    if (action === "remove_recommendation") {
      const skuId = body.skuId as string;
      if (!skuId) return jsonError("缺少 skuId");
      const recommendations = JSON.parse(campaign.recommendationsJson || "[]") as import("@/lib/campaign/types").ProductRecommendation[];
      const next = recommendations.filter((r) => r.sku.id !== skuId);
      const updated = await prisma.campaign.update({
        where: { id },
        data: {
          recommendationsJson: JSON.stringify(next),
          selectedSkuId: campaign.selectedSkuId === skuId ? null : campaign.selectedSkuId,
        },
      });
      return jsonOk({ campaign: toSnapshot(updated, skuPool) });
    }

    /** @deprecated 使用分步 confirm_creative + generate */
    if (action === "confirm_and_generate") {
      const skuId = (body.skuId as string) || campaign.selectedSkuId;
      if (!skuId) return jsonError("请先选择商品");
      const sku = findSkuById(skuId, skuPool);
      if (!sku) return jsonError("SKU 不存在");

      let creative = parseCreative(campaign.creativeJson);
      if (!creative) creative = buildCreativeBrief(requirement, sku.name);

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

    if (action === "update_image_creative") {
      if (stage !== "creative_review") return jsonError("当前阶段无法更新创意方案");
      const imageCreative = body.imageCreative as ImageCreativePlanFields | undefined;
      if (!imageCreative) return jsonError("缺少 imageCreative");

      const pkg = parseCreativePackage(campaign.creativeJson);
      if (!pkg) return jsonError("创意方案不存在");

      const updated = await prisma.campaign.update({
        where: { id },
        data: {
          creativeJson: JSON.stringify({ ...pkg, imageCreative }),
        },
      });
      return jsonOk({ campaign: toSnapshot(updated, skuPool) });
    }

    if (action === "update_video_creative") {
      if (stage !== "creative_review") return jsonError("当前阶段无法更新创意方案");
      const videoCreative = body.videoCreative as VideoCreativePlanFields | undefined;
      if (!videoCreative) return jsonError("缺少 videoCreative");

      const pkg = parseCreativePackage(campaign.creativeJson);
      if (!pkg) return jsonError("创意方案不存在");

      const updated = await prisma.campaign.update({
        where: { id },
        data: {
          creativeJson: JSON.stringify({ ...pkg, videoCreative }),
        },
      });
      return jsonOk({ campaign: toSnapshot(updated, skuPool) });
    }

    if (action === "submit_native_task") {
      if (stage !== "creative_review") return jsonError("当前阶段无法提交任务");

      const pkg = parseCreativePackage(campaign.creativeJson);
      const isVideo = requirement.materialType === "video";
      const task = await prisma.task.create({
        data: {
          userId: user.id,
          name: requirement.taskName ?? (isVideo ? "视频生成任务" : "图片生成任务"),
          type: isVideo ? "video" : "image",
          mode: isVideo ? "AI原生视频" : "AI原生素材",
          totalCount: requirement.confirmedSkuIds?.length ?? 1,
          payload: JSON.stringify({
            campaignId: id,
            imageCreative: pkg?.imageCreative ?? null,
            videoCreative: pkg?.videoCreative ?? null,
            requirement,
            initiatorName: user.name || user.email,
          }),
        },
      });
      enqueueTask(task.id);

      messages.push(
        newMessage("user", isVideo ? "确认出片并提交任务" : "确认出图并提交任务")
      );
      messages.push(
        newMessage("agent", isVideo ? VIDEO_TASK_SUBMITTED_HINT : IMAGE_TASK_SUBMITTED_HINT)
      );

      const updated = await prisma.campaign.update({
        where: { id },
        data: { messagesJson: JSON.stringify(messages) },
      });
      return jsonOk({ campaign: toSnapshot(updated, skuPool) });
    }

    return jsonError("未知 action");
  } catch (err) {
    return handleApiError(err);
  }
}
