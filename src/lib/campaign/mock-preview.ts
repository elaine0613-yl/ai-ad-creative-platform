import type { CampaignSnapshot } from "@/lib/campaign/types";
import { INTERNAL_SKUS } from "@/lib/mock/skus";
import type { MaterialType } from "@/lib/types";

/** 未开始对话时，右侧展示的示例 AI 素材方案 */
export function buildMockCampaignPreview(materialType: MaterialType): CampaignSnapshot {
  const isVideo = materialType === "video";
  const media = "抖音";

  const requirement = {
    templateId: isVideo ? "douyin-beauty-video" : "douyin-coupon-image",
    templateName: isVideo ? "抖音美妆带货视频" : "省钱神券外投图片",
    platform: media,
    industry: isVideo ? "美妆护肤" : "电商百货",
    materialType,
    productKeywords: isVideo ? "防晒" : "省钱捡漏",
    sellingPoints: isVideo ? "轻薄不闷痘、SPF50+ 长效防护" : "领券后更划算",
    taskName: isVideo ? "省钱神券-抖音视频素材" : "省钱神券-抖音图片素材",
    channel: "外投",
    media,
    sizeRequirement: isVideo ? "1080×1920" : "1080×1920",
    creativesPerProduct: isVideo ? 3 : 6,
    visualStyle: isVideo ? "清新自然" : "真实生活感",
    landingType: "商品",
    productSelectionMethod: "AI 智能选品",
    selectionCount: 10,
    selectionStrategy:
      "优先级：1. 不限品类，从全量商品池召回；2. 优先匹配「省钱」「捡漏」「高性价比」标签；3. 价格带覆盖低到中等，突出领券后更划算；4. 兼顾外观真实感，适合外投场景。",
    audience: isVideo ? "年轻女性" : undefined,
    duration: isVideo ? 15 : undefined,
    aspectRatio: "9:16",
  };

  const recommendations = isVideo
    ? [
        { sku: INTERNAL_SKUS[0], score: 0.92, reason: "品类与防晒诉求匹配" },
        { sku: INTERNAL_SKUS[1], score: 0.85, reason: "同品类高转化 SKU" },
      ]
    : [
        { sku: INTERNAL_SKUS[7], score: 0.94, reason: "高性价比，适合省钱表达" },
        { sku: INTERNAL_SKUS[8], score: 0.89, reason: "亲子捡漏场景匹配" },
        { sku: INTERNAL_SKUS[9], score: 0.86, reason: "二手优品，捡漏感强" },
      ];

  return {
    id: "preview",
    stage: "confirm",
    templateId: requirement.templateId,
    userIntent: isVideo
      ? "我要给省钱神券中心做一批外投视频，投抖音，突出领券后更划算，整体真实一点"
      : "我要给省钱神券中心做一批外投图片，投抖音，突出领券后更划算，整体真实一点，帮我智能选一批适合省钱和捡漏表达的商品。",
    requirement,
    recommendations,
    selectedSkuId: null,
    selectedSku: null,
    creative: null,
    creativePlan: null,
    messages: [],
  };
}
