"use client";

import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import type { KnowledgeEntry } from "@/lib/knowledge/catalog-types";
import {
  QUALITY_TAG_LABELS,
  STATUS_LABELS,
  getBrandLabel,
  getChannelLabel,
  getIndustryLabel,
  getSubLibraryLabel,
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
    <Modal open={open} onClose={onClose} title="知识资源详情" size="xl">
      <div className="space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="font-mono text-xs text-gray-400">{entry.knowledgeId}</p>
            <h3 className="mt-1 text-lg font-semibold text-gray-900">{entry.title}</h3>
            <div className="mt-2 flex flex-wrap gap-1.5">
              <span className="rounded-full bg-brand-50 px-2 py-0.5 text-xs text-brand-700">
                {getSubLibraryLabel(entry.partition, entry.subLibrary)}
              </span>
              {entry.channels.map((c) => (
                <span key={c} className="rounded-full bg-blue-50 px-2 py-0.5 text-xs text-blue-700">
                  {getChannelLabel(c)}
                </span>
              ))}
              <span className="rounded-full bg-purple-50 px-2 py-0.5 text-xs text-purple-700">
                {getBrandLabel(entry.brand)}
              </span>
              {entry.industries.map((i) => (
                <span key={i} className="rounded-full bg-green-50 px-2 py-0.5 text-xs text-green-700">
                  {getIndustryLabel(i)}
                </span>
              ))}
              <span
                className={`rounded-full px-2 py-0.5 text-xs ${
                  entry.status === "active"
                    ? "bg-green-50 text-green-700"
                    : entry.status === "pending"
                      ? "bg-amber-50 text-amber-700"
                      : "bg-gray-100 text-gray-500"
                }`}
              >
                {STATUS_LABELS[entry.status]}
              </span>
              {entry.qualityTags.map((q) => (
                <span key={q} className="rounded-full bg-orange-50 px-2 py-0.5 text-xs text-orange-700">
                  {QUALITY_TAG_LABELS[q]}
                </span>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <BarChart3 className="h-4 w-4" />
            AI 调用 {entry.usageCount} 次
          </div>
        </div>

        <dl className="grid grid-cols-2 gap-3 rounded-lg border border-gray-100 bg-gray-50 p-4 text-sm md:grid-cols-4">
          <div>
            <dt className="text-xs text-gray-400">分区</dt>
            <dd className="font-medium text-gray-900">{entry.partition === "video" ? "视频知识库" : "图片知识库"}</dd>
          </div>
          <div className="flex items-center gap-1.5">
            <User className="h-4 w-4 text-gray-400" />
            <div>
              <dt className="text-xs text-gray-400">维护人</dt>
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
          <div>
            <dt className="text-xs text-gray-400">版本</dt>
            <dd className="font-medium text-gray-900">v{entry.version}</dd>
          </div>
        </dl>

        <div>
          <h4 className="mb-2 text-sm font-medium text-gray-900">内容摘要</h4>
          <p className="text-sm leading-relaxed text-gray-600">{entry.summary}</p>
        </div>

        <div>
          <h4 className="mb-2 text-sm font-medium text-gray-900">详细内容</h4>
          <div className="max-h-64 overflow-y-auto whitespace-pre-wrap rounded-lg border border-gray-100 bg-white p-4 text-sm leading-relaxed text-gray-700">
            {entry.content}
          </div>
        </div>

        {entry.remark && (
          <div>
            <h4 className="mb-2 text-sm font-medium text-gray-900">备注</h4>
            <p className="text-sm text-gray-500">{entry.remark}</p>
          </div>
        )}

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
          创建于 {entry.createdAt} · 运营人工维护，非机器自动生成
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
