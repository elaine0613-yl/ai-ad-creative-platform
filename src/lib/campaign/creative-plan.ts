import type { ImageCreationConfig, VideoCreationConfig } from "@/lib/create/config-types";
import { defaultImageConfig, defaultVideoConfig } from "@/lib/create/config-types";
import type { MaterialType } from "@/lib/types";
import { BUSINESS_TEMPLATES } from "./templates";
import type {
  CreativeBrief,
  CreativePlanPackage,
  CreativePlanSection,
  RequirementBrief,
  SkuRecord,
} from "./types";

function industryKey(industry: string): string {
  const map: Record<string, string> = {
    美妆护肤: "beauty",
    电商百货: "home",
    "3C数码": "3c",
    食品饮料: "food",
  };
  return map[industry] ?? "home";
}

function visualStyleFromRequirement(requirement: RequirementBrief): string {
  const map: Record<string, string> = {
    真实生活感: "写实高清",
    清新自然: "电商通透种草风",
    促销热闹: "国潮风格",
    科技简约: "轻奢质感",
  };
  return map[requirement.visualStyle ?? ""] ?? requirement.visualStyle ?? "写实高清";
}

function sellingLines(requirement: RequirementBrief): string[] {
  return requirement.sellingPoints
    .split(/[、,\n]/)
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 3);
}

function collectAgentFilledKeys(values: Record<string, unknown>, prefix = ""): string[] {
  const keys: string[] = [];
  for (const [k, v] of Object.entries(values)) {
    const path = prefix ? `${prefix}.${k}` : k;
    if (v !== null && typeof v === "object" && !Array.isArray(v)) {
      keys.push(...collectAgentFilledKeys(v as Record<string, unknown>, path));
    } else if (
      v !== "" &&
      v !== false &&
      v !== 0 &&
      !(Array.isArray(v) && v.length === 0)
    ) {
      keys.push(path);
    }
  }
  return keys;
}

function buildImageConfigFromPlan(
  requirement: RequirementBrief,
  sku: SkuRecord,
  userIntent = ""
): ImageCreationConfig {
  const lines = sellingLines(requirement);
  const isCoupon =
    userIntent.includes("领券") ||
    userIntent.includes("划算") ||
    requirement.sellingPoints.includes("领券") ||
    requirement.templateId.includes("coupon");

  const salePrice = Math.round(sku.price * 0.85);
  const originalPrice = sku.price;

  return {
    aspectRatio: requirement.aspectRatio ?? "9:16",
    compositionTemplate: "pub-comp-001",
    industryTemplate: industryKey(requirement.industry),
    subjectDescription: `${sku.name}，${requirement.productKeywords || "核心商品"}，${requirement.visualStyle?.includes("真实") ? "真实生活场景展示" : "突出产品质感与使用场景"}`,
    referenceAssetId: sku.imageUrl ? "pri-ref-001" : "",
    visualStyle: visualStyleFromRequirement(requirement),
    lighting: requirement.visualStyle?.includes("真实") ? "自然日光" : "柔光通透",
    subjectEnhance: true,
    backgroundType: isCoupon ? "gradient" : "blur-scene",
    backgroundAssetId: isCoupon ? "pri-bg-001" : "pub-bg-001",
    mainTitle: lines[0] ?? `${sku.name} 限时特惠`,
    sellingPoints: lines.length > 1 ? lines.slice(1).join("\n") : `正品保障\n高性价比`,
    typographyTemplate: "pri-typo-001",
    textColorPrimary: "#1A1A1A",
    textColorAccent: isCoupon ? "#FF4D4F" : "#E63946",
    priceTagEnabled: isCoupon || !!requirement.promotion,
    originalPrice: String(originalPrice),
    salePrice: String(salePrice),
    marketingBadges: isCoupon
      ? ["限时", "立减", "热销"]
      : requirement.promotion
        ? ["限时", "爆款"]
        : ["新品"],
    ctaStyle: isCoupon ? "gradient" : "solid-red",
    ctaText: isCoupon ? "扫码领券" : "立即抢购",
    filterStyle: "pub-filter-001",
    microEffects: isCoupon ? ["glow", "shadow"] : ["matte"],
  };
}

