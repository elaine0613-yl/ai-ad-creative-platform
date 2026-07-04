"use client";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/layout/PageHeader";
import { TaskStatusBadge } from "@/components/tasks/TaskUi";
import { api } from "@/lib/api/client";
import type { ImageCreativePlanFields, RequirementBrief, VideoCreativePlanFields } from "@/lib/campaign/types";
import {
  CREATIVE_FIELD_KEYS,
  CREATIVE_FIELD_LABELS,
  NATIVE_REQUIREMENT_KEYS,
  REQUIREMENT_FIELD_LABELS,
  VIDEO_CREATIVE_FIELD_KEYS,
  VIDEO_CREATIVE_FIELD_LABELS,
  formatFieldValue,
} from "@/lib/tasks/field-labels";
import { formatTaskMode } from "@/lib/tasks/display";
import { cn } from "@/lib/utils";
import { AlertTriangle, ArrowLeft, Bot, Loader2, RotateCcw } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

interface TaskDetail {
  id: string;
  name: string;
  type: string;
  mode: string;
  status: string;
  progress: number;
  createdAt: string;
  completedAt: string | null;
  initiatorName: string;
  requirement: RequirementBrief | null;
  imageCreative: ImageCreativePlanFields | null;
  videoCreative: VideoCreativePlanFields | null;
  audit: {
    reason?: string | null;
    aiHint?: string | null;
    fieldsToFix: string[];
    materialIds: string[];
  };
}

function FieldRow({
  label,
  value,
  fieldKey,
  flagged,
  editable,
  onChange,
}: {
  label: string;
  value: string;
  fieldKey: string;
  flagged?: boolean;
  editable?: boolean;
  onChange?: (key: string, value: string) => void;
}) {
  return (
    <div
      className={cn(
        "grid grid-cols-[7rem_1fr] items-start gap-3 border-b border-gray-50 py-3 last:border-0",
        flagged && "rounded-lg border border-red-300 bg-red-50/60 px-2 -mx-2"
      )}
    >
      <label className="pt-2 text-xs font-medium text-gray-500">
        {label}
        {flagged && <span className="mt-0.5 block text-[10px] font-normal text-red-600">需修改</span>}
      </label>
      {editable ? (
        <textarea
          rows={value.length > 40 ? 3 : 1}
          value={value}
          onChange={(e) => onChange?.(fieldKey, e.target.value)}
          className={cn(
            "w-full rounded-lg border px-3 py-2 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100",
            flagged ? "border-red-400 bg-white" : "border-gray-200"
          )}
        />
      ) : (
        <p className="pt-2 text-sm text-gray-800">{value}</p>
      )}
    </div>
  );
}

