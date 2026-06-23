"use client";

import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import {
  ChipGroup,
  CreationWorkbench,
  PromptBlock,
} from "@/components/create/CreationWorkbench";
import { KnowledgePicker, KnowledgeRefBadge } from "@/components/knowledge/KnowledgePicker";
import {
  DIGITAL_HUMAN_AVATARS,
  EXPORT_PLATFORMS,
  MUSIC_STYLES,
  VIDEO_MODES,
  VIDEO_STYLES,
  VOICE_OPTIONS,
} from "@/lib/constants";
import { mockKnowledgeAssets } from "@/lib/mock/data";
import { api } from "@/lib/api/client";
import {
  applyKnowledgeToVideoForm,
  findKnowledgeAsset,
} from "@/lib/knowledge/apply";
import { VideoTimelineEditor, type TimelineClip } from "@/components/editor/VideoTimelineEditor";
import type { KnowledgeAsset } from "@/lib/types";
import {
  BookOpen,
  Download,
  Film,
  Music,
  Shield,
  Sparkles,
  Subtitles,
  Upload,
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

type VideoMode = "text-to-video" | "images-to-video" | "smart-edit" | "digital-human";

const MODE_TABS = VIDEO_MODES.map((m) => ({
  id: m.id,
  label: m.name,
  description: m.description,
}));

export default function VideoCreateContent() {
  const searchParams = useSearchParams();
  const initialMode = (searchParams.get("mode") as VideoMode) || "images-to-video";
  const refId = searchParams.get("ref");

  const [mode, setMode] = useState<VideoMode>(initialMode);
  const [generating, setGenerating] = useState(false);
  const [hasResult, setHasResult] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [showTimeline, setShowTimeline] = useState(false);
  const [showKnowledge, setShowKnowledge] = useState(false);
  const [knowledgeRef, setKnowledgeRef] = useState<KnowledgeAsset | null>(null);
  const [clips, setClips] = useState<TimelineClip[]>([
    { id: "c1", label: "开场钩子", duration: 3, color: "#6366f1" },
    { id: "c2", label: "产品展示", duration: 5, color: "#8b5cf6" },
    { id: "c3", label: "卖点字幕", duration: 4, color: "#a855f7" },
    { id: "c4", label: "CTA 片尾", duration: 3, color: "#ec4899" },
  ]);
  const [providerInfo, setProviderInfo] = useState("");
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    duration: "15",
    aspectRatio: "9:16",
    platform: EXPORT_PLATFORMS[0],
    productName: "",
    sellingPoints: "",
    otherRequirements: "",
    marketingInfo: "",
    style: VIDEO_STYLES[0],
    withVoiceover: true,
    withSubtitle: true,
    musicStyle: MUSIC_STYLES[0],
    useDigitalHuman: false,
    avatar: DIGITAL_HUMAN_AVATARS[0].id,
    voice: VOICE_OPTIONS[0].id,
    script: "",
  });

  const applyKnowledge = useCallback((asset: KnowledgeAsset) => {
    setForm((prev) => ({ ...prev, ...applyKnowledgeToVideoForm(asset, prev) }));
    setKnowledgeRef(asset);
  }, []);

  useEffect(() => {
    if (refId) {
      const asset = findKnowledgeAsset(mockKnowledgeAssets, refId);
      if (asset?.library === "video") applyKnowledge(asset);
    }
  }, [refId, applyKnowledge]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          setUploadedImages((prev) => [...prev, reader.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleGenerate = useCallback(async () => {
    setGenerating(true);
    setError(null);
    try {
      const res = await api.ai.generateVideo({
        ...form,
        duration: Number(form.duration),
        imageBase64List: uploadedImages.length > 0 ? uploadedImages : undefined,
        imageUrls: uploadedImages.length === 0 ? [] : undefined,
      });

      if (res.taskId) {
        let attempts = 0;
        const poll = async () => {
          const { task } = (await api.tasks.get(res.taskId!)) as {
            task: { status: string; result: string };
          };
          if (task.status === "completed") {
            const result = JSON.parse(task.result || "{}");
            setVideoUrl(result.video?.url ?? null);
            setHasResult(true);
            setGenerating(false);
          } else if (task.status === "failed") {
            throw new Error("视频生成失败");
          } else if (attempts++ < 60) {
            setTimeout(poll, 2000);
          } else {
            throw new Error("生成超时，请在任务中心查看");
          }
        };
        await poll();
      } else if (res.video) {
        setVideoUrl(res.video.url);
        setHasResult(true);
        setGenerating(false);
      }

      const providers = await api.ai.providers();
      const p = providers.providers as { replicateConfigured?: boolean; video?: string };
      setProviderInfo(
        p.replicateConfigured
          ? `Replicate (${p.video})`
          : "Mock 模式（配置 REPLICATE_API_TOKEN 启用真实图文转视频）"
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "生成失败");
      setGenerating(false);
    }
  }, [form, uploadedImages]);

  const configPanel = (
    <div className="space-y-5">
      {knowledgeRef && (
        <KnowledgeRefBadge name={knowledgeRef.name} onClear={() => setKnowledgeRef(null)} />
      )}

      <PromptBlock
        label="产品名称"
        placeholder="输入产品名称"
        value={form.productName}
        onChange={(v) => setForm({ ...form, productName: v })}
        rows={1}
        required
      />

      <PromptBlock
        label="视频创意 / 脚本"
        placeholder="描述镜头节奏、画面内容、口播文案… 例如：开场痛点提问 → 产品特写 → 价格促销 → 扫码下单"
        value={[form.sellingPoints, form.otherRequirements, form.script].filter(Boolean).join("\n")}
        onChange={(v) => {
          const lines = v.split("\n");
          setForm({
            ...form,
            sellingPoints: lines[0] ?? "",
            otherRequirements: lines.slice(1, -1).join("\n"),
            script: lines.length > 1 ? lines[lines.length - 1] : form.script,
          });
        }}
        rows={5}
      />

      {mode === "images-to-video" && (
        <div className="rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 p-6 text-center">
          <Upload className="mx-auto h-8 w-8 text-gray-300" />
          <p className="mt-2 text-sm text-gray-500">上传 3-15 张产品图</p>
          <label className="mt-2 inline-block cursor-pointer text-sm font-medium text-brand-600 hover:underline">
            选择文件
            <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} />
          </label>
          {uploadedImages.length > 0 && (
            <div className="mt-3 flex flex-wrap justify-center gap-1.5">
              {uploadedImages.map((img, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={i} src={img} alt="" className="h-12 w-12 rounded-lg object-cover" />
              ))}
            </div>
          )}
        </div>
      )}

      {mode === "digital-human" && (
        <>
          <Select
            label="数字人形象"
            value={form.avatar}
            onChange={(e) => setForm({ ...form, avatar: e.target.value })}
            options={DIGITAL_HUMAN_AVATARS.map((a) => ({
              value: a.id,
              label: `${a.name} (${a.style})`,
            }))}
          />
          <Select
            label="配音音色"
            value={form.voice}
            onChange={(e) => setForm({ ...form, voice: e.target.value })}
            options={VOICE_OPTIONS.map((v) => ({
              value: v.id,
              label: `${v.name} · ${v.emotion}`,
            }))}
          />
        </>
      )}

      <ChipGroup
        label="视频风格"
        options={VIDEO_STYLES}
        value={form.style}
        onChange={(v) => setForm({ ...form, style: v })}
      />

      <ChipGroup
        label="BGM 风格"
        options={MUSIC_STYLES}
        value={form.musicStyle}
        onChange={(v) => setForm({ ...form, musicStyle: v })}
      />

      <div className="grid grid-cols-2 gap-3">
        <Select
          label="时长"
          value={form.duration}
          onChange={(e) => setForm({ ...form, duration: e.target.value })}
          options={[
            { value: "10", label: "10s" },
            { value: "15", label: "15s" },
            { value: "30", label: "30s" },
            { value: "60", label: "60s" },
          ]}
        />
        <Select
          label="画幅"
          value={form.aspectRatio}
          onChange={(e) => setForm({ ...form, aspectRatio: e.target.value })}
          options={[
            { value: "9:16", label: "9:16" },
            { value: "16:9", label: "16:9" },
            { value: "1:1", label: "1:1" },
          ]}
        />
      </div>

      <Select
        label="投放平台"
        value={form.platform}
        onChange={(e) => setForm({ ...form, platform: e.target.value })}
        options={EXPORT_PLATFORMS.map((p) => ({ value: p, label: p }))}
      />

      <div className="flex flex-wrap gap-3">
        {[
          { key: "withVoiceover", label: "配音旁白" },
          { key: "withSubtitle", label: "字幕花字" },
          { key: "useDigitalHuman", label: "数字人" },
        ].map(({ key, label }) => (
          <label key={key} className="flex items-center gap-1.5 text-xs text-gray-700">
            <input
              type="checkbox"
              checked={form[key as keyof typeof form] as boolean}
              onChange={(e) => setForm({ ...form, [key]: e.target.checked })}
              className="rounded border-gray-300 text-gray-900 focus:ring-gray-500"
            />
            {label}
          </label>
        ))}
      </div>

      <div className="sticky bottom-0 space-y-2 border-t border-gray-100 bg-white pt-3">
        <Button variant="outline" className="w-full" size="sm" onClick={() => setShowKnowledge(true)}>
          <BookOpen className="h-4 w-4" />
          从知识库引用 BGM / 分镜 / 配音
        </Button>
        <Button className="w-full" size="lg" loading={generating} onClick={handleGenerate}>
          <Sparkles className="h-4 w-4" />
          {generating ? "生成中..." : "开始生成"}
        </Button>
        {providerInfo && <p className="text-center text-[10px] text-gray-400">{providerInfo}</p>}
        {error && <p className="rounded-lg bg-red-50 p-2 text-xs text-red-600">{error}</p>}
      </div>
    </div>
  );

  const previewPanel = (
    <div className="flex w-full max-w-2xl flex-col items-center">
      {hasResult && videoUrl ? (
        <>
          <video
            src={videoUrl}
            controls
            className="max-h-[min(480px,65vh)] rounded-2xl shadow-2xl"
            style={{
              width: form.aspectRatio === "9:16" ? 270 : form.aspectRatio === "1:1" ? 360 : 480,
            }}
          />
          <div className="mt-4 flex w-full gap-1 px-4">
            {clips.map((clip) => (
              <div
                key={clip.id}
                className="group relative h-10 rounded-lg transition-opacity hover:opacity-90"
                style={{ flex: clip.duration, backgroundColor: clip.color, minWidth: 28 }}
                title={clip.label}
              >
                <span className="absolute inset-0 flex items-center justify-center text-[9px] font-medium text-white opacity-0 group-hover:opacity-100">
                  {clip.label}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-2 flex gap-4 text-xs text-gray-500">
            {form.withVoiceover && (
              <span className="flex items-center gap-1">
                <Music className="h-3 w-3" /> 配音
              </span>
            )}
            {form.withSubtitle && (
              <span className="flex items-center gap-1">
                <Subtitles className="h-3 w-3" /> 字幕
              </span>
            )}
            <span>{form.musicStyle} BGM</span>
          </div>
        </>
      ) : generating ? (
        <div className="text-center">
          <div className="mx-auto h-14 w-14 animate-spin rounded-full border-4 border-gray-700 border-t-white" />
          <p className="mt-4 text-sm text-gray-400">视频生成中，预计 30-60 秒...</p>
        </div>
      ) : (
        <div className="text-center">
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-2xl bg-white/5">
            <Film className="h-12 w-12 text-gray-600" />
          </div>
          <p className="mt-4 text-sm font-medium text-gray-400">配置脚本与素材，点击生成</p>
          <p className="mt-1 text-xs text-gray-600">可从知识库引用 BGM、分镜、配音方案</p>
        </div>
      )}
    </div>
  );

  const footerActions = hasResult ? (
    <>
      <Button variant="outline" size="sm" onClick={() => setShowTimeline(true)}>
        时间轴剪辑
      </Button>
      <Button variant="outline" size="sm">
        <Shield className="h-3.5 w-3.5" />
        合规检测
      </Button>
      <Button size="sm" onClick={() => videoUrl && window.open(videoUrl, "_blank")}>
        <Download className="h-3.5 w-3.5" />
        导出
      </Button>
    </>
  ) : null;

  return (
    <>
      <CreationWorkbench
        title="视频创作"
        subtitle="文生视频 · 图文转视频 · 数字人口播"
        modeTabs={MODE_TABS}
        activeMode={mode}
        onModeChange={(id) => setMode(id as VideoMode)}
        configPanel={configPanel}
        previewPanel={previewPanel}
        footerActions={footerActions}
        previewDark
      />

      <KnowledgePicker
        open={showKnowledge}
        onClose={() => setShowKnowledge(false)}
        library="video"
        onSelect={applyKnowledge}
        selectedId={knowledgeRef?.id}
      />

      <VideoTimelineEditor
        open={showTimeline}
        onClose={() => setShowTimeline(false)}
        clips={clips}
        onChange={setClips}
        totalDuration={Number(form.duration)}
      />
    </>
  );
}
