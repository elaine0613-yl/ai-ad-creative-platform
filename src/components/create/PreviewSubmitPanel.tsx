"use client";

import { Button } from "@/components/ui/Button";
import { IMAGE_TASK_SUBMITTED_HINT } from "@/lib/campaign/image-native-flow";
import { VIDEO_TASK_SUBMITTED_HINT } from "@/lib/campaign/video-native-flow";
import type { MaterialType } from "@/lib/types";
import { AgentMessageContent } from "@/components/tasks/TaskUi";
import { cn } from "@/lib/utils";
import { ArrowLeft, CheckCircle2, Image as ImageIcon, ListTodo, Loader2 } from "lucide-react";
import Link from "next/link";

interface PreviewSubmitPanelProps {
  previewUrls?: string[];
  loading?: boolean;
  submitted?: boolean;
  singlePreview?: boolean;
  materialType?: MaterialType;
  onBackToCreative?: () => void;
  onRegeneratePreview?: () => void;
  onConfirmSubmit: () => void;
}

export function PreviewSubmitPanel({
  previewUrls = [],
  loading,
  submitted,
  singlePreview = false,
  materialType = "image",
  onBackToCreative,
  onRegeneratePreview,
  onConfirmSubmit,
}: PreviewSubmitPanelProps) {
  const mocks = singlePreview
    ? previewUrls.length > 0
      ? previewUrls.slice(0, 1)
      : [null]
    : previewUrls.length > 0
      ? previewUrls
      : [null, null, null].map((_, i) => `mock-${i}`);

  if (submitted) {
    return (
      <section className="rounded-2xl border border-green-200 bg-green-50/50 p-6 text-center shadow-sm">
        <CheckCircle2 className="mx-auto h-10 w-10 text-green-600" />
        <h3 className="mt-3 text-sm font-semibold text-gray-900">素材已提交</h3>
        <p className="mt-2 text-sm text-gray-600">
          <AgentMessageContent
            content={materialType === "video" ? VIDEO_TASK_SUBMITTED_HINT : IMAGE_TASK_SUBMITTED_HINT}
          />
        </p>
        <Link href="/tasks" className="mt-4 inline-block">
          <Button variant="outline" size="sm">
            <ListTodo className="h-4 w-4" />
            前往任务中心
          </Button>
        </Link>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-gray-900">
        {materialType === "video" ? "视频预览确认 & 提交任务" : "预览确认 & 提交任务"}
      </h3>
      <p className="mt-1 text-xs text-gray-500">
        {materialType === "video"
          ? "核对视频预览效果，确认后提交进入生成任务队列"
          : "核对预览效果，确认后提交进入生成任务队列"}
      </p>

      <div className={cn("mt-4 grid gap-3", singlePreview ? "grid-cols-1 max-w-xs" : "grid-cols-3")}>
        {mocks.map((url, i) => (
          <div
            key={i}
            className={cn(
              "flex flex-col items-center justify-center rounded-xl border border-gray-100 bg-gradient-to-b from-gray-50 to-gray-100",
              singlePreview
                ? materialType === "video"
                  ? "aspect-[9/16]"
                  : "aspect-square"
                : "aspect-[9/16]"
            )}
          >
            {url && url.startsWith("http") ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={url} alt={`预览 ${i + 1}`} className="h-full w-full rounded-xl object-cover" />
            ) : (
              <>
                <ImageIcon className="h-8 w-8 text-gray-300" />
                <span className="mt-2 text-[10px] text-gray-400">预览 #{i + 1}</span>
              </>
            )}
          </div>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {onBackToCreative && (
          <Button variant="outline" size="sm" onClick={onBackToCreative}>
            <ArrowLeft className="h-3.5 w-3.5" />
            退回修改创意
          </Button>
        )}
        {onRegeneratePreview && (
          <Button variant="outline" size="sm" onClick={onRegeneratePreview} loading={loading}>
            重新生成预览
          </Button>
        )}
        <Button className="flex-1 sm:flex-none" size="sm" onClick={onConfirmSubmit} loading={loading}>
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              提交中…
            </>
          ) : (
            <>
              <CheckCircle2 className="h-4 w-4" />
              确认{materialType === "video" ? "出片" : "出图"}并提交任务
            </>
          )}
        </Button>
      </div>
    </section>
  );
}
