import type { MaterialType } from "@/lib/types";
import { applySilentChannelFields, applySilentVideoChannelFields } from "./silent-fields";
import {
  inferAutoSubtitle,
  inferVideoDurationTier,
} from "./video-native-flow";
import { parseRequirementFromIntent } from "./parser";
import type { RequirementBrief } from "./types";

/** 左侧需求结构化解读面板字段 */
export interface RequirementInterpretation {
  taskName: string;
  channel: string;
  media: string;
  materialType: MaterialType;
  sizeRequirement: string;
  creativesPerProduct: number;
  landingType: string;
  coreSummary: string;
  specialConstraints: string;
  selectionCount: number;
  selectionStrategy: string;
  productKeywords: string;
  /** AI 原生图片：用户可控变量 */
  adTheme: string;
  campaignGoal: string;
  targetAudience: string;
  userPainPoints: string;
  coreBenefit: string;
  visualStyle: string;
  contentTone: string;
}

export type InterpretFieldKey = keyof RequirementInterpretation;

/** 回填右侧表单所必需的关键字段 */
export const CRITICAL_INTERPRET_KEYS: InterpretFieldKey[] = ["media"];

export interface InterpretParseResult {
  interpretation: RequirementInterpretation;
  requirement: RequirementBrief;
  missingFields: InterpretFieldKey[];
  canAutoFillRight: boolean;
  agentFilledKeys: InterpretFieldKey[];
}

const FIELD_LABELS: Record<InterpretFieldKey, string> = {
  taskName: "任务名称",
  channel: "投放渠道",
  media: "投放媒体",
  materialType: "素材类型",
  sizeRequirement: "尺寸要求",
  creativesPerProduct: "单商品生成素材数",
  landingType: "素材承接类型",
  coreSummary: "核心投放总结",
  specialConstraints: "特殊约束备注",
  selectionCount: "智能选品数量",
  selectionStrategy: "选品策略",
  productKeywords: "产品关键词",
  adTheme: "广告主题",
  campaignGoal: "投放目标",
  targetAudience: "核心投放人群",
  userPainPoints: "用户核心痛点",
  coreBenefit: "核心利益点",
  visualStyle: "整体视觉风格",
  contentTone: "内容调性",
};

function extractAdTheme(text: string): string {
  if (/618|双11|大促|节日/.test(text)) return "节日主题";
  if (/新品|上市|首发/.test(text)) return "新品上市";
  if (/达人|种草|KOL/.test(text)) return "达人种草";
  if (/秒杀|限时|福利/.test(text)) return "福利秒杀";
  if (/日常|常规/.test(text)) return "日常促销";
  if (/省钱|捡漏|券/.test(text)) return "日常促销";
  return "";
}

function extractCampaignGoal(text: string): string {
  if (/拉新|引流|获客/.test(text)) return "拉新引流";
  if (/转化|下单|成交|ROI/.test(text)) return "促进转化";
  if (/点击|CTR|曝光量/.test(text)) return "提升点击";
  if (/品牌|曝光|认知/.test(text)) return "品牌曝光";
  if (/领券|划算|捡漏/.test(text)) return "促进转化";
  return "";
}

function extractTargetAudience(text: string): string {
  const parts: string[] = [];
  if (/学生|大学生|年轻/.test(text)) parts.push("18-25岁学生党");
  if (/上班族|白领|通勤|职场/.test(text)) parts.push("25-40岁上班族");
  if (/宝妈|妈妈|亲子/.test(text)) parts.push("有娃家庭");
  if (/女性|女生|姐妹/.test(text)) parts.push("女性用户");
  if (/男性|男士/.test(text)) parts.push("男性用户");
  if (/下沉|三四线/.test(text)) parts.push("下沉市场");
  if (/精致|轻奢|品质/.test(text)) parts.push("品质消费层");
  return parts.join("、");
}

function extractUserPainPoints(text: string): string {
  if (/晒黑|闷痘|厚重/.test(text)) return "防晒厚重闷痘、户外晒黑";
  if (/贵|太贵|预算/.test(text)) return "价格敏感、希望更划算";
  if (/选择困难|不知道买/.test(text)) return "不知道选什么、决策成本高";
  if (/省钱|捡漏/.test(text)) return "想省钱但怕踩坑、希望券后真实低价";
  const m = text.match(/痛点[是为：:]\s*(.{4,30})/);
  if (m?.[1]) return m[1].trim();
  return "";
}

