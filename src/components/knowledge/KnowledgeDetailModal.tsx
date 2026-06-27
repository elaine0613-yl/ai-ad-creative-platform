"use client";

import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import type { KnowledgeEntry } from "@/lib/knowledge/catalog-types";
import {
  getChannelLabel,
  getIndustryLabel,
  getKnowledgeCategoryLabel,
  PRIORITY_LABELS,
  VISIBILITY_LABELS,
} from "@/lib/knowledge/catalog-types";
import { BarChart3, Clock, GitBranch, User } from "lucide-react";

interface KnowledgeDetailModalProps {
  entry: KnowledgeEntry | null;
  open: boolean;
  onClose: () => void;
  onEdit?: (entry: KnowledgeEntry) => void;
}

export function KnowledgeDetailModal({ entry, open, onClose, onEdit }: KnowledgeDetailModalProps) {
  if (!entry) return null;

  return (
    <Modal open={open} onClose={onClose} title="知识详情" size="xl">
      <div className="space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{entry.title}</h3>
            <div className="mt-2 flex flex-wrap gap-1.5">
              <span className="rounded-full bg-brand-50 px-2 py-0.5 text-xs text-brand-700">
                {getKnowledgeCategoryLabel(entry.topCategory)}
              </span>
              {entry.channels.map((c) => (
                <span key={c} className="rounded-full bg-blue-50 px-2 py-0.5 text-xs text-blue-700">
                  {getChannelLabel(c)}
                </span>
              ))}
              {entry.industries.map((i) => (
                <span key={i} className="rounded-full bg-green-50 px-2 py-0.5 text-xs text-green-700">
                  {getIndustryLabel(i)}
                </span>
              ))}
              <span
                className={`rounded-full px-2 py-0.5 text-xs ${
                  entry.status === "active" ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"
                }`}
              >
                {entry.status === "active" ? "启用中" : "已停用"}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <BarChart3 className="h-4 w-4" />
            累计调用 {entry.usageCount} 次
          </div>
        </div>

        <dl className="grid grid-cols-2 gap-3 rounded-lg border border-gray-100 bg-gray-50 p-4 text-sm md:grid-cols-4">
          <div>
            <dt className="text-xs text-gray-400">优先级</dt>
            <dd className="font-medium text-gray-900">{PRIORITY_LABELS[entry.priority]}</dd>
          </div>
          <div>
            <dt className="text-xs text-gray-400">可见范围</dt>
            <dd className="font-medium text-gray-900">{VISIBILITY_LABELS[entry.visibility]}</dd>
          </div>
          <div className="flex items-center gap-1.5">
            <User className="h-4 w-4 text-gray-400" />
            <div>
              <dt className="text-xs text-gray-400">创建人</dt>
              <dd className="font-medium text-gray-900">{entry.createdBy}</dd>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="h-4 w-4 text-gray-400" />
            <div>
              <dt className="text-xs text-gray-400">更新时间</dt>
              <dd className="font-medium text-gray-900">{entry.updatedAt}</dd>
            </div>
          </div>
        </dl>

        <div>
          <h4 className="mb-2 text-sm font-medium text-gray-900">内容摘要</h4>
          <p className="text-sm leading-relaxed text-gray-600">{entry.summary}</p>
        </div>

        <div>
          <h4 className="mb-2 text-sm font-medium text-gray-900">详细正文</h4>
          <div className="max-h-64 overflow-y-auto rounded-lg border border-gray-100 bg-white p-4 text-sm leading-relaxed text-gray-700 whitespace-pre-wrap">
            {entry.content}
          </div>
        </div>

        {entry.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {entry.tags.map((t) => (
              <span key={t} className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                #{t}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center gap-2 border-t border-gray-100 pt-4 text-xs text-gray-400">
          <GitBranch className="h-3.5 w-3.5" />
          当前版本 v{entry.version} · 创建于 {entry.createdAt}
        </div>

        <div className="flex flex-wrap gap-2">
          <Button size="sm" onClick={() => onEdit?.(entry)}>
            编辑修改
          </Button>
          <Button variant="outline" size="sm">
            {entry.status === "active" ? "停用" : "启用"}
          </Button>
          <Button variant="danger" size="sm">
            删除
          </Button>
        </div>
      </div>
    </Modal>
  );
}