function buildVideoConfigFromPlan(
  requirement: RequirementBrief,
  sku: SkuRecord,
  userIntent = ""
): VideoCreationConfig {
  const lines = sellingLines(requirement);
  const isCoupon = userIntent.includes("领券") || requirement.sellingPoints.includes("领券");

  return {
    duration: String(requirement.duration ?? 15),
    aspectRatio: requirement.aspectRatio ?? "9:16",
    globalStyle: requirement.visualStyle?.includes("真实") ? "慢节奏种草风格" : "快节奏带货风格",
    hookShot: {
      shotType: "产品特写镜头",
      description: `0~3s 钩子：${sku.name} 近景特写，${lines[0] ?? "核心利益点"}字幕快闪，制造停留`,
      assetId: "pri-clip-001",
    },
    sceneShot: {
      shotType: "中景使用场景镜头",
      description: `3~9s 场景：真实生活化使用场景，展示${requirement.productKeywords || "产品"}日常应用`,
      assetId: "",
    },
    sellingShot: {
      shotType: "前后对比镜头",
      description: `9~13s 卖点：${lines.join(" / ") || sku.name + " 核心优势"}，价格对比强调`,
      assetId: "",
    },
    ctaShot: {
      shotType: "全景环境镜头",
      description: `13~15s 转化：${isCoupon ? "领券后更划算" : "立即下单"}引导，品牌色收尾定格`,
      assetId: "",
    },
    transitionHookScene: "闪白硬切",
    transitionSceneSelling: "淡入淡出",
    transitionSellingCta: "滑动转场",
    transitionRhythm: "跟随背景音乐自动卡点",
    bgmAssetId: "pub-bgm-001",
    bgmVolume: 70,
    voiceoverScript: `${sku.name}，${requirement.sellingPoints || "品质好物推荐"}。${isCoupon ? "现在领券更划算，赶紧入手。" : "限时优惠，不要错过。"}`,
    voiceType: "温柔女声",
    voiceSpeed: 1.1,
    sfxPreset: "pub-sfx-001",
    subtitleText: lines.join(" · ") || sku.name,
    subtitleAnimation: "pub-sub-001",
    keywordHighlight: `${lines[0] ?? "特惠"}#FF4D4F放大`,
    dynamicBadges: isCoupon ? ["倒计时", "限时"] : ["热销"],
    guideElements: true,
    floatingStickers: isCoupon ? "领券浮动贴纸 + 价格标签" : "优惠角标组合",
    globalFilter: "pub-filter-001",
    endFrameAssetId: "",
  };
}

function buildImageSections(
  config: ImageCreationConfig,
  requirement: RequirementBrief,
  sku: SkuRecord
): CreativePlanSection[] {
  return [
    {
      moduleId: "canvas",
      title: "画布基础配置",
      rationale: `基于${requirement.media ?? requirement.platform}外投场景，选用 ${config.aspectRatio} 比例适配信息流；行业「${requirement.industry}」模板统一版式调性。`,
      items: [
        { label: "画面比例", value: config.aspectRatio },
        { label: "构图模板", value: "居中主体构图，留白给文案层" },
        { label: "行业模板", value: requirement.industry },
      ],
    },
    {
      moduleId: "subject",
      title: "主体视觉配置",
      rationale: `以「${sku.name}」为核心主体，${config.visualStyle}风格配合${config.lighting}，增强真实感与转化信任。`,
      items: [
        { label: "主体描述", value: config.subjectDescription },
        { label: "视觉风格", value: config.visualStyle },
        { label: "光影", value: config.lighting },
        { label: "超清增强", value: config.subjectEnhance ? "开启" : "关闭" },
        { label: "参考图", value: config.referenceAssetId ? "已匹配个人库参考图" : "AI 纯生成" },
      ],
    },
    {
      moduleId: "background",
      title: "背景配置",
      rationale: "背景弱化衬托主体，渐变色/场景图提升信息流点击率，优先调用个人库历史背景。",
      items: [
        { label: "背景类型", value: config.backgroundType },
        { label: "背景素材", value: config.backgroundAssetId ? "个人/公共库已选" : "系统生成" },
      ],
    },
    {
      moduleId: "copy",
      title: "多层结构化文案",
      rationale: "主标题抓利益点，副卖点短句分层展示，排版与配色强化促销感知。",
      items: [
        { label: "一级主标题", value: config.mainTitle },
        { label: "二级卖点", value: config.sellingPoints.replace(/\n/g, " / ") },
        { label: "字体排版", value: "大标题居中 + 副文案左对齐" },
        { label: "配色", value: `${config.textColorPrimary} / 强调 ${config.textColorAccent}` },
      ],
    },
    {
      moduleId: "marketing",
      title: "营销转化组件",
      rationale: "价格锚点 + 角标 + CTA 组合，符合信息流广告转化组件规范。",
      items: [
        { label: "价格标签", value: config.priceTagEnabled ? `¥${config.salePrice}（原价¥${config.originalPrice}）` : "关闭" },
        { label: "营销角标", value: config.marketingBadges.join("、") },
        { label: "转化按钮", value: `${config.ctaText}（${config.ctaStyle}）` },
      ],
    },
    {
      moduleId: "export",
      title: "美化滤镜与导出",
      rationale: "统一滤镜保证系列素材一致性，微特效提升精致度不过度干扰主体。",
      items: [
        { label: "滤镜", value: config.filterStyle || "电商通透滤镜" },
        { label: "微特效", value: config.microEffects.join("、") || "无" },
      ],
    },
  ];
}

