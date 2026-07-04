import type { ImageCreativePlanFields, RequirementBrief, VideoCreativePlanFields } from "@/lib/campaign/types";

export const REQUIREMENT_FIELD_LABELS: Partial<Record<keyof RequirementBrief, string>> = {
  taskName: "任务名称",
  channel: "投放渠道",
  media: "投放媒体",
  platform: "投放平台",
  landingType: "素材承接类型",
  productSelectionMethod: "选品方式",
  selectionCount: "选品数量",
  selectionStrategy: "选品策略",
  productKeywords: "产品关键词",
  productDataPool: "商品数据池",
  pickMethod: "选品方法",
  selectionCoreStrategy: "选品核心策略",
  hasBenefitRights: "权益标签",
  adTheme: "广告主题",
  campaignGoal: "投放目标",
  targetAudience: "核心投放人群",
  userPainPoints: "用户核心痛点",
  coreBenefit: "核心利益点",
  visualStyle: "整体视觉风格",
  contentTone: "内容调性",
  coreSummary: "核心总结",
  specialConstraints: "特殊约束",
  sizeRequirement: "尺寸要求",
  creativesPerProduct: "单商品生成素材数",
  sellingPoints: "核心卖点",
  audience: "目标人群",
  promotion: "促销节点",
  priceRange: "价格区间",
  aspectRatio: "画面比例",
  supplementNotes: "补充说明",
  confirmedSkuIds: "已选商品 ID",
  autoSubtitle: "是否自动生成字幕",
  videoDurationTier: "视频时长档位",
};

export const CREATIVE_FIELD_LABELS: Record<keyof ImageCreativePlanFields, string> = {
  creativeAtmosphere: "整体创意氛围",
  mainTitle: "主标题",
  subTitle: "副标题",
  ctaTitle: "CTA 行动标题",
  visualThemeForm: "画面主题形式",
  productDisplayForm: "商品展示形态",
  sceneEnvironment: "场景环境",
  lightingTexture: "画面光影 & 质感",
  creativeStoryKernel: "创意描述",
};

export const VIDEO_CREATIVE_FIELD_LABELS: Record<keyof VideoCreativePlanFields, string> = {
  creativeAtmosphere: "整体创意氛围",
  mainTitle: "主标题",
  subTitle: "副标题",
  ctaTitle: "CTA 行动标题",
  sceneEnvironment: "场景环境",
  lensCompositionForm: "镜头组合形式",
  cameraMovement: "运镜方式",
  cutFrequency: "镜头切换频率",
  videoPlotStructure: "视频剧情结构",
  coreLensFocus: "核心镜头侧重",
  voiceoverStyle: "口播文案风格",
  dynamicLighting: "动态光影变化",
  dynamicVisualEffect: "画面动态效果",
  creativeStoryKernel: "创意描述",
  fullVideoScript: "完整剧情脚本",
};

export const VIDEO_CREATIVE_FIELD_KEYS: (keyof VideoCreativePlanFields)[] = [
  "creativeAtmosphere",
  "mainTitle",
  "subTitle",
  "ctaTitle",
  "sceneEnvironment",
  "lensCompositionForm",
  "cameraMovement",
  "cutFrequency",
  "videoPlotStructure",
  "coreLensFocus",
  "voiceoverStyle",
  "dynamicLighting",
  "dynamicVisualEffect",
  "creativeStoryKernel",
  "fullVideoScript",
];

export const NATIVE_REQUIREMENT_KEYS: (keyof RequirementBrief)[] = [
  "taskName",
  "channel",
  "media",
  "landingType",
  "productSelectionMethod",
  "selectionCount",
  "selectionStrategy",
  "productKeywords",
  "productDataPool",
  "pickMethod",
  "adTheme",
  "campaignGoal",
  "targetAudience",
  "userPainPoints",
  "coreBenefit",
  "visualStyle",
  "contentTone",
  "coreSummary",
  "specialConstraints",
  "sizeRequirement",
  "sellingPoints",
  "confirmedSkuIds",
  "autoSubtitle",
  "videoDurationTier",
];

export const CREATIVE_FIELD_KEYS: (keyof ImageCreativePlanFields)[] = [
  "creativeAtmosphere",
  "mainTitle",
  "subTitle",
  "ctaTitle",
  "visualThemeForm",
  "productDisplayForm",
  "sceneEnvironment",
  "lightingTexture",
  "creativeStoryKernel",
];

export function formatFieldValue(value: unknown): string {
  if (value === undefined || value === null || value === "") return "—";
  if (Array.isArray(value)) return value.join("、");
  if (typeof value === "boolean") return value ? "是" : "否";
  return String(value);
}
