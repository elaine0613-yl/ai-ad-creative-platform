"use client";

import { useCallback, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { GripVertical, Plus, Scissors, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface TimelineClip {
  id: string;
  label: string;
  duration: number;
  color: string;
}

interface VideoTimelineEditorProps {
  open: boolean;
  onClose: () => void;
  clips: TimelineClip[];
  onChange: (clips: TimelineClip[]) => void;
  totalDuration: number;
}

export function VideoTimelineEditor({
  open,
  onClose,
  clips,
  onChange,
  totalDuration,
}: VideoTimelineEditorProps) {
  const [localClips, setLocalClips] = useState(clips);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  const total = localClips.reduce((s, c) => s + c.duration, 0);

  const updateClip = (id: string, duration: number) => {
    setLocalClips((prev) => prev.map((c) => (c.id === id ? { ...c, duration: Math.max(0.5, duration) } : c)));
  };

  const removeClip = (id: string) => {
    setLocalClips((prev) => prev.filter((c) => c.id !== id));
    setSelectedId(null);
  };

  const splitClip = (id: string) => {
    setLocalClips((prev) => {
      const idx = prev.findIndex((c) => c.id === id);
      if (idx === -1) return prev;
      const clip = prev[idx];
      const half = clip.duration / 2;
      const newClip: TimelineClip = {
        id: `${id}-split-${Date.now()}`,
        label: `${clip.label} (2)`,
        duration: half,
        color: clip.color,
      };
      const updated = [...prev];
      updated[idx] = { ...clip, duration: half };
      updated.splice(idx + 1, 0, newClip);
      return updated;
    });
  };

  const handleDragStart = (index: number) => setDragIndex(index);

  const handleDrop = (targetIndex: number) => {
    if (dragIndex === null || dragIndex === targetIndex) return;
    setLocalClips((prev) => {
      const next = [...prev];
      const [moved] = next.splice(dragIndex, 1);
      next.splice(targetIndex, 0, moved);
      return next;
    });
    setDragIndex(null);
  };

  const handleSave = () => {
    onChange(localClips);
    onClose();
  };

  const addClip = useCallback(() => {
    setLocalClips((prev) => [
      ...prev,
      {
        id: `clip-${Date.now()}`,
        label: `片段 ${prev.length + 1}`,
        duration: 2,
        color: "#6366f1",
      },
    ]);
  }, []);

  return (
    <Modal open={open} onClose={onClose} title="视频时间轴编辑" size="xl">
      <div className="space-y-4">
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>目标时长: {totalDuration}s</span>
          <span>当前: {total.toFixed(1)}s</span>
        </div>

        <div className="rounded-lg bg-gray-900 p-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs text-gray-400">时间轴</span>
            <Button size="sm" variant="outline" onClick={addClip}>
              <Plus className="h-3.5 w-3.5" />
              添加片段
            </Button>
          </div>
          <div className="flex min-h-[64px] gap-1">
            {localClips.map((clip, index) => (
              <div
                key={clip.id}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => handleDrop(index)}
                onClick={() => setSelectedId(clip.id)}
                className={cn(
                  "group relative flex cursor-pointer items-center justify-center rounded transition-all",
                  selectedId === clip.id ? "ring-2 ring-brand-400 ring-offset-1 ring-offset-gray-900" : ""
                )}
                style={{
                  flex: clip.duration,
                  backgroundColor: clip.color,
                  minWidth: 48,
                }}
              >
                <GripVertical className="absolute left-1 h-3 w-3 text-white/40 opacity-0 group-hover:opacity-100" />
                <span className="truncate px-2 text-xs font-medium text-white">{clip.label}</span>
                <span className="absolute bottom-1 right-1 text-[10px] text-white/70">{clip.duration}s</span>
              </div>
            ))}
          </div>
          <div className="mt-2 flex justify-between text-[10px] text-gray-500">
            <span>0s</span>
            <span>{totalDuration}s</span>
          </div>
        </div>

        {selectedId && (
          <div className="flex items-center gap-4 rounded-lg border p-3">
            <label className="text-sm text-gray-600">
              片段时长
              <input
                type="range"
                min={0.5}
                max={10}
                step={0.5}
                value={localClips.find((c) => c.id === selectedId)?.duration ?? 2}
                onChange={(e) => updateClip(selectedId, Number(e.target.value))}
                className="ml-2 w-40"
              />
            </label>
            <Button size="sm" variant="outline" onClick={() => splitClip(selectedId)}>
              <Scissors className="h-3.5 w-3.5" />
              分割
            </Button>
            <Button size="sm" variant="outline" onClick={() => removeClip(selectedId)}>
              <Trash2 className="h-3.5 w-3.5" />
              删除
            </Button>
          </div>
        )}

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            取消
          </Button>
          <Button onClick={handleSave}>应用剪辑</Button>
        </div>
      </div>
    </Modal>
  );
}
