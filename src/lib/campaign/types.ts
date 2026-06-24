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
  audience?: string;
  promotion?: string;
  priceRange?: string;
  duration?: number;
  aspectRatio?: string;
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
  messages: AgentMessage[];
  materialId?: string;
  auditStatus?: string;
  rejectReason?: string;
}
