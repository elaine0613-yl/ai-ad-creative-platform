"use client";

import { Button } from "@/components/ui/Button";
import { CampaignConfirmPanel } from "@/components/create/CampaignConfirmPanel";
import { api } from "@/lib/api/client";
import { buildMockCampaignPreview } from "@/lib/campaign/mock-preview";
import type { CampaignSnapshot } from "@/lib/campaign/types";
import type { MaterialType } from "@/lib/types";
import { cn } from "@/lib/utils";
import {
  Bot,
  Download,
  Loader2,
  Send,
  Shield,
  User,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

interface SmartCreationFlowProps {
  materialType: MaterialType;
  title: string;
  subtitle: string;
  placeholder: string;
  examplePrompt: string;
}

export function SmartCreationFlow({
  materialType,
  title,
  subtitle,
  placeholder,
  examplePrompt,
}: SmartCreationFlowProps) {
  const [campaign, setCampaign] = useState<CampaignSnapshot | null>(null);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const previewCampaign = useMemo(
    () => buildMockCampaignPreview(materialType),
    [materialType]
  );

  const selectedSkuId =
    campaign?.selectedSkuId ?? campaign?.recommendations[0]?.sku.id ?? null;

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
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
        /* ignore */
      }
    }, 3000);
  }, []);

  useEffect(() => () => {
    if (pollRef.current) clearInterval(pollRef.current);
  }, []);

  const startNew = async (text: string) => {
    setLoading(true);
    try {
      const { campaign: c } = await api.campaigns.create(text, materialType);
      setCampaign(c);
      setPreviewUrl(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");

    if (!campaign) {
      await startNew(text);
      return;
    }

    if (campaign.stage === "confirm") {
      setLoading(true);
      try {
        const { campaign: c } = await api.campaigns.action(campaign.id, "tweak", {
          message: text,
        });
        setCampaign(c);
      } finally {
        setLoading(false);
      }
      return;
    }

    if (campaign.stage === "completed" || campaign.stage === "rejected") {
      await startNew(text);
    }
  };

  const selectSku = async (skuId: string) => {
    if (!campaign || loading) return;
    setLoading(true);
    try {
      const { campaign: c } = await api.campaigns.action(campaign.id, "select_sku", {
        skuId,
      });
      setCampaign(c);
    } finally {
      setLoading(false);
    }
  };

  const updateField = async (fieldKey: string, value: string) => {
    if (!campaign) return;
    const { campaign: c } = await api.campaigns.action(campaign.id, "update_fields", {
      fields: { [fieldKey]: value },
    });
    setCampaign(c);
  };

  const confirmAndGenerate = async () => {
    if (!campaign || !selectedSkuId || loading) return;
    setLoading(true);
    try {
      const { campaign: c } = await api.campaigns.action(
        campaign.id,
        "confirm_and_generate",
        { skuId: selectedSkuId }
      );
      setCampaign(c);
      const gen = await api.campaigns.generate(c.id);
      setCampaign(gen.campaign);
      if (gen.material?.url) setPreviewUrl(gen.material.url);
      pollAudit(c.id);
    } catch (e) {
      alert(e instanceof Error ? e.message : "生成失败");
    } finally {
      setLoading(false);
    }
  };

  const canChat =
    !campaign ||
    campaign.stage === "confirm" ||
    campaign.stage === "completed" ||
    campaign.stage === "rejected";

  const busy =
    loading ||
    campaign?.stage === "generating" ||
    campaign?.stage === "external_review";

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* 顶栏 */}
      <div className="shrink-0 border-b border-gray-200 bg-white px-6 py-4">
        <h1 className="text-xl font-semibold tracking-tight text-gray-900">{title}</h1>
        <p className="mt-1 max-w-3xl text-sm leading-relaxed text-gray-500">{subtitle}</p>
      </div>

      <div className="flex min-h-0 flex-1 overflow-hidden">
        {/* 左：对话（Agent 融入） */}
        <div className="flex w-[380px] shrink-0 flex-col border-r border-gray-200 bg-white">
          <div className="flex-1 space-y-3 overflow-y-auto p-4">
            {!campaign && (
              <div className="rounded-xl bg-gray-50 p-3 text-xs leading-relaxed text-gray-500">
                <span className="font-medium text-gray-700">示例：</span>
                {examplePrompt}
              </div>
            )}

            {campaign?.messages.map((msg) => (
              <div
                key={msg.id}
                className={cn("flex gap-2", msg.role === "user" && "flex-row-reverse")}
              >
                <div
                  className={cn(
                    "flex h-7 w-7 shrink-0 items-center justify-center rounded-full",
                    msg.role === "user" ? "bg-gray-900 text-white" : "bg-brand-100 text-brand-700"
                  )}
                >
                  {msg.role === "user" ? (
                    <User className="h-3.5 w-3.5" />
                  ) : (
                    <Bot className="h-3.5 w-3.5" />
                  )}
                </div>
                <p
                  className={cn(
                    "max-w-[88%] rounded-2xl px-3 py-2 text-sm leading-relaxed",
                    msg.role === "user" ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-800"
                  )}
                >
                  {msg.content}
                </p>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          <div className="border-t border-gray-200 p-3">
            <div className="flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                disabled={!canChat || busy}
                placeholder={canChat ? placeholder : "生成与审核中…"}
                className="flex-1 rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100 disabled:bg-gray-50"
              />
              <Button onClick={handleSend} disabled={!input.trim() || !canChat || busy} loading={loading}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* 右：确认摘要 + 预览 */}
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden bg-[#f4f4f5]">
          <div className="flex flex-1 flex-col overflow-y-auto p-6">
            {!campaign && (
              <CampaignConfirmPanel
                preview
                campaign={previewCampaign}
                materialType={materialType}
                selectedSkuId={previewCampaign.selectedSkuId}
                loading={false}
                onSelectSku={() => {}}
                onUpdateField={async () => {}}
                onConfirm={() => {}}
              />
            )}

            {campaign?.stage === "confirm" && campaign.requirement && (
              <CampaignConfirmPanel
                campaign={campaign}
                materialType={materialType}
                selectedSkuId={selectedSkuId}
                loading={loading}
                onSelectSku={selectSku}
                onUpdateField={updateField}
                onConfirm={confirmAndGenerate}
              />
            )}

            {(campaign?.stage === "generating" || campaign?.stage === "external_review") && (
              <div className="flex flex-1 flex-col items-center justify-center text-center">
                <Loader2 className="h-12 w-12 animate-spin text-gray-400" />
                <p className="mt-4 text-sm font-medium text-gray-700">
                  {campaign.stage === "generating"
                    ? "AI 生成中…"
                    : "已提交巨量引擎审核…"}
                </p>
                {previewUrl && materialType === "image" && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={previewUrl}
                    alt="预览"
                    className="mt-6 max-h-64 rounded-xl shadow-lg"
                  />
                )}
              </div>
            )}

            {campaign?.stage === "completed" && (
              <div className="mx-auto flex max-w-xl flex-col items-center text-center">
                <Shield className="h-12 w-12 text-green-600" />
                <p className="mt-3 text-base font-semibold text-gray-900">巨量审核通过 · 已入库</p>
                {previewUrl && materialType === "image" && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={previewUrl}
                    alt="成品"
                    className="mt-4 max-h-80 rounded-2xl shadow-lg"
                  />
                )}
                {previewUrl && materialType === "video" && (
                  <video src={previewUrl} controls className="mt-4 max-h-80 rounded-2xl" />
                )}
                <div className="mt-4 flex gap-2">
                  {previewUrl && (
                    <Button variant="outline" size="sm" onClick={() => window.open(previewUrl, "_blank")}>
                      <Download className="h-3.5 w-3.5" />
                      下载
                    </Button>
                  )}
                  <Link href="/materials">
                    <Button size="sm">查看素材库</Button>
                  </Link>
                </div>
              </div>
            )}

            {campaign?.stage === "rejected" && (
              <div className="mx-auto max-w-xl rounded-2xl border border-red-200 bg-red-50 p-5 text-center">
                <p className="text-sm font-semibold text-red-800">巨量审核未通过</p>
                {campaign.rejectReason && (
                  <p className="mt-2 text-xs text-red-600">{campaign.rejectReason}</p>
                )}
                <p className="mt-3 text-xs text-red-500">在左侧输入修改意见，将重新开始</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