function buildVideoSections(
  config: VideoCreationConfig,
  requirement: RequirementBrief,
  sku: SkuRecord
): CreativePlanSection[] {
  return [
    {
      moduleId: "global",
      title: "视频全局基础",
      rationale: `${config.duration}秒竖版短视频，${config.globalStyle}，适配${requirement.media ?? "抖音"}投放节奏。`,
      items: [
        { label: "时长", value: `${config.duration} 秒` },
        { label: "比例", value: config.aspectRatio },
        { label: "整体风格", value: config.globalStyle },
      ],
    },
    {
      moduleId: "shots",
      title: "四段镜头脚本",
      rationale: "按 0~3 / 3~9 / 9~13 / 13~15 秒结构拆解，钩子→场景→卖点→转化，符合信息流完播逻辑。",
      items: [
        { label: "钩子镜头", value: config.hookShot.description },
        { label: "场景镜头", value: config.sceneShot.description },
        { label: "卖点镜头", value: config.sellingShot.description },
        { label: "转化镜头", value: config.ctaShot.description },
      ],
    },
    {
      moduleId: "transitions",
      title: "转场跳转",
      rationale: "转场节奏与 BGM 卡点配合，保持快剪带货张力。",
      items: [
        { label: "钩子→场景", value: config.transitionHookScene },
        { label: "场景→卖点", value: config.transitionSceneSelling },
        { label: "卖点→转化", value: config.transitionSellingCta },
        { label: "节奏模式", value: config.transitionRhythm },
      ],
    },
    {
      moduleId: "audio",
      title: "三轨音频",
      rationale: "BGM 定基调，口播传递核心信息，音效强化关键帧记忆点。",
      items: [
        { label: "BGM", value: "节奏感带货 BGM，音量 70%" },
        { label: "口播脚本", value: config.voiceoverScript },
        { label: "配音音色", value: `${config.voiceType} · 语速 ${config.voiceSpeed}x` },
        { label: "音效", value: config.sfxPreset ? "卡点鼓点音效包" : "默认" },
      ],
    },
    {
      moduleId: "subtitle",
      title: "动态字幕",
      rationale: "字幕与口播同步，关键词高亮引导视觉焦点。",
      items: [
        { label: "字幕文案", value: config.subtitleText },
        { label: "入场动画", value: "逐字弹出" },
        { label: "关键词高亮", value: config.keywordHighlight },
      ],
    },
    {
      moduleId: "marketing",
      title: "营销动效组件",
      rationale: "动态角标与指引元素提升点击意愿，浮动贴纸强化优惠感知。",
      items: [
        { label: "动态角标", value: config.dynamicBadges.join("、") },
        { label: "指引元素", value: config.guideElements ? "开启动态箭头 + 光斑" : "关闭" },
        { label: "浮动贴纸", value: config.floatingStickers },
      ],
    },
    {
      moduleId: "finish",
      title: "调色与收尾转化",
      rationale: "全局滤镜统一色调，最后一帧定格引导点击转化。",
      items: [
        { label: "全局滤镜", value: "电商通透滤镜" },
        { label: "收尾画面", value: `${sku.name} + ${config.ctaShot.description.slice(-20)}` },
      ],
    },
  ];
}

