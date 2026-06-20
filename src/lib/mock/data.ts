import type {
  BrandProfile,
  CreativeIdea,
  DashboardStats,
  GenerationTask,
  Material,
  TeamMember,
  Template,
  UserProfile,
} from "@/lib/types";

export const mockUser: UserProfile = {
  id: "user-1",
  name: "运营小王",
  email: "wang@example.com",
  plan: "pro",
  credits: 850,
  totalCredits: 1000,
};

export const mockStats: DashboardStats = {
  todayGenerated: 12,
  weekGenerated: 68,
  totalMaterials: 234,
  pendingTasks: 3,
};

export const mockTemplates: Template[] = [
  {
    id: "tpl-1",
    name: "618 大促主图",
    coverUrl: "/placeholder/template-1.jpg",
    type: "image",
    industry: "电商百货",
    scene: "促销活动",
    size: "800×800",
    styleTags: ["促销", "红色", "大促"],
    popularity: 9820,
    createdAt: "2026-06-01",
  },
  {
    id: "tpl-2",
    name: "美妆护肤信息流",
    coverUrl: "/placeholder/template-2.jpg",
    type: "image",
    industry: "美妆护肤",
    scene: "信息流",
    size: "1080×1920",
    styleTags: ["高级", "简约"],
    popularity: 7650,
    createdAt: "2026-05-28",
  },
  {
    id: "tpl-3",
    name: "3C 产品展示视频",
    coverUrl: "/placeholder/template-3.jpg",
    type: "video",
    industry: "3C数码",
    scene: "产品展示",
    size: "9:16",
    styleTags: ["科技", "快节奏"],
    popularity: 5430,
    createdAt: "2026-06-10",
  },
  {
    id: "tpl-4",
    name: "食品节日海报",
    coverUrl: "/placeholder/template-4.jpg",
    type: "image",
    industry: "食品饮料",
    scene: "节日营销",
    size: "1080×1620",
    styleTags: ["国潮", "节日"],
    popularity: 4210,
    createdAt: "2026-06-15",
  },
];

export const mockMaterials: Material[] = [
  {
    id: "mat-1",
    name: "夏季防晒主图 v2",
    type: "image",
    thumbnailUrl: "/placeholder/material-1.jpg",
    url: "/placeholder/material-1.jpg",
    width: 800,
    height: 800,
    tags: ["防晒", "夏季", "主图"],
    version: 2,
    complianceStatus: "passed",
    score: { total: 87, quality: 90, creativity: 85, compliance: 95, suggestions: ["可适当增加产品特写占比"] },
    createdAt: "2026-06-18",
    updatedAt: "2026-06-19",
  },
  {
    id: "mat-2",
    name: "618 促销海报",
    type: "image",
    thumbnailUrl: "/placeholder/material-2.jpg",
    url: "/placeholder/material-2.jpg",
    width: 1080,
    height: 1920,
    tags: ["618", "促销"],
    version: 1,
    complianceStatus: "warning",
    createdAt: "2026-06-17",
    updatedAt: "2026-06-17",
  },
  {
    id: "mat-3",
    name: "产品口播视频",
    type: "video",
    thumbnailUrl: "/placeholder/material-3.jpg",
    url: "/placeholder/material-3.mp4",
    width: 1080,
    height: 1920,
    tags: ["口播", "带货"],
    version: 1,
    complianceStatus: "passed",
    createdAt: "2026-06-16",
    updatedAt: "2026-06-16",
  },
];

export const mockTasks: GenerationTask[] = [
  {
    id: "task-1",
    name: "批量主图生成 - 防晒系列",
    type: "image",
    mode: "文生图",
    status: "processing",
    progress: 65,
    totalCount: 20,
    successCount: 13,
    failCount: 0,
    createdAt: "2026-06-20 14:30",
  },
  {
    id: "task-2",
    name: "图文转视频 - 新品上市",
    type: "video",
    mode: "图文转视频",
    status: "queued",
    progress: 0,
    totalCount: 1,
    successCount: 0,
    failCount: 0,
    createdAt: "2026-06-20 15:00",
  },
  {
    id: "task-3",
    name: "多尺寸适配 - 618海报",
    type: "image",
    mode: "多尺寸适配",
    status: "completed",
    progress: 100,
    totalCount: 6,
    successCount: 6,
    failCount: 0,
    createdAt: "2026-06-19 10:00",
    completedAt: "2026-06-19 10:05",
  },
  {
    id: "task-4",
    name: "数字人口播 - 产品介绍",
    type: "video",
    mode: "数字人口播",
    status: "failed",
    progress: 30,
    totalCount: 1,
    successCount: 0,
    failCount: 1,
    createdAt: "2026-06-18 16:00",
    errorMessage: "文案超出时长限制，请缩短至60字以内",
  },
];

export const mockBrandProfiles: BrandProfile[] = [
  {
    id: "brand-1",
    name: "阳光美妆",
    slogan: "自然之美，由内而外",
    logoPosition: "top-right",
    logoSizePercent: 12,
    primaryColor: "#FF6B9D",
    secondaryColor: "#FFE4EC",
    fontFamily: "PingFang SC",
    isDefault: true,
  },
  {
    id: "brand-2",
    name: "智选数码",
    slogan: "科技改变生活",
    logoPosition: "bottom-left",
    logoSizePercent: 10,
    primaryColor: "#2563EB",
    secondaryColor: "#DBEAFE",
    fontFamily: "Helvetica Neue",
    isDefault: false,
  },
];

export const mockCreativeIdeas: CreativeIdea[] = [
  {
    id: "idea-1",
    title: "场景化种草",
    copywriting: "夏日必备｜轻薄不闷痘，48小时长效防护",
    visualStyle: "清新自然，阳光沙滩场景",
    composition: "产品居中，左右留白放置卖点文案",
    storyboard: "开场：阳光特写 → 产品展示 → 使用场景 → 促销信息",
  },
  {
    id: "idea-2",
    title: "对比冲击",
    copywriting: "告别厚重防晒｜3秒成膜，清爽零负担",
    visualStyle: "简约高级，白底产品特写",
    composition: "左右对比构图，突出使用前后差异",
  },
  {
    id: "idea-3",
    title: "节日促销",
    copywriting: "618 限时特惠｜买2送1，满299减50",
    visualStyle: "国潮红色，节日氛围元素",
    composition: "产品+促销信息上下分层，底部行动按钮",
  },
];

export const mockTeamMembers: TeamMember[] = [
  { id: "m-1", name: "张经理", email: "zhang@company.com", role: "admin", joinedAt: "2026-01-15" },
  { id: "m-2", name: "运营小王", email: "wang@company.com", role: "creator", joinedAt: "2026-03-01" },
  { id: "m-3", name: "设计小李", email: "li@company.com", role: "creator", joinedAt: "2026-04-10" },
  { id: "m-4", name: "投放小陈", email: "chen@company.com", role: "viewer", joinedAt: "2026-05-20" },
];

export function generateMockImageResults(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    id: `result-${Date.now()}-${i}`,
    thumbnailUrl: `/placeholder/result-${(i % 4) + 1}.jpg`,
    width: 800,
    height: 800,
  }));
}

export async function simulateGeneration(delayMs = 2000): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, delayMs));
}
