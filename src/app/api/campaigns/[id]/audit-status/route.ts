import { jsonOk, handleApiError, jsonError } from "@/lib/api/response";
import { requireAuth } from "@/lib/auth/session";
import { agentReplyForStage, newMessage } from "@/lib/campaign/parser";
import { loadSkuPool, toSnapshot } from "@/lib/campaign/service";
import { getOceanEngineAdapter } from "@/lib/audit/ocean-engine";
import { prisma } from "@/lib/db/client";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireAuth();
    const { id } = await params;

    const campaign = await prisma.campaign.findFirst({
      where: { id, userId: user.id },
    });
    if (!campaign) return jsonError("Campaign 不存在", 404);

    const material = await prisma.material.findFirst({
      where: { campaignId: id },
      orderBy: { createdAt: "desc" },
    });
    if (!material?.oceanEngineAuditId) {
      return jsonOk({ status: "none" });
    }

    const adapter = getOceanEngineAdapter();
    const result = await adapter.getStatus(material.oceanEngineAuditId);

    if (result.status === "approved") {
      await prisma.material.update({
        where: { id: material.id },
        data: {
          lifecycleStatus: "in_library",
          oceanEngineAuditJson: JSON.stringify(result),
        },
      });
      const messages = JSON.parse(campaign.messagesJson || "[]");
      messages.push(newMessage("agent", agentReplyForStage("completed", {})));
      const updated = await prisma.campaign.update({
        where: { id },
        data: { stage: "completed", messagesJson: JSON.stringify(messages) },
      });
      const skuPool = await loadSkuPool();
      return jsonOk({
        status: "approved",
        campaign: toSnapshot(updated, skuPool),
        material,
      });
    }

    if (result.status === "rejected") {
      await prisma.material.update({
        where: { id: material.id },
        data: {
          lifecycleStatus: "rejected",
          rejectReason: result.rejectReason,
          oceanEngineAuditJson: JSON.stringify(result),
        },
      });
      const messages = JSON.parse(campaign.messagesJson || "[]");
      messages.push(
        newMessage("agent", agentReplyForStage("rejected", {}) + (result.rejectReason ? ` 原因：${result.rejectReason}` : ""))
      );
      const updated = await prisma.campaign.update({
        where: { id },
        data: { stage: "rejected", messagesJson: JSON.stringify(messages) },
      });
      const skuPool = await loadSkuPool();
      return jsonOk({
        status: "rejected",
        reason: result.rejectReason,
        campaign: toSnapshot(updated, skuPool),
      });
    }

    return jsonOk({ status: "pending", audit: result });
  } catch (err) {
    return handleApiError(err);
  }
}
