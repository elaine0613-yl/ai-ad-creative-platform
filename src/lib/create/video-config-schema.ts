import type { ConfigFieldDef, ConfigModuleDef } from "./config-types";

export const VIDEO_CONFIG_MODULES: ConfigModuleDef[] = [
  { id: "global", title: "视频全局基础配置", description: "总时长、画面比例、整体风格" },
  { id: "shots", title: "四段独立镜头配置", description: "0~3s 钩子 / 3~9s 场景 / 9~13s 卖点 / 13~15s 转化" },
  { id: "transitions", title: "转场跳转素材配置", description: "相邻镜头转场样式与节奏" },
  { id: "audio", title: "三轨音频配置", description: "背景音乐、AI 口播旁白、特效音效" },
  { id: "subtitle", title: "动态字幕与文字动画", description: "字幕文案、入场动画、关键词高亮" },
  { id: "marketing", title: "视频营销动效组件", description: "动态角标、指引元素、浮动贴纸" },
  { id: "finish", title: "成片调色与收尾转化", description: "全局滤镜与最后一帧转化画面" },
];

const SHOT_TYPE_OPTIONS = [
  { value: "产品特写镜头", label: "产品特写镜头" },
  { value: "中景使用场景镜头", label: "中景使用场景镜头" },
  { value: "全景环境镜头", label: "全景环境镜头" },
  { value: "前后对比镜头", label: "前后对比镜头" },
];

const TRANSITION_OPTIONS = [
  { value: "闪白硬切", label: "闪白硬切" },
  { value: "震动转场", label: "震动转场" },
  { value: "淡入淡出", label: "淡入淡出" },
  { value: "蒙版推拉", label: "蒙版推拉" },
  { value: "滑动转场", label: "滑动转场" },
  { value: "遮挡转场", label: "遮挡转场" },
];

function shotFields(prefix: string, label: string): ConfigFieldDef[] {
  return [
    {
      id: `${prefix}.shotType`,
      label: `${label} · 镜头类型`,
      type: "select",
      options: SHOT_TYPE_OPTIONS,
    },
    {
      id: `${prefix}.description`,
      label: `${label} · 生成描述词`,
      type: "textarea",
      placeholder: "描述当前镜头画面内容",
      rows: 2,
    },
    {
      id: `${prefix}.assetId`,
      label: `${label} · 镜头素材来源`,
      type: "material-picker",
      assetCategory: "visual",
      assetSubCategory: "video-clip",
      hint: "上传 / 个人库 / 公共库",
    },
  ];
}

