"use client";

import { Copy, Upload } from "lucide-react";

export function ImageReplicatePlaceholder() {
  return (
    <div className="flex flex-1 items-center justify-center p-8">
      <div className="max-w-lg rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center shadow-sm">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 text-gray-400">
          <Copy className="h-7 w-7" />
        </div>
        <h2 className="mt-4 text-lg font-semibold text-gray-900">功能预留中</h2>
        <p className="mt-2 text-sm leading-relaxed text-gray-500">
          爆款复刻模式将支持：上传参考图/视频 → 多模态解析构图、文案、色调与转化结构 →
          一键生成差异化复刻方案。当前 Demo 优先落地「AI原生素材」。
        </p>
        <ul className="mt-6 space-y-2 text-left text-sm text-gray-600">
          <li className="flex items-center gap-2">
            <Upload className="h-4 w-4 shrink-0 text-gray-400" />
            参考素材上传与特征解析
          </li>
          <li className="flex items-center gap-2">
            <Copy className="h-4 w-4 shrink-0 text-gray-400" />
            爆款结构逆向拆解 + 二次创新
          </li>
        </ul>
        <p className="mt-8 text-xs text-gray-400">请切换上方「AI原生素材」开始创作</p>
      </div>
    </div>
  );
}
