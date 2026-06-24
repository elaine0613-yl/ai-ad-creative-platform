import { jsonOk, handleApiError } from "@/lib/api/response";
import { requireAuth } from "@/lib/auth/session";
import { loadSkuPool } from "@/lib/campaign/service";
import { INTERNAL_SKUS, skuRecordFromDb } from "@/lib/mock/skus";
import { prisma } from "@/lib/db/client";

export async function GET() {
  try {
    await requireAuth();
    const pool = await loadSkuPool();
    return jsonOk({ skus: pool });
  } catch (err) {
    return handleApiError(err);
  }
}

/** 同步 mock SKU 到数据库（首次部署可调用） */
export async function POST() {
  try {
    await requireAuth();
    for (const sku of INTERNAL_SKUS) {
      await prisma.sku.upsert({
        where: { skuCode: sku.skuCode },
        create: {
          skuCode: sku.skuCode,
          name: sku.name,
          category: sku.category,
          tags: JSON.stringify(sku.tags),
          price: sku.price,
          imageUrl: sku.imageUrl,
          promoPool: sku.promoPool,
          stock: sku.stock,
          status: "active",
        },
        update: {
          name: sku.name,
          stock: sku.stock,
          tags: JSON.stringify(sku.tags),
        },
      });
    }
    const rows = await prisma.sku.findMany();
    return jsonOk({ count: rows.length, skus: rows.map(skuRecordFromDb) });
  } catch (err) {
    return handleApiError(err);
  }
}
