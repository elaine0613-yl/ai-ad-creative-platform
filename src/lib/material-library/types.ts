import type { MaterialType } from "@/lib/types";

/** 资源归属：个人私有 > 公共预置（读取优先级） */
export type AssetScope = "private" | "public";

/** 素材库统一分类 */
export type AssetCategory =
  | "visual"
  | "audio"
  | "param-template"
  | "copy"
  | "component";

export type VisualSubCategory =
  | "background"
  | "reference"
  | "video-clip"
  | "badge"
  | "sticker"
  | "cta-button";

export type AudioSubCategory = "bgm" | "sfx" | "voiceover-script";

export type TemplateSubCategory =
  | "canvas-size"
  | "composition"
  | "color-scheme"
  | "typography"
  | "filter"
  | "transition"
  | "subtitle-animation"
  | "video-script"
  | "style"
  | "end-frame";

/** 创作完成后三种入库方式 */
export type LibrarySaveMode =
  | "finished-asset"
  | "config-template"
  | "component-unit";

export type AssetSourceChain = "image" | "video" | "both";

export interface LibraryAsset {
  id: string;
  name: string;
  scope: AssetScope;
  category: AssetCategory;
  subCategory?: string;
  materialType?: MaterialType;
  url?: string;
  thumbnailUrl?: string;
  tags: string[];
  /** 参数模板类：JSON 配置文本 */
  configJson?: string;
  sourceChain: AssetSourceChain;
  createdAt: string;
}

export interface LibraryQuery {
  category?: AssetCategory;
  subCategory?: string;
  scope?: AssetScope | "all";
  materialType?: MaterialType;
  sourceChain?: AssetSourceChain;
  search?: string;
  page?: number;
  pageSize?: number;
}

export interface LibraryQueryResult {
  items: LibraryAsset[];
  total: number;
  page: number;
  pageSize: number;
}

export interface SaveToLibraryPayload {
  mode: LibrarySaveMode;
  name: string;
  category: AssetCategory;
  subCategory?: string;
  tags?: string[];
  url?: string;
  configJson?: string;
  sourceChain: AssetSourceChain;
  materialType?: MaterialType;
}
