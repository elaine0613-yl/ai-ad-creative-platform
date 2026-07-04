"use client";

import { Button } from "@/components/ui/Button";
import {
  buildCampaignFieldGroups,
  type CampaignFieldGroup,
  type CampaignFieldItem,
} from "@/lib/campaign/field-map";
import type { CampaignSnapshot } from "@/lib/campaign/types";
import {
  formatCreativePlanText,
  isRequirementEditableStage,
} from "@/lib/campaign/workflow";
import type { MaterialType } from "@/lib/types";
import { cn } from "@/lib/utils";
import {
  Bot,
  Check,
  CheckCircle2,
  Loader2,
  Package,
  Sparkles,
  User,
  Wand2,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

interface CampaignConfirmPanelProps {
  campaign: CampaignSnapshot;
  materialType: MaterialType;
  selectedSkuId: string | null;
  loading: boolean;
  onSelectSku: (skuId: string) => void;
  onRemoveSku?: (skuId: string) => void;
  onUpdateField: (fieldKey: string, value: string) => Promise<void>;
  onConfirmRequirement?: () => void;
  onConfirmProduct?: () => void;
  onGenerateCreative?: () => void;
  onStartGeneration?: () => void;
  onStartFromDemo?: () => void;
  /** 确认选品按钮由外部（选品模块下方）渲染时设为 true */
  externalConfirmProduct?: boolean;
  /** 创意生成模块独立展示时隐藏面板内「创意生成」按钮 */
  hideGenerateCreative?: boolean;
  preview?: boolean;
  livePreview?: boolean;
  syncing?: boolean;
  highlightedFields?: string[];
  agentFilledKeys?: Set<string>;
  selectedSkuIds?: string[];
  /** AI 原生图片链路：需求确认面板字段结构 */
  nativeDemoFlow?: boolean;
}

const OWNER_META = {
  operator: { icon: User, badge: "可编辑", badgeClass: "bg-amber-50 text-amber-700" },
  agent: { icon: Bot, badge: "Agent 解析", badgeClass: "bg-brand-50 text-brand-700" },
  auto: { icon: Sparkles, badge: "自动完成", badgeClass: "bg-green-50 text-green-700" },
} as const;

function FormField({
  item,
  onSave,
  savingKey,
  readOnly,
  highlighted,
}: {
  item: CampaignFieldItem;
  onSave: (fieldKey: string, value: string) => void;
  savingKey: string | null;
  readOnly?: boolean;
  highlighted?: boolean;
}) {
  const isEmpty = !item.value || item.value === "待补充";
  const [draft, setDraft] = useState(isEmpty ? "" : item.value);

  useEffect(() => {
    setDraft(isEmpty ? "" : item.value);
  }, [item.value, isEmpty]);

  const wrapClass = cn(
    "grid grid-cols-[7.5rem_1fr] items-start gap-3 border-b border-gray-50 py-3 last:border-0 transition-colors duration-500",
    highlighted && "rounded-lg bg-amber-50/80 px-2 -mx-2 ring-1 ring-amber-200"
  );

  const labelEl = (
    <label className="flex items-center gap-1.5 pt-2 text-xs font-medium text-gray-500">
      {item.label}
      {item.hint && <span className="font-normal text-gray-400">{item.hint}</span>}
    </label>
  );

  if (!item.editable || readOnly) {
    return (
      <div className={wrapClass}>
        {labelEl}
        <p className={cn("pt-2 text-sm", isEmpty ? "italic text-gray-400" : "text-gray-900")}>
          {item.value || "—"}
        </p>
      </div>
    );
  }

  const saveIfChanged = () => {
    const normalized = draft.trim();
    const current = isEmpty ? "" : item.value;
    if (normalized !== current) onSave(item.fieldKey, normalized);
  };

  const inputClass =
    "w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100";

  return (
    <div className={wrapClass}>
      {labelEl}
      <div>
        {item.inputType === "select" && item.options ? (
          <select
            value={draft}
            onChange={(e) => {
              setDraft(e.target.value);
              onSave(item.fieldKey, e.target.value);
            }}
            className={inputClass}
          >
            {item.options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        ) : item.inputType === "number" ? (
          <input
            type="number"
            min={1}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={saveIfChanged}
            placeholder={item.placeholder}
            className={inputClass}
          />
        ) : item.multiline ? (
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={saveIfChanged}
            placeholder={item.placeholder}
            rows={3}
            className={cn(inputClass, "resize-none")}
          />
        ) : (
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={saveIfChanged}
            placeholder={item.placeholder}
            className={inputClass}
          />
        )}
        {savingKey === item.fieldKey && <p className="mt-1 text-[11px] text-gray-400">保存中…</p>}
      </div>
    </div>
  );
}

function MaterialPlanSection({
  group,
  onSave,
  savingKey,
  readOnly,
  highlightedFields,
  children,
}: {
  group: CampaignFieldGroup;
  onSave: (fieldKey: string, value: string) => void;
  savingKey: string | null;
  readOnly?: boolean;
  highlightedFields?: string[];
  children?: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl bg-white p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-gray-900">{group.title}</h3>
      <p className="mt-0.5 text-xs text-gray-500">{group.description}</p>
      <div className="mt-4">
        {group.items.map((item) => (
          <FormField
            key={item.id}
            item={item}
            onSave={onSave}
            savingKey={savingKey}
            readOnly={readOnly}
            highlighted={highlightedFields?.includes(item.fieldKey)}
          />
        ))}
      </div>
      {children}
    </section>
  );
}

function AgentProductCards({
  campaign,
  selectedSkuId,
  readOnly,
  syncing,
  showSelect,
  onSelectSku,
  onRemoveSku,
}: {
  campaign: CampaignSnapshot;
  selectedSkuId: string | null;
  readOnly?: boolean;
  syncing?: boolean;
  showSelect?: boolean;
  onSelectSku: (skuId: string) => void;
  onRemoveSku?: (skuId: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);

  if (campaign.recommendations.length === 0) return null;

  const visible = expanded ? campaign.recommendations : campaign.recommendations.slice(0, 6);

  return (
    <div className="mt-4 border-t border-gray-100 pt-4">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Package className="h-4 w-4 text-brand-600" />
          <p className="text-xs font-semibold text-gray-800">Agent 智能选品</p>
          <span className="rounded-full bg-brand-50 px-2 py-0.5 text-[10px] text-brand-700">
            {campaign.recommendations.length} 个
          </span>
        </div>
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="text-xs text-brand-600 hover:text-brand-700"
        >
          {expanded ? "收起" : "管理商品 List"}
        </button>
      </div>

      <div className="mt-3 flex gap-3 overflow-x-auto pb-2">
        {visible.map((rec) => (
          <div
            key={rec.sku.id}
            className={cn(
              "relative flex w-[140px] shrink-0 flex-col rounded-xl border bg-gray-50 p-3 transition-colors",
              showSelect && selectedSkuId === rec.sku.id
                ? "border-gray-900 ring-1 ring-gray-900"
                : "border-gray-200"
            )}
          >
            {!readOnly && onRemoveSku && (
              <button
                type="button"
                onClick={() => onRemoveSku(rec.sku.id)}
                disabled={syncing}
                className="absolute right-1.5 top-1.5 rounded-md p-0.5 text-gray-400 hover:bg-white hover:text-red-500"
                aria-label="删除"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}

            <div className="mb-2 flex h-16 items-center justify-center rounded-lg bg-white text-2xl">
              📦
            </div>
            <p className="line-clamp-2 text-xs font-medium text-gray-900">{rec.sku.name}</p>
            <p className="mt-1 text-[10px] text-gray-500">¥{rec.sku.price}</p>

            {showSelect && !readOnly && (
              <button
                type="button"
                onClick={() => onSelectSku(rec.sku.id)}
                disabled={syncing}
                className={cn(
                  "mt-2 rounded-lg border px-2 py-1 text-[10px] transition-colors",
                  selectedSkuId === rec.sku.id
                    ? "border-gray-900 bg-gray-900 text-white"
                    : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                )}
              >
                {selectedSkuId === rec.sku.id ? "已选" : "选择"}
              </button>
            )}

            {showSelect && readOnly && selectedSkuId === rec.sku.id && (
              <CheckCircle2 className="mt-2 h-4 w-4 text-gray-900" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function CreativePlanBlock({
  campaign,
  materialType,
}: {
  campaign: CampaignSnapshot;
  materialType: MaterialType;
}) {
  if (!campaign.creative) return null;

  return (
    <section className="rounded-2xl border border-purple-100 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-2">
        <Wand2 className="h-4 w-4 text-purple-600" />
        <h3 className="text-sm font-semibold text-gray-900">创意方案详情</h3>
      </div>
      <pre className="mt-3 whitespace-pre-wrap rounded-xl bg-gray-50 p-4 text-sm leading-relaxed text-gray-800">
        {formatCreativePlanText(campaign.creative, materialType)}
      </pre>
    </section>
  );
}

function AutoSection({ group }: { group: CampaignFieldGroup }) {
  const meta = OWNER_META[group.owner];
  const Icon = meta.icon;

  return (
    <section className="rounded-2xl border border-green-100 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-2">
        <div className={cn("flex h-8 w-8 items-center justify-center rounded-lg", meta.badgeClass)}>
          <Icon className="h-4 w-4" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-gray-900">{group.title}</h3>
          <p className="text-xs text-gray-500">{group.description}</p>
        </div>
      </div>
      <ul className="mt-3 space-y-2">
        {group.items.map((item) => (
          <li key={item.id} className="flex items-start gap-2 rounded-lg bg-gray-50 px-3 py-2 text-xs text-gray-600">
            <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-green-600" />
            <span>
              <span className="font-medium text-gray-800">{item.label}：</span>
              {item.value}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function CampaignConfirmPanel({
  campaign,
  materialType,
  selectedSkuId,
  loading,
  onSelectSku,
  onRemoveSku,
  onUpdateField,
  onConfirmRequirement,
  onConfirmProduct,
  onGenerateCreative,
  onStartGeneration,
  onStartFromDemo,
  externalConfirmProduct = false,
  hideGenerateCreative = false,
  preview = false,
  livePreview = false,
  syncing = false,
  highlightedFields = [],
  agentFilledKeys,
  selectedSkuIds = [],
  nativeDemoFlow = false,
}: CampaignConfirmPanelProps) {
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const isDemo = preview || livePreview;

  const fieldsEditable = preview
    ? false
    : livePreview || (!isDemo && isRequirementEditableStage(campaign.stage));
  const showProductSelect = !isDemo && campaign.stage === "product_review";
  const showCreative = !!campaign.creative;
  const canGenerateCreative =
    !isDemo && campaign.stage === "creative_review" && !campaign.creative;
  const canStartGeneration =
    !isDemo && campaign.stage === "creative_review" && !!campaign.creative;

  const groups = useMemo(
    () => buildCampaignFieldGroups(campaign, materialType, agentFilledKeys, nativeDemoFlow),
    [campaign, materialType, agentFilledKeys, nativeDemoFlow]
  );

  const handleSave = async (fieldKey: string, value: string) => {
    if (!fieldsEditable) return;
    setSavingKey(fieldKey);
    try {
      await onUpdateField(fieldKey, value);
    } finally {
      setSavingKey(null);
    }
  };

  const basicGroup = groups.find((g) => g.id === "basic-info");
  const landingGroup = groups.find((g) => g.id === "material-landing");
  const creativeGroup = groups.find((g) => g.id === "creative-plan");
  const autoGroup = groups.find((g) => g.id === "auto");

  return (
    <div className={cn("mx-auto w-full max-w-2xl space-y-4", isDemo && "opacity-95")}>
      <div className="space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-sm font-semibold text-gray-900">AI 素材方案</h2>
          {preview && (
            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] text-gray-600">示例</span>
          )}
          {syncing && (
            <span className="flex items-center gap-1 text-[10px] text-gray-500">
              <Loader2 className="h-3 w-3 animate-spin" />
              同步中
            </span>
          )}
        </div>
        <p className="text-xs text-gray-500">
          {isDemo
            ? "运营发一段话 → 智能填写配置 → 核对基础信息"
            : campaign.stage === "confirm"
              ? "核对基础信息，确认后进入智能选品。"
              : campaign.stage === "product_review"
                ? "基础信息已确认，请在下方智能选品模块配置并确认商品。"
                : campaign.stage === "creative_review"
                  ? nativeDemoFlow
                    ? "选品已确认，请核对创意方案配置后进入预览。"
                    : showCreative
                      ? "创意已生成并预填配置面板，确认后开始审核并生成。"
                      : "请点击「创意生成」。"
                  : "方案已锁定，进入生成与审核流程。"}
        </p>
      </div>

      {basicGroup && (
        <MaterialPlanSection
          group={basicGroup}
          onSave={handleSave}
          savingKey={savingKey}
          readOnly={!fieldsEditable}
          highlightedFields={highlightedFields}
        />
      )}

      {landingGroup && campaign.requirement?.confirmedSkuIds?.length ? (
        <MaterialPlanSection
          group={landingGroup}
          onSave={handleSave}
          savingKey={savingKey}
          readOnly={!fieldsEditable}
          highlightedFields={highlightedFields}
        />
      ) : null}

      {creativeGroup && fieldsEditable && !nativeDemoFlow && (
        <MaterialPlanSection
          group={creativeGroup}
          onSave={handleSave}
          savingKey={savingKey}
          readOnly={false}
          highlightedFields={highlightedFields}
        />
      )}

      {showCreative &&
        campaign.creativePlan &&
        campaign.creativePlan.sections.length === 0 &&
        !nativeDemoFlow && (
        <CreativePlanBlock campaign={campaign} materialType={materialType} />
      )}

      {autoGroup && (isDemo || campaign.stage === "confirm") && <AutoSection group={autoGroup} />}

      <div className="space-y-2">
        {!isDemo && campaign.stage === "confirm" && onConfirmRequirement && (
          <Button className="w-full" size="lg" onClick={onConfirmRequirement} loading={loading}>
            <Check className="h-4 w-4" />
            确认基础信息
          </Button>
        )}

        {!isDemo && campaign.stage === "product_review" && onConfirmProduct && !externalConfirmProduct && (
          <Button
            className="w-full"
            size="lg"
            onClick={onConfirmProduct}
            loading={loading}
            disabled={selectedSkuIds.length === 0}
          >
            <Package className="h-4 w-4" />
            确认选品（{selectedSkuIds.length}）
          </Button>
        )}

        {canGenerateCreative && onGenerateCreative && !hideGenerateCreative && (
          <Button className="w-full" size="lg" variant="outline" onClick={onGenerateCreative} loading={loading}>
            <Wand2 className="h-4 w-4" />
            创意生成
          </Button>
        )}

        {canStartGeneration && onStartGeneration && !hideGenerateCreative && !nativeDemoFlow && (
          <Button className="w-full" size="lg" onClick={onStartGeneration} loading={loading}>
            <Sparkles className="h-4 w-4" />
            开始审核并生成
          </Button>
        )}

        {isDemo && (
          <Button
            className="w-full"
            size="lg"
            onClick={onStartFromDemo}
            disabled={!onStartFromDemo}
          >
            {onStartFromDemo ? "发送左侧诉求并开始" : "发送诉求后开始"}
          </Button>
        )}
      </div>
    </div>
  );
}
