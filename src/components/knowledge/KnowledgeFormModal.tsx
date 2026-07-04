"use client";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Select } from "@/components/ui/Select";
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
  QUALITY_TAG_OPTIONS,
  STATUS_OPTIONS,
  getSubLibraries,
} from "@/lib/knowledge/catalog-types";
import { useEffect, useState } from "react";

interface KnowledgeFormModalProps {
  open: boolean;
  onClose: () => void;
  entry?: KnowledgeEntry | null;
  partition: KnowledgePartition;
  defaultSubLibrary?: KnowledgeSubLibrary;
  onSave?: (data: Partial<KnowledgeEntry>) => void;
}

export function KnowledgeFormModal({
  open,
  onClose,
  entry,
  partition,
  defaultSubLibrary,
  onSave,
}: KnowledgeFormModalProps) {
  const subLibraries = getSubLibraries(partition);

  const [title, setTitle] = useState("");
  const [subLibrary, setSubLibrary] = useState<KnowledgeSubLibrary>(subLibraries[0].id);
  const [channel, setChannel] = useState("all");
  const [brand, setBrand] = useState("platform");
  const [industry, setIndustry] = useState("all");
  const [summary, setSummary] = useState("");
  const [content, setContent] = useState("");
  const [remark, setRemark] = useState("");
  const [tags, setTags] = useState("");
  const [qualityTags, setQualityTags] = useState<QualityTag[]>(["newly-added"]);
  const [status, setStatus] = useState<KnowledgeStatus>("pending");

  useEffect(() => {
    if (entry) {
      setTitle(entry.title);
      setSubLibrary(entry.subLibrary);
      setChannel(entry.channels[0] ?? "all");
      setBrand(entry.brand);
      setIndustry(entry.industries[0] ?? "all");
      setSummary(entry.summary);
      setContent(entry.content);
      setRemark(entry.remark ?? "");
      setTags(entry.tags.join(", "));
      setQualityTags(entry.qualityTags);
      setStatus(entry.status);
    } else {
      setTitle("");
      setSubLibrary(defaultSubLibrary ?? subLibraries[0].id);
      setChannel("all");
      setBrand("platform");
      setIndustry("all");
      setSummary("");
      setContent("");
      setRemark("");
      setTags("");
      setQualityTags(["newly-added"]);
      setStatus("pending");
    }
  }, [entry, open, defaultSubLibrary, subLibraries]);

  const toggleQualityTag = (tag: QualityTag) => {
    setQualityTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave?.({
      title,
      subLibrary,
      channels: [channel],
      brand,
      industries: [industry],
      summary,
      content,
      remark: remark || undefined,
      tags: tags.split(/[,，]/).map((t) => t.trim()).filter(Boolean),
      qualityTags,
      status,
    });
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title={entry ? "编辑知识资源" : "新增知识资源"} size="lg">
      <form onSubmit={handleSubmit} className="max-h-[70vh] space-y-4 overflow-y-auto pr-1">
        <Input label="资源名称" value={title} onChange={(e) => setTitle(e.target.value)} required />

        <Select
          label="所属子库"
          value={subLibrary}
          onChange={(e) => setSubLibrary(e.target.value as KnowledgeSubLibrary)}
          options={subLibraries.map((c) => ({ value: c.id, label: c.label }))}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <Select
            label="所属渠道/媒体"
            value={channel}
            onChange={(e) => setChannel(e.target.value)}
            options={CHANNEL_OPTIONS}
          />
          <Select
            label="所属品牌"
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
            options={BRAND_OPTIONS.filter((b) => b.value !== "all")}
          />
        </div>

        <Select
          label="适用商品类目"
          value={industry}
          onChange={(e) => setIndustry(e.target.value)}
          options={INDUSTRY_OPTIONS}
        />

        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">内容摘要</label>
          <textarea
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            rows={2}
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            required
          />
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">详细内容（运营主观经验沉淀）</label>
          <textarea
            className="w-full rounded-lg border border-gray-300 px-3 py-2 font-mono text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            rows={8}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="支持 Markdown；沉淀规则、话术、风格规范、避坑经验等"
            required
          />
        </div>

        <Input
          label="备注"
          value={remark}
          onChange={(e) => setRemark(e.target.value)}
          placeholder="迭代说明、实测效果备注等"
        />

        <Input
          label="标签（逗号分隔）"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="合规, 抖音, 促销"
        />

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">优质标签</label>
          <div className="flex flex-wrap gap-2">
            {QUALITY_TAG_OPTIONS.filter((q) => q.value !== "all").map((q) => (
              <button
                key={q.value}
                type="button"
                onClick={() => toggleQualityTag(q.value as QualityTag)}
                className={`rounded-full px-3 py-1 text-xs transition-colors ${
                  qualityTags.includes(q.value as QualityTag)
                    ? "bg-brand-100 text-brand-700 ring-1 ring-brand-300"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {q.label}
              </button>
            ))}
          </div>
        </div>

        <Select
          label="资源状态"
          value={status}
          onChange={(e) => setStatus(e.target.value as KnowledgeStatus)}
          options={STATUS_OPTIONS.filter((s) => s.value !== "all")}
        />

        <div className="flex justify-end gap-2 border-t border-gray-100 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            取消
          </Button>
          <Button type="submit">{entry ? "保存修改" : "创建资源"}</Button>
        </div>
      </form>
    </Modal>
  );
}
