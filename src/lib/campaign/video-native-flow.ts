import type { VideoCreativePlanFields } from "@/lib/campaign/types";

export const VIDEO_AGENT_INTRO =
  "请输入本次短视频广告的投放需求、风格要求、目标用户及核心卖点，我将自动拆解诉求、匹配渠道视频特性、筛选适配商品，并为你生成专属视频创意方案。";

export const VIDEO_CREATIVE_LOADING_HINT =
  "已确认选品，正在结合渠道特性、人群标签与视频节奏生成创意方案…";

export const VIDEO_TASK_SUBMITTED_HINT =
  "素材已提交，进入生成任务队列，请前往任务中心查看";

export const AUTO_SUBTITLE_OPTIONS = ["开启", "关闭"] as const;
export const VIDEO_DURATION_TIER_OPTIONS = ["15s", "30s", "45s"] as const;

export const LENS_COMPOSITION_OPTIONS = [
  "全景场景铺垫",
  "中景商品展示",
  "近景细节特写",
  "特写卖点聚焦",
  "多镜头混剪",
] as const;

export const CAMERA_MOVEMENT_OPTIONS = [
  "固定镜头",
  "缓慢推拉",
  "环绕运镜",
  "跟拍动态",
  "轻微抖动纪实风",
] as const;

export const CUT_FREQUENCY_OPTIONS = [
  "低速 3-5s 一镜",
  "中速 2-3s 一镜",
  "高速 1-2s 快剪",
] as const;

export const VIDEO_PLOT_STRUCTURE_OPTIONS = [
  "痛点引入-产品展示-卖点讲解-福利收尾",
  "场景种草-细节展示-权益引导",
  "纯产品质感展示",
] as const;

export const CORE_LENS_FOCUS_OPTIONS = [
  "侧重场景氛围",
  "侧重商品细节",
  "侧重使用过程",
  "侧重权益营销",
] as const;

export const VOICEOVER_STYLE_OPTIONS = [
  "口语化接地气",
  "专业简洁",
  "温柔种草",
  "强势营销",
] as const;

export const DYNAMIC_LIGHTING_OPTIONS = [
  "自然光动态渐变",
  "暖光氛围感动态",
  "高清纪实恒定光影",
] as const;

export const DYNAMIC_VISUAL_EFFECT_OPTIONS = [
  "原生实拍无滤镜",
  "轻微通透质感",
  "高清锐化质感",
] as const;

export function withVideoCreativeDefaults(
  fields: Partial<VideoCreativePlanFields>
): VideoCreativePlanFields {
  return {
    creativeAtmosphere: fields.creativeAtmosphere ?? "",
    mainTitle: fields.mainTitle ?? "",
    subTitle: fields.subTitle ?? "",
    ctaTitle: fields.ctaTitle ?? "",
    sceneEnvironment: fields.sceneEnvironment ?? "",
    lensCompositionForm: fields.lensCompositionForm ?? LENS_COMPOSITION_OPTIONS[1],
    cameraMovement: fields.cameraMovement ?? CAMERA_MOVEMENT_OPTIONS[0],
    cutFrequency: fields.cutFrequency ?? CUT_FREQUENCY_OPTIONS[1],
    videoPlotStructure: fields.videoPlotStructure ?? VIDEO_PLOT_STRUCTURE_OPTIONS[0],
    coreLensFocus: fields.coreLensFocus ?? CORE_LENS_FOCUS_OPTIONS[0],
    voiceoverStyle: fields.voiceoverStyle ?? VOICEOVER_STYLE_OPTIONS[0],
    dynamicLighting: fields.dynamicLighting ?? DYNAMIC_LIGHTING_OPTIONS[0],
    dynamicVisualEffect: fields.dynamicVisualEffect ?? DYNAMIC_VISUAL_EFFECT_OPTIONS[0],
    creativeStoryKernel: fields.creativeStoryKernel ?? "",
    fullVideoScript: fields.fullVideoScript ?? "",
  };
}

export function inferVideoDurationTier(userIntent: string, media?: string): string {
  if (/45\s*s|45秒|45s/i.test(userIntent)) return "45s";
  if (/30\s*s|30秒|30s/i.test(userIntent)) return "30s";
  if (media === "小红书") return "30s";
  if (media === "快手" || media === "抖音") return "15s";
  return "15s";
}

export function inferAutoSubtitle(userIntent: string): string {
  if (/不要字幕|无字幕|关闭字幕/.test(userIntent)) return "关闭";
  return "开启";
}
