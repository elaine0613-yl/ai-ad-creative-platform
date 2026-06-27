import { jsonOk, handleApiError } from "@/lib/api/response";
import { requireAuth } from "@/lib/auth/session";
import { queryLibraryAssets, saveToPrivateLibrary } from "@/lib/material-library/service";
import type { SaveToLibraryPayload } from "@/lib/material-library/types";

export async function GET(req: Request) {
  try {
    await requireAuth();
    const { searchParams } = new URL(req.url);
    const result = queryLibraryAssets({
      category: (searchParams.get("category") as SaveToLibraryPayload["category"]) || undefined,
      subCategory: searchParams.get("subCategory") || undefined,
      scope: (searchParams.get("scope") as "all" | "private" | "public") || "all",
      materialType: (searchParams.get("materialType") as "image" | "video") || undefined,
      search: searchParams.get("search") || undefined,
      page: Number(searchParams.get("page") || 1),
      pageSize: Number(searchParams.get("pageSize") || 20),
    });
    return jsonOk(result);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(req: Request) {
  try {
    await requireAuth();
    const body = (await req.json()) as SaveToLibraryPayload;
    const asset = saveToPrivateLibrary(body);
    return jsonOk({ asset });
  } catch (err) {
    return handleApiError(err);
  }
}
