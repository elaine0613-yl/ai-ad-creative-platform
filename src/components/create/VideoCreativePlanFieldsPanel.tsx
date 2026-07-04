"use client";

import { Button } from "@/components/ui/Button";
import {
  CAMERA_MOVEMENT_OPTIONS,
  CORE_LENS_FOCUS_OPTIONS,
  CUT_FREQUENCY_OPTIONS,
  DYNAMIC_LIGHTING_OPTIONS,
  DYNAMIC_VISUAL_EFFECT_OPTIONS,
  LENS_COMPOSITION_OPTIONS,
  VIDEO_PLOT_STRUCTURE_OPTIONS,
  VOICEOVER_STYLE_OPTIONS,
  withVideoCreativeDefaults,
} from "@/lib/campaign/video-native-flow";
import type { VideoCreativePlanFields } from "@/lib/campaign/types";
import { cn } from "@/lib/utils";
import { RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";

type FieldDef =
  | { key: keyof VideoCreativePlanFields; label: string; multiline?: boolean }
  | {
      key: keyof VideoCreativePlanFields;
      label: string;
      type: "select";
      options: readonly string[];
    };

const FIELD_DEFS: FieldDef[] = [
  { key: "creativeAtmosphere", label: "整体创意氛围" },
  { key: "mainTitle", label: "主标题" },
  { key: "subTitle", label: "副标题" },
  { key: "ctaTitle", label: "CTA 行动标题" },
  { key: "sceneEnvironment", label: "场景环境" },
  {
    key: "lensCompositionForm",
    label: "镜头组合形式",
    type: "select",
    options: LENS_COMPOSITION_OPTIONS,
  },
  {
    key: "cameraMovement",
    label: "运镜方式",
    type: "select",
    options: CAMERA_MOVEMENT_OPTIONS,
  },
  {
    key: "cutFrequency",
    label: "镜头切换频率",
    type: "select",
    options: CUT_FREQUENCY_OPTIONS,
  },
  {
    key: "videoPlotStructure",
    label: "视频剧情结构",
    type: "select",
    options: VIDEO_PLOT_STRUCTURE_OPTIONS,
  },
  {
    key: "coreLensFocus",
    label: "核心镜头侧重",
    type: "select",
    options: CORE_LENS_FOCUS_OPTIONS,
  },
  {
    key: "voiceoverStyle",
    label: "口播文案风格",
    type: "select",
    options: VOICEOVER_STYLE_OPTIONS,
  },
  {
    key: "dynamicLighting",
    label: "动态光影变化",
    type: "select",
    options: DYNAMIC_LIGHTING_OPTIONS,
  },
  {
    key: "dynamicVisualEffect",
    label: "画面动态效果",
    type: "select",
    options: DYNAMIC_VISUAL_EFFECT_OPTIONS,
  },
  { key: "creativeStoryKernel", label: "创意描述", multiline: true },
  { key: "fullVideoScript", label: "完整剧情脚本", multiline: true },
];

interface VideoCreativePlanFieldsPanelProps {
  fields: VideoCreativePlanFields;
  readOnly?: boolean;
  onChange?: (fields: VideoCreativePlanFields) => void;
  onRegenerate?: () => void;
  loading?: boolean;
}

export function VideoCreativePlanFieldsPanel({
  fields,
  readOnly,
  onChange,
  onRegenerate,
  loading,
}: VideoCreativePlanFieldsPanelProps) {
  const [draft, setDraft] = useState(() => withVideoCreativeDefaults(fields));

  useEffect(() => {
    setDraft(withVideoCreativeDefaults(fields));
  }, [fields]);

  const inputClass =
    "w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100";

  const update = (key: keyof VideoCreativePlanFields, value: string) => {
    const next = { ...draft, [key]: value };
    setDraft(next);
    onChange?.(next);
  };

  return (
    <section className="rounded-2xl border border-purple-100 bg-white p-5 shadow-sm">
      <div>
        <h3 className="text-sm font-semibold text-gray-900">创意方案配置</h3>
        <p className="mt-0.5 text-xs text-gray-500">
          AI 生成镜头脚本与动态创意；BGM / 字幕样式 / LOGO / 片尾模板后置工程批量合成
        </p>
      </div>

      <div className="mt-4 space-y-3">
        {FIELD_DEFS.map((def) => {
          const { key, label } = def;
          return (
            <div key={key} className="grid grid-cols-[6.5rem_1fr] items-start gap-3">
              <label className="pt-2 text-xs font-medium text-gray-500">{label}</label>
              {"type" in def && def.type === "select" ? (
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
                  rows={key === "fullVideoScript" ? 6 : 3}
                  disabled={readOnly}
                  value={draft[key]}
                  onChange={(e) => update(key, e.target.value)}
                  className={cn(inputClass, "resize-none font-mono text-xs leading-relaxed")}
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
