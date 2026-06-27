import type { CampaignSnapshot, CreativeBrief, RequirementBrief } from "./types";
import type { MaterialType } from "@/lib/types";

export type FieldOwner = "operator" | "agent" | "auto";
export type FieldInputType = "text" | "textarea" | "select" | "number";

export interface CampaignFieldItem {
  id: string;
  label: string;
  value: string;
  owner: FieldOwner;
  editable: boolean;
  fieldKey: string;
  placeholder?: string;
  multiline?: boolean;
  inputType?: FieldInputType;
  options?: { value: string; label: string }[];
  agentParsed?: boolean;
  hint?: string;
}

export interface CampaignFieldGroup {
  id: string;
  title: string;
  description: string;
  owner: FieldOwner;
  items: CampaignFieldItem[];
}

export const CHANNEL_OPTIONS = [
  { value: "", label: "请选择" },
  { value: "外投", label: "外投" },
  { value: "信息流", label: "信息流" },
  { value: "电商站内", label: "电商站内" },
];

export const MEDIA_OPTIONS = [
  { value: "", label: "请选择" },
  { value: "抖音", label: "抖音" },
  { value: "快手", label: "快手" },
  { value: "小红书", label: "小红书" },
  { value: "淘宝", label: "淘宝" },
  { value: "京东", label: "京东" },
  { value: "拼多多", label: "拼多多" },
];

export const LANDING_TYPE_OPTIONS = [
  { value: "商品", label: "商品" },
  { value: "活动页", label: "活动页" },
  { value: "直播间", label: "直播间" },
];

export const SELECTION_METHOD_OPTIONS = [
  { value: "AI 智能选品", label: "AI 智能选品" },
  { value: "手动单个录入", label: "手动单个录入" },
  { value: "批量导入商品 ID", label: "批量导入商品 ID" },
];

function display(value: string | number | boolean | undefined | null, fallback = "待补充"): string {
  if (value === undefined || value === null || value === "") return fallback;
  if (typeof value === "boolean") return value ? "是" : "否";
  return String(value);
}

function buildBasicInfoFields(
  requirement: RequirementBrief,
  materialType: MaterialType,
  agentFilled?: Set<string>
): CampaignFieldItem[] {
  const agent = (key: string) => agentFilled?.has(key) ?? false;

  const items: CampaignFieldItem[] = [
    {
      id: "taskName",
      label: "任务名称",
      value: display(requirement.taskName, ""),
      owner: "operator",
      editable: true,
      fieldKey: "taskName",
      placeholder: "如：省钱神券-抖音图片素材",
      agentParsed: agent("taskName"),
    },
    {
      id: "channel",
      label: "投放渠道",
      value: display(requirement.channel, ""),
      owner: "operator",
      editable: true,
      fieldKey: "channel",
      inputType: "select",
      options: CHANNEL_OPTIONS,
      agentParsed: agent("channel"),
    },
    {
      id: "media",
      label: "素材媒体",
      value: display(requirement.media ?? requirement.platform, ""),
      owner: "operator",
      editable: true,
      fieldKey: "media",
      inputType: "select",
      options: MEDIA_OPTIONS,
      agentParsed: agent("media"),
    },
    {
      id: "sizeRequirement",
      label: "尺寸要求",
      value: display(requirement.sizeRequirement, ""),
      owner: "operator",
      editable: true,
      fieldKey: "sizeRequirement",
      placeholder: "媒体自动带出",
      hint: "（媒体自动带出）",
      agentParsed: agent("sizeRequirement"),
    },
    {
      id: "creativesPerProduct",
      label: "单商品生成素材数",
      value: display(requirement.creativesPerProduct ?? (materialType === "video" ? 3 : 6)),
      owner: "operator",
      editable: true,
      fieldKey: "creativesPerProduct",
      inputType: "number",
      placeholder: materialType === "video" ? "3" : "6",
      agentParsed: agent("creativesPerProduct"),
    },
    {
      id: "landingType",
      label: "素材承接类型",
      value: display(requirement.landingType ?? "", ""),
      owner: "operator",
      editable: true,
      fieldKey: "landingType",
      inputType: "select",
      options: [{ value: "", label: "请选择" }, ...LANDING_TYPE_OPTIONS],
      agentParsed: agent("landingType"),
    },
    {
      id: "coreSummary",
      label: "核心投放总结",
      value: display(requirement.coreSummary, ""),
      owner: "operator",
      editable: true,
      fieldKey: "coreSummary",
      multiline: true,
      placeholder: "营销目标、画面风格、卖点倾向",
      agentParsed: agent("coreSummary"),
    },
    {
      id: "specialConstraints",
      label: "特殊约束备注",
      value: display(requirement.specialConstraints, ""),
      owner: "operator",
      editable: true,
      fieldKey: "specialConstraints",
      multiline: true,
      placeholder: "违禁词限制、固定 Logo、避雷要求等",
      agentParsed: agent("specialConstraints"),
    },
  ];

  return items;
}

