import type { KnowledgeEntry, KnowledgePartition, KnowledgeQuery } from "./catalog-types";

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 16).replace("T", " ");
}

export const KNOWLEDGE_ENTRIES: KnowledgeEntry[] = [
  // ── 视频知识库 ──
  {
    id: "vk-1",
    knowledgeId: "KN-V-001",
    partition: "video",
    subLibrary: "channel-rules",
    title: "抖音短视频 · 快节奏福利向内容规范",
    channels: ["douyin"],
    brand: "shenquan",
    industries: ["all"],
    qualityTags: ["official-recommend", "high-conversion"],
    summary: "前 3 秒强钩子、15s 内完成利益点展示；禁止静态长镜头，福利信息需口播+字幕双呈现。",
    content:
      "## 抖音频道规则\n\n1. **节奏**：前 3 秒必须出现利益钩子（价格/券/限时）。\n2. **镜头**：单镜头不超过 3s，福利段快切。\n3. **口播**：口语化、短句，避免书面语。\n4. **禁忌**：无 BGM 纯口播超过 5s、静态商品图超过 2s。",
    remark: "2026 Q2 投放复盘更新",
    tags: ["抖音", "快节奏", "福利"],
    status: "active",
    createdBy: "运营-小王",
    createdAt: daysAgo(45),
    updatedAt: daysAgo(3),
    usageCount: 428,
    version: 4,
  },
  {
    id: "vk-2",
    knowledgeId: "KN-V-002",
    partition: "video",
    subLibrary: "digital-avatar",
    title: "数字人「小省 · 邻家姐姐」",
    channels: ["douyin", "kuaishou"],
    brand: "shenquan",
    industries: ["food", "home"],
    qualityTags: ["hit-saved", "high-conversion"],
    summary: "25-30 岁邻家风格，适合日用/食品种草；语速中等偏快，实测 CTR 高于均值 18%。",
    content:
      "形象：邻家姐姐，休闲居家穿搭。\n人设：会过日子、爱分享省钱技巧。\n适用：食品、家居、日用。\n节奏：中速口播，每 5s 一个利益点。\n备注：不适合 3C 专业讲解场景。",
    tags: ["数字人", "种草", "实测优质"],
    status: "active",
    createdBy: "运营-小李",
    createdAt: daysAgo(60),
    updatedAt: daysAgo(10),
    usageCount: 156,
    version: 2,
  },
  {
    id: "vk-3",
    knowledgeId: "KN-V-003",
    partition: "video",
    subLibrary: "brand-assets",
    title: "品牌 LOGO 贴片与口播固定话术",
    channels: ["all"],
    brand: "shenquan",
    industries: ["all"],
    qualityTags: ["official-recommend"],
    summary: "片头/片尾 LOGO 由工程后置；口播固定结尾「省钱神券，领券更划算」。",
    content:
      "LOGO：工程批量合成，运营无需配置。\n固定口播结尾：「省钱神券，领券更划算」。\n主色：#FF0036，辅色：#FFD700。\n禁用：极限词变体、非官方 Slogan。",
    tags: ["品牌", "LOGO", "口播"],
    status: "active",
    createdBy: "品牌管理员",
    createdAt: daysAgo(90),
    updatedAt: daysAgo(20),
    usageCount: 890,
    version: 3,
  },
  {
    id: "vk-4",
    knowledgeId: "KN-V-004",
    partition: "video",
    subLibrary: "risk-control",
    title: "短视频禁用极限词与违规画面清单",
    channels: ["all"],
    brand: "platform",
    industries: ["all"],
    qualityTags: ["official-recommend"],
    summary: "禁用「全网最低」「第一」等极限词；禁止虚假医疗暗示、夸大 Before/After。",
    content:
      "禁用话术：全网最低、史上最强、100% 有效、绝对、第一品牌。\n违规画面：虚假医疗效果、未授权明星肖像、政治敏感元素。\n各渠道补充：抖音禁静态二维码超过 3s。",
    tags: ["合规", "极限词", "审核"],
    status: "active",
    createdBy: "合规组",
    createdAt: daysAgo(120),
    updatedAt: daysAgo(5),
    usageCount: 2100,
    version: 6,
  },
  {
    id: "vk-5",
    knowledgeId: "KN-V-005",
    partition: "video",
    subLibrary: "bgm",
    title: "轻快促销 BGM · 618 节点专用",
    channels: ["douyin", "kuaishou"],
    brand: "shenquan",
    industries: ["all"],
    qualityTags: ["hit-saved", "high-conversion"],
    summary: "120BPM 轻快电子，适合 15s 福利快剪；版权已确认，618 大促实测转化 +12%。",
    content:
      "节奏：120BPM，轻快电子。\n场景：促销、福利、限时。\n时长适配：15s / 30s。\n版权：已购买商用授权。\n备注：勿与慢节奏种草视频混用。",
    tags: ["BGM", "促销", "618"],
    status: "active",
    createdBy: "运营-小张",
    createdAt: daysAgo(30),
    updatedAt: daysAgo(2),
    usageCount: 234,
    version: 1,
  },
  {
    id: "vk-6",
    knowledgeId: "KN-V-006",
    partition: "video",
    subLibrary: "transitions",
    title: "快剪福利向 · 缩放+闪白转场组合",
    channels: ["douyin"],
    brand: "shenquan",
    industries: ["all"],
    qualityTags: ["high-conversion"],
    summary: "1-2s 快切配缩放弹入+闪白，适合福利段商品轮播，避免过度花哨。",
    content: "转场类型：缩放弹入 + 闪白。\n适配节奏：高速 1-2s 一镜。\n适用风格：福利促销、多 SKU 轮播。\n禁忌：连续 3 次以上相同转场。",
    tags: ["转场", "快剪"],
    status: "active",
    createdBy: "运营-小王",
    createdAt: daysAgo(25),
    updatedAt: daysAgo(25),
    usageCount: 89,
    version: 1,
  },
  {
    id: "vk-7",
    knowledgeId: "KN-V-007",
    partition: "video",
    subLibrary: "voice",
    title: "AI 音色「暖声种草 · 女声」",
    channels: ["xiaohongshu", "douyin"],
    brand: "platform",
    industries: ["beauty", "food"],
    qualityTags: ["hit-saved"],
    summary: "温柔偏慢，适合小红书慢节奏种草；语速 180 字/分钟，实测完播率 +8%。",
    content: "风格：温柔种草女声。\n语速：180 字/分钟。\n适用：美妆、食品、生活方式。\n不适配：强势逼单、倒计时促销。",
    tags: ["音色", "种草", "女声"],
    status: "active",
    createdBy: "运营-小李",
    createdAt: daysAgo(40),
    updatedAt: daysAgo(8),
    usageCount: 167,
    version: 2,
  },
  {
    id: "vk-8",
    knowledgeId: "KN-V-008",
    partition: "video",
    subLibrary: "subtitle-templates",
    title: "抖音竖版 · 底部居中字幕框架",
    channels: ["douyin"],
    brand: "platform",
    industries: ["all"],
    qualityTags: ["official-recommend"],
    summary: "字幕样式工程后置；文案框架：痛点句 → 利益句 → CTA，每段不超过 12 字。",
    content:
      "排版：底部居中，工程批量合成。\n文案框架：\n- 痛点引入（≤12 字）\n- 利益展示（≤12 字）\n- CTA 引导（≤8 字）\n出现节奏：与口播同步，每句 2-3s。",
    tags: ["字幕", "框架"],
    status: "active",
    createdBy: "设计规范组",
    createdAt: daysAgo(50),
    updatedAt: daysAgo(15),
    usageCount: 512,
    version: 2,
  },
  {
    id: "vk-9",
    knowledgeId: "KN-V-009",
    partition: "video",
    subLibrary: "lens-scripts",
    title: "15s 四段式 · 痛点-展示-卖点-福利",
    channels: ["douyin", "kuaishou"],
    brand: "shenquan",
    industries: ["food", "home"],
    qualityTags: ["hit-saved", "high-conversion"],
    summary: "0-3s 痛点钩子 → 3-8s 商品展示 → 8-12s 卖点口播 → 12-15s 福利收尾，实测高起量结构。",
    content:
      "镜头 1（0-3s）：中景生活场景，口播痛点。\n镜头 2（3-8s）：近景商品展示，快切 2-3 镜。\n镜头 3（8-12s）：特写卖点，口播讲解。\n镜头 4（12-15s）：福利 CTA，固定收尾话术。\n运镜：固定+轻微推拉。",
    tags: ["脚本", "15s", "四段式"],
    status: "active",
    createdBy: "运营-小王",
    createdAt: daysAgo(35),
    updatedAt: daysAgo(4),
    usageCount: 378,
    version: 3,
  },
  {
    id: "vk-10",
    knowledgeId: "KN-V-010",
    partition: "video",
    subLibrary: "copy-scripts",
    title: "促销逼单口播话术 · 限时福利版",
    channels: ["douyin", "kuaishou"],
    brand: "shenquan",
    industries: ["all"],
    qualityTags: ["high-conversion", "newly-added"],
    summary: "「现在领券立减 XX，手慢无」系列话术，配合倒计时画面，禁止极限词。",
    content:
      "开场：「还在原价买？先领券再下单」\n逼单：「券后只要 XX 元，今天有效」\n收尾：「省钱神券，领券更划算，链接在下方」\n禁用：全网最低、史上最强。",
    tags: ["口播", "促销", "逼单"],
    status: "active",
    createdBy: "运营-小张",
    createdAt: daysAgo(6),
    updatedAt: daysAgo(1),
    usageCount: 45,
    version: 1,
  },
  {
    id: "vk-11",
    knowledgeId: "KN-V-011",
    partition: "video",
    subLibrary: "channel-rules",
    title: "小红书 · 慢节奏种草视频偏好",
    channels: ["xiaohongshu"],
    brand: "platform",
    industries: ["beauty", "fashion"],
    qualityTags: ["newly-added"],
    summary: "侧重氛围感与使用过程，单镜 3-5s，口播温柔种草，避免硬广促销感。",
    content: "节奏：慢节奏，单镜 3-5s。\n内容：场景氛围 > 硬卖点。\n口播：温柔种草，第一人称体验。\n禁忌：大字促销、闪烁价格标签。",
    tags: ["小红书", "种草", "慢节奏"],
    status: "pending",
    createdBy: "运营-小李",
    createdAt: daysAgo(2),
    updatedAt: daysAgo(2),
    usageCount: 0,
    version: 1,
  },

  // ── 图片知识库 ──
  {
    id: "ik-1",
    knowledgeId: "KN-I-001",
    partition: "image",
    subLibrary: "channel-rules",
    title: "抖音信息流 · 高点击图片特征",
    channels: ["douyin"],
    brand: "shenquan",
    industries: ["all"],
    qualityTags: ["official-recommend", "high-conversion"],
    summary: "高对比促销色、商品占画面 40%+、主标题 ≤8 字；避免复杂背景干扰。",
    content:
      "构图：商品居中或偏右，左侧文案区。\n色彩：高对比红金/橙黄促销色。\n文案：主标题 ≤8 字，副标题 ≤15 字。\n禁忌：过多小字、低对比度、模糊商品图。",
    tags: ["抖音", "信息流", "高点击"],
    status: "active",
    createdBy: "运营-小王",
    createdAt: daysAgo(55),
    updatedAt: daysAgo(7),
    usageCount: 567,
    version: 3,
  },
  {
    id: "ik-2",
    knowledgeId: "KN-I-002",
    partition: "image",
    subLibrary: "brand-assets",
    title: "外投图 LOGO 摆放与留白规范",
    channels: ["all"],
    brand: "shenquan",
    industries: ["all"],
    qualityTags: ["official-recommend"],
    summary: "LOGO 左上角，四周 0.5× 字高留白；深色底用反白版本，禁止拉伸变形。",
    content:
      "位置：左上角，不与促销角标重叠。\n留白：四周至少 0.5× 字高。\n缩放：等比，宽度 ≥ 画面 12%。\n配色：浅色底主色 LOGO，深色底反白。",
    tags: ["LOGO", "留白", "品牌"],
    status: "active",
    createdBy: "品牌管理员",
    createdAt: daysAgo(100),
    updatedAt: daysAgo(18),
    usageCount: 920,
    version: 4,
  },
  {
    id: "ik-3",
    knowledgeId: "KN-I-003",
    partition: "image",
    subLibrary: "risk-control",
    title: "图片违规文字与虚假宣传避雷",
    channels: ["all"],
    brand: "platform",
    industries: ["all"],
    qualityTags: ["official-recommend"],
    summary: "禁用极限词、虚假原价对比、未授权明星肖像；低质模糊图直接驳回。",
    content:
      "禁用文字：全网最低、第一品牌、100% 有效。\n虚假构图：虚构原价划线、夸大折扣比例。\n画面：模糊/马赛克商品、未授权肖像。\n低质特征：分辨率 < 800px、严重压缩噪点。",
    tags: ["合规", "图片", "审核"],
    status: "active",
    createdBy: "合规组",
    createdAt: daysAgo(110),
    updatedAt: daysAgo(6),
    usageCount: 1800,
    version: 5,
  },
  {
    id: "ik-4",
    knowledgeId: "KN-I-004",
    partition: "image",
    subLibrary: "product-assets",
    title: "3C 数码 · 白底高清商品图标准",
    channels: ["all"],
    brand: "platform",
    industries: ["3c"],
    qualityTags: ["high-conversion"],
    summary: "纯白底、商品占画面 70%、无阴影脏边；附 45° 细节图与包装图各 1 张。",
    content:
      "底图：纯白 #FFFFFF，商品居中。\n占比：商品占画面 70%±5%。\n配套：45° 细节图、包装正面图。\n淘汰标准：模糊、色差、水印、非官方图。",
    tags: ["商品图", "3C", "白底"],
    status: "active",
    createdBy: "运营-小陈",
    createdAt: daysAgo(70),
    updatedAt: daysAgo(12),
    usageCount: 234,
    version: 2,
  },
  {
    id: "ik-5",
    knowledgeId: "KN-I-005",
    partition: "image",
    subLibrary: "visual-styles",
    title: "国潮促销风 · 视觉规范",
    channels: ["douyin"],
    brand: "shenquan",
    industries: ["all"],
    qualityTags: ["hit-saved"],
    summary: "红金配色 + 祥云纹样边框 + 大促节点氛围，适合 618/双 11 外投。",
    content:
      "主色：#FF0036 + #FFD700。\n元素：祥云纹、灯笼、优惠券角标。\n光影：高对比、轻微光晕。\n禁用：与品牌辅色冲突的荧光色。",
    tags: ["国潮", "促销", "视觉风格"],
    status: "active",
    createdBy: "运营-小张",
    createdAt: daysAgo(40),
    updatedAt: daysAgo(9),
    usageCount: 312,
    version: 2,
  },
  {
    id: "ik-6",
    knowledgeId: "KN-I-006",
    partition: "image",
    subLibrary: "composition-templates",
    title: "左右分栏 · 商品+文案构图",
    channels: ["all"],
    brand: "platform",
    industries: ["all"],
    qualityTags: ["high-conversion"],
    summary: "左 40% 文案区 + 右 60% 商品区，适合 1:1 方图与 9:16 竖版。",
    content:
      "布局：左文案右商品，或上文案下商品（竖版）。\n文案区：主标题+副标题+CTA 标签。\n商品区：单品居中，留 10% 边距。\n适配：1:1、9:16。",
    tags: ["构图", "分栏"],
    status: "active",
    createdBy: "设计规范组",
    createdAt: daysAgo(80),
    updatedAt: daysAgo(22),
    usageCount: 445,
    version: 2,
  },
  {
    id: "ik-7",
    knowledgeId: "KN-I-007",
    partition: "image",
    subLibrary: "copy-layout",
    title: "主副标题字号层级规范",
    channels: ["all"],
    brand: "shenquan",
    industries: ["all"],
    qualityTags: ["official-recommend"],
    summary: "主标题 48-56px 粗体，副标题 28-32px 常规；CTA 标签独立色块，不遮挡商品主体。",
    content:
      "主标题：48-56px，粗体，≤8 字。\n副标题：28-32px，常规，≤15 字。\nCTA：独立色块按钮样式，≤6 字。\n禁忌：文字压商品主体、超过 3 行小字。",
    tags: ["排版", "字体", "层级"],
    status: "active",
    createdBy: "设计规范组",
    createdAt: daysAgo(65),
    updatedAt: daysAgo(14),
    usageCount: 678,
    version: 3,
  },
  {
    id: "ik-8",
    knowledgeId: "KN-I-008",
    partition: "image",
    subLibrary: "decorations",
    title: "促销角标 · 限时/券后价标签",
    channels: ["douyin", "kuaishou"],
    brand: "shenquan",
    industries: ["all"],
    qualityTags: ["hit-saved"],
    summary: "右上角限时角标 + 左下角券后价标签，统一品牌色，禁止低俗贴纸。",
    content: "角标：右上角「限时」「券后价」。\n样式：圆角矩形，品牌红底白字。\n大小：不超过画面 15%。\n淘汰：闪烁 GIF、低俗表情贴纸。",
    tags: ["装饰", "角标", "促销"],
    status: "active",
    createdBy: "运营-小王",
    createdAt: daysAgo(28),
    updatedAt: daysAgo(5),
    usageCount: 189,
    version: 1,
  },
  {
    id: "ik-9",
    knowledgeId: "KN-I-009",
    partition: "image",
    subLibrary: "scene-assets",
    title: "家居场景 · 真实生活背景素材",
    channels: ["xiaohongshu", "douyin"],
    brand: "platform",
    industries: ["home"],
    qualityTags: ["high-conversion"],
    summary: "暖光客厅/厨房实景，低饱和、无杂乱杂物；适合家居日用类种草外投。",
    content:
      "场景：暖光客厅、开放式厨房、卧室床头。\n色调：低饱和、自然光。\n要求：无杂乱杂物、无其他品牌 LOGO。\n淘汰：过度滤镜、虚假 3D 渲染感。",
    tags: ["场景", "家居", "实景"],
    status: "active",
    createdBy: "运营-小李",
    createdAt: daysAgo(33),
    updatedAt: daysAgo(11),
    usageCount: 156,
    version: 2,
  },
  {
    id: "ik-10",
    knowledgeId: "KN-I-010",
    partition: "image",
    subLibrary: "selling-copy",
    title: "外投短卖点 · 领券省钱系列",
    channels: ["all"],
    brand: "shenquan",
    industries: ["all"],
    qualityTags: ["high-conversion", "newly-added"],
    summary: "「领券立减 XX」「券后仅需 XX」系列短卖点，主标题 ≤8 字，禁止极限词。",
    content:
      "主标题示例：\n- 领券立减 20\n- 券后仅需 9.9\n- 今日领券更划算\n\nCTA 标签：\n- 立即领券\n- 马上抢\n\n禁用：全网最低、史上最强。",
    tags: ["卖点", "文案", "领券"],
    status: "active",
    createdBy: "运营-小张",
    createdAt: daysAgo(8),
    updatedAt: daysAgo(1),
    usageCount: 67,
    version: 1,
  },
  {
    id: "ik-11",
    knowledgeId: "KN-I-011",
    partition: "image",
    subLibrary: "visual-styles",
    title: "小红书种草风 · 极简高级灰",
    channels: ["xiaohongshu"],
    brand: "platform",
    industries: ["beauty", "fashion"],
    qualityTags: ["newly-added"],
    summary: "低饱和高级灰 + 大留白 + 生活化场景，弱化促销感，强化质感与氛围。",
    content: "色调：低饱和灰、米白、莫兰迪色。\n构图：大留白，商品占比 50%。\n文案：种草口吻，≤12 字。\n禁忌：大红促销色、闪烁角标。",
    tags: ["小红书", "种草", "极简"],
    status: "disabled",
    createdBy: "运营-小李",
    createdAt: daysAgo(15),
    updatedAt: daysAgo(3),
    usageCount: 23,
    version: 1,
  },
];

