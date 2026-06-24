import type { CampaignSnapshot, CreativeBrief, RequirementBrief } from "./types";
import type { MaterialType } from "@/lib/types";

export type FieldOwner = "operator" | "agent" | "auto";

export interface CampaignFieldItem {
  id: string;
  label: string;
  value: string;
  owner: FieldOwner;
  editable: boolean;
  fieldKey: string;
  placeholder?: string;
  multiline?: boolean;
}

export interface CampaignFieldGroup {
  id: string;
  title: string;
  description: string;
  owner: FieldOwner;
  items: CampaignFieldItem[];
}

function display(value: string | number | boolean | undefined | null, fallback = "待补充"): string {
  if (value === undefined || value === null || value === "") return fallback;
  if (typeof value === "boolean") return value ? "是" : "否";
  return String(value);
}

function requirementFields(
  requirement: RequirementBrief,
  materialType: MaterialType
): CampaignFieldItem[] {
  const items: CampaignFieldItem[] = [
    {
      id: "platform",
      label: "投放平台",
      value: display(requirement.platform),
      owner: "operator",
      editable: true,
      fieldKey: "platform",
      placeholder: "如：淘宝、抖音、小红书",
    },
    {
      id: "sellingPoints",
      label: "核心卖点",
      value: display(requirement.sellingPoints),
      owner: "operator",
      editable: true,
      fieldKey: "sellingPoints",
      placeholder: "如：轻薄不闷痘、48 小时防护",
      multiline: true,
    },
    {
      id: "promotion",
      label: "促销节点",
      value: display(requirement.promotion),
      owner: "operator",
      editable: true,
      fieldKey: "promotion",
      placeholder: "如：618、双 11、限时特惠",
    },
    {
      id: "priceRange",
      label: "价格区间",
      value: display(requirement.priceRange),
      owner: "operator",
      editable: true,
      fieldKey: "priceRange",
      placeholder: "如：150 元左右、99-199 元",
    },
    {
      id: "audience",
      label: "目标人群",
      value: display(requirement.audience),
      owner: "operator",
      editable: true,
      fieldKey: "audience",
      placeholder: "如：年轻女性、职场白领",
    },
    {
      id: "supplementNotes",
      label: "补充说明",
      value: display(requirement.supplementNotes, ""),
      owner: "operator",
      editable: true,
      fieldKey: "supplementNotes",
      placeholder: "其他需要 Agent 知道的约束或偏好",
      multiline: true,
    },
  ];

  if (materialType === "video") {
    items.splice(1, 0, {
      id: "duration",
      label: "视频时长",
      value: display(requirement.duration ? `${requirement.duration} 秒` : undefined),
      owner: "operator",
      editable: true,
      fieldKey: "duration",
      placeholder: "如：15 秒、30 秒",
    });
  }

  return items;
}

function agentPresetFields(
  requirement: RequirementBrief,
  creative: CreativeBrief | null,
  materialType: MaterialType
): CampaignFieldItem[] {
  const items: CampaignFieldItem[] = [
    {
      id: "templateName",
      label: "业务模板",
      value: requirement.templateName,
      owner: "agent",
      editable: false,
      fieldKey: "templateName",
    },
    {
      id: "industry",
      label: "行业",
      value: display(requirement.industry),
      owner: "agent",
      editable: true,
      fieldKey: "industry",
      placeholder: "如：美妆护肤、3C 数码",
    },
    {
      id: "productKeywords",
      label: "产品关键词",
      value: display(requirement.productKeywords),
      owner: "agent",
      editable: true,
      fieldKey: "productKeywords",
      placeholder: "如：防晒、无线耳机",
    },
    {
      id: "aspectRatio",
      label: "画面比例",
      value: display(requirement.aspectRatio),
      owner: "agent",
      editable: true,
      fieldKey: "aspectRatio",
      placeholder: materialType === "video" ? "如：9:16" : "如：1:1、3:4",
    },
  ];

  if (creative) {
    items.push(
      {
        id: "visualStyle",
        label: "视觉风格",
        value: display(creative.visualStyle),
        owner: "agent",
        editable: true,
        fieldKey: "visualStyle",
        placeholder: "如：清新自然、促销热闹",
      },
      {
        id: "coverTitle",
        label: materialType === "video" ? "封面标题" : "主图封题",
        value: display(creative.coverTitle),
        owner: "agent",
        editable: true,
        fieldKey: "coverTitle",
        placeholder: "生成素材的主标题文案",
      },
      {
        id: "cta",
        label: "CTA 行动号召",
        value: display(creative.cta),
        owner: "agent",
        editable: true,
        fieldKey: "cta",
        placeholder: "如：立即购买、扫码领券",
      }
    );

    if (materialType === "video") {
      items.push(
        {
          id: "bgm",
          label: "BGM 配乐",
          value: display(creative.bgm),
          owner: "agent",
          editable: true,
          fieldKey: "bgm",
          placeholder: "如：节奏感强、轻音乐",
        },
        {
          id: "storyboard",
          label: "分镜结构",
          value: display(creative.storyboard),
          owner: "agent",
          editable: true,
          fieldKey: "storyboard",
          placeholder: "钩子 → 卖点 → CTA",
          multiline: true,
        },
        {
          id: "voiceover",
          label: "配音旁白",
          value: display(creative.voiceover),
          owner: "agent",
          editable: true,
          fieldKey: "voiceover",
          placeholder: "是 / 否",
        },
        {
          id: "subtitle",
          label: "字幕花字",
          value: display(creative.subtitle),
          owner: "agent",
          editable: true,
          fieldKey: "subtitle",
          placeholder: "是 / 否",
        }
      );
    }
  }

  return items;
}

