"use client";

import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Input } from "@/components/ui/Input";
import { PageHeader } from "@/components/layout/PageHeader";
import { KnowledgeDetailModal } from "@/components/knowledge/KnowledgeDetailModal";
import { KnowledgeFormModal } from "@/components/knowledge/KnowledgeFormModal";
import type { KnowledgeEntry, KnowledgeTopCategory } from "@/lib/knowledge/catalog-types";
import {
  CHANNEL_OPTIONS,
  getChannelLabel,
  getIndustryLabel,
  getKnowledgeCategoryLabel,
  INDUSTRY_OPTIONS,
  KNOWLEDGE_TOP_CATEGORIES,
  VISIBILITY_LABELS,
} from "@/lib/knowledge/catalog-types";
import { KNOWLEDGE_ENTRIES } from "@/lib/knowledge/catalog-mock";
import {
  BarChart3,
  BookOpen,
  Eye,
  GitBranch,
  Pause,
  Pencil,
  Play,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { useMemo, useState } from "react";

export function KnowledgeLibraryPage() {
  const [search, setSearch] = useState("");
  const [topCategory, setTopCategory] = useState<KnowledgeTopCategory | "all">("all");
  const [channel, setChannel] = useState("all");
  const [industry, setIndustry] = useState("all");
  const [status, setStatus] = useState<"active" | "disabled" | "all">("all");
  const [visibility, setVisibility] = useState<"all" | "mine" | "private" | "team" | "public">("all");
  const [selected, setSelected] = useState<string[]>([]);
  const [detailEntry, setDetailEntry] = useState<KnowledgeEntry | null>(null);
  const [formEntry, setFormEntry] = useState<KnowledgeEntry | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [entries, setEntries] = useState(KNOWLEDGE_ENTRIES);

  const filtered = useMemo(() => {
    return entries.filter((e) => {
      if (topCategory !== "all" && e.topCategory !== topCategory) return false;
      if (channel !== "all" && !e.channels.includes(channel) && !e.channels.includes("all")) return false;
      if (industry !== "all" && !e.industries.includes(industry) && !e.industries.includes("all")) return false;
      if (status !== "all" && e.status !== status) return false;
      if (visibility === "mine" && e.createdBy !== "当前用户") return false;
      if (visibility !== "all" && visibility !== "mine" && e.visibility !== visibility) return false;
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        const hay = [e.title, e.summary, ...e.tags].join(" ").toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [search, topCategory, channel, industry, status, visibility, entries]);

  const toggleSelect = (id: string) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
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
            ? { ...e, ...data, updatedAt: new Date().toISOString().slice(0, 16).replace("T", " "), version: e.version + 1 }
            : e
        )
      );
    } else {
      const newEntry: KnowledgeEntry = {
        id: `kn-new-${Date.now()}`,
        title: data.title ?? "未命名",
        topCategory: data.topCategory ?? "brand-vi",
        channels: data.channels ?? ["all"],
        industries: data.industries ?? ["all"],
        priority: data.priority ?? "medium",
        summary: data.summary ?? "",
        content: data.content ?? "",
        tags: data.tags ?? [],
        visibility: data.visibility ?? "team",
        status: data.status ?? "active",
        createdBy: "当前用户",
        createdAt: new Date().toISOString().slice(0, 16).replace("T", " "),
        updatedAt: new Date().toISOString().slice(0, 16).replace("T", " "),
        usageCount: 0,
        version: 1,
      };
      setEntries((prev) => [newEntry, ...prev]);
    }
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PageHeader
        title="知识库"
        description="品牌规范、Prompt、渠道规则与运营策略沉淀；五步创作流程后台自动调用，亦支持手动引用"
        hideGlobalSearch
      />

      {/* 检索筛选控制区 */}
      <div className="shrink-0 border-b border-gray-200 bg-white px-6 py-3">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-end">
          <div className="relative min-w-0 flex-1 xl:max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="检索标题、内容、类目、渠道、规则关键词..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
            value={topCategory}
            onChange={(e) => setTopCategory(e.target.value as KnowledgeTopCategory | "all")}
          >
            <option value="all">全部分类</option>
            {KNOWLEDGE_TOP_CATEGORIES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
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
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
          >
            {INDUSTRY_OPTIONS.map((i) => (
              <option key={i.value} value={i.value}>
                {i.label}
              </option>
            ))}
          </select>
          <select
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
            value={status}
            onChange={(e) => setStatus(e.target.value as typeof status)}
          >
            <option value="all">全部状态</option>
            <option value="active">启用中</option>
            <option value="disabled">已停用</option>
          </select>
          <select
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
            value={visibility}
            onChange={(e) => setVisibility(e.target.value as typeof visibility)}
          >
            <option value="all">全部可见范围</option>
            <option value="mine">个人创建</option>
            <option value="team">团队共享</option>
            <option value="public">平台公共</option>
          </select>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 overflow-hidden">
        {/* 分类侧栏 */}
        <aside className="hidden w-56 shrink-0 overflow-y-auto border-r border-gray-200 bg-gray-50/50 p-4 lg:block">
          <button
            type="button"
            onClick={() => setTopCategory("all")}
            className={`mb-3 w-full rounded-lg px-3 py-2 text-left text-sm font-medium ${
              topCategory === "all" ? "bg-brand-50 text-brand-700" : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            全部知识
          </button>
          {KNOWLEDGE_TOP_CATEGORIES.map((group) => (
            <div key={group.id} className="mb-4">
              <button
                type="button"
                onClick={() => setTopCategory(group.id)}
                className={`mb-1 w-full rounded-lg px-2 py-1.5 text-left text-sm font-semibold ${
                  topCategory === group.id ? "text-brand-700" : "text-gray-800 hover:text-brand-600"
                }`}
              >
                {group.label}
              </button>
              <p className="mb-1 px-2 text-[10px] leading-snug text-gray-400">{group.description}</p>
              {group.subTopics.map((sub) => (
                <p key={sub.id} className="px-3 py-0.5 text-xs text-gray-500">
                  · {sub.label}
                </p>
              ))}
            </div>
          ))}
        </aside>

        {/* 知识条目列表 */}
        <div className="min-h-0 flex-1 overflow-y-auto p-6 pb-28">
          {filtered.length === 0 ? (
            <EmptyState
              icon={<BookOpen className="h-12 w-12" />}
              title="暂无匹配的知识条目"
              description="调整筛选条件，或使用底部「新增知识条目」沉淀业务经验"
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
                          <h3 className="font-medium text-gray-900">{entry.title}</h3>
                          <div className="mt-1.5 flex flex-wrap gap-1.5">
                            <span className="rounded-full bg-brand-50 px-2 py-0.5 text-xs text-brand-700">
                              {getKnowledgeCategoryLabel(entry.topCategory)}
                            </span>
                            {entry.channels.slice(0, 2).map((c) => (
                              <span key={c} className="rounded-full bg-blue-50 px-2 py-0.5 text-xs text-blue-600">
                                {getChannelLabel(c)}
                              </span>
                            ))}
                            {entry.industries.slice(0, 2).map((i) => (
                              <span key={i} className="rounded-full bg-green-50 px-2 py-0.5 text-xs text-green-600">
                                {getIndustryLabel(i)}
                              </span>
                            ))}
                            <span
                              className={`rounded-full px-2 py-0.5 text-xs ${
                                entry.status === "active" ? "bg-green-50 text-green-600" : "bg-gray-100 text-gray-500"
                              }`}
                            >
                              {entry.status === "active" ? "启用" : "停用"}
                            </span>
                            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
                              {VISIBILITY_LABELS[entry.visibility]}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-gray-400">
                          <BarChart3 className="h-3.5 w-3.5" />
                          调用 {entry.usageCount} 次 · v{entry.version}
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
                        <Button variant="ghost" size="sm">
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

      {/* 底部基础操作栏 */}
      <div className="fixed bottom-0 left-0 right-0 z-20 border-t border-gray-200 bg-white/95 px-6 py-3 backdrop-blur lg:left-60">
        <div className="mx-auto flex max-w-screen-2xl flex-wrap items-center gap-2">
          {selected.length > 0 && (
            <span className="mr-2 text-sm text-gray-500">已选 {selected.length} 条</span>
          )}
          <Button size="sm" onClick={openCreate}>
            <Plus className="h-3.5 w-3.5" />
            新增知识条目
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
            批量移动分类
          </Button>
          <Button variant="danger" size="sm" disabled={selected.length === 0}>
            <Trash2 className="h-3.5 w-3.5" />
            批量删除
          </Button>
          <div className="flex-1" />
          <Button variant="ghost" size="sm">
            <GitBranch className="h-3.5 w-3.5" />
            知识版本总览
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
        onSave={handleSave}
      />
    </div>
  );
}
