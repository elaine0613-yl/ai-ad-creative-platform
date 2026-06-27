import type { ConfigFieldDef, ConfigModuleDef } from "./config-types";

export const IMAGE_CONFIG_MODULES: ConfigModuleDef[] = [
  { id: "canvas", title: "画布基础配置", description: "画面比例、构图与行业模板" },
  { id: "subject", title: "主体视觉配置", description: "AI 生成核心：主体描述、参考图、风格与光影" },
  { id: "background", title: "背景配置", description: "背景类型与素材来源（个人库优先）" },
  { id: "copy", title: "多层结构化文案配置", description: "主标题、卖点、字体排版与配色" },
  { id: "marketing", title: "营销转化组件配置", description: "价格标签、角标与转化按钮" },
  { id: "export", title: "美化滤镜与导出配置", description: "滤镜风格与微特效" },
];

const COMPOSITION_OPTIONS = [
  { value: "", label: "请选择构图" },
  { value: "pub-comp-001", label: "居中主体构图（公共）" },
  { value: "my-composition", label: "我的构图模板…" },
];

const INDUSTRY_OPTIONS = [
  { value: "", label: "请选择行业" },
  { value: "beauty", label: "美妆" },
  { value: "fashion", label: "服饰" },
  { value: "3c", label: "3C 数码" },
  { value: "food", label: "食品茶饮" },
  { value: "home", label: "家居" },
];

export const IMAGE_CONFIG_FIELDS: Record<string, ConfigFieldDef[]> = {
  canvas: [
    {
      id: "aspectRatio",
      label: "画面比例",
      type: "select",
      options: [
        { value: "1:1", label: "1:1" },
        { value: "3:4", label: "3:4" },
        { value: "9:16", label: "9:16" },
        { value: "16:9", label: "16:9" },
      ],
      savableAsTemplate: true,
      templateSubCategory: "canvas-size",
    },
    {
      id: "compositionTemplate",
      label: "构图模板",
      type: "select",
      options: COMPOSITION_OPTIONS,
      hint: "系统预置 + 我的构图",
      savableAsTemplate: true,
      templateSubCategory: "composition",
    },
    {
      id: "industryTemplate",
      label: "行业模板",
      type: "select",
      options: INDUSTRY_OPTIONS,
      hint: "一键填充行业专属配色与版式",
    },
  ],
  subject: [
    {
      id: "subjectDescription",
      label: "主体描述词",
      type: "textarea",
      placeholder: "详细描述商品 / 人物 / 场景主体",
      rows: 3,
    },
    {
      id: "referenceAssetId",
      label: "参考主体图",
      type: "material-picker",
      assetCategory: "visual",
      assetSubCategory: "reference",
      hint: "本地上传 / 素材库选取",
    },
    {
      id: "visualStyle",
      label: "视觉风格",
      type: "select",
      options: [
        { value: "写实高清", label: "写实高清" },
        { value: "Ins 风", label: "Ins 风" },
        { value: "轻奢质感", label: "轻奢质感" },
        { value: "国潮风格", label: "国潮风格" },
        { value: "电商通透种草风", label: "电商通透种草风" },
      ],
      savableAsTemplate: true,
      templateSubCategory: "style",
    },
    {
      id: "lighting",
      label: "光影类型",
      type: "select",
      options: [
        { value: "柔光通透", label: "柔光通透" },
        { value: "硬光立体", label: "硬光立体" },
        { value: "自然日光", label: "自然日光" },
        { value: "暗调电影光", label: "暗调电影光" },
      ],
    },
    {
      id: "subjectEnhance",
      label: "主体超清增强",
      type: "switch",
      hint: "优化主体清晰度、去除杂物",
    },
  ],
  background: [
    {
      id: "backgroundType",
      label: "背景类型",
      type: "select",
      options: [
        { value: "solid", label: "纯色" },
        { value: "gradient", label: "渐变色" },
        { value: "blur-scene", label: "虚化场景图" },
        { value: "custom", label: "自定义素材图" },
      ],
      savableAsTemplate: true,
      templateSubCategory: "background",
    },
    {
      id: "backgroundAssetId",
      label: "背景素材来源",
      type: "material-picker",
      assetCategory: "visual",
      assetSubCategory: "background",
      hint: "个人素材库 > 公共素材库 > 本地上传",
    },
  ],
  copy: [
    {
      id: "mainTitle",
      label: "一级主标题",
      type: "text",
      placeholder: "核心营销利益点",
    },
    {
      id: "sellingPoints",
      label: "二级卖点短句",
      type: "textarea",
      placeholder: "每行一条，2~3 条产品核心优势",
      rows: 3,
    },
    {
      id: "typographyTemplate",
      label: "字体排版样式",
      type: "select",
      options: [
        { value: "", label: "系统预设" },
        { value: "pri-typo-001", label: "大标题排版模板（我的）" },
      ],
      savableAsTemplate: true,
      templateSubCategory: "typography",
    },
    {
      id: "textColorPrimary",
      label: "文字基础色",
      type: "color",
    },
    {
      id: "textColorAccent",
      label: "重点强调色",
      type: "color",
    },
  ],
  marketing: [
    { id: "priceTagEnabled", label: "价格标签开关", type: "switch" },
    { id: "originalPrice", label: "划线原价", type: "number", placeholder: "元" },
    { id: "salePrice", label: "活动售价", type: "number", placeholder: "元" },
    {
      id: "marketingBadges",
      label: "营销角标选择",
      type: "multiselect",
      options: [
        { value: "限时", label: "限时" },
        { value: "新品", label: "新品" },
        { value: "爆款", label: "爆款" },
        { value: "立减", label: "立减" },
        { value: "热销", label: "热销" },
      ],
    },
    {
      id: "ctaStyle",
      label: "转化按钮样式",
      type: "select",
      options: [
        { value: "solid-red", label: "实心红底" },
        { value: "outline", label: "描边样式" },
        { value: "gradient", label: "渐变样式" },
      ],
      savableAsTemplate: true,
      templateSubCategory: "cta-button",
    },
    { id: "ctaText", label: "转化按钮文案", type: "text", placeholder: "如：立即抢购" },
  ],
  export: [
    {
      id: "filterStyle",
      label: "滤镜风格",
      type: "select",
      options: [
        { value: "", label: "系统预设" },
        { value: "pub-filter-001", label: "电商通透滤镜（公共）" },
        { value: "my-filter", label: "我的自定义调色…" },
      ],
      savableAsTemplate: true,
      templateSubCategory: "filter",
    },
    {
      id: "microEffects",
      label: "微特效勾选",
      type: "multiselect",
      options: [
        { value: "glow", label: "光晕效果" },
        { value: "matte", label: "磨砂质感" },
        { value: "shadow", label: "立体投影" },
        { value: "stroke", label: "边缘描边" },
      ],
    },
  ],
};
