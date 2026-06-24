import { buildCreativeBrief } from "@/lib/campaign/parser";
import type { CampaignSnapshot } from "@/lib/campaign/types";
import { INTERNAL_SKUS } from "@/lib/mock/skus";
import type { MaterialType } from "@/lib/types";

/** 未开始对话时，右侧展示的示例需求确认清单 */
export function buildMockCampaignPreview(materialType: MaterialType): CampaignSnapshot {
  const isVideo = materialType === "video";

  const requirement = {
    templateId: isVideo ? "douyin-beauty-video" : "taobao-promo-image",
    templateName: isVideo ? "抖音美妆带货视频" : "淘宝大促主图",
    platform: isVideo ? "抖音" : "淘宝",
    industry: "美妆护肤",
    materialType,
    productKeywords: "防晒",
    sellingPoints: "轻薄不闷痘、SPF50+ 长效防护",
    audience: "年轻女性",
    promotion: "618 限时特惠",
    priceRange: "约 150 元",
    duration: isVideo ? 15 : undefined,
    aspectRatio: isVideo ? "9:16" : "1:1",
    supplementNotes: isVideo
      ? "前 3 秒要有价格冲击钩子"
      : "主图需突出促销红色调",
  };

  const topSku = INTERNAL_SKUS[0];
  const creative = buildCreativeBrief(requirement, topSku.name);

  return {
    id: "preview",
    stage: "confirm",
    templateId: requirement.templateId,
    userIntent: isVideo
      ? "投放到抖音：618 防晒 15 秒视频，强调轻薄不闷痘，价格 150 左右"
      : "投放到淘宝：618 主图，防晒产品，强调轻薄卖点，促销红色调",
    requirement,
    recommendations: [
      {
        sku: topSku,
        score: 0.92,
        reason: "品类与 618 促销池匹配",
      },
      {
        sku: INTERNAL_SKUS[1],
        score: 0.85,
        reason: "同品类高转化 SKU",
      },
      {
        sku: INTERNAL_SKUS[6],
        score: 0.78,
        reason: "防晒标签相关",
      },
    ],
    selectedSkuId: topSku.id,
    selectedSku: topSku,
    creative,
    messages: [],
  };
}
