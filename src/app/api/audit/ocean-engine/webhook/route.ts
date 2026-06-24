import { jsonOk, handleApiError } from "@/lib/api/response";
import { getOceanEngineAdapter } from "@/lib/audit/ocean-engine";
import { prisma } from "@/lib/db/client";

/** 巨量引擎审核 Webhook（待对接真实签名验证） */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const externalAuditId = String(body.audit_id ?? body.externalAuditId ?? "");
    const statusRaw = String(body.status ?? "").toUpperCase();

    if (!externalAuditId) {
      return jsonOk({ received: false, reason: "missing audit_id" });
    }

    const material = await prisma.material.findFirst({
      where: { oceanEngineAuditId: externalAuditId },
    });
    if (!material) {
      return jsonOk({ received: true, matched: false });
    }

    const approved = statusRaw === "APPROVE" || statusRaw === "APPROVED";
    const rejected = statusRaw === "REJECT" || statusRaw === "REJECTED";

    await prisma.material.update({
      where: { id: material.id },
      data: {
        lifecycleStatus: approved ? "in_library" : rejected ? "rejected" : "pending_external_review",
        rejectReason: body.reject_reason ?? body.rejectReason,
        oceanEngineAuditJson: JSON.stringify(body),
      },
    });

    if (material.campaignId) {
      await prisma.campaign.update({
        where: { id: material.campaignId },
        data: { stage: approved ? "completed" : rejected ? "rejected" : "external_review" },
      });
    }

    return jsonOk({ received: true, matched: true, materialId: material.id });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function GET() {
  return jsonOk({
    provider: "ocean_engine",
    mode: process.env.OCEAN_ENGINE_USE_HTTP === "true" ? "http" : "mock",
    webhook: "/api/audit/ocean-engine/webhook",
  });
}