export default function TaskDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const [taskId, setTaskId] = useState<string | null>(null);
  const [task, setTask] = useState<TaskDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [requirementDraft, setRequirementDraft] = useState<RequirementBrief | null>(null);
  const [imageCreativeDraft, setImageCreativeDraft] = useState<ImageCreativePlanFields | null>(null);
  const [videoCreativeDraft, setVideoCreativeDraft] = useState<VideoCreativePlanFields | null>(null);

  useEffect(() => {
    void params.then((p) => setTaskId(p.id));
  }, [params]);

  const loadTask = useCallback(async () => {
    if (!taskId) return;
    try {
      const { task: data } = await api.tasks.get(taskId);
      const t = data as TaskDetail;
      setTask(t);
      setRequirementDraft(t.requirement);
      setImageCreativeDraft(t.imageCreative);
      setVideoCreativeDraft(t.videoCreative);
    } catch {
      setTask(null);
    } finally {
      setLoading(false);
    }
  }, [taskId]);

  useEffect(() => {
    if (!taskId) return;
    setLoading(true);
    void loadTask();
    const interval = setInterval(loadTask, 4000);
    return () => clearInterval(interval);
  }, [taskId, loadTask]);

  const isAuditFailed = task?.status === "audit_failed";
  const fieldsToFix = new Set(task?.audit.fieldsToFix ?? []);
  const editable = isAuditFailed;

  const isVideoTask = Boolean(task?.videoCreative) || task?.mode === "AI原生视频" || task?.type === "video";
  const creativeDraft = isVideoTask ? videoCreativeDraft : imageCreativeDraft;

  const handleCreativeChange = (key: string, value: string) => {
    if (isVideoTask) {
      setVideoCreativeDraft((prev) => (prev ? { ...prev, [key]: value } : prev));
    } else {
      setImageCreativeDraft((prev) => (prev ? { ...prev, [key]: value } : prev));
    }
  };

  const handleResubmit = async () => {
    if (!taskId || !creativeDraft) return;
    setSaving(true);
    try {
      const payload = {
        requirement: requirementDraft,
        ...(isVideoTask ? { videoCreative: creativeDraft } : { imageCreative: creativeDraft }),
      };
      await api.tasks.update(taskId, payload);
      await api.tasks.resubmitAudit(taskId, payload);
      await loadTask();
    } catch (e) {
      alert(e instanceof Error ? e.message : "提交失败");
    } finally {
      setSaving(false);
    }
  };

  if (loading && !task) {
    return (
      <div className="flex flex-1 items-center justify-center text-sm text-gray-400">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        加载任务详情…
      </div>
    );
  }

  if (!task) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 p-6">
        <p className="text-sm text-gray-500">任务不存在或无权查看</p>
        <Link href="/tasks">
          <Button variant="outline" size="sm">
            返回任务中心
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <>
      <PageHeader
        title="任务详情"
        description={task.name}
        actions={
          <Link href="/tasks">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-3.5 w-3.5" />
              返回列表
            </Button>
          </Link>
        }
      />

      <div className="flex-1 overflow-y-auto p-6">
        <div className="mx-auto max-w-3xl space-y-4">
          <Card padding="md">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-base font-semibold text-gray-900">任务信息</h2>
              <TaskStatusBadge status={task.status} />
              {task.status === "completed" && (
                <span className="text-xs text-gray-400">
                  素材已入库，
                  <Link href="/materials" className="text-brand-600 underline underline-offset-2">
                    请前往素材库进行查看
                  </Link>
                </span>
              )}
            </div>
            <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-xs text-gray-500">任务名</dt>
                <dd className="font-medium text-gray-900">{task.name}</dd>
              </div>
              <div>
                <dt className="text-xs text-gray-500">任务 ID</dt>
                <dd className="font-mono text-xs text-gray-800">{task.id}</dd>
              </div>
              <div>
                <dt className="text-xs text-gray-500">发起人</dt>
                <dd className="text-gray-800">{task.initiatorName}</dd>
              </div>
              <div>
                <dt className="text-xs text-gray-500">生成模式</dt>
                <dd className="text-gray-800">{formatTaskMode(task.mode)}</dd>
              </div>
              <div>
                <dt className="text-xs text-gray-500">发起时间</dt>
                <dd className="text-gray-800">{new Date(task.createdAt).toLocaleString("zh-CN")}</dd>
              </div>
              <div>
                <dt className="text-xs text-gray-500">当前进度</dt>
                <dd className="text-gray-800">
                  {task.status === "processing" && "生成中"}
                  {task.status === "auditing" && "审核中"}
                  {task.status === "completed" && "已完成"}
                  {task.status === "audit_failed" && "审核失败"}
                  {task.status === "queued" && "排队中"}
                  {!["processing", "auditing", "completed", "audit_failed", "queued"].includes(task.status) &&
                    task.status}
                  {["processing", "auditing"].includes(task.status) && ` · ${task.progress}%`}
                </dd>
              </div>
            </dl>
          </Card>

          {isAuditFailed && (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
              <div className="flex gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600">
                  <Bot className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 text-sm font-semibold text-red-800">
                    <AlertTriangle className="h-4 w-4" />
                    AI 审核意见
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-red-700">
                    {task.audit.aiHint ?? task.audit.reason ?? "合规审核未通过，请修改标红字段后重新提交。"}
                  </p>
                </div>
              </div>
            </div>
          )}

          {requirementDraft && (
            <Card padding="md">
              <h3 className="text-sm font-semibold text-gray-900">需求确认字段</h3>
              <div className="mt-3">
                {NATIVE_REQUIREMENT_KEYS.map((key) => {
                  const label = REQUIREMENT_FIELD_LABELS[key] ?? key;
                  const value = formatFieldValue(requirementDraft[key]);
                  if (value === "—") return null;
                  return (
                    <FieldRow key={key} label={label} value={value} fieldKey={key} />
                  );
                })}
              </div>
            </Card>
          )}

          {creativeDraft && (
            <Card padding="md">
              <h3 className="text-sm font-semibold text-gray-900">创意方案配置</h3>
              {isAuditFailed && (
                <p className="mt-1 text-xs text-red-600">标红字段为审核失败项，修改后点击下方重新提交审核</p>
              )}
              <div className="mt-3">
                {(isVideoTask ? VIDEO_CREATIVE_FIELD_KEYS : CREATIVE_FIELD_KEYS).map((key) => (
                  <FieldRow
                    key={key}
                    label={
                      isVideoTask
                        ? VIDEO_CREATIVE_FIELD_LABELS[key as keyof VideoCreativePlanFields]
                        : CREATIVE_FIELD_LABELS[key as keyof ImageCreativePlanFields]
                    }
                    value={creativeDraft[key] ?? ""}
                    fieldKey={key}
                    flagged={fieldsToFix.has(key)}
                    editable={editable}
                    onChange={handleCreativeChange}
                  />
                ))}
              </div>
            </Card>
          )}

          {isAuditFailed && (
            <Button className="w-full" size="lg" onClick={() => void handleResubmit()} loading={saving}>
              <RotateCcw className="h-4 w-4" />
              修改完成，重新提交审核
            </Button>
          )}

          {task.status === "completed" && (
            <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-center text-sm text-green-800">
              任务已完成，素材已自动写入素材库。
              <Link href="/materials" className="ml-1 font-medium text-brand-600 underline">
                前往素材库
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
