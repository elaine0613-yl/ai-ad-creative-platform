"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

interface AgentMessageContentProps {
  content: string;
  className?: string;
}

/** 将 Agent 文案中的「任务中心」「素材库」渲染为可点击链接 */
export function AgentMessageContent({ content, className }: AgentMessageContentProps) {
  const parts = content.split(/(任务中心|素材库)/g);
  if (parts.length === 1) {
    return <span className={className}>{content}</span>;
  }

  return (
    <span className={className}>
      {parts.map((part, i) => {
        if (part === "任务中心") {
          return (
            <Link
              key={`tasks-${i}`}
              href="/tasks"
              className="font-medium text-brand-600 underline underline-offset-2 hover:text-brand-700"
            >
              任务中心
            </Link>
          );
        }
        if (part === "素材库") {
          return (
            <Link
              key={`materials-${i}`}
              href="/materials"
              className="font-medium text-brand-600 underline underline-offset-2 hover:text-brand-700"
            >
              素材库
            </Link>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </span>
  );
}

export function TaskStatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; className: string }> = {
    queued: { label: "排队中", className: "bg-gray-100 text-gray-700" },
    processing: { label: "生成中", className: "bg-blue-100 text-blue-700" },
    auditing: { label: "审核中", className: "bg-amber-100 text-amber-800" },
    completed: { label: "已完成", className: "bg-green-100 text-green-700" },
    audit_failed: { label: "审核失败", className: "bg-red-100 text-red-700" },
    failed: { label: "失败", className: "bg-red-100 text-red-700" },
  };
  const config = map[status] ?? { label: status, className: "bg-gray-100 text-gray-700" };
  return (
    <span className={cn("inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium", config.className)}>
      {config.label}
    </span>
  );
}
