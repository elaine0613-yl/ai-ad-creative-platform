"use client";

import type { LibrarySaveMode } from "@/lib/material-library/types";
import { Save } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/Button";

interface SaveToLibraryDialogProps {
  open: boolean;
  materialType: "image" | "video";
  onClose: () => void;
  onSave: (mode: LibrarySaveMode, name: string) => Promise<void>;
  onExportOnly: () => void;
}

export function SaveToLibraryDialog({
  open,
  materialType,
  onClose,
  onSave,
  onExportOnly,
}: SaveToLibraryDialogProps) {
  const [mode, setMode] = useState<LibrarySaveMode>("finished-asset");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const handleSave = async () => {
    if (!name.trim()) return;
    setLoading(true);
    try {
      await onSave(mode, name.trim());
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const modes: { id: LibrarySaveMode; label: string; desc: string }[] = [
    {
      id: "finished-asset",
      label: "保存成品素材",
      desc: materialType === "image" ? "广告图片实体文件" : "完整短视频 / 片段 / 音频",
    },
    {
      id: "config-template",
      label: "保存参数模板",
      desc: "整套面板配置参数，后续一键回填",
    },
    {
      id: "component-unit",
      label: "保存单个组件 / 片段",
      desc: "单镜头、BGM、文案、转场、配色等",
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <h3 className="text-base font-semibold text-gray-900">生成完成 · 存入素材库</h3>
        <p className="mt-1 text-xs text-gray-500">选择保存方式，一键写入个人私有素材库</p>

        <div className="mt-4 space-y-2">
          {modes.map((m) => (
            <label
              key={m.id}
              className={`flex cursor-pointer gap-3 rounded-xl border p-3 ${
                mode === m.id ? "border-brand-500 bg-brand-50" : "border-gray-200"
              }`}
            >
              <input
                type="radio"
                name="save-mode"
                checked={mode === m.id}
                onChange={() => setMode(m.id)}
                className="mt-1"
              />
              <div>
                <p className="text-sm font-medium text-gray-900">{m.label}</p>
                <p className="text-xs text-gray-500">{m.desc}</p>
              </div>
            </label>
          ))}
        </div>

        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="自定义素材名称"
          className="mt-4 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
        />

        <div className="mt-4 flex gap-2">
          <Button variant="outline" className="flex-1" onClick={onExportOnly}>
            仅导出
          </Button>
          <Button className="flex-1" onClick={handleSave} loading={loading} disabled={!name.trim()}>
            <Save className="h-4 w-4" />
            存入个人库
          </Button>
        </div>
        <button type="button" onClick={onClose} className="mt-2 w-full text-xs text-gray-400 hover:text-gray-600">
          稍后处理
        </button>
      </div>
    </div>
  );
}
