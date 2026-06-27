/** 知识库一级分类（固定 6 类） */
export type KnowledgeTopCategory =
  | "brand-vi"
  | "prompt"
  | "channel-rules"
  | "industry-strategy"
  | "structure-paradigm"
  | "review-insights";

export type KnowledgeVisibility = "private" | "team" | "public";
export type KnowledgeStatus = "active" | "disabled";
export type KnowledgePriority = "high" | "medium" | "low";

export interface KnowledgeCategoryGroup {
  id: KnowledgeTopCategory;
  label: string;
  description: string;
  subTopics: { id: string; label: string }[];
}

export interface KnowledgeEntry {
  id: string;
  title: string;
  topCategory: KnowledgeTopCategory;
  subTopicId?: string;
  channels: string[];
  industries: string[];
  priority: KnowledgePriority;
  summary: string;
  content: string;
  tags: string[];
  visibility: KnowledgeVisibility;
  status: KnowledgeStatus;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  usageCount: number;
  version: number;
}

export const KNOWLEDGE_TOP_CATEGORIES: KnowledgeCategoryGroup[] = [
  {
    id: "brand-vi",
    label: "品牌 VI 规范约束",
    description: "LOGO、色彩、文案口径与画面约束",
    subTopics: [
      { id: "logo-rules", label: "LOGO 使用约束" },
      { id: "color-rules", label: "品牌色彩规范" },
      { id: "copy-tone", label: "品牌文案口径" },
      { id: "visual-constraints", label: "品牌画面约束" },
    ],
  },
  {
    id: "prompt",
    label: "AI 生成提示词",
    description: "正向描述、风格句式、负面规避与券专项 Prompt",
    subTopics: [
      { id: "industry-prompt", label: "分行业正向描述" },
      { id: "style-prompt", label: "视觉风格句式" },
      { id: "negative-prompt", label: "负面规避词库" },
      { id: "coupon-prompt", label: "优惠券专项 Prompt" },
    ],
  },
  {
    id: "channel-rules",
    label: "投放渠道规则",
    description: "平台硬性规范、广告合规与渠道偏好",
    subTopics: [
      { id: "platform-spec", label: "平台硬性规范" },
      { id: "compliance", label: "广告合规规则" },
      { id: "channel-preference", label: "渠道素材偏好" },
    ],
  },
  {
    id: "industry-strategy",
    label: "行业 & 活动运营策略",
    description: "品类卖点、券活动打法与定价表达",
    subTopics: [
      { id: "selling-points", label: "品类卖点话术" },
      { id: "coupon-tactics", label: "优惠券活动打法" },
      { id: "pricing-copy", label: "商品定价表达规范" },
    ],
  },
  {
    id: "structure-paradigm",
    label: "素材结构范式",
    description: "外投图构图、15s 脚本与 CTA 规范",
    subTopics: [
      { id: "image-structure", label: "外投图片构图规范" },
      { id: "video-script", label: "15s 四段式脚本" },
      { id: "cta-design", label: "转化引导与 CTA 规范" },
    ],
  },
  {
    id: "review-insights",
    label: "投放效果复盘",
    description: "高点击经验、踩坑记录与 A/B 结论",
    subTopics: [
      { id: "success-cases", label: "高点击成功经验" },
      { id: "failure-cases", label: "低效素材踩坑" },
      { id: "ab-conclusions", label: "A/B 测试结论" },
    ],
  },
];

export const CHANNEL_OPTIONS = [
  { value: "all", label: "全渠道通用" },
  { value: "douyin", label: "抖音" },
  { value: "channels", label: "视频号" },
  { value: "xiaohongshu", label: "小红书" },
];

export const INDUSTRY_OPTIONS = [
  { value: "all", label: "全行业通用" },
  { value: "3c", label: "3C" },
  { value: "beauty", label: "美妆" },
  { value: "food", label: "食品" },
  { value: "home", label: "家居" },
];

export const VISIBILITY_LABELS: Record<KnowledgeVisibility, string> = {
  private: "个人私有",
  team: "团队共享",
  public: "平台公共",
};

export const PRIORITY_LABELS: Record<KnowledgePriority, string> = {
  high: "高",
  medium: "中",
  low: "低",
};

export function getKnowledgeCategoryLabel(id: KnowledgeTopCategory): string {
  return KNOWLEDGE_TOP_CATEGORIES.find((g) => g.id === id)?.label ?? id;
}

export function getChannelLabel(value: string): string {
  return CHANNEL_OPTIONS.find((c) => c.value === value)?.label ?? value;
}

export function getIndustryLabel(value: string): string {
  return INDUSTRY_OPTIONS.find((i) => i.value === value)?.label ?? value;
}
