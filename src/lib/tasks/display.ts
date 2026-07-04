import type { ImageCreativePlanFields, RequirementBrief, VideoCreativePlanFields } from "@/lib/campaign/types";

export type TaskDisplayStatus =
  | "queued"
  | "processing"
  | "auditing"
  | "completed"
  | "audit_failed"
  | "failed";

export interface TaskPayload {
  campaignId?: string;
  requirement?: RequirementBrief;
  imageCreative?: ImageCreativePlanFields;
  videoCreative?: VideoCreativePlanFields;
  initiatorName?: string;
}

export interface TaskResultMeta {
  auditStatus?: "passed" | "rejected";
  auditReason?: string;
  aiHint?: string;
  fieldsToFix?: string[];
  materialIds?: string[];
}

export const TASK_STATUS_LABELS: Record<string, { label: string; tone: "default" | "info" | "success" | "error" | "warning" }> = {
  queued: { label: "排队中", tone: "default" },
  processing: { label: "生成中", tone: "info" },
  auditing: { label: "审核中", tone: "warning" },
  completed: { label: "已完成", tone: "success" },
  audit_failed: { label: "审核失败", tone: "error" },
  failed: { label: "失败", tone: "error" },
};

export function parseTaskPayload(raw: string): TaskPayload {
  try {
    return JSON.parse(raw || "{}") as TaskPayload;
  } catch {
    return {};
  }
}

export function parseTaskResult(raw: string): TaskResultMeta {
  try {
    return JSON.parse(raw || "{}") as TaskResultMeta;
  } catch {
    return {};
  }
}

export function formatTaskMode(mode: string): string {
  if (mode === "AI原生素材" || mode === "AI原生视频" || mode === "爆款复刻") return mode;
  if (mode.includes("native") || mode.includes("原生")) {
    return mode.includes("video") || mode.includes("视频") ? "AI原生视频" : "AI原生素材";
  }
  if (mode.includes("replicate") || mode.includes("复刻")) return "爆款复刻";
  return mode || "—";
}

export function shortTaskId(id: string): string {
  return id.length > 10 ? `${id.slice(0, 8)}…` : id;
}
