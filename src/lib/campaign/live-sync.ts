import { buildCampaignFieldGroups } from "@/lib/campaign/field-map";
import {
  applyCreativeTweak,
  applyRequirementTweak,
  newMessage,
  parseRequirementFromIntent,
} from "@/lib/campaign/parser";
import { getBusinessTemplate } from "@/lib/campaign/templates";
import type { CampaignSnapshot, RequirementBrief } from "@/lib/campaign/types";
import { INTERNAL_SKUS } from "@/lib/mock/skus";
import { recommendProducts } from "@/lib/selection/engine";
import type { MaterialType } from "@/lib/types";

export interface InteractionLogEntry {
  id: string;
  role: "user" | "agent";
  message: string;
  fieldUpdates: { label: string; value: string }[];
  at: string;
}

function buildRecommendations(requirement: RequirementBrief) {
  const template = getBusinessTemplate(requirement.templateId);
  if (!template) return [];
  const count = Math.min(requirement.selectionCount ?? 6, 12);
  return recommendProducts(
    INTERNAL_SKUS,
    template.selectionRules,
    `${requirement.productKeywords} ${requirement.sellingPoints} ${requirement.selectionStrategy ?? ""}`,
    count
  );
}

export function buildOptimisticCampaign(
  text: string,
  materialType: MaterialType,
  base?: CampaignSnapshot | null,
  agentReply?: string
): CampaignSnapshot {
  if (base?.requirement && (base.stage === "confirm" || base.stage === "creative_review")) {
    const requirement = applyRequirementTweak(base.requirement, text);
    const next: CampaignSnapshot = {
      ...base,
      requirement,
      messages: [...base.messages, newMessage("user", text)],
    };
    if (base.creative) {
      next.creative = applyCreativeTweak(base.creative, text);
    }
    return next;
  }

  const requirement = parseRequirementFromIntent(text, materialType);
  requirement.materialType = materialType;
  const recommendations = buildRecommendations(requirement);

  return {
    id: base?.id ?? "optimistic",
    stage: "confirm",
    templateId: requirement.templateId,
    userIntent: text,
    requirement,
    recommendations,
    selectedSkuId: null,
    selectedSku: null,
    creative: null,
    creativePlan: null,
    messages: agentReply
      ? [newMessage("user", text), newMessage("agent", agentReply)]
      : [newMessage("user", text)],
  };
}

export function diffFieldKeys(
  prev: CampaignSnapshot | null,
  next: CampaignSnapshot,
  materialType: MaterialType
): string[] {
  const prevMap = new Map<string, string>();
  const nextMap = new Map<string, string>();

  if (prev?.requirement) {
    for (const group of buildCampaignFieldGroups(prev, materialType)) {
      for (const item of group.items) {
        prevMap.set(item.fieldKey, item.value);
      }
    }
  }

  if (!next.requirement) return [];

  for (const group of buildCampaignFieldGroups(next, materialType)) {
    for (const item of group.items) {
      nextMap.set(item.fieldKey, item.value);
    }
  }

  const changed: string[] = [];
  for (const [key, value] of nextMap) {
    if (prevMap.get(key) !== value && value !== "待补充") {
      changed.push(key);
    }
  }
  return changed;
}

export function buildFieldUpdates(
  campaign: CampaignSnapshot,
  materialType: MaterialType,
  fieldKeys: string[]
): { label: string; value: string }[] {
  if (!campaign.requirement || fieldKeys.length === 0) return [];

  const map = new Map<string, { label: string; value: string }>();
  for (const group of buildCampaignFieldGroups(campaign, materialType)) {
    for (const item of group.items) {
      map.set(item.fieldKey, { label: item.label, value: item.value });
    }
  }

  return fieldKeys
    .map((key) => map.get(key))
    .filter((x): x is { label: string; value: string } => !!x && x.value !== "待补充");
}

export function appendInteractionLog(
  log: InteractionLogEntry[],
  entry: InteractionLogEntry,
  max = 8
): InteractionLogEntry[] {
  return [entry, ...log].slice(0, max);
}