function extractCoreBenefit(text: string): string {
  const parts: string[] = [];
  if (/领券|优惠券|券后/.test(text)) parts.push("优惠券");
  if (/低价|便宜|划算|捡漏/.test(text)) parts.push("低价捡漏");
  if (/赠品|买赠/.test(text)) parts.push("赠品");
  if (/秒杀|限时/.test(text)) parts.push("限时秒杀");
  if (/新品|首发/.test(text)) parts.push("新品首发");
  if (/刚需|实用|必备/.test(text)) parts.push("刚需实用");
  return parts.join("、");
}

function extractVisualStyle(text: string): string {
  if (/真实|写实|生活/.test(text)) return "生活化种草";
  if (/简约|高级|轻奢/.test(text)) return "简约高级";
  if (/促销|热闹|大促|618/.test(text)) return "热闹促销";
  if (/国风|国潮/.test(text)) return "国风";
  if (/市井|接地气/.test(text)) return "接地气市井风";
  if (/轻奢/.test(text)) return "轻奢";
  return "";
}

function extractContentTone(text: string): string {
  if (/种草|温和|分享/.test(text)) return "温和种草";
  if (/逼单|强营销| urgency/.test(text)) return "强营销逼单";
  if (/趣味|搞笑|生活化/.test(text)) return "趣味生活化";
  if (/测评|专业|对比/.test(text)) return "专业测评";
  if (/捡漏|划算|领券/.test(text)) return "强营销逼单";
  return "";
}

function coreSummaryFrom(text: string, req: RequirementBrief): string {
  const parts: string[] = [];
  if (req.sellingPoints && req.sellingPoints !== "核心卖点待确认") {
    parts.push(`主打卖点：${req.sellingPoints}`);
  }
  if (req.visualStyle) parts.push(`画面风格：${req.visualStyle}`);
  if (req.promotion) parts.push(`促销节点：${req.promotion}`);
  if (text.includes("省钱") || text.includes("捡漏")) {
    parts.push("营销倾向：省钱捡漏、券后更划算");
  }
  return parts.join("；") || "待补充核心投放目标与风格描述";
}

function specialConstraintsFrom(text: string): string {
  const constraints: string[] = [];
  if (/违禁|合规|极限宣传|虚假宣传|禁用/.test(text)) {
    constraints.push("注意平台合规，避免极限宣传与违禁表述");
  }
  if (/logo|品牌/.test(text)) constraints.push("需带指定品牌 Logo");
  if (/固定文案|引导文案/.test(text)) constraints.push("使用固定引导文案");
  if (/不要|禁止|避雷/.test(text)) {
    const m = text.match(/不要(.{2,20})|禁止(.{2,20})/);
    if (m) constraints.push(`画面避雷：${(m[1] ?? m[2] ?? "").trim()}`);
  }
  return constraints.join("；");
}

