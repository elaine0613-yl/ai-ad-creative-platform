"use client";

import { Button } from "@/components/ui/Button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/Badge";
import { PageHeader } from "@/components/layout/PageHeader";
import { mockStats, mockTasks, mockTemplates } from "@/lib/mock/data";
import {
  ArrowRight,
  Image,
  Sparkles,
  TrendingUp,
  Upload,
  Video,
  Zap,
} from "lucide-react";
import Link from "next/link";

const quickActions = [
  {
    title: "文生广告图",
    description: "文字描述一键生成原创广告图片",
    href: "/image/create?mode=text-to-image",
    icon: Image,
    color: "bg-blue-500",
  },
  {
    title: "图文转视频",
    description: "上传产品图自动生成动态带货视频",
    href: "/video/create?mode=images-to-video",
    icon: Video,
    color: "bg-purple-500",
  },
  {
    title: "数字人口播",
    description: "输入文案生成数字人出镜口播广告",
    href: "/video/create?mode=digital-human",
    icon: Sparkles,
    color: "bg-pink-500",
  },
  {
    title: "批量生成",
    description: "Excel 导入参数，大批量素材异步生成",
    href: "/batch",
    icon: Upload,
    color: "bg-orange-500",
  },
];

const stats = [
  { label: "今日生成", value: mockStats.todayGenerated, icon: Zap, color: "text-blue-600" },
  { label: "本周生成", value: mockStats.weekGenerated, icon: TrendingUp, color: "text-green-600" },
  { label: "素材总数", value: mockStats.totalMaterials, icon: Image, color: "text-purple-600" },
  { label: "进行中任务", value: mockStats.pendingTasks, icon: Upload, color: "text-orange-600" },
];

export default function DashboardPage() {
  return (
    <>
      <PageHeader title="工作台" description="欢迎回来，开始创作你的广告素材" />
      <div className="flex-1 overflow-y-auto p-6">
        <div className="mx-auto max-w-7xl space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {stats.map((stat) => (
              <Card key={stat.label} padding="sm">
                <div className="flex items-center gap-3">
                  <div className={`rounded-lg bg-gray-50 p-2 ${stat.color}`}>
                    <stat.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    <p className="text-xs text-gray-500">{stat.label}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Quick Actions */}
          <div>
            <h2 className="mb-4 text-base font-semibold text-gray-900">快速创作</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {quickActions.map((action) => (
                <Link key={action.href} href={action.href}>
                  <Card className="group cursor-pointer transition-shadow hover:shadow-md" padding="sm">
                    <div className="flex items-start gap-3">
                      <div className={`rounded-lg p-2.5 ${action.color}`}>
                        <action.icon className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-sm font-semibold text-gray-900 group-hover:text-brand-600">
                          {action.title}
                        </h3>
                        <p className="mt-1 text-xs text-gray-500">{action.description}</p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-gray-300 group-hover:text-brand-500" />
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Recent Tasks */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>最近任务</CardTitle>
                  <CardDescription>查看生成任务进度</CardDescription>
                </div>
                <Link href="/tasks">
                  <Button variant="ghost" size="sm">
                    查看全部
                  </Button>
                </Link>
              </CardHeader>
              <div className="space-y-3">
                {mockTasks.slice(0, 3).map((task) => (
                  <div key={task.id} className="flex items-center justify-between rounded-lg border border-gray-100 p-3">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-gray-900">{task.name}</p>
                      <p className="text-xs text-gray-500">
                        {task.mode} · {task.createdAt}
                      </p>
                    </div>
                    <StatusBadge status={task.status} />
                  </div>
                ))}
              </div>
            </Card>

            {/* Recommended Templates */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>推荐模板</CardTitle>
                  <CardDescription>热门行业模板，一键套用</CardDescription>
                </div>
                <Link href="/templates">
                  <Button variant="ghost" size="sm">
                    模板中心
                  </Button>
                </Link>
              </CardHeader>
              <div className="grid grid-cols-2 gap-3">
                {mockTemplates.slice(0, 4).map((tpl) => (
                  <Link key={tpl.id} href={`/templates?id=${tpl.id}`}>
                    <div className="group cursor-pointer overflow-hidden rounded-lg border border-gray-100 transition-shadow hover:shadow-md">
                      <div className="flex aspect-square items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                        <span className="text-xs text-gray-400">{tpl.type === "image" ? "图片" : "视频"}</span>
                      </div>
                      <div className="p-2">
                        <p className="truncate text-xs font-medium text-gray-900 group-hover:text-brand-600">
                          {tpl.name}
                        </p>
                        <p className="text-[10px] text-gray-400">{tpl.industry}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
