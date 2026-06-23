"use client";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { PageHeader } from "@/components/layout/PageHeader";
import { api } from "@/lib/api/client";
import { Download, RefreshCw, RotateCcw } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

interface Task {
  id: string;
  name: string;
  type: string;
  mode: string;
  status: string;
  progress: number;
  totalCount: number;
  successCount: number;
  failCount: number;
  createdAt: string;
  errorMessage?: string | null;
}

export default function TasksPage() {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const loadTasks = useCallback(async () => {
    try {
      const { tasks: data } = await api.tasks.list(statusFilter === "all" ? undefined : statusFilter);
      setTasks(data as Task[]);
    } catch {
      setTasks([]);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    loadTasks();
    const interval = setInterval(loadTasks, 5000);
    return () => clearInterval(interval);
  }, [loadTasks]);

  const retryTask = async (id: string) => {
    await api.tasks.retry(id);
    loadTasks();
  };

  return (
    <>
      <PageHeader title="任务中心" description="追踪图片与视频生成任务进度与结果" />

      <div className="flex-1 overflow-y-auto p-6">
        <div className="mx-auto max-w-5xl">
          <div className="mb-6 flex items-center gap-4">
            {[
              { id: "all", label: "全部" },
              { id: "queued", label: "排队中" },
              { id: "processing", label: "生成中" },
              { id: "completed", label: "已完成" },
              { id: "failed", label: "失败" },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setStatusFilter(f.id)}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
                  statusFilter === f.id ? "bg-brand-100 text-brand-700" : "text-gray-500 hover:bg-gray-100"
                }`}
              >
                {f.label}
              </button>
            ))}
            <Button variant="ghost" size="sm" onClick={loadTasks}>
              <RefreshCw className="h-3.5 w-3.5" />
            </Button>
          </div>

          {loading ? (
            <p className="text-center text-sm text-gray-400">加载中...</p>
          ) : (
            <div className="space-y-3">
              {tasks.length === 0 ? (
                <p className="text-center text-sm text-gray-400">暂无任务</p>
              ) : (
                tasks.map((task) => (
                  <Card key={task.id} padding="sm">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="truncate text-sm font-semibold text-gray-900">{task.name}</h3>
                          <StatusBadge status={task.status} />
                        </div>
                        <p className="mt-1 text-xs text-gray-500">
                          {task.mode} · {task.type === "image" ? "图片" : "视频"} ·{" "}
                          {new Date(task.createdAt).toLocaleString("zh-CN")}
                        </p>

                        {(task.status === "processing" || task.status === "completed") && (
                          <div className="mt-3">
                            <ProgressBar value={task.progress} showLabel />
                            <p className="mt-1 text-xs text-gray-400">
                              成功 {task.successCount}/{task.totalCount}
                              {task.failCount > 0 && ` · 失败 ${task.failCount}`}
                            </p>
                          </div>
                        )}

                        {task.status === "failed" && task.errorMessage && (
                          <p className="mt-2 rounded bg-red-50 px-3 py-2 text-xs text-red-600">{task.errorMessage}</p>
                        )}
                      </div>

                      <div className="flex shrink-0 gap-2">
                        {task.status === "failed" && (
                          <Button variant="outline" size="sm" onClick={() => retryTask(task.id)}>
                            <RotateCcw className="h-3.5 w-3.5" />
                            重试
                          </Button>
                        )}
                        {task.status === "completed" && (
                          <Button size="sm" onClick={() => { window.location.href = "/materials"; }}>
                            <Download className="h-3.5 w-3.5" />
                            查看素材
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
