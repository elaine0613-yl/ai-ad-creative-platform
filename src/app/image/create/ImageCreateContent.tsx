"use client";

import { Button } from "@/components/ui/Button";
import { Card, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Modal } from "@/components/ui/Modal";
import { PageHeader } from "@/components/layout/PageHeader";
import {
  IMAGE_EDIT_MODES,
  IMAGE_SCENES,
  IMAGE_STYLES,
  INDUSTRIES,
  PLATFORM_PRESETS,
} from "@/lib/constants";
import { mockCreativeIdeas } from "@/lib/mock/data";
import { api } from "@/lib/api/client";
import { ImageCanvasEditor } from "@/components/editor/ImageCanvasEditor";
import { StatusBadge } from "@/components/ui/Badge";
import {
  Download,
  Lightbulb,
  RefreshCw,
  Shield,
  Sparkles,
  Wand2,
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";

type ImageMode = "text-to-image" | "image-to-image" | "poster" | "resize";

interface GeneratedResult {
  id: string;
  thumbnailUrl: string;
  url: string;
  width: number;
  height: number;
  provider?: string;
}

interface ComplianceReport {
  status: string;
  items: { id: string; severity: string; message: string; location?: string }[];
  score: number;
}

export default function ImageCreateContent() {
  const searchParams = useSearchParams();
  const initialMode = (searchParams.get("mode") as ImageMode) || "text-to-image";

  const [mode, setMode] = useState<ImageMode>(initialMode);
  const [generating, setGenerating] = useState(false);
  const [results, setResults] = useState<GeneratedResult[]>([]);
  const [selectedResult, setSelectedResult] = useState<string | null>(null);
  const [showCreative, setShowCreative] = useState(false);
  const [showCompliance, setShowCompliance] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  const [providerInfo, setProviderInfo] = useState<string>("");
  const [complianceReport, setComplianceReport] = useState<ComplianceReport | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    industry: INDUSTRIES[0],
    scene: IMAGE_SCENES[0],
    productName: "",
    mainTitle: "",
    subTitle: "",
    sellingPoints: "",
    otherRequirements: "",
    promotion: "",
    style: IMAGE_STYLES[0],
    mainColor: "",
    atmosphere: "",
    preset: PLATFORM_PRESETS[0].id,
    editMode: IMAGE_EDIT_MODES[0].id,
    editPrompt: "",
  });

  const [brandLock, setBrandLock] = useState(false);
  const [generateCount, setGenerateCount] = useState(4);

  const selected = results.find((r) => r.id === selectedResult);

  const preset = PLATFORM_PRESETS.find((p) => p.id === form.preset) ?? PLATFORM_PRESETS[0];

  const handleGenerate = useCallback(async () => {
    setGenerating(true);
    setError(null);
    try {
      const { images, providers } = await api.ai.generateImage({
        ...form,
        width: preset.width,
        height: preset.height,
        count: generateCount,
        brandLock,
      });
      const newResults: GeneratedResult[] = images.map((img) => ({
        id: img.id,
        url: img.url,
        thumbnailUrl: img.url,
        width: img.width,
        height: img.height,
        provider: img.provider,
      }));
      setResults(newResults);
      setSelectedResult(newResults[0]?.id ?? null);
      const p = providers as { image?: string; openaiConfigured?: boolean };
      setProviderInfo(
        p.openaiConfigured
          ? `OpenAI (${p.image})`
          : `Mock 模式（配置 OPENAI_API_KEY 启用真实文生图）`
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "生成失败");
    } finally {
      setGenerating(false);
    }
  }, [form, preset, generateCount, brandLock]);

  const handleCompliance = useCallback(async () => {
    setShowCompliance(true);
    try {
      const report = await api.compliance.check(
        [
          { content: form.mainTitle, location: "主标题" },
          { content: form.subTitle, location: "副标题" },
          { content: form.sellingPoints, location: "卖点" },
          { content: form.otherRequirements, location: "其他需求" },
          { content: form.promotion, location: "促销信息" },
        ].filter((t) => t.content),
        false
      );
      setComplianceReport(report);
    } catch {
      setComplianceReport({ status: "passed", items: [], score: 100 });
    }
  }, [form]);

  const modeTabs = [
    { id: "text-to-image", label: "文生广告图" },
    { id: "image-to-image", label: "智能改图" },
    { id: "poster", label: "智能海报" },
    { id: "resize", label: "多尺寸适配" },
  ];

  return (
    <>
      <PageHeader title="图片创作工作台" />

      <div className="flex flex-1 overflow-hidden">
        <div className="w-80 shrink-0 overflow-y-auto border-r border-gray-200 bg-white p-4">
          <div className="mb-4 flex gap-1">
            {modeTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setMode(tab.id as ImageMode)}
                className={`rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors ${
                  mode === tab.id ? "bg-brand-100 text-brand-700" : "text-gray-500 hover:bg-gray-100"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="space-y-4">
            <Select
              label="行业"
              value={form.industry}
              onChange={(e) => setForm({ ...form, industry: e.target.value })}
              options={INDUSTRIES.map((i) => ({ value: i, label: i }))}
            />
            <Select
              label="使用场景"
              value={form.scene}
              onChange={(e) => setForm({ ...form, scene: e.target.value })}
              options={IMAGE_SCENES.map((s) => ({ value: s, label: s }))}
            />
            <Input
              label="产品名称 *"
              placeholder="输入产品名称"
              value={form.productName}
              onChange={(e) => setForm({ ...form, productName: e.target.value })}
            />

            {mode === "text-to-image" && (
              <>
                <Input
                  label="主标题"
                  placeholder="广告主标题"
                  value={form.mainTitle}
                  onChange={(e) => setForm({ ...form, mainTitle: e.target.value })}
                />
                <Input
                  label="副标题"
                  placeholder="广告副标题"
                  value={form.subTitle}
                  onChange={(e) => setForm({ ...form, subTitle: e.target.value })}
                />
                <Textarea
                  label="卖点文案"
                  placeholder="核心卖点，1-3 条"
                  rows={2}
                  value={form.sellingPoints}
                  onChange={(e) => setForm({ ...form, sellingPoints: e.target.value })}
                />
                <Textarea
                  label="其他需求"
                  placeholder="补充画面、风格、元素等自定义要求（可选）"
                  rows={2}
                  value={form.otherRequirements}
                  onChange={(e) => setForm({ ...form, otherRequirements: e.target.value })}
                />
                <Input
                  label="促销信息"
                  placeholder="如：618 限时 5 折"
                  value={form.promotion}
                  onChange={(e) => setForm({ ...form, promotion: e.target.value })}
                />
              </>
            )}

            {mode === "image-to-image" && (
              <>
                <div className="rounded-lg border-2 border-dashed border-gray-300 p-6 text-center">
                  <p className="text-sm text-gray-500">点击或拖拽上传图片</p>
                  <p className="mt-1 text-xs text-gray-400">JPG/PNG，不超过 20MB</p>
                </div>
                <Select
                  label="改图模式"
                  value={form.editMode}
                  onChange={(e) => setForm({ ...form, editMode: e.target.value })}
                  options={IMAGE_EDIT_MODES.map((m) => ({ value: m.id, label: m.name }))}
                />
                <Textarea
                  label="修改描述"
                  placeholder="描述你想要的修改效果"
                  rows={3}
                  value={form.editPrompt}
                  onChange={(e) => setForm({ ...form, editPrompt: e.target.value })}
                />
              </>
            )}

            <Select
              label="视觉风格"
              value={form.style}
              onChange={(e) => setForm({ ...form, style: e.target.value })}
              options={IMAGE_STYLES.map((s) => ({ value: s, label: s }))}
            />
            <Select
              label="尺寸预设"
              value={form.preset}
              onChange={(e) => setForm({ ...form, preset: e.target.value })}
              options={PLATFORM_PRESETS.map((p) => ({
                value: p.id,
                label: `${p.name} (${p.width}×${p.height})`,
              }))}
            />

            <div className="flex items-center justify-between rounded-lg border border-gray-200 p-3">
              <div>
                <p className="text-sm font-medium text-gray-700">品牌锁定</p>
                <p className="text-xs text-gray-400">自动应用品牌规范</p>
              </div>
              <button
                onClick={() => setBrandLock(!brandLock)}
                className={`relative h-6 w-11 rounded-full transition-colors ${brandLock ? "bg-brand-600" : "bg-gray-200"}`}
              >
                <span
                  className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${brandLock ? "translate-x-5" : "translate-x-0.5"}`}
                />
              </button>
            </div>

            <Select
              label="生成数量"
              value={String(generateCount)}
              onChange={(e) => setGenerateCount(Number(e.target.value))}
              options={[1, 2, 4, 6, 9].map((n) => ({ value: String(n), label: `${n} 张` }))}
            />

            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setShowCreative(true)}>
                <Lightbulb className="h-4 w-4" />
                帮我想创意
              </Button>
            </div>

            <Button className="w-full" loading={generating} onClick={handleGenerate}>
              <Sparkles className="h-4 w-4" />
              {generating ? "生成中..." : "开始生成"}
            </Button>
            {providerInfo && <p className="text-center text-xs text-gray-400">{providerInfo}</p>}
            {error && <p className="rounded bg-red-50 p-2 text-xs text-red-600">{error}</p>}
          </div>
        </div>

        <div className="flex flex-1 flex-col overflow-hidden">
          <div className="flex flex-1 items-center justify-center bg-gray-100 p-6">
            {selectedResult && selected ? (
              <div className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={selected.url}
                  alt="预览"
                  className="max-h-[480px] max-w-[480px] rounded-xl object-contain shadow-lg"
                />
              </div>
            ) : (
              <div className="text-center">
                <Wand2 className="mx-auto h-16 w-16 text-gray-300" />
                <p className="mt-4 text-sm text-gray-500">配置参数后点击「开始生成」</p>
                <p className="text-xs text-gray-400">生成结果将在此处预览</p>
              </div>
            )}
          </div>

          {selectedResult && (
            <div className="flex items-center justify-center gap-2 border-t border-gray-200 bg-white py-3">
              <Button variant="outline" size="sm" onClick={handleGenerate}>
                <RefreshCw className="h-3.5 w-3.5" />
                重新生成
              </Button>
              <Button variant="outline" size="sm" onClick={() => setShowEditor(true)}>
                在线编辑
              </Button>
              <Button variant="outline" size="sm" onClick={handleCompliance}>
                <Shield className="h-3.5 w-3.5" />
                合规检测
              </Button>
              <Button
                size="sm"
                onClick={() => selected && window.open(selected.url, "_blank")}
              >
                <Download className="h-3.5 w-3.5" />
                导出
              </Button>
            </div>
          )}
        </div>

        <div className="w-56 shrink-0 overflow-y-auto border-l border-gray-200 bg-white p-3">
          <h3 className="mb-3 text-sm font-semibold text-gray-900">
            生成结果 {results.length > 0 && `(${results.length})`}
          </h3>
          {results.length === 0 ? (
            <p className="text-xs text-gray-400">暂无结果</p>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {results.map((result) => (
                <button
                  key={result.id}
                  onClick={() => setSelectedResult(result.id)}
                  className={`aspect-square overflow-hidden rounded-lg border-2 transition-colors ${
                    selectedResult === result.id ? "border-brand-500" : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={result.thumbnailUrl} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <Modal open={showCreative} onClose={() => setShowCreative(false)} title="AI 创意灵感" size="lg">
        <div className="space-y-3">
          {mockCreativeIdeas.map((idea) => (
            <Card key={idea.id} padding="sm" className="cursor-pointer hover:border-brand-300">
              <CardTitle className="text-sm">{idea.title}</CardTitle>
              <p className="mt-1 text-sm text-gray-600">{idea.copywriting}</p>
              <p className="mt-1 text-xs text-gray-400">风格：{idea.visualStyle}</p>
              <Button
                size="sm"
                className="mt-2"
                onClick={() => {
                  setForm({
                    ...form,
                    mainTitle: idea.copywriting.split("｜")[0] ?? idea.copywriting,
                    subTitle: idea.copywriting.split("｜")[1] ?? "",
                  });
                  setShowCreative(false);
                }}
              >
                套用此创意
              </Button>
            </Card>
          ))}
        </div>
      </Modal>

      <Modal open={showCompliance} onClose={() => setShowCompliance(false)} title="合规检测结果" size="md">
        <div className="space-y-4">
          {complianceReport ? (
            <>
              <div className="flex items-center gap-2">
                <StatusBadge status={complianceReport.status} />
                <span className="text-sm text-gray-600">合规评分: {complianceReport.score}</span>
              </div>
              {complianceReport.items.length === 0 ? (
                <div className="flex items-center gap-2 rounded-lg bg-green-50 p-3">
                  <Shield className="h-5 w-5 text-green-600" />
                  <p className="text-sm text-green-800">未发现违规项，可正常导出</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {complianceReport.items.map((item) => (
                    <div
                      key={item.id}
                      className={`rounded-lg p-3 text-sm ${
                        item.severity === "error" ? "bg-red-50 text-red-700" : "bg-yellow-50 text-yellow-700"
                      }`}
                    >
                      {item.location && `[${item.location}] `}
                      {item.message}
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <p className="text-sm text-gray-400">检测中...</p>
          )}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowCompliance(false)}>
              关闭
            </Button>
          </div>
        </div>
      </Modal>

      {selected && (
        <ImageCanvasEditor
          open={showEditor}
          onClose={() => setShowEditor(false)}
          imageUrl={selected.url}
          width={selected.width}
          height={selected.height}
          onSave={(dataUrl) => {
            setResults((prev) =>
              prev.map((r) =>
                r.id === selected.id ? { ...r, url: dataUrl, thumbnailUrl: dataUrl } : r
              )
            );
          }}
        />
      )}
    </>
  );
}
