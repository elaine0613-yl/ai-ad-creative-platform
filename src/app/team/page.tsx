"use client";

import { Button } from "@/components/ui/Button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { PageHeader } from "@/components/layout/PageHeader";
import { ROLE_LABELS } from "@/lib/constants";
import { mockTeamMembers } from "@/lib/mock/data";
import type { UserRole } from "@/lib/types";
import { Mail, Shield, UserPlus } from "lucide-react";
import { useState } from "react";

export default function TeamPage() {
  const [members, setMembers] = useState(mockTeamMembers);

  const roleBadgeVariant = (role: UserRole) => {
    if (role === "admin") return "info" as const;
    if (role === "creator") return "success" as const;
    return "default" as const;
  };

  return (
    <>
      <PageHeader
        title="团队管理"
        description="成员管理、角色权限、团队素材共享"
        actions={
          <Button size="sm">
            <UserPlus className="h-4 w-4" />
            邀请成员
          </Button>
        }
      />

      <div className="flex-1 overflow-y-auto p-6">
        <div className="mx-auto max-w-4xl space-y-6">
          {/* Role Permissions */}
          <Card>
            <CardHeader>
              <CardTitle>角色权限说明</CardTitle>
              <CardDescription>不同角色拥有不同的功能权限</CardDescription>
            </CardHeader>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 text-left text-gray-500">
                    <th className="pb-3 pr-4 font-medium">角色</th>
                    <th className="pb-3 font-medium">权限范围</th>
                  </tr>
                </thead>
                <tbody className="text-gray-700">
                  <tr className="border-b border-gray-100">
                    <td className="py-3 pr-4">
                      <Badge variant="info">团队管理员</Badge>
                    </td>
                    <td className="py-3">全部功能权限、成员管理、套餐管理、团队素材全部权限</td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-3 pr-4">
                      <Badge variant="success">创作者</Badge>
                    </td>
                    <td className="py-3">生成、编辑、导出素材，管理自己的素材，查看团队共享素材</td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-4">
                      <Badge>访客</Badge>
                    </td>
                    <td className="py-3">仅查看、下载共享素材，无生成、编辑权限</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Card>

          {/* Members List */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>团队成员</CardTitle>
                <CardDescription>{members.length} 位成员</CardDescription>
              </div>
            </CardHeader>
            <div className="space-y-2">
              {members.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between rounded-lg border border-gray-100 p-4 hover:border-gray-200"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-700">
                      {member.name[0]}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{member.name}</p>
                      <p className="flex items-center gap-1 text-xs text-gray-400">
                        <Mail className="h-3 w-3" />
                        {member.email}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={roleBadgeVariant(member.role)}>{ROLE_LABELS[member.role]}</Badge>
                    <span className="text-xs text-gray-400">加入于 {member.joinedAt}</span>
                    {member.role !== "admin" && (
                      <select
                        value={member.role}
                        onChange={(e) =>
                          setMembers(
                            members.map((m) =>
                              m.id === member.id ? { ...m, role: e.target.value as UserRole } : m
                            )
                          )
                        }
                        className="rounded border border-gray-200 px-2 py-1 text-xs"
                      >
                        <option value="creator">创作者</option>
                        <option value="viewer">访客</option>
                        <option value="admin">管理员</option>
                      </select>
                    )}
                    {member.role === "admin" && <Shield className="h-4 w-4 text-brand-500" />}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Team Space */}
          <Card>
            <CardHeader>
              <CardTitle>团队空间</CardTitle>
              <CardDescription>团队共享素材库与品牌资产库</CardDescription>
            </CardHeader>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-lg border border-gray-200 p-4">
                <p className="text-sm font-medium text-gray-900">团队素材库</p>
                <p className="mt-1 text-xs text-gray-400">128 个共享素材</p>
                <Button variant="outline" size="sm" className="mt-3">
                  查看素材
                </Button>
              </div>
              <div className="rounded-lg border border-gray-200 p-4">
                <p className="text-sm font-medium text-gray-900">团队品牌资产</p>
                <p className="mt-1 text-xs text-gray-400">2 套品牌方案</p>
                <Button variant="outline" size="sm" className="mt-3">
                  管理品牌
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
