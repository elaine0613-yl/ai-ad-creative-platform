import type { ImageCreativePlanFields } from "@/lib/campaign/types";

export const IMAGE_AGENT_INTRO =
  "请输入本次广告创作的投放需求、风格要求、目标用户及核心卖点，我将自动拆解投放诉求、匹配渠道特性、筛选适配商品，并为你生成专属广告创意方案。";

export const IMAGE_CREATIVE_LOADING_HINT =
  "已确认选品，正在结合渠道特性、人群标签与权益属性生成创意方案…";

export const IMAGE_CREATIVE_READY_HINT =
  "创意方案已生成，请核对下方字段；确认后可单张预览，支持退回修改或重新生成。";

export const IMAGE_TASK_SUBMITTED_HINT =
  "素材已提交，进入生成任务队列，请前往任务中心查看";

/** 画面主题形式 */
export const VISUAL_THEME_FORM_OPTIONS = [
  "平铺展示",
  "模特上身展示",
  "居家使用场景",
  "拆箱实拍",
  "细节特写",
  "对比测评场景",
] as const;

/** 画面光影 & 质感 */
export const LIGHTING_TEXTURE_OPTIONS = [
  "自然光",
  "暖光",
  "冷高级感",
  "高清实拍质感",
  "低饱和度治愈风",
  "高饱和促销风",
] as const;

export type VisualThemeForm = (typeof VISUAL_THEME_FORM_OPTIONS)[number];
export type LightingTexture = (typeof LIGHTING_TEXTURE_OPTIONS)[number];

export function withImageCreativeDefaults(
  fields: Partial<ImageCreativePlanFields>
): ImageCreativePlanFields {
  return {
    creativeAtmosphere: fields.creativeAtmosphere ?? "",
    mainTitle: fields.mainTitle ?? "",
    subTitle: fields.subTitle ?? "",
    ctaTitle: fields.ctaTitle ?? "",
    visualThemeForm: fields.visualThemeForm ?? VISUAL_THEME_FORM_OPTIONS[0],
    productDisplayForm: fields.productDisplayForm ?? "",
    sceneEnvironment: fields.sceneEnvironment ?? "",
    lightingTexture: fields.lightingTexture ?? LIGHTING_TEXTURE_OPTIONS[3],
    creativeStoryKernel: fields.creativeStoryKernel ?? "",
  };
}
