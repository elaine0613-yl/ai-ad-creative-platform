import { NextRequest } from "next/server";
import { z } from "zod";
import { jsonOk, handleApiError } from "@/lib/api/response";
import { requireAuth } from "@/lib/auth/session";
import { runComplianceCheck } from "@/lib/compliance/engine";

const schema = z.object({
  texts: z.array(z.object({ content: z.string(), location: z.string().optional() })),
  hasAiLabel: z.boolean().optional(),
  materialId: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    await requireAuth();
    const body = schema.parse(await req.json());
    const report = runComplianceCheck(body);
    return jsonOk(report);
  } catch (err) {
    return handleApiError(err);
  }
}
