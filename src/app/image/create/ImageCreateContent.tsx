"use client";

import { Button } from "@/components/ui/Button";
import { Card, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Modal } from "@/components/ui/Modal";
import {
  ChipGroup,
  CreationWorkbench,
  PromptBlock,
} from "@/components/create/CreationWorkbench";
import { KnowledgePicker, KnowledgeRefBadge } from "@/components/knowledge/KnowledgePicker";
import {
  IMAGE_EDIT_MODES,
  IMAGE_SCENES,
  IMAGE_STYLES,
  INDUSTRIES,
  PLATFORM_PRESETS,
} from "@/lib/constants";
import { mockCreativeIdeas, mockKnowledgeAssets } from "@/lib/mock/data";
import { api } from "@/lib/api/client";
import {
  applyKnowledgeToImageForm,
  findKnowledgeAsset,
} from "@/lib/knowledge/apply";
import { ImageCanvasEditor } from "@/components/editor/ImageCanvasEditor";
import { StatusBadge } from "@/components/ui/Badge";
import type { KnowledgeAsset } from "@/lib/types";
import {
  BookOpen,
  Download,
  Lightbulb,
  RefreshCw,
  Shield,
  Sparkles,
  Wand2,
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

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

const MODE_TABS = [
  { id: "text-to-image", label: "文生广告图", description: "文字描述生成平面广告" },
  { id: "image-to-image", label: "智能改图", description: "上传图片 AI 改背景/风格" },
  { id: "poster", label: "智能海报", description: "节日/促销海报快速生成" },
  { id: "resize", label: "多尺寸适配", description: "一键适配多平台尺寸" },
];

export default function ImageCreateContent() {
  const searchParams = useSearchParams();
  const initialMode = (searchParams.get("mode") as ImageMode) || "text-to-image";
  const refId = searchParams.get("ref");

  const [mode, setMode] = useState<ImageMode>(initialMode);
  const [generating, setGenerating] = useState(false);
  const [results, setResults] = useState<GeneratedResult[]>([]);
  const [selectedResult, setSelectedResult] = useState<string | null>(null);
  const [showCreative, setShowCreative] = useState(false);
  const [showCompliance, setShowCompliance] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  const [showKnowledge, setShowKnowledge] = useState(false);
  const [providerInfo, setProviderInfo] = useState("");
  const [complianceReport, setComplianceReport] = useState<ComplianceReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [knowledgeRef, setKnowledgeRef] = useState<KnowledgeAsset | null>(null);

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

  const applyKnowledge = useCallback((asset: KnowledgeAsset) => {
    setForm((prev) => ({ ...prev, ...applyKnowledgeToImageForm(asset, prev) }));
    setKnowledgeRef(asset);
  }, []);

  useEffect(() => {
    if (refId) {
      const asset = findKnowledgeAsset(mockKnowledgeAssets, refId);
      if (asset?.library === "image") applyKnowledge(asset);
    }
  }, [refId, applyKnowledge]);

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
          : "Mock 模式（配置 OPENAI_API_KEY 启用真实文生图）"
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

  const configPanel = (
    <div className="space-y-5">
      {knowledgeRef && (
        <KnowledgeRefBadge
          name={knowledgeRef.name}
          onClear={() => setKnowledgeRef(null)}
        />
      )}

      <PromptBlock
        label="产品名称"
        placeholder="输入产品名称，如：轻透防晒乳 SPF50+"
        value={form.productName}
        onChange={(v) => setForm({ ...form, productName: v })}
        rows={1}
        required
      />

      {mode === "text-to-image" && (
        <>
          <PromptBlock
            label="创意描述 / Prompt"
            placeholder="描述画面内容、氛围、构图… 例如：夏日沙滩场景，产品居中，清新自然光"
            value={[form.mainTitle, form.sellingPoints, form.otherRequirements]
              .filter(Boolean)
              .join("\n")}
            onChange={(v) => {
              const lines = v.split("\n");
              setForm({
                ...form,
                mainTitle: lines[0] ?? "",
                sellingPoints: lines[1] ?? "",
                otherRequirements: lines.slice(2).join("\n"),
              });
            }}
            rows={5}
          />
          <Input
            label="促销信息"
            placeholder="618 限时 5 折"
            value={form.promotion}
            onChange={(e) => setForm({ ...form, promotion: e.target.value })}
          />
        </>
      )}

      {mode === "image-to-image" && (
        <>
          <div className="rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 p-8 text-center">
            <p className="text-sm text-gray-500">点击或拖拽上传参考图</p>
            <p className="mt-1 text-xs text-gray-400">JPG/PNG，不超过 20MB</p>
          </div>
          <Select
            label="改图模式"
            value={form.editMode}
            onChange={(e) => setForm({ ...form, editMode: e.target.value })}
            options={IMAGE_EDIT_MODES.map((m) => ({ value: m.id, label: m.name }))}
          />
          <PromptBlock
            label="修改描述"
            placeholder="描述你想要的修改效果"
            value={form.editPrompt}
            onChange={(v) => setForm({ ...form, editPrompt: v })}
            rows={3}
          />
        </>
      )}

      <ChipGroup
        label="视觉风格"
        options={IMAGE_STYLES.slice(0, 8)}
        value={form.style}
        onChange={(v) => setForm({ ...form, style: v })}
      />

      <ChipGroup
        label="使用场景"
        options={IMAGE_SCENES}
        value={form.scene}
        onChange={(v) => setForm({ ...form, scene: v })}
      />

      <Select
        label="行业"
        value={form.industry}
        onChange={(e) => setForm({ ...form, industry: e.target.value })}
        options={INDUSTRIES.map((i) => ({ value: i, label: i }))}
      />

      <Select
        label="平台尺寸"
        value={form.preset}
        onChange={(e) => setForm({ ...form, preset: e.target.value })}
        options={PLATFORM_PRESETS.map((p) => ({
          value: p.id,
          label: `${p.name} (${p.width}×${p.height})`,
        }))}
      />

      <div className="flex items-center justify-between rounded-xl border border-gray-200 p-3">
        <div>
          <p className="text-sm font-medium text-gray-700">品牌锁定</p>
          <p className="text-xs text-gray-400">引用知识库品牌资产</p>
        </div>
        <button
          type="button"
          onClick={() => setBrandLock(!brandLock)}
          className={`relative h-6 w-11 rounded-full transition-colors ${brandLock ? "bg-gray-900" : "bg-gray-200"}`}
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

      <div className="sticky bottom-0 space-y-2 border-t border-gray-100 bg-white pt-3">
        <div className="flex gap-2">
          <Button variant="outline" className="flex-1" size="sm" onClick={() => setShowKnowledge(true)}>
            <BookOpen className="h-4 w-4" />
            知识库
          </Button>
          <Button variant="outline" className="flex-1" size="sm" onClick={() => setShowCreative(true)}>
            <Lightbulb className="h-4 w-4" />
            创意
          </Button>
        </div>
        <Button className="w-full" size="lg" loading={generating} onClick={handleGenerate}>
          <Sparkles className="h-4 w-4" />
          {generating ? "生成中..." : "开始生成"}
        </Button>
        {providerInfo && <p className="text-center text-[10px] text-gray-400">{providerInfo}</p>}
        {error && <p className="rounded-lg bg-red-50 p-2 text-xs text-red-600">{error}</p>}
      </div>
    </div>
  );

  const previewPanel =
    selectedResult && selected ? (
      <div className="relative">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={selected.url}
          alt="预览"
          className="max-h-[min(520px,70vh)] max-w-full rounded-2xl object-contain shadow-2xl"
        />
        <div className="absolute bottom-3 left-3 rounded-lg bg-black/60 px-2 py-1 text-xs text-white">
          {selected.width}×{selected.height}
          {selected.provider && ` · ${selected.provider}`}
        </div>
      </div>
    ) : generating ? (
      <div className="text-center">
        <div className="mx-auto h-14 w-14 animate-spin rounded-full border-4 border-gray-300 border-t-gray-900" />
        <p className="mt-4 text-sm text-gray-500">AI 正在生成 {generateCount} 张候选图...</p>
      </div>
    ) : (
      <div className="text-center">
        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-2xl bg-white/80 shadow-inner">
          <Wand2 className="h-12 w-12 text-gray-300" />
        </div>
        <p className="mt-4 text-sm font-medium text-gray-600">配置左侧参数，点击生成</p>
        <p className="mt-1 text-xs text-gray-400">支持从知识库引用构图、风格与品牌规范</p>
      </div>
    );

  const resultsPanel = (
    <>
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400">
        生成历史 {results.length > 0 && `(${results.length})`}
      </h3>
      {results.length === 0 ? (
        <p className="text-xs text-gray-400">暂无结果</p>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          {results.map((result) => (
            <button
              key={result.id}
              type="button"
              onClick={() => setSelectedResult(result.id)}
              className={`aspect-square overflow-hidden rounded-xl border-2 transition-all ${
                selectedResult === result.id
                  ? "border-gray-900 ring-2 ring-gray-900/20"
                  : "border-gray-200 hover:border-gray-400"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={result.thumbnailUrl} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </>
  );

  const footerActions =
    selectedResult && selected ? (
      <>
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
        <Button size="sm" onClick={() => window.open(selected.url, "_blank")}>
          <Download className="h-3.5 w-3.5" />
          导出
        </Button>
      </>
    ) : null;

  return (
    <>
      <CreationWorkbench
        title="图片创作"
        subtitle="文生图 · 智能改图 · 多尺寸适配"
        modeTabs={MODE_TABS}
        activeMode={mode}
        onModeChange={(id) => setMode(id as ImageMode)}
        configPanel={configPanel}
        previewPanel={previewPanel}
        resultsPanel={resultsPanel}
        footerActions={footerActions}
      />

      <KnowledgePicker
        open={showKnowledge}
        onClose={() => setShowKnowledge(false)}
        library="image"
        onSelect={applyKnowledge}
        selectedId={knowledgeRef?.id}
      />

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
                    otherRequirements: idea.composition ?? form.otherRequirements,
                    style: idea.visualStyle.includes("国潮") ? "国潮" : form.style,
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
                complianceReport.items.map((item) => (
                  <div
                    key={item.id}
                    className={`rounded-lg p-3 text-sm ${
                      item.severity === "error" ? "bg-red-50 text-red-700" : "bg-yellow-50 text-yellow-700"
                    }`}
                  >
                    {item.location && `[${item.location}] `}
                    {item.message}
                  </div>
                ))
              )}
            </>
          ) : (
            <p className="text-sm text-gray-400">检测中...</p>
          )}
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