export function parseRequirementInterpretation(
  userIntent: string,
  materialType: MaterialType
): InterpretParseResult {
  let requirement = parseRequirementFromIntent(userIntent, materialType);
  const agentFilledKeys: InterpretFieldKey[] = [];

  const interpretation: RequirementInterpretation = {
    taskName: "",
    channel: "",
    media: "",
    materialType,
    sizeRequirement: "",
    creativesPerProduct: requirement.creativesPerProduct ?? (materialType === "video" ? 3 : 6),
    landingType: "",
    coreSummary: "",
    specialConstraints: "",
    selectionCount: requirement.selectionCount ?? 5,
    selectionStrategy: "",
    productKeywords: "",
    adTheme: "",
    campaignGoal: "",
    targetAudience: "",
    userPainPoints: "",
    coreBenefit: "",
    visualStyle: "",
    contentTone: "",
  };

  if (requirement.media || requirement.platform) {
    interpretation.media = requirement.media ?? requirement.platform;
    agentFilledKeys.push("media");
    requirement =
      materialType === "video"
        ? applySilentVideoChannelFields(requirement, interpretation.media)
        : applySilentChannelFields(requirement, interpretation.media);
    interpretation.channel = requirement.channel ?? "";
    if (requirement.channel) agentFilledKeys.push("channel");
  }

  if (materialType === "video") {
    requirement.autoSubtitle = inferAutoSubtitle(userIntent);
    requirement.videoDurationTier = inferVideoDurationTier(userIntent, requirement.media);
    requirement.duration = parseInt(requirement.videoDurationTier ?? "15", 10);
  }

  if (requirement.taskName) {
    interpretation.taskName = requirement.taskName;
    agentFilledKeys.push("taskName");
  }

  const adTheme = extractAdTheme(userIntent);
  if (adTheme) {
    interpretation.adTheme = adTheme;
    agentFilledKeys.push("adTheme");
  }

  const campaignGoal = extractCampaignGoal(userIntent);
  if (campaignGoal) {
    interpretation.campaignGoal = campaignGoal;
    agentFilledKeys.push("campaignGoal");
  }

  const targetAudience = extractTargetAudience(userIntent) || requirement.audience || "";
  if (targetAudience) {
    interpretation.targetAudience = targetAudience;
    agentFilledKeys.push("targetAudience");
  }

  const userPainPoints = extractUserPainPoints(userIntent);
  if (userPainPoints) {
    interpretation.userPainPoints = userPainPoints;
    agentFilledKeys.push("userPainPoints");
  }

  const coreBenefit = extractCoreBenefit(userIntent);
  if (coreBenefit) {
    interpretation.coreBenefit = coreBenefit;
    agentFilledKeys.push("coreBenefit");
  }

  const visualStyle =
    extractVisualStyle(userIntent) || requirement.visualStyle || "";
  if (visualStyle) {
    interpretation.visualStyle = visualStyle;
    agentFilledKeys.push("visualStyle");
    requirement.visualStyle = visualStyle;
  }

  const contentTone = extractContentTone(userIntent);
  if (contentTone) {
    interpretation.contentTone = contentTone;
    agentFilledKeys.push("contentTone");
  }

  if (requirement.landingType) {
    interpretation.landingType = requirement.landingType;
    agentFilledKeys.push("landingType");
  }

  const summary = coreSummaryFrom(userIntent, requirement);
  if (summary !== "待补充核心投放目标与风格描述") {
    interpretation.coreSummary = summary;
    agentFilledKeys.push("coreSummary");
  }

  const constraints = specialConstraintsFrom(userIntent);
  if (constraints) {
    interpretation.specialConstraints = constraints;
    agentFilledKeys.push("specialConstraints");
  }

  if (requirement.selectionCount && /选品|选\s*\d|个商品|款商品/.test(userIntent)) {
    agentFilledKeys.push("selectionCount");
  }
  if (requirement.selectionStrategy) {
    interpretation.selectionStrategy = requirement.selectionStrategy;
    agentFilledKeys.push("selectionStrategy");
  }
  if (requirement.productKeywords) {
    interpretation.productKeywords = requirement.productKeywords;
    agentFilledKeys.push("productKeywords");
  }

  // 默认选品配置（图片原生链路）
  if (materialType === "image") {
    requirement.productDataPool = requirement.productDataPool ?? "平台大盘热销池";
    requirement.pickMethod = requirement.pickMethod ?? "AI 智能优选";
    requirement.selectionCoreStrategy =
      requirement.selectionCoreStrategy ?? "匹配度策略：匹配投放人群、场景、利益点";
    requirement.hasBenefitRights =
      userIntent.includes("券") || userIntent.includes("领券") ? "是" : "否";
    requirement.categoryName = requirement.industry;
  }

  const missingFields = CRITICAL_INTERPRET_KEYS.filter((k) => !interpretation[k]);

  return {
    interpretation,
    requirement: {
      ...requirement,
      adTheme: interpretation.adTheme || undefined,
      campaignGoal: interpretation.campaignGoal || undefined,
      targetAudience: interpretation.targetAudience || undefined,
      userPainPoints: interpretation.userPainPoints || undefined,
      coreBenefit: interpretation.coreBenefit || undefined,
      contentTone: interpretation.contentTone || undefined,
      coreSummary: interpretation.coreSummary || undefined,
      specialConstraints: interpretation.specialConstraints || undefined,
    },
    missingFields,
    canAutoFillRight: missingFields.length === 0,
    agentFilledKeys,
  };
}

