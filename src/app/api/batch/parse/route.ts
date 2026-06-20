import { NextRequest } from "next/server";
import { jsonOk, handleApiError } from "@/lib/api/response";
import { requireAuth } from "@/lib/auth/session";
import { parseBatchExcel, generateBatchTemplateBuffer } from "@/lib/batch/excel";

export async function POST(req: NextRequest) {
  try {
    await requireAuth();
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file) throw new Error("请上传 Excel 文件");

    const buffer = await file.arrayBuffer();
    const result = parseBatchExcel(buffer);
    return jsonOk(result);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function GET() {
  try {
    await requireAuth();
    const buffer = generateBatchTemplateBuffer();
    return new Response(buffer, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": 'attachment; filename="batch-template.xlsx"',
      },
    });
  } catch (err) {
    return handleApiError(err);
  }
}
