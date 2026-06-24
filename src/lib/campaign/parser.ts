import type { MaterialType } from "@/lib/types";
import { BUSINESS_TEMPLATES } from "./templates";
import type { AgentMessage, CreativeBrief, RequirementBrief } from "./types";

export function matchTemplate(userIntent: string, materialType?: MaterialType) {
  const pool = materialType
    ? BUSINESS_TEMPLATES.filter((t) => t.materialType === materialType)
    : BUSINESS_TEMPLATES;
  const candidates = pool.length > 0 ? pool : BUSINESS_TEMPLATES;

  const text = userIntent.toLowerCase();
  let best = candidates[0];
  let bestScore = 0;

  for (const tpl of candidates) {
    let score = 0;
    for (const kw of tpl.keywords) {
      if (text.includes(kw.toLowerCase())) score += 2;
    }
    if (text.includes(tpl.platform.toLowerCase())) score += 1;
    if (text.includes(tpl.industry.toLowerCase())) score += 1;
    if (score > bestScore) {
      bestScore = score;
      best = tpl;
    }
  }
  return best;
}

function extractSellingPoints(text: string): string {
  const patterns = [
    /强调(.{2,20})/,
    /卖点[是为：:]\s*(.{2,30})/,
    /(轻薄|不闷痘|防晒|保湿|快充|降噪)/g,
  ];
  const hits: string[] = [];
  for (const p of patterns) {
    const m = text.match(p);
    if (Array.isArray(m)) hits.push(...m.filter((x) => x.length < 20));
    else if (m?.[1]) hits.push(m[1]);
  }
  return hits.slice(0, 3).join("、") || "核心卖点待确认";
}

function extractPromotion(text: string): string | undefined {
  const m = text.match(/(618|双11|限时|满减|买\d送\d|特惠)/);
  return m?.[0];
}

function extractPriceRange(text: string): string | undefined {
  const m = text.match(/(\d+)\s*[-~到]\s*(\d+)/);
  if (m) return `${m[1]}-${m[2]}元`;
  const single = text.match(/(\d+)\s*左右/);
  if (single) return `约${single[1]}元`;
  return undefined;
}

export function parseRequirementFromIntent(
  userIntent: string,
  materialType?: MaterialType
): RequirementBrief {
  const template = matchTemplate(userIntent, materialType);
  const productKeywords =
    userIntent.match(/做(.{2,12}?)[的,，]|推广(.{2,12}?)[,，]|(.{2,8}?)(防晒|耳机|面膜|零食)/)?.[1] ??
    userIntent.slice(0, 20);

  return {
    templateId: template.id,
    templateName: template.name,
    platform: template.platform,
    industry: template.industry,
    materialType: template.materialType,
    productKeywords: productKeywords.trim(),
    sellingPoints: extractSellingPoints(userIntent),
    audience: userIntent.includes("年轻") ? "年轻女性" : undefined,
    promotion: extractPromotion(userIntent),
    priceRange: extractPriceRange(userIntent),
    duration: template.creativeDefaults.duration,
    aspectRatio: template.creativeDefaults.aspectRatio,
  };
}

export function buildCreativeBrief(
  requirement: RequirementBrief,
  productName: string
): CreativeBrief {
  const template = BUSINESS_TEMPLATES.find((t) => t.id === requirement.templateId)!;
  const d = template.creativeDefaults;

  const coverTitle = (d.coverTitle ?? "{productName}")
    .replace("{productName}", productName)
    .replace("{sellingPoint}", requirement.sellingPoints.split("、")[0] ?? "");

  return {
    storyboard:
      requirement.materialType === "video"
        ? `钩子(3s) → 产品特写(5s) → 卖点字幕(5s) → ${d.cta}(2s)`
        : undefined,
    bgm: d.bgm ?? "轻音乐",
    cta: d.cta ?? "立即购买",
    coverTitle,
    voiceover: d.voiceover ?? false,
    subtitle: d.subtitle ?? true,
    visualStyle: requirement.industry.includes("美妆") ? "清新自然" : "科技简约",
  };
}

export function agentReplyForStage(
  stage: string,
  context: { requirement?: RequirementBrief; productName?: string }
): string {
  switch (stage) {
    case "confirm":
      return `已按「${context.requirement?.templateName}」完成需求拆解、选品与创意预设。请确认摘要，一键即可生成并提交巨量审核。`;
    case "requirement_review":
      return `我已按「${context.requirement?.templateName}」模板拆解您的诉求，请确认右侧需求单是否准确。确认后将基于内部 SKU 表智能推荐选品。`;
    case "product_review":
      return `根据需求单与模板选品规则，我从内部 SKU 库为您推荐了匹配商品，请选择 1 款并确认。`;
    case "creative_review":
      return `已为「${context.productName}」生成创意方案（BGM / CTA / 封题 / 分镜）。可直接确认，或告诉我需要微调的内容。`;
    case "generating":
      return "创意方案已锁定，正在调用大模型生成广告素材…";
    case "external_review":
      return "素材已生成，正在提交巨量引擎外部审核，请稍候。";
    case "completed":
      return "巨量审核已通过，素材已入库，投放同学可在素材库中使用。";
    case "rejected":
      return "巨量审核未通过，请根据驳回原因调整后重新生成。";
    default:
      return "请描述您的投放诉求，例如：618 做 sunscreen 的抖音 15 秒视频，强调轻薄，价格 150 左右。";
  }
}

export function newMessage(role: "user" | "agent", content: string): AgentMessage {
  return {
    id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    role,
    content,
    createdAt: new Date().toISOString(),
  };
}

export function applyCreativeTweak(
  creative: CreativeBrief,
  userMessage: string
): CreativeBrief {
  const next = { ...creative };
  const t = userMessage.toLowerCase();
  if (t.includes("bgm") || t.includes("音乐") || t.includes("配乐")) {
    if (t.includes("快") || t.includes("节奏")) next.bgm = "节奏感强";
    else if (t.includes("轻")) next.bgm = "轻音乐";
    else next.bgm = "电子乐";
  }
  if (t.includes("cta") || t.includes("行动") || t.includes("下单") || t.includes("领券")) {
    if (t.includes("领券")) next.cta = "扫码领券";
    else if (t.includes("关注")) next.cta = "关注账号";
    else next.cta = "立即下单";
  }
  if (t.includes("封") || t.includes("标题") || t.includes("封面")) {
    next.coverTitle = userMessage.replace(/封题|封面|标题/g, "").trim() || next.coverTitle;
  }
  return next;
}
