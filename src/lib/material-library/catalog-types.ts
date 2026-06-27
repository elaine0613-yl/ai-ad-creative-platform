import type { MaterialType } from "@/lib/types";

/** 素材库顶部 Tab */
export type MaterialLibraryTab = "image" | "video";

/** 资产归属 */
export type AssetOwnership = "private" | "team" | "public";

/** 资产来源 */
export type AssetSource = "ai-generated" | "uploaded" | "system";

/** 一级资产分类（固定结构） */
export type MaterialTopCategory =
  | "brand"
  | "image-pipeline"
  | "video-pipeline"
  | "strategy"
  | "platform-public";

export interface MaterialSubCategory {
  id: string;
  topCategory: MaterialTopCategory;
  label: string;
  /** 归属哪个 Tab；platform-public / brand / strategy 通常 both */
  tabs: MaterialLibraryTab[];
}

export interface MaterialCatalogAsset {
  id: string;
  name: string;
  tab: MaterialLibraryTab;
  topCategory: MaterialTopCategory;
  subCategoryId: string;
  ownership: AssetOwnership;
  source: AssetSource;
  tags: string[];
  thumbnailUrl?: string;
  previewColor?: string;
  url?: string;
  /** 视频/音频时长（秒） */
  durationSec?: number;
  fileSize?: string;
  createdAt: string;
  createdBy: string;
  usageCount: number;
  usageRecords: { taskName: string; usedAt: string }[];
  /** 平台公共资产只读 */
  readonly?: boolean;
  width?: number;
  height?: number;
  materialType: MaterialType | "audio" | "template" | "copy" | "font" | "config";
}

export interface MaterialCategoryGroup {
  id: MaterialTopCategory;
  label: string;
  description: string;
  subCategories: MaterialSubCategory[];
}

export const MATERIAL_TOP_CATEGORIES: MaterialCategoryGroup[] = [
  {
    id: "brand",
    label: "品牌专属资产",
    description: "LOGO、品牌视觉、字体与版式模板",
    subCategories: [
      { id: "logo", topCategory: "brand", label: "LOGO 素材", tabs: ["image", "video"] },
      { id: "brand-visual", topCategory: "brand", label: "品牌视觉物料", tabs: ["image", "video"] },
      { id: "brand-font", topCategory: "brand", label: "品牌字体文件", tabs: ["image", "video"] },
      { id: "brand-layout", topCategory: "brand", label: "品牌版式模板", tabs: ["image", "video"] },
    ],
  },
  {
    id: "image-pipeline",
    label: "图片链路专用资产",
    description: "成品图、视觉素材、营销组件与配置模板",
    subCategories: [
      { id: "finished-image", topCategory: "image-pipeline", label: "成品广告图", tabs: ["image"] },
      { id: "visual-base", topCategory: "image-pipeline", label: "基础视觉素材", tabs: ["image"] },
      { id: "marketing-component", topCategory: "image-pipeline", label: "营销组件素材", tabs: ["image"] },
      { id: "image-config-template", topCategory: "image-pipeline", label: "图片整套配置模板", tabs: ["image"] },
      { id: "copy-template", topCategory: "image-pipeline", label: "营销文案模板", tabs: ["image"] },
    ],
  },
  {
    id: "video-pipeline",
    label: "视频链路专用资产",
    description: "成片、镜头片段、音频与转场方案",
    subCategories: [
      { id: "finished-video", topCategory: "video-pipeline", label: "成片短视频", tabs: ["video"] },
      { id: "clip-fragments", topCategory: "video-pipeline", label: "碎片化镜头素材", tabs: ["video"] },
      { id: "audio", topCategory: "video-pipeline", label: "音频素材", tabs: ["video"] },
      { id: "transition-template", topCategory: "video-pipeline", label: "转场方案模板", tabs: ["video"] },
      { id: "video-config-template", topCategory: "video-pipeline", label: "视频整套配置模板", tabs: ["video"] },
    ],
  },
  {
    id: "strategy",
    label: "业务策略模板资产",
    description: "投放需求、选品策略与商品分组模板",
    subCategories: [
      { id: "demand-template", topCategory: "strategy", label: "投放需求模板", tabs: ["image", "video"] },
      { id: "selection-strategy", topCategory: "strategy", label: "选品策略模板", tabs: ["image", "video"] },
      { id: "product-group", topCategory: "strategy", label: "商品分组模板", tabs: ["image", "video"] },
    ],
  },
  {
    id: "platform-public",
    label: "平台公共预置资产",
    description: "全员只读，系统预置背景/音乐/角标/行业模板",
    subCategories: [
      { id: "system-preset", topCategory: "platform-public", label: "系统预置资源", tabs: ["image", "video"] },
      { id: "channel-size", topCategory: "platform-public", label: "各渠道尺寸参考", tabs: ["image", "video"] },
    ],
  },
];

export function getSubCategoryLabel(subCategoryId: string): string {
  for (const g of MATERIAL_TOP_CATEGORIES) {
    const sub = g.subCategories.find((s) => s.id === subCategoryId);
    if (sub) return sub.label;
  }
  return subCategoryId;
}

export function getTopCategoryLabel(id: MaterialTopCategory): string {
  return MATERIAL_TOP_CATEGORIES.find((g) => g.id === id)?.label ?? id;
}

export const OWNERSHIP_LABELS: Record<AssetOwnership, string> = {
  private: "个人私有",
  team: "团队共享",
  public: "平台公共",
};

export const SOURCE_LABELS: Record<AssetSource, string> = {
  "ai-generated": "AI 生成",
  uploaded: "手动上传",
  system: "系统预置",
};