/** 素材承接区：仅展示已确认商品清单 */
function buildMaterialLandingFields(requirement: RequirementBrief): CampaignFieldItem[] {
  return [
    {
      id: "confirmedProducts",
      label: "已确认商品",
      value: requirement.confirmedSkuIds?.length
        ? `已选 ${requirement.confirmedSkuIds.length} 个商品`
        : "待智能选品确认",
      owner: "agent",
      editable: false,
      fieldKey: "confirmedProducts",
    },
  ];
}

function buildCreativeFields(
  creative: CreativeBrief | null,
  materialType: MaterialType
): CampaignFieldItem[] {
  if (!creative) return [];

  const items: CampaignFieldItem[] = [
    {
      id: "coverTitle",
      label: materialType === "video" ? "封面标题" : "主图封题",
      value: display(creative.coverTitle),
      owner: "operator",
      editable: true,
      fieldKey: "coverTitle",
      placeholder: "主标题文案",
      agentParsed: true,
    },
    {
      id: "cta",
      label: "CTA 行动号召",
      value: display(creative.cta),
      owner: "operator",
      editable: true,
      fieldKey: "cta",
      placeholder: "如：扫码领券",
      agentParsed: true,
    },
  ];

  if (materialType === "video") {
    items.push(
      {
        id: "bgm",
        label: "BGM 配乐",
        value: display(creative.bgm),
        owner: "operator",
        editable: true,
        fieldKey: "bgm",
        placeholder: "如：节奏感强",
        agentParsed: true,
      },
      {
        id: "storyboard",
        label: "分镜结构",
        value: display(creative.storyboard),
        owner: "operator",
        editable: true,
        fieldKey: "storyboard",
        multiline: true,
        placeholder: "钩子 → 卖点 → CTA",
        agentParsed: true,
      }
    );
  }

  return items;
}

function autoCompleteFields(materialType: MaterialType): CampaignFieldItem[] {
  const typeLabel = materialType === "video" ? "视频" : "图片";
  return [
    {
      id: "auto-generate",
      label: "大模型生成",
      value: `根据上方 AI 素材方案自动生成${typeLabel}素材`,
      owner: "auto",
      editable: false,
      fieldKey: "auto-generate",
    },
    {
      id: "auto-audit",
      label: "平台规范审核",
      value: "按投放平台要求自动提交巨量引擎审核",
      owner: "auto",
      editable: false,
      fieldKey: "auto-audit",
    },
    {
      id: "auto-library",
      label: "入库投放",
      value: "审核通过后自动写入素材库，可直接投放",
      owner: "auto",
      editable: false,
      fieldKey: "auto-library",
    },
  ];
}

