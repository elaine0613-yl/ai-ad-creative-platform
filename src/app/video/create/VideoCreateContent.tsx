"use client";

import { SmartCreationFlow } from "@/components/create/SmartCreationFlow";

export default function VideoCreateContent() {
  return (
    <SmartCreationFlow
      materialType="video"
      subtitle="说明投放平台与创意需求 · Agent 拆解、选品、生成，并按平台自动审核入库"
      title="视频创作"
      placeholder="描述要投放到哪个平台、做什么广告视频…"
      examplePrompt="投放到抖音：618 防晒 15 秒视频，强调轻薄不闷痘，价格 150 左右"
    />
  );
}
