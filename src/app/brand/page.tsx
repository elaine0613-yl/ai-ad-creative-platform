"use client";

import { Button } from "@/components/ui/Button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { PageHeader } from "@/components/layout/PageHeader";
import { mockBrandProfiles } from "@/lib/mock/data";
import type { BrandProfile } from "@/lib/types";
import { Check, Plus, Upload } from "lucide-react";
import { useState } from "react";

export default function BrandPage() {
  const [profiles, setProfiles] = useState(mockBrandProfiles);
  const [activeId, setActiveId] = useState(profiles.find((p) => p.isDefault)?.id ?? profiles[0]?.id);
  const [form, setForm] = useState<BrandProfile>(profiles[0]);

  const selectProfile = (profile: BrandProfile) => {
    setActiveId(profile.id);
    setForm(profile);
  };

  const setDefault = (id: string) => {
    setProfiles(profiles.map((p) => ({ ...p, isDefault: p.id === id })));
  };

  return (
    <>
      <PageHeader title="品牌资产库" description="统一管理品牌视觉资产，AI 生成自动匹配品牌规范" />

      <div className="flex flex-1 overflow-hidden">
        {/* Profile List */}
        <div className="w-64 shrink-0 overflow-y-auto border-r border-gray-200 bg-white p-4">
          <Button variant="outline" className="mb-4 w-full" size="sm">
            <Plus className="h-4 w-4" />
            新建品牌方案
          </Button>
          <div className="space-y-2">
            {profiles.map((profile) => (
              <button
                key={profile.id}
                onClick={() => selectProfile(profile)}
                className={`w-full rounded-lg border p-3 text-left transition-colors ${
                  activeId === profile.id ? "border-brand-300 bg-brand-50" : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="flex items-center gap-2">
                  <div
                    className="h-8 w-8 rounded-lg"
                    style={{ backgroundColor: profile.primaryColor }}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-gray-900">{profile.name}</p>
                    {profile.isDefault && (
                      <span className="text-[10px] text-brand-600">默认方案</span>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Config Form */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="mx-auto max-w-2xl space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>品牌基础信息</CardTitle>
                <CardDescription>品牌名称与 Slogan 将自动应用于生成素材</CardDescription>
              </CardHeader>
              <div className="space-y-4">
                <Input
                  label="品牌名称"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
                <Input
                  label="品牌 Slogan"
                  value={form.slogan}
                  onChange={(e) => setForm({ ...form, slogan: e.target.value })}
                />
              </div>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>LOGO 管理</CardTitle>
              </CardHeader>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-24 w-24 items-center justify-center rounded-lg border-2 border-dashed border-gray-300">
                    <Upload className="h-6 w-6 text-gray-300" />
                  </div>
                  <div className="flex-1 space-y-3">
                    <Select
                      label="默认位置"
                      value={form.logoPosition}
                      onChange={(e) =>
                        setForm({ ...form, logoPosition: e.target.value as BrandProfile["logoPosition"] })
                      }
                      options={[
                        { value: "top-left", label: "左上" },
                        { value: "top-right", label: "右上" },
                        { value: "bottom-left", label: "左下" },
                        { value: "bottom-right", label: "右下" },
                      ]}
                    />
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        LOGO 大小占比：{form.logoSizePercent}%
                      </label>
                      <input
                        type="range"
                        min={5}
                        max={25}
                        value={form.logoSizePercent}
                        onChange={(e) => setForm({ ...form, logoSizePercent: Number(e.target.value) })}
                        className="mt-1 w-full"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>品牌色值</CardTitle>
              </CardHeader>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">主色</label>
                  <div className="mt-1 flex items-center gap-2">
                    <input
                      type="color"
                      value={form.primaryColor}
                      onChange={(e) => setForm({ ...form, primaryColor: e.target.value })}
                      className="h-10 w-10 cursor-pointer rounded border border-gray-300"
                    />
                    <Input value={form.primaryColor} onChange={(e) => setForm({ ...form, primaryColor: e.target.value })} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">辅助色</label>
                  <div className="mt-1 flex items-center gap-2">
                    <input
                      type="color"
                      value={form.secondaryColor}
                      onChange={(e) => setForm({ ...form, secondaryColor: e.target.value })}
                      className="h-10 w-10 cursor-pointer rounded border border-gray-300"
                    />
                    <Input
                      value={form.secondaryColor}
                      onChange={(e) => setForm({ ...form, secondaryColor: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>品牌字体</CardTitle>
              </CardHeader>
              <Select
                value={form.fontFamily}
                onChange={(e) => setForm({ ...form, fontFamily: e.target.value })}
                options={[
                  { value: "PingFang SC", label: "PingFang SC" },
                  { value: "Helvetica Neue", label: "Helvetica Neue" },
                  { value: "Source Han Sans", label: "思源黑体" },
                  { value: "custom", label: "上传自定义字体" },
                ]}
              />
            </Card>

            <div className="flex justify-end gap-2">
              {!form.isDefault && (
                <Button variant="outline" onClick={() => setDefault(form.id)}>
                  <Check className="h-4 w-4" />
                  设为默认
                </Button>
              )}
              <Button>保存品牌方案</Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
