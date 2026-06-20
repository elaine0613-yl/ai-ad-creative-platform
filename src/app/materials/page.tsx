"use client";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { Input } from "@/components/ui/Input";
import { PageHeader } from "@/components/layout/PageHeader";
import { mockMaterials } from "@/lib/mock/data";
import {
  Download,
  FolderOpen,
  Grid3X3,
  Image as ImageIcon,
  List,
  Search,
  Tag,
  Trash2,
  Video,
} from "lucide-react";
import { useState } from "react";

export default function MaterialsPage() {
  const [typeFilter, setTypeFilter] = useState<"all" | "image" | "video">("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<string[]>([]);

  const filtered = mockMaterials
    .filter((m) => typeFilter === "all" || m.type === typeFilter)
    .filter((m) => !search || m.name.includes(search) || m.tags.some((t) => t.includes(search)));

  const toggleSelect = (id: string) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  };

  return (
    <>
      <PageHeader
        title="我的素材"
        description="分类管理、标签筛选、版本回溯"
        actions={
          selected.length > 0 && (
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Tag className="h-3.5 w-3.5" />
                打标签
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-3.5 w-3.5" />
                批量导出
              </Button>
              <Button variant="danger" size="sm">
                <Trash2 className="h-3.5 w-3.5" />
                删除
              </Button>
            </div>
          )
        }
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Folder Tree */}
        <div className="w-56 shrink-0 overflow-y-auto border-r border-gray-200 bg-white p-4">
          <p className="mb-3 text-xs font-medium uppercase text-gray-400">文件夹</p>
          <div className="space-y-1">
            {["全部素材", "图片素材", "视频素材", "618 大促", "防晒系列"].map((folder, i) => (
              <button
                key={folder}
                className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm ${
                  i === 0 ? "bg-brand-50 text-brand-700" : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <FolderOpen className="h-4 w-4" />
                {folder}
              </button>
            ))}
          </div>
        </div>

        {/* Material Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="mb-4 flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="搜索素材名称、标签..."
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex gap-1">
              {(["all", "image", "video"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTypeFilter(t)}
                  className={`rounded-lg px-3 py-1.5 text-sm ${
                    typeFilter === t ? "bg-brand-100 text-brand-700" : "text-gray-500 hover:bg-gray-100"
                  }`}
                >
                  {t === "all" ? "全部" : t === "image" ? "图片" : "视频"}
                </button>
              ))}
            </div>
            <div className="flex rounded-lg border border-gray-200">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 ${viewMode === "grid" ? "bg-gray-100" : ""}`}
              >
                <Grid3X3 className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 ${viewMode === "list" ? "bg-gray-100" : ""}`}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>

          {filtered.length === 0 ? (
            <EmptyState
              icon={<FolderOpen className="h-12 w-12" />}
              title="暂无素材"
              description="开始创作，生成的素材将自动保存在这里"
            />
          ) : viewMode === "grid" ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filtered.map((mat) => (
                <Card
                  key={mat.id}
                  padding="none"
                  className={`group cursor-pointer overflow-hidden transition-shadow hover:shadow-md ${
                    selected.includes(mat.id) ? "ring-2 ring-brand-500" : ""
                  }`}
                  onClick={() => toggleSelect(mat.id)}
                >
                  <div className="relative aspect-square bg-gradient-to-br from-gray-100 to-gray-200">
                    {mat.type === "image" ? (
                      <ImageIcon className="absolute left-1/2 top-1/2 h-8 w-8 -translate-x-1/2 -translate-y-1/2 text-gray-300" />
                    ) : (
                      <Video className="absolute left-1/2 top-1/2 h-8 w-8 -translate-x-1/2 -translate-y-1/2 text-gray-300" />
                    )}
                    {mat.complianceStatus && (
                      <div className="absolute right-2 top-2">
                        <StatusBadge status={mat.complianceStatus} />
                      </div>
                    )}
                    {mat.score && (
                      <div className="absolute bottom-2 left-2 rounded bg-black/60 px-2 py-0.5 text-xs text-white">
                        评分 {mat.score.total}
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <p className="truncate text-sm font-medium text-gray-900">{mat.name}</p>
                    <div className="mt-1 flex items-center justify-between text-xs text-gray-400">
                      <span>
                        {mat.width}×{mat.height} · v{mat.version}
                      </span>
                      <span>{mat.createdAt}</span>
                    </div>
                    <div className="mt-2 flex gap-1">
                      {mat.tags.map((tag) => (
                        <span key={tag} className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] text-gray-500">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {filtered.map((mat) => (
                <div
                  key={mat.id}
                  className="flex items-center gap-4 rounded-lg border border-gray-200 bg-white p-3 hover:border-gray-300"
                >
                  <input
                    type="checkbox"
                    checked={selected.includes(mat.id)}
                    onChange={() => toggleSelect(mat.id)}
                    className="rounded border-gray-300"
                  />
                  <div className="h-12 w-12 rounded bg-gray-100" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{mat.name}</p>
                    <p className="text-xs text-gray-400">
                      {mat.type === "image" ? "图片" : "视频"} · {mat.width}×{mat.height} · v{mat.version}
                    </p>
                  </div>
                  {mat.complianceStatus && <StatusBadge status={mat.complianceStatus} />}
                  <span className="text-xs text-gray-400">{mat.createdAt}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
