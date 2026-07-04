"use client";

import { setNestedValue } from "@/lib/create/agent-to-config";
import type { ConfigModuleDef } from "@/lib/create/config-types";
import {
  IMAGE_CONFIG_FIELDS,
  IMAGE_CONFIG_MODULES,
} from "@/lib/create/image-config-schema";
import {
  VIDEO_CONFIG_FIELDS,
  VIDEO_CONFIG_MODULES,
} from "@/lib/create/video-config-schema";
import type { MaterialType } from "@/lib/types";
import { cn } from "@/lib/utils";
import { ChevronDown, Save } from "lucide-react";
import { useState } from "react";
import { ConfigFieldRenderer } from "./ConfigFieldRenderer";

interface StructuredConfigPanelProps {
  materialType: MaterialType;
  values: Record<string, unknown>;
  onChange: (values: Record<string, unknown>, changedFieldId?: string) => void;
  readOnly?: boolean;
  highlightedFields?: string[];
  agentFilledFields?: string[];
  onSaveTemplate?: (moduleId: string) => void;
}

export function StructuredConfigPanel({
  materialType,
  values,
  onChange,
  readOnly,
  highlightedFields = [],
  agentFilledFields = [],
  onSaveTemplate,
}: StructuredConfigPanelProps) {
  const modules: ConfigModuleDef[] =
    materialType === "image" ? IMAGE_CONFIG_MODULES : VIDEO_CONFIG_MODULES;
  const fieldsMap = materialType === "image" ? IMAGE_CONFIG_FIELDS : VIDEO_CONFIG_FIELDS;

  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const handleFieldChange = (fieldId: string, value: unknown) => {
    onChange(setNestedValue(values, fieldId, value), fieldId);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-gray-900">
            {materialType === "image" ? "图片创作配置面板" : "视频创作配置面板"}
          </h2>
          <p className="mt-0.5 text-xs text-gray-500">
            支持手动输入、下拉选择、素材库选取
          </p>
        </div>
      </div>

      {modules.map((mod) => {
        const fields = fieldsMap[mod.id] ?? [];
        const isCollapsed = collapsed[mod.id];

        return (
          <section key={mod.id} className="rounded-2xl bg-white shadow-sm">
            <button
              type="button"
              onClick={() => setCollapsed((c) => ({ ...c, [mod.id]: !c[mod.id] }))}
              className="flex w-full items-center justify-between px-5 py-4 text-left"
            >
              <div>
                <h3 className="text-sm font-semibold text-gray-900">{mod.title}</h3>
                {mod.description && (
                  <p className="mt-0.5 text-xs text-gray-500">{mod.description}</p>
                )}
              </div>
              <ChevronDown
                className={cn(
                  "h-4 w-4 text-gray-400 transition-transform",
                  isCollapsed && "-rotate-90"
                )}
              />
            </button>

            {!isCollapsed && (
              <div className="border-t border-gray-50 px-5 pb-4">
                {fields.map((field) => (
                  <ConfigFieldRenderer
                    key={field.id}
                    field={field}
                    values={values}
                    onChange={handleFieldChange}
                    materialType={materialType}
                    readOnly={readOnly}
                    highlighted={highlightedFields.includes(field.id)}
                    agentFilled={agentFilledFields.includes(field.id)}
                  />
                ))}
                {onSaveTemplate && !readOnly && (
                  <button
                    type="button"
                    onClick={() => onSaveTemplate(mod.id)}
                    className="mt-2 flex items-center gap-1 text-xs text-brand-600 hover:text-brand-700"
                  >
                    <Save className="h-3.5 w-3.5" />
                    将本模块配置另存为模板（个人素材库）
                  </button>
                )}
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}