function parseEntryDate(iso: string): Date {
  return new Date(iso.replace(" ", "T"));
}

export function queryKnowledgeEntries(query: KnowledgeQuery): KnowledgeEntry[] {
  const now = new Date();
  let dateFrom: Date | null = null;
  let dateTo: Date | null = null;

  if (query.datePreset === "7d") {
    dateFrom = new Date(now);
    dateFrom.setDate(dateFrom.getDate() - 7);
  } else if (query.datePreset === "30d") {
    dateFrom = new Date(now);
    dateFrom.setDate(dateFrom.getDate() - 30);
  }
  if (query.dateFrom) dateFrom = new Date(query.dateFrom);
  if (query.dateTo) dateTo = new Date(query.dateTo);

  return KNOWLEDGE_ENTRIES.filter((e) => {
    if (e.partition !== query.partition) return false;
    if (query.subLibrary && query.subLibrary !== "all" && e.subLibrary !== query.subLibrary) return false;
    if (query.channel && query.channel !== "all" && !e.channels.includes(query.channel) && !e.channels.includes("all"))
      return false;
    if (query.brand && query.brand !== "all" && e.brand !== query.brand) return false;
    if (
      query.industry &&
      query.industry !== "all" &&
      !e.industries.includes(query.industry) &&
      !e.industries.includes("all")
    )
      return false;
    if (query.status && query.status !== "all" && e.status !== query.status) return false;
    if (query.qualityTag && query.qualityTag !== "all" && !e.qualityTags.includes(query.qualityTag))
      return false;
    if (query.knowledgeId?.trim() && !e.knowledgeId.toLowerCase().includes(query.knowledgeId.trim().toLowerCase()))
      return false;

    const updated = parseEntryDate(e.updatedAt);
    if (dateFrom && updated < dateFrom) return false;
    if (dateTo && updated > dateTo) return false;

    if (query.search?.trim()) {
      const q = query.search.trim().toLowerCase();
      const hay = [e.knowledgeId, e.title, e.summary, e.remark ?? "", ...e.tags].join(" ").toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}

export function countByPartition(partition: KnowledgePartition): number {
  return KNOWLEDGE_ENTRIES.filter((e) => e.partition === partition).length;
}