function buildCreativeNarrative(
  requirement: RequirementBrief,
  primarySku: SkuRecord,
  allSkus: SkuRecord[],
  userIntent: string,
  materialType: MaterialType
): string {
  const lines = sellingLines(requirement);
  const skuList =
    allSkus.length > 1
      ? allSkus.map((s) => `「${s.name}」（¥${s.price}）`).join("、")
      : `「${primarySku.name}」（¥${primarySku.price}，${primarySku.category}）`;

  const media = requirement.media ?? requirement.platform ?? "信息流";
  const channel = requirement.channel ?? "外投";
  const size = requirement.sizeRequirement ?? (materialType === "video" ? "1080×1920" : "1080×1920");
  const style = requirement.visualStyle ?? visualStyleFromRequirement(requirement);
  const summary = requirement.coreSummary ?? requirement.sellingPoints;
  const constraints = requirement.specialConstraints ?? requirement.supplementNotes ?? "";

  const paragraphs: string[] = [];

  paragraphs.push(
    `【投放背景】基于运营诉求「${userIntent.slice(0, 120)}${userIntent.length > 120 ? "…" : ""}」，本次为${requirement.templateName ?? "品牌"}在${media}渠道的${materialType === "video" ? "短视频" : "图片"}素材创作。投放渠道：${channel}；尺寸要求：${size}；承接类型：${requirement.landingType ?? "商品"}。`
  );

  if (summary) {
    paragraphs.push(`【核心策略】${summary}。主打卖点：${lines.join("、") || requirement.sellingPoints}。`);
  }

  paragraphs.push(
    `【选品结论】已确认 ${allSkus.length} 个商品：${skuList}。选品策略：${(requirement.selectionStrategy ?? "智能匹配高转化 SKU").slice(0, 200)}。`
  );

  if (materialType === "video") {
    paragraphs.push(
      `【创意方向】建议采用${style}的${requirement.duration ?? 15}秒竖版结构：0~3s 产品钩子特写抓住停留 → 3~9s 真实生活场景建立信任 → 9~13s 集中展示${lines[0] ?? "核心利益点"}与价格对比 → 13~15s 品牌色收尾 + ${requirement.promotion ? "促销" : "领券"}引导点击。BGM 选节奏感适中、不抢人声的音乐；配音用温柔女声，语速略快于日常。`
    );
    paragraphs.push(
      `【模块配置建议】画布：${requirement.aspectRatio ?? "9:16"} 竖版；分镜：钩子/场景/卖点/CTA 四段；字幕：关键词「${lines[0] ?? primarySku.name}」高亮放大；营销层：${requirement.promotion ? "倒计时角标 + 浮动优惠券贴纸" : "热销角标 + 价格标签"}；收尾：全局通透滤镜统一系列色调。`
    );
  } else {
    paragraphs.push(
      `【创意方向】整体采用${style}，以${primarySku.name}为视觉主体，构图居中留白给文案层，背景弱化衬托产品质感。主标题突出「${lines[0] ?? "领券后更划算"}」，副卖点分层展示；${requirement.promotion ? "促销节点" : "日常转化"}场景下 CTA 使用高对比按钮引导点击。`
    );
    paragraphs.push(
      `【模块配置建议】画布：${requirement.aspectRatio ?? "9:16"}；主体：${style} + ${requirement.visualStyle?.includes("真实") ? "自然日光" : "柔光通透"}；背景：渐变色/场景虚化；文案：主标题 + 2~3 条短卖点；营销：原价/券后价对比 + 角标组合；导出：统一电商通透滤镜，微特效提升精致度不过度干扰主体。`
    );
  }

  if (constraints) {
    paragraphs.push(`【特殊约束】${constraints}`);
  }

  paragraphs.push(
    `【执行说明】点击下方「一键配置」可将上述创意自动写入下方各模块配置（带 Agent 标识项可继续微调）；确认无误后点击「开始审核并生成」进入大模型出图/出片流程。`
  );

  return paragraphs.join("\n\n");
}

