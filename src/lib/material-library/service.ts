import {
  ALL_LIBRARY_ASSETS,
  PRIVATE_LIBRARY_ASSETS,
  PUBLIC_LIBRARY_ASSETS,
} from "./mock-data";
import type {
  LibraryAsset,
  LibraryQuery,
  LibraryQueryResult,
  SaveToLibraryPayload,
} from "./types";

/** 读取优先级：个人私有 > 公共预置 */
export function queryLibraryAssets(query: LibraryQuery = {}): LibraryQueryResult {
  const page = query.page ?? 1;
  const pageSize = query.pageSize ?? 20;

  let pool: LibraryAsset[] = [];

  if (query.scope === "private") {
    pool = [...PRIVATE_LIBRARY_ASSETS];
  } else if (query.scope === "public") {
    pool = [...PUBLIC_LIBRARY_ASSETS];
  } else {
    pool = [...PRIVATE_LIBRARY_ASSETS, ...PUBLIC_LIBRARY_ASSETS];
  }

  if (query.category) {
    pool = pool.filter((a) => a.category === query.category);
  }
  if (query.subCategory) {
    pool = pool.filter((a) => a.subCategory === query.subCategory);
  }
  if (query.materialType) {
    pool = pool.filter((a) => !a.materialType || a.materialType === query.materialType);
  }
  if (query.sourceChain && query.sourceChain !== "both") {
    pool = pool.filter((a) => a.sourceChain === query.sourceChain || a.sourceChain === "both");
  }
  if (query.search?.trim()) {
    const q = query.search.trim().toLowerCase();
    pool = pool.filter(
      (a) =>
        a.name.toLowerCase().includes(q) ||
        a.tags.some((t) => t.toLowerCase().includes(q))
    );
  }

  const total = pool.length;
  const start = (page - 1) * pageSize;
  const items = pool.slice(start, start + pageSize);

  return { items, total, page, pageSize };
}

export function getLibraryAssetById(id: string): LibraryAsset | undefined {
  return ALL_LIBRARY_ASSETS.find((a) => a.id === id);
}

/** 模拟写入个人素材库（演示环境内存追加） */
const runtimePrivateAssets: LibraryAsset[] = [];

export function saveToPrivateLibrary(payload: SaveToLibraryPayload): LibraryAsset {
  const asset: LibraryAsset = {
    id: `pri-${Date.now()}`,
    name: payload.name,
    scope: "private",
    category: payload.category,
    subCategory: payload.subCategory,
    materialType: payload.materialType,
    url: payload.url,
    thumbnailUrl: payload.url,
    tags: payload.tags ?? [],
    configJson: payload.configJson,
    sourceChain: payload.sourceChain,
    createdAt: new Date().toISOString(),
  };
  runtimePrivateAssets.unshift(asset);
  PRIVATE_LIBRARY_ASSETS.unshift(asset);
  return asset;
}

export function getPrivateAssetCount(): number {
  return PRIVATE_LIBRARY_ASSETS.length + runtimePrivateAssets.length;
}
