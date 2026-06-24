"use client";

import { SmartCreationFlow } from "@/components/create/SmartCreationFlow";

export default function VideoCreateContent() {
  return (
    <SmartCreationFlow
      materialType="video"
      subtitle="一句话描述 · Agent 自动拆解需求、选品、预设 BGM/CTA/分镜"
      title="视频创作"
      placeholder="描述您要生成的广告视频…"
      examplePrompt="618 做 sunscreen 的抖音 15 秒视频，强调轻薄不闷痘，价格 150 左右"
    />
  );
}
