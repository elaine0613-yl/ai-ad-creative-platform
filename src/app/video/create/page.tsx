"use client";

import {
  VIDEO_CREATE_HEADER_HEIGHT,
  VideoCreatePageHeader,
  type VideoCreateMode,
} from "@/components/create/VideoCreateModeSwitch";
import { VideoReplicatePlaceholder } from "@/components/create/VideoReplicatePlaceholder";
import { SmartCreationFlow } from "@/components/create/SmartCreationFlow";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

function VideoCreateInner() {
  const searchParams = useSearchParams();
  const initialMode = searchParams.get("mode") === "replicate" ? "replicate" : "native";
  const [mode, setMode] = useState<VideoCreateMode>(initialMode);

  useEffect(() => {
    setMode(searchParams.get("mode") === "replicate" ? "replicate" : "native");
  }, [searchParams]);

  return (
    <div className="flex min-h-dvh flex-col bg-[#f4f4f5]">
      <VideoCreatePageHeader mode={mode} onModeChange={setMode} />
      {mode === "native" ? (
        <SmartCreationFlow
          materialType="video"
          mode="video-native"
          suppressHeader
          layoutTopOffset={VIDEO_CREATE_HEADER_HEIGHT}
          title="视频创作"
          subtitle=""
          placeholder="自由描述视频投放需求、时长、风格、目标用户与核心卖点…"
          examplePrompt="我要给省钱神券中心做抖音外投短视频，15秒竖版，面向学生党和上班族，突出领券后更划算，整体真实生活化，帮我智能选 5 个适合省钱表达的商品。"
        />
      ) : (
        <VideoReplicatePlaceholder />
      )}
    </div>
  );
}

export default function VideoCreatePage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-1 items-center justify-center text-gray-400">加载中...</div>
      }
    >
      <VideoCreateInner />
    </Suspense>
  );
}
