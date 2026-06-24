import { Suspense } from "react";
import AgentContent from "./AgentContent";

export default function AgentPage() {
  return (
    <Suspense fallback={<div className="flex flex-1 items-center justify-center text-gray-400">加载中...</div>}>
      <AgentContent />
    </Suspense>
  );
}
