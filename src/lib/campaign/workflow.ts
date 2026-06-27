import type { CreativeBrief, CampaignStage } from "./types";
import type { MaterialType } from "@/lib/types";

/** 创作链路步骤（图片 / 视频通用） */
export const CREATION_PIPELINE_STEPS = [
  "需求整理",
  "智能选品",
  "创意方案",
  "生成审核",
  "入库投放",
] as const;

export function stageToPipelineIndex(stage: CampaignStage): number {
  switch (stage) {
    case "intent":
    case "confirm":
    case "requirement_review":
      return 0;
    case "product_review":
      return 1;
    case "creative_review":
      return 2;
    case "generating":
    case "external_review":
      return 3;
    case "completed":
    case "rejected":
      return 4;
    default:
      return 0;
  }
}

export function isRequirementEditableStage(stage: CampaignStage): boolean {
  return (
    stage === "confirm" ||
    stage === "requirement_review" ||
    stage === "product_review" ||
    stage === "creative_review"
  );
}

export function isChatActiveStage(stage: CampaignStage): boolean {
  return (
    stage === "intent" ||
    stage === "confirm" ||
    stage === "requirement_review" ||
    stage === "product_review" ||
    stage === "creative_review"
  );
}

const STAGE_LABELS: Record<CampaignStage, string> = {
  intent: "需求录入",
  confirm: "需求确认",
  requirement_review: "需求确认",
  product_review: "选品确认",
  creative_review: "创意确认",
  generating: "素材生成中",
  external_review: "外部审核中",
  completed: "已完成",
  rejected: "审核未通过",
};

/** 返回发送按钮不可点的原因；null 表示可发送 */
export function getSendDisabledReason(params: {
  input: string;
  loading: boolean;
  campaign: { stage: CampaignStage } | null;
}): string | null {
  const { input, loading, campaign } = params;
  if (!input.trim()) return "请先在输入框填写运营诉求";
  if (loading) return "正在处理中，请稍候…";
  if (!campaign) return null;

  const stage = campaign.stage;
  if (stage === "generating") {
    return "素材生成中，暂不可发送。请点击「重新开始」开新任务";
  }
  if (stage === "external_review") {
    return "外部审核中，请稍候或点击「重新开始」";
  }
  if (!isChatActiveStage(stage)) {
    return `当前阶段「${STAGE_LABELS[stage]}」，请点击「重新开始」后再发送`;
  }
  return null;
}

export function isFlowLockedStage(stage: CampaignStage): boolean {
  return (
    stage === "generating" ||
    stage === "external_review" ||
    stage === "completed" ||
    stage === "rejected"
  );
}

export function formatCreativePlanText(
  creative: CreativeBrief,
  materialType: MaterialType
): string {
  const lines = [
    `【视觉风格】${creative.visualStyle ?? "—"}`,
    `【${materialType === "video" ? "封面标题" : "主图封题"}】${creative.coverTitle}`,
    `【CTA 行动号召】${creative.cta}`,
  ];

  if (materialType === "video") {
    lines.push(
      `【BGM 配乐】${creative.bgm}`,
      `【分镜结构】${creative.storyboard ?? "—"}`,
      `【配音旁白】${creative.voiceover ? "是" : "否"}`,
      `【字幕花字】${creative.subtitle ? "是" : "否"}`
    );
  }

  return lines.join("\n");
}

export type ChatIntent =
  | "confirm_requirement"
  | "confirm_product"
  | "generate_creative"
  | "confirm_creative"
  | "tweak";

export function detectChatIntent(text: string, stage: CampaignStage): ChatIntent {
  const t = text.trim();

  if (/需求确认|确认需求/.test(t)) return "confirm_requirement";
  if (/选品\s*(ok|OK|确认|无误|没问题)|确认选品/.test(t)) return "confirm_product";
  if (/创意生成|生成创意/.test(t)) return "generate_creative";
  if (/确认创意|创意确认|开始生成|确认并开始生成/.test(t)) return "confirm_creative";

  if (stage === "confirm" && /^(ok|OK|确认)$/.test(t)) return "confirm_requirement";

  return "tweak";
}
