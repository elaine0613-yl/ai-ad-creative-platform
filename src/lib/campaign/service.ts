import { prisma } from "@/lib/db/client";
import { findSkuById, INTERNAL_SKUS, skuRecordFromDb } from "@/lib/mock/skus";
import { getBusinessTemplate } from "@/lib/campaign/templates";
import { recommendProducts } from "@/lib/selection/engine";
import type {
  AgentMessage,
  CampaignSnapshot,
  CampaignStage,
  CreativeBrief,
  CreativePlanPackage,
  ProductRecommendation,
  RequirementBrief,
  SkuRecord,
} from "@/lib/campaign/types";
import { parseCreativePackage } from "@/lib/campaign/creative-plan";

export async function loadSkuPool(): Promise<SkuRecord[]> {
  try {
    const rows = await prisma.sku.findMany({ where: { status: "active" }, take: 100 });
    if (rows.length > 0) return rows.map(skuRecordFromDb);
  } catch {
    /* fallback to mock */
  }
  return INTERNAL_SKUS;
}

export function toSnapshot(row: {
  id: string;
  templateId: string;
  stage: string;
  userIntent: string;
  requirementJson: string;
  selectedSkuId: string | null;
  recommendationsJson: string;
  creativeJson: string;
  messagesJson: string;
}, skuPool?: SkuRecord[]): CampaignSnapshot {
  const pool = skuPool ?? INTERNAL_SKUS;
  const requirement = row.requirementJson
    ? (JSON.parse(row.requirementJson) as RequirementBrief)
    : null;
  const recommendations = row.recommendationsJson
    ? (JSON.parse(row.recommendationsJson) as ProductRecommendation[])
    : [];
  const creativePkg = parseCreativePackage(row.creativeJson);
  const creative = creativePkg?.brief ?? null;
  const creativePlan = creativePkg;
  const messages = row.messagesJson ? (JSON.parse(row.messagesJson) as AgentMessage[]) : [];
  const selectedSku = row.selectedSkuId ? findSkuById(row.selectedSkuId, pool) ?? null : null;

  return {
    id: row.id,
    stage: row.stage as CampaignStage,
    templateId: row.templateId,
    userIntent: row.userIntent,
    requirement,
    recommendations,
    selectedSkuId: row.selectedSkuId,
    selectedSku,
    creative,
    creativePlan,
    messages,
  };
}

export function buildRecommendations(
  requirement: RequirementBrief,
  skuPool: SkuRecord[]
): ProductRecommendation[] {
  const template = getBusinessTemplate(requirement.templateId);
  if (!template) return [];
  const count = Math.min(requirement.selectionCount ?? 6, 12);
  return recommendProducts(
    skuPool,
    template.selectionRules,
    `${requirement.productKeywords} ${requirement.sellingPoints} ${requirement.selectionStrategy ?? ""}`,
    count
  );
}
