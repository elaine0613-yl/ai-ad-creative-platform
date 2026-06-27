"use client";

import { SmartCreationFlow } from "@/components/create/SmartCreationFlow";

export default function VideoCreateContent() {
  return (
    <SmartCreationFlow
      materialType="video"
      title="视频创作"
      subtitle=""
      placeholder="描述视频投放诉求，如渠道、媒体、时长与选品要求…"
      examplePrompt="我要给省钱神券中心做一批外投视频，投抖音，突出领券后更划算，整体真实一点，帮我智能选一批适合省钱表达的商品。"
    />
  );
}
