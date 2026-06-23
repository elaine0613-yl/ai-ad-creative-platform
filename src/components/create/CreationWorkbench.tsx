"use client";

import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface ModeTab {
  id: string;
  label: string;
  description?: string;
}

interface CreationWorkbenchProps {
  title: string;
  subtitle?: string;
  modeTabs: ModeTab[];
  activeMode: string;
  onModeChange: (id: string) => void;
  configPanel: ReactNode;
  previewPanel: ReactNode;
  resultsPanel?: ReactNode;
  footerActions?: ReactNode;
  headerActions?: ReactNode;
  previewDark?: boolean;
}

export function CreationWorkbench({
  title,
  subtitle,
  modeTabs,
  activeMode,
  onModeChange,
  configPanel,
  previewPanel,
  resultsPanel,
  footerActions,
  headerActions,
  previewDark = false,
}: CreationWorkbenchProps) {
  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* 顶栏：模式切换 */}
      <div className="shrink-0 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between px-5 py-3">
          <div>
            <h1 className="text-base font-semibold text-gray-900">{title}</h1>
            {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
          </div>
          {headerActions}
        </div>
        <div className="flex gap-1 overflow-x-auto px-5 pb-3">
          {modeTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onModeChange(tab.id)}
              className={cn(
                "shrink-0 rounded-xl px-4 py-2 text-left transition-all",
                activeMode === tab.id
                  ? "bg-gray-900 text-white shadow-md"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              )}
            >
              <p className="text-sm font-medium">{tab.label}</p>
              {tab.description && (
                <p
                  className={cn(
                    "mt-0.5 text-[10px]",
                    activeMode === tab.id ? "text-gray-300" : "text-gray-400"
                  )}
                >
                  {tab.description}
                </p>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* 主体：左配置 + 中预览 + 右历史 */}
      <div className="flex min-h-0 flex-1 overflow-hidden">
        <div className="flex w-[340px] shrink-0 flex-col border-r border-gray-200 bg-white">
          <div className="flex-1 overflow-y-auto p-4">{configPanel}</div>
        </div>

        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <div
            className={cn(
              "relative flex flex-1 items-center justify-center overflow-hidden p-6",
              previewDark ? "bg-[#0a0a0f]" : "bg-[#f4f4f5]"
            )}
          >
            {previewPanel}
          </div>
          {footerActions && (
            <div className="flex shrink-0 items-center justify-center gap-2 border-t border-gray-200 bg-white px-4 py-3">
              {footerActions}
            </div>
          )}
        </div>

        {resultsPanel && (
          <div className="w-[200px] shrink-0 overflow-y-auto border-l border-gray-200 bg-white p-3">
            {resultsPanel}
          </div>
        )}
      </div>
    </div>
  );
}

interface ChipGroupProps {
  label: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
}

export function ChipGroup({ label, options, value, onChange }: ChipGroupProps) {
  return (
    <div>
      <p className="mb-2 text-xs font-medium text-gray-500">{label}</p>
      <div className="flex flex-wrap gap-1.5">
        {options.map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(opt)}
            className={cn(
              "rounded-full px-2.5 py-1 text-xs font-medium transition-colors",
              value === opt
                ? "bg-gray-900 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            )}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

interface PromptBlockProps {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  rows?: number;
  required?: boolean;
}

export function PromptBlock({
  label,
  placeholder,
  value,
  onChange,
  rows = 4,
  required,
}: PromptBlockProps) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500"> *</span>}
      </label>
      <textarea
        placeholder={placeholder}
        rows={rows}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-brand-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-100"
      />
    </div>
  );
}
