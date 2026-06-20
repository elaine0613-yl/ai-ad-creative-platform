"use client";

import { Button } from "@/components/ui/Button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { PageHeader } from "@/components/layout/PageHeader";
import { mockUser } from "@/lib/mock/data";
import { Bell, CreditCard, Settings } from "lucide-react";

export default function ProfilePage() {
  const creditPercent = (mockUser.credits / mockUser.totalCredits) * 100;

  return (
    <>
      <PageHeader title="个人中心" description="账户信息、套餐权益与系统设置" />

      <div className="flex-1 overflow-y-auto p-6">
        <div className="mx-auto max-w-3xl space-y-6">
          {/* Profile */}
          <Card>
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-100 text-xl font-bold text-brand-700">
                {mockUser.name[0]}
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-semibold text-gray-900">{mockUser.name}</h2>
                <p className="text-sm text-gray-500">{mockUser.email}</p>
              </div>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4" />
                编辑资料
              </Button>
            </div>
          </Card>

          {/* Plan */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>套餐权益</CardTitle>
                  <CardDescription>当前套餐使用情况</CardDescription>
                </div>
                <Badge variant="info">
                  {mockUser.plan === "free" ? "免费版" : mockUser.plan === "pro" ? "专业版" : "团队版"}
                </Badge>
              </div>
            </CardHeader>
            <div className="space-y-4">
              <div>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="text-gray-600">生成额度</span>
                  <span className="font-medium text-gray-900">
                    {mockUser.credits} / {mockUser.totalCredits}
                  </span>
                </div>
                <ProgressBar value={creditPercent} />
              </div>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="rounded-lg bg-gray-50 p-3">
                  <p className="text-lg font-bold text-gray-900">∞</p>
                  <p className="text-xs text-gray-500">模板使用</p>
                </div>
                <div className="rounded-lg bg-gray-50 p-3">
                  <p className="text-lg font-bold text-gray-900">50GB</p>
                  <p className="text-xs text-gray-500">存储空间</p>
                </div>
                <div className="rounded-lg bg-gray-50 p-3">
                  <p className="text-lg font-bold text-gray-900">1080P</p>
                  <p className="text-xs text-gray-500">最高导出</p>
                </div>
              </div>
              <Button className="w-full">
                <CreditCard className="h-4 w-4" />
                升级套餐
              </Button>
            </div>
          </Card>

          {/* Notifications */}
          <Card>
            <CardHeader>
              <CardTitle>消息通知</CardTitle>
            </CardHeader>
            <div className="space-y-3">
              {[
                { title: "批量任务已完成", desc: "防晒系列主图 20 张全部生成完成", time: "10 分钟前", unread: true },
                { title: "合规检测警告", desc: "618 促销海报存在 1 项风险项", time: "2 小时前", unread: true },
                { title: "额度提醒", desc: "本月生成额度剩余 15%", time: "1 天前", unread: false },
              ].map((msg) => (
                <div
                  key={msg.title}
                  className={`flex items-start gap-3 rounded-lg p-3 ${msg.unread ? "bg-brand-50" : "hover:bg-gray-50"}`}
                >
                  <Bell className={`mt-0.5 h-4 w-4 ${msg.unread ? "text-brand-600" : "text-gray-400"}`} />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{msg.title}</p>
                    <p className="text-xs text-gray-500">{msg.desc}</p>
                  </div>
                  <span className="text-xs text-gray-400">{msg.time}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Settings */}
          <Card>
            <CardHeader>
              <CardTitle>系统设置</CardTitle>
            </CardHeader>
            <div className="space-y-3">
              {[
                { label: "默认导出格式", value: "PNG / MP4" },
                { label: "默认投放平台", value: "抖音" },
                { label: "新手引导", value: "已完成" },
                { label: "AI 生成标识", value: "已开启" },
              ].map((setting) => (
                <div key={setting.label} className="flex items-center justify-between py-2">
                  <span className="text-sm text-gray-700">{setting.label}</span>
                  <span className="text-sm text-gray-400">{setting.value}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
