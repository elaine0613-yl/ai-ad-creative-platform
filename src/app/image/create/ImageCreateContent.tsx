"use client";

import { SmartCreationFlow } from "@/components/create/SmartCreationFlow";

export default function ImageCreateContent() {
  return (
    <SmartCreationFlow
      materialType="image"
      title="图片创作"
      subtitle=""
      placeholder="描述图片投放诉求，如渠道、媒体、风格与选品要求…"
      examplePrompt="我要给省钱神券中心做一批外投图片，投抖音，突出领券后更划算，整体真实一点，帮我智能选一批适合省钱和捡漏表达的商品。"
    />
  );
}
