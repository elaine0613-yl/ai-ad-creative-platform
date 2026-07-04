"use client";

import { cn } from "@/lib/utils";

export type VideoCreateMode = "native" | "replicate";

interface VideoCreateModeSwitchProps {
  mode: VideoCreateMode;
  onChange: (mode: VideoCreateMode) => void;
  className?: string;
}

export function VideoCreateModeSwitch({ mode, onChange, className }: VideoCreateModeSwitchProps) {
  return (
    <div
      className={cn(
        "inline-flex rounded-lg border border-gray-200 bg-gray-50 p-0.5",
        className
      )}
      role="tablist"
      aria-label="视频创作模式"
    >
      <button
        type="button"
        role="tab"
        aria-selected={mode === "native"}
        onClick={() => onChange("native")}
        className={cn(
          "rounded-md px-4 py-2 text-sm font-medium transition-colors",
          mode === "native"
            ? "bg-white text-brand-700 shadow-sm"
            : "text-gray-600 hover:text-gray-900"
        )}
      >
        AI原生视频
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={mode === "replicate"}
        onClick={() => onChange("replicate")}
        className={cn(
          "rounded-md px-4 py-2 text-sm font-medium transition-colors",
          mode === "replicate"
            ? "bg-white text-gray-900 shadow-sm"
            : "text-gray-600 hover:text-gray-900"
        )}
      >
        爆款复刻视频
      </button>
    </div>
  );
}

export const VIDEO_CREATE_HEADER_HEIGHT = 72;

export function VideoCreatePageHeader({
  mode,
  onModeChange,
}: {
  mode: VideoCreateMode;
  onModeChange: (mode: VideoCreateMode) => void;
}) {
  return (
    <div
      className="sticky top-0 z-30 border-b border-gray-200 bg-white px-6 py-3 shadow-sm"
      style={{ minHeight: VIDEO_CREATE_HEADER_HEIGHT }}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl font-semibold tracking-tight text-gray-900">视频创作</h1>
        <VideoCreateModeSwitch mode={mode} onChange={onModeChange} />
      </div>
    </div>
  );
}
