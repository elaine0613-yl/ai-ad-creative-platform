"use client";

import { Button } from "@/components/ui/Button";
import type { CreativePlanPackage } from "@/lib/campaign/types";
import { cn } from "@/lib/utils";
import { RefreshCw, Sparkles, Wand2 } from "lucide-react";

interface CreativeGenerationPanelProps {
  plan: CreativePlanPackage;
  loading?: boolean;
  configApplied?: boolean;
  onApplyConfig?: () => void;
  onRegenerate?: () => void;
}

export function CreativeGenerationPanel({
  plan,
  loading,
  configApplied = false,
  onApplyConfig,
  onRegenerate,
}: CreativeGenerationPanelProps) {
  const narrative = plan.narrative || plan.summary;
  if (!narrative) return null;

  return (
    <section className="rounded-2xl border border-purple-200 bg-gradient-to-b from-purple-50/80 to-white p-5 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-purple-100 text-purple-700">
          <Wand2 className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-semibold text-gray-900">创意生成</h3>
            {configApplied && (
              <span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] text-green-700">
                已写入配置
              </span>
            )}
          </div>
          <p className="mt-1 text-xs text-gray-500">
            结合诉求、基础信息与已选商品自动生成的创意描述；确认后点击「一键配置」填充下方各模块。
          </p>
        </div>
      </div>

      <div className="mt-4 max-h-72 overflow-y-auto rounded-xl border border-purple-100 bg-white/90 p-4 scrollbar-thin">
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-800">{narrative}</p>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Button
          type="button"
          className="flex-1 sm:flex-none"
          onClick={onApplyConfig}
          loading={loading}
          disabled={!onApplyConfig}
        >
          <Sparkles className="h-4 w-4" />
          一键配置
        </Button>
        {onRegenerate && (
          <Button
            type="button"
            variant="outline"
            onClick={onRegenerate}
            loading={loading}
            disabled={loading}
          >
            <RefreshCw className="h-4 w-4" />
            重新生成
          </Button>
        )}
      </div>

      {plan.sections.length > 0 && (
        <details className={cn("mt-4 group", configApplied && "opacity-90")}>
          <summary className="cursor-pointer text-xs font-medium text-purple-700 hover:text-purple-800">
            查看分模块创意要点（{plan.sections.length} 个模块）
          </summary>
          <div className="mt-3 space-y-3">
            {plan.sections.map((section) => (
              <div
                key={section.moduleId}
                className="rounded-xl border border-purple-100/80 bg-white/90 p-3"
              >
                <h4 className="text-xs font-semibold text-gray-900">{section.title}</h4>
                <p className="mt-1 text-[11px] leading-relaxed text-gray-600">{section.rationale}</p>
              </div>
            ))}
          </div>
        </details>
      )}
    </section>
  );
}
