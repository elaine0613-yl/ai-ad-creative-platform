"use client";

import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import type { MaterialCatalogAsset } from "@/lib/material-library/catalog-types";
import {
  getSubCategoryLabel,
  getTopCategoryLabel,
  OWNERSHIP_LABELS,
  SOURCE_LABELS,
} from "@/lib/material-library/catalog-types";
import {
  Clock,
  Copy,
  ExternalLink,
  Heart,
  HardDrive,
  Pencil,
  Star,
  Trash2,
  User,
} from "lucide-react";
import Link from "next/link";

interface MaterialDetailModalProps {
  asset: MaterialCatalogAsset | null;
  open: boolean;
  onClose: () => void;
  onUse?: (asset: MaterialCatalogAsset) => void;
}

export function MaterialDetailModal({ asset, open, onClose, onUse }: MaterialDetailModalProps) {
  if (!asset) return null;

  const createHref = asset.tab === "video" ? "/video/create" : "/image/create";

  return (
    <Modal open={open} onClose={onClose} title="资产详情" size="xl">
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-3">
          <div
            className="flex aspect-video items-center justify-center rounded-xl"
            style={{ backgroundColor: asset.previewColor ?? "#E5E7EB" }}
          >
            {asset.durationSec ? (
              <div className="text-center text-white drop-shadow">
                <div className="text-4xl font-bold tabular-nums">{asset.durationSec}s</div>
                <div className="mt-1 text-sm opacity-90">视频 / 音频预览</div>
              </div>
            ) : (
              <span className="text-sm font-medium text-white/80 drop-shadow">素材预览</span>
            )}
          </div>
          {asset.width && asset.height && (
            <p className="text-center text-xs text-gray-500">
              {asset.width} × {asset.height} px
            </p>
          )}
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{asset.name}</h3>
            <div className="mt-2 flex flex-wrap gap-1.5">
              <span className="rounded-full bg-brand-50 px-2 py-0.5 text-xs text-brand-700">
                {getTopCategoryLabel(asset.topCategory)}
              </span>
              <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                {getSubCategoryLabel(asset.subCategoryId)}
              </span>
              {asset.tags.map((t) => (
                <span key={t} className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
                  {t}
                </span>
              ))}
            </div>
          </div>

          <dl className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2 text-gray-600">
              <User className="h-4 w-4 shrink-0 text-gray-400" />
              <span>{asset.createdBy}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Clock className="h-4 w-4 shrink-0 text-gray-400" />
              <span>{asset.createdAt}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <HardDrive className="h-4 w-4 shrink-0 text-gray-400" />
              <span>{asset.fileSize ?? "—"}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Star className="h-4 w-4 shrink-0 text-gray-400" />
              <span>{OWNERSHIP_LABELS[asset.ownership]}</span>
            </div>
            <div className="col-span-2 text-gray-600">来源：{SOURCE_LABELS[asset.source]}</div>
          </dl>

          {asset.usageRecords.length > 0 && (
            <div>
              <h4 className="mb-2 text-sm font-medium text-gray-900">调用引用记录</h4>
              <ul className="max-h-32 space-y-1.5 overflow-y-auto rounded-lg border border-gray-100 bg-gray-50 p-3 text-sm">
                {asset.usageRecords.map((r, i) => (
                  <li key={i} className="flex justify-between gap-2 text-gray-600">
                    <span className="truncate">{r.taskName}</span>
                    <span className="shrink-0 text-xs text-gray-400">{r.usedAt}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-1 text-xs text-gray-400">累计调用 {asset.usageCount} 次</p>
            </div>
          )}

          <div className="flex flex-wrap gap-2 border-t border-gray-100 pt-4">
            <Link href={`${createHref}?materialId=${asset.id}`}>
              <Button size="sm" onClick={() => onUse?.(asset)}>
                <ExternalLink className="h-3.5 w-3.5" />
                选用
              </Button>
            </Link>
            <Button variant="outline" size="sm">
              <Copy className="h-3.5 w-3.5" />
              复制链接
            </Button>
            {!asset.readonly && (
              <>
                <Button variant="outline" size="sm">
                  <Pencil className="h-3.5 w-3.5" />
                  修改名称/标签
                </Button>
                <Button variant="outline" size="sm">
                  <Heart className="h-3.5 w-3.5" />
                  收藏
                </Button>
                <Button variant="danger" size="sm">
                  <Trash2 className="h-3.5 w-3.5" />
                  删除
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}
