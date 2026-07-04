"use client";

import type {
  InterpretFieldKey,
  RequirementInterpretation,
} from "@/lib/campaign/requirement-interpretation";
import { cn } from "@/lib/utils";
import { Bot, ChevronDown, Save } from "lucide-react";
import { useState } from "react";

interface RequirementInterpretPanelProps {
  interpretation: RequirementInterpretation | null;
  missingFields: InterpretFieldKey[];
  agentFilledKeys: InterpretFieldKey[];
  canAutoFill: boolean;
  onChange: (next: RequirementInterpretation, changedKey?: InterpretFieldKey) => void;
  onSaveTemplate?: () => void;
}

const FIELDS: { key: InterpretFieldKey; label: string; multiline?: boolean }[] = [
  { key: "taskName", label: "任务名称" },
  { key: "channel", label: "投放渠道" },
  { key: "media", label: "素材媒体" },
  { key: "sizeRequirement", label: "尺寸要求" },
  { key: "creativesPerProduct", label: "单商品生成素材数" },
  { key: "landingType", label: "素材承接类型" },
  { key: "coreSummary", label: "核心投放总结", multiline: true },
  { key: "specialConstraints", label: "特殊约束备注", multiline: true },
  { key: "selectionCount", label: "智能选品数量" },
  { key: "selectionStrategy", label: "选品策略", multiline: true },
];

export function RequirementInterpretPanel({
  interpretation,
  missingFields,
  agentFilledKeys,
  canAutoFill,
  onChange,
  onSaveTemplate,
}: RequirementInterpretPanelProps) {
  const [open, setOpen] = useState(true);

  if (!interpretation) return null;

  return (
    <div className="relative z-0 mt-3 border-t border-gray-200 bg-gray-50/80">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-4 py-2.5 text-left"
      >
        <div className="flex items-center gap-2">
          <Bot className="h-4 w-4 text-brand-600" />
          <span className="text-xs font-semibold text-gray-800">需求结构化解读</span>
          {!canAutoFill && (
            <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[9px] text-amber-700">
              部分待补
            </span>
          )}
        </div>
        <ChevronDown className={cn("h-4 w-4 text-gray-400 transition", open && "rotate-180")} />
      </button>

      {open && (
        <div className="max-h-64 space-y-2 overflow-y-auto overscroll-y-contain px-4 pb-3">
          {!canAutoFill && (
            <p className="rounded-lg bg-amber-50 px-2 py-1.5 text-[11px] text-amber-800">
              部分字段未从诉求识别，已在右侧留空，请直接手动补充（无需重写诉求）。
            </p>
          )}
          {FIELDS.map(({ key, label, multiline }) => {
            const raw = interpretation[key];
            const value = typeof raw === "number" ? String(raw) : String(raw ?? "");
            const isMissing = missingFields.includes(key);

            return (
              <div key={key} className="grid grid-cols-[5.5rem_1fr] items-start gap-1.5">
                <label className="pt-1.5 text-[10px] font-medium text-gray-500">{label}</label>
                {multiline ? (
                  <textarea
                    value={value}
                    rows={2}
                    onChange={(e) =>
                      onChange(
                        {
                          ...interpretation,
                          [key]: e.target.value,
                        },
                        key
                      )
                    }
                    className={cn(
                      "resize-none rounded-lg border px-2 py-1.5 text-[11px]",
                      isMissing ? "border-amber-300 bg-amber-50/50" : "border-gray-200 bg-white"
                    )}
                  />
                ) : (
                  <input
                    value={value}
                    onChange={(e) => {
                      const v = e.target.value;
                      if (key === "creativesPerProduct" || key === "selectionCount") {
                        onChange({ ...interpretation, [key]: Number(v) || 0 }, key);
                      } else {
                        onChange({ ...interpretation, [key]: v }, key);
                      }
                    }}
                    className={cn(
                      "rounded-lg border px-2 py-1.5 text-[11px]",
                      isMissing ? "border-amber-300 bg-amber-50/50" : "border-gray-200 bg-white"
                    )}
                  />
                )}
              </div>
            );
          })}
          {onSaveTemplate && (
            <button
              type="button"
              onClick={onSaveTemplate}
              className="flex items-center gap-1 text-[10px] text-brand-600 hover:text-brand-700"
            >
              <Save className="h-3 w-3" />
              存为投放需求模板
            </button>
          )}
        </div>
      )}
    </div>
  );
}
