import type { MaterialType } from "@/lib/types";

export type CampaignStage =
  | "intent"
  | "confirm"
  | "requirement_review"
  | "product_review"
  | "creative_review"
  | "generating"
  | "external_review"
  | "completed"
  | "rejected";

export type MaterialLifecycleStatus =
  | "draft"
  | "generating"
  | "pending_external_review"
  | "approved"
  | "rejected"
  | "in_library";

export interface SelectionRules {
  categories: string[];
  tagsAny?: string[];
  priceMin?: number;
  priceMax?: number;
  promoPool?: string;
}

export interface CreativeDefaults {
  duration?: number;
  aspectRatio?: string;
  bgm?: string;
  cta?: string;
  coverTitle?: string;
  voiceover?: boolean;
  subtitle?: boolean;
  platform?: string;
}

export interface BusinessTemplate {
  id: string;
  name: string;
  description: string;
  keywords: string[];
  materialType: MaterialType;
  platform: string;
  industry: string;
  selectionRules: SelectionRules;
  creativeDefaults: CreativeDefaults;
}

export interface RequirementBrief {
  templateId: string;
  templateName: string;
  platform: string;
  industry: string;
  materialType: MaterialType;
  productKeywords: string;
  sellingPoints: string;
  /** 基础信息 */
  taskName?: string;
  channel?: string;
  media?: string;
  sizeRequirement?: string;
  creativesPerProduct?: number;
  visualStyle?: string;
  /** 素材承接 */
  landingType?: string;
  productSelectionMethod?: string;
  selectionCount?: number;
  selectionStrategy?: string;
  /** 核心投放总结（解读面板） */
  coreSummary?: string;
  /** 特殊约束备注 */
  specialConstraints?: string;
  /** 已确认选品 ID 列表 */
  confirmedSkuIds?: string[];
  audience?: string;
  promotion?: string;
  priceRange?: string;
  duration?: number;
  aspectRatio?: string;
  supplementNotes?: string;
  /** ── AI 原生图片链路：用户可控创意变量 ── */
  adTheme?: string;
  campaignGoal?: string;
  targetAudience?: string;
  userPainPoints?: string;
  coreBenefit?: string;
  contentTone?: string;
  /** 静默映射字段（后台填充，不在需求确认面板展示） */
  silentUserTags?: string;
  silentComplianceBaseline?: string;
  /** 视频静默：渠道内容规范 */
  silentVideoContentSpec?: string;
  /** 视频静默：渠道原生视频偏好 */
  silentVideoNativePreference?: string;
  /** ── AI 原生视频链路 ── */
  autoSubtitle?: string;
  videoDurationTier?: string;
  /** ── 智能选品扩展 ── */
  productDataPool?: string;
  categoryName?: string;
  categoryId?: string;
  pickMethod?: string;
  selectionCoreStrategy?: string;
  hasBenefitRights?: string;
}

export interface SkuRecord {
  id: string;
  skuCode: string;
  name: string;
  category: string;
  tags: string[];
  price: number;
  imageUrl?: string;
  promoPool?: string;
  stock: number;
  status?: string;
  /** 近 30 天销量（演示） */
  sales30d?: number;
  /** 转化标签（演示） */
  cvrTag?: string;
}

export interface ProductRecommendation {
  sku: SkuRecord;
  score: number;
  reason: string;
}

export interface CreativeBrief {
  storyboard?: string;
  bgm: string;
  cta: string;
  coverTitle: string;
  voiceover: boolean;
  subtitle: boolean;
  visualStyle?: string;
}

/** 创意方案单模块详情 */
export interface CreativePlanSection {
  moduleId: string;
  title: string;
  rationale: string;
  items: { label: string; value: string }[];
}

/** AI 原生图片创意方案结构化字段 */
export interface ImageCreativePlanFields {
  creativeAtmosphere: string;
  mainTitle: string;
  subTitle: string;
  ctaTitle: string;
  visualThemeForm: string;
  productDisplayForm: string;
  sceneEnvironment: string;
  lightingTexture: string;
  /** 创意描述 */
  creativeStoryKernel: string;
}

/** AI 原生视频创意方案结构化字段 */
export interface VideoCreativePlanFields {
  creativeAtmosphere: string;
  mainTitle: string;
  subTitle: string;
  ctaTitle: string;
  sceneEnvironment: string;
  lensCompositionForm: string;
  cameraMovement: string;
  cutFrequency: string;
  videoPlotStructure: string;
  coreLensFocus: string;
  voiceoverStyle: string;
  dynamicLighting: string;
  dynamicVisualEffect: string;
  creativeStoryKernel: string;
  fullVideoScript: string;
}

/** 创意生成完整包：含详细方案 + 全量配置回填 + Agent 标识字段 */
export interface CreativePlanPackage {
  brief: CreativeBrief;
  /** 短摘要（列表/对话用） */
  summary: string;
  /** Agent 生成的长文创意描述（选品确认后展示） */
  narrative: string;
  sections: CreativePlanSection[];
  imageConfig?: import("@/lib/create/config-types").ImageCreationConfig;
  videoConfig?: import("@/lib/create/config-types").VideoCreationConfig;
  /** 图片原生链路结构化创意字段 */
  imageCreative?: ImageCreativePlanFields;
  /** 视频原生链路结构化创意字段 */
  videoCreative?: VideoCreativePlanFields;
  agentFilledFields: string[];
  /** 是否已通过「一键配置」写入下方面板（客户端状态，可选持久化） */
  configApplied?: boolean;
}

export interface AgentMessage {
  id: string;
  role: "user" | "agent";
  content: string;
  createdAt: string;
}

export interface CampaignSnapshot {
  id: string;
  stage: CampaignStage;
  templateId: string;
  userIntent: string;
  requirement: RequirementBrief | null;
  recommendations: ProductRecommendation[];
  selectedSkuId: string | null;
  selectedSku: SkuRecord | null;
  creative: CreativeBrief | null;
  creativePlan: CreativePlanPackage | null;
  messages: AgentMessage[];
  materialId?: string;
  auditStatus?: string;
  rejectReason?: string;
}
