import type { SkuRecord } from "@/lib/campaign/types";

/** 内部 SKU 表（演示数据，生产环境由 DB 同步） */
export const INTERNAL_SKUS: SkuRecord[] = [
  {
    id: "sku-001",
    skuCode: "SKU-SUN-001",
    name: "轻透防晒乳 SPF50+",
    category: "美妆护肤",
    tags: ["防晒", "轻薄", "夏季", "618"],
    price: 149,
    imageUrl: "/placeholder/material-1.jpg",
    promoPool: "618",
    stock: 1200,
  },
  {
    id: "sku-002",
    skuCode: "SKU-SUN-002",
    name: "水感防晒喷雾",
    category: "美妆护肤",
    tags: ["防晒", "便携", "清爽"],
    price: 89,
    promoPool: "618",
    stock: 800,
  },
  {
    id: "sku-003",
    skuCode: "SKU-SKIN-003",
    name: "玻尿酸保湿面膜 10片",
    category: "美妆护肤",
    tags: ["护肤", "保湿", "面膜"],
    price: 129,
    stock: 500,
  },
  {
    id: "sku-004",
    skuCode: "SKU-3C-001",
    name: "智能降噪耳机 Pro",
    category: "3C数码",
    tags: ["智能", "降噪", "新品"],
    price: 899,
    stock: 300,
  },
  {
    id: "sku-005",
    skuCode: "SKU-3C-002",
    name: "迷你便携投影仪",
    category: "3C数码",
    tags: ["智能", "便携", "家居"],
    price: 1599,
    stock: 120,
  },
  {
    id: "sku-006",
    skuCode: "SKU-FOOD-001",
    name: "每日坚果大礼盒",
    category: "食品饮料",
    tags: ["大促", "618", "热销"],
    price: 99,
    promoPool: "618",
    stock: 2000,
  },
  {
    id: "sku-007",
    skuCode: "SKU-SUN-003",
    name: "儿童物理防晒霜",
    category: "美妆护肤",
    tags: ["防晒", "儿童", "温和"],
    price: 118,
    promoPool: "618",
    stock: 600,
  },
  {
    id: "sku-008",
    skuCode: "SKU-HOME-001",
    name: "多功能空气炸锅 4L",
    category: "家居百货",
    tags: ["省钱", "捡漏", "高性价比", "热销"],
    price: 199,
    stock: 450,
  },
  {
    id: "sku-009",
    skuCode: "SKU-BOOK-001",
    name: "儿童绘本套装 12册",
    category: "母婴文教",
    tags: ["省钱", "捡漏", "亲子"],
    price: 59,
    stock: 800,
  },
  {
    id: "sku-010",
    skuCode: "SKU-SHOE-001",
    name: "九成新品牌运动鞋",
    category: "服饰鞋包",
    tags: ["捡漏", "二手优品", "省钱"],
    price: 129,
    stock: 35,
  },
];

export function skuRecordFromDb(row: {
  id: string;
  skuCode: string;
  name: string;
  category: string;
  tags: string;
  price: number;
  imageUrl: string | null;
  promoPool: string | null;
  stock: number;
  status?: string;
}): SkuRecord {
  return {
    id: row.id,
    skuCode: row.skuCode,
    name: row.name,
    category: row.category,
    tags: JSON.parse(row.tags || "[]"),
    price: row.price,
    imageUrl: row.imageUrl ?? undefined,
    promoPool: row.promoPool ?? undefined,
    stock: row.stock,
    status: row.status ?? "active",
  };
}

export function findSkuById(id: string, pool: SkuRecord[] = INTERNAL_SKUS) {
  return pool.find((s) => s.id === id);
}
