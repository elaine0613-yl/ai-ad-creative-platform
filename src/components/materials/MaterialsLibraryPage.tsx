"use client";

import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Input } from "@/components/ui/Input";
import { PageHeader } from "@/components/layout/PageHeader";
import { Tabs } from "@/components/ui/Tabs";
import { MaterialDetailModal } from "@/components/materials/MaterialDetailModal";
import type {
  ArchiveMaterial,
  ArchiveMaterialStatus,
  GenerateMode,
  ImageAspectRatio,
  ImageSceneType,
  ImageVisualStyle,
  MaterialPartition,
  VideoDurationTier,
  VideoPace,
  VideoType,
} from "@/lib/material-library/catalog-types";
import {
  AI_TAG_OPTIONS,
  BRAND_OPTIONS,
  CHANNEL_OPTIONS,
  GENERATE_MODE_LABELS,
  GENERATE_MODE_OPTIONS,
  IMAGE_ASPECT_OPTIONS,
  IMAGE_SCENE_OPTIONS,
  IMAGE_STYLE_OPTIONS,
  INDUSTRY_OPTIONS,
  STATUS_LABELS,
  STATUS_OPTIONS,
  VIDEO_DURATION_OPTIONS,
  VIDEO_PACE_OPTIONS,
  VIDEO_TYPE_OPTIONS,
  getChannelLabel,
  getIndustryLabel,
} from "@/lib/material-library/catalog-types";
import { ARCHIVE_MATERIALS, countByPartition, queryArchiveMaterials } from "@/lib/material-library/catalog-mock";
import { downloadArchiveMaterial, downloadArchiveMaterialsBatch } from "@/lib/material-library/download";
import {
  CheckSquare,
  ChevronLeft,
  ChevronRight,
  Download,
  Image as ImageIcon,
  Pencil,
  Search,
  Video,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

const PAGE_SIZE = 12;

export function MaterialsLibraryPage() {
  const [partition, setPartition] = useState<MaterialPartition>("image");
  const [search, setSearch] = useState("");
  const [generateMode, setGenerateMode] = useState<GenerateMode | "all">("all");
  const [channel, setChannel] = useState("all");
  const [brand, setBrand] = useState("all");
  const [industry, setIndustry] = useState("all");
  const [status, setStatus] = useState<ArchiveMaterialStatus | "all">("all");
  const [aiTag, setAiTag] = useState("all");
  const [taskId, setTaskId] = useState("");
  const [datePreset, setDatePreset] = useState<"all" | "1d" | "7d" | "30d">("all");
  const [aspectRatio, setAspectRatio] = useState<ImageAspectRatio | "all">("all");
  const [visualStyle, setVisualStyle] = useState<ImageVisualStyle | "all">("all");
  const [sceneType, setSceneType] = useState<ImageSceneType | "all">("all");
  const [durationTier, setDurationTier] = useState<VideoDurationTier | "all">("all");
  const [pace, setPace] = useState<VideoPace | "all">("all");
  const [hasSubtitle, setHasSubtitle] = useState<"all" | "yes" | "no">("all");
  const [videoType, setVideoType] = useState<VideoType | "all">("all");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<string[]>([]);
  const [includeTraceOnExport, setIncludeTraceOnExport] = useState(false);
  const [detailAsset, setDetailAsset] = useState<ArchiveMaterial | null>(null);
  const [materials, setMaterials] = useState(ARCHIVE_MATERIALS);

  const filtered = useMemo(() => {
    const ids = new Set(materials.map((m) => m.id));
    return queryArchiveMaterials({
      partition,
      search,
      generateMode,
      channel,
      brand,
      industry,
      status,
      aiTag,
      taskId,
      datePreset,
      aspectRatio,
      visualStyle,
      sceneType,
      durationTier,
      pace,
      hasSubtitle,
      videoType,
    }).filter((m) => ids.has(m.id));
  }, [
    materials,
    partition,
    search,
    generateMode,
    channel,
    brand,
    industry,
    status,
    aiTag,
    taskId,
    datePreset,
    aspectRatio,
    visualStyle,
    sceneType,
    durationTier,
    pace,
    hasSubtitle,
    videoType,
  ]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const toggleSelect = (id: string) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  };

  const handlePartitionChange = (id: string) => {
    setPartition(id as MaterialPartition);
    setPage(1);
    setSelected([]);
    setAspectRatio("all");
    setVisualStyle("all");
    setSceneType("all");
    setDurationTier("all");
    setPace("all");
    setHasSubtitle("all");
    setVideoType("all");
  };

  const handleRename = (asset: ArchiveMaterial) => {
    const next = window.prompt("重命名素材", asset.name);
    if (!next?.trim() || next === asset.name) return;
    setMaterials((prev) =>
      prev.map((m) =>
        m.id === asset.id
          ? {
              ...m,
              name: next.trim(),
              operationRecords: [
                ...m.operationRecords,
                {
                  action: `重命名为「${next.trim()}」`,
                  operator: "当前用户",
                  at: new Date().toISOString().slice(0, 16).replace("T", " "),
                },
              ],
            }
          : m
      )
    );
    if (detailAsset?.id === asset.id) {
      setDetailAsset((prev) => (prev ? { ...prev, name: next.trim() } : prev));
    }
  };

  const selectedMaterials = materials.filter((m) => selected.includes(m.id));

  const handleBatchDownload = () => {
    downloadArchiveMaterialsBatch(selectedMaterials, includeTraceOnExport);
    setMaterials((prev) =>
      prev.map((m) =>
        selected.includes(m.id)
          ? {
              ...m,
              exportRecords: [
                ...m.exportRecords,
                {
                  action: includeTraceOnExport ? "批量导出（含溯源）" : "批量导出",
                  operator: "当前用户",
                  at: new Date().toISOString().slice(0, 16).replace("T", " "),
                },
              ],
            }
          : m
      )
    );
  };

  const createHref = partition === "video" ? "/video/create" : "/image/create";

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PageHeader
        title="素材库"
        hideGlobalSearch
        toolbar={
          <Tabs
            tabs={[
              { id: "image", label: "图片素材库", badge: String(countByPartition("image")) },
              { id: "video", label: "视频素材库", badge: String(countByPartition("video")) },
            ]}
            activeTab={partition}
            onChange={handlePartitionChange}
          />
        }
      />

      {/* 通用筛选 */}
      <div className="shrink-0 border-b border-gray-200 bg-white px-6 py-3">
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-end">
            <div className="relative min-w-0 flex-1 xl:max-w-xs">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="素材名称、任务ID、商品、卖点…"
                className="pl-9"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
              />
            </div>
            <Input
              placeholder="产出任务 ID"
              className="xl:w-36"
              value={taskId}
              onChange={(e) => {
                setTaskId(e.target.value);
                setPage(1);
              }}
            />
            <select
              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
              value={generateMode}
              onChange={(e) => setGenerateMode(e.target.value as GenerateMode | "all")}
            >
              {GENERATE_MODE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            <select
              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
              value={channel}
              onChange={(e) => setChannel(e.target.value)}
            >
              {CHANNEL_OPTIONS.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
            <select
              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
            >
              {BRAND_OPTIONS.map((b) => (
                <option key={b.value} value={b.value}>
                  {b.label}
                </option>
              ))}
            </select>
            <select
              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
            >
              {INDUSTRY_OPTIONS.map((i) => (
                <option key={i.value} value={i.value}>
                  {i.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-wrap gap-2">
            <select
              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
              value={datePreset}
              onChange={(e) => setDatePreset(e.target.value as typeof datePreset)}
            >
              <option value="all">全部时间</option>
              <option value="1d">近 1 天</option>
              <option value="7d">近 7 天</option>
              <option value="30d">近 30 天</option>
            </select>
            <select
              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
              value={status}
              onChange={(e) => setStatus(e.target.value as ArchiveMaterialStatus | "all")}
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
            <select
              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
              value={aiTag}
              onChange={(e) => setAiTag(e.target.value)}
            >
              {AI_TAG_OPTIONS.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
            {partition === "image" ? (
              <>
                <select
                  className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
                  value={aspectRatio}
                  onChange={(e) => setAspectRatio(e.target.value as ImageAspectRatio | "all")}
                >
                  {IMAGE_ASPECT_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
                <select
                  className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
                  value={visualStyle}
                  onChange={(e) => setVisualStyle(e.target.value as ImageVisualStyle | "all")}
                >
                  {IMAGE_STYLE_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
                <select
                  className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
                  value={sceneType}
                  onChange={(e) => setSceneType(e.target.value as ImageSceneType | "all")}
                >
                  {IMAGE_SCENE_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </>
            ) : (
              <>
                <select
                  className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
                  value={durationTier}
                  onChange={(e) => setDurationTier(e.target.value as VideoDurationTier | "all")}
                >
                  {VIDEO_DURATION_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
                <select
                  className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
                  value={pace}
                  onChange={(e) => setPace(e.target.value as VideoPace | "all")}
                >
                  {VIDEO_PACE_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
                <select
                  className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
                  value={hasSubtitle}
                  onChange={(e) => setHasSubtitle(e.target.value as typeof hasSubtitle)}
                >
                  <option value="all">字幕配置</option>
                  <option value="yes">带字幕</option>
                  <option value="no">无字幕</option>
                </select>
                <select
                  className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
                  value={videoType}
                  onChange={(e) => setVideoType(e.target.value as VideoType | "all")}
                >
                  {VIDEO_TYPE_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </>
            )}
            <span className="self-center text-xs text-gray-400">共 {filtered.length} 条成品素材</span>
          </div>
        </div>
      </div>

      {/* 卡片列表 */}
      <div className="min-h-0 flex-1 overflow-y-auto p-6 pb-36">
        {paged.length === 0 ? (
          <EmptyState
            icon={partition === "image" ? <ImageIcon className="h-12 w-12" /> : <Video className="h-12 w-12" />}
            title="暂无匹配的成品素材"
            description="仅展示任务中心审核通过的成品；未通过审核或生成失败的素材请前往任务中心查看"
            action={
              <Link href="/tasks">
                <Button variant="outline" size="sm">
                  前往任务中心
                </Button>
              </Link>
            }
          />
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
            {paged.map((asset) => (
              <MaterialCard
                key={asset.id}
                asset={asset}
                selected={selected.includes(asset.id)}
                onToggleSelect={() => toggleSelect(asset.id)}
                onOpen={() => setDetailAsset(asset)}
                onRename={() => handleRename(asset)}
                onDownload={() => downloadArchiveMaterial(asset, includeTraceOnExport)}
                createHref={createHref}
              />
            ))}
          </div>
        )}

        {/* 分页 */}
        {filtered.length > 0 && (
          <div className="mt-6 flex items-center justify-center gap-3">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
              上一页
            </Button>
            <span className="text-sm text-gray-500">
              第 {page} / {totalPages} 页
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              下一页
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {/* 底部批量操作 */}
      <div className="fixed bottom-0 left-0 right-0 z-20 border-t border-gray-200 bg-white/95 px-6 py-3 backdrop-blur lg:left-60">
        <div className="mx-auto flex max-w-screen-2xl flex-wrap items-center gap-2">
          {selected.length > 0 && <span className="mr-2 text-sm text-gray-500">已选 {selected.length} 项</span>}
          <label className="mr-2 flex items-center gap-1.5 text-xs text-gray-500">
            <input
              type="checkbox"
              checked={includeTraceOnExport}
              onChange={(e) => setIncludeTraceOnExport(e.target.checked)}
            />
            导出附带溯源参数
          </label>
          <Button variant="outline" size="sm" disabled={selected.length === 0} onClick={handleBatchDownload}>
            <Download className="h-3.5 w-3.5" />
            批量导出
          </Button>
          <div className="flex-1" />
          <Link href={createHref}>
            <Button variant="ghost" size="sm">
              基于素材二次创作
            </Button>
          </Link>
        </div>
      </div>

      <MaterialDetailModal
        asset={detailAsset}
        open={!!detailAsset}
        onClose={() => setDetailAsset(null)}
        onRename={handleRename}
        includeTraceOnExport={includeTraceOnExport}
        onDownload={(asset, withTrace) => {
          downloadArchiveMaterial(asset, withTrace);
          setMaterials((prev) =>
            prev.map((m) =>
              m.id === asset.id
                ? {
                    ...m,
                    exportRecords: [
                      ...m.exportRecords,
                      {
                        action: withTrace ? "单素材下载（含溯源）" : "单素材下载",
                        operator: "当前用户",
                        at: new Date().toISOString().slice(0, 16).replace("T", " "),
                      },
                    ],
                  }
                : m
            )
          );
        }}
      />
    </div>
  );
}

function MaterialCard({
  asset,
  selected,
  onToggleSelect,
  onOpen,
  onRename,
  onDownload,
  createHref,
}: {
  asset: ArchiveMaterial;
  selected: boolean;
  onToggleSelect: () => void;
  onOpen: () => void;
  onRename: () => void;
  onDownload: () => void;
  createHref: string;
}) {
  const sizeLabel =
    asset.partition === "video"
      ? `${asset.durationSec ?? asset.durationTier}s`
      : asset.aspectRatio ?? `${asset.width}×${asset.height}`;

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
      {asset.status !== "normal" && (
        <span
          className={`absolute right-2 top-2 z-10 rounded px-1.5 py-0.5 text-[10px] text-white ${
            asset.status === "violation" ? "bg-red-500" : "bg-amber-500"
          }`}
        >
          {STATUS_LABELS[asset.status]}
        </span>
      )}
      <button type="button" className="block w-full text-left" onClick={onOpen}>
        <div
          className={`flex items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 ${
            asset.partition === "video" ? "aspect-[9/16]" : "aspect-square"
          }`}
          style={{ backgroundColor: asset.previewColor }}
        >
          {asset.partition === "video" ? (
            <Video className="h-8 w-8 text-white/70" />
          ) : (
            <ImageIcon className="h-8 w-8 text-white/70" />
          )}
        </div>
        <div className="p-3">
          <p className="truncate text-sm font-medium text-gray-900">{asset.name}</p>
          <div className="mt-1.5 flex flex-wrap gap-1">
            <span className="rounded bg-brand-50 px-1.5 py-0.5 text-[10px] text-brand-700">
              {GENERATE_MODE_LABELS[asset.generateMode]}
            </span>
            <span className="rounded bg-blue-50 px-1.5 py-0.5 text-[10px] text-blue-600">
              {getChannelLabel(asset.channel)}
            </span>
            <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] text-gray-600">{sizeLabel}</span>
          </div>
          <p className="mt-1 truncate text-xs text-gray-500">{asset.productName}</p>
          <p className="mt-0.5 text-[10px] text-gray-400">{asset.createdAt}</p>
        </div>
      </button>
      <div className="flex border-t border-gray-100 px-1 py-1 opacity-0 transition-opacity group-hover:opacity-100">
        <Button variant="ghost" size="sm" className="flex-1 text-xs" onClick={onDownload}>
          <Download className="h-3 w-3" />
        </Button>
        <Button variant="ghost" size="sm" className="text-xs" onClick={onRename}>
          <Pencil className="h-3 w-3" />
        </Button>
        <Link href={`${createHref}?materialId=${asset.id}`} className="flex-1">
          <Button variant="ghost" size="sm" className="w-full text-xs">
            复用
          </Button>
        </Link>
      </div>
    </div>
  );
}