export function buildCampaignFieldGroups(
  campaign: CampaignSnapshot,
  materialType: MaterialType,
  agentFilled?: Set<string>
): CampaignFieldGroup[] {
  if (!campaign.requirement) return [];

  const { requirement, creative } = campaign;
  const groups: CampaignFieldGroup[] = [
    {
      id: "basic-info",
      title: "基础信息",
      description: "由需求解读自动填充，带 Agent 标识项为 AI 识别；未识别项请手动填写",
      owner: "operator",
      items: buildBasicInfoFields(requirement, materialType, agentFilled),
    },
  ];

  if (
    requirement.confirmedSkuIds?.length ||
    campaign.stage === "product_review" ||
    campaign.stage === "creative_review"
  ) {
    groups.push({
      id: "material-landing",
      title: "素材承接",
      description: "智能选品确认后的商品清单，作为批量生成基准",
      owner: "operator",
      items: buildMaterialLandingFields(requirement),
    });
  }

  const creativeItems = buildCreativeFields(creative, materialType);
  if (creativeItems.length > 0) {
    groups.push({
      id: "creative-plan",
      title: "创意方案",
      description: "基于需求与选品生成，可在左侧对话微调",
      owner: "agent",
      items: creativeItems,
    });
  }

  groups.push({
    id: "auto",
    title: "确认后 Agent 自动完成",
    description: "创意与需求确认完成后，以下步骤自动执行",
    owner: "auto",
    items: autoCompleteFields(materialType),
  });

  return groups;
}

export function applyFieldUpdates(
  requirement: RequirementBrief,
  creative: CreativeBrief | null,
  updates: Record<string, string>
): { requirement: RequirementBrief; creative: CreativeBrief | null } {
  const nextReq = { ...requirement };
  let nextCreative = creative ? { ...creative } : null;

  const reqKeys: (keyof RequirementBrief)[] = [
    "taskName",
    "channel",
    "media",
    "platform",
    "sizeRequirement",
    "visualStyle",
    "industry",
    "productKeywords",
    "sellingPoints",
    "audience",
    "promotion",
    "priceRange",
    "aspectRatio",
    "supplementNotes",
    "landingType",
    "coreSummary",
    "specialConstraints",
    "productSelectionMethod",
    "selectionStrategy",
  ];

  for (const key of reqKeys) {
    if (key in updates) {
      const raw = updates[key].trim();
      (nextReq as Record<string, unknown>)[key] = raw || undefined;
    }
  }

  if ("media" in updates && updates.media) {
    nextReq.platform = updates.media;
  }

  if ("creativesPerProduct" in updates) {
    const n = Number(updates.creativesPerProduct);
    nextReq.creativesPerProduct = Number.isFinite(n) && n > 0 ? n : undefined;
  }

  if ("selectionCount" in updates) {
    const n = Number(updates.selectionCount);
    nextReq.selectionCount = Number.isFinite(n) && n > 0 ? n : undefined;
  }

  if ("duration" in updates) {
    const m = updates.duration.match(/(\d+)/);
    nextReq.duration = m ? Number(m[1]) : undefined;
  }

  const creativeKeys: (keyof CreativeBrief)[] = [
    "coverTitle",
    "bgm",
    "cta",
    "storyboard",
    "visualStyle",
  ];
  const hasCreativeUpdate =
    creativeKeys.some((k) => k in updates) || "voiceover" in updates || "subtitle" in updates;

  if (hasCreativeUpdate && !nextCreative) {
    nextCreative = {
      bgm: "轻音乐",
      cta: "立即购买",
      coverTitle: "",
      voiceover: false,
      subtitle: true,
      visualStyle: nextReq.visualStyle ?? "",
    };
  }

  if ("visualStyle" in updates && nextCreative) {
    nextCreative.visualStyle = updates.visualStyle.trim() || nextCreative.visualStyle;
  }

  if (nextCreative) {
    for (const key of creativeKeys) {
      if (key in updates && key !== "visualStyle") {
        const raw = updates[key].trim();
        (nextCreative as Record<string, unknown>)[key] = raw || undefined;
      }
    }
    if ("voiceover" in updates) {
      nextCreative.voiceover = updates.voiceover === "是";
    }
    if ("subtitle" in updates) {
      nextCreative.subtitle = updates.subtitle === "是";
    }
  }

  return { requirement: nextReq, creative: nextCreative };
}
