import { Suspense } from "react";
import VideoCreateContent from "./VideoCreateContent";

export default function VideoCreatePage() {
  return (
    <Suspense fallback={<div className="flex flex-1 items-center justify-center text-gray-400">加载中...</div>}>
      <VideoCreateContent />
    </Suspense>
  );
}
