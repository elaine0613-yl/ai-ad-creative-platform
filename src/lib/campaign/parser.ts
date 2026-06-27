import { PLATFORM_PRESETS } from "@/lib/constants";
import type { MaterialType } from "@/lib/types";
import { BUSINESS_TEMPLATES } from "./templates";
import type { AgentMessage, CreativeBrief, RequirementBrief } from "./types";

const MEDIA_PLATFORMS = ["抖音", "快手", "小红书", "淘宝", "京东", "拼多多", "微信"];

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

function extractMedia(text: string): string | undefined {
  for (const p of MEDIA_PLATFORMS) {
    if (text.includes(p)) return p;
  }
  return undefined;
}

function extractChannel(text: string): string {
  if (text.includes("外投")) return "外投";
  if (text.includes("信息流")) return "信息流";
  if (text.includes("电商站内") || text.includes("站内")) return "电商站内";
  return "外投";
}

function extractSizeRequirement(media: string, materialType: MaterialType): string {
  const preset = PLATFORM_PRESETS.find((p) => p.name.includes(media));
  if (preset) return `${preset.width}×${preset.height}`;
  if (materialType === "video") return "1080×1920";
  return media === "淘宝" || media === "京东" ? "800×800" : "1080×1920";
}

function extractTaskName(text: string, media: string, materialType: MaterialType): string {
  if (text.includes("省钱神券")) {
    return `省钱神券-${media}${materialType === "video" ? "视频" : "图片"}素材`;
  }
  const biz = text.match(/给(.{2,12}?)(做|投)/)?.[1];
  if (biz) return `${biz}-${media}${materialType === "video" ? "视频" : "图片"}素材`;
  return `${media}${materialType === "video" ? "视频" : "图片"}投放素材`;
}

function extractVisualStyle(text: string): string | undefined {
  if (/真实|写实|生活感/.test(text)) return "真实生活感";
  if (/促销|热闹|大促/.test(text)) return "促销热闹";
  if (/清新|自然/.test(text)) return "清新自然";
  if (/科技|简约/.test(text)) return "科技简约";
  return undefined;
}

function buildSelectionStrategy(text: string): string {
  if (text.includes("省钱") || text.includes("捡漏") || text.includes("划算")) {
    return "优先级：1. 不限品类，从全量商品池召回；2. 优先匹配「省钱」「捡漏」「高性价比」标签；3. 价格带覆盖低到中等，突出领券后更划算；4. 兼顾外观真实感，适合外投场景。";
  }
  return "根据投放诉求从内部 SKU 库智能匹配，兼顾品类相关性与转化潜力。";
}

function extractSellingPoints(text: string): string {
  const patterns = [
    /突出(.{2,20})/,
    /强调(.{2,20})/,
    /卖点[是为：:]\s*(.{2,30})/,
    /(轻薄|不闷痘|防晒|保湿|快充|降噪|领券后更划算|更划算)/g,
  ];
  const hits: string[] = [];
  for (const p of patterns) {
    const m = text.match(p);
    if (Array.isArray(m)) hits.push(...m.filter((x) => x.length < 20));
    else if (m?.[1]) hits.push(m[1]);
  }
  if (text.includes("领券") || text.includes("划算")) hits.push("领券后更划算");
  return hits.slice(0, 3).join("、") || "核心卖点待确认";
}

function extractPromotion(text: string): string | undefined {
  const m = text.match(/(618|双11|限时|满减|买\d送\d|特惠|神券|领券)/);
  return m?.[0];
}

function extractPriceRange(text: string): string | undefined {
  const m = text.match(/(\d+)\s*[-~到]\s*(\d+)/);
  if (m) return `${m[1]}-${m[2]}元`;
  const single = text.match(/(\d+)\s*左右/);
  if (single) return `约${single[1]}元`;
  return undefined;
}

function extractProductKeywords(text: string): string {
  if (text.includes("省钱") || text.includes("捡漏")) return "省钱捡漏";
  const m = text.match(/做(.{2,12}?)[的,，]|推广(.{2,12}?)[,，]|(.{2,8}?)(防晒|耳机|面膜|零食)/);
  return (m?.[1] ?? m?.[2] ?? text.slice(0, 20)).trim();
}

