"use client";

import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Input } from "@/components/ui/Input";
import { PageHeader } from "@/components/layout/PageHeader";
import { FilterField, FilterSelect } from "@/components/common/FilterSelect";
import { KnowledgeDetailModal } from "@/components/knowledge/KnowledgeDetailModal";
import { KnowledgeFormModal } from "@/components/knowledge/KnowledgeFormModal";
import { Tabs } from "@/components/ui/Tabs";
import type {
  KnowledgeEntry,
  KnowledgePartition,
  KnowledgeStatus,
  KnowledgeSubLibrary,
  QualityTag,
} from "@/lib/knowledge/catalog-types";
import {
  BRAND_OPTIONS,
  CHANNEL_OPTIONS,
  INDUSTRY_OPTIONS,
  QUALITY_TAG_LABELS,
  QUALITY_TAG_OPTIONS,
  STATUS_LABELS,
  STATUS_OPTIONS,
  getBrandLabel,
  getChannelLabel,
  getIndustryLabel,
  getSubLibraries,
  getSubLibraryLabel,
} from "@/lib/knowledge/catalog-types";
import { KNOWLEDGE_ENTRIES, countByPartition, queryKnowledgeEntries } from "@/lib/knowledge/catalog-mock";
import {
  BarChart3,
  BookOpen,
  Eye,
  Pause,
  Pencil,
  Play,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

export function KnowledgeLibraryPage() {
  const searchParams = useSearchParams();
  const initialPartition = searchParams.get("type") === "video" ? "video" : "image";

  const [partition, setPartition] = useState<KnowledgePartition>(initialPartition);
  const [search, setSearch] = useState("");
  const [knowledgeId, setKnowledgeId] = useState("");
  const [subLibrary, setSubLibrary] = useState<KnowledgeSubLibrary | "all">("all");
  const [channel, setChannel] = useState("all");
  const [brand, setBrand] = useState("all");
  const [industry, setIndustry] = useState("all");
  const [status, setStatus] = useState<KnowledgeStatus | "all">("all");
  const [qualityTag, setQualityTag] = useState<QualityTag | "all">("all");
  const [datePreset, setDatePreset] = useState<"all" | "7d" | "30d">("all");
  const [selected, setSelected] = useState<string[]>([]);
  const [detailEntry, setDetailEntry] = useState<KnowledgeEntry | null>(null);
  const [formEntry, setFormEntry] = useState<KnowledgeEntry | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [entries, setEntries] = useState(KNOWLEDGE_ENTRIES);

  useEffect(() => {
    setPartition(searchParams.get("type") === "video" ? "video" : "image");
  }, [searchParams]);

  const subLibraries = useMemo(() => getSubLibraries(partition), [partition]);

  const filtered = useMemo(() => {
    const ids = new Set(entries.map((e) => e.id));
    const base = queryKnowledgeEntries({
      partition,
      search,
      knowledgeId,
      subLibrary,
      channel,
      brand,
      industry,
      status,
      qualityTag,
      datePreset,
    });
    return base.filter((e) => ids.has(e.id));
  }, [entries, partition, search, knowledgeId, subLibrary, channel, brand, industry, status, qualityTag, datePreset]);

  const toggleSelect = (id: string) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  };

  const toggleStatus = (id: string) => {
    setEntries((prev) =>
      prev.map((e) =>
        e.id === id
          ? {
              ...e,
              status: e.status === "active" ? "disabled" : "active",
              updatedAt: new Date().toISOString().slice(0, 16).replace("T", " "),
            }
          : e
      )
    );
  };

  const openCreate = () => {
    setFormEntry(null);
    setFormOpen(true);
  };

  const openEdit = (entry: KnowledgeEntry) => {
    setFormEntry(entry);
    setFormOpen(true);
    setDetailEntry(null);
  };

  const handleSave = (data: Partial<KnowledgeEntry>) => {
    if (formEntry) {
      setEntries((prev) =>
        prev.map((e) =>
          e.id === formEntry.id
            ? {
                ...e,
                ...data,
                updatedAt: new Date().toISOString().slice(0, 16).replace("T", " "),
                version: e.version + 1,
              }
            : e
        )
      );
    } else {
      const prefix = partition === "video" ? "KN-V" : "KN-I";
      const count = entries.filter((e) => e.partition === partition).length + 1;
      const newEntry: KnowledgeEntry = {
        id: `kn-new-${Date.now()}`,
        knowledgeId: data.knowledgeId ?? `${prefix}-${String(count).padStart(3, "0")}`,
        partition,
        subLibrary: data.subLibrary ?? subLibraries[0].id,
        title: data.title ?? "未命名",
        channels: data.channels ?? ["all"],
        brand: data.brand ?? "platform",
        industries: data.industries ?? ["all"],
        qualityTags: data.qualityTags ?? ["newly-added"],
        summary: data.summary ?? "",
        content: data.content ?? "",
        remark: data.remark,
        tags: data.tags ?? [],
        status: data.status ?? "pending",
        createdBy: "当前用户",
        createdAt: new Date().toISOString().slice(0, 16).replace("T", " "),
        updatedAt: new Date().toISOString().slice(0, 16).replace("T", " "),
        usageCount: 0,
        version: 1,
      };
      setEntries((prev) => [newEntry, ...prev]);
    }
  };

  const handlePartitionChange = (id: string) => {
    setPartition(id as KnowledgePartition);
    setSubLibrary("all");
    setSelected([]);
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PageHeader
        title="知识库"
        hideGlobalSearch
        toolbar={
          <Tabs
            tabs={[
              {
                id: "image",
                label: "图片知识库",
                badge: String(countByPartition("image")),
              },
              {
                id: "video",
                label: "视频知识库",
                badge: String(countByPartition("video")),
              },
            ]}
            activeTab={partition}
            onChange={handlePartitionChange}
          />
        }
      />

      {/* 通用筛选栏 */}
      <div className="shrink-0 border-b border-gray-200 bg-white px-6 py-3">
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-end">
            <FilterField label="关键词" className="min-w-0 flex-1 xl:max-w-xs">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="名称、备注、场景、风格…"
                  className="pl-9"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </FilterField>
            <FilterField label="知识库 ID" className="xl:w-36">
              <Input
                placeholder="输入 ID"
                value={knowledgeId}
                onChange={(e) => setKnowledgeId(e.target.value)}
              />
            </FilterField>
            <FilterSelect
              label="子库"
              value={subLibrary}
              onChange={(v) => setSubLibrary(v as KnowledgeSubLibrary | "all")}
              options={[
                { value: "all", label: "" },
                ...subLibraries.map((c) => ({ value: c.id, label: c.label })),
              ]}
            />
            <FilterSelect
              label="渠道"
              value={channel}
              onChange={setChannel}
              options={CHANNEL_OPTIONS.map((c) => ({ value: c.value, label: c.label }))}
            />
            <FilterSelect
              label="品牌"
              value={brand}
              onChange={setBrand}
              options={BRAND_OPTIONS.map((b) => ({ value: b.value, label: b.label }))}
            />
            <FilterSelect
              label="类目"
              value={industry}
              onChange={setIndustry}
              options={INDUSTRY_OPTIONS.map((i) => ({ value: i.value, label: i.label }))}
            />
          </div>
          <div className="flex flex-wrap items-end gap-2">
            <FilterSelect
              label="状态"
              value={status}
              onChange={(v) => setStatus(v as KnowledgeStatus | "all")}
              options={STATUS_OPTIONS.map((s) => ({ value: s.value, label: s.label }))}
            />
            <FilterSelect
              label="优质标签"
              value={qualityTag}
              onChange={(v) => setQualityTag(v as QualityTag | "all")}
              options={QUALITY_TAG_OPTIONS.map((q) => ({ value: q.value, label: q.label }))}
            />
            <FilterSelect
              label="更新时间"
              value={datePreset}
              onChange={(v) => setDatePreset(v as typeof datePreset)}
              options={[
                { value: "all", label: "" },
                { value: "7d", label: "近 7 天" },
                { value: "30d", label: "近 30 天" },
              ]}
            />
            <span className="pb-2 text-xs text-gray-400">共 {filtered.length} 条</span>
          </div>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 overflow-hidden">
        {/* 子库侧栏 */}
        <aside className="hidden w-56 shrink-0 overflow-y-auto border-r border-gray-200 bg-gray-50/50 p-4 lg:block">
          <button
            type="button"
            onClick={() => setSubLibrary("all")}
            className={`mb-3 w-full rounded-lg px-3 py-2 text-left text-sm font-medium ${
              subLibrary === "all" ? "bg-brand-50 text-brand-700" : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            全部资源
          </button>
          {subLibraries.map((group) => (
            <button
              key={group.id}
              type="button"
              onClick={() => setSubLibrary(group.id)}
              className={`mb-2 w-full rounded-lg px-3 py-2 text-left transition-colors ${
                subLibrary === group.id ? "bg-brand-50 text-brand-700" : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <span className="block text-sm font-medium">{group.label}</span>
              <span className="mt-0.5 block text-[10px] leading-snug text-gray-400">{group.description}</span>
            </button>
          ))}
        </aside>

        {/* 列表区 */}
        <div className="min-h-0 flex-1 overflow-y-auto p-6 pb-28">
          {filtered.length === 0 ? (
            <EmptyState
              icon={<BookOpen className="h-12 w-12" />}
              title="暂无匹配的知识资源"
              description="调整筛选条件，或使用底部「新增资源」沉淀运营经验"
            />
          ) : (
            <div className="space-y-3">
              {filtered.map((entry) => (
                <article
                  key={entry.id}
                  className={`rounded-xl border bg-white p-4 transition-shadow hover:shadow-sm ${
                    selected.includes(entry.id) ? "border-brand-400 ring-1 ring-brand-400" : "border-gray-200"
                  }`}
                >
                  <div className="flex gap-3">
                    <input
                      type="checkbox"
                      className="mt-1"
                      checked={selected.includes(entry.id)}
                      onChange={() => toggleSelect(entry.id)}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-mono text-xs text-gray-400">{entry.knowledgeId}</span>
                            <h3 className="font-medium text-gray-900">{entry.title}</h3>
                          </div>
                          <div className="mt-1.5 flex flex-wrap gap-1.5">
                            <span className="rounded-full bg-brand-50 px-2 py-0.5 text-xs text-brand-700">
                              {getSubLibraryLabel(entry.partition, entry.subLibrary)}
                            </span>
                            {entry.channels.slice(0, 2).map((c) => (
                              <span key={c} className="rounded-full bg-blue-50 px-2 py-0.5 text-xs text-blue-600">
                                {getChannelLabel(c)}
                              </span>
                            ))}
                            <span className="rounded-full bg-purple-50 px-2 py-0.5 text-xs text-purple-600">
                              {getBrandLabel(entry.brand)}
                            </span>
                            {entry.industries.slice(0, 1).map((i) => (
                              <span key={i} className="rounded-full bg-green-50 px-2 py-0.5 text-xs text-green-600">
                                {getIndustryLabel(i)}
                              </span>
                            ))}
                            <span
                              className={`rounded-full px-2 py-0.5 text-xs ${
                                entry.status === "active"
                                  ? "bg-green-50 text-green-600"
                                  : entry.status === "pending"
                                    ? "bg-amber-50 text-amber-600"
                                    : entry.status === "expired"
                                      ? "bg-gray-100 text-gray-400"
                                      : "bg-gray-100 text-gray-500"
                              }`}
                            >
                              {STATUS_LABELS[entry.status]}
                            </span>
                            {entry.qualityTags.map((q) => (
                              <span key={q} className="rounded-full bg-orange-50 px-2 py-0.5 text-xs text-orange-600">
                                {QUALITY_TAG_LABELS[q]}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-gray-400">
                          <BarChart3 className="h-3.5 w-3.5" />
                          AI 调用 {entry.usageCount} 次 · v{entry.version}
                        </div>
                      </div>
                      <p className="mt-2 line-clamp-2 text-sm text-gray-600">{entry.summary}</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <Button variant="outline" size="sm" onClick={() => setDetailEntry(entry)}>
                          <Eye className="h-3.5 w-3.5" />
                          查看详情
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => openEdit(entry)}>
                          <Pencil className="h-3.5 w-3.5" />
                          编辑
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => toggleStatus(entry.id)}>
                          {entry.status === "active" ? (
                            <>
                              <Pause className="h-3.5 w-3.5" /> 停用
                            </>
                          ) : (
                            <>
                              <Play className="h-3.5 w-3.5" /> 启用
                            </>
                          )}
                        </Button>
                        <Button variant="ghost" size="sm" className="text-red-500">
                          <Trash2 className="h-3.5 w-3.5" />
                          删除
                        </Button>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 底部操作栏 */}
      <div className="fixed bottom-0 left-0 right-0 z-20 border-t border-gray-200 bg-white/95 px-6 py-3 backdrop-blur lg:left-60">
        <div className="mx-auto flex max-w-screen-2xl flex-wrap items-center gap-2">
          {selected.length > 0 && <span className="mr-2 text-sm text-gray-500">已选 {selected.length} 条</span>}
          <Button size="sm" onClick={openCreate}>
            <Plus className="h-3.5 w-3.5" />
            新增资源
          </Button>
          <Button variant="outline" size="sm" disabled={selected.length === 0}>
            <Play className="h-3.5 w-3.5" />
            批量启用
          </Button>
          <Button variant="outline" size="sm" disabled={selected.length === 0}>
            <Pause className="h-3.5 w-3.5" />
            批量停用
          </Button>
          <Button variant="outline" size="sm" disabled={selected.length === 0}>
            批量移动子库
          </Button>
          <Button variant="danger" size="sm" disabled={selected.length === 0}>
            <Trash2 className="h-3.5 w-3.5" />
            批量删除
          </Button>
        </div>
      </div>

      <KnowledgeDetailModal
        entry={detailEntry}
        open={!!detailEntry}
        onClose={() => setDetailEntry(null)}
        onEdit={openEdit}
      />
      <KnowledgeFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        entry={formEntry}
        partition={partition}
        defaultSubLibrary={subLibrary !== "all" ? subLibrary : undefined}
        onSave={handleSave}
      />
    </div>
  );
}
