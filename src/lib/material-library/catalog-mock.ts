import type { ArchiveMaterial, ArchiveMaterialQuery, MaterialPartition } from "./catalog-types";

const PREVIEW_COLORS = ["#FEE2E2", "#DBEAFE", "#D1FAE5", "#FEF3C7", "#F3E8FF", "#FFEDD5", "#E0E7FF"];

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 16).replace("T", " ");
}

const baseTrace = {
  requirement: {
    任务名称: "省钱神券-抖音外投",
    投放渠道: "抖音",
    核心卖点: "领券立减、券后更划算",
    目标人群: "学生党、上班族",
  },
  creative: {
    创意氛围: "真实生活化",
    主标题: "领券立减20",
    副标题: "今日下单更划算",
    创意描述: "厨房场景引入，突出省钱氛围",
  },
  knowledgeRefs: ["KN-I-001 抖音信息流高点击特征", "KN-V-009 15s四段式脚本"],
};

export const ARCHIVE_MATERIALS: ArchiveMaterial[] = [
  {
    id: "arch-img-1",
    materialId: "MT-I-001",
    name: "省钱神券 · 抖音信息流外投图",
    partition: "image",
    previewColor: PREVIEW_COLORS[0],
    generateMode: "native",
    channel: "douyin",
    brand: "shenquan",
    industry: "food",
    createdAt: daysAgo(1),
    aiTags: ["高匹配度", "促销风", "高清优质"],
    taskId: "task-demo-001",
    taskName: "省钱神券-抖音图片生成",
    productName: "每日坚果礼盒",
    sellingPoints: "领券立减20、券后更划算",
    status: "normal",
    aspectRatio: "9:16",
    visualStyle: "promo",
    sceneType: "scene-seeding",
    width: 1080,
    height: 1920,
    creativeTrace: baseTrace,
    audit: { status: "passed", auditedAt: daysAgo(1) },
    operationRecords: [{ action: "任务审核通过，自动入库", operator: "系统", at: daysAgo(1) }],
    exportRecords: [],
    fileSize: "890 KB",
    fileFormat: "PNG",
  },
  {
    id: "arch-img-2",
    materialId: "MT-I-002",
    name: "防晒喷雾 · 小红书种草方图",
    partition: "image",
    previewColor: PREVIEW_COLORS[1],
    generateMode: "native",
    channel: "xiaohongshu",
    brand: "platform",
    industry: "beauty",
    createdAt: daysAgo(3),
    aiTags: ["种草风", "高清优质"],
    taskId: "task-demo-002",
    taskName: "美妆种草-小红书方图",
    productName: "防晒喷雾 SPF50+",
    sellingPoints: "轻薄不油腻、户外必备",
    status: "normal",
    aspectRatio: "1:1",
    visualStyle: "lifestyle",
    sceneType: "product-closeup",
    width: 1080,
    height: 1080,
    creativeTrace: {
      ...baseTrace,
      creative: { 创意氛围: "清新自然", 主标题: "夏日防晒必备", 副标题: "轻薄不闷痘", 创意描述: "窗台前自然光产品特写" },
    },
    audit: { status: "passed", auditedAt: daysAgo(3) },
    operationRecords: [{ action: "任务审核通过，自动入库", operator: "系统", at: daysAgo(3) }],
    exportRecords: [{ action: "单素材下载", operator: "运营-小李", at: daysAgo(2) }],
    fileSize: "650 KB",
    fileFormat: "JPG",
  },
  {
    id: "arch-img-3",
    materialId: "MT-I-003",
    name: "618 大促 · 国潮促销海报",
    partition: "image",
    previewColor: PREVIEW_COLORS[2],
    generateMode: "native",
    channel: "douyin",
    brand: "shenquan",
    industry: "all",
    createdAt: daysAgo(5),
    aiTags: ["促销风", "高匹配度"],
    taskId: "task-demo-003",
    taskName: "618大促-国潮主图",
    productName: "多品类组合",
    status: "normal",
    aspectRatio: "1:1",
    visualStyle: "guofeng",
    sceneType: "multi-product",
    width: 800,
    height: 800,
    creativeTrace: baseTrace,
    audit: { status: "passed", auditedAt: daysAgo(5) },
    operationRecords: [{ action: "任务审核通过，自动入库", operator: "系统", at: daysAgo(5) }],
    exportRecords: [],
    fileSize: "1.1 MB",
    fileFormat: "PNG",
  },
  {
    id: "arch-img-4",
    materialId: "MT-I-004",
    name: "家居收纳 · 快手竖版外投",
    partition: "image",
    previewColor: PREVIEW_COLORS[3],
    generateMode: "replicate",
    channel: "kuaishou",
    brand: "platform",
    industry: "home",
    createdAt: daysAgo(8),
    aiTags: ["生活化种草", "高清优质"],
    taskId: "task-demo-004",
    taskName: "爆款复刻-收纳盒外投",
    productName: "透明收纳盒套装",
    sellingPoints: "整洁有序、省空间",
    status: "normal",
    aspectRatio: "9:16",
    visualStyle: "realistic",
    sceneType: "scene-seeding",
    width: 1080,
    height: 1920,
    creativeTrace: baseTrace,
    audit: { status: "passed", auditedAt: daysAgo(8) },
    operationRecords: [
      { action: "任务审核通过，自动入库", operator: "系统", at: daysAgo(8) },
      { action: "运营手动重命名", operator: "运营-小王", at: daysAgo(7) },
    ],
    exportRecords: [],
    fileSize: "720 KB",
    fileFormat: "JPG",
  },
  {
    id: "arch-img-5",
    materialId: "MT-I-005",
    name: "3C 耳机 · 极简产品海报",
    partition: "image",
    previewColor: PREVIEW_COLORS[4],
    generateMode: "native",
    channel: "douyin",
    brand: "platform",
    industry: "3c",
    createdAt: daysAgo(12),
    aiTags: ["简约高级", "高清优质"],
    taskId: "task-demo-005",
    taskName: "3C耳机-极简主图",
    productName: "无线降噪耳机",
    status: "pending_review",
    aspectRatio: "16:9",
    visualStyle: "minimal",
    sceneType: "minimal-poster",
    width: 1920,
    height: 1080,
    creativeTrace: baseTrace,
    audit: { status: "passed", auditedAt: daysAgo(12) },
    operationRecords: [{ action: "任务审核通过，自动入库", operator: "系统", at: daysAgo(12) }],
    exportRecords: [],
    fileSize: "980 KB",
    fileFormat: "PNG",
  },
  {
    id: "arch-img-6",
    materialId: "MT-I-006",
    name: "服饰穿搭 · 朋友圈方图",
    partition: "image",
    previewColor: PREVIEW_COLORS[5],
    generateMode: "native",
    channel: "moments",
    brand: "shenquan",
    industry: "fashion",
    createdAt: daysAgo(20),
    aiTags: ["种草风"],
    taskId: "task-demo-006",
    taskName: "服饰-朋友圈投放",
    productName: "夏季休闲套装",
    status: "normal",
    aspectRatio: "1:1",
    visualStyle: "lifestyle",
    sceneType: "scene-seeding",
    width: 1080,
    height: 1080,
    creativeTrace: baseTrace,
    audit: { status: "passed", auditedAt: daysAgo(20) },
    operationRecords: [{ action: "任务审核通过，自动入库", operator: "系统", at: daysAgo(20) }],
    exportRecords: [],
    fileSize: "540 KB",
    fileFormat: "JPG",
  },
  {
    id: "arch-vid-1",
    materialId: "MT-V-001",
    name: "省钱神券 · 15s 抖音竖版短视频",
    partition: "video",
    previewColor: PREVIEW_COLORS[0],
    generateMode: "native",
    channel: "douyin",
    brand: "shenquan",
    industry: "food",
    createdAt: daysAgo(2),
    aiTags: ["高匹配度", "促销风", "短视频快剪"],
    taskId: "task-demo-101",
    taskName: "省钱神券-抖音视频生成",
    productName: "每日坚果礼盒",
    sellingPoints: "领券立减、限时福利",
    status: "normal",
    durationSec: 15,
    durationTier: "15s",
    pace: "fast",
    hasSubtitle: true,
    videoType: "promo",
    width: 1080,
    height: 1920,
    creativeTrace: {
      ...baseTrace,
      creative: {
        镜头组合: "全景铺垫+近景特写",
        运镜方式: "固定镜头+轻微推拉",
        完整脚本: "痛点引入→商品展示→福利收尾",
      },
    },
    audit: { status: "passed", auditedAt: daysAgo(2) },
    operationRecords: [{ action: "任务审核通过，自动入库", operator: "系统", at: daysAgo(2) }],
    exportRecords: [{ action: "单素材下载 MP4", operator: "运营-小张", at: daysAgo(1) }],
    fileSize: "12.5 MB",
    fileFormat: "MP4",
  },
  {
    id: "arch-vid-2",
    materialId: "MT-V-002",
    name: "美妆护肤 · 30s 小红书种草视频",
    partition: "video",
    previewColor: PREVIEW_COLORS[1],
    generateMode: "native",
    channel: "xiaohongshu",
    brand: "platform",
    industry: "beauty",
    createdAt: daysAgo(4),
    aiTags: ["种草风", "高清优质"],
    taskId: "task-demo-102",
    taskName: "美妆-小红书慢节奏视频",
    productName: "保湿精华套装",
    status: "normal",
    durationSec: 30,
    durationTier: "30s",
    pace: "slow",
    hasSubtitle: true,
    videoType: "story-seeding",
    width: 1080,
    height: 1920,
    creativeTrace: baseTrace,
    audit: { status: "passed", auditedAt: daysAgo(4) },
    operationRecords: [{ action: "任务审核通过，自动入库", operator: "系统", at: daysAgo(4) }],
    exportRecords: [],
    fileSize: "28 MB",
    fileFormat: "MP4",
  },
  {
    id: "arch-vid-3",
    materialId: "MT-V-003",
    name: "3C 数码 · 产品测评 60s",
    partition: "video",
    previewColor: PREVIEW_COLORS[2],
    generateMode: "native",
    channel: "douyin",
    brand: "platform",
    industry: "3c",
    createdAt: daysAgo(10),
    aiTags: ["高清优质"],
    taskId: "task-demo-103",
    taskName: "耳机测评-60s视频",
    productName: "无线降噪耳机",
    status: "normal",
    durationSec: 60,
    durationTier: "60s",
    pace: "steady",
    hasSubtitle: true,
    videoType: "review",
    width: 1080,
    height: 1920,
    creativeTrace: baseTrace,
    audit: { status: "passed", auditedAt: daysAgo(10) },
    operationRecords: [{ action: "任务审核通过，自动入库", operator: "系统", at: daysAgo(10) }],
    exportRecords: [],
    fileSize: "45 MB",
    fileFormat: "MP4",
  },
  {
    id: "arch-vid-4",
    materialId: "MT-V-004",
    name: "家居好物 · 快手快节奏福利视频",
    partition: "video",
    previewColor: PREVIEW_COLORS[3],
    generateMode: "replicate",
    channel: "kuaishou",
    brand: "shenquan",
    industry: "home",
    createdAt: daysAgo(15),
    aiTags: ["短视频快剪", "促销风"],
    taskId: "task-demo-104",
    taskName: "爆款复刻-收纳视频",
    productName: "透明收纳盒",
    status: "normal",
    durationSec: 15,
    durationTier: "15s",
    pace: "fast",
    hasSubtitle: false,
    videoType: "promo",
    width: 1080,
    height: 1920,
    creativeTrace: baseTrace,
    audit: { status: "passed", auditedAt: daysAgo(15) },
    operationRecords: [{ action: "任务审核通过，自动入库", operator: "系统", at: daysAgo(15) }],
    exportRecords: [],
    fileSize: "11 MB",
    fileFormat: "MP4",
  },
  {
    id: "arch-vid-5",
    materialId: "MT-V-005",
    name: "食品细节 · 无字幕产品展示",
    partition: "video",
    previewColor: PREVIEW_COLORS[4],
    generateMode: "native",
    channel: "douyin",
    brand: "platform",
    industry: "food",
    createdAt: daysAgo(25),
    aiTags: ["高清优质"],
    taskId: "task-demo-105",
    taskName: "食品细节展示视频",
    productName: "有机燕麦片",
    status: "violation",
    durationSec: 15,
    durationTier: "15s",
    pace: "steady",
    hasSubtitle: false,
    videoType: "detail-showcase",
    width: 1080,
    height: 1920,
    creativeTrace: baseTrace,
    audit: {
      status: "passed",
      auditedAt: daysAgo(25),
      reason: "后续复核发现口播含极限词，已标记违规待处理",
    },
    operationRecords: [
      { action: "任务审核通过，自动入库", operator: "系统", at: daysAgo(25) },
      { action: "人工复核标记违规", operator: "合规组", at: daysAgo(20) },
    ],
    exportRecords: [],
    fileSize: "10 MB",
    fileFormat: "MP4",
  },
];

