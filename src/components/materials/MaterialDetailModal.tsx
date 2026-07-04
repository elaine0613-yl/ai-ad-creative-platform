"use client";

import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import type { ArchiveMaterial } from "@/lib/material-library/catalog-types";
import {
  GENERATE_MODE_LABELS,
  IMAGE_SCENE_LABELS,
  IMAGE_STYLE_LABELS,
  STATUS_LABELS,
  VIDEO_PACE_LABELS,
  VIDEO_TYPE_LABELS,
  getBrandLabel,
  getChannelLabel,
  getIndustryLabel,
} from "@/lib/material-library/catalog-types";
import { Clock, Download, ExternalLink, Image as ImageIcon, Pencil, Video } from "lucide-react";
import Link from "next/link";

interface MaterialDetailModalProps {
  asset: ArchiveMaterial | null;
  open: boolean;
  onClose: () => void;
  onRename?: (asset: ArchiveMaterial) => void;
  onDownload?: (asset: ArchiveMaterial, includeTrace: boolean) => void;
  includeTraceOnExport?: boolean;
}

export function MaterialDetailModal({
  asset,
  open,
  onClose,
  onRename,
  onDownload,
  includeTraceOnExport = false,
}: MaterialDetailModalProps) {
  if (!asset) return null;

  const createHref = asset.partition === "video" ? "/video/create" : "/image/create";

  return (
    <Modal open={open} onClose={onClose} title="素材详情" size="xl">
      <div className="max-h-[75vh] space-y-5 overflow-y-auto pr-1">
        <div className="grid gap-6 lg:grid-cols-2">
          {/* 成品预览 */}
          <div className="space-y-2">
            <div
              className={`flex items-center justify-center rounded-xl bg-gradient-to-b from-gray-50 to-gray-100 ${
                asset.partition === "video" ? "aspect-[9/16] max-h-[420px]" : "aspect-square"
              }`}
              style={{ backgroundColor: asset.previewColor }}
            >
              {asset.partition === "video" ? (
                <div className="text-center text-white drop-shadow">
                  <Video className="mx-auto h-12 w-12 opacity-80" />
                  <p className="mt-2 text-sm font-medium">{asset.durationSec}s 视频预览</p>
                </div>
              ) : (
                <ImageIcon className="h-12 w-12 text-white/70" />
              )}
            </div>
            <p className="text-center text-xs text-gray-500">
              {asset.fileFormat ?? (asset.partition === "video" ? "MP4" : "PNG")} · {asset.fileSize ?? "—"}
              {asset.width && asset.height && ` · ${asset.width}×${asset.height}`}
            </p>
          </div>

          {/* 基础溯源 */}
          <div className="space-y-4">
            <div>
              <p className="font-mono text-xs text-gray-400">{asset.materialId}</p>
              <h3 className="mt-1 text-lg font-semibold text-gray-900">{asset.name}</h3>
              <div className="mt-2 flex flex-wrap gap-1.5">
                <span className="rounded-full bg-brand-50 px-2 py-0.5 text-xs text-brand-700">
                  {GENERATE_MODE_LABELS[asset.generateMode]}
                </span>
                <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs text-blue-700">
                  {getChannelLabel(asset.channel)}
                </span>
                <span className="rounded-full bg-purple-50 px-2 py-0.5 text-xs text-purple-700">
                  {getBrandLabel(asset.brand)}
                </span>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs ${
                    asset.status === "normal" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
                  }`}
                >
                  {STATUS_LABELS[asset.status]}
                </span>
                {asset.aiTags.map((t) => (
                  <span key={t} className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                    {t}
                  </span>
                ))}
              </div>
            </div>

            <dl className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <dt className="text-xs text-gray-400">关联任务</dt>
                <dd>
                  <Link href={`/tasks/${asset.taskId}`} className="font-medium text-brand-600 hover:underline">
                    {asset.taskId}
                  </Link>
                </dd>
              </div>
              <div>
                <dt className="text-xs text-gray-400">任务名称</dt>
                <dd className="text-gray-800">{asset.taskName}</dd>
              </div>
              <div>
                <dt className="text-xs text-gray-400">生成时间</dt>
                <dd className="flex items-center gap-1 text-gray-800">
                  <Clock className="h-3.5 w-3.5 text-gray-400" />
                  {asset.createdAt}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-gray-400">商品类目</dt>
                <dd className="text-gray-800">{getIndustryLabel(asset.industry)}</dd>
              </div>
              <div className="col-span-2">
                <dt className="text-xs text-gray-400">关联商品</dt>
                <dd className="text-gray-800">{asset.productName}</dd>
              </div>
              {asset.sellingPoints && (
                <div className="col-span-2">
                  <dt className="text-xs text-gray-400">核心卖点</dt>
                  <dd className="text-gray-800">{asset.sellingPoints}</dd>
                </div>
              )}
            </dl>
          </div>
        </div>

        {/* 分区专属参数 */}
        <section className="rounded-lg border border-gray-100 bg-gray-50 p-4">
          <h4 className="text-sm font-medium text-gray-900">
            {asset.partition === "video" ? "视频参数" : "图片参数"}
          </h4>
          <dl className="mt-2 grid grid-cols-2 gap-2 text-sm md:grid-cols-4">
            {asset.partition === "image" ? (
              <>
                <div>
                  <dt className="text-xs text-gray-400">画布尺寸</dt>
                  <dd>{asset.aspectRatio}</dd>
                </div>
                <div>
                  <dt className="text-xs text-gray-400">视觉风格</dt>
                  <dd>{asset.visualStyle ? IMAGE_STYLE_LABELS[asset.visualStyle] : "—"}</dd>
                </div>
                <div>
                  <dt className="text-xs text-gray-400">画面类型</dt>
                  <dd>{asset.sceneType ? IMAGE_SCENE_LABELS[asset.sceneType] : "—"}</dd>
                </div>
              </>
            ) : (
              <>
                <div>
                  <dt className="text-xs text-gray-400">视频时长</dt>
                  <dd>{asset.durationTier ?? `${asset.durationSec}s`}</dd>
                </div>
                <div>
                  <dt className="text-xs text-gray-400">视频节奏</dt>
                  <dd>{asset.pace ? VIDEO_PACE_LABELS[asset.pace] : "—"}</dd>
                </div>
                <div>
                  <dt className="text-xs text-gray-400">字幕配置</dt>
                  <dd>{asset.hasSubtitle ? "带字幕" : "无字幕"}</dd>
                </div>
                <div>
                  <dt className="text-xs text-gray-400">视频类型</dt>
                  <dd>{asset.videoType ? VIDEO_TYPE_LABELS[asset.videoType] : "—"}</dd>
                </div>
              </>
            )}
          </dl>
        </section>

        {/* 创意参数溯源 */}
        <section className="rounded-lg border border-gray-100 p-4">
          <h4 className="text-sm font-medium text-gray-900">生成创意参数溯源</h4>
          <div className="mt-3 grid gap-4 md:grid-cols-2">
            <div>
              <p className="mb-1 text-xs font-medium text-gray-500">需求配置</p>
              <ul className="space-y-1 text-sm text-gray-700">
                {Object.entries(asset.creativeTrace.requirement).map(([k, v]) => (
                  <li key={k}>
                    <span className="text-gray-400">{k}：</span>
                    {v}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="mb-1 text-xs font-medium text-gray-500">创意方案</p>
              <ul className="space-y-1 text-sm text-gray-700">
                {Object.entries(asset.creativeTrace.creative).map(([k, v]) => (
                  <li key={k}>
                    <span className="text-gray-400">{k}：</span>
                    {v}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          {asset.creativeTrace.knowledgeRefs.length > 0 && (
            <div className="mt-3">
              <p className="mb-1 text-xs font-medium text-gray-500">知识库调用记录</p>
              <ul className="space-y-1 text-sm text-brand-700">
                {asset.creativeTrace.knowledgeRefs.map((ref) => (
                  <li key={ref}>· {ref}</li>
                ))}
              </ul>
            </div>
          )}
        </section>

        {/* 合规审核 */}
        <section className="rounded-lg border border-gray-100 p-4">
          <h4 className="text-sm font-medium text-gray-900">合规审核信息</h4>
          <dl className="mt-2 grid grid-cols-2 gap-2 text-sm">
            <div>
              <dt className="text-xs text-gray-400">审核状态</dt>
              <dd className={asset.audit.status === "passed" ? "text-green-700" : "text-red-700"}>
                {asset.audit.status === "passed" ? "审核通过" : "审核未通过"}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-gray-400">审核时间</dt>
              <dd>{asset.audit.auditedAt}</dd>
            </div>
            {asset.audit.reason && (
              <div className="col-span-2">
                <dt className="text-xs text-gray-400">备注/违规原因</dt>
                <dd className="text-red-600">{asset.audit.reason}</dd>
              </div>
            )}
          </dl>
        </section>

        {/* 操作记录 */}
        {(asset.operationRecords.length > 0 || asset.exportRecords.length > 0) && (
          <section className="rounded-lg border border-gray-100 p-4">
            <h4 className="text-sm font-medium text-gray-900">操作记录</h4>
            <ul className="mt-2 max-h-32 space-y-1 overflow-y-auto text-sm text-gray-600">
              {[...asset.operationRecords, ...asset.exportRecords].map((r, i) => (
                <li key={i} className="flex justify-between gap-2">
                  <span>
                    {r.action} · {r.operator}
                  </span>
                  <span className="shrink-0 text-xs text-gray-400">{r.at}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        <div className="flex flex-wrap gap-2 border-t border-gray-100 pt-4">
          <Button size="sm" onClick={() => onDownload?.(asset, includeTraceOnExport)}>
            <Download className="h-3.5 w-3.5" />
            下载{asset.partition === "video" ? "视频" : "原图"}
          </Button>
          <Link href={`${createHref}?materialId=${asset.id}`}>
            <Button variant="outline" size="sm">
              <ExternalLink className="h-3.5 w-3.5" />
              二次创作
            </Button>
          </Link>
          <Link href={`/tasks/${asset.taskId}`}>
            <Button variant="outline" size="sm">
              查看任务
            </Button>
          </Link>
          <Button variant="outline" size="sm" onClick={() => onRename?.(asset)}>
            <Pencil className="h-3.5 w-3.5" />
            重命名
          </Button>
        </div>
      </div>
    </Modal>
  );
}
