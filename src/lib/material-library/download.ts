import type { ArchiveMaterial } from "./catalog-types";

function triggerDownload(filename: string, content: Blob | string, mime: string) {
  const blob = typeof content === "string" ? new Blob([content], { type: mime }) : content;
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function buildTracePayload(material: ArchiveMaterial) {
  return {
    materialId: material.materialId,
    name: material.name,
    taskId: material.taskId,
    taskName: material.taskName,
    generateMode: material.generateMode,
    channel: material.channel,
    brand: material.brand,
    productName: material.productName,
    creativeTrace: material.creativeTrace,
    knowledgeRefs: material.creativeTrace.knowledgeRefs,
    exportedAt: new Date().toISOString(),
  };
}

/** Demo：导出占位文件 + 可选溯源 JSON */
export function downloadArchiveMaterial(material: ArchiveMaterial, includeTrace = false) {
  const ext = material.fileFormat?.toLowerCase() ?? (material.partition === "video" ? "mp4" : "png");
  const placeholder = `[Demo 成品素材占位]\n素材ID: ${material.materialId}\n名称: ${material.name}\n格式: ${ext.toUpperCase()}\n实际环境从此处下载高清原文件。`;
  triggerDownload(`${material.materialId}.${ext}`, placeholder, "text/plain");

  if (includeTrace) {
    triggerDownload(
      `${material.materialId}-trace.json`,
      JSON.stringify(buildTracePayload(material), null, 2),
      "application/json"
    );
  }
}

export function downloadArchiveMaterialsBatch(materials: ArchiveMaterial[], includeTrace = false) {
  if (materials.length === 0) return;

  const manifest = {
    exportedAt: new Date().toISOString(),
    count: materials.length,
    items: materials.map((m) => ({
      materialId: m.materialId,
      name: m.name,
      format: m.fileFormat,
      ...(includeTrace ? { trace: buildTracePayload(m) } : {}),
    })),
  };

  triggerDownload(
    `materials-batch-${Date.now()}.json`,
    JSON.stringify(manifest, null, 2),
    "application/json"
  );

  materials.forEach((m) => downloadArchiveMaterial(m, false));
}