function parseDate(s: string): Date {
  return new Date(s.replace(" ", "T"));
}

export function queryArchiveMaterials(query: ArchiveMaterialQuery): ArchiveMaterial[] {
  const now = new Date();
  let dateFrom: Date | null = null;
  if (query.datePreset === "1d") {
    dateFrom = new Date(now);
    dateFrom.setDate(dateFrom.getDate() - 1);
  } else if (query.datePreset === "7d") {
    dateFrom = new Date(now);
    dateFrom.setDate(dateFrom.getDate() - 7);
  } else if (query.datePreset === "30d") {
    dateFrom = new Date(now);
    dateFrom.setDate(dateFrom.getDate() - 30);
  }
  if (query.dateFrom) dateFrom = new Date(query.dateFrom);
  const dateTo = query.dateTo ? new Date(query.dateTo) : null;

  return ARCHIVE_MATERIALS.filter((m) => {
    if (m.partition !== query.partition) return false;
    if (query.generateMode && query.generateMode !== "all" && m.generateMode !== query.generateMode) return false;
    if (query.channel && query.channel !== "all" && m.channel !== query.channel) return false;
    if (query.brand && query.brand !== "all" && m.brand !== query.brand) return false;
    if (query.industry && query.industry !== "all" && m.industry !== query.industry && m.industry !== "all")
      return false;
    if (query.status && query.status !== "all" && m.status !== query.status) return false;
    if (query.aiTag && query.aiTag !== "all" && !m.aiTags.includes(query.aiTag)) return false;
    if (query.taskId?.trim() && !m.taskId.toLowerCase().includes(query.taskId.trim().toLowerCase())) return false;

    const created = parseDate(m.createdAt);
    if (dateFrom && created < dateFrom) return false;
    if (dateTo && created > dateTo) return false;

    if (query.partition === "image") {
      if (query.aspectRatio && query.aspectRatio !== "all" && m.aspectRatio !== query.aspectRatio) return false;
      if (query.visualStyle && query.visualStyle !== "all" && m.visualStyle !== query.visualStyle) return false;
      if (query.sceneType && query.sceneType !== "all" && m.sceneType !== query.sceneType) return false;
    }

    if (query.partition === "video") {
      if (query.durationTier && query.durationTier !== "all" && m.durationTier !== query.durationTier) return false;
      if (query.pace && query.pace !== "all" && m.pace !== query.pace) return false;
      if (query.hasSubtitle === "yes" && !m.hasSubtitle) return false;
      if (query.hasSubtitle === "no" && m.hasSubtitle) return false;
      if (query.videoType && query.videoType !== "all" && m.videoType !== query.videoType) return false;
    }

    if (query.search?.trim()) {
      const q = query.search.trim().toLowerCase();
      const hay = [m.name, m.materialId, m.taskId, m.productName, m.sellingPoints ?? "", ...m.aiTags]
        .join(" ")
        .toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}

export function countByPartition(partition: MaterialPartition): number {
  return ARCHIVE_MATERIALS.filter((m) => m.partition === partition).length;
}

/** @deprecated 兼容旧引用 */
export const MATERIAL_CATALOG_ASSETS = ARCHIVE_MATERIALS;
export function queryMaterialCatalog(params: { tab: MaterialPartition } & Partial<ArchiveMaterialQuery>) {
  return queryArchiveMaterials({ partition: params.tab, ...params });
}
