import type { CampaignSnapshot, CreativeBrief, RequirementBrief } from "./types";
import { applySilentChannelFields, applySilentVideoChannelFields } from "./silent-fields";
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

export const AD_THEME_OPTIONS = [
  { value: "", label: "请选择" },
  { value: "节日主题", label: "节日主题" },
  { value: "日常促销", label: "日常促销" },
  { value: "新品上市", label: "新品上市" },
  { value: "达人种草", label: "达人种草" },
  { value: "福利秒杀", label: "福利秒杀" },
];

export const CAMPAIGN_GOAL_OPTIONS = [
  { value: "", label: "请选择" },
  { value: "拉新引流", label: "拉新引流" },
  { value: "促进转化", label: "促进转化" },
  { value: "提升点击", label: "提升点击" },
  { value: "品牌曝光", label: "品牌曝光" },
];

export const VISUAL_STYLE_OPTIONS = [
  { value: "", label: "请选择" },
  { value: "简约高级", label: "简约高级" },
  { value: "热闹促销", label: "热闹促销" },
  { value: "生活化种草", label: "生活化种草" },
  { value: "国风", label: "国风" },
  { value: "轻奢", label: "轻奢" },
  { value: "接地气市井风", label: "接地气市井风" },
];

export const CONTENT_TONE_OPTIONS = [
  { value: "", label: "请选择" },
  { value: "温和种草", label: "温和种草" },
  { value: "强营销逼单", label: "强营销逼单" },
  { value: "趣味生活化", label: "趣味生活化" },
  { value: "专业测评", label: "专业测评" },
];

export const PRODUCT_DATA_POOL_OPTIONS = [
  { value: "平台大盘热销池", label: "平台大盘热销池" },
  { value: "频道权益商品池", label: "频道权益商品池" },
  { value: "自营商品池", label: "自营商品池" },
];

export const PICK_METHOD_OPTIONS = [
  { value: "AI 智能优选", label: "AI 智能优选" },
  { value: "热度优先", label: "热度优先" },
  { value: "转化率优先", label: "转化率优先" },
  { value: "新品优先", label: "新品优先" },
];

export const SELECTION_COUNT_PRESETS = [
  { value: "1", label: "1 组" },
  { value: "3", label: "3 组" },
  { value: "5", label: "5 组" },
  { value: "10", label: "10 组" },
];

function display(value: string | number | boolean | undefined | null, fallback = "待补充"): string {
  if (value === undefined || value === null || value === "") return fallback;
  if (typeof value === "boolean") return value ? "是" : "否";
  return String(value);
}

function buildImageNativeConfirmFields(
  requirement: RequirementBrief,
  agentFilled?: Set<string>
): CampaignFieldItem[] {
  const agent = (key: string) => agentFilled?.has(key) ?? false;

  return [
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
      label: "投放媒体",
      value: display(requirement.media ?? requirement.platform, ""),
      owner: "operator",
      editable: true,
      fieldKey: "media",
      inputType: "select",
      options: MEDIA_OPTIONS,
      agentParsed: agent("media"),
      hint: "（尺寸/合规后台自动映射）",
    },
    {
      id: "adTheme",
      label: "广告主题",
      value: display(requirement.adTheme, ""),
      owner: "operator",
      editable: true,
      fieldKey: "adTheme",
      inputType: "select",
      options: AD_THEME_OPTIONS,
      agentParsed: agent("adTheme"),
    },
    {
      id: "campaignGoal",
      label: "投放目标",
      value: display(requirement.campaignGoal, ""),
      owner: "operator",
      editable: true,
      fieldKey: "campaignGoal",
      inputType: "select",
      options: CAMPAIGN_GOAL_OPTIONS,
      agentParsed: agent("campaignGoal"),
    },
    {
      id: "targetAudience",
      label: "核心投放人群",
      value: display(requirement.targetAudience ?? requirement.audience, ""),
      owner: "operator",
      editable: true,
      fieldKey: "targetAudience",
      placeholder: "年龄/性别/消费层级/使用场景",
      agentParsed: agent("targetAudience"),
    },
    {
      id: "userPainPoints",
      label: "用户核心痛点",
      value: display(requirement.userPainPoints, ""),
      owner: "operator",
      editable: true,
      fieldKey: "userPainPoints",
      multiline: true,
      placeholder: "AI 从需求中提炼，用于匹配创意剧情",
      agentParsed: agent("userPainPoints"),
    },
    {
      id: "coreBenefit",
      label: "核心利益点",
      value: display(requirement.coreBenefit, ""),
      owner: "operator",
      editable: true,
      fieldKey: "coreBenefit",
      placeholder: "优惠券、低价、赠品、限时秒杀等",
      agentParsed: agent("coreBenefit"),
    },
    {
      id: "visualStyle",
      label: "整体视觉风格",
      value: display(requirement.visualStyle, ""),
      owner: "operator",
      editable: true,
      fieldKey: "visualStyle",
      inputType: "select",
      options: VISUAL_STYLE_OPTIONS,
      agentParsed: agent("visualStyle"),
    },
    {
      id: "contentTone",
      label: "内容调性",
      value: display(requirement.contentTone, ""),
      owner: "operator",
      editable: true,
      fieldKey: "contentTone",
      inputType: "select",
      options: CONTENT_TONE_OPTIONS,
      agentParsed: agent("contentTone"),
    },
  ];
}

