"use client";

import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Input } from "@/components/ui/Input";
import { PageHeader } from "@/components/layout/PageHeader";
import { Tabs } from "@/components/ui/Tabs";
import { MaterialDetailModal } from "@/components/materials/MaterialDetailModal";
import type {
  AssetOwnership,
  AssetSource,
  MaterialCatalogAsset,
  MaterialLibraryTab,
  MaterialTopCategory,
} from "@/lib/material-library/catalog-types";
import {
  MATERIAL_TOP_CATEGORIES,
  OWNERSHIP_LABELS,
  SOURCE_LABELS,
  getSubCategoryLabel,
} from "@/lib/material-library/catalog-types";
import { queryMaterialCatalog } from "@/lib/material-library/catalog-mock";
import {
  CheckSquare,
  Download,
  FolderPlus,
  Grid3X3,
  Image as ImageIcon,
  List,
  Pencil,
  Recycle,
  Search,
  Tag,
  Trash2,
  Upload,
  Video,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

export function MaterialsLibraryPage() {
  const [tab, setTab] = useState<MaterialLibraryTab>("image");
  const [search, setSearch] = useState("");
  const [ownership, setOwnership] = useState<AssetOwnership | "all">("all");
  const [topCategory, setTopCategory] = useState<MaterialTopCategory | "all">("all");
  const [subCategoryId, setSubCategoryId] = useState<string | undefined>();
  const [source, setSource] = useState<AssetSource | "all">("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selected, setSelected] = useState<string[]>([]);
  const [detailAsset, setDetailAsset] = useState<MaterialCatalogAsset | null>(null);
  const [showRecycle, setShowRecycle] = useState(false);

  const visibleGroups = useMemo(
    () =>
      MATERIAL_TOP_CATEGORIES.filter((g) => {
        if (tab === "image") return g.id !== "video-pipeline";
        return g.id !== "image-pipeline";
      }),
    [tab]
  );

  const assets = useMemo(
    () =>
      queryMaterialCatalog({
        tab,
        search,
        ownership,
        topCategory,
        subCategoryId,
        source,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
      }),
    [tab, search, ownership, topCategory, subCategoryId, source, dateFrom, dateTo]
  );

  const toggleSelect = (id: string) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  };

  const toggleSelectAll = () => {
    if (selected.length === assets.length) setSelected([]);
    else setSelected(assets.map((a) => a.id));
  };

  const createHref = tab === "video" ? "/video/create" : "/image/create";

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PageHeader
        title="素材库"
        description="统一管理品牌、图片/视频链路、策略模板与平台预置资产；创作流程各节点可一键调取回填"
        hideGlobalSearch
        toolbar={
          <Tabs
            tabs={[
              { id: "image", label: "图片类资产", badge: String(queryMaterialCatalog({ tab: "image" }).length) },
              { id: "video", label: "视频类资产", badge: String(queryMaterialCatalog({ tab: "video" }).length) },
            ]}
            activeTab={tab}
            onChange={(id) => {
              setTab(id as MaterialLibraryTab);
              setTopCategory("all");
              setSubCategoryId(undefined);
              setSelected([]);
            }}
          />
        }
      />

      {/* 全局筛选控制区 */}
      <div className="shrink-0 border-b border-gray-200 bg-white px-6 py-3">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-end">
          <div className="relative min-w-0 flex-1 xl:max-w-xs">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="搜索名称、标签、类目、渠道..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
            value={ownership}
            onChange={(e) => setOwnership(e.target.value as AssetOwnership | "all")}
          >
            <option value="all">全部归属</option>
            {(Object.keys(OWNERSHIP_LABELS) as AssetOwnership[]).map((k) => (
              <option key={k} value={k}>
                {OWNERSHIP_LABELS[k]}
              </option>
            ))}
          </select>
          <select
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
            value={topCategory}
            onChange={(e) => {
              setTopCategory(e.target.value as MaterialTopCategory | "all");
              setSubCategoryId(undefined);
            }}
          >
            <option value="all">全部分类</option>
            {visibleGroups.map((g) => (
              <option key={g.id} value={g.id}>
                {g.label}
              </option>
            ))}
          </select>
          <select
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
            value={source}
            onChange={(e) => setSource(e.target.value as AssetSource | "all")}
          >
            <option value="all">全部来源</option>
            {(Object.keys(SOURCE_LABELS) as AssetSource[]).map((k) => (
              <option key={k} value={k}>
                {SOURCE_LABELS[k]}
              </option>
            ))}
          </select>
          <Input type="date" className="w-36" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
          <span className="hidden text-gray-400 sm:inline">—</span>
          <Input type="date" className="w-36" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
          <div className="flex rounded-lg border border-gray-200 p-0.5">
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              className={`rounded-md p-2 ${viewMode === "grid" ? "bg-gray-100 text-gray-900" : "text-gray-400"}`}
              aria-label="卡片视图"
            >
              <Grid3X3 className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("list")}
              className={`rounded-md p-2 ${viewMode === "list" ? "bg-gray-100 text-gray-900" : "text-gray-400"}`}
              aria-label="列表视图"
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 overflow-hidden">
        {/* 分类侧栏 */}
        <aside className="hidden w-56 shrink-0 overflow-y-auto border-r border-gray-200 bg-gray-50/50 p-4 lg:block">
          <button
            type="button"
            onClick={() => {
              setTopCategory("all");
              setSubCategoryId(undefined);
            }}
            className={`mb-3 w-full rounded-lg px-3 py-2 text-left text-sm font-medium ${
              !subCategoryId && topCategory === "all" ? "bg-brand-50 text-brand-700" : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            全部资产
          </button>
          {visibleGroups.map((group) => (
            <div key={group.id} className="mb-4">
              <p className="mb-1 px-2 text-xs font-semibold uppercase tracking-wide text-gray-400">{group.label}</p>
              {group.subCategories
                .filter((s) => s.tabs.includes(tab))
                .map((sub) => (
                  <button
                    key={sub.id}
                    type="button"
                    onClick={() => {
                      setTopCategory(group.id);
                      setSubCategoryId(sub.id);
                    }}
                    className={`mb-0.5 w-full rounded-lg px-3 py-1.5 text-left text-sm ${
                      subCategoryId === sub.id
                        ? "bg-brand-50 font-medium text-brand-700"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    {sub.label}
                  </button>
                ))}
            </div>
          ))}
        </aside>

        {/* 资产列表区 */}
        <div className="min-h-0 flex-1 overflow-y-auto p-6 pb-28">
          {showRecycle ? (
            <EmptyState
              icon={<Recycle className="h-12 w-12" />}
              title="回收站"
              description="已移入回收站的素材将在此保留 30 天，之后自动清理"
            />
          ) : assets.length === 0 ? (
            <EmptyState
              icon={tab === "image" ? <ImageIcon className="h-12 w-12" /> : <Video className="h-12 w-12" />}
              title="暂无匹配的素材"
              description="调整筛选条件，或使用底部批量上传添加新素材"
            />
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
              {assets.map((asset) => (
                <AssetCard
                  key={asset.id}
                  asset={asset}
                  selected={selected.includes(asset.id)}
                  onToggleSelect={() => toggleSelect(asset.id)}
                  onOpen={() => setDetailAsset(asset)}
                  createHref={createHref}
                />
              ))}
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
              <table className="w-full text-sm">
                <thead className="border-b border-gray-100 bg-gray-50 text-left text-xs text-gray-500">
                  <tr>
                    <th className="p-3 w-10">
                      <input
                        type="checkbox"
                        checked={selected.length === assets.length && assets.length > 0}
                        onChange={toggleSelectAll}
                      />
                    </th>
                    <th className="p-3">名称</th>
                    <th className="p-3 hidden md:table-cell">分类</th>
                    <th className="p-3 hidden lg:table-cell">归属</th>
                    <th className="p-3 hidden lg:table-cell">创建时间</th>
                    <th className="p-3">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {assets.map((asset) => (
                    <tr key={asset.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                      <td className="p-3">
                        <input
                          type="checkbox"
                          checked={selected.includes(asset.id)}
                          onChange={() => toggleSelect(asset.id)}
                        />
                      </td>
                      <td className="p-3">
                        <button
                          type="button"
                          className="flex items-center gap-3 text-left"
                          onClick={() => setDetailAsset(asset)}
                        >
                          <div
                            className="h-10 w-10 shrink-0 rounded-lg"
                            style={{ backgroundColor: asset.previewColor ?? "#E5E7EB" }}
                          />
                          <span className="font-medium text-gray-900">{asset.name}</span>
                        </button>
                      </td>
                      <td className="p-3 hidden md:table-cell text-gray-500">
                        {getSubCategoryLabel(asset.subCategoryId)}
                      </td>
                      <td className="p-3 hidden lg:table-cell text-gray-500">
                        {OWNERSHIP_LABELS[asset.ownership]}
                      </td>
                      <td className="p-3 hidden lg:table-cell text-gray-500">{asset.createdAt}</td>
                      <td className="p-3">
                        <div className="flex gap-1">
                          <Link href={`${createHref}?materialId=${asset.id}`}>
                            <Button variant="ghost" size="sm">
                              选用
                            </Button>
                          </Link>
                          {!asset.readonly && (
                            <Button variant="ghost" size="sm">
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* 底部批量操作栏 */}
      <div className="fixed bottom-0 left-0 right-0 z-20 border-t border-gray-200 bg-white/95 px-6 py-3 backdrop-blur lg:left-60">
        <div className="mx-auto flex max-w-screen-2xl flex-wrap items-center gap-2">
          {selected.length > 0 && (
            <span className="mr-2 text-sm text-gray-500">已选 {selected.length} 项</span>
          )}
          <Button variant="outline" size="sm">
            <Upload className="h-3.5 w-3.5" />
            批量上传
          </Button>
          <Button variant="outline" size="sm">
            <FolderPlus className="h-3.5 w-3.5" />
            新建文件夹
          </Button>
          <Button variant="outline" size="sm" disabled={selected.length === 0}>
            <Tag className="h-3.5 w-3.5" />
            批量打标签
          </Button>
          <Button variant="outline" size="sm" disabled={selected.length === 0}>
            批量移动分类
          </Button>
          <Button variant="outline" size="sm" disabled={selected.length === 0}>
            <Download className="h-3.5 w-3.5" />
            批量导出
          </Button>
          <Button variant="outline" size="sm" disabled={selected.length === 0}>
            <Recycle className="h-3.5 w-3.5" />
            移入回收站
          </Button>
          <Button variant="danger" size="sm" disabled={selected.length === 0}>
            <Trash2 className="h-3.5 w-3.5" />
            批量删除
          </Button>
          <div className="flex-1" />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowRecycle(!showRecycle)}
            className={showRecycle ? "text-brand-600" : ""}
          >
            <Recycle className="h-3.5 w-3.5" />
            回收站
          </Button>
        </div>
      </div>

      <MaterialDetailModal
        asset={detailAsset}
        open={!!detailAsset}
        onClose={() => setDetailAsset(null)}
      />
    </div>
  );
}

function AssetCard({
  asset,
  selected,
  onToggleSelect,
  onOpen,
  createHref,
}: {
  asset: MaterialCatalogAsset;
  selected: boolean;
  onToggleSelect: () => void;
  onOpen: () => void;
  createHref: string;
}) {
  return (
    <div
      className={`group relative overflow-hidden rounded-xl border bg-white transition-shadow hover:shadow-md ${
        selected ? "border-brand-400 ring-1 ring-brand-400" : "border-gray-200"
      }`}
    >
      <div className="absolute left-2 top-2 z-10">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleSelect();
          }}
          className={`rounded-md p-1 ${selected ? "bg-brand-600 text-white" : "bg-white/90 text-gray-400 opacity-0 group-hover:opacity-100"}`}
        >
          <CheckSquare className="h-4 w-4" />
        </button>
      </div>
      {asset.readonly && (
        <span className="absolute right-2 top-2 z-10 rounded bg-gray-900/60 px-1.5 py-0.5 text-[10px] text-white">
          只读
        </span>
      )}
      <button type="button" className="block w-full text-left" onClick={onOpen}>
        <div
          className="flex aspect-[4/3] items-center justify-center"
          style={{ backgroundColor: asset.previewColor ?? "#E5E7EB" }}
        >
          {asset.durationSec ? (
            <span className="rounded bg-black/50 px-2 py-0.5 text-xs text-white">{asset.durationSec}s</span>
          ) : null}
        </div>
        <div className="p-3">
          <p className="truncate text-sm font-medium text-gray-900">{asset.name}</p>
          <p className="mt-0.5 truncate text-xs text-gray-500">{getSubCategoryLabel(asset.subCategoryId)}</p>
          <p className="mt-1 text-[10px] text-gray-400">{asset.createdAt}</p>
        </div>
      </button>
      <div className="flex border-t border-gray-100 px-2 py-1.5 opacity-0 transition-opacity group-hover:opacity-100">
        <Link href={`${createHref}?materialId=${asset.id}`} className="flex-1">
          <Button variant="ghost" size="sm" className="w-full text-xs">
            选用
          </Button>
        </Link>
        {!asset.readonly && (
          <>
            <Button variant="ghost" size="sm" className="text-xs">
              <Pencil className="h-3 w-3" />
            </Button>
            <Button variant="ghost" size="sm" className="text-xs text-red-500">
              <Trash2 className="h-3 w-3" />
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
