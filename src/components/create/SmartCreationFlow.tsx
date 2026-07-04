"use client";

import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { CampaignConfirmPanel } from "@/components/create/CampaignConfirmPanel";
import { CreativeGenerationPanel } from "@/components/create/CreativeGenerationPanel";
import { NativeCreativePlanPanel } from "@/components/create/NativeCreativePlanPanel";
import { NativeVideoCreativePlanPanel } from "@/components/create/NativeVideoCreativePlanPanel";
import { PreviewSubmitPanel } from "@/components/create/PreviewSubmitPanel";
import { RequirementInterpretPanel } from "@/components/create/RequirementInterpretPanel";
import { SaveToLibraryDialog } from "@/components/create/SaveToLibraryDialog";
import { SmartSelectionPanel } from "@/components/create/SmartSelectionPanel";
import { StructuredConfigPanel } from "@/components/create/StructuredConfigPanel";
import { api } from "@/lib/api/client";
import {
  applyAgentToImageConfig,
  applyAgentToVideoConfig,
} from "@/lib/create/agent-to-config";
import { applyCreativePlanToConfig } from "@/lib/campaign/creative-plan";
import {
  defaultImageConfig,
  defaultVideoConfig,
  type ImageCreationConfig,
  type VideoCreationConfig,
} from "@/lib/create/config-types";
import type { LibrarySaveMode } from "@/lib/material-library/types";
import {
  buildOptimisticCampaign,
  diffFieldKeys,
} from "@/lib/campaign/live-sync";
import { buildMockCampaignPreview } from "@/lib/campaign/mock-preview";
import { agentReplyForStage, newMessage } from "@/lib/campaign/parser";
import {
  buildAgentParseReply,
  buildPartialDisplayRequirement,
  CRITICAL_INTERPRET_KEYS,
  interpretationToRequirement,
  parseRequirementInterpretation,
  type InterpretFieldKey,
  type InterpretParseResult,
  type RequirementInterpretation,
} from "@/lib/campaign/requirement-interpretation";
import { buildRecommendations } from "@/lib/campaign/service";
import type { AgentMessage, CampaignSnapshot, ImageCreativePlanFields, RequirementBrief, VideoCreativePlanFields } from "@/lib/campaign/types";
import {
  IMAGE_AGENT_INTRO,
  IMAGE_CREATIVE_LOADING_HINT,
} from "@/lib/campaign/image-native-flow";
import {
  VIDEO_AGENT_INTRO,
  VIDEO_CREATIVE_LOADING_HINT,
} from "@/lib/campaign/video-native-flow";
import { detectChatIntent, getSendDisabledReason, isChatActiveStage, isFlowLockedStage } from "@/lib/campaign/workflow";
import { INTERNAL_SKUS } from "@/lib/mock/skus";
import type { MaterialType } from "@/lib/types";
import { AgentMessageContent } from "@/components/tasks/TaskUi";
import { cn } from "@/lib/utils";
import { Bot, Download, Loader2, Package, Send, Shield, Sparkles, User } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { flushSync } from "react-dom";

interface SmartCreationFlowProps {
  materialType: MaterialType;
  mode?: "default" | "image-native" | "video-native";
  /** 由外层页面提供顶栏时隐藏内部标题区 */
  suppressHeader?: boolean;
  /** 外层顶栏高度，用于左侧对话区 sticky 偏移 */
  layoutTopOffset?: number;
  title: string;
  subtitle: string;
  placeholder: string;
  examplePrompt: string;
}

const BASIC_AGENT_KEYS = new Set([
  "channel",
  "media",
  "adTheme",
  "campaignGoal",
  "targetAudience",
  "userPainPoints",
  "coreBenefit",
  "visualStyle",
  "contentTone",
  "taskName",
  "landingType",
  "coreSummary",
  "specialConstraints",
]);

const SELECTION_AGENT_KEYS = new Set([
  "selectionCount",
  "selectionStrategy",
  "productSelectionMethod",
  "productKeywords",
  "productDataPool",
  "pickMethod",
  "selectionCoreStrategy",
  "hasBenefitRights",
]);

function buildPreviewFromInterpretation(
  text: string,
  interpretation: RequirementInterpretation,
  baseReq: RequirementBrief,
  agentFilledKeys: InterpretFieldKey[]
): CampaignSnapshot {
  const requirement = interpretationToRequirement(
    interpretation,
    baseReq,
    agentFilledKeys
  );
  return {
    id: "interpret-preview",
    stage: "confirm",
    templateId: requirement.templateId,
    userIntent: text,
    requirement,
    recommendations: [],
    selectedSkuId: null,
    selectedSku: null,
    creative: null,
    creativePlan: null,
    messages: [],
  };
}

function requirementFieldsFromInterpretation(
  interpretation: RequirementInterpretation,
  base: RequirementBrief,
  agentFilledKeys: InterpretFieldKey[]
): Record<string, string> {
  const req = interpretationToRequirement(interpretation, base, agentFilledKeys);
  const interpretToReq: Partial<Record<InterpretFieldKey, string>> = {
    taskName: "taskName",
    channel: "channel",
    media: "media",
    landingType: "landingType",
    coreSummary: "coreSummary",
    specialConstraints: "specialConstraints",
    selectionCount: "selectionCount",
    selectionStrategy: "selectionStrategy",
    productKeywords: "productKeywords",
    adTheme: "adTheme",
    campaignGoal: "campaignGoal",
    targetAudience: "targetAudience",
    userPainPoints: "userPainPoints",
    coreBenefit: "coreBenefit",
    visualStyle: "visualStyle",
    contentTone: "contentTone",
  };
  const fields: Record<string, string> = {};
  for (const key of agentFilledKeys) {
    const reqKey = interpretToReq[key];
    if (!reqKey) continue;
    const value = req[reqKey as keyof RequirementBrief];
    if (value === undefined || value === null || value === "") continue;
    fields[reqKey] = String(value);
  }
  return fields;
}

