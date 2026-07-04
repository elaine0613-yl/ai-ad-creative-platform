/** 素材库一级分区（与知识库、创作中心对齐） */
export type MaterialPartition = "image" | "video";

/** 生成模式 */
export type GenerateMode = "native" | "replicate";

/** 素材状态 */
export type ArchiveMaterialStatus = "normal" | "violation" | "pending_review";

/** 图片专属 */
export type ImageAspectRatio = "9:16" | "1:1" | "3:4" | "16:9";
export type ImageVisualStyle = "minimal" | "promo" | "lifestyle" | "guofeng" | "realistic";
export type ImageSceneType = "product-closeup" | "scene-seeding" | "multi-product" | "minimal-poster";

/** 视频专属 */
export type VideoDurationTier = "15s" | "30s" | "60s" | "custom";
export type VideoPace = "fast" | "slow" | "steady";
export type VideoType = "story-seeding" | "review" | "promo" | "detail-showcase";

export interface CreativeTrace {
  requirement: Record<string, string>;
  creative: Record<string, string>;
  knowledgeRefs: string[];
}

export interface AuditInfo {
  status: "passed" | "failed";
  auditedAt: string;
  reason?: string;
}

export interface OperationRecord {
  action: string;
  operator: string;
  at: string;
}

/** 成品素材归档条目 */
export interface ArchiveMaterial {
  id: string;
  materialId: string;
  name: string;
  partition: MaterialPartition;
  thumbnailUrl?: string;
  previewColor?: string;
  url?: string;
  generateMode: GenerateMode;
  channel: string;
  brand: string;
  industry: string;
  createdAt: string;
  aiTags: string[];
  taskId: string;
  taskName: string;
  productName: string;
  sellingPoints?: string;
  status: ArchiveMaterialStatus;
  aspectRatio?: ImageAspectRatio;
  visualStyle?: ImageVisualStyle;
  sceneType?: ImageSceneType;
  width?: number;
  height?: number;
  durationSec?: number;
  durationTier?: VideoDurationTier;
  pace?: VideoPace;
  hasSubtitle?: boolean;
  videoType?: VideoType;
  creativeTrace: CreativeTrace;
  audit: AuditInfo;
  operationRecords: OperationRecord[];
  exportRecords: OperationRecord[];
  fileSize?: string;
  fileFormat?: string;
}

export interface ArchiveMaterialQuery {
  partition: MaterialPartition;
  search?: string;
  generateMode?: GenerateMode | "all";
  channel?: string;
  brand?: string;
  industry?: string;
  status?: ArchiveMaterialStatus | "all";
  aiTag?: string;
  taskId?: string;
  datePreset?: "all" | "1d" | "7d" | "30d";
  dateFrom?: string;
  dateTo?: string;
  aspectRatio?: ImageAspectRatio | "all";
  visualStyle?: ImageVisualStyle | "all";
  sceneType?: ImageSceneType | "all";
  durationTier?: VideoDurationTier | "all";
  pace?: VideoPace | "all";
  hasSubtitle?: "all" | "yes" | "no";
  videoType?: VideoType | "all";
}

export const GENERATE_MODE_OPTIONS = [
  { value: "all", label: "全部模式" },
  { value: "native", label: "AI原生素材" },
  { value: "replicate", label: "爆款复刻素材" },
] as const;

export const CHANNEL_OPTIONS = [
  { value: "all", label: "全部渠道" },
  { value: "douyin", label: "抖音" },
  { value: "kuaishou", label: "快手" },
  { value: "xiaohongshu", label: "小红书" },
  { value: "moments", label: "朋友圈" },
];

export const BRAND_OPTIONS = [
  { value: "all", label: "全部品牌" },
  { value: "shenquan", label: "省钱神券" },
  { value: "platform", label: "平台通用" },
];

export const INDUSTRY_OPTIONS = [
  { value: "all", label: "全部类目" },
  { value: "3c", label: "3C 数码" },
  { value: "beauty", label: "美妆护肤" },
  { value: "food", label: "食品生鲜" },
  { value: "home", label: "家居日用" },
  { value: "fashion", label: "服饰鞋包" },
];

