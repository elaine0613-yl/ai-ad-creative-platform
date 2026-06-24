import type { BusinessTemplate } from "./types";

export const BUSINESS_TEMPLATES: BusinessTemplate[] = [
  {
    id: "douyin-beauty-video",
    name: "抖音美妆带货视频",
    description: "9:16 竖版短视频，适合防晒/护肤类抖音信息流投放",
    keywords: ["抖音", "美妆", "护肤", "防晒", "视频", "带货", "15秒", "15s"],
    materialType: "video",
    platform: "抖音",
    industry: "美妆护肤",
    selectionRules: {
      categories: ["美妆护肤"],
      tagsAny: ["防晒", "护肤", "轻薄", "保湿"],
      priceMin: 59,
      priceMax: 299,
      promoPool: "618",
    },
    creativeDefaults: {
      duration: 15,
      aspectRatio: "9:16",
      bgm: "节奏感强",
      cta: "领券下单",
      coverTitle: "{productName} | 轻薄不闷痘",
      voiceover: true,
      subtitle: true,
      platform: "抖音",
    },
  },
  {
    id: "taobao-promo-image",
    name: "淘宝大促主图",
    description: "800×800 主图，适合 618/双11 促销节点",
    keywords: ["淘宝", "主图", "618", "大促", "促销", "图片", "电商"],
    materialType: "image",
    platform: "淘宝",
    industry: "电商百货",
    selectionRules: {
      categories: ["电商百货", "美妆护肤", "食品饮料"],
      tagsAny: ["大促", "热销", "618"],
      priceMin: 29,
      priceMax: 500,
      promoPool: "618",
    },
    creativeDefaults: {
      aspectRatio: "1:1",
      cta: "限时抢购",
      coverTitle: "{productName} 618特惠",
      platform: "淘宝",
    },
  },
  {
    id: "douyin-3c-video",
    name: "抖音 3C 产品展示",
    description: "科技感产品展示短视频，适合数码品类",
    keywords: ["3c", "数码", "科技", "抖音", "视频", "产品展示"],
    materialType: "video",
    platform: "抖音",
    industry: "3C数码",
    selectionRules: {
      categories: ["3C数码"],
      tagsAny: ["智能", "便携", "新品"],
      priceMin: 199,
      priceMax: 2999,
    },
    creativeDefaults: {
      duration: 15,
      aspectRatio: "9:16",
      bgm: "电子乐",
      cta: "立即购买",
      coverTitle: "{productName} 新品上市",
      voiceover: true,
      subtitle: true,
      platform: "抖音",
    },
  },
];

export function getBusinessTemplate(id: string) {
  return BUSINESS_TEMPLATES.find((t) => t.id === id);
}
