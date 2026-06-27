import type { RequirementBrief } from "@/lib/campaign/types";
import type { ImageCreationConfig, VideoCreationConfig } from "./config-types";

export function applyAgentToImageConfig(
  requirement: RequirementBrief | null,
  config: ImageCreationConfig
): ImageCreationConfig {
  if (!requirement) return config;

  const next = { ...config };

  if (requirement.aspectRatio) next.aspectRatio = requirement.aspectRatio;
  if (requirement.visualStyle) {
    const styleMap: Record<string, string> = {
      真实生活感: "写实高清",
      清新自然: "电商通透种草风",
      促销热闹: "国潮风格",
      科技简约: "轻奢质感",
    };
    next.visualStyle = styleMap[requirement.visualStyle] ?? requirement.visualStyle;
  }
  if (requirement.sellingPoints && !next.mainTitle) {
    next.mainTitle = requirement.sellingPoints.split("、")[0] ?? next.mainTitle;
  }
  if (requirement.sellingPoints && !next.sellingPoints) {
    next.sellingPoints = requirement.sellingPoints.replace(/、/g, "\n");
  }
  if (requirement.productKeywords && !next.subjectDescription) {
    next.subjectDescription = requirement.productKeywords;
  }
  if (requirement.industry && !next.industryTemplate) {
    const industryMap: Record<string, string> = {
      美妆护肤: "beauty",
      电商百货: "home",
      "3C数码": "3c",
      食品饮料: "food",
    };
    next.industryTemplate = industryMap[requirement.industry] ?? "";
  }

  return next;
}

export function applyAgentToVideoConfig(
  requirement: RequirementBrief | null,
  config: VideoCreationConfig
): VideoCreationConfig {
  if (!requirement) return config;

  const next = { ...config };

  if (requirement.duration) next.duration = String(requirement.duration);
  if (requirement.aspectRatio) next.aspectRatio = requirement.aspectRatio;
  if (requirement.sellingPoints) {
    next.subtitleText = requirement.sellingPoints;
    next.voiceoverScript = requirement.sellingPoints;
  }
  if (requirement.visualStyle?.includes("真实")) {
    next.globalStyle = "慢节奏种草风格";
  }

  return next;
}

export function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
  if (!path.includes(".")) return obj[path];
  const [head, ...rest] = path.split(".");
  const child = obj[head] as Record<string, unknown> | undefined;
  if (!child) return undefined;
  return getNestedValue(child, rest.join("."));
}

export function setNestedValue(
  obj: Record<string, unknown>,
  path: string,
  value: unknown
): Record<string, unknown> {
  const next = { ...obj };
  if (!path.includes(".")) {
    next[path] = value;
    return next;
  }
  const [head, ...rest] = path.split(".");
  next[head] = setNestedValue(
    (next[head] as Record<string, unknown>) ?? {},
    rest.join("."),
    value
  );
  return next;
}
