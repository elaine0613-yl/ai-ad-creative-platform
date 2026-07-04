import type { ImageCreativePlanFields, VideoCreativePlanFields } from "@/lib/campaign/types";
import { CREATIVE_FIELD_LABELS, VIDEO_CREATIVE_FIELD_LABELS } from "@/lib/tasks/field-labels";

const FORBIDDEN_CHECKS: { word: string; fields: (keyof ImageCreativePlanFields)[] }[] = [
  { word: "最好", fields: ["mainTitle", "subTitle"] },
  { word: "第一", fields: ["mainTitle", "subTitle"] },
  { word: "绝对", fields: ["mainTitle", "ctaTitle"] },
  { word: "100%", fields: ["subTitle", "creativeStoryKernel"] },
  { word: "全网最低", fields: ["mainTitle", "subTitle", "ctaTitle"] },
];

export interface NativeAuditResult {
  pass: boolean;
  auditReason?: string;
  aiHint?: string;
  fieldsToFix?: string[];
}

export function auditNativeImageCreative(
  imageCreative: ImageCreativePlanFields | null | undefined
): NativeAuditResult {
  if (!imageCreative) {
    return {
      pass: false,
      auditReason: "创意方案配置缺失",
      aiHint: "创意方案配置不完整，请返回创作页重新生成后再提交。",
      fieldsToFix: [],
    };
  }

  const fieldsToFix = new Set<string>();
  const reasons: string[] = [];

  for (const { word, fields } of FORBIDDEN_CHECKS) {
    for (const field of fields) {
      const val = imageCreative[field];
      if (val && val.includes(word)) {
        fieldsToFix.add(field);
        reasons.push(`「${CREATIVE_FIELD_LABELS[field]}」含违规极限词「${word}」`);
      }
    }
  }

  if (fieldsToFix.size > 0) {
    const reason = reasons.join("；");
    return {
      pass: false,
      auditReason: reason,
      aiHint: `审核未通过：${reason}。请修改下方标红字段后重新提交审核。`,
      fieldsToFix: [...fieldsToFix],
    };
  }

  return { pass: true };
}

const VIDEO_FORBIDDEN_CHECKS: { word: string; fields: (keyof VideoCreativePlanFields)[] }[] = [
  { word: "最好", fields: ["mainTitle", "subTitle", "fullVideoScript"] },
  { word: "第一", fields: ["mainTitle", "fullVideoScript"] },
  { word: "绝对", fields: ["mainTitle", "ctaTitle"] },
  { word: "100%", fields: ["subTitle", "creativeStoryKernel", "fullVideoScript"] },
];

export function auditNativeVideoCreative(
  videoCreative: VideoCreativePlanFields | null | undefined
): NativeAuditResult {
  if (!videoCreative) {
    return {
      pass: false,
      auditReason: "创意方案配置缺失",
      aiHint: "创意方案配置不完整，请返回创作页重新生成后再提交。",
      fieldsToFix: [],
    };
  }

  const fieldsToFix = new Set<string>();
  const reasons: string[] = [];

  for (const { word, fields } of VIDEO_FORBIDDEN_CHECKS) {
    for (const field of fields) {
      const val = videoCreative[field];
      if (val && val.includes(word)) {
        fieldsToFix.add(field);
        reasons.push(`「${VIDEO_CREATIVE_FIELD_LABELS[field]}」含违规极限词「${word}」`);
      }
    }
  }

  if (fieldsToFix.size > 0) {
    const reason = reasons.join("；");
    return {
      pass: false,
      auditReason: reason,
      aiHint: `审核未通过：${reason}。请修改下方标红字段后重新提交审核。`,
      fieldsToFix: [...fieldsToFix],
    };
  }

  return { pass: true };
}