export function interpretationToRequirement(
  interpretation: RequirementInterpretation,
  base: RequirementBrief,
  agentFilledKeys?: InterpretFieldKey[]
): RequirementBrief {
  const keys = agentFilledKeys ?? (Object.keys(interpretation) as InterpretFieldKey[]);
  let next: RequirementBrief = { ...base };

  for (const key of keys) {
    switch (key) {
      case "taskName":
        if (interpretation.taskName) next.taskName = interpretation.taskName;
        break;
      case "channel":
        if (interpretation.channel) next.channel = interpretation.channel;
        break;
      case "media":
        if (interpretation.media) {
          next.media = interpretation.media;
          next.platform = interpretation.media;
          next =
            next.materialType === "video"
              ? applySilentVideoChannelFields(next, interpretation.media)
              : applySilentChannelFields(next, interpretation.media);
        }
        break;
      case "creativesPerProduct":
        next.creativesPerProduct = interpretation.creativesPerProduct;
        break;
      case "landingType":
        if (interpretation.landingType) next.landingType = interpretation.landingType;
        break;
      case "coreSummary":
        if (interpretation.coreSummary) next.coreSummary = interpretation.coreSummary;
        break;
      case "specialConstraints":
        if (interpretation.specialConstraints) {
          next.specialConstraints = interpretation.specialConstraints;
          next.supplementNotes = interpretation.specialConstraints;
        }
        break;
      case "selectionCount":
        next.selectionCount = interpretation.selectionCount;
        break;
      case "selectionStrategy":
        if (interpretation.selectionStrategy) next.selectionStrategy = interpretation.selectionStrategy;
        break;
      case "productKeywords":
        if (interpretation.productKeywords) next.productKeywords = interpretation.productKeywords;
        break;
      case "materialType":
        next.materialType = interpretation.materialType;
        break;
      case "adTheme":
        if (interpretation.adTheme) next.adTheme = interpretation.adTheme;
        break;
      case "campaignGoal":
        if (interpretation.campaignGoal) next.campaignGoal = interpretation.campaignGoal;
        break;
      case "targetAudience":
        if (interpretation.targetAudience) {
          next.targetAudience = interpretation.targetAudience;
          next.audience = interpretation.targetAudience;
        }
        break;
      case "userPainPoints":
        if (interpretation.userPainPoints) next.userPainPoints = interpretation.userPainPoints;
        break;
      case "coreBenefit":
        if (interpretation.coreBenefit) next.coreBenefit = interpretation.coreBenefit;
        break;
      case "visualStyle":
        if (interpretation.visualStyle) next.visualStyle = interpretation.visualStyle;
        break;
      case "contentTone":
        if (interpretation.contentTone) next.contentTone = interpretation.contentTone;
        break;
    }
  }

  return next;
}

export function buildPartialDisplayRequirement(
  interpretation: RequirementInterpretation,
  serverReq: RequirementBrief,
  agentFilledKeys: InterpretFieldKey[]
): RequirementBrief {
  const next = { ...serverReq };
  const keyMap: Partial<Record<InterpretFieldKey, keyof RequirementBrief>> = {
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

  for (const [iKey, rKey] of Object.entries(keyMap) as [InterpretFieldKey, keyof RequirementBrief][]) {
    if (agentFilledKeys.includes(iKey)) {
      const raw = interpretation[iKey];
      (next as Record<string, unknown>)[rKey] = raw;
      if (iKey === "media") {
        next.platform = String(raw);
        Object.assign(
          next,
          next.materialType === "video"
            ? applySilentVideoChannelFields(next, String(raw))
            : applySilentChannelFields(next, String(raw))
        );
      }
      if (iKey === "targetAudience") next.audience = String(raw);
      if (iKey === "specialConstraints") next.supplementNotes = String(raw);
    } else if (
      iKey !== "materialType" &&
      iKey !== "creativesPerProduct" &&
      iKey !== "selectionCount"
    ) {
      (next as Record<string, unknown>)[rKey] = "";
    }
  }

  return next;
}

export function buildAgentParseReply(_result: InterpretParseResult): string {
  return "已完成需求拆解，请核对右侧字段后点击确认基础信息进入智能选品";
}

export function detectMissingInfoReply(missing: InterpretFieldKey[]): string {
  const need = missing.map((k) => FIELD_LABELS[k]).join("、");
  return `「${need}」未从诉求中识别，请在右侧手动补充即可，不必重写运营诉求。`;
}

export function agentFilledLabel(field: InterpretFieldKey): boolean {
  return field !== "materialType";
}
