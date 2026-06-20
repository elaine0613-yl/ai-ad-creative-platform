"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Download, Type, Square, Trash2, RotateCcw } from "lucide-react";

interface ImageCanvasEditorProps {
  open: boolean;
  onClose: () => void;
  imageUrl: string;
  width: number;
  height: number;
  onSave?: (dataUrl: string) => void;
}

function EditorInner({ open, onClose, imageUrl, width, height, onSave }: ImageCanvasEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricRef = useRef<import("fabric").Canvas | null>(null);
  const [textInput, setTextInput] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!open || !canvasRef.current) return;

    let canvas: import("fabric").Canvas;
    let disposed = false;

    (async () => {
      const { Canvas, FabricImage, Rect } = await import("fabric");
      if (disposed || !canvasRef.current) return;

      canvas = new Canvas(canvasRef.current, {
        width: Math.min(640, width),
        height: Math.min(640, (height / width) * 640),
        backgroundColor: "#f3f4f6",
      });
      fabricRef.current = canvas;

      const scale = Math.min(640 / width, 640 / height, 1);

      try {
        if (imageUrl.startsWith("data:") || imageUrl.startsWith("/")) {
          const img = await FabricImage.fromURL(imageUrl, { crossOrigin: "anonymous" });
          img.scale(scale);
          canvas.add(img);
          canvas.centerObject(img);
        } else {
          const rect = new Rect({
            width: width * scale,
            height: height * scale,
            fill: "#e0e7ff",
          });
          canvas.add(rect);
          canvas.centerObject(rect);
        }
      } catch {
        const rect = new Rect({
          width: width * scale,
          height: height * scale,
          fill: "#e0e7ff",
        });
        canvas.add(rect);
        canvas.centerObject(rect);
      }

      canvas.renderAll();
      setLoading(false);
    })();

    return () => {
      disposed = true;
      fabricRef.current?.dispose();
      fabricRef.current = null;
    };
  }, [open, imageUrl, width, height]);

  const addText = async () => {
    if (!fabricRef.current || !textInput.trim()) return;
    const { FabricText } = await import("fabric");
    const text = new FabricText(textInput, {
      fontSize: 28,
      fill: "#111827",
      fontFamily: "PingFang SC, sans-serif",
    });
    fabricRef.current.add(text);
    fabricRef.current.centerObject(text);
    fabricRef.current.setActiveObject(text);
    fabricRef.current.renderAll();
    setTextInput("");
  };

  const addRect = async () => {
    if (!fabricRef.current) return;
    const { Rect } = await import("fabric");
    const rect = new Rect({ width: 120, height: 60, fill: "rgba(99,102,241,0.6)" });
    fabricRef.current.add(rect);
    fabricRef.current.centerObject(rect);
    fabricRef.current.renderAll();
  };

  const deleteSelected = () => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const active = canvas.getActiveObjects();
    active.forEach((obj) => canvas.remove(obj));
    canvas.discardActiveObject();
    canvas.renderAll();
  };

  const handleSave = () => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL({ format: "png", multiplier: 2 });
    onSave?.(dataUrl);
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title="在线图片编辑" size="xl">
      <div className="flex gap-4">
        <div className="flex w-48 shrink-0 flex-col gap-2">
          <div className="flex gap-1">
            <input
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="添加文案"
              className="flex-1 rounded border px-2 py-1 text-sm"
            />
            <Button size="sm" variant="outline" onClick={addText}>
              <Type className="h-3.5 w-3.5" />
            </Button>
          </div>
          <Button size="sm" variant="outline" onClick={addRect}>
            <Square className="h-3.5 w-3.5" />
            添加色块
          </Button>
          <Button size="sm" variant="outline" onClick={deleteSelected}>
            <Trash2 className="h-3.5 w-3.5" />
            删除选中
          </Button>
          <Button size="sm" variant="outline" onClick={() => fabricRef.current?.renderAll()}>
            <RotateCcw className="h-3.5 w-3.5" />
            刷新
          </Button>
          <Button size="sm" onClick={handleSave}>
            <Download className="h-3.5 w-3.5" />
            保存编辑
          </Button>
        </div>
        <div className="flex flex-1 items-center justify-center rounded-lg bg-gray-100 p-4">
          {loading && <p className="text-sm text-gray-400">编辑器加载中...</p>}
          <canvas ref={canvasRef} className={loading ? "hidden" : "border border-gray-200 shadow"} />
        </div>
      </div>
    </Modal>
  );
}

export const ImageCanvasEditor = dynamic(() => Promise.resolve(EditorInner), { ssr: false });
