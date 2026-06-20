"use client";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { PageHeader } from "@/components/layout/PageHeader";
import { INDUSTRIES } from "@/lib/constants";
import { mockTemplates } from "@/lib/mock/data";
import type { Template } from "@/lib/types";
import { Heart, Search, Star } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function TemplatesPage() {
  const [typeFilter, setTypeFilter] = useState<"all" | "image" | "video">("all");
  const [industryFilter, setIndustryFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [preview, setPreview] = useState<Template | null>(null);
  const [sort, setSort] = useState<"popular" | "latest">("popular");

  const filtered = mockTemplates
    .filter((t) => typeFilter === "all" || t.type === typeFilter)
    .filter((t) => industryFilter === "all" || t.industry === industryFilter)
    .filter((t) => !search || t.name.includes(search) || t.styleTags.some((tag) => tag.includes(search)))
    .sort((a, b) => (sort === "popular" ? b.popularity - a.popularity : b.createdAt.localeCompare(a.createdAt)));

  return (
    <>
      <PageHeader title="模板中心" description="全行业、全场景广告模板，一键套用生成" />

      <div className="flex-1 overflow-y-auto p-6">
        <div className="mx-auto max-w-7xl">
          {/* Filters */}
          <div className="mb-6 flex flex-wrap items-center gap-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="搜索模板..."
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              {(["all", "image", "video"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTypeFilter(t)}
                  className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
                    typeFilter === t ? "bg-brand-100 text-brand-700" : "text-gray-500 hover:bg-gray-100"
                  }`}
                >
                  {t === "all" ? "全部" : t === "image" ? "图片" : "视频"}
                </button>
              ))}
            </div>
            <select
              value={industryFilter}
              onChange={(e) => setIndustryFilter(e.target.value)}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="all">全部行业</option>
              {INDUSTRIES.map((i) => (
                <option key={i} value={i}>
                  {i}
                </option>
              ))}
            </select>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as "popular" | "latest")}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="popular">按热度</option>
              <option value="latest">按最新</option>
            </select>
          </div>

          {/* Template Grid */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((tpl) => (
              <Card
                key={tpl.id}
                padding="none"
                className="group cursor-pointer overflow-hidden transition-shadow hover:shadow-md"
                onClick={() => setPreview(tpl)}
              >
                <div className="relative aspect-[4/3] bg-gradient-to-br from-gray-100 to-gray-200">
                  <span className="absolute left-2 top-2 rounded bg-white/90 px-2 py-0.5 text-xs font-medium text-gray-700">
                    {tpl.type === "image" ? "图片" : "视频"}
                  </span>
                  <button
                    className="absolute right-2 top-2 rounded-full bg-white/90 p-1.5 text-gray-400 hover:text-red-500"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Heart className="h-3.5 w-3.5" />
                  </button>
                </div>
                <div className="p-3">
                  <h3 className="text-sm font-semibold text-gray-900 group-hover:text-brand-600">{tpl.name}</h3>
                  <div className="mt-1 flex items-center gap-2 text-xs text-gray-400">
                    <span>{tpl.industry}</span>
                    <span>·</span>
                    <span>{tpl.scene}</span>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <div className="flex gap-1">
                      {tpl.styleTags.slice(0, 2).map((tag) => (
                        <span key={tag} className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] text-gray-500">
                          {tag}
                        </span>
                      ))}
                    </div>
                    <span className="flex items-center gap-0.5 text-xs text-gray-400">
                      <Star className="h-3 w-3" />
                      {(tpl.popularity / 1000).toFixed(1)}k
                    </span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>

      <Modal open={!!preview} onClose={() => setPreview(null)} title={preview?.name ?? ""} size="lg">
        {preview && (
          <div className="space-y-4">
            <div className="flex aspect-video items-center justify-center rounded-lg bg-gray-100">
              <span className="text-sm text-gray-400">模板预览</span>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">行业：</span>
                {preview.industry}
              </div>
              <div>
                <span className="text-gray-500">场景：</span>
                {preview.scene}
              </div>
              <div>
                <span className="text-gray-500">尺寸：</span>
                {preview.size}
              </div>
              <div>
                <span className="text-gray-500">标签：</span>
                {preview.styleTags.join("、")}
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setPreview(null)}>
                关闭
              </Button>
              <Link href={preview.type === "image" ? "/image/create" : "/video/create"}>
                <Button onClick={() => setPreview(null)}>使用模板</Button>
              </Link>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
