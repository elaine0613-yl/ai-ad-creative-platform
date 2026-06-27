import type { MaterialType } from "@/lib/types";
import type { AssetCategory } from "@/lib/material-library/types";

export type ConfigFieldType =
  | "text"
  | "textarea"
  | "number"
  | "select"
  | "multiselect"
  | "switch"
  | "color"
  | "slider"
  | "material-picker"
  | "file-upload";

export interface ConfigFieldOption {
  value: string;
  label: string;
}

export interface ConfigFieldDef {
  id: string;
  label: string;
  type: ConfigFieldType;
  placeholder?: string;
  hint?: string;
  options?: ConfigFieldOption[];
  /** material-picker 过滤 */
  assetCategory?: AssetCategory;
  assetSubCategory?: string;
  min?: number;
  max?: number;
  step?: number;
  rows?: number;
  /** 是否支持从素材库另存为模板 */
  savableAsTemplate?: boolean;
  templateSubCategory?: string;
}

export interface ConfigModuleDef {
  id: string;
  title: string;
  description?: string;
}

export interface ImageCreationConfig {
  aspectRatio: string;
  compositionTemplate: string;
  industryTemplate: string;
  subjectDescription: string;
  referenceAssetId: string;
  visualStyle: string;
  lighting: string;
  subjectEnhance: boolean;
  backgroundType: string;
  backgroundAssetId: string;
  mainTitle: string;
  sellingPoints: string;
  typographyTemplate: string;
  textColorPrimary: string;
  textColorAccent: string;
  priceTagEnabled: boolean;
  originalPrice: string;
  salePrice: string;
  marketingBadges: string[];
  ctaStyle: string;
  ctaText: string;
  filterStyle: string;
  microEffects: string[];
}

export interface VideoShotConfig {
  shotType: string;
  description: string;
  assetId: string;
}

export interface VideoCreationConfig {
  duration: string;
  aspectRatio: string;
  globalStyle: string;
  hookShot: VideoShotConfig;
  sceneShot: VideoShotConfig;
  sellingShot: VideoShotConfig;
  ctaShot: VideoShotConfig;
  transitionHookScene: string;
  transitionSceneSelling: string;
  transitionSellingCta: string;
  transitionRhythm: string;
  bgmAssetId: string;
  bgmVolume: number;
  voiceoverScript: string;
  voiceType: string;
  voiceSpeed: number;
  sfxPreset: string;
  subtitleText: string;
  subtitleAnimation: string;
  keywordHighlight: string;
  dynamicBadges: string[];
  guideElements: boolean;
  floatingStickers: string;
  globalFilter: string;
  endFrameAssetId: string;
}

export function defaultImageConfig(): ImageCreationConfig {
  return {
    aspectRatio: "1:1",
    compositionTemplate: "",
    industryTemplate: "",
    subjectDescription: "",
    referenceAssetId: "",
    visualStyle: "写实高清",
    lighting: "柔光通透",
    subjectEnhance: true,
    backgroundType: "gradient",
    backgroundAssetId: "",
    mainTitle: "",
    sellingPoints: "",
    typographyTemplate: "",
    textColorPrimary: "#1A1A1A",
    textColorAccent: "#FF4D4F",
    priceTagEnabled: false,
    originalPrice: "",
    salePrice: "",
    marketingBadges: [],
    ctaStyle: "solid-red",
    ctaText: "立即抢购",
    filterStyle: "",
    microEffects: [],
  };
}

export function defaultVideoConfig(): VideoCreationConfig {
  const emptyShot = (): VideoShotConfig => ({
    shotType: "",
    description: "",
    assetId: "",
  });
  return {
    duration: "15",
    aspectRatio: "9:16",
    globalStyle: "快节奏带货风格",
    hookShot: { ...emptyShot(), shotType: "产品特写镜头" },
    sceneShot: { ...emptyShot(), shotType: "中景使用场景镜头" },
    sellingShot: { ...emptyShot(), shotType: "前后对比镜头" },
    ctaShot: { ...emptyShot(), shotType: "全景环境镜头" },
    transitionHookScene: "闪白硬切",
    transitionSceneSelling: "淡入淡出",
    transitionSellingCta: "滑动转场",
    transitionRhythm: "跟随背景音乐自动卡点",
    bgmAssetId: "",
    bgmVolume: 70,
    voiceoverScript: "",
    voiceType: "温柔女声",
    voiceSpeed: 1,
    sfxPreset: "",
    subtitleText: "",
    subtitleAnimation: "",
    keywordHighlight: "",
    dynamicBadges: [],
    guideElements: false,
    floatingStickers: "",
    globalFilter: "",
    endFrameAssetId: "",
  };
}

export type ConfigValues = ImageCreationConfig | VideoCreationConfig;

export function isImageConfig(
  config: ConfigValues,
  materialType: MaterialType
): config is ImageCreationConfig {
  return materialType === "image";
}
