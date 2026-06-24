import type { KnowledgeCategory, NavItem, PlatformPreset } from "@/lib/types";

export const NAV_ITEMS: NavItem[] = [
  { label: "图片创作", href: "/image/create", icon: "Image" },
  { label: "视频创作", href: "/video/create", icon: "Video" },
  { label: "知识库", href: "/knowledge", icon: "BookOpen" },
  { label: "素材库", href: "/materials", icon: "FolderOpen" },
  { label: "任务中心", href: "/tasks", icon: "ListTodo" },
];

/** 图片知识库 — 广告平面素材结构 */
export const IMAGE_KNOWLEDGE_CATEGORIES: KnowledgeCategory[] = [
  {
    id: "composition",
    library: "image",
    label: "画面构图",
    description: "广告画面的布局结构与视觉焦点组织",
    terms: ["三分法", "居中构图", "对角线构图", "留白", "视觉动线", "黄金分割"],
  },
  {
    id: "visual-style",
    library: "image",
    label: "视觉风格",
    description: "整体美学调性与行业常见风格预设",
    terms: ["简约高级", "国潮复古", "科技未来", "ins 清新", "促销热闹", "商务可信"],
  },
  {
    id: "color-scheme",
    library: "image",
    label: "色彩方案",
    description: "主色、辅色、促销色与色彩心理学应用",
    terms: ["品牌主色", "对比色", "渐变色", "促销红", "信任蓝", "食欲暖色"],
  },
  {
    id: "scene-background",
    library: "image",
    label: "场景背景",
    description: "棚拍、生活场景、节日氛围等背景设定",
    terms: ["纯白底", "生活场景", "节日氛围", "户外自然", "渐变抽象", "直播间风"],
  },
  {
    id: "lighting-mood",
    library: "image",
    label: "光影氛围",
    description: "布光方式与画面情绪表达",
    terms: ["柔光", "硬光", "逆光轮廓", "高调明亮", "低调质感", "霓虹氛围"],
  },
  {
    id: "copy-layout",
    library: "image",
    label: "文案排版",
    description: "主标题、卖点、价格、CTA 的信息层级",
    terms: ["主标题", "副标题", "卖点 bullet", "价格标签", "CTA 按钮", "角标贴纸"],
  },
  {
    id: "product-display",
    library: "image",
    label: "产品展示",
    description: "产品呈现方式与卖点可视化",
    terms: ["单品特写", "组合陈列", "前后对比", "成分拆解", "使用场景", "功效可视化"],
  },
  {
    id: "industry-template",
    library: "image",
    label: "行业模板",
    description: "按行业与营销场景沉淀的可复用模板",
    terms: ["电商大促", "美妆护肤", "3C 数码", "本地生活", "节日营销", "新品首发"],
  },
];

/** 视频知识库 — 广告短视频制作要素 */
export const VIDEO_KNOWLEDGE_CATEGORIES: KnowledgeCategory[] = [
  {
    id: "bgm",
    library: "video",
    label: "BGM 背景音乐",
    description: "配乐风格、情绪与节奏匹配",
    terms: ["节奏感强", "轻音乐", "电子乐", "国风", "悬疑感", "无配乐"],
  },
  {
    id: "voiceover",
    library: "video",
    label: "配音旁白",
    description: "口播音色、语速与情绪表达",
    terms: ["磁性男声", "温柔女声", "活力青年", "专业解说", "方言口音", "AI 配音"],
  },
  {
    id: "sfx",
    library: "video",
    label: "音效 SFX",
    description: "强调卖点、转场、点击等短音效",
    terms: ["Whoosh", "Pop", "金币到账", "快门声", "提示音", "环境音"],
  },
  {
    id: "subtitles",
    library: "video",
    label: "字幕花字",
    description: "字幕样式、关键词高亮与信息强化",
    terms: ["底部字幕", "关键词高亮", "动态花字", "价格弹出", "卖点标签", "双语字幕"],
  },
  {
    id: "transitions",
    library: "video",
    label: "转场动效",
    description: "镜头之间的衔接方式与节奏感",
    terms: ["硬切", "溶解", "滑动", "缩放", "闪白", "匹配剪辑"],
  },
  {
    id: "storyboard",
    library: "video",
    label: "分镜脚本",
    description: "镜头拆解、画面描述与时长分配",
    terms: ["开场镜头", "产品特写", "使用演示", "对比镜头", "证言镜头", "结尾 CTA"],
  },
  {
    id: "pacing",
    library: "video",
    label: "节奏剪辑",
    description: "镜头时长、卡点与信息密度控制",
    terms: ["快节奏卡点", "慢节奏叙事", "3 秒一个信息点", "前 3 秒钩子", "信息密度", "BPM 对齐"],
  },
  {
    id: "hook-opening",
    library: "video",
    label: "开场钩子",
    description: "前 3 秒抓住注意力的开场设计",
    terms: ["痛点提问", "价格冲击", "效果对比", "悬念反转", "热门 BGM 开场", "视觉冲击"],
  },
  {
    id: "cta-ending",
    library: "video",
    label: "CTA 片尾",
    description: "引导下单、关注、领券等行动号召",
    terms: ["限时优惠", "扫码领券", "立即下单", "关注账号", "搜索关键词", "品牌 Slogan"],
  },
  {
    id: "motion-graphics",
    library: "video",
    label: "贴纸动效",
    description: "角标、箭头、表情包等动态装饰元素",
    terms: ["促销角标", "箭头指引", "点赞关注", "倒计时", "弹幕效果", "表情包贴纸"],
  },
  {
    id: "digital-human",
    library: "video",
    label: "数字人出镜",
    description: "虚拟主播、口播形象与场景设定",
    terms: ["商务形象", "直播带货", "知识讲解", "绿幕合成", "多机位", "手势动作"],
  },
  {
    id: "video-template",
    library: "video",
    label: "视频模板",
    description: "按行业与投放场景沉淀的视频结构模板",
    terms: ["快节奏带货", "品牌故事", "产品展示", "口播讲解", "情感共鸣", "节日促销"],
  },
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
