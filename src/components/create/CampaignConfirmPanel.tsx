"use client";

import { Button } from "@/components/ui/Button";
import {
  buildCampaignFieldGroups,
  type CampaignFieldGroup,
  type CampaignFieldItem,
} from "@/lib/campaign/field-map";
import type { CampaignSnapshot } from "@/lib/campaign/types";
import type { MaterialType } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Bot, CheckCircle2, Sparkles, User } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

interface CampaignConfirmPanelProps {
  campaign: CampaignSnapshot;
  materialType: MaterialType;
  selectedSkuId: string | null;
  loading: boolean;
  onSelectSku: (skuId: string) => void;
  onUpdateField: (fieldKey: string, value: string) => Promise<void>;
  onConfirm: () => void;
  /** 示例预览模式：只展示结构，不可编辑 */
  preview?: boolean;
}

const OWNER_META = {
  operator: {
    icon: User,
    badge: "您确认",
    badgeClass: "bg-amber-50 text-amber-700",
  },
  agent: {
    icon: Bot,
    badge: "Agent 预设",
    badgeClass: "bg-brand-50 text-brand-700",
  },
  auto: {
    icon: Sparkles,
    badge: "自动完成",
    badgeClass: "bg-green-50 text-green-700",
  },
} as const;

function FieldRow({
  item,
  onSave,
  savingKey,
  readOnly,
}: {
  item: CampaignFieldItem;
  onSave: (fieldKey: string, value: string) => void;
  savingKey: string | null;
  readOnly?: boolean;
}) {
  const isEmpty = !item.value || item.value === "待补充";
  const [draft, setDraft] = useState(item.value === "待补充" ? "" : item.value);

  useEffect(() => {
    setDraft(item.value === "待补充" ? "" : item.value);
  }, [item.value]);

  if (!item.editable || readOnly) {
    return (
      <div className="grid grid-cols-[7rem_1fr] gap-3 border-b border-gray-50 py-3 last:border-0">
        <dt className="text-xs font-medium text-gray-500">{item.label}</dt>
        <dd className={cn("text-sm", isEmpty ? "italic text-gray-400" : "text-gray-900")}>
          {item.value}
        </dd>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-[7rem_1fr] gap-3 border-b border-gray-50 py-3 last:border-0">
      <dt className="pt-2 text-xs font-medium text-gray-500">{item.label}</dt>
      <dd>
        {item.multiline ? (
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={() => {
              if (draft !== (isEmpty ? "" : item.value)) onSave(item.fieldKey, draft);
            }}
            placeholder={item.placeholder}
            rows={2}
            className="w-full resize-none rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
          />
        ) : (
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={() => {
              if (draft !== (isEmpty ? "" : item.value)) onSave(item.fieldKey, draft);
            }}
            placeholder={item.placeholder}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
          />
        )}
        {savingKey === item.fieldKey && (
          <p className="mt-1 text-[11px] text-gray-400">保存中…</p>
        )}
      </dd>
    </div>
  );
}

function FieldGroupSection({
  group,
  onSave,
  savingKey,
  readOnly,
  children,
}: {
  group: CampaignFieldGroup;
  onSave: (fieldKey: string, value: string) => void;
  savingKey: string | null;
  readOnly?: boolean;
  children?: React.ReactNode;
}) {
  const meta = OWNER_META[group.owner];
  const Icon = meta.icon;

  return (
    <section className="rounded-2xl bg-white p-5 shadow-sm">
      <div className="flex items-start gap-3">
        <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg", meta.badgeClass)}>
          <Icon className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-semibold text-gray-900">{group.title}</h3>
            <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-medium", meta.badgeClass)}>
              {meta.badge}
            </span>
          </div>
          <p className="mt-0.5 text-xs text-gray-500">{group.description}</p>
        </div>
      </div>

      <dl className="mt-4">
        {group.items.map((item) => (
          <FieldRow
            key={item.id}
            item={item}
            onSave={onSave}
            savingKey={savingKey}
            readOnly={readOnly}
          />
        ))}
      </dl>

      {children}
    </section>
  );
}

export function CampaignConfirmPanel({
  campaign,
  materialType,
  selectedSkuId,
  loading,
  onSelectSku,
  onUpdateField,
  onConfirm,
  preview = false,
}: CampaignConfirmPanelProps) {
  const [savingKey, setSavingKey] = useState<string | null>(null);

  const groups = useMemo(
    () => buildCampaignFieldGroups(campaign, materialType),
    [campaign, materialType]
  );

  const handleSave = async (fieldKey: string, value: string) => {
    setSavingKey(fieldKey);
    try {
      await onUpdateField(fieldKey, value);
    } finally {
      setSavingKey(null);
    }
  };

  const operatorGroup = groups.find((g) => g.id === "operator");
  const agentGroup = groups.find((g) => g.id === "agent");
  const autoGroup = groups.find((g) => g.id === "auto");

  return (
    <div className={cn("mx-auto w-full max-w-2xl space-y-4", preview && "opacity-95")}>
      <div
        className={cn(
          "rounded-2xl border px-5 py-4",
          preview ? "border-dashed border-gray-300 bg-white" : "border-brand-100 bg-brand-50/60"
        )}
      >
        <div className="flex flex-wrap items-center gap-2">
          <p
            className={cn(
              "text-xs font-medium uppercase tracking-wide",
              preview ? "text-gray-500" : "text-brand-600"
            )}
          >
            需求确认清单
          </p>
          {preview && (
            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-600">
              示例预览
            </span>
          )}
        </div>
        <p className="mt-1 text-sm text-gray-700">
          {preview
            ? "以下为模拟数据，展示 Agent 拆解需求后的字段映射效果。在左侧输入真实需求后将自动替换。"
            : "右侧字段由 Agent 从对话中自动映射。请核对「需您确认」部分，缺失项可直接填写或在左侧对话补充。"}
        </p>
      </div>

      {operatorGroup && (
        <FieldGroupSection
          group={operatorGroup}
          onSave={handleSave}
          savingKey={savingKey}
          readOnly={preview}
        />
      )}

      {agentGroup && (
        <FieldGroupSection
          group={agentGroup}
          onSave={handleSave}
          savingKey={savingKey}
          readOnly={preview}
        >
          <div className="mt-4 border-t border-gray-100 pt-4">
            <p className="mb-2 text-xs font-semibold text-gray-500">
              推荐选品{preview ? "（示例）" : "（点击切换）"}
            </p>
            <div className="space-y-2">
              {campaign.recommendations.slice(0, 3).map((rec) =>
                preview ? (
                  <div
                    key={rec.sku.id}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-xl border p-3",
                      selectedSkuId === rec.sku.id
                        ? "border-gray-900 bg-gray-50"
                        : "border-gray-200 bg-white"
                    )}
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-gray-900">{rec.sku.name}</p>
                      <p className="text-xs text-gray-500">
                        ¥{rec.sku.price} · {rec.reason}
                      </p>
                    </div>
                    {selectedSkuId === rec.sku.id && (
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-gray-900" />
                    )}
                  </div>
                ) : (
                  <button
                    key={rec.sku.id}
                    type="button"
                    onClick={() => onSelectSku(rec.sku.id)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-colors",
                      selectedSkuId === rec.sku.id
                        ? "border-gray-900 bg-gray-50"
                        : "border-gray-200 hover:border-gray-300"
                    )}
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-gray-900">{rec.sku.name}</p>
                      <p className="text-xs text-gray-500">
                        ¥{rec.sku.price} · {rec.reason}
                      </p>
                    </div>
                    {selectedSkuId === rec.sku.id && (
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-gray-900" />
                    )}
                  </button>
                )
              )}
            </div>
          </div>
        </FieldGroupSection>
      )}

      {autoGroup && (
        <FieldGroupSection
          group={autoGroup}
          onSave={handleSave}
          savingKey={savingKey}
          readOnly={preview}
        />
      )}

      <Button
        className="w-full"
        size="lg"
        onClick={onConfirm}
        loading={loading}
        disabled={preview || !selectedSkuId}
      >
        <Sparkles className="h-4 w-4" />
        {preview ? "在左侧输入需求后开始" : "确认并生成"}
      </Button>
    </div>
  );
}