export function buildFullCreativePlan(
  requirement: RequirementBrief,
  sku: SkuRecord,
  userIntent = "",
  allSkus: SkuRecord[] = [sku]
): CreativePlanPackage {
  const intent = userIntent || requirement.supplementNotes || "";
  const narrative = buildCreativeNarrative(
    requirement,
    sku,
    allSkus,
    intent,
    requirement.materialType
  );
  const isCouponIntent =
    intent.includes("领券") ||
    intent.includes("划算") ||
    requirement.sellingPoints.includes("领券") ||
    requirement.templateId.includes("coupon");

  const template = BUSINESS_TEMPLATES.find((t) => t.id === requirement.templateId)!;
  const d = template.creativeDefaults;
  const lines = sellingLines(requirement);

  const brief: CreativeBrief = {
    storyboard:
      requirement.materialType === "video"
        ? `钩子(0~3s) → 场景(3~9s) → 卖点(9~13s) → 转化(13~15s) · ${d.cta ?? "CTA"}`
        : undefined,
    bgm: d.bgm ?? "节奏感强",
    cta: isCouponIntent ? "扫码领券" : (d.cta ?? "立即购买"),
    coverTitle: lines[0] ?? `${sku.name} 特惠`,
    voiceover: d.voiceover ?? true,
    subtitle: d.subtitle ?? true,
    visualStyle: requirement.visualStyle ?? visualStyleFromRequirement(requirement),
  };

  if (requirement.materialType === "video") {
    const videoConfig = buildVideoConfigFromPlan(requirement, sku, userIntent);
    const sections = buildVideoSections(videoConfig, requirement, sku);
    const agentFilledFields = collectAgentFilledKeys(
      videoConfig as unknown as Record<string, unknown>
    );

    return {
      brief,
      summary: `为「${sku.name}」等 ${allSkus.length} 个商品生成 ${videoConfig.duration} 秒 ${videoConfig.globalStyle} 视频创意方案。`,
      narrative,
      sections,
      videoConfig,
      agentFilledFields,
      configApplied: false,
    };
  }

  const imageConfig = buildImageConfigFromPlan(requirement, sku, userIntent);
  const sections = buildImageSections(imageConfig, requirement, sku);
  const agentFilledFields = collectAgentFilledKeys(
    imageConfig as unknown as Record<string, unknown>
  );

  return {
    brief,
    summary: `为「${sku.name}」等 ${allSkus.length} 个商品生成 ${requirement.media ?? "信息流"}图片创意：${imageConfig.visualStyle} · ${imageConfig.aspectRatio}。`,
    narrative,
    sections,
    imageConfig,
    agentFilledFields,
    configApplied: false,
  };
}

export function parseCreativePackage(json: string | null | undefined): CreativePlanPackage | null {
  if (!json || json === "{}" || json === '""') return null;
  try {
    const parsed = JSON.parse(json) as CreativePlanPackage | CreativeBrief;
    if ("brief" in parsed && parsed.brief) return parsed as CreativePlanPackage;
    if ("coverTitle" in parsed && parsed.coverTitle) {
      return {
        brief: parsed as CreativeBrief,
        summary: "",
        narrative: "",
        sections: [],
        agentFilledFields: [],
      };
    }
  } catch {
    /* ignore */
  }
  return null;
}

/** 将创意方案中的配置合并到现有配置（创意生成时全量覆盖） */
export function applyCreativePlanToConfig(
  plan: CreativePlanPackage,
  materialType: "image" | "video"
): ImageCreationConfig | VideoCreationConfig {
  if (materialType === "image" && plan.imageConfig) {
    return { ...defaultImageConfig(), ...plan.imageConfig };
  }
  if (materialType === "video" && plan.videoConfig) {
    return { ...defaultVideoConfig(), ...plan.videoConfig };
  }
  return materialType === "image" ? defaultImageConfig() : defaultVideoConfig();
}
