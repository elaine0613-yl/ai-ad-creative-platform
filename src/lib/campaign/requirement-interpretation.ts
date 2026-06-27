import type { MaterialType } from "@/lib/types";
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
}

export type InterpretFieldKey = keyof RequirementInterpretation;

/** 回填右侧表单所必需的关键字段 */
export const CRITICAL_INTERPRET_KEYS: InterpretFieldKey[] = [
  "channel",
  "media",
  "landingType",
];

export interface InterpretParseResult {
  interpretation: RequirementInterpretation;
  requirement: RequirementBrief;
  missingFields: InterpretFieldKey[];
  /** 关键字段是否齐全（不影响部分回填） */
  canAutoFillRight: boolean;
  agentFilledKeys: InterpretFieldKey[];
}

const FIELD_LABELS: Record<InterpretFieldKey, string> = {
  taskName: "任务名称",
  channel: "投放渠道",
  media: "素材媒体",
  materialType: "素材类型",
  sizeRequirement: "尺寸要求",
  creativesPerProduct: "单商品生成素材数",
  landingType: "素材承接类型",
  coreSummary: "核心投放总结",
  specialConstraints: "特殊约束备注",
  selectionCount: "智能选品数量",
  selectionStrategy: "选品策略",
  productKeywords: "产品关键词",
};

function extractSizeFromText(text: string): string {
  const ratios = text.match(/\d:\d/g);
  if (ratios?.length) return ratios.join("、");
  if (/1080\s*[x×]\s*1920/.test(text)) return "1080x1920";
  if (/800\s*[x×]\s*800/.test(text)) return "800x800";
  if (/3:4/.test(text) && /1:1/.test(text)) return "3:4、1:1";
  if (/3:4/.test(text)) return "3:4";
  if (/1:1/.test(text)) return "1:1";
  if (/9:16/.test(text)) return "9:16";
  return "";
}

function extractLandingFromText(text: string): string {
  if (/活动页|专题/.test(text)) return "活动页";
  if (/直播间/.test(text)) return "直播间";
  if (/商品/.test(text)) return "商品";
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
  const requirement = parseRequirementFromIntent(userIntent, materialType);
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
    selectionCount: requirement.selectionCount ?? 10,
    selectionStrategy: "",
    productKeywords: "",
  };

  if (requirement.taskName) {
    interpretation.taskName = requirement.taskName;
    agentFilledKeys.push("taskName");
  }
  if (requirement.channel) {
    interpretation.channel = requirement.channel;
    agentFilledKeys.push("channel");
  }
  if (requirement.media || requirement.platform) {
    interpretation.media = requirement.media ?? requirement.platform;
    agentFilledKeys.push("media");
  }
  const sizeFromText = extractSizeFromText(userIntent);
  if (sizeFromText) {
    interpretation.sizeRequirement = sizeFromText;
    agentFilledKeys.push("sizeRequirement");
  } else if (requirement.sizeRequirement && /尺寸|比例|1080|9:16|1:1|3:4/.test(userIntent)) {
    interpretation.sizeRequirement = requirement.sizeRequirement;
    agentFilledKeys.push("sizeRequirement");
  }
  if (requirement.creativesPerProduct && /\d+\s*[个条]|生成\s*\d+|每个商品\s*\d+/.test(userIntent)) {
    interpretation.creativesPerProduct = requirement.creativesPerProduct;
    agentFilledKeys.push("creativesPerProduct");
  }
  const landingFromText = extractLandingFromText(userIntent);
  if (landingFromText) {
    interpretation.landingType = landingFromText;
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

  const missingFields = CRITICAL_INTERPRET_KEYS.filter((k) => !interpretation[k]);

  return {
    interpretation,
    requirement: {
      ...requirement,
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
  const next: RequirementBrief = { ...base };

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
        }
        break;
      case "sizeRequirement":
        if (interpretation.sizeRequirement) next.sizeRequirement = interpretation.sizeRequirement;
        break;
      case "creativesPerProduct":
        next.creativesPerProduct = interpretation.creativesPerProduct;
        break;
      case "landingType":
        if (interpretation.landingType) next.landingType = interpretation.landingType;
        break;
      case "coreSummary":
        if (interpretation.coreSummary) {
          next.coreSummary = interpretation.coreSummary;
          if (interpretation.coreSummary.includes("真实")) {
            next.visualStyle = "真实生活感";
          }
        }
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
    }
  }

  return next;
}

/** 仅展示 Agent 识别字段，未识别字段留空供运营填写 */
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
    sizeRequirement: "sizeRequirement",
    creativesPerProduct: "creativesPerProduct",
    landingType: "landingType",
    coreSummary: "coreSummary",
    specialConstraints: "specialConstraints",
    selectionCount: "selectionCount",
    selectionStrategy: "selectionStrategy",
    productKeywords: "productKeywords",
  };

  for (const [iKey, rKey] of Object.entries(keyMap) as [InterpretFieldKey, keyof RequirementBrief][]) {
    if (agentFilledKeys.includes(iKey)) {
      const raw = interpretation[iKey];
      (next as Record<string, unknown>)[rKey] = raw;
      if (iKey === "media") {
        next.platform = String(raw);
      }
      if (iKey === "specialConstraints") {
        next.supplementNotes = String(raw);
      }
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

/** Agent 解析后的对话回复：说明已填入项 + 需手动补充项 */
export function buildAgentParseReply(result: InterpretParseResult): string {
  const filled = result.agentFilledKeys
    .filter((k) => k !== "materialType")
    .map((k) => FIELD_LABELS[k]);

  const missing = result.missingFields.map((k) => FIELD_LABELS[k]);

  const parts: string[] = [];
  if (filled.length > 0) {
    parts.push(`已从诉求识别并填入右侧：${filled.join("、")}（带 Agent 标签项）。`);
  } else {
    parts.push("暂未从诉求中匹配到结构化字段。");
  }
  if (missing.length > 0) {
    parts.push(`「${missing.join("、")}」未识别，请直接在右侧对应字段手动补充，无需重写诉求。`);
  } else {
    parts.push("关键字段已齐，请核对右侧方案后继续。");
  }
  return parts.join("");
}

export function detectMissingInfoReply(missing: InterpretFieldKey[]): string {
  const need = missing.map((k) => FIELD_LABELS[k]).join("、");
  return `「${need}」未从诉求中识别，请在右侧手动补充即可，不必重写运营诉求。`;
}

export function agentFilledLabel(field: InterpretFieldKey): boolean {
  return field !== "materialType";
}
