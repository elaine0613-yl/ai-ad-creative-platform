"use client";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { api } from "@/lib/api/client";
import type { CampaignSnapshot, ProductRecommendation } from "@/lib/campaign/types";
import { cn } from "@/lib/utils";
import {
  Bot,
  Check,
  Loader2,
  Package,
  Send,
  Shield,
  Sparkles,
  User,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

const STAGE_LABELS: Record<string, string> = {
  intent: "描述诉求",
  requirement_review: "确认需求",
  product_review: "确认选品",
  creative_review: "确认创意",
  generating: "生成素材",
  external_review: "巨量审核",
  completed: "已入库",
  rejected: "审核驳回",
};

export default function AgentContent() {
  const [campaign, setCampaign] = useState<CampaignSnapshot | null>(null);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedSkuId, setSelectedSkuId] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [campaign?.messages]);

  const pollAudit = useCallback((id: string) => {
    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = setInterval(async () => {
      try {
        const res = await api.campaigns.auditStatus(id);
        if (res.status === "approved" || res.status === "rejected") {
          if (pollRef.current) clearInterval(pollRef.current);
          if (res.campaign) setCampaign(res.campaign);
        }
      } catch {
        /* ignore poll errors */
      }
    }, 3000);
  }, []);

  useEffect(() => () => {
    if (pollRef.current) clearInterval(pollRef.current);
  }, []);

  const sendIntent = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setLoading(true);
    setInput("");
    try {
      const { campaign: c } = await api.campaigns.create(text);
      setCampaign(c);
      setSelectedSkuId(null);
    } catch (e) {
      alert(e instanceof Error ? e.message : "发送失败");
    } finally {
      setLoading(false);
    }
  };

  const runAction = async (action: string, payload?: Record<string, unknown>) => {
    if (!campaign || loading) return;
    setLoading(true);
    try {
      const { campaign: c } = await api.campaigns.action(campaign.id, action, payload);
      setCampaign(c);

      if (action === "confirm_creative") {
        const gen = await api.campaigns.generate(c.id);
        setCampaign(gen.campaign);
        pollAudit(c.id);
      }
    } catch (e) {
      alert(e instanceof Error ? e.message : "操作失败");
    } finally {
      setLoading(false);
    }
  };

  const sendTweak = async () => {
    const text = input.trim();
    if (!text || !campaign || campaign.stage !== "creative_review") return;
    setLoading(true);
    setInput("");
    try {
      const { campaign: c } = await api.campaigns.action(campaign.id, "tweak_creative", { message: text });
      setCampaign(c);
    } catch (e) {
      alert(e instanceof Error ? e.message : "发送失败");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = () => {
    if (!campaign) sendIntent();
    else if (campaign.stage === "creative_review") sendTweak();
  };

  const stagePanel = campaign && (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-xs text-gray-500">
        <span className="rounded-full bg-gray-900 px-2.5 py-0.5 font-medium text-white">
          {STAGE_LABELS[campaign.stage] ?? campaign.stage}
        </span>
        <span>{campaign.requirement?.templateName}</span>
      </div>

      {campaign.stage === "requirement_review" && campaign.requirement && (
        <Card className="p-4">
          <h3 className="mb-3 text-sm font-semibold text-gray-900">需求单</h3>
          <dl className="space-y-2 text-sm">
            {[
              ["模板", campaign.requirement.templateName],
              ["平台", campaign.requirement.platform],
              ["行业", campaign.requirement.industry],
              ["素材类型", campaign.requirement.materialType === "video" ? "视频" : "图片"],
              ["产品关键词", campaign.requirement.productKeywords],
              ["卖点", campaign.requirement.sellingPoints],
              ["促销", campaign.requirement.promotion ?? "—"],
              ["价格带", campaign.requirement.priceRange ?? "—"],
            ].map(([k, v]) => (
              <div key={k} className="flex gap-2">
                <dt className="w-20 shrink-0 text-gray-400">{k}</dt>
                <dd className="text-gray-800">{v}</dd>
              </div>
            ))}
          </dl>
          <Button className="mt-4 w-full" onClick={() => runAction("confirm_requirement")} loading={loading}>
            <Check className="h-4 w-4" />
            需求确认 OK
          </Button>
        </Card>
      )}

      {campaign.stage === "product_review" && (
        <Card className="p-4">
          <h3 className="mb-1 text-sm font-semibold text-gray-900">智能选品推荐</h3>
          <p className="mb-3 text-xs text-gray-500">基于模板规则 + 内部 SKU 表匹配</p>
          <div className="space-y-2">
            {campaign.recommendations.map((rec: ProductRecommendation) => (
              <button
                key={rec.sku.id}
                type="button"
                onClick={() => setSelectedSkuId(rec.sku.id)}
                className={cn(
                  "w-full rounded-xl border p-3 text-left transition-colors",
                  selectedSkuId === rec.sku.id
                    ? "border-gray-900 bg-gray-50 ring-1 ring-gray-900"
                    : "border-gray-200 hover:border-gray-300"
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{rec.sku.name}</p>
                    <p className="text-xs text-gray-500">
                      ¥{rec.sku.price} · {rec.sku.category} · {rec.sku.skuCode}
                    </p>
                  </div>
                  <span className="shrink-0 rounded bg-brand-50 px-1.5 py-0.5 text-[10px] text-brand-700">
                    匹配 {rec.score}
                  </span>
                </div>
                <p className="mt-1.5 text-xs text-gray-500">{rec.reason}</p>
              </button>
            ))}
          </div>
          <Button
            className="mt-4 w-full"
            disabled={!selectedSkuId}
            loading={loading}
            onClick={() => selectedSkuId && runAction("confirm_product", { skuId: selectedSkuId })}
          >
            <Package className="h-4 w-4" />
            选品确认 OK
          </Button>
        </Card>
      )}

      {campaign.stage === "creative_review" && campaign.creative && (
        <Card className="p-4">
          <h3 className="mb-3 text-sm font-semibold text-gray-900">创意方案</h3>
          <dl className="space-y-2 text-sm">
            {[
              ["封题/封面", campaign.creative.coverTitle],
              ["BGM", campaign.creative.bgm],
              ["行动点 CTA", campaign.creative.cta],
              ["配音", campaign.creative.voiceover ? "开启" : "关闭"],
              ["字幕", campaign.creative.subtitle ? "开启" : "关闭"],
              ["分镜", campaign.creative.storyboard ?? "—"],
              ["视觉", campaign.creative.visualStyle ?? "—"],
            ].map(([k, v]) => (
              <div key={k} className="flex gap-2">
                <dt className="w-20 shrink-0 text-gray-400">{k}</dt>
                <dd className="text-gray-800">{v}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-3 text-xs text-gray-400">
            在左侧对话输入微调，如「BGM 再快一点」「CTA 改成领券」
          </p>
          <Button className="mt-3 w-full" onClick={() => runAction("confirm_creative")} loading={loading}>
            <Sparkles className="h-4 w-4" />
            创意确认 OK · 开始生成
          </Button>
        </Card>
      )}

      {(campaign.stage === "generating" || campaign.stage === "external_review") && (
        <Card className="flex flex-col items-center p-8 text-center">
          <Loader2 className="h-10 w-10 animate-spin text-gray-400" />
          <p className="mt-4 text-sm font-medium text-gray-700">
            {campaign.stage === "generating" ? "大模型生成中…" : "提交巨量引擎审核中…"}
          </p>
          <p className="mt-1 text-xs text-gray-400">通常需要数秒至一分钟</p>
        </Card>
      )}

      {campaign.stage === "completed" && (
        <Card className="p-4 text-center">
          <Shield className="mx-auto h-10 w-10 text-green-600" />
          <p className="mt-3 text-sm font-semibold text-gray-900">巨量审核已通过 · 已入库</p>
          <Link href="/materials" className="mt-3 inline-block text-sm text-brand-600 hover:underline">
            前往素材库查看 →
          </Link>
        </Card>
      )}

      {campaign.stage === "rejected" && (
        <Card className="border-red-200 bg-red-50 p-4">
          <p className="text-sm font-semibold text-red-800">巨量审核未通过</p>
          {campaign.rejectReason && (
            <p className="mt-2 text-xs text-red-600">{campaign.rejectReason}</p>
          )}
          <Button
            variant="outline"
            className="mt-3 w-full"
            onClick={() => runAction("confirm_creative")}
          >
            调整后重新生成
          </Button>
        </Card>
      )}
    </div>
  );

  return (
    <div className="flex flex-1 overflow-hidden">
      {/* 对话区 */}
      <div className="flex w-[420px] shrink-0 flex-col border-r border-gray-200 bg-white">
        <div className="border-b border-gray-200 px-4 py-3">
          <h1 className="text-base font-semibold text-gray-900">Agent 工作台</h1>
          <p className="text-xs text-gray-500">对话驱动 · 模板拆解 · 选品 · 创意 · 巨量审核</p>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto p-4">
          {!campaign && (
            <div className="rounded-xl bg-gray-50 p-4 text-sm text-gray-600">
              <p className="font-medium text-gray-800">试试这样说：</p>
              <p className="mt-2 text-xs leading-relaxed text-gray-500">
                「618 做 sunscreen 的抖音 15 秒视频，强调轻薄不闷痘，价格 150 左右」
              </p>
            </div>
          )}

          {campaign?.messages.map((msg) => (
            <div
              key={msg.id}
              className={cn("flex gap-2", msg.role === "user" ? "flex-row-reverse" : "")}
            >
              <div
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                  msg.role === "user" ? "bg-gray-900 text-white" : "bg-brand-100 text-brand-700"
                )}
              >
                {msg.role === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
              </div>
              <div
                className={cn(
                  "max-w-[85%] rounded-2xl px-3 py-2 text-sm",
                  msg.role === "user"
                    ? "bg-gray-900 text-white"
                    : "bg-gray-100 text-gray-800"
                )}
              >
                {msg.content}
              </div>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>

        <div className="border-t border-gray-200 p-3">
          <div className="flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSubmit()}
              placeholder={
                !campaign
                  ? "描述您的投放诉求…"
                  : campaign.stage === "creative_review"
                    ? "微调 BGM / CTA / 封题…"
                    : "请先确认右侧卡片"
              }
              disabled={
                loading ||
                (!!campaign &&
                  !["creative_review"].includes(campaign.stage) &&
                  campaign.stage !== "intent")
              }
              className="flex-1 rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
            />
            <Button
              onClick={handleSubmit}
              loading={loading}
              disabled={
                !input.trim() ||
                loading ||
                (!!campaign && !["creative_review"].includes(campaign.stage))
              }
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* 确认卡片区 */}
      <div className="flex-1 overflow-y-auto bg-[#f4f4f5] p-6">
        <div className="mx-auto max-w-lg">
          {!campaign ? (
            <div className="flex h-full min-h-[400px] flex-col items-center justify-center text-center text-gray-400">
              <Bot className="h-16 w-16 text-gray-300" />
              <p className="mt-4 text-sm">在左侧输入诉求，Agent 将按模板拆解需求</p>
            </div>
          ) : (
            stagePanel
          )}
        </div>
      </div>
    </div>
  );
}
