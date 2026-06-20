"use client";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Tabs } from "@/components/ui/Tabs";
import { PageHeader } from "@/components/layout/PageHeader";
import {
  DIGITAL_HUMAN_AVATARS,
  EXPORT_PLATFORMS,
  MUSIC_STYLES,
  VIDEO_MODES,
  VIDEO_STYLES,
  VOICE_OPTIONS,
} from "@/lib/constants";
import { api } from "@/lib/api/client";
import { VideoTimelineEditor, type TimelineClip } from "@/components/editor/VideoTimelineEditor";
import {
  Download,
  Film,
  Music,
  Shield,
  Sparkles,
  Subtitles,
  Upload,
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";

type VideoMode = "text-to-video" | "images-to-video" | "smart-edit" | "digital-human";

const STEPS = [
  { id: "config", label: "参数配置" },
  { id: "upload", label: "素材上传" },
  { id: "preview", label: "生成预览" },
  { id: "export", label: "剪辑导出" },
];

export default function VideoCreateContent() {
  const searchParams = useSearchParams();
  const initialMode = (searchParams.get("mode") as VideoMode) || "images-to-video";

  const [mode, setMode] = useState<VideoMode>(initialMode);
  const [step, setStep] = useState("config");
  const [generating, setGenerating] = useState(false);
  const [hasResult, setHasResult] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [showTimeline, setShowTimeline] = useState(false);
  const [clips, setClips] = useState<TimelineClip[]>([
    { id: "c1", label: "开场", duration: 3, color: "#6366f1" },
    { id: "c2", label: "产品展示", duration: 5, color: "#8b5cf6" },
    { id: "c3", label: "卖点", duration: 4, color: "#a855f7" },
    { id: "c4", label: "促销", duration: 3, color: "#ec4899" },
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
    setStep("upload");
  };

  const handleGenerate = useCallback(async () => {
    setGenerating(true);
    setStep("preview");
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
          const { task } = await api.tasks.get(res.taskId!) as { task: { status: string; result: string } };
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

  return (
    <>
      <PageHeader title="视频创作工作台" />

      <div className="border-b border-gray-200 bg-white px-6">
        <Tabs tabs={STEPS} activeTab={step} onChange={setStep} />
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="w-72 shrink-0 overflow-y-auto border-r border-gray-200 bg-white">
          <div className="border-b border-gray-100 p-3">
            <p className="mb-2 text-xs font-medium text-gray-500">创作模式</p>
            <div className="space-y-1">
              {VIDEO_MODES.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setMode(m.id as VideoMode)}
                  className={`w-full rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                    mode === m.id ? "bg-brand-50 text-brand-700" : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <p className="font-medium">{m.name}</p>
                  <p className="text-xs text-gray-400">{m.description}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4 p-4">
            <Select
              label="视频时长"
              value={form.duration}
              onChange={(e) => setForm({ ...form, duration: e.target.value })}
              options={[
                { value: "10", label: "10 秒" },
                { value: "15", label: "15 秒" },
                { value: "30", label: "30 秒" },
                { value: "60", label: "60 秒" },
              ]}
            />
            <Select
              label="画幅比例"
              value={form.aspectRatio}
              onChange={(e) => setForm({ ...form, aspectRatio: e.target.value })}
              options={[
                { value: "9:16", label: "9:16 竖版" },
                { value: "16:9", label: "16:9 横版" },
                { value: "1:1", label: "1:1 方形" },
              ]}
            />
            <Select
              label="投放平台"
              value={form.platform}
              onChange={(e) => setForm({ ...form, platform: e.target.value })}
              options={EXPORT_PLATFORMS.map((p) => ({ value: p, label: p }))}
            />
            <Input
              label="产品名称 *"
              value={form.productName}
              onChange={(e) => setForm({ ...form, productName: e.target.value })}
            />
            <Textarea
              label="核心卖点"
              rows={2}
              value={form.sellingPoints}
              onChange={(e) => setForm({ ...form, sellingPoints: e.target.value })}
            />
            {mode === "text-to-video" && (
              <Textarea
                label="其他需求"
                placeholder="补充镜头、节奏、画面元素等自定义要求（可选）"
                rows={2}
                value={form.otherRequirements}
                onChange={(e) => setForm({ ...form, otherRequirements: e.target.value })}
              />
            )}
            <Select
              label="视频风格"
              value={form.style}
              onChange={(e) => setForm({ ...form, style: e.target.value })}
              options={VIDEO_STYLES.map((s) => ({ value: s, label: s }))}
            />

            {mode === "images-to-video" && (
              <div className="rounded-lg border-2 border-dashed border-gray-300 p-4 text-center">
                <Upload className="mx-auto h-8 w-8 text-gray-300" />
                <p className="mt-2 text-sm text-gray-500">上传 3-15 张产品图片</p>
                <label className="mt-2 inline-block cursor-pointer text-sm text-brand-600 hover:underline">
                  选择文件
                  <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} />
                </label>
                {uploadedImages.length > 0 && (
                  <div className="mt-2 flex flex-wrap justify-center gap-1">
                    {uploadedImages.map((img, i) => (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img key={i} src={img} alt="" className="h-10 w-10 rounded object-cover" />
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
                  label="音色"
                  value={form.voice}
                  onChange={(e) => setForm({ ...form, voice: e.target.value })}
                  options={VOICE_OPTIONS.map((v) => ({
                    value: v.id,
                    label: `${v.name} · ${v.emotion}`,
                  }))}
                />
                <Textarea
                  label="口播文案"
                  rows={4}
                  placeholder="输入口播文案，建议 60 字以内"
                  value={form.script}
                  onChange={(e) => setForm({ ...form, script: e.target.value })}
                />
              </>
            )}

            <div className="space-y-2">
              {[
                { key: "withVoiceover", label: "生成口播" },
                { key: "withSubtitle", label: "添加字幕" },
                { key: "useDigitalHuman", label: "使用数字人" },
              ].map(({ key, label }) => (
                <label key={key} className="flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={form[key as keyof typeof form] as boolean}
                    onChange={(e) => setForm({ ...form, [key]: e.target.checked })}
                    className="rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                  />
                  {label}
                </label>
              ))}
            </div>

            <Select
              label="配乐风格"
              value={form.musicStyle}
              onChange={(e) => setForm({ ...form, musicStyle: e.target.value })}
              options={MUSIC_STYLES.map((m) => ({ value: m, label: m }))}
            />

            <Button className="w-full" loading={generating} onClick={handleGenerate}>
              <Sparkles className="h-4 w-4" />
              {generating ? "生成中..." : "开始生成"}
            </Button>
            {providerInfo && <p className="text-center text-xs text-gray-400">{providerInfo}</p>}
            {error && <p className="rounded bg-red-50 p-2 text-xs text-red-600">{error}</p>}
          </div>
        </div>

        <div className="flex flex-1 flex-col overflow-hidden">
          <div className="flex flex-1 items-center justify-center bg-gray-900 p-6">
            {hasResult && videoUrl ? (
              <div className="relative">
                <video
                  src={videoUrl}
                  controls
                  className="max-h-[480px] rounded-lg"
                  style={{
                    width: form.aspectRatio === "9:16" ? 270 : form.aspectRatio === "1:1" ? 360 : 480,
                  }}
                />
              </div>
            ) : generating ? (
              <div className="text-center">
                <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-gray-600 border-t-brand-500" />
                <p className="mt-4 text-sm text-gray-400">视频生成中，预计需要 30-60 秒...</p>
              </div>
            ) : (
              <div className="text-center">
                <Film className="mx-auto h-16 w-16 text-gray-600" />
                <p className="mt-4 text-sm text-gray-400">配置参数后开始生成</p>
              </div>
            )}
          </div>

          {hasResult && (
            <div className="border-t border-gray-700 bg-gray-800 p-4">
              <div className="mb-2 flex items-center gap-4 text-xs text-gray-400">
                <span className="flex items-center gap-1">
                  <Music className="h-3 w-3" /> BGM
                </span>
                <span className="flex items-center gap-1">
                  <Subtitles className="h-3 w-3" /> 字幕
                </span>
              </div>
              <div className="flex gap-1">
                {clips.map((clip) => (
                  <div
                    key={clip.id}
                    className="h-12 rounded transition-colors hover:opacity-80"
                    style={{ flex: clip.duration, backgroundColor: clip.color, minWidth: 32 }}
                    title={clip.label}
                  />
                ))}
              </div>
            </div>
          )}

          {hasResult && (
            <div className="flex items-center justify-center gap-2 border-t border-gray-200 bg-white py-3">
              <Button variant="outline" size="sm" onClick={() => setShowTimeline(true)}>
                在线剪辑
              </Button>
              <Button variant="outline" size="sm">
                <Shield className="h-3.5 w-3.5" />
                合规检测
              </Button>
              <Button size="sm" onClick={() => videoUrl && window.open(videoUrl, "_blank")}>
                <Download className="h-3.5 w-3.5" />
                高清导出
              </Button>
            </div>
          )}
        </div>
      </div>

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
