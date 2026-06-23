import type {
  BrandProfile,
  CreativeIdea,
  DashboardStats,
  GenerationTask,
  KnowledgeAsset,
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

export const mockKnowledgeAssets: KnowledgeAsset[] = [
  // 图片知识库
  { id: "ik-1", library: "image", categoryId: "composition", name: "三分法主图构图", description: "产品占画面 1/3，文案区占 2/3，适合电商主图", tags: ["三分法", "主图"], previewColor: "#E0E7FF", usageHint: "图片创作 → 文生图" },
  { id: "ik-2", library: "image", categoryId: "composition", name: "居中 hero 构图", description: "产品居中放大，四周留白，突出单品质感", tags: ["居中", "留白"], previewColor: "#F3F4F6" },
  { id: "ik-3", library: "image", categoryId: "visual-style", name: "国潮促销风", description: "红金配色 + 传统纹样，适合大促节点", tags: ["国潮", "大促"], previewColor: "#FEE2E2" },
  { id: "ik-4", library: "image", categoryId: "visual-style", name: "简约高级风", description: "大留白 + 低饱和，适合美妆、轻奢", tags: ["简约", "高级"], previewColor: "#F9FAFB" },
  { id: "ik-5", library: "image", categoryId: "color-scheme", name: "618 促销色板", description: "主色 #FF0036，辅色 #FFD700，高对比促点击", tags: ["促销红", "618"], previewColor: "#FF0036" },
  { id: "ik-6", library: "image", categoryId: "scene-background", name: "厨房生活场景", description: "暖光家居环境，适合食品、小家电", tags: ["生活场景", "暖光"], previewColor: "#FEF3C7" },
  { id: "ik-7", library: "image", categoryId: "lighting-mood", name: "柔光棚拍", description: "均匀柔光，减少阴影，适合产品质感展示", tags: ["柔光", "棚拍"], previewColor: "#E5E7EB" },
  { id: "ik-8", library: "image", categoryId: "copy-layout", name: "价格+卖点双层排版", description: "顶部主标题，中部卖点 bullet，底部价格+CTA", tags: ["价格标签", "CTA"], previewColor: "#DBEAFE" },
  { id: "ik-9", library: "image", categoryId: "product-display", name: "功效可视化", description: "用图标/箭头标注成分与功效，适合护肤、保健", tags: ["功效", "拆解"], previewColor: "#D1FAE5" },
  { id: "ik-10", library: "image", categoryId: "platform-spec", name: "小红书封面 3:4", description: "1080×1440，顶部 15% 留安全区放标题", tags: ["小红书", "安全区"], previewColor: "#FCE7F3" },
  { id: "ik-11", library: "image", categoryId: "brand-assets", name: "阳光美妆品牌规范", description: "主色 #FF6B9D，Logo 右上 12%，PingFang SC", tags: ["品牌色", "Logo"], previewColor: "#FF6B9D" },
  { id: "ik-12", library: "image", categoryId: "industry-template", name: "618 大促主图模板", description: "电商百货 · 800×800 · 促销红色调", tags: ["618", "电商"], previewColor: "#FCA5A5" },
  // 视频知识库
  { id: "vk-1", library: "video", categoryId: "bgm", name: "快节奏电子 BGM", description: "120 BPM，适合 15s 带货短视频卡点", tags: ["电子", "卡点"], previewColor: "#6366F1" },
  { id: "vk-2", library: "video", categoryId: "bgm", name: "轻音乐氛围 BGM", description: "舒缓背景，适合品牌故事、产品展示", tags: ["轻音乐", "品牌"], previewColor: "#A5B4FC" },
  { id: "vk-3", library: "video", categoryId: "voiceover", name: "磁性男声·专业解说", description: "中速沉稳，适合 3C、金融类广告", tags: ["男声", "解说"], previewColor: "#1E3A5F" },
  { id: "vk-4", library: "video", categoryId: "voiceover", name: "活力女声·带货口播", description: "语速偏快，情绪饱满，适合快消品", tags: ["女声", "带货"], previewColor: "#EC4899" },
  { id: "vk-5", library: "video", categoryId: "sfx", name: "金币到账音效", description: "强调优惠力度，配合价格字幕弹出", tags: ["Pop", "促销"], previewColor: "#FBBF24" },
  { id: "vk-6", library: "video", categoryId: "subtitles", name: "关键词高亮字幕", description: "卖点词放大变色，其余字保持白底黑字", tags: ["花字", "高亮"], previewColor: "#F97316" },
  { id: "vk-7", library: "video", categoryId: "transitions", name: "缩放转场", description: "镜头推近切换，适合产品特写衔接", tags: ["缩放", "硬切"], previewColor: "#8B5CF6" },
  { id: "vk-8", library: "video", categoryId: "storyboard", name: "标准 15s 带货分镜", description: "钩子(3s) → 卖点(8s) → 价格(2s) → CTA(2s)", tags: ["分镜", "15s"], previewColor: "#0EA5E9" },
  { id: "vk-9", library: "video", categoryId: "pacing", name: "3 秒一个信息点", description: "每 3 秒切换画面或字幕，保持信息流密度", tags: ["节奏", "信息密度"], previewColor: "#14B8A6" },
  { id: "vk-10", library: "video", categoryId: "hook-opening", name: "痛点提问开场", description: "「还在用 XX 吗？」类反问，3 秒内抓住注意", tags: ["钩子", "痛点"], previewColor: "#EF4444" },
  { id: "vk-11", library: "video", categoryId: "cta-ending", name: "限时优惠片尾", description: "倒计时 + 扫码领券 + 立即下单按钮", tags: ["CTA", "领券"], previewColor: "#DC2626" },
  { id: "vk-12", library: "video", categoryId: "motion-graphics", name: "促销角标动效", description: "「限时」「爆款」角标弹入，配合音效", tags: ["贴纸", "角标"], previewColor: "#F59E0B" },
  { id: "vk-13", library: "video", categoryId: "digital-human", name: "商务女性数字人", description: "正装形象，适合 B2B、知识讲解类广告", tags: ["数字人", "商务"], previewColor: "#64748B" },
  { id: "vk-14", library: "video", categoryId: "video-template", name: "快节奏带货模板", description: "9:16 · 15s · 图文转视频 · 卡点 BGM", tags: ["带货", "竖版"], previewColor: "#7C3AED" },
];

export const mockTasks: GenerationTask[] = [
  {
    id: "task-1",
    name: "防晒主图生成",
    type: "image",
    mode: "文生图",
    status: "processing",
    progress: 65,
    totalCount: 4,
    successCount: 3,
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
