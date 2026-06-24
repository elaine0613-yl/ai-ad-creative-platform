import { jsonOk, handleApiError, jsonError } from "@/lib/api/response";
import { requireAuth } from "@/lib/auth/session";
import { agentReplyForStage, newMessage } from "@/lib/campaign/parser";
import { loadSkuPool, toSnapshot } from "@/lib/campaign/service";
import { findSkuById } from "@/lib/mock/skus";
import type { CreativeBrief, RequirementBrief } from "@/lib/campaign/types";
import { prisma } from "@/lib/db/client";
import { getImageProvider } from "@/lib/ai";
import { getOceanEngineAdapter } from "@/lib/audit/ocean-engine";
import { saveBase64Image } from "@/lib/storage/files";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireAuth();
    const { id } = await params;

    const campaign = await prisma.campaign.findFirst({
      where: { id, userId: user.id },
    });
    if (!campaign) return jsonError("Campaign 不存在", 404);
    if (campaign.stage !== "generating") return jsonError("当前阶段不可生成");

    const requirement = JSON.parse(campaign.requirementJson) as RequirementBrief;
    const creative = JSON.parse(campaign.creativeJson) as CreativeBrief;
    const skuPool = await loadSkuPool();
    const sku = campaign.selectedSkuId ? findSkuById(campaign.selectedSkuId, skuPool) : null;
    const messages = JSON.parse(campaign.messagesJson || "[]");

    let materialUrl = "";
    let thumbUrl = "";
    let width = 800;
    let height = 800;
    const materialType = requirement.materialType;

    if (materialType === "image") {
      const provider = getImageProvider();
      const prompt = `${sku?.name ?? requirement.productKeywords}，${requirement.sellingPoints}，${creative.coverTitle}，${creative.visualStyle}`;
      const results = await provider.generateImage({
        prompt,
        width: 800,
        height: 800,
        count: 1,
      });
      const img = results[0];
      materialUrl = img.url.startsWith("data:") ? (await saveBase64Image(img.url)).url : img.url;
      thumbUrl = materialUrl;
      width = img.width;
      height = img.height;
    } else {
      // 视频 mock 占位
      materialUrl = "/placeholder/material-3.mp4";
      thumbUrl = "/placeholder/material-3.jpg";
      width = 1080;
      height = 1920;
    }

    const material = await prisma.material.create({
      data: {
        userId: user.id,
        campaignId: id,
        name: `${sku?.name ?? "广告素材"} · ${creative.coverTitle}`,
        type: materialType,
        url: materialUrl,
        thumbnailUrl: thumbUrl,
        width,
        height,
        tags: JSON.stringify([requirement.platform, requirement.industry]),
        lifecycleStatus: "pending_external_review",
        metadata: JSON.stringify({ creative, requirement }),
      },
    });

    const audit = getOceanEngineAdapter();
    const auditResult = await audit.submit({
      materialId: material.id,
      materialType,
      materialUrl,
      platform: requirement.platform,
      metadata: { campaignId: id },
    });

    await prisma.material.update({
      where: { id: material.id },
      data: {
        oceanEngineAuditId: auditResult.externalAuditId,
        oceanEngineAuditJson: JSON.stringify(auditResult),
      },
    });

    messages.push(newMessage("agent", agentReplyForStage("external_review", {})));

    const updated = await prisma.campaign.update({
      where: { id },
      data: {
        stage: "external_review",
        messagesJson: JSON.stringify(messages),
      },
    });

    return jsonOk({
      campaign: toSnapshot(updated, skuPool),
      material: { id: material.id, url: materialUrl, auditId: auditResult.externalAuditId },
    });
  } catch (err) {
    return handleApiError(err);
  }
}
