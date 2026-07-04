/** 知识库一级分区（与创作页图片/视频对齐） */
export type KnowledgePartition = "image" | "video";

/** 视频知识库 · 10 大子库 */
export type VideoSubLibrary =
  | "channel-rules"
  | "digital-avatar"
  | "brand-assets"
  | "risk-control"
  | "bgm"
  | "transitions"
  | "voice"
  | "subtitle-templates"
  | "lens-scripts"
  | "copy-scripts";

/** 图片知识库 · 10 大子库 */
export type ImageSubLibrary =
  | "channel-rules"
  | "brand-assets"
  | "risk-control"
  | "product-assets"
  | "visual-styles"
  | "composition-templates"
  | "copy-layout"
  | "decorations"
  | "scene-assets"
  | "selling-copy";

export type KnowledgeSubLibrary = VideoSubLibrary | ImageSubLibrary;

export type KnowledgeStatus = "active" | "disabled" | "pending" | "expired";

export type QualityTag =
  | "hit-saved"
  | "official-recommend"
  | "high-conversion"
  | "newly-added";

export interface KnowledgeSubLibraryGroup {
  id: KnowledgeSubLibrary;
  label: string;
  description: string;
}

export interface KnowledgeEntry {
  id: string;
  /** 运营可见知识库 ID */
  knowledgeId: string;
  partition: KnowledgePartition;
  subLibrary: KnowledgeSubLibrary;
  title: string;
  channels: string[];
  brand: string;
  industries: string[];
  qualityTags: QualityTag[];
  summary: string;
  content: string;
  remark?: string;
  tags: string[];
  status: KnowledgeStatus;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  usageCount: number;
  version: number;
}

export interface KnowledgeQuery {
  partition: KnowledgePartition;
  search?: string;
  knowledgeId?: string;
  subLibrary?: KnowledgeSubLibrary | "all";
  channel?: string;
  brand?: string;
  industry?: string;
  status?: KnowledgeStatus | "all";
  qualityTag?: QualityTag | "all";
  datePreset?: "all" | "7d" | "30d";
  dateFrom?: string;
  dateTo?: string;
}

export const VIDEO_SUB_LIBRARIES: KnowledgeSubLibraryGroup[] = [
  { id: "channel-rules", label: "频道规则库", description: "各投放频道创作规则、内容偏好与禁忌" },
  { id: "digital-avatar", label: "数字人资源库", description: "优质数字人形象、人设与出镜节奏" },
  { id: "brand-assets", label: "品牌资产库", description: "LOGO、配色、字体、Slogan 与口播规范" },
  { id: "risk-control", label: "风险控制库", description: "禁用话术、违规画面与审核驳回案例" },
  { id: "bgm", label: "BGM 素材库", description: "高转化背景音乐，节奏与场景标签" },
  { id: "transitions", label: "转场特效库", description: "转场类型与镜头节奏适配方案" },
  { id: "voice", label: "音色配音库", description: "带货/种草场景 AI 音色沉淀" },
  { id: "subtitle-templates", label: "字幕模板库", description: "字幕样式、排版与文案框架" },
  { id: "lens-scripts", label: "视频镜头脚本库", description: "爆款镜头结构、运镜与剧情脚本" },
  { id: "copy-scripts", label: "视频文案话术库", description: "口播、卖点、CTA 高转化话术" },
];

export const IMAGE_SUB_LIBRARIES: KnowledgeSubLibraryGroup[] = [
  { id: "channel-rules", label: "频道规则库", description: "各渠道图片高起量特征与审核规则" },
  { id: "brand-assets", label: "品牌资产库", description: "LOGO 位置、配色、装饰与禁用样式" },
  { id: "risk-control", label: "风险控制库", description: "违规构图、文字与低质图特征" },
  { id: "product-assets", label: "商品素材库", description: "高清商品底图、场景图与细节图" },
  { id: "visual-styles", label: "视觉风格库", description: "促销/种草/极简等爆款视觉风格" },
  { id: "composition-templates", label: "构图模板库", description: "高转化海报构图结构模板" },
  { id: "copy-layout", label: "文案排版库", description: "字体组合、字号层级与卖点排版" },
  { id: "decorations", label: "装饰元素库", description: "贴纸、边框、氛围与营销标签" },
  { id: "scene-assets", label: "场景素材库", description: "真实/纯色/质感背景场景素材" },
  { id: "selling-copy", label: "图片卖点话术库", description: "短卖点、标题与 CTA 标签文案" },
];

export const CHANNEL_OPTIONS = [
  { value: "all", label: "全渠道通用" },
  { value: "douyin", label: "抖音" },
  { value: "kuaishou", label: "快手" },
  { value: "xiaohongshu", label: "小红书" },
  { value: "moments", label: "朋友圈" },
  { value: "channels", label: "视频号" },
];

export const BRAND_OPTIONS = [
  { value: "all", label: "全部品牌" },
  { value: "shenquan", label: "省钱神券" },
  { value: "platform", label: "平台通用" },
];

export const INDUSTRY_OPTIONS = [
  { value: "all", label: "全类目通用" },
  { value: "3c", label: "3C 数码" },
  { value: "beauty", label: "美妆护肤" },
  { value: "food", label: "食品生鲜" },
  { value: "home", label: "家居日用" },
  { value: "fashion", label: "服饰鞋包" },
];

export const STATUS_OPTIONS: { value: KnowledgeStatus | "all"; label: string }[] = [
  { value: "all", label: "全部状态" },
  { value: "active", label: "启用" },
  { value: "disabled", label: "停用" },
  { value: "pending", label: "待审核" },
  { value: "expired", label: "已过期" },
];

export const QUALITY_TAG_OPTIONS: { value: QualityTag | "all"; label: string }[] = [
  { value: "all", label: "全部标签" },
  { value: "hit-saved", label: "爆款沉淀" },
  { value: "official-recommend", label: "官方推荐" },
  { value: "high-conversion", label: "高转化" },
  { value: "newly-added", label: "新收录" },
];

export const STATUS_LABELS: Record<KnowledgeStatus, string> = {
  active: "启用",
  disabled: "停用",
  pending: "待审核",
  expired: "已过期",
};

export const QUALITY_TAG_LABELS: Record<QualityTag, string> = {
  "hit-saved": "爆款沉淀",
  "official-recommend": "官方推荐",
  "high-conversion": "高转化",
  "newly-added": "新收录",
};

export function getSubLibraries(partition: KnowledgePartition): KnowledgeSubLibraryGroup[] {
  return partition === "video" ? VIDEO_SUB_LIBRARIES : IMAGE_SUB_LIBRARIES;
}

export function getSubLibraryLabel(partition: KnowledgePartition, id: KnowledgeSubLibrary): string {
  return getSubLibraries(partition).find((g) => g.id === id)?.label ?? id;
}

export function getChannelLabel(value: string): string {
  return CHANNEL_OPTIONS.find((c) => c.value === value)?.label ?? value;
}

export function getBrandLabel(value: string): string {
  return BRAND_OPTIONS.find((b) => b.value === value)?.label ?? value;
}

export function getIndustryLabel(value: string): string {
  return INDUSTRY_OPTIONS.find((i) => i.value === value)?.label ?? value;
}

export function isSubLibraryForPartition(
  partition: KnowledgePartition,
  subLibrary: KnowledgeSubLibrary
): boolean {
  const libs = getSubLibraries(partition);
  return libs.some((g) => g.id === subLibrary);
}
