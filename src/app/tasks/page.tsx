"use client";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/layout/PageHeader";
import { TaskStatusBadge } from "@/components/tasks/TaskUi";
import { api } from "@/lib/api/client";
import { formatTaskMode, shortTaskId } from "@/lib/tasks/display";
import { ChevronRight, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

interface TaskRow {
  id: string;
  name: string;
  type: string;
  mode: string;
  status: string;
  progress: number;
  createdAt: string;
  initiatorName: string;
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function daysAgoISO(days: number) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

export default function TasksPage() {
  const [statusFilter, setStatusFilter] = useState("all");
  const [datePreset, setDatePreset] = useState<"all" | "today" | "7d" | "custom">("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [tasks, setTasks] = useState<TaskRow[]>([]);
  const [loading, setLoading] = useState(true);

  const queryDates = useMemo(() => {
    if (datePreset === "today") return { dateFrom: todayISO(), dateTo: todayISO() };
    if (datePreset === "7d") return { dateFrom: daysAgoISO(6), dateTo: todayISO() };
    if (datePreset === "custom" && dateFrom) {
      return { dateFrom, dateTo: dateTo || dateFrom };
    }
    return {};
  }, [datePreset, dateFrom, dateTo]);

  const loadTasks = useCallback(async () => {
    try {
      const { tasks: data } = await api.tasks.list({
        status: statusFilter,
        ...queryDates,
      });
      setTasks(data as TaskRow[]);
    } catch {
      setTasks([]);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, queryDates]);

  useEffect(() => {
    setLoading(true);
    loadTasks();
    const interval = setInterval(loadTasks, 5000);
    return () => clearInterval(interval);
  }, [loadTasks]);

  return (
    <>
      <PageHeader title="任务中心" description="追踪图片与视频生成任务进度、审核状态与结果" />

      <div className="flex-1 overflow-y-auto p-6">
        <div className="mx-auto max-w-5xl">
          <div className="mb-4 flex flex-wrap items-center gap-2">
            {[
              { id: "all", label: "全部" },
              { id: "processing", label: "生成中" },
              { id: "auditing", label: "审核中" },
              { id: "completed", label: "已完成" },
              { id: "audit_failed", label: "审核失败" },
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setStatusFilter(f.id)}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
                  statusFilter === f.id ? "bg-brand-100 text-brand-700" : "text-gray-500 hover:bg-gray-100"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="mb-6 flex flex-wrap items-end gap-3 rounded-xl border border-gray-200 bg-white p-4">
            <div>
              <p className="mb-1 text-xs font-medium text-gray-500">发起时间</p>
              <div className="flex flex-wrap gap-2">
                {[
                  { id: "all" as const, label: "全部" },
                  { id: "today" as const, label: "今天" },
                  { id: "7d" as const, label: "近 7 天" },
                  { id: "custom" as const, label: "自定义" },
                ].map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setDatePreset(p.id)}
                    className={`rounded-md px-2.5 py-1 text-xs font-medium ${
                      datePreset === p.id ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
            {datePreset === "custom" && (
              <>
                <label className="text-xs text-gray-500">
                  从
                  <input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="ml-1 rounded border border-gray-200 px-2 py-1 text-sm"
                  />
                </label>
                <label className="text-xs text-gray-500">
                  至
                  <input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="ml-1 rounded border border-gray-200 px-2 py-1 text-sm"
                  />
                </label>
              </>
            )}
            <Button variant="ghost" size="sm" onClick={() => void loadTasks()}>
              <RefreshCw className="h-3.5 w-3.5" />
              刷新
            </Button>
          </div>

          {loading ? (
            <p className="text-center text-sm text-gray-400">加载中...</p>
          ) : tasks.length === 0 ? (
            <p className="text-center text-sm text-gray-400">暂无任务</p>
          ) : (
            <div className="space-y-3">
              {tasks.map((task) => (
                <Link key={task.id} href={`/tasks/${task.id}`}>
                  <Card padding="sm" className="transition hover:border-brand-200 hover:shadow-md">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="truncate text-sm font-semibold text-gray-900">{task.name}</h3>
                          <TaskStatusBadge status={task.status} />
                          {task.status === "completed" && (
                            <span className="text-[11px] text-gray-400">
                              请前往
                              <span
                                className="mx-0.5 text-brand-600 underline"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  window.location.href = "/materials";
                                }}
                              >
                                素材库
                              </span>
                              进行查看
                            </span>
                          )}
                        </div>

                        <div className="mt-2 grid gap-1 text-xs text-gray-500 sm:grid-cols-2">
                          <span>任务 ID：{shortTaskId(task.id)}</span>
                          <span>发起人：{task.initiatorName}</span>
                          <span>生成模式：{formatTaskMode(task.mode)}</span>
                          <span>
                            发起时间：{new Date(task.createdAt).toLocaleString("zh-CN")}
                          </span>
                        </div>

                        {task.status === "audit_failed" && (
                          <p className="mt-2 text-xs text-red-600">点击查看审核失败原因与需修改字段</p>
                        )}

                        {(task.status === "processing" || task.status === "auditing") && (
                          <p className="mt-2 text-xs text-gray-400">进度 {task.progress}%</p>
                        )}
                      </div>
                      <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-gray-300" />
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
