"use client";

import { Button } from "@/components/ui/Button";
import { SELECTION_METHOD_OPTIONS } from "@/lib/campaign/field-map";
import type { CampaignSnapshot, RequirementBrief } from "@/lib/campaign/types";
import { cn } from "@/lib/utils";
import { Package, Sparkles, X } from "lucide-react";
import { useState } from "react";

interface SmartSelectionPanelProps {
  requirement: RequirementBrief;
  campaign: CampaignSnapshot;
  selectedSkuIds: string[];
  loading?: boolean;
  agentFilledKeys?: Set<string>;
  readOnly?: boolean;
  onUpdateField: (fieldKey: string, value: string) => void;
  onRunSelection: () => void;
  onToggleSku: (skuId: string) => void;
  onRemoveSku: (skuId: string) => void;
  onSaveStrategyTemplate?: () => void;
}

export function SmartSelectionPanel({
  requirement,
  campaign,
  selectedSkuIds,
  loading,
  agentFilledKeys,
  readOnly,
  onUpdateField,
  onRunSelection,
  onToggleSku,
  onRemoveSku,
  onSaveStrategyTemplate,
}: SmartSelectionPanelProps) {
  const [expanded, setExpanded] = useState(false);
  const isProductLanding = requirement.landingType === "商品" || !requirement.landingType;
  const disabled = readOnly || !isProductLanding;

  const inputClass =
    "w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100 disabled:bg-gray-50";

  const agentBadge = (key: string) =>
    agentFilledKeys?.has(key) ? (
      <span className="rounded bg-brand-50 px-1 py-0.5 text-[9px] text-brand-600">Agent</span>
    ) : null;

  return (
    <section
      className={cn(
        "rounded-2xl border bg-white p-5 shadow-sm",
        disabled ? "border-gray-200 opacity-60" : "border-brand-100"
      )}
    >
      <div className="flex items-center gap-2">
        <Package className="h-4 w-4 text-brand-600" />
        <h3 className="text-sm font-semibold text-gray-900">智能选品</h3>
        <span className="rounded-full bg-brand-50 px-2 py-0.5 text-[10px] text-brand-700">
          基础信息已确认
        </span>
      </div>
      <p className="mt-1 text-xs text-gray-500">
        {isProductLanding
          ? "配置选品策略后，点击执行生成商品列表"
          : "非商品类承接，选品模块已锁定"}
      </p>

      <div className="mt-4 space-y-3">
        <div className="grid grid-cols-[7rem_1fr_auto] items-center gap-3">
          <label className="flex items-center gap-1 text-xs text-gray-500">
            商品选取方式 {agentBadge("productSelectionMethod")}
          </label>
          <select
            disabled={disabled}
            value={requirement.productSelectionMethod ?? "AI 智能选品"}
            onChange={(e) => onUpdateField("productSelectionMethod", e.target.value)}
            className={inputClass}
          >
            {SELECTION_METHOD_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-[7rem_1fr_auto] items-center gap-3">
          <label className="flex items-center gap-1 text-xs text-gray-500">
            智能选品数量 {agentBadge("selectionCount")}
          </label>
          <input
            type="number"
            min={1}
            disabled={disabled}
            value={requirement.selectionCount ?? 10}
            onChange={(e) => onUpdateField("selectionCount", e.target.value)}
            className={inputClass}
          />
        </div>

        <div className="grid grid-cols-[7rem_1fr_auto] items-start gap-3">
          <label className="flex items-center gap-1 pt-2 text-xs text-gray-500">
            选品策略 {agentBadge("selectionStrategy")}
          </label>
          <textarea
            disabled={disabled}
            value={requirement.selectionStrategy ?? ""}
            onChange={(e) => onUpdateField("selectionStrategy", e.target.value)}
            rows={3}
            className={cn(inputClass, "resize-none")}
            placeholder="AI 从诉求提取的筛选规则，可手动增补类目、价格带等"
          />
        </div>

        {!disabled && (
          <Button className="w-full" variant="outline" onClick={onRunSelection} loading={loading}>
            <Sparkles className="h-4 w-4" />
            Agent 智能选品
          </Button>
        )}

        {onSaveStrategyTemplate && !disabled && (
          <button
            type="button"
            onClick={onSaveStrategyTemplate}
            className="text-[10px] text-brand-600 hover:text-brand-700"
          >
            存为选品策略模板
          </button>
        )}

        {campaign.recommendations.length > 0 && (
          <div className="border-t border-gray-100 pt-4">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-gray-800">
                商品列表（可多选 · {selectedSkuIds.length} 已选）
              </p>
              <button
                type="button"
                onClick={() => setExpanded((v) => !v)}
                className="text-xs text-brand-600"
              >
                {expanded ? "收起" : "管理商品 List"}
              </button>
            </div>
            <div className="mt-3 flex gap-3 overflow-x-auto pb-2">
              {(expanded ? campaign.recommendations : campaign.recommendations.slice(0, 8)).map(
                (rec) => (
                  <div
                    key={rec.sku.id}
                    className={cn(
                      "relative w-[130px] shrink-0 rounded-xl border p-2.5",
                      selectedSkuIds.includes(rec.sku.id)
                        ? "border-brand-500 bg-brand-50"
                        : "border-gray-200 bg-gray-50"
                    )}
                  >
                    {!readOnly && (
                      <button
                        type="button"
                        onClick={() => onRemoveSku(rec.sku.id)}
                        className="absolute right-1 top-1 text-gray-400 hover:text-red-500"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    )}
                    <div className="mb-1 flex h-12 items-center justify-center rounded bg-white text-lg">
                      📦
                    </div>
                    <p className="line-clamp-2 text-[10px] font-medium">{rec.sku.name}</p>
                    <p className="text-[9px] text-gray-400">{rec.sku.category}</p>
                    <p className="text-[10px] text-gray-600">¥{rec.sku.price}</p>
                    {!readOnly && (
                      <button
                        type="button"
                        onClick={() => onToggleSku(rec.sku.id)}
                        className={cn(
                          "mt-1.5 w-full rounded border py-0.5 text-[9px]",
                          selectedSkuIds.includes(rec.sku.id)
                            ? "border-brand-600 bg-brand-600 text-white"
                            : "border-gray-200 bg-white"
                        )}
                      >
                        {selectedSkuIds.includes(rec.sku.id) ? "已选" : "选择"}
                      </button>
                    )}
                  </div>
                )
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
