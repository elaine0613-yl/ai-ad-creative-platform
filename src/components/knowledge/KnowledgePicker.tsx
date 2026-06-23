"use client";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  IMAGE_KNOWLEDGE_CATEGORIES,
  VIDEO_KNOWLEDGE_CATEGORIES,
} from "@/lib/constants";
import { mockKnowledgeAssets } from "@/lib/mock/data";
import type { KnowledgeAsset, KnowledgeLibraryType } from "@/lib/types";
import { BookOpen, Check, Search, X } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

interface KnowledgePickerProps {
  open: boolean;
  onClose: () => void;
  library: KnowledgeLibraryType;
  onSelect: (asset: KnowledgeAsset) => void;
  selectedId?: string | null;
}

export function KnowledgePicker({
  open,
  onClose,
  library,
  onSelect,
  selectedId,
}: KnowledgePickerProps) {
  const categories =
    library === "image" ? IMAGE_KNOWLEDGE_CATEGORIES : VIDEO_KNOWLEDGE_CATEGORIES;
  const [activeCategory, setActiveCategory] = useState(categories[0].id);
  const [search, setSearch] = useState("");

  const assets = useMemo(() => {
    return mockKnowledgeAssets
      .filter((a) => a.library === library && a.categoryId === activeCategory)
      .filter(
        (a) =>
          !search ||
          a.name.includes(search) ||
          a.description.includes(search) ||
          a.tags.some((t) => t.includes(search))
      );
  }, [library, activeCategory, search]);

  if (!open) return null;

  const currentCat = categories.find((c) => c.id === activeCategory)!;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="flex h-[min(640px,90vh)] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
          <div>
            <h2 className="text-base font-semibold text-gray-900">
              从知识库引用
            </h2>
            <p className="text-xs text-gray-500">
              {library === "image" ? "图片知识库" : "视频知识库"} · 一键填充创作参数
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href={`/knowledge?type=${library}`}
              className="text-xs text-brand-600 hover:underline"
              onClick={onClose}
            >
              管理知识库
            </Link>
            <button onClick={onClose} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          <aside className="w-44 shrink-0 overflow-y-auto border-r border-gray-100 bg-gray-50 p-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`mb-0.5 w-full rounded-lg px-2.5 py-2 text-left text-xs transition-colors ${
                  activeCategory === cat.id
                    ? "bg-white font-medium text-brand-700 shadow-sm"
                    : "text-gray-600 hover:bg-white/70"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </aside>

          <div className="flex flex-1 flex-col overflow-hidden p-4">
            <p className="mb-2 text-sm font-medium text-gray-800">{currentCat.label}</p>
            <p className="mb-3 text-xs text-gray-500">{currentCat.description}</p>

            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="搜索..."
                className="pl-8 text-sm"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="flex-1 space-y-2 overflow-y-auto">
              {assets.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                  <BookOpen className="h-8 w-8" />
                  <p className="mt-2 text-sm">暂无匹配资产</p>
                </div>
              ) : (
                assets.map((asset) => (
                  <button
                    key={asset.id}
                    onClick={() => {
                      onSelect(asset);
                      onClose();
                    }}
                    className={`flex w-full items-start gap-3 rounded-xl border p-3 text-left transition-colors hover:border-brand-300 hover:bg-brand-50/50 ${
                      selectedId === asset.id ? "border-brand-400 bg-brand-50" : "border-gray-200"
                    }`}
                  >
                    <div
                      className="mt-0.5 h-10 w-10 shrink-0 rounded-lg"
                      style={{ backgroundColor: asset.previewColor ?? "#E5E7EB" }}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-gray-900">{asset.name}</p>
                        {selectedId === asset.id && (
                          <Check className="h-3.5 w-3.5 text-brand-600" />
                        )}
                      </div>
                      <p className="mt-0.5 line-clamp-2 text-xs text-gray-500">{asset.description}</p>
                      <div className="mt-1.5 flex flex-wrap gap-1">
                        {asset.tags.slice(0, 3).map((tag) => (
                          <span key={tag} className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] text-gray-500">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 px-5 py-3">
          <Button variant="outline" size="sm" onClick={onClose} className="w-full">
            取消
          </Button>
        </div>
      </div>
    </div>
  );
}

interface KnowledgeRefBadgeProps {
  name: string;
  onClear: () => void;
}

export function KnowledgeRefBadge({ name, onClear }: KnowledgeRefBadgeProps) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-brand-200 bg-brand-50 px-3 py-2 text-xs text-brand-800">
      <BookOpen className="h-3.5 w-3.5 shrink-0" />
      <span className="flex-1 truncate">已引用：{name}</span>
      <button onClick={onClear} className="text-brand-600 hover:text-brand-800">
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
