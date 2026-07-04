"use client";

import {
  IMAGE_CREATE_HEADER_HEIGHT,
  ImageCreatePageHeader,
  type ImageCreateMode,
} from "@/components/create/ImageCreateModeSwitch";
import { ImageReplicatePlaceholder } from "@/components/create/ImageReplicatePlaceholder";
import { SmartCreationFlow } from "@/components/create/SmartCreationFlow";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

function ImageCreateInner() {
  const searchParams = useSearchParams();
  const initialMode = searchParams.get("mode") === "replicate" ? "replicate" : "native";
  const [mode, setMode] = useState<ImageCreateMode>(initialMode);

  useEffect(() => {
    setMode(searchParams.get("mode") === "replicate" ? "replicate" : "native");
  }, [searchParams]);

  return (
    <div className="flex min-h-dvh flex-col bg-[#f4f4f5]">
      <ImageCreatePageHeader mode={mode} onModeChange={setMode} />
      {mode === "native" ? (
        <SmartCreationFlow
          materialType="image"
          mode="image-native"
          suppressHeader
          layoutTopOffset={IMAGE_CREATE_HEADER_HEIGHT}
          title="图片创作"
          subtitle=""
          placeholder="自由描述投放需求、风格、目标用户与核心卖点，无需固定格式…"
          examplePrompt="我要给省钱神券中心做抖音信息流外投图，面向学生党和上班族，突出领券后更划算、捡漏氛围，整体真实生活化一点，帮我智能选 5 个适合省钱表达的商品。"
        />
      ) : (
        <ImageReplicatePlaceholder />
      )}
    </div>
  );
}

export default function ImageCreatePage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-1 items-center justify-center text-gray-400">加载中...</div>
      }
    >
      <ImageCreateInner />
    </Suspense>
  );
}
