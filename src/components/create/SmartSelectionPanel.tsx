"use client";

import { Button } from "@/components/ui/Button";
import {
  PICK_METHOD_OPTIONS,
  PRODUCT_DATA_POOL_OPTIONS,
  SELECTION_COUNT_PRESETS,
  SELECTION_METHOD_OPTIONS,
} from "@/lib/campaign/field-map";
import type { CampaignSnapshot, RequirementBrief } from "@/lib/campaign/types";
import { cn } from "@/lib/utils";
import { Package, RefreshCw, Sparkles, X } from "lucide-react";
import { useState } from "react";

interface SmartSelectionPanelProps {
  requirement: RequirementBrief;
  campaign: CampaignSnapshot;
  selectedSkuIds: string[];
  loading?: boolean;
  agentFilledKeys?: Set<string>;
  readOnly?: boolean;
  nativeDemoFlow?: boolean;
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
  nativeDemoFlow,
  onUpdateField,
  onRunSelection,
  onToggleSku,
  onRemoveSku,
  onSaveStrategyTemplate,
}: SmartSelectionPanelProps) {
  const [expanded, setExpanded] = useState(false);
  const isProductLanding =
    requirement.landingType === "商品" || !requirement.landingType || nativeDemoFlow;
  const disabled = readOnly || !isProductLanding;

  const inputClass =
    "w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100 disabled:bg-gray-50";

  const FieldRow = ({
    label,
    children,
  }: {
    label: React.ReactNode;
    fieldKey?: string;
    children: React.ReactNode;
  }) => (
    <div className="grid grid-cols-[7.5rem_1fr] items-center gap-3">
      <label className="flex items-center gap-1 text-xs text-gray-500">{label}</label>
      {children}
    </div>
  );

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
          需求已确认
        </span>
      </div>
      <p className="mt-1 text-xs text-gray-500">
        数据源优先：平台大盘近 30 天高转化商品 · 结合投放渠道与创意需求二次筛选
      </p>

      <div className="mt-4 space-y-3">
        {nativeDemoFlow && (
          <>
            <FieldRow label="商品数据来源池" fieldKey="productDataPool">
              <select
                disabled={disabled}
                value={requirement.productDataPool ?? "平台大盘热销池"}
                onChange={(e) => onUpdateField("productDataPool", e.target.value)}
                className={inputClass}
              >
                {PRODUCT_DATA_POOL_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </FieldRow>
            <FieldRow label="商品类目" fieldKey="categoryName">
              <input
                disabled={disabled}
                value={requirement.categoryName ?? requirement.industry ?? ""}
                onChange={(e) => onUpdateField("categoryName", e.target.value)}
                className={inputClass}
                placeholder="类目名称"
              />
            </FieldRow>
            <FieldRow label="类目 ID">
              <input
                disabled={disabled}
                value={requirement.categoryId ?? ""}
                onChange={(e) => onUpdateField("categoryId", e.target.value)}
                className={inputClass}
                placeholder="可选"
              />
            </FieldRow>
            <FieldRow label="商品选取方式" fieldKey="pickMethod">
              <select
                disabled={disabled}
                value={requirement.pickMethod ?? "AI 智能优选"}
                onChange={(e) => onUpdateField("pickMethod", e.target.value)}
                className={inputClass}
              >
                {PICK_METHOD_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </FieldRow>
          </>
        )}

        {!nativeDemoFlow && (
          <FieldRow label="商品选取方式" fieldKey="productSelectionMethod">
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
          </FieldRow>
        )}

        <FieldRow label="智能选品数量" fieldKey="selectionCount">
          {nativeDemoFlow ? (
            <select
              disabled={disabled}
              value={String(requirement.selectionCount ?? 5)}
              onChange={(e) => onUpdateField("selectionCount", e.target.value)}
              className={inputClass}
            >
              {SELECTION_COUNT_PRESETS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          ) : (
            <input
              type="number"
              min={1}
              disabled={disabled}
              value={requirement.selectionCount ?? 10}
              onChange={(e) => onUpdateField("selectionCount", e.target.value)}
              className={inputClass}
            />
          )}
        </FieldRow>

        {nativeDemoFlow && (
          <>
            <FieldRow label="选品核心策略" fieldKey="selectionCoreStrategy">
              <textarea
                disabled={disabled}
                value={requirement.selectionCoreStrategy ?? ""}
                onChange={(e) => onUpdateField("selectionCoreStrategy", e.target.value)}
                rows={3}
                className={cn(inputClass, "resize-none")}
                placeholder="热度/转化/匹配度策略；是否带权益"
              />
            </FieldRow>
            <FieldRow label="是否带权益" fieldKey="hasBenefitRights">
              <select
                disabled={disabled}
                value={requirement.hasBenefitRights ?? "否"}
                onChange={(e) => onUpdateField("hasBenefitRights", e.target.value)}
                className={inputClass}
              >
                <option value="是">是（优惠券/满减/赠品）</option>
                <option value="否">否</option>
              </select>
            </FieldRow>
          </>
        )}

        <FieldRow label="选品策略" fieldKey="selectionStrategy">
          <textarea
            disabled={disabled}
            value={requirement.selectionStrategy ?? ""}
            onChange={(e) => onUpdateField("selectionStrategy", e.target.value)}
            rows={2}
            className={cn(inputClass, "resize-none")}
            placeholder="AI 从诉求提取的筛选规则"
          />
        </FieldRow>

        {!disabled && (
          <div className="flex gap-2">
            <Button className="flex-1" variant="outline" onClick={onRunSelection} loading={loading}>
              <Sparkles className="h-4 w-4" />
              AI 智能选品
            </Button>
            <Button variant="ghost" size="sm" onClick={onRunSelection} title="刷新选品">
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
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
                {expanded ? "收起" : "查看全部"}
              </button>
            </div>
            <div className="mt-3 flex gap-3 overflow-x-auto pb-2">
              {(expanded ? campaign.recommendations : campaign.recommendations.slice(0, 8)).map(
                (rec) => (
                  <div
                    key={rec.sku.id}
                    className={cn(
                      "relative w-[140px] shrink-0 rounded-xl border p-2.5",
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
                    <div className="mb-1 flex h-14 items-center justify-center rounded bg-white text-lg">
                      📦
                    </div>
                    <p className="line-clamp-2 text-[10px] font-medium">{rec.sku.name}</p>
                    <p className="text-[9px] text-gray-400">{rec.sku.skuCode}</p>
                    <p className="text-[10px] text-gray-600">¥{rec.sku.price}</p>
                    {nativeDemoFlow && (
                      <p className="mt-0.5 text-[9px] text-gray-500">
                        30天销 {rec.sku.sales30d ?? "—"} · {rec.sku.cvrTag ?? "—"}
                      </p>
                    )}
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