export function SmartCreationFlow({
  materialType,
  mode = "default",
  suppressHeader = false,
  layoutTopOffset = 0,
  title,
  subtitle,
  placeholder,
  examplePrompt,
}: SmartCreationFlowProps) {
  const nativeImageFlow = mode === "image-native" && materialType === "image";
  const nativeVideoFlow = mode === "video-native" && materialType === "video";
  const nativeDemoFlow = nativeImageFlow || nativeVideoFlow;
  const [campaign, setCampaign] = useState<CampaignSnapshot | null>(null);
  const [optimisticCampaign, setOptimisticCampaign] = useState<CampaignSnapshot | null>(null);
  const [interpretPreview, setInterpretPreview] = useState<CampaignSnapshot | null>(null);
  const [localRecommendations, setLocalRecommendations] = useState<
    CampaignSnapshot["recommendations"] | null
  >(null);
  const [pendingMessages, setPendingMessages] = useState<AgentMessage[]>([]);
  const [interpretation, setInterpretation] = useState<RequirementInterpretation | null>(null);
  const [interpretMissing, setInterpretMissing] = useState<InterpretFieldKey[]>([]);
  const [interpretAgentKeys, setInterpretAgentKeys] = useState<InterpretFieldKey[]>([]);
  const [canAutoFillRight, setCanAutoFillRight] = useState(false);
  const [rightAgentFilledKeys, setRightAgentFilledKeys] = useState<Set<string>>(new Set());
  const [selectionAgentFilledKeys, setSelectionAgentFilledKeys] = useState<Set<string>>(new Set());
  const [selectedSkuIds, setSelectedSkuIds] = useState<string[]>([]);
  const [inputVersion, setInputVersion] = useState(0);
  const inputDraftRef = useRef("");
  const [loading, setLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [highlightedFields, setHighlightedFields] = useState<string[]>([]);
  const [removedSkuIds, setRemovedSkuIds] = useState<string[]>([]);
  const [imageConfig, setImageConfig] = useState<ImageCreationConfig>(() => defaultImageConfig());
  const [videoConfig, setVideoConfig] = useState<VideoCreationConfig>(() => defaultVideoConfig());
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [agentFilledFields, setAgentFilledFields] = useState<string[]>([]);
  const [creativeConfigApplied, setCreativeConfigApplied] = useState(false);
  const [creativeConfirmed, setCreativeConfirmed] = useState(false);
  const [taskSubmitted, setTaskSubmitted] = useState(false);
  const [introShown, setIntroShown] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const highlightTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [headerHeight, setHeaderHeight] = useState(96);
  const [emptyInputHint, setEmptyInputHint] = useState(false);
  const [sendFeedback, setSendFeedback] = useState<string | null>(null);

  const readInputText = useCallback(() => {
    const dom = inputRef.current?.value ?? inputDraftRef.current;
    return dom.trim();
  }, []);

  const commitInputFromDom = useCallback(() => {
    const domValue = inputRef.current?.value ?? inputDraftRef.current;
    inputDraftRef.current = domValue;
    return domValue.trim();
  }, []);

  const previewCampaign = useMemo(
    () => buildMockCampaignPreview(materialType),
    [materialType]
  );

  /** 发送 Agent 后才展示解析结果；输入时不再实时填充（避免绕过对话） */
  const hasAgentInteraction = !!campaign || !!interpretPreview || pendingMessages.length > 0;

  const baseDisplayCampaign = useMemo(() => {
    if (optimisticCampaign) return optimisticCampaign;
    if (campaign && interpretation && interpretAgentKeys.length > 0 && campaign.stage === "confirm") {
      return {
        ...campaign,
        requirement: buildPartialDisplayRequirement(
          interpretation,
          campaign.requirement!,
          interpretAgentKeys
        ),
      };
    }
    if (campaign) return campaign;
    if (interpretPreview) return interpretPreview;
    return previewCampaign;
  }, [
    optimisticCampaign,
    campaign,
    interpretation,
    interpretAgentKeys,
    interpretPreview,
    previewCampaign,
  ]);

  const displayCampaign = useMemo(() => {
    let next = baseDisplayCampaign;
    if (localRecommendations && !campaign) {
      next = { ...next, recommendations: localRecommendations };
    }
    if (removedSkuIds.length === 0) return next;
    return {
      ...next,
      recommendations: next.recommendations.filter((rec) => !removedSkuIds.includes(rec.sku.id)),
    };
  }, [baseDisplayCampaign, localRecommendations, campaign, removedSkuIds]);

  const chatMessages = useMemo(() => {
    const server = campaign?.messages ?? [];
    if (!campaign) {
      if (pendingMessages.length) return pendingMessages;
      return optimisticCampaign?.messages ?? [];
    }
    const optimistic = optimisticCampaign?.messages ?? [];
    if (optimistic.length > server.length) return optimistic;
    if (pendingMessages.length) return [...server, ...pendingMessages];
    return server;
  }, [campaign, pendingMessages, optimisticCampaign]);

  const appendChatMessages = useCallback((...msgs: AgentMessage[]) => {
    if (msgs.length === 0) return;
    setPendingMessages((prev) => [...prev, ...msgs]);
  }, []);

  useEffect(() => {
    setRemovedSkuIds([]);
    setLocalRecommendations(null);
  }, [campaign?.id]);

  useEffect(() => {
    const confirmed = displayCampaign.requirement?.confirmedSkuIds;
    if (confirmed?.length) {
      setSelectedSkuIds(confirmed);
    }
  }, [displayCampaign.requirement?.confirmedSkuIds?.join(",")]);

  useEffect(() => {
    const req = displayCampaign.requirement;
    const intentKey = displayCampaign.userIntent;
    if (!req || !intentKey) return;
    if (materialType === "image") {
      setImageConfig((prev) => applyAgentToImageConfig(req, prev));
    } else {
      setVideoConfig((prev) => applyAgentToVideoConfig(req, prev));
    }
  }, [displayCampaign.userIntent, displayCampaign.requirement, materialType]);

  useEffect(() => {
    if (campaign?.stage === "completed") {
      setSaveDialogOpen(true);
    }
  }, [campaign?.stage]);

  useEffect(() => {
    setCreativeConfigApplied(false);
    setCreativeConfirmed(false);
    setTaskSubmitted(false);
    setPreviewUrl(null);
    if (!campaign?.creativePlan) {
      setAgentFilledFields([]);
    }
  }, [campaign?.id, campaign?.creativePlan?.narrative]);

  useEffect(() => {
    if (!nativeDemoFlow || introShown || campaign || pendingMessages.length > 0) return;
    setPendingMessages([
      newMessage("agent", nativeVideoFlow ? VIDEO_AGENT_INTRO : IMAGE_AGENT_INTRO),
    ]);
    setIntroShown(true);
  }, [nativeDemoFlow, nativeVideoFlow, introShown, campaign, pendingMessages.length]);

  const applyCreativePlanFromCampaign = useCallback(
    (c: CampaignSnapshot) => {
      const plan = c.creativePlan;
      if (!plan?.agentFilledFields?.length) return;
      const applied = applyCreativePlanToConfig(plan, materialType);
      if (materialType === "image") {
        setImageConfig(applied as ImageCreationConfig);
      } else {
        setVideoConfig(applied as VideoCreationConfig);
      }
      setAgentFilledFields(plan.agentFilledFields);
      setCreativeConfigApplied(true);
    },
    [materialType]
  );

  const isLivePreview = !campaign && !!interpretPreview;
  const isStaticPreview = !hasAgentInteraction;
  const showWorkflowPanel =
    isStaticPreview ||
    isLivePreview ||
    (!!campaign &&
      (isChatActiveStage(campaign.stage) || (nativeDemoFlow && taskSubmitted))) ||
    (interpretation !== null && pendingMessages.length > 0);

  const showSelectionPanel =
    !!campaign &&
    (campaign.stage === "product_review" || campaign.stage === "creative_review");

  const showCreativePanel =
    !!campaign &&
    campaign.stage === "creative_review" &&
    !!(displayCampaign.creativePlan?.narrative || displayCampaign.creativePlan?.summary);

  const flashFields = useCallback((keys: string[]) => {
    if (keys.length === 0) return;
    setHighlightedFields(keys);
    if (highlightTimerRef.current) clearTimeout(highlightTimerRef.current);
    highlightTimerRef.current = setTimeout(() => setHighlightedFields([]), 2400);
  }, []);

  const recordFieldSync = useCallback(
    (
      _role: "user" | "agent",
      _message: string,
      prev: CampaignSnapshot | null,
      next: CampaignSnapshot
    ) => {
      const keys = diffFieldKeys(prev, next, materialType);
      flashFields(keys);
    },
    [flashFields, materialType]
  );

  const handleApplyCreativeConfig = useCallback(() => {
    if (!campaign?.creativePlan) return;
    applyCreativePlanFromCampaign(campaign);
    setSendFeedback(
      `已写入 ${campaign.creativePlan.agentFilledFields.length} 项配置，可继续修改`
    );
  }, [campaign, applyCreativePlanFromCampaign]);

  /** 解析诉求并部分回填右侧（识别到的打 Agent 标签，未识别的留空由运营补） */
  const applyPartialParse = useCallback(
    (text: string, agentMessage?: string) => {
      const result = parseRequirementInterpretation(text, materialType);
      setInterpretation(result.interpretation);
      setInterpretMissing(result.missingFields);
      setInterpretAgentKeys(result.agentFilledKeys);
      setCanAutoFillRight(result.missingFields.length === 0);

      const basicKeys = new Set(
        result.agentFilledKeys.filter((k) => BASIC_AGENT_KEYS.has(k)).map(String)
      );
      const selectionKeys = new Set(
        result.agentFilledKeys.filter((k) => SELECTION_AGENT_KEYS.has(k)).map(String)
      );
      setRightAgentFilledKeys(basicKeys);
      setSelectionAgentFilledKeys(selectionKeys);

      const preview = buildPreviewFromInterpretation(
        text,
        result.interpretation,
        result.requirement,
        result.agentFilledKeys
      );

      if (!campaign) {
        setInterpretPreview(preview);
        recordFieldSync(
          "agent",
          agentMessage ?? "已从诉求填入右侧",
          previewCampaign,
          preview
        );
      }

      return result;
    },
    [materialType, campaign, previewCampaign, recordFieldSync]
  );

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, loading]);

  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;
    const update = () => setHeaderHeight(el.getBoundingClientRect().height);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    window.addEventListener("resize", update);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", update);
    };
  }, []);

  useEffect(
    () => () => {
      if (highlightTimerRef.current) clearTimeout(highlightTimerRef.current);
    },
    []
  );

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

  useEffect(
    () => () => {
      if (pollRef.current) clearInterval(pollRef.current);
    },
    []
  );

  const runAction = async (action: string, payload?: Record<string, unknown>) => {
    if (!campaign) return;
    setLoading(true);
    try {
      const { campaign: c } = await api.campaigns.action(campaign.id, action, payload);
      setCampaign(c);
      setOptimisticCampaign(null);
      return c;
    } finally {
      setLoading(false);
    }
  };

  const syncInterpretationToCampaign = async (
    interp: RequirementInterpretation,
    agentKeys?: InterpretFieldKey[]
  ) => {
    if (!campaign?.requirement) return;
    const keys = agentKeys ?? interpretAgentKeys;
    if (keys.length === 0) return;
    const fields = requirementFieldsFromInterpretation(interp, campaign.requirement, keys);
    if (Object.keys(fields).length === 0) return;
    setLoading(true);
    try {
      const { campaign: c } = await api.campaigns.action(campaign.id, "update_fields", { fields });
      setCampaign(c);
    } finally {
      setLoading(false);
    }
  };

  const startNew = async (
    text: string,
    parseResult?: InterpretParseResult,
    agentReply?: string
  ) => {
    const result = parseResult ?? parseRequirementInterpretation(text, materialType);
    if (!parseResult) applyPartialParse(text);

    const reply =
      agentReply ?? agentReplyForStage("confirm", { requirement: result.requirement });

    const optimistic = buildOptimisticCampaign(text, materialType, null, reply);
    setOptimisticCampaign(optimistic);
    recordFieldSync("user", text, null, optimistic);
    setLoading(true);
    try {
      const { campaign: c } = await api.campaigns.create(text, materialType);
      let next = c;
      if (result.agentFilledKeys.length > 0 && c.requirement) {
        const partialReq = buildPartialDisplayRequirement(
          result.interpretation,
          c.requirement,
          result.agentFilledKeys
        );
        const fields: Record<string, string> = {};
        const syncKeys = [
          "taskName",
          "channel",
          "media",
          "landingType",
          "coreSummary",
          "specialConstraints",
          "selectionStrategy",
          "productKeywords",
          "adTheme",
          "campaignGoal",
          "targetAudience",
          "userPainPoints",
          "coreBenefit",
          "visualStyle",
          "contentTone",
          "productDataPool",
          "pickMethod",
          "selectionCoreStrategy",
          "hasBenefitRights",
        ] as const;
        for (const key of syncKeys) {
          const val = partialReq[key as keyof RequirementBrief];
          if (val !== undefined && val !== null) fields[key] = String(val);
        }
        if (Object.keys(fields).length > 0) {
          const { campaign: synced } = await api.campaigns.action(c.id, "update_fields", {
            fields,
          });
          next = synced;
        }
      }
      if (reply && next.messages.length > 0) {
        const msgs = [...next.messages];
        const last = msgs[msgs.length - 1];
        if (last?.role === "agent") {
          msgs[msgs.length - 1] = { ...last, content: reply };
        } else {
          msgs.push(newMessage("agent", reply));
        }
        next = { ...next, messages: msgs };
      }
      setCampaign(next);
      setOptimisticCampaign(null);
      setPendingMessages([]);
      recordFieldSync(
        "agent",
        next.messages[next.messages.length - 1]?.content ?? "需求已拆解",
        optimistic,
        {
          ...next,
          requirement: buildPartialDisplayRequirement(
            result.interpretation,
            next.requirement!,
            result.agentFilledKeys
          ),
        }
      );
      setPreviewUrl(null);
    } catch (e) {
      setOptimisticCampaign(null);
      setSendFeedback(`发送失败：${e instanceof Error ? e.message : "请稍后重试"}`);
      flushSync(() => {
        setPendingMessages((prev) => [
          ...prev,
          newMessage("agent", `发送失败：${e instanceof Error ? e.message : "请稍后重试"}`),
        ]);
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTweak = async (text: string) => {
    if (!campaign) return;
    const optimistic = buildOptimisticCampaign(text, materialType, campaign);
    setOptimisticCampaign(optimistic);
    recordFieldSync("user", text, campaign, optimistic);
    setLoading(true);
    try {
      const { campaign: c } = await api.campaigns.action(campaign.id, "tweak", { message: text });
      setCampaign(c);
      setOptimisticCampaign(null);
      setPendingMessages([]);
      recordFieldSync(
        "agent",
        c.messages[c.messages.length - 1]?.content ?? "已更新",
        optimistic,
        c
      );
    } finally {
      setLoading(false);
    }
  };

  const removeSku = async (skuId: string) => {
    if (campaign) {
      await runAction("remove_recommendation", { skuId });
      return;
    }
    setRemovedSkuIds((prev) => [...prev, skuId]);
    setLocalRecommendations((prev) => prev?.filter((r) => r.sku.id !== skuId) ?? null);
    setSelectedSkuIds((prev) => prev.filter((id) => id !== skuId));
  };

  const resetFlow = () => {
    if (pollRef.current) clearInterval(pollRef.current);
    setCampaign(null);
    setOptimisticCampaign(null);
    setInterpretPreview(null);
    setInterpretation(null);
    setInterpretMissing([]);
    setInterpretAgentKeys([]);
    setCanAutoFillRight(false);
    setPendingMessages([]);
    setSelectedSkuIds([]);
    setLocalRecommendations(null);
    setRemovedSkuIds([]);
    setLoading(false);
    setAgentFilledFields([]);
    setCreativeConfigApplied(false);
    setCreativeConfirmed(false);
    setTaskSubmitted(false);
    setPreviewUrl(null);
    setIntroShown(false);
    setSendFeedback(null);
    inputDraftRef.current = "";
    setInputVersion((v) => v + 1);
  };

  const submitIntent = async (textOverride?: string) => {
    const text = (textOverride ?? commitInputFromDom()).trim();
    if (!text) {
      setEmptyInputHint(true);
      inputRef.current?.focus();
      setSendFeedback("请先在下方输入框填写运营诉求");
      return;
    }
    if (loading) {
      setSendFeedback("正在处理中，请稍候…");
      return;
    }
    setEmptyInputHint(false);
    setSendFeedback("正在发送…");
    inputDraftRef.current = text;

    flushSync(() => {
      setPendingMessages((prev) => [...prev, newMessage("user", text)]);
    });
    requestAnimationFrame(() => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }));

    try {
      const result = applyPartialParse(text);
      const agentReply = !campaign
        ? nativeDemoFlow
          ? buildAgentParseReply(result)
          : agentReplyForStage("confirm", { requirement: result.requirement })
        : buildAgentParseReply(result);

      flushSync(() => {
        setPendingMessages((prev) => [...prev, newMessage("agent", agentReply)]);
      });

      if (!campaign) {
        setSendFeedback("Agent 已回复，请核对右侧方案后继续");
        await startNew(text, result, agentReply);
        return;
      }

      if (!isChatActiveStage(campaign.stage)) {
        appendChatMessages(
          newMessage("agent", "当前流程阶段不支持发送消息，请使用右侧操作按钮继续。")
        );
        return;
      }

      const intent = detectChatIntent(text, campaign.stage);

      if (intent === "confirm_requirement" && campaign.stage === "confirm") {
        await runAction("confirm_requirement");
        return;
      }

      if (intent === "confirm_product" && campaign.stage === "product_review") {
        await runAction("confirm_product", { skuIds: selectedSkuIds });
        return;
      }

      if (intent === "generate_creative" && campaign.stage === "creative_review") {
        await runAction("generate_creative");
        return;
      }

      if (intent === "confirm_creative" && campaign.stage === "creative_review") {
        await confirmAndGenerate();
        return;
      }

      await syncInterpretationToCampaign(result.interpretation, result.agentFilledKeys);
      await handleTweak(text);
      setSendFeedback(agentReply);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "请稍后重试";
      flushSync(() => {
        setPendingMessages((prev) => [...prev, newMessage("agent", `处理失败：${msg}`)]);
      });
      setSendFeedback(`发送失败：${msg}`);
    }
  };

  const handleSmartFill = async () => {
    await submitIntent();
  };

  const handleSend = async (textOverride?: string) => {
    await submitIntent(textOverride);
  };

  const handleInterpretChange = (next: RequirementInterpretation, changedKey?: InterpretFieldKey) => {
    setInterpretation(next);
    if (changedKey) {
      setInterpretAgentKeys((prev) => prev.filter((k) => k !== changedKey));
      if (BASIC_AGENT_KEYS.has(changedKey)) {
        setRightAgentFilledKeys((prev) => {
          const s = new Set(prev);
          s.delete(changedKey);
          return s;
        });
      }
      if (SELECTION_AGENT_KEYS.has(changedKey)) {
        setSelectionAgentFilledKeys((prev) => {
          const s = new Set(prev);
          s.delete(changedKey);
          return s;
        });
      }
    }
    const missing = CRITICAL_INTERPRET_KEYS.filter((k) => !next[k]);
    setInterpretMissing(missing);
    setCanAutoFillRight(missing.length === 0);

    const baseReq =
      displayCampaign.requirement ??
      parseRequirementInterpretation(readInputText() || displayCampaign.userIntent, materialType)
        .requirement;

    if (!campaign) {
      setInterpretPreview(
        buildPreviewFromInterpretation(
          readInputText() || displayCampaign.userIntent,
          next,
          baseReq,
          interpretAgentKeys.filter((k) => k !== changedKey)
        )
      );
      return;
    }

    if (changedKey) {
      void syncInterpretationToCampaign(next);
    }
  };

  const patchLocalRequirement = (fieldKey: string, value: string) => {
    const patch = (req: RequirementBrief): RequirementBrief => {
      const next = { ...req, [fieldKey]: value };
      if (fieldKey === "creativesPerProduct" || fieldKey === "selectionCount") {
        next[fieldKey] = Number(value) || 0;
      }
      return next;
    };

    if (interpretPreview?.requirement) {
      setInterpretPreview((prev) =>
        prev ? { ...prev, requirement: patch(prev.requirement!) } : prev
      );
    } else if (interpretation) {
      const merged = interpretationToRequirement(
        { ...interpretation, [fieldKey]: value } as RequirementInterpretation,
        parseRequirementInterpretation(readInputText(), materialType).requirement
      );
      const baseReq = parseRequirementInterpretation(readInputText(), materialType).requirement;
      setInterpretPreview((prev) =>
        prev
          ? { ...prev, requirement: merged }
          : buildPreviewFromInterpretation(
              readInputText(),
              { ...interpretation, [fieldKey]: value } as RequirementInterpretation,
              baseReq,
              interpretAgentKeys
            )
      );
    }
  };

  const updateField = async (fieldKey: string, value: string) => {
    setRightAgentFilledKeys((prev) => {
      const s = new Set(prev);
      s.delete(fieldKey);
      return s;
    });
    setSelectionAgentFilledKeys((prev) => {
      const s = new Set(prev);
      s.delete(fieldKey);
      return s;
    });

    if (!campaign) {
      patchLocalRequirement(fieldKey, value);
      flashFields([fieldKey]);
      return;
    }

    const { campaign: c } = await api.campaigns.action(campaign.id, "update_fields", {
      fields: { [fieldKey]: value },
    });
    flashFields([fieldKey]);
    setCampaign(c);
  };

  const toggleSku = (skuId: string) => {
    setSelectedSkuIds((prev) =>
      prev.includes(skuId) ? prev.filter((id) => id !== skuId) : [...prev, skuId]
    );
  };

  const runSelection = async () => {
    const req = displayCampaign.requirement;
    if (!req) return;

    if (campaign) {
      if (campaign.stage !== "product_review") return;
      await runAction("run_selection");
      return;
    }

    setLoading(true);
    try {
      const recs = buildRecommendations(req, INTERNAL_SKUS);
      setLocalRecommendations(recs);
      setSelectedSkuIds([]);
    } finally {
      setLoading(false);
    }
  };

  const confirmRequirement = () => runAction("confirm_requirement");
  const confirmProduct = () =>
    runAction("confirm_product", { skuIds: selectedSkuIds, nativeFlow: nativeDemoFlow });

  const generateCreative = async () => {
    if (!campaign) return;
    setCreativeConfigApplied(false);
    setCreativeConfirmed(false);
    setPreviewUrl(null);
    setAgentFilledFields([]);
    setLoading(true);
    try {
      const { campaign: c } = await api.campaigns.action(campaign.id, "generate_creative");
      setCampaign(c);
    } finally {
      setLoading(false);
    }
  };

  const handleImageCreativeChange = async (fields: ImageCreativePlanFields) => {
    if (!campaign) return;
    setCampaign((prev) => {
      if (!prev?.creativePlan) return prev;
      return {
        ...prev,
        creativePlan: { ...prev.creativePlan, imageCreative: fields },
      };
    });
    try {
      await api.campaigns.action(campaign.id, "update_image_creative", { imageCreative: fields });
    } catch {
      /* 演示环境忽略同步失败 */
    }
  };

  const handleVideoCreativeChange = async (fields: VideoCreativePlanFields) => {
    if (!campaign) return;
    setCampaign((prev) => {
      if (!prev?.creativePlan) return prev;
      return {
        ...prev,
        creativePlan: { ...prev.creativePlan, videoCreative: fields },
      };
    });
    try {
      await api.campaigns.action(campaign.id, "update_video_creative", { videoCreative: fields });
    } catch {
      /* demo */
    }
  };

  const confirmCreativePlan = () => {
    setCreativeConfirmed(true);
  };

  const regeneratePreview = async () => {
    if (!campaign || loading) return;
    setLoading(true);
    try {
      await new Promise((r) => setTimeout(r, 600));
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDemandTemplate = async () => {
    if (!interpretation) return;
    const name = window.prompt("投放需求模板名称", interpretation.taskName || "投放需求模板");
    if (!name) return;
    await api.materialLibrary.save({
      mode: "config-template",
      name,
      category: "param-template",
      subCategory: "demand-template",
      configJson: JSON.stringify({ interpretation, userIntent: readInputText() }),
      sourceChain: materialType,
      materialType,
      tags: ["投放需求", materialType === "image" ? "图片" : "视频"],
    });
    alert("已存入个人素材库");
  };

  const handleSaveSelectionTemplate = async () => {
    const req = displayCampaign.requirement;
    if (!req) return;
    const name = window.prompt("选品策略模板名称", "选品策略模板");
    if (!name) return;
    await api.materialLibrary.save({
      mode: "config-template",
      name,
      category: "param-template",
      subCategory: "selection-strategy",
      configJson: JSON.stringify({
        selectionStrategy: req.selectionStrategy,
        selectionCount: req.selectionCount,
        productSelectionMethod: req.productSelectionMethod,
        productKeywords: req.productKeywords,
      }),
      sourceChain: materialType,
      materialType,
      tags: ["选品策略"],
    });
    alert("已存入个人素材库");
  };

  const handleSaveToLibrary = async (mode: LibrarySaveMode, name: string) => {
    const configJson =
      materialType === "image"
        ? JSON.stringify(imageConfig)
        : JSON.stringify(videoConfig);
    await api.materialLibrary.save({
      mode,
      name,
      category: mode === "finished-asset" ? "visual" : "param-template",
      subCategory: mode === "config-template" ? "style" : undefined,
      url: previewUrl ?? undefined,
      configJson: mode !== "finished-asset" ? configJson : undefined,
      sourceChain: materialType,
      materialType,
      tags: [materialType === "image" ? "图片" : "视频", mode],
    });
  };

  const handleSaveModuleTemplate = async (moduleId: string) => {
    const name = window.prompt(
      "模板名称",
      `${materialType === "image" ? "图片" : "视频"}-${moduleId}-模板`
    );
    if (!name) return;
    const configJson =
      materialType === "image"
        ? JSON.stringify(imageConfig)
        : JSON.stringify(videoConfig);
    await api.materialLibrary.save({
      mode: "config-template",
      name,
      category: "param-template",
      subCategory: moduleId,
      configJson,
      sourceChain: materialType,
      materialType,
    });
    alert("已存入个人素材库");
  };

  const configValues =
    materialType === "image"
      ? (imageConfig as unknown as Record<string, unknown>)
      : (videoConfig as unknown as Record<string, unknown>);

  const handleConfigChange = (next: Record<string, unknown>, changedFieldId?: string) => {
    if (changedFieldId) {
      setAgentFilledFields((prev) => prev.filter((k) => k !== changedFieldId));
    }
    if (materialType === "image") {
      setImageConfig(next as unknown as ImageCreationConfig);
    } else {
      setVideoConfig(next as unknown as VideoCreationConfig);
    }
  };

  const configEditable =
    !campaign ||
    campaign.stage === "confirm" ||
    campaign.stage === "creative_review" ||
    isLivePreview;

  const confirmAndGenerate = async () => {
    if (!campaign || loading) return;
    setLoading(true);
    try {
      if (nativeDemoFlow) {
        const { campaign: c } = await api.campaigns.action(campaign.id, "submit_native_task");
        setCampaign(c);
        setTaskSubmitted(true);
        return;
      }
      const { campaign: c } = await api.campaigns.action(campaign.id, "confirm_creative");
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

  const busy =
    loading ||
    (!nativeDemoFlow &&
      (campaign?.stage === "generating" || campaign?.stage === "external_review"));

  const canChat =
    !campaign ||
    isChatActiveStage(campaign.stage);

  const flowLocked = !!campaign && isFlowLockedStage(campaign.stage);

  const sendDisabledReason = getSendDisabledReason({
    input: readInputText(),
    loading,
    campaign,
  });

  /** 仅因流程锁定/加载中禁用；空输入允许点击并在点击时提示（兼容中文 IME） */
  const sendBlocked =
    loading || (!!campaign && !isChatActiveStage(campaign.stage));

  const canSend = !sendBlocked;

  const selectionReadOnly =
    isStaticPreview || (!!campaign && campaign.stage !== "product_review");

  const stickyTop = suppressHeader ? layoutTopOffset : headerHeight;

  return (
    <div className={cn("bg-[#f4f4f5]", suppressHeader ? "min-h-0 flex-1" : "min-h-dvh")}>
      {!suppressHeader && (
      <div
        ref={headerRef}
        className="sticky top-0 z-20 border-b border-gray-200 bg-white px-6 py-3 shadow-sm"
      >
        <h1 className="text-xl font-semibold tracking-tight text-gray-900">{title}</h1>
        {subtitle ? (
          <p className="mt-1.5 max-w-3xl text-sm leading-relaxed text-gray-500">{subtitle}</p>
        ) : null}
      </div>
      )}

      <div className="flex items-start">
        <aside
          className="sticky flex w-[380px] shrink-0 flex-col self-start border-r border-gray-200 bg-white"
          style={{ top: stickyTop, height: `calc(100dvh - ${stickyTop}px)` }}
        >
          <div className="shrink-0 border-b border-gray-100 px-4 py-3">
            <h2 className="text-sm font-semibold text-gray-900">和 Agent 对话</h2>
            <p className="mt-1 text-[11px] leading-relaxed text-gray-500">
              {nativeDemoFlow
                ? "输入自然语言投放需求，Agent 静默拆解并填入右侧需求确认面板。"
                : "写好诉求后点击发送，Agent 会回复并同步右侧；未识别字段请手动补充。"}
            </p>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain p-4 scrollbar-thin">
          <div className="space-y-3">
            {!chatMessages.length && !nativeDemoFlow && (
              <button
                type="button"
                className="flex w-full gap-2 text-left"
                onClick={() => {
                  if (!inputRef.current) return;
                  inputRef.current.value = examplePrompt;
                  inputDraftRef.current = examplePrompt;
                  inputRef.current.focus();
                  setEmptyInputHint(false);
                }}
              >
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-100 text-brand-700">
                  <Bot className="h-3.5 w-3.5" />
                </div>
                <p className="rounded-2xl bg-gray-100 px-3 py-2 text-sm leading-relaxed text-gray-800 hover:bg-gray-200">
                  你可以这样说：「{examplePrompt}」
                  <span className="mt-1 block text-[10px] text-brand-600">点击填入输入框</span>
                </p>
              </button>
            )}

            {chatMessages.map((msg) => (
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
                  {msg.role === "agent" ? (
                    <AgentMessageContent content={msg.content} />
                  ) : (
                    msg.content
                  )}
                </p>
              </div>
            ))}

            {loading && optimisticCampaign && (
              <div className="flex gap-2">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-100 text-brand-700">
                  <Bot className="h-3.5 w-3.5" />
                </div>
                <p className="rounded-2xl bg-gray-100 px-3 py-2 text-sm text-gray-500">
                  Agent 正在同步…
                </p>
              </div>
            )}
            {loading && campaign?.stage === "creative_review" && nativeDemoFlow && !creativeConfirmed && (
              <div className="flex gap-2">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-100 text-brand-700">
                  <Bot className="h-3.5 w-3.5" />
                </div>
                <p className="rounded-2xl bg-gray-100 px-3 py-2 text-sm text-gray-600">
                  {nativeVideoFlow ? VIDEO_CREATIVE_LOADING_HINT : IMAGE_CREATIVE_LOADING_HINT}
                </p>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {!nativeDemoFlow && (
          <RequirementInterpretPanel
            interpretation={interpretation}
            missingFields={interpretMissing}
            agentFilledKeys={interpretAgentKeys}
            canAutoFill={canAutoFillRight}
            onChange={handleInterpretChange}
            onSaveTemplate={interpretation ? handleSaveDemandTemplate : undefined}
          />
          )}
        </div>

        <div className="relative z-10 shrink-0 space-y-3 border-t border-gray-200 bg-white p-4">
          {flowLocked && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] leading-relaxed text-amber-800">
              当前任务处于「
              {campaign?.stage === "generating"
                ? "素材生成"
                : campaign?.stage === "external_review"
                  ? "外部审核"
                  : campaign?.stage === "completed"
                    ? "已完成"
                    : "审核未通过"}
              」阶段，输入与发送已锁定。
              <button
                type="button"
                onClick={resetFlow}
                className="ml-1 font-medium text-brand-600 underline hover:text-brand-700"
              >
                重新开始
              </button>
            </div>
          )}

          <form
            className="space-y-3"
            onSubmit={(e) => {
              e.preventDefault();
              void submitIntent();
            }}
          >
            <Textarea
              key={inputVersion}
              ref={inputRef}
              label="运营诉求"
              defaultValue=""
              onChange={(e) => {
                inputDraftRef.current = e.target.value;
                if (e.target.value.trim()) setEmptyInputHint(false);
              }}
              onInput={(e) => {
                const v = e.currentTarget.value;
                inputDraftRef.current = v;
                if (v.trim()) setEmptyInputHint(false);
              }}
              onCompositionEnd={(e) => {
                inputDraftRef.current = e.currentTarget.value;
                if (e.currentTarget.value.trim()) setEmptyInputHint(false);
              }}
              disabled={!canChat || (busy && !flowLocked)}
              readOnly={flowLocked}
              placeholder={canChat ? placeholder : "生成与审核中…"}
              rows={3}
              className={cn("text-sm", emptyInputHint && "border-amber-400 ring-1 ring-amber-300")}
            />
            <div className="flex gap-2">
              <Button
                type="submit"
                className="flex-1"
                disabled={!canSend}
                loading={loading && !campaign}
                title={sendBlocked ? sendDisabledReason ?? undefined : undefined}
              >
                <Send className="h-4 w-4" />
                发送给 Agent
              </Button>
              <Button
                type="button"
                className="flex-1"
                variant="outline"
                onClick={() => void submitIntent()}
                disabled={!canSend}
                loading={loading && !!campaign}
                title={sendBlocked ? sendDisabledReason ?? undefined : undefined}
              >
                <Sparkles className="h-4 w-4" />
                智能填写配置
              </Button>
            </div>
          </form>
          {sendFeedback && (
            <div className="rounded-lg border border-brand-200 bg-brand-50 px-3 py-2 text-[11px] leading-relaxed text-brand-800">
              {sendFeedback}
            </div>
          )}
          {emptyInputHint && (
            <p className="text-[11px] text-amber-600">
              请先在输入框填写运营诉求（中文输入完成后按空格或回车确认选词）
            </p>
          )}
          {sendBlocked && sendDisabledReason && (
            <p className="text-[11px] text-amber-600">{sendDisabledReason}</p>
          )}
          {!sendBlocked && !emptyInputHint && (
            <p className="text-[11px] text-gray-400">
              发送后右侧字段将同步更新；支持 ⌘/Ctrl + Enter 快捷发送
            </p>
          )}
        </div>
        </aside>

        {/* 右侧工作区 */}
        <div className="relative min-w-0 flex-1 pb-16">
          {showWorkflowPanel && (
            <div className="mx-auto w-full max-w-2xl space-y-4 px-6 py-5">
              <CampaignConfirmPanel
                preview={isStaticPreview}
                livePreview={isLivePreview}
                syncing={loading}
                campaign={displayCampaign}
                materialType={materialType}
                selectedSkuId={selectedSkuIds[0] ?? null}
                selectedSkuIds={selectedSkuIds}
                loading={loading}
                highlightedFields={highlightedFields}
                agentFilledKeys={rightAgentFilledKeys}
                nativeDemoFlow={nativeDemoFlow}
                onSelectSku={toggleSku}
                onRemoveSku={removeSku}
                onUpdateField={updateField}
                onConfirmRequirement={campaign ? confirmRequirement : undefined}
                onConfirmProduct={campaign ? confirmProduct : undefined}
                externalConfirmProduct={showSelectionPanel}
                hideGenerateCreative={showCreativePanel}
                onGenerateCreative={campaign ? generateCreative : undefined}
                onStartGeneration={campaign ? confirmAndGenerate : undefined}
                onStartFromDemo={isStaticPreview ? () => void submitIntent() : undefined}
              />

              {showSelectionPanel && displayCampaign.requirement && (
                <SmartSelectionPanel
                  requirement={displayCampaign.requirement}
                  campaign={displayCampaign}
                  selectedSkuIds={selectedSkuIds}
                  loading={loading}
                  agentFilledKeys={selectionAgentFilledKeys}
                  readOnly={selectionReadOnly}
                  nativeDemoFlow={nativeDemoFlow}
                  onUpdateField={updateField}
                  onRunSelection={runSelection}
                  onToggleSku={toggleSku}
                  onRemoveSku={removeSku}
                  onSaveStrategyTemplate={handleSaveSelectionTemplate}
                />
              )}

              {showSelectionPanel && campaign?.stage === "product_review" && (
                <Button
                  className="w-full"
                  size="lg"
                  onClick={() => void confirmProduct()}
                  loading={loading}
                  disabled={selectedSkuIds.length === 0}
                >
                  <Package className="h-4 w-4" />
                  确认选品（{selectedSkuIds.length}）
                </Button>
              )}

              {nativeVideoFlow &&
                showCreativePanel &&
                displayCampaign.creativePlan?.videoCreative &&
                !creativeConfirmed && (
                  <NativeVideoCreativePlanPanel
                    plan={displayCampaign.creativePlan}
                    status={loading ? "generating" : "ready"}
                    loading={loading}
                    onChange={(fields) => void handleVideoCreativeChange(fields)}
                    onRegenerate={() => void generateCreative()}
                    onConfirm={confirmCreativePlan}
                  />
                )}

              {nativeImageFlow &&
                showCreativePanel &&
                displayCampaign.creativePlan?.imageCreative &&
                !creativeConfirmed && (
                  <NativeCreativePlanPanel
                    plan={displayCampaign.creativePlan}
                    status={loading ? "generating" : "ready"}
                    loading={loading}
                    onChange={(fields) => void handleImageCreativeChange(fields)}
                    onRegenerate={() => void generateCreative()}
                    onConfirm={confirmCreativePlan}
                  />
                )}

              {showCreativePanel && displayCampaign.creativePlan && !nativeDemoFlow && (
                <CreativeGenerationPanel
                  plan={displayCampaign.creativePlan}
                  loading={loading}
                  configApplied={creativeConfigApplied}
                  onApplyConfig={handleApplyCreativeConfig}
                  onRegenerate={() => void generateCreative()}
                />
              )}

              {!nativeDemoFlow && (
              <StructuredConfigPanel
                materialType={materialType}
                values={configValues}
                onChange={handleConfigChange}
                readOnly={!configEditable}
                agentFilledFields={agentFilledFields}
                onSaveTemplate={configEditable ? handleSaveModuleTemplate : undefined}
              />
              )}

              {nativeDemoFlow &&
                campaign?.stage === "creative_review" &&
                creativeConfirmed &&
                !taskSubmitted && (
                  <PreviewSubmitPanel
                    singlePreview
                    materialType={materialType}
                    previewUrls={previewUrl ? [previewUrl] : []}
                    loading={loading}
                    onBackToCreative={() => setCreativeConfirmed(false)}
                    onRegeneratePreview={() => void regeneratePreview()}
                    onConfirmSubmit={() => void confirmAndGenerate()}
                  />
                )}

              {!nativeDemoFlow && campaign?.stage === "creative_review" && (
                <Button
                  className="w-full"
                  size="lg"
                  onClick={() => void confirmAndGenerate()}
                  loading={loading}
                  disabled={!campaign.creativePlan}
                >
                  <Sparkles className="h-4 w-4" />
                  开始审核并生成
                </Button>
              )}
            </div>
          )}

          {!showWorkflowPanel && !nativeDemoFlow && (
            <div className="flex min-h-[320px] flex-col p-6">
              {(campaign?.stage === "generating" || campaign?.stage === "external_review") && (
                <div className="flex flex-1 flex-col items-center justify-center text-center">
                  <Loader2 className="h-12 w-12 animate-spin text-gray-400" />
                  <p className="mt-4 text-sm font-medium text-gray-700">
                    {campaign.stage === "generating" ? "大模型生成中…" : "巨量引擎审核中…"}
                  </p>
                  {previewUrl && materialType === "image" && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={previewUrl} alt="预览" className="mt-6 max-h-64 rounded-xl shadow-lg" />
                  )}
                </div>
              )}

              {campaign?.stage === "completed" && (
                <div className="mx-auto flex max-w-xl flex-col items-center text-center">
                  <Shield className="h-12 w-12 text-green-600" />
                  <p className="mt-3 text-base font-semibold text-gray-900">审核通过 · 已入库，可投放</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-3"
                    onClick={() => setSaveDialogOpen(true)}
                  >
                    存入个人素材库
                  </Button>
                  {previewUrl && materialType === "image" && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={previewUrl} alt="成品" className="mt-4 max-h-80 rounded-2xl shadow-lg" />
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
                  <p className="text-sm font-semibold text-red-800">审核未通过</p>
                  {campaign.rejectReason && (
                    <p className="mt-2 text-xs text-red-600">{campaign.rejectReason}</p>
                  )}
                  <p className="mt-3 text-xs text-red-500">在左侧输入新需求重新开始</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <SaveToLibraryDialog
        open={saveDialogOpen}
        materialType={materialType}
        onClose={() => setSaveDialogOpen(false)}
        onSave={handleSaveToLibrary}
        onExportOnly={() => {
          if (previewUrl) window.open(previewUrl, "_blank");
          setSaveDialogOpen(false);
        }}
      />
    </div>
  );
}
