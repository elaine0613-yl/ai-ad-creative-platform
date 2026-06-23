import type { KnowledgeAsset } from "@/lib/types";

export interface ImageFormKnowledgeTarget {
  industry?: string;
  scene?: string;
  style?: string;
  mainTitle?: string;
  subTitle?: string;
  sellingPoints?: string;
  otherRequirements?: string;
  promotion?: string;
  mainColor?: string;
  atmosphere?: string;
  preset?: string;
}

export interface VideoFormKnowledgeTarget {
  style?: string;
  sellingPoints?: string;
  otherRequirements?: string;
  marketingInfo?: string;
  musicStyle?: string;
  duration?: string;
  withVoiceover?: boolean;
  withSubtitle?: boolean;
  useDigitalHuman?: boolean;
}

const IMAGE_PRESET_HINTS: Record<string, string> = {
  淘宝: "taobao",
  京东: "jd",
  小红书: "xiaohongshu",
  抖音: "douyin",
  朋友圈: "wechat",
};

export function applyKnowledgeToImageForm(
  asset: KnowledgeAsset,
  current: ImageFormKnowledgeTarget
): ImageFormKnowledgeTarget {
  const patch: ImageFormKnowledgeTarget = {
    otherRequirements: [current.otherRequirements, `[知识库] ${asset.name}: ${asset.description}`]
      .filter(Boolean)
      .join("\n"),
  };

  switch (asset.categoryId) {
    case "visual-style":
      patch.style = asset.tags[0] ?? current.style;
      patch.atmosphere = asset.description;
      break;
    case "scene-background":
      patch.scene = asset.tags.find((t) => t.includes("场景")) ? "主图" : current.scene;
      patch.atmosphere = asset.name;
      break;
    case "color-scheme":
      if (asset.previewColor) patch.mainColor = asset.previewColor;
      break;
    case "copy-layout":
      patch.otherRequirements = `${asset.description}\n${patch.otherRequirements ?? ""}`;
      break;
    case "composition":
    case "lighting-mood":
    case "product-display":
      patch.atmosphere = asset.name;
      break;
    case "platform-spec":
      for (const [hint, presetId] of Object.entries(IMAGE_PRESET_HINTS)) {
        if (asset.name.includes(hint) || asset.tags.some((t) => t.includes(hint))) {
          patch.preset = presetId;
          break;
        }
      }
      break;
    case "brand-assets":
      patch.style = current.style ?? "简约";
      break;
    case "industry-template":
      if (asset.tags.includes("618") || asset.tags.includes("大促")) {
        patch.promotion = patch.promotion ?? "618 限时特惠";
        patch.style = "促销热闹";
      }
      break;
    default:
      break;
  }

  return { ...current, ...patch };
}

export function applyKnowledgeToVideoForm(
  asset: KnowledgeAsset,
  current: VideoFormKnowledgeTarget
): VideoFormKnowledgeTarget {
  const patch: VideoFormKnowledgeTarget = {
    otherRequirements: [current.otherRequirements, `[知识库] ${asset.name}: ${asset.description}`]
      .filter(Boolean)
      .join("\n"),
  };

  switch (asset.categoryId) {
    case "bgm":
      patch.musicStyle = asset.tags[0] ?? current.musicStyle;
      break;
    case "voiceover":
      patch.withVoiceover = true;
      break;
    case "subtitles":
      patch.withSubtitle = true;
      break;
    case "digital-human":
      patch.useDigitalHuman = true;
      patch.withVoiceover = true;
      break;
    case "video-template":
    case "pacing":
    case "hook-opening":
    case "storyboard":
      patch.style = asset.tags[0] ?? current.style;
      if (asset.categoryId === "storyboard") patch.duration = "15";
      break;
    case "cta-ending":
      patch.marketingInfo = asset.description;
      break;
    default:
      break;
  }

  return { ...current, ...patch };
}

export function findKnowledgeAsset(
  assets: KnowledgeAsset[],
  id: string
): KnowledgeAsset | undefined {
  return assets.find((a) => a.id === id);
}
