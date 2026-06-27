import { Suspense } from "react";
import ImageCreateContent from "./ImageCreateContent";

export default function ImageCreatePage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-1 items-center justify-center text-gray-400">加载中...</div>
      }
    >
      <ImageCreateContent />
    </Suspense>
  );
}
