"use client";

import type { LibraryAsset } from "@/lib/material-library/types";
import { queryLibraryAssets } from "@/lib/material-library/service";
import type { MaterialType } from "@/lib/types";
import { cn } from "@/lib/utils";
import { FolderOpen, Upload, X } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";

interface MaterialAssetPickerProps {
  value: string;
  onChange: (assetId: string, asset?: LibraryAsset) => void;
  assetCategory?: string;
  assetSubCategory?: string;
  materialType?: MaterialType;
  disabled?: boolean;
  placeholder?: string;
}

export function MaterialAssetPicker({
  value,
  onChange,
  assetCategory,
  assetSubCategory,
  materialType,
  disabled,
  placeholder = "从素材库选取",
}: MaterialAssetPickerProps) {
  const [open, setOpen] = useState(false);
  const [scope, setScope] = useState<"all" | "private" | "public">("all");
  const [search, setSearch] = useState("");

  const { items } = useMemo(
    () =>
      queryLibraryAssets({
        category: assetCategory as LibraryAsset["category"],
        subCategory: assetSubCategory,
        scope,
        materialType,
        search,
        pageSize: 30,
      }),
    [assetCategory, assetSubCategory, scope, materialType, search]
  );

  const selected = items.find((a) => a.id === value);

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <button
          type="button"
          disabled={disabled}
          onClick={() => setOpen(true)}
          className={cn(
            "flex flex-1 items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-left text-sm transition-colors",
            disabled ? "bg-gray-50 text-gray-400" : "hover:border-brand-300 hover:bg-brand-50/30"
          )}
        >
          <FolderOpen className="h-4 w-4 shrink-0 text-brand-600" />
          <span className={cn("truncate", !value && "text-gray-400")}>
            {selected?.name ?? (value ? value : placeholder)}
          </span>
        </button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={disabled}
          onClick={() => alert("演示环境：本地上传将在后续版本接入")}
        >
          <Upload className="h-3.5 w-3.5" />
          上传
        </Button>
        {value && (
          <button
            type="button"
            disabled={disabled}
            onClick={() => onChange("")}
            className="rounded-lg border border-gray-200 p-2 text-gray-400 hover:text-red-500"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
      {selected && (
        <p className="text-[10px] text-gray-400">
          来源：{selected.scope === "private" ? "个人素材库" : "公共素材库"} · {selected.tags.join(" · ")}
        </p>
      )}

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="flex max-h-[80vh] w-full max-w-lg flex-col rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
              <div>
                <p className="text-sm font-semibold text-gray-900">选取素材</p>
                <p className="text-[11px] text-gray-500">优先级：个人私有 &gt; 公共预置</p>
              </div>
              <button type="button" onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex gap-2 border-b border-gray-100 px-4 py-2">
              {(["all", "private", "public"] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setScope(s)}
                  className={cn(
                    "rounded-full px-3 py-1 text-xs",
                    scope === s ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-600"
                  )}
                >
                  {s === "all" ? "全部" : s === "private" ? "个人库" : "公共库"}
                </button>
              ))}
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="搜索…"
                className="ml-auto flex-1 rounded-lg border border-gray-200 px-2 py-1 text-xs"
              />
            </div>
            <div className="flex-1 overflow-y-auto p-3">
              {items.length === 0 ? (
                <p className="py-8 text-center text-sm text-gray-400">暂无匹配素材</p>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {items.map((asset) => (
                    <button
                      key={asset.id}
                      type="button"
                      onClick={() => {
                        onChange(asset.id, asset);
                        setOpen(false);
                      }}
                      className={cn(
                        "rounded-xl border p-3 text-left transition-colors",
                        value === asset.id
                          ? "border-brand-500 bg-brand-50"
                          : "border-gray-200 hover:border-gray-300"
                      )}
                    >
                      <span
                        className={cn(
                          "mb-2 inline-block rounded px-1.5 py-0.5 text-[9px]",
                          asset.scope === "private"
                            ? "bg-amber-50 text-amber-700"
                            : "bg-blue-50 text-blue-700"
                        )}
                      >
                        {asset.scope === "private" ? "个人" : "公共"}
                      </span>
                      <p className="line-clamp-2 text-xs font-medium text-gray-900">{asset.name}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
