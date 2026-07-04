"use client";

import { Copy, Upload } from "lucide-react";

export function VideoReplicatePlaceholder() {
  return (
    <div className="flex flex-1 items-center justify-center p-8">
      <div className="max-w-lg rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center shadow-sm">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 text-gray-400">
          <Copy className="h-7 w-7" />
        </div>
        <h2 className="mt-4 text-lg font-semibold text-gray-900">功能预留中</h2>
        <p className="mt-2 text-sm leading-relaxed text-gray-500">
          爆款复刻视频将支持：上传爆款视频素材 → 多模态解析镜头、节奏、文案、BGM 逻辑 →
          逆向复刻创新。当前 Demo 优先落地「AI原生视频」。
        </p>
        <ul className="mt-6 space-y-2 text-left text-sm text-gray-600">
          <li className="flex items-center gap-2">
            <Upload className="h-4 w-4 shrink-0 text-gray-400" />
            爆款视频上传与镜头拆解
          </li>
          <li className="flex items-center gap-2">
            <Copy className="h-4 w-4 shrink-0 text-gray-400" />
            节奏 / 文案 / BGM 逻辑逆向复刻
          </li>
        </ul>
        <p className="mt-8 text-xs text-gray-400">请切换上方「AI原生视频」开始创作</p>
      </div>
    </div>
  );
}
