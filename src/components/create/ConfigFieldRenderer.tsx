"use client";

import type { ConfigFieldDef } from "@/lib/create/config-types";
import { getNestedValue } from "@/lib/create/agent-to-config";
import type { MaterialType } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Bot } from "lucide-react";
import { MaterialAssetPicker } from "./MaterialAssetPicker";

interface ConfigFieldRendererProps {
  field: ConfigFieldDef;
  values: Record<string, unknown>;
  onChange: (fieldId: string, value: unknown) => void;
  materialType: MaterialType;
  readOnly?: boolean;
  highlighted?: boolean;
  agentFilled?: boolean;
}

function AgentBadge() {
  return (
    <span
      className="inline-flex shrink-0 items-center gap-0.5 rounded-md bg-brand-50 px-1.5 py-1 text-[9px] font-medium text-brand-700"
      title="Agent 自动填充，可修改"
    >
      <Bot className="h-3 w-3" />
      Agent
    </span>
  );
}

export function ConfigFieldRenderer({
  field,
  values,
  onChange,
  materialType,
  readOnly,
  highlighted,
  agentFilled,
}: ConfigFieldRendererProps) {
  const raw = getNestedValue(values, field.id);
  const inputClass =
    "w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100 disabled:bg-gray-50";

  const wrapClass = cn(
    "grid min-w-0 grid-cols-[7.5rem_minmax(0,1fr)_auto] items-start gap-3 border-b border-gray-50 py-3 last:border-0",
    agentFilled && "bg-brand-50/20",
    highlighted && "rounded-lg bg-amber-50/80 px-2 -mx-2 ring-1 ring-amber-200"
  );

  const label = (
    <label className="pt-2 text-xs font-medium text-gray-500">
      {field.label}
      {field.hint && <span className="mt-0.5 block font-normal text-gray-400">{field.hint}</span>}
    </label>
  );

  const badgeCol = agentFilled ? <AgentBadge /> : <span className="w-14" />;

  if (readOnly) {
    const display =
      typeof raw === "boolean"
        ? raw
          ? "开启"
          : "关闭"
        : Array.isArray(raw)
          ? raw.join("、") || "—"
          : String(raw ?? "—");
    return (
      <div className={wrapClass}>
        {label}
        <p className={cn("pt-2 text-sm text-gray-900", agentFilled && "font-medium")}>{display}</p>
        {badgeCol}
      </div>
    );
  }

  switch (field.type) {
    case "textarea":
      return (
        <div className={wrapClass}>
          {label}
          <textarea
            value={String(raw ?? "")}
            onChange={(e) => onChange(field.id, e.target.value)}
            placeholder={field.placeholder}
            rows={field.rows ?? 2}
            className={cn(inputClass, "resize-none", agentFilled && "border-brand-200")}
          />
          {badgeCol}
        </div>
      );
    case "select":
      return (
        <div className={wrapClass}>
          {label}
          <select
            value={String(raw ?? "")}
            onChange={(e) => onChange(field.id, e.target.value)}
            className={cn(inputClass, agentFilled && "border-brand-200")}
          >
            {field.options?.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          {badgeCol}
        </div>
      );
    case "multiselect": {
      const selected = Array.isArray(raw) ? (raw as string[]) : [];
      return (
        <div className={wrapClass}>
          {label}
          <div className="flex flex-wrap gap-2 pt-1">
            {field.options?.map((opt) => {
              const checked = selected.includes(opt.value);
              return (
                <label
                  key={opt.value}
                  className={cn(
                    "flex cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1 text-xs",
                    checked ? "border-brand-500 bg-brand-50 text-brand-700" : "border-gray-200"
                  )}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => {
                      const next = checked
                        ? selected.filter((v) => v !== opt.value)
                        : [...selected, opt.value];
                      onChange(field.id, next);
                    }}
                    className="sr-only"
                  />
                  {opt.label}
                </label>
              );
            })}
          </div>
          {badgeCol}
        </div>
      );
    }
    case "switch":
      return (
        <div className={wrapClass}>
          {label}
          <label className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              checked={Boolean(raw)}
              onChange={(e) => onChange(field.id, e.target.checked)}
              className="h-4 w-4 rounded border-gray-300"
            />
            <span className="text-sm text-gray-700">{raw ? "开启" : "关闭"}</span>
          </label>
          {badgeCol}
        </div>
      );
    case "color":
      return (
        <div className={wrapClass}>
          {label}
          <div className="flex items-center gap-2 pt-1">
            <input
              type="color"
              value={String(raw ?? "#000000")}
              onChange={(e) => onChange(field.id, e.target.value)}
              className="h-9 w-12 cursor-pointer rounded border border-gray-200"
            />
            <input
              value={String(raw ?? "")}
              onChange={(e) => onChange(field.id, e.target.value)}
              className={cn(inputClass, "flex-1")}
            />
          </div>
          {badgeCol}
        </div>
      );
    case "slider":
      return (
        <div className={wrapClass}>
          {label}
          <div className="space-y-1 pt-2">
            <input
              type="range"
              min={field.min ?? 0}
              max={field.max ?? 100}
              step={field.step ?? 1}
              value={Number(raw ?? field.min ?? 0)}
              onChange={(e) => onChange(field.id, Number(e.target.value))}
              className="w-full"
            />
            <p className="text-xs text-gray-500">{String(raw ?? field.min ?? 0)}</p>
          </div>
          {badgeCol}
        </div>
      );
    case "number":
      return (
        <div className={wrapClass}>
          {label}
          <input
            type="number"
            value={String(raw ?? "")}
            onChange={(e) => onChange(field.id, e.target.value)}
            placeholder={field.placeholder}
            className={cn(inputClass, agentFilled && "border-brand-200")}
          />
          {badgeCol}
        </div>
      );
    case "material-picker":
      return (
        <div className={wrapClass}>
          {label}
          <MaterialAssetPicker
            value={String(raw ?? "")}
            onChange={(id) => onChange(field.id, id)}
            assetCategory={field.assetCategory}
            assetSubCategory={field.assetSubCategory}
            materialType={materialType}
            disabled={readOnly}
          />
          {badgeCol}
        </div>
      );
    case "file-upload":
      return (
        <div className={wrapClass}>
          {label}
          <MaterialAssetPicker
            value={String(raw ?? "")}
            onChange={(id) => onChange(field.id, id)}
            materialType={materialType}
            disabled={readOnly}
            placeholder="本地上传 / 素材库"
          />
          {badgeCol}
        </div>
      );
    default:
      return (
        <div className={wrapClass}>
          {label}
          <input
            value={String(raw ?? "")}
            onChange={(e) => onChange(field.id, e.target.value)}
            placeholder={field.placeholder}
            className={cn(inputClass, agentFilled && "border-brand-200")}
          />
          {badgeCol}
        </div>
      );
  }
}