function autoCompleteFields(materialType: MaterialType): CampaignFieldItem[] {
  const typeLabel = materialType === "video" ? "视频" : "图片";
  return [
    {
      id: "auto-generate",
      label: "大模型生成",
      value: `根据上方字段自动生成${typeLabel}素材`,
      owner: "auto",
      editable: false,
      fieldKey: "auto-generate",
    },
    {
      id: "auto-audit",
      label: "平台规范审核",
      value: "按投放平台要求自动提交巨量引擎审核",
      owner: "auto",
      editable: false,
      fieldKey: "auto-audit",
    },
    {
      id: "auto-library",
      label: "入库投放",
      value: "审核通过后自动写入素材库，可直接投放",
      owner: "auto",
      editable: false,
      fieldKey: "auto-library",
    },
  ];
}

export function buildCampaignFieldGroups(
  campaign: CampaignSnapshot,
  materialType: MaterialType
): CampaignFieldGroup[] {
  if (!campaign.requirement) return [];

  const { requirement, creative } = campaign;

  return [
    {
      id: "operator",
      title: "需您确认或补充",
      description: "来自您的描述，请核对或直接在右侧修改；也可在左侧对话补充",
      owner: "operator",
      items: requirementFields(requirement, materialType),
    },
    {
      id: "agent",
      title: "Agent 已解析预设",
      description: "Agent 根据需求自动匹配，您可微调后再生成",
      owner: "agent",
      items: agentPresetFields(requirement, creative, materialType),
    },
    {
      id: "auto",
      title: "确认后 Agent 自动完成",
      description: "点击「确认并生成」后无需再操作",
      owner: "auto",
      items: autoCompleteFields(materialType),
    },
  ];
}

export function applyFieldUpdates(
  requirement: RequirementBrief,
  creative: CreativeBrief | null,
  updates: Record<string, string>
): { requirement: RequirementBrief; creative: CreativeBrief | null } {
  const nextReq = { ...requirement };
  const nextCreative = creative ? { ...creative } : null;

  const reqKeys: (keyof RequirementBrief)[] = [
    "platform",
    "industry",
    "productKeywords",
    "sellingPoints",
    "audience",
    "promotion",
    "priceRange",
    "aspectRatio",
    "supplementNotes",
  ];

  for (const key of reqKeys) {
    if (key in updates) {
      const raw = updates[key].trim();
      (nextReq as Record<string, unknown>)[key] = raw || undefined;
    }
  }

  if ("duration" in updates) {
    const m = updates.duration.match(/(\d+)/);
    nextReq.duration = m ? Number(m[1]) : undefined;
  }

  if (nextCreative) {
    const creativeKeys: (keyof CreativeBrief)[] = [
      "coverTitle",
      "bgm",
      "cta",
      "storyboard",
      "visualStyle",
    ];
    for (const key of creativeKeys) {
      if (key in updates) {
        const raw = updates[key].trim();
        (nextCreative as Record<string, unknown>)[key] = raw || undefined;
      }
    }
    if ("voiceover" in updates) {
      nextCreative.voiceover = updates.voiceover === "是";
    }
    if ("subtitle" in updates) {
      nextCreative.subtitle = updates.subtitle === "是";
    }
  }

  return { requirement: nextReq, creative: nextCreative };
}
