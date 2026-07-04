"use client";

import { Button } from "@/components/ui/Button";
import {
  LIGHTING_TEXTURE_OPTIONS,
  VISUAL_THEME_FORM_OPTIONS,
  withImageCreativeDefaults,
} from "@/lib/campaign/image-native-flow";
import type { ImageCreativePlanFields } from "@/lib/campaign/types";
import { cn } from "@/lib/utils";
import { RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";

type FieldDef =
  | {
      key: keyof ImageCreativePlanFields;
      label: string;
      multiline?: boolean;
      type?: "text";
    }
  | {
      key: keyof ImageCreativePlanFields;
      label: string;
      type: "select";
      options: readonly string[];
    };

const FIELD_DEFS: FieldDef[] = [
  { key: "creativeAtmosphere", label: "整体创意氛围" },
  { key: "mainTitle", label: "主标题" },
  { key: "subTitle", label: "副标题" },
  { key: "ctaTitle", label: "CTA 行动标题" },
  {
    key: "visualThemeForm",
    label: "画面主题形式",
    type: "select",
    options: VISUAL_THEME_FORM_OPTIONS,
  },
  { key: "productDisplayForm", label: "商品展示形态" },
  { key: "sceneEnvironment", label: "场景环境" },
  {
    key: "lightingTexture",
    label: "画面光影 & 质感",
    type: "select",
    options: LIGHTING_TEXTURE_OPTIONS,
  },
  { key: "creativeStoryKernel", label: "创意描述", multiline: true },
];

interface CreativePlanFieldsPanelProps {
  fields: ImageCreativePlanFields;
  readOnly?: boolean;
  onChange?: (fields: ImageCreativePlanFields) => void;
  onRegenerate?: () => void;
  loading?: boolean;
}

export function CreativePlanFieldsPanel({
  fields,
  readOnly,
  onChange,
  onRegenerate,
  loading,
}: CreativePlanFieldsPanelProps) {
  const [draft, setDraft] = useState(() => withImageCreativeDefaults(fields));

  useEffect(() => {
    setDraft(withImageCreativeDefaults(fields));
  }, [fields]);

  const inputClass =
    "w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100";

  const update = (key: keyof ImageCreativePlanFields, value: string) => {
    const next = { ...draft, [key]: value };
    setDraft(next);
    onChange?.(next);
  };

  return (
    <section className="rounded-2xl border border-purple-100 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">创意方案配置</h3>
          <p className="mt-0.5 text-xs text-gray-500">
            AI 结合渠道、人群、权益与价格带生成；可逐条微调，品牌 LOGO / 合规兜底后置批量处理
          </p>
        </div>
      </div>

      <div className="mt-4 space-y-3">
        {FIELD_DEFS.map((def) => {
          const { key, label } = def;
          return (
            <div key={key} className="grid grid-cols-[6.5rem_1fr] items-start gap-3">
              <label className="pt-2 text-xs font-medium text-gray-500">{label}</label>
              {def.type === "select" ? (
                <select
                  disabled={readOnly}
                  value={draft[key]}
                  onChange={(e) => update(key, e.target.value)}
                  className={cn(inputClass, "bg-white")}
                >
                  {def.options.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              ) : def.multiline ? (
                <textarea
                  rows={3}
                  disabled={readOnly}
                  value={draft[key]}
                  onChange={(e) => update(key, e.target.value)}
                  className={cn(inputClass, "resize-none")}
                />
              ) : (
                <input
                  disabled={readOnly}
                  value={draft[key]}
                  onChange={(e) => update(key, e.target.value)}
                  className={inputClass}
                />
              )}
            </div>
          );
        })}
      </div>

      {onRegenerate && !readOnly && (
        <Button variant="outline" size="sm" className="mt-4" onClick={onRegenerate} loading={loading}>
          <RefreshCw className="h-3.5 w-3.5" />
          重新生成创意方案
        </Button>
      )}
    </section>
  );
}