const AUTO_SUBTITLE_OPTIONS = [
  { value: "开启", label: "开启" },
  { value: "关闭", label: "关闭" },
];

const VIDEO_DURATION_OPTIONS = [
  { value: "15s", label: "15s" },
  { value: "30s", label: "30s" },
  { value: "45s", label: "45s" },
];

function buildVideoNativeConfirmFields(
  requirement: RequirementBrief,
  agentFilled?: Set<string>
): CampaignFieldItem[] {
  const agent = (key: string) => agentFilled?.has(key) ?? false;
  return [
    ...buildImageNativeConfirmFields(requirement, agentFilled),
    {
      id: "autoSubtitle",
      label: "是否自动生成字幕",
      value: display(requirement.autoSubtitle ?? "开启", ""),
      owner: "operator",
      editable: true,
      fieldKey: "autoSubtitle",
      inputType: "select",
      options: AUTO_SUBTITLE_OPTIONS,
      agentParsed: agent("autoSubtitle"),
    },
    {
      id: "videoDurationTier",
      label: "视频时长档位",
      value: display(requirement.videoDurationTier ?? "15s", ""),
      owner: "operator",
      editable: true,
      fieldKey: "videoDurationTier",
      inputType: "select",
      options: VIDEO_DURATION_OPTIONS,
      agentParsed: agent("videoDurationTier"),
    },
  ];
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
  agentFilled?: Set<string>,
  nativeDemoFlow = false
): CampaignFieldGroup[] {
  if (!campaign.requirement) return [];

  const { requirement, creative } = campaign;
  const isVideoNative = nativeDemoFlow && materialType === "video";
  const groups: CampaignFieldGroup[] = [
    {
      id: "basic-info",
      title: nativeDemoFlow ? "需求确认" : "基础信息",
      description: nativeDemoFlow
        ? "AI 已拆解诉求并填入下方字段；渠道尺寸与合规基线已在后台静默映射"
        : "由需求解读自动填充；未识别项请手动填写",
      owner: "operator",
      items: nativeDemoFlow
        ? isVideoNative
          ? buildVideoNativeConfirmFields(requirement, agentFilled)
          : buildImageNativeConfirmFields(requirement, agentFilled)
        : buildBasicInfoFields(requirement, materialType, agentFilled),
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

  if (!nativeDemoFlow) {
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
  }

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
    "adTheme",
    "campaignGoal",
    "targetAudience",
    "userPainPoints",
    "coreBenefit",
    "contentTone",
    "autoSubtitle",
    "videoDurationTier",
    "productDataPool",
    "categoryName",
    "categoryId",
    "pickMethod",
    "selectionCoreStrategy",
    "hasBenefitRights",
  ];

  for (const key of reqKeys) {
    if (key in updates) {
      const raw = updates[key].trim();
      (nextReq as Record<string, unknown>)[key] = raw || undefined;
    }
  }

  if ("media" in updates && updates.media) {
    nextReq.platform = updates.media;
    if (nextReq.materialType === "video") {
      Object.assign(nextReq, applySilentVideoChannelFields(nextReq, updates.media));
    } else {
      Object.assign(nextReq, applySilentChannelFields(nextReq, updates.media));
    }
  }

  if ("targetAudience" in updates && updates.targetAudience) {
    nextReq.audience = updates.targetAudience;
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
