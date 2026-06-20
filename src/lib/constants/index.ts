import type { NavItem, PlatformPreset } from "@/lib/types";

export const NAV_ITEMS: NavItem[] = [
  { label: "首页", href: "/dashboard", icon: "LayoutDashboard" },
  { label: "图片创作", href: "/image/create", icon: "Image" },
  { label: "视频创作", href: "/video/create", icon: "Video" },
  { label: "模板中心", href: "/templates", icon: "LayoutTemplate" },
  { label: "品牌资产", href: "/brand", icon: "Palette" },
  { label: "我的素材", href: "/materials", icon: "FolderOpen" },
  { label: "任务中心", href: "/tasks", icon: "ListTodo", badge: "V1.1" },
  { label: "批量生成", href: "/batch", icon: "Upload", badge: "V1.1" },
  { label: "团队管理", href: "/team", icon: "Users", badge: "V1.2" },
];

export const INDUSTRIES = [
  "电商百货",
  "美妆护肤",
  "食品饮料",
  "3C数码",
  "本地生活",
  "教育培训",
  "服装鞋包",
  "家居家装",
];

export const IMAGE_SCENES = [
  "主图",
  "海报",
  "信息流",
  "促销活动",
  "节日营销",
  "品牌官宣",
];

export const IMAGE_STYLES = [
  "简约",
  "高级",
  "国潮",
  "科技",
  "ins风",
  "复古",
  "清新",
  "商务",
  "可爱",
  "暗黑",
];

export const VIDEO_STYLES = [
  "快节奏带货",
  "品牌故事",
  "产品展示",
  "口播讲解",
  "情感共鸣",
  "节日促销",
];

export const MUSIC_STYLES = ["节奏感强", "轻音乐", "电子", "国风", "无配乐"];

export const PLATFORM_PRESETS: PlatformPreset[] = [
  { id: "taobao", name: "淘宝主图", width: 800, height: 800 },
  { id: "jd", name: "京东主图", width: 800, height: 800 },
  { id: "xiaohongshu", name: "小红书竖图", width: 1080, height: 1440 },
  { id: "douyin", name: "抖音信息流", width: 1080, height: 1920 },
  { id: "wechat", name: "朋友圈海报", width: 1080, height: 1620 },
  { id: "banner", name: "横版 Banner", width: 1920, height: 1080 },
  { id: "kuaishou", name: "快手竖版", width: 1080, height: 1920 },
  { id: "pinduoduo", name: "拼多多主图", width: 800, height: 800 },
];

export const IMAGE_EDIT_MODES = [
  { id: "background", name: "换背景", description: "保留产品主体，替换为指定场景背景" },
  { id: "style", name: "风格转换", description: "整体更换视觉风格" },
  { id: "enhance", name: "画质增强", description: "无损放大、清晰度提升、色彩优化" },
  { id: "inpaint", name: "元素修改", description: "涂抹指定区域，输入文字描述替换元素" },
];

export const VIDEO_MODES = [
  { id: "text-to-video", name: "文生视频", description: "纯文字输入生成完整广告短视频" },
  { id: "images-to-video", name: "图文转视频", description: "上传多张产品图片自动生成动态视频" },
  { id: "smart-edit", name: "素材剪辑", description: "上传原始素材，AI自动剪辑成优质成片" },
  { id: "digital-human", name: "数字人口播", description: "输入文案生成数字人出镜口播广告" },
];

export const DIGITAL_HUMAN_AVATARS = [
  { id: "female-1", name: "小雅", style: "商务女性" },
  { id: "male-1", name: "小明", style: "商务男性" },
  { id: "female-2", name: "甜甜", style: "活力少女" },
  { id: "male-2", name: "阿杰", style: "阳光男孩" },
];

export const VOICE_OPTIONS = [
  { id: "voice-1", name: "温柔女声", emotion: "温和" },
  { id: "voice-2", name: "磁性男声", emotion: "专业" },
  { id: "voice-3", name: "活力女声", emotion: "热情" },
  { id: "voice-4", name: "沉稳男声", emotion: "可信" },
];

export const EXPORT_PLATFORMS = [
  "巨量千川",
  "抖音",
  "快手",
  "小红书",
  "视频号",
  "淘宝",
  "拼多多",
];

export const ROLE_LABELS: Record<string, string> = {
  admin: "团队管理员",
  creator: "创作者",
  viewer: "访客",
};

export const TASK_STATUS_LABELS: Record<string, string> = {
  queued: "排队中",
  processing: "生成中",
  completed: "已完成",
  failed: "失败",
};

export const COMPLIANCE_STATUS_LABELS: Record<string, string> = {
  passed: "通过",
  warning: "警告",
  rejected: "驳回",
};

export const GENERATION_FLOW_STEPS = [
  "配置参数",
  "AI 生成",
  "在线编辑",
  "合规检测",
  "导出交付",
];
