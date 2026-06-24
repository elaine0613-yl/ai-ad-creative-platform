import { jsonOk, handleApiError } from "@/lib/api/response";
import { requireAuth } from "@/lib/auth/session";
import { loadSkuPool, toSnapshot } from "@/lib/campaign/service";
import { prisma } from "@/lib/db/client";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireAuth();
    const { id } = await params;
    const campaign = await prisma.campaign.findFirst({
      where: { id, userId: user.id },
    });
    if (!campaign) return jsonOk({ campaign: null });
    const skuPool = await loadSkuPool();
    const snapshot = toSnapshot(campaign, skuPool);

    let material = null;
    if (snapshot.stage === "external_review" || snapshot.stage === "completed") {
      material = await prisma.material.findFirst({
        where: { campaignId: id },
        orderBy: { createdAt: "desc" },
      });
      if (material) {
        snapshot.materialId = material.id;
        snapshot.auditStatus = material.lifecycleStatus;
        snapshot.rejectReason = material.rejectReason ?? undefined;
      }
    }

    return jsonOk({ campaign: snapshot, material });
  } catch (err) {
    return handleApiError(err);
  }
}
