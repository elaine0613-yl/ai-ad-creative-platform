"use client";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Select } from "@/components/ui/Select";
import type { KnowledgeEntry, KnowledgePriority, KnowledgeVisibility } from "@/lib/knowledge/catalog-types";
import {
  CHANNEL_OPTIONS,
  INDUSTRY_OPTIONS,
  KNOWLEDGE_TOP_CATEGORIES,
} from "@/lib/knowledge/catalog-types";
import { useEffect, useState } from "react";

interface KnowledgeFormModalProps {
  open: boolean;
  onClose: () => void;
  entry?: KnowledgeEntry | null;
  onSave?: (data: Partial<KnowledgeEntry>) => void;
}

export function KnowledgeFormModal({ open, onClose, entry, onSave }: KnowledgeFormModalProps) {
  const [title, setTitle] = useState("");
  const [topCategory, setTopCategory] = useState(KNOWLEDGE_TOP_CATEGORIES[0].id);
  const [channel, setChannel] = useState("all");
  const [industry, setIndustry] = useState("all");
  const [priority, setPriority] = useState<KnowledgePriority>("medium");
  const [summary, setSummary] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");
  const [visibility, setVisibility] = useState<KnowledgeVisibility>("team");
  const [status, setStatus] = useState<"active" | "disabled">("active");

  useEffect(() => {
    if (entry) {
      setTitle(entry.title);
      setTopCategory(entry.topCategory);
      setChannel(entry.channels[0] ?? "all");
      setIndustry(entry.industries[0] ?? "all");
      setPriority(entry.priority);
      setSummary(entry.summary);
      setContent(entry.content);
      setTags(entry.tags.join(", "));
      setVisibility(entry.visibility);
      setStatus(entry.status);
    } else {
      setTitle("");
      setTopCategory(KNOWLEDGE_TOP_CATEGORIES[0].id);
      setChannel("all");
      setIndustry("all");
      setPriority("medium");
      setSummary("");
      setContent("");
      setTags("");
      setVisibility("team");
      setStatus("active");
    }
  }, [entry, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave?.({
      title,
      topCategory,
      channels: [channel],
      industries: [industry],
      priority,
      summary,
      content,
      tags: tags.split(/[,，]/).map((t) => t.trim()).filter(Boolean),
      visibility,
      status,
    });
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title={entry ? "编辑知识条目" : "新增知识条目"} size="lg">
      <form onSubmit={handleSubmit} className="max-h-[70vh] space-y-4 overflow-y-auto pr-1">
        <Input label="知识标题" value={title} onChange={(e) => setTitle(e.target.value)} required />

        <Select
          label="所属一级分类"
          value={topCategory}
          onChange={(e) => setTopCategory(e.target.value as typeof topCategory)}
          options={KNOWLEDGE_TOP_CATEGORIES.map((c) => ({ value: c.id, label: c.label }))}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <Select
            label="适用投放渠道"
            value={channel}
            onChange={(e) => setChannel(e.target.value)}
            options={CHANNEL_OPTIONS}
          />
          <Select
            label="适用商品行业"
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
            options={INDUSTRY_OPTIONS}
          />
        </div>

        <Select
          label="优先级权重（高优先级 AI 优先调用）"
          value={priority}
          onChange={(e) => setPriority(e.target.value as KnowledgePriority)}
          options={[
            { value: "high", label: "高" },
            { value: "medium", label: "中" },
            { value: "low", label: "低" },
          ]}
        />

        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">精简内容摘要</label>
          <textarea
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            rows={2}
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            required
          />
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">
            知识详细正文（支持图文排版、插入素材库引用链接）
          </label>
          <textarea
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-mono focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            rows={8}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="支持 Markdown；可引用素材库 asset://mc-xxx"
            required
          />
        </div>

        <Input
          label="标签（逗号分隔）"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="合规, 抖音, Prompt"
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <Select
            label="可见范围"
            value={visibility}
            onChange={(e) => setVisibility(e.target.value as KnowledgeVisibility)}
            options={[
              { value: "private", label: "个人私有" },
              { value: "team", label: "团队共享" },
              { value: "public", label: "平台公共" },
            ]}
          />
          <Select
            label="生效状态"
            value={status}
            onChange={(e) => setStatus(e.target.value as "active" | "disabled")}
            options={[
              { value: "active", label: "启用" },
              { value: "disabled", label: "停用" },
            ]}
          />
        </div>

        <div className="flex justify-end gap-2 border-t border-gray-100 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            取消
          </Button>
          <Button type="submit">{entry ? "保存修改" : "创建知识"}</Button>
        </div>
      </form>
    </Modal>
  );
}
