"use client";

import { SmartCreationFlow } from "@/components/create/SmartCreationFlow";

export default function ImageCreateContent() {
  return (
    <SmartCreationFlow
      materialType="image"
      title="图片创作"
      subtitle="一句话描述 · Agent 自动拆解需求、选品、预设创意"
      placeholder="描述您要生成的广告图…"
      examplePrompt="618 淘宝主图，防晒产品，强调轻薄卖点，促销红色调"
    />
  );
}