export const VIDEO_CONFIG_FIELDS: Record<string, ConfigFieldDef[]> = {
  global: [
    {
      id: "duration",
      label: "视频总时长",
      type: "select",
      options: [
        { value: "10", label: "10 秒" },
        { value: "15", label: "15 秒" },
        { value: "30", label: "30 秒" },
      ],
      savableAsTemplate: true,
      templateSubCategory: "video-script",
    },
    {
      id: "aspectRatio",
      label: "视频画面比例",
      type: "select",
      options: [
        { value: "9:16", label: "9:16 竖版" },
        { value: "16:9", label: "16:9 横版" },
      ],
      savableAsTemplate: true,
      templateSubCategory: "canvas-size",
    },
    {
      id: "globalStyle",
      label: "视频整体风格",
      type: "select",
      options: [
        { value: "快节奏带货风格", label: "快节奏带货风格" },
        { value: "慢节奏种草风格", label: "慢节奏种草风格" },
        { value: "剧情氛围感风格", label: "剧情氛围感风格" },
      ],
      savableAsTemplate: true,
      templateSubCategory: "style",
    },
  ],
  shots: [
    ...shotFields("hookShot", "钩子镜头 (0~3s)"),
    ...shotFields("sceneShot", "场景展开镜头 (3~9s)"),
    ...shotFields("sellingShot", "卖点展示镜头 (9~13s)"),
    ...shotFields("ctaShot", "收尾转化镜头 (13~15s)"),
  ],
  transitions: [
    {
      id: "transitionHookScene",
      label: "钩子 → 场景 转场",
      type: "select",
      options: TRANSITION_OPTIONS,
      savableAsTemplate: true,
      templateSubCategory: "transition",
    },
    {
      id: "transitionSceneSelling",
      label: "场景 → 卖点 转场",
      type: "select",
      options: TRANSITION_OPTIONS,
    },
    {
      id: "transitionSellingCta",
      label: "卖点 → 转化 转场",
      type: "select",
      options: TRANSITION_OPTIONS,
    },
    {
      id: "transitionRhythm",
      label: "转场节奏模式",
      type: "select",
      options: [
        { value: "跟随背景音乐自动卡点", label: "跟随背景音乐自动卡点" },
        { value: "手动固定转场时间点", label: "手动固定转场时间点" },
      ],
    },
  ],
  audio: [
    {
      id: "bgmAssetId",
      label: "背景音乐来源",
      type: "material-picker",
      assetCategory: "audio",
      assetSubCategory: "bgm",
    },
    {
      id: "bgmVolume",
      label: "背景音乐音量",
      type: "slider",
      min: 0,
      max: 100,
      step: 5,
    },
    {
      id: "voiceoverScript",
      label: "旁白文案",
      type: "textarea",
      placeholder: "口播脚本，可从文案模板库填充",
      rows: 3,
    },
    {
      id: "voiceType",
      label: "配音音色",
      type: "select",
      options: [
        { value: "温柔女声", label: "温柔女声" },
        { value: "磁性男声", label: "磁性男声" },
        { value: "活力女声", label: "活力女声" },
        { value: "沉稳男声", label: "沉稳男声" },
      ],
    },
    {
      id: "voiceSpeed",
      label: "朗读语速",
      type: "slider",
      min: 0.5,
      max: 2,
      step: 0.1,
    },
    {
      id: "sfxPreset",
      label: "特效音效列表",
      type: "select",
      options: [
        { value: "", label: "请选择" },
        { value: "pub-sfx-001", label: "卡点鼓点音效包（公共）" },
      ],
      savableAsTemplate: true,
      templateSubCategory: "sfx",
    },
  ],
  subtitle: [
    {
      id: "subtitleText",
      label: "字幕文案内容",
      type: "textarea",
      rows: 2,
    },
    {
      id: "subtitleAnimation",
      label: "字幕入场动画",
      type: "select",
      options: [
        { value: "", label: "请选择" },
        { value: "pub-sub-001", label: "逐字弹出（公共）" },
        { value: "slide-in", label: "滑动入场" },
        { value: "scale", label: "缩放强调" },
        { value: "scroll", label: "底部滚动" },
      ],
      savableAsTemplate: true,
      templateSubCategory: "subtitle-animation",
    },
    {
      id: "keywordHighlight",
      label: "关键词高亮设置",
      type: "text",
      placeholder: "如：领券#FF4D4F放大",
    },
  ],
  marketing: [
    {
      id: "dynamicBadges",
      label: "动态角标组件",
      type: "multiselect",
      options: [
        { value: "倒计时", label: "倒计时角标" },
        { value: "热销", label: "热销跳动标签" },
        { value: "限时", label: "限时标识" },
      ],
    },
    { id: "guideElements", label: "指引类元素", type: "switch", hint: "动态箭头、点击光斑" },
    {
      id: "floatingStickers",
      label: "浮动贴纸组",
      type: "text",
      placeholder: "优惠浮动贴纸组合描述",
    },
  ],
  finish: [
    {
      id: "globalFilter",
      label: "全局滤镜",
      type: "select",
      options: [
        { value: "", label: "系统滤镜" },
        { value: "pub-filter-001", label: "电商通透滤镜" },
      ],
      savableAsTemplate: true,
      templateSubCategory: "filter",
    },
    {
      id: "endFrameAssetId",
      label: "收尾转化画面",
      type: "material-picker",
      assetCategory: "visual",
      assetSubCategory: "end-frame",
      hint: "模板 / 上传 / 素材库",
    },
  ],
};
