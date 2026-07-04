import type { RequirementBrief } from "./types";

/** 渠道静默映射：尺寸、用户偏好、合规基线（不在需求确认面板展示） */
export const CHANNEL_SILENT_PROFILES: Record<
  string,
  { size: string; aspectRatio: string; userTags: string; compliance: string; channel: string }
> = {
  抖音: {
    size: "1080×1920",
    aspectRatio: "9:16",
    userTags: "快节奏、强钩子、价格对比、真实场景",
    compliance: "禁用极限词、虚假促销、夸大功效",
    channel: "信息流",
  },
  快手: {
    size: "1080×1920",
    aspectRatio: "9:16",
    userTags: "优惠导向、性价比、福利秒杀、接地气",
    compliance: "禁用极限词、虚假低价、误导性对比",
    channel: "信息流",
  },
  小红书: {
    size: "1080×1440",
    aspectRatio: "3:4",
    userTags: "质感种草、生活场景、低饱和、真实分享感",
    compliance: "避免硬广感、禁用极限词、标注广告属性",
    channel: "外投",
  },
  淘宝: {
    size: "800×800",
    aspectRatio: "1:1",
    userTags: "主图转化、价格标签、促销角标",
    compliance: "主图规范、禁止牛皮癣、价格真实",
    channel: "电商站内",
  },
  京东: {
    size: "800×800",
    aspectRatio: "1:1",
    userTags: "品质感、参数可视化、促销节点",
    compliance: "主图规范、3C 需资质说明",
    channel: "电商站内",
  },
  拼多多: {
    size: "800×800",
    aspectRatio: "1:1",
    userTags: "低价捡漏、券后价、拼团氛围",
    compliance: "禁止虚假低价、极限词",
    channel: "外投",
  },
};

const CHANNEL_VIDEO_SILENT: Record<
  string,
  { aspectRatio: string; contentSpec: string; nativePreference: string }
> = {
  抖音: {
    aspectRatio: "9:16",
    contentSpec: "竖版短视频 15-60s，动态画面合规，禁止静态硬广贴片",
    nativePreference: "强钩子快节奏、前 3 秒抓注意力、口播+字幕双轨",
  },
  快手: {
    aspectRatio: "9:16",
    contentSpec: "竖版福利短视频，强调真实感与性价比表达",
    nativePreference: "快节奏福利导向、接地气口播、强转化引导",
  },
  小红书: {
    aspectRatio: "9:16",
    contentSpec: "种草 vlog 风格，弱化硬广，生活场景真实感",
    nativePreference: "慢节奏质感种草、场景叙事、低饱和画面",
  },
  淘宝: {
    aspectRatio: "1:1",
    contentSpec: "方形/竖版商品短视频，主图视频规范",
    nativePreference: "商品特写+价格对比、促销节点强化",
  },
  京东: {
    aspectRatio: "16:9",
    contentSpec: "横版/竖版商品展示视频，3C 需参数可视化",
    nativePreference: "专业简洁、品质感、功能演示",
  },
  拼多多: {
    aspectRatio: "9:16",
    contentSpec: "竖版促销短视频，券后价真实表达",
    nativePreference: "捡漏氛围、快节奏、福利引导",
  },
};

export function applySilentChannelFields(
  requirement: RequirementBrief,
  media: string
): RequirementBrief {
  const profile = CHANNEL_SILENT_PROFILES[media];
  if (!profile) return requirement;
  return {
    ...requirement,
    media,
    platform: media,
    channel: requirement.channel || profile.channel,
    sizeRequirement: profile.size,
    aspectRatio: profile.aspectRatio,
    silentUserTags: profile.userTags,
    silentComplianceBaseline: profile.compliance,
  };
}

/** 视频链路静默映射：画幅、内容规范、原生偏好（不在面板展示） */
export function applySilentVideoChannelFields(
  requirement: RequirementBrief,
  media: string
): RequirementBrief {
  const base = applySilentChannelFields(requirement, media);
  const video = CHANNEL_VIDEO_SILENT[media];
  if (!video) return base;
  return {
    ...base,
    aspectRatio: video.aspectRatio,
    silentVideoContentSpec: video.contentSpec,
    silentVideoNativePreference: video.nativePreference,
  };
}
