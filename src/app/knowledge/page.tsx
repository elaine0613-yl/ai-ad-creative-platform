import { KnowledgeLibraryPage } from "@/components/knowledge/KnowledgeLibraryPage";
import { Suspense } from "react";

export default function KnowledgePage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-1 items-center justify-center text-gray-400">加载中...</div>
      }
    >
      <KnowledgeLibraryPage />
    </Suspense>
  );
}
