import { NextRequest } from "next/server";
import { jsonOk, handleApiError } from "@/lib/api/response";
import { requireAuth } from "@/lib/auth/session";
import { prisma } from "@/lib/db/client";

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth();
    const type = req.nextUrl.searchParams.get("type");
    const materials = await prisma.material.findMany({
      where: { userId: user.id, ...(type ? { type } : {}) },
      orderBy: { createdAt: "desc" },
      take: 100,
    });
    return jsonOk({
      materials: materials.map((m) => ({
        ...m,
        tags: JSON.parse(m.tags || "[]"),
        metadata: JSON.parse(m.metadata || "{}"),
      })),
    });
  } catch (err) {
    return handleApiError(err);
  }
}
