"use client";

import { SmartCreationFlow } from "@/components/create/SmartCreationFlow";

export default function ImageCreateContent() {
  return (
    <SmartCreationFlow
      materialType="image"
      title="图片创作"
      subtitle="说明投放平台与创意需求 · Agent 拆解、选品、生成，并按平台自动审核入库"
      placeholder="描述要投放到哪个平台、做什么广告图…"
      examplePrompt="投放到淘宝：618 主图，防晒产品，强调轻薄卖点，促销红色调"
    />
  );
}