export const STATUS_OPTIONS = [
  { value: "all", label: "全部状态" },
  { value: "normal", label: "正常" },
  { value: "violation", label: "违规" },
  { value: "pending_review", label: "待复核" },
] as const;

export const AI_TAG_OPTIONS = [
  { value: "all", label: "全部标签" },
  { value: "高匹配度", label: "高匹配度" },
  { value: "促销风", label: "促销风" },
  { value: "种草风", label: "种草风" },
  { value: "高清优质", label: "高清优质" },
  { value: "短视频快剪", label: "短视频快剪" },
];

export const IMAGE_ASPECT_OPTIONS = [
  { value: "all", label: "全部尺寸" },
  { value: "9:16", label: "9:16 竖版" },
  { value: "1:1", label: "1:1 方形" },
  { value: "3:4", label: "3:4" },
  { value: "16:9", label: "16:9 横版" },
] as const;

export const IMAGE_STYLE_OPTIONS = [
  { value: "all", label: "全部风格" },
  { value: "minimal", label: "简约高级" },
  { value: "promo", label: "热闹促销" },
  { value: "lifestyle", label: "生活化种草" },
  { value: "guofeng", label: "国风" },
  { value: "realistic", label: "写实实拍" },
] as const;

export const IMAGE_SCENE_OPTIONS = [
  { value: "all", label: "全部类型" },
  { value: "product-closeup", label: "商品特写" },
  { value: "scene-seeding", label: "场景种草" },
  { value: "multi-product", label: "多品组合" },
  { value: "minimal-poster", label: "极简海报" },
] as const;

export const VIDEO_DURATION_OPTIONS = [
  { value: "all", label: "全部时长" },
  { value: "15s", label: "15s" },
  { value: "30s", label: "30s" },
  { value: "60s", label: "60s" },
  { value: "custom", label: "自定义" },
] as const;

export const VIDEO_PACE_OPTIONS = [
  { value: "all", label: "全部节奏" },
  { value: "fast", label: "快节奏营销" },
  { value: "slow", label: "慢节奏种草" },
  { value: "steady", label: "匀速日常" },
] as const;

export const VIDEO_TYPE_OPTIONS = [
  { value: "all", label: "全部类型" },
  { value: "story-seeding", label: "剧情种草" },
  { value: "review", label: "产品测评" },
  { value: "promo", label: "福利促销" },
  { value: "detail-showcase", label: "细节展示" },
] as const;

export const GENERATE_MODE_LABELS: Record<GenerateMode, string> = {
  native: "AI原生素材",
  replicate: "爆款复刻素材",
};

export const STATUS_LABELS: Record<ArchiveMaterialStatus, string> = {
  normal: "正常",
  violation: "违规",
  pending_review: "待复核",
};

export const IMAGE_STYLE_LABELS: Record<ImageVisualStyle, string> = {
  minimal: "简约高级",
  promo: "热闹促销",
  lifestyle: "生活化种草",
  guofeng: "国风",
  realistic: "写实实拍",
};

export const IMAGE_SCENE_LABELS: Record<ImageSceneType, string> = {
  "product-closeup": "商品特写",
  "scene-seeding": "场景种草",
  "multi-product": "多品组合",
  "minimal-poster": "极简海报",
};

export const VIDEO_PACE_LABELS: Record<VideoPace, string> = {
  fast: "快节奏营销",
  slow: "慢节奏种草",
  steady: "匀速日常",
};

export const VIDEO_TYPE_LABELS: Record<VideoType, string> = {
  "story-seeding": "剧情种草",
  review: "产品测评",
  promo: "福利促销",
  "detail-showcase": "细节展示",
};

export function getChannelLabel(value: string): string {
  return CHANNEL_OPTIONS.find((c) => c.value === value)?.label ?? value;
}

export function getBrandLabel(value: string): string {
  return BRAND_OPTIONS.find((b) => b.value === value)?.label ?? value;
}

export function getIndustryLabel(value: string): string {
  return INDUSTRY_OPTIONS.find((i) => i.value === value)?.label ?? value;
}

/** @deprecated 旧素材库类型别名，仅供历史引用 */
export type MaterialLibraryTab = MaterialPartition;
export type MaterialCatalogAsset = ArchiveMaterial;