export function parseRequirementFromIntent(
  userIntent: string,
  materialType: MaterialType = "image"
): RequirementBrief {
  const template = matchTemplate(userIntent, materialType);
  const media = extractMedia(userIntent) ?? template.platform;
  const channel = extractChannel(userIntent);
  const visualStyle = extractVisualStyle(userIntent);
  const type = materialType || template.materialType;

  return {
    templateId: template.id,
    templateName: template.name,
    platform: media,
    industry: template.industry,
    materialType: type,
    productKeywords: extractProductKeywords(userIntent),
    sellingPoints: extractSellingPoints(userIntent),
    taskName: extractTaskName(userIntent, media, type),
    channel,
    media,
    sizeRequirement: extractSizeRequirement(media, type),
    creativesPerProduct: type === "video" ? 3 : 6,
    visualStyle,
    landingType: "商品",
    productSelectionMethod: /智能选|帮我选|选一批/.test(userIntent) ? "AI 智能选品" : "AI 智能选品",
    selectionCount: /智能选/.test(userIntent) ? 10 : 6,
    selectionStrategy: buildSelectionStrategy(userIntent),
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
    visualStyle:
      requirement.visualStyle ??
      (requirement.industry.includes("美妆") ? "清新自然" : "真实生活感"),
  };
}

export function agentReplyForStage(
  stage: string,
  context: { requirement?: RequirementBrief; productName?: string }
): string {
  switch (stage) {
    case "confirm": {
      const tpl = context.requirement?.templateName;
      if (tpl) {
        return `已根据「${tpl}」完成需求拆解，右侧字段列表已同步。若确认无误请点击「确认基础信息」或直接发送「需求确认」。`;
      }
      return `已识别基础信息与选品策略，右侧「AI 素材方案」已同步。请核对或修改后点击「确认基础信息」，也可直接发送「需求确认」。`;
    }
    case "requirement_review":
      return `需求单已整理完成。确认后将进入智能选品环节。`;
    case "product_review":
      return `已根据选品策略从内部 SKU 库智能推荐商品。可删除不合适的商品，确认后点击「选品 OK」。`;
    case "creative_review":
      return context.productName
        ? `选品已确认：${context.productName}。请点击「创意生成」，生成后可继续微调。`
        : `请点击「创意生成」为已选商品生成创意方案。`;
    case "creative_ready":
      return `创意方案已生成，含各模块详细创意说明，下方配置面板已自动填充（带 Agent 标识）。确认无误后点击「确认并开始生成」。`;
    case "generating":
      return "创意方案已锁定，正在调用大模型生成广告素材…";
    case "external_review":
      return "素材已生成，正在提交巨量引擎外部审核，请稍候。";
    case "completed":
      return "巨量审核已通过，素材已入库，投放同学可在素材库中使用。";
    case "rejected":
      return "巨量审核未通过，请根据驳回原因调整后重新生成。";
    default:
      return "请描述您的投放诉求，例如：我要给省钱神券中心做一批外投图片，投抖音，突出领券后更划算，整体真实一点，帮我智能选一批适合省钱和捡漏表达的商品。";
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

export function applyRequirementTweak(
  requirement: RequirementBrief,
  userMessage: string
): RequirementBrief {
  const next = { ...requirement };
  const t = userMessage;

  const media = extractMedia(t);
  if (media) {
    next.media = media;
    next.platform = media;
    next.sizeRequirement = extractSizeRequirement(media, next.materialType);
  }

  if (t.includes("外投") || t.includes("信息流") || t.includes("站内")) {
    next.channel = extractChannel(t);
  }

  const promo = extractPromotion(t);
  if (promo) next.promotion = promo;

  const price = extractPriceRange(t);
  if (price) next.priceRange = price;

  if (t.includes("卖点") || t.includes("强调") || t.includes("突出")) {
    const points = extractSellingPoints(t);
    if (points !== "核心卖点待确认") next.sellingPoints = points;
  }

  const style = extractVisualStyle(t);
  if (style) next.visualStyle = style;

  if (/智能选|选品数量|选(\d+)个/.test(t)) {
    const countMatch = t.match(/选(\d+)个|(\d+)\s*个商品/);
    next.selectionCount = countMatch ? Number(countMatch[1] ?? countMatch[2]) : 10;
    next.productSelectionMethod = "AI 智能选品";
  }

  if (t.includes("省钱") || t.includes("捡漏")) {
    next.selectionStrategy = buildSelectionStrategy(t);
  }

  const durationMatch = t.match(/(\d+)\s*秒/);
  if (durationMatch) next.duration = Number(durationMatch[1]);

  const creativesMatch = t.match(/每(?:个)?商品\s*(\d+)\s*(?:张|个|条)/);
  if (creativesMatch) next.creativesPerProduct = Number(creativesMatch[1]);

  return next;
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
  if (/真实|写实/.test(t)) next.visualStyle = "真实生活感";
  return next;
}
