"use client";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { PageHeader } from "@/components/layout/PageHeader";
import {
  IMAGE_KNOWLEDGE_CATEGORIES,
  VIDEO_KNOWLEDGE_CATEGORIES,
} from "@/lib/constants";
import { mockKnowledgeAssets, mockTemplates } from "@/lib/mock/data";
import type { KnowledgeLibraryType } from "@/lib/types";
import { BookOpen, Image as ImageIcon, Plus, Search, Sparkles, Video } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useMemo, useState } from "react";

function KnowledgeContent() {
  const searchParams = useSearchParams();
  const initialLibrary = (searchParams.get("type") === "video" ? "video" : "image") as KnowledgeLibraryType;
  const initialCategory = searchParams.get("category") ?? undefined;

  const [library, setLibrary] = useState<KnowledgeLibraryType>(initialLibrary);
  const [activeCategory, setActiveCategory] = useState(
    initialCategory ??
      (initialLibrary === "video"
        ? VIDEO_KNOWLEDGE_CATEGORIES[0].id
        : IMAGE_KNOWLEDGE_CATEGORIES[0].id)
  );
  const [search, setSearch] = useState("");

  const categories =
    library === "image" ? IMAGE_KNOWLEDGE_CATEGORIES : VIDEO_KNOWLEDGE_CATEGORIES;

  const currentCategory =
    categories.find((c) => c.id === activeCategory) ?? categories[0];

  const assets = useMemo(() => {
    return mockKnowledgeAssets
      .filter((a) => a.library === library && a.categoryId === currentCategory.id)
      .filter(
        (a) =>
          !search ||
          a.name.includes(search) ||
          a.description.includes(search) ||
          a.tags.some((t) => t.includes(search))
      );
  }, [library, currentCategory.id, search]);

  const templatesInCategory = useMemo(() => {
    if (currentCategory.id !== "industry-template" && currentCategory.id !== "video-template") {
      return [];
    }
    return mockTemplates.filter((t) => t.type === library);
  }, [currentCategory.id, library]);

  const createHref = library === "image" ? "/image/create" : "/video/create";

  return (
    <>
      <PageHeader
        title="知识库"
        description="沉淀图片与视频广告制作经验，创作时一键引用"
        hideGlobalSearch
        actions={
          <Link href={createHref}>
            <Button size="sm">
              <Sparkles className="h-3.5 w-3.5" />
              去创作
            </Button>
          </Link>
        }
        toolbar={
          <div className="flex flex-wrap items-center gap-2">
            <span className="mr-1 text-xs font-medium text-gray-400">库类型</span>
            <button
              type="button"
              onClick={() => {
                setLibrary("image");
                setActiveCategory(IMAGE_KNOWLEDGE_CATEGORIES[0].id);
              }}
              className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium transition-colors ${
                library === "image"
                  ? "bg-brand-100 text-brand-700"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <ImageIcon className="h-4 w-4 shrink-0" />
              图片知识库
            </button>
            <button
              type="button"
              onClick={() => {
                setLibrary("video");
                setActiveCategory(VIDEO_KNOWLEDGE_CATEGORIES[0].id);
              }}
              className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium transition-colors ${
                library === "video"
                  ? "bg-brand-100 text-brand-700"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <Video className="h-4 w-4 shrink-0" />
              视频知识库
            </button>
          </div>
        }
      />

      <div className="flex flex-1 overflow-hidden">
        {/* 分类侧栏 */}
        <aside className="w-56 shrink-0 overflow-y-auto border-r border-gray-200 bg-gray-50 p-3">
            <p className="mb-2 px-2 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
              {library === "image" ? "平面广告结构" : "短视频制作要素"}
            </p>
            <nav className="space-y-0.5">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveCategory(cat.id)}
                  className={`w-full rounded-lg px-3 py-2.5 text-left text-sm leading-snug transition-colors ${
                    activeCategory === cat.id
                      ? "bg-white font-medium text-brand-700 shadow-sm"
                      : "text-gray-600 hover:bg-white/60"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </nav>
          </aside>

          {/* 主内容区 */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="mx-auto max-w-5xl">
              <div className="mb-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">{currentCategory.label}</h2>
                    <p className="mt-1 text-sm text-gray-500">{currentCategory.description}</p>
                  </div>
                  <Button variant="outline" size="sm">
                    <Plus className="h-3.5 w-3.5" />
                    添加资产
                  </Button>
                </div>

                {/* 行业术语 */}
                <div className="mt-4 flex flex-wrap gap-2">
                  {currentCategory.terms.map((term) => (
                    <span
                      key={term}
                      className="rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-600"
                    >
                      {term}
                    </span>
                  ))}
                </div>
              </div>

              <div className="relative mb-6 max-w-md">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder={`搜索${currentCategory.label}...`}
                  className="pl-9"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              {/* 模板专区 */}
              {templatesInCategory.length > 0 && (
                <div className="mb-8">
                  <h3 className="mb-3 text-sm font-semibold text-gray-700">行业模板</h3>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {templatesInCategory.map((tpl) => (
                      <Link key={tpl.id} href={createHref}>
                        <Card className="overflow-hidden transition-shadow hover:shadow-md">
                          <div className="flex h-28 items-center justify-center bg-gradient-to-br from-brand-50 to-brand-100">
                            <BookOpen className="h-8 w-8 text-brand-300" />
                          </div>
                          <div className="p-3">
                            <p className="text-sm font-medium text-gray-900">{tpl.name}</p>
                            <p className="mt-0.5 text-xs text-gray-500">
                              {tpl.industry} · {tpl.size}
                            </p>
                          </div>
                        </Card>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* 知识资产列表 */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {assets.map((asset) => (
                  <Link key={asset.id} href={`${createHref}?ref=${asset.id}`}>
                    <Card className="overflow-hidden transition-shadow hover:shadow-md hover:ring-1 hover:ring-brand-200">
                      <div
                        className="flex h-24 items-center justify-center"
                        style={{ backgroundColor: asset.previewColor ?? "#F3F4F6" }}
                      >
                        {library === "image" ? (
                          <ImageIcon className="h-8 w-8 text-white/80" />
                        ) : (
                          <Video className="h-8 w-8 text-white/80" />
                        )}
                      </div>
                      <div className="p-4">
                        <p className="font-medium text-gray-900">{asset.name}</p>
                        <p className="mt-1 line-clamp-2 text-xs text-gray-500">{asset.description}</p>
                        <div className="mt-3 flex flex-wrap gap-1">
                          {asset.tags.map((tag) => (
                            <span
                              key={tag}
                              className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] text-gray-500"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                        <p className="mt-3 text-xs font-medium text-brand-600">引用到创作 →</p>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>

              {assets.length === 0 && templatesInCategory.length === 0 && (
                <div className="rounded-xl border border-dashed border-gray-200 py-16 text-center">
                  <BookOpen className="mx-auto h-10 w-10 text-gray-300" />
                  <p className="mt-3 text-sm text-gray-500">暂无匹配的{currentCategory.label}资产</p>
                </div>
              )}
            </div>
        </div>
      </div>
    </>
  );
}

export default function KnowledgePage() {
  return (
    <Suspense fallback={<div className="flex flex-1 items-center justify-center text-gray-400">加载中...</div>}>
      <KnowledgeContent />
    </Suspense>
  );
}
