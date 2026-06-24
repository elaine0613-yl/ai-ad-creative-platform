"use client";

import { Button } from "@/components/ui/Button";
import {
  buildCampaignFieldGroups,
  type CampaignFieldGroup,
  type CampaignFieldItem,
} from "@/lib/campaign/field-map";
import type { InteractionLogEntry } from "@/lib/campaign/live-sync";
import type { CampaignSnapshot } from "@/lib/campaign/types";
import type { MaterialType } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Bot, CheckCircle2, Loader2, Sparkles, User } from "lucide-react";
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
  /** 实时解析模式：根据输入框内容动态预览 */
  livePreview?: boolean;
  /** 正在与 Agent 同步 */
  syncing?: boolean;
  /** 刚更新的字段，用于高亮 */
  highlightedFields?: string[];
  /** 对话 → 字段映射记录 */
  interactionLog?: InteractionLogEntry[];
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
  highlighted,
}: {
  item: CampaignFieldItem;
  onSave: (fieldKey: string, value: string) => void;
  savingKey: string | null;
  readOnly?: boolean;
  highlighted?: boolean;
}) {
  const isEmpty = !item.value || item.value === "待补充";
  const [draft, setDraft] = useState(item.value === "待补充" ? "" : item.value);

  useEffect(() => {
    setDraft(item.value === "待补充" ? "" : item.value);
  }, [item.value]);

  const rowClass = cn(
    "grid grid-cols-[7rem_1fr] gap-3 border-b border-gray-50 py-3 last:border-0 transition-colors duration-500",
    highlighted && "rounded-lg bg-amber-50/80 px-2 -mx-2 ring-1 ring-amber-200"
  );

  if (!item.editable || readOnly) {
    return (
      <div className={rowClass}>
        <dt className="text-xs font-medium text-gray-500">{item.label}</dt>
        <dd className={cn("text-sm", isEmpty ? "italic text-gray-400" : "text-gray-900")}>
          {item.value || "—"}
        </dd>
      </div>
    );
  }

  return (
    <div className={rowClass}>
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
            highlighted={highlightedFields?.includes(item.fieldKey)}
          />
        ))}
      </dl>

      {children}
    </section>
  );
}

function InteractionLog({ entries }: { entries: InteractionLogEntry[] }) {
  if (entries.length === 0) return null;

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-semibold text-gray-700">对话映射记录</p>
      <p className="mt-0.5 text-[11px] text-gray-400">左侧每轮对话会实时更新右侧字段</p>
      <ul className="mt-3 max-h-40 space-y-2 overflow-y-auto">
        {entries.map((entry) => (
          <li key={entry.id} className="rounded-lg bg-gray-50 px-3 py-2 text-xs">
            <div className="flex items-start gap-2">
              <span
                className={cn(
                  "mt-0.5 shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium",
                  entry.role === "user" ? "bg-gray-900 text-white" : "bg-brand-100 text-brand-700"
                )}
              >
                {entry.role === "user" ? "运营" : "Agent"}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-gray-600">{entry.message}</p>
                {entry.fieldUpdates.length > 0 && (
                  <div className="mt-1 flex flex-wrap gap-1">
                    {entry.fieldUpdates.map((u) => (
                      <span
                        key={`${entry.id}-${u.label}`}
                        className="rounded bg-white px-1.5 py-0.5 text-[10px] text-gray-700 ring-1 ring-gray-200"
                      >
                        {u.label} → {u.value}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
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
  onUpdateField,
  onConfirm,
  preview = false,
  livePreview = false,
  syncing = false,
  highlightedFields = [],
  interactionLog = [],
}: CampaignConfirmPanelProps) {
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const readOnly = preview || livePreview;

  const groups = useMemo(
    () => buildCampaignFieldGroups(campaign, materialType),
    [campaign, materialType]
  );

  const filledCount = useMemo(() => {
    return groups
      .flatMap((g) => g.items)
      .filter((i) => i.value && i.value !== "待补充").length;
  }, [groups]);

  const handleSave = async (fieldKey: string, value: string) => {
    if (readOnly) return;
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

  const headerMode = preview ? "preview" : livePreview ? "live" : "active";

  return (
    <div className={cn("mx-auto w-full max-w-2xl space-y-4", (preview || livePreview) && "opacity-95")}>
      <div
        className={cn(
          "sticky top-0 z-10 rounded-2xl border px-5 py-4 backdrop-blur-sm",
          headerMode === "preview" && "border-dashed border-gray-300 bg-white/95",
          headerMode === "live" && "border-amber-200 bg-amber-50/95",
          headerMode === "active" && "border-brand-100 bg-brand-50/95"
        )}
      >
        <div className="flex flex-wrap items-center gap-2">
          <p
            className={cn(
              "text-xs font-medium uppercase tracking-wide",
              headerMode === "active" ? "text-brand-600" : "text-gray-600"
            )}
          >
            需求确认清单
          </p>
          {headerMode === "preview" && (
            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-600">
              示例预览
            </span>
          )}
          {headerMode === "live" && (
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-700">
              实时解析
            </span>
          )}
          {headerMode === "active" && (
            <span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-medium text-green-700">
              已映射 {filledCount} 项
            </span>
          )}
          {syncing && (
            <span className="flex items-center gap-1 rounded-full bg-white px-2 py-0.5 text-[10px] font-medium text-gray-600 ring-1 ring-gray-200">
              <Loader2 className="h-3 w-3 animate-spin" />
              同步中
            </span>
          )}
        </div>
        <p className="mt-1 text-sm text-gray-700">
          {headerMode === "preview" &&
            "以下为模拟数据。开始输入左侧需求后，右侧将实时解析并映射字段。"}
          {headerMode === "live" &&
            "根据您正在输入的内容实时解析。发送后将与 Agent 确认并继续补充。"}
          {headerMode === "active" &&
            "与 Agent 对话时字段会实时更新。可直接修改列表，或在左侧继续补充。"}
        </p>
      </div>

      {!preview && interactionLog.length > 0 && <InteractionLog entries={interactionLog} />}

      {operatorGroup && (
        <FieldGroupSection
          group={operatorGroup}
          onSave={handleSave}
          savingKey={savingKey}
          readOnly={readOnly}
          highlightedFields={highlightedFields}
        />
      )}

      {agentGroup && (
        <FieldGroupSection
          group={agentGroup}
          onSave={handleSave}
          savingKey={savingKey}
          readOnly={readOnly}
          highlightedFields={highlightedFields}
        >
          <div className="mt-4 border-t border-gray-100 pt-4">
            <p className="mb-2 text-xs font-semibold text-gray-500">
              推荐选品{readOnly ? "（示例）" : "（点击切换）"}
            </p>
            <div className="space-y-2">
              {campaign.recommendations.slice(0, 3).map((rec) =>
                readOnly ? (
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
                    disabled={syncing}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-colors",
                      selectedSkuId === rec.sku.id
                        ? "border-gray-900 bg-gray-50"
                        : "border-gray-200 hover:border-gray-300",
                      syncing && "pointer-events-none opacity-60"
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
          readOnly
          highlightedFields={highlightedFields}
        />
      )}

      <Button
        className="w-full"
        size="lg"
        onClick={onConfirm}
        loading={loading}
        disabled={preview || livePreview || !selectedSkuId}
      >
        <Sparkles className="h-4 w-4" />
        {preview || livePreview ? "发送需求后开始确认" : "确认并生成"}
      </Button>
    </div>
  );
}
