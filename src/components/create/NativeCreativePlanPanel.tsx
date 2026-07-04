"use client";

import { Button } from "@/components/ui/Button";
import { CreativePlanFieldsPanel } from "@/components/create/CreativePlanFieldsPanel";
import type { CreativePlanPackage, ImageCreativePlanFields } from "@/lib/campaign/types";
import { cn } from "@/lib/utils";
import { CheckCircle2, Loader2, Wand2 } from "lucide-react";

export type NativeCreativePlanStatus = "generating" | "ready" | "confirmed";

interface NativeCreativePlanPanelProps {
  plan: CreativePlanPackage;
  status: NativeCreativePlanStatus;
  loading?: boolean;
  onChange?: (fields: ImageCreativePlanFields) => void;
  onRegenerate?: () => void;
  onConfirm?: () => void;
}

export function NativeCreativePlanPanel({
  plan,
  status,
  loading,
  onChange,
  onRegenerate,
  onConfirm,
}: NativeCreativePlanPanelProps) {
  const narrative = plan.narrative || plan.summary;
  const fields = plan.imageCreative;

  if (!fields) return null;

  const statusLabel =
    status === "generating"
      ? "生成中"
      : status === "confirmed"
        ? "已确认"
        : "待确认";

  const statusClass =
    status === "generating"
      ? "bg-amber-100 text-amber-800"
      : status === "confirmed"
        ? "bg-green-100 text-green-700"
        : "bg-purple-100 text-purple-700";

  return (
    <div className="space-y-4">
      <CreativePlanFieldsPanel
        fields={fields}
        readOnly={status !== "ready" || loading}
        onChange={onChange}
        onRegenerate={status === "ready" ? onRegenerate : undefined}
        loading={loading}
      />

      <section className="rounded-2xl border border-purple-200 bg-gradient-to-b from-purple-50/80 to-white p-5 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-purple-100 text-purple-700">
            <Wand2 className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-sm font-semibold text-gray-900">创意方案生成</h3>
              <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-medium", statusClass)}>
                {status === "generating" && (
                  <Loader2 className="mr-1 inline h-3 w-3 animate-spin" />
                )}
                {statusLabel}
              </span>
            </div>
            <p className="mt-1 text-xs text-gray-500">
              结合诉求、渠道特性、人群标签、权益属性与价格带生成；确认后可单张预览并提交任务
            </p>
          </div>
        </div>

        {narrative && (
          <div className="mt-4 max-h-48 overflow-y-auto rounded-xl border border-purple-100 bg-white/90 p-4 scrollbar-thin">
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-800">{narrative}</p>
          </div>
        )}

        {status === "ready" && onConfirm && (
          <Button className="mt-4 w-full" size="lg" onClick={onConfirm} loading={loading}>
            <CheckCircle2 className="h-4 w-4" />
            确认创意方案，进入预览
          </Button>
        )}
      </section>
    </div>
  );
}
