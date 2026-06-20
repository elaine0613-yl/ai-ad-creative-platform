import * as XLSX from "xlsx";
import { z } from "zod";

const batchRowSchema = z.object({
  productName: z.string().min(1, "产品名称不能为空"),
  industry: z.string().optional(),
  scene: z.string().optional(),
  mainTitle: z.string().optional(),
  subTitle: z.string().optional(),
  sellingPoints: z.string().optional(),
  promotion: z.string().optional(),
  style: z.string().optional(),
  width: z.coerce.number().int().positive().optional().default(800),
  height: z.coerce.number().int().positive().optional().default(800),
});

export type BatchRow = z.infer<typeof batchRowSchema>;

export interface BatchParseResult {
  total: number;
  valid: number;
  items: BatchRow[];
  errors: { row: number; field: string; message: string }[];
}

const COLUMN_MAP: Record<string, keyof BatchRow | "_size"> = {
  产品名称: "productName",
  行业: "industry",
  场景: "scene",
  主标题: "mainTitle",
  副标题: "subTitle",
  卖点: "sellingPoints",
  卖点文案: "sellingPoints",
  促销信息: "promotion",
  风格: "style",
  宽度: "width",
  高度: "height",
  尺寸: "_size",
};

function parseSize(value: unknown): { width?: number; height?: number } {
  if (typeof value !== "string") return {};
  const match = value.match(/(\d+)\s*[x×*]\s*(\d+)/i);
  if (match) return { width: Number(match[1]), height: Number(match[2]) };
  return {};
}

export function parseBatchExcel(buffer: ArrayBuffer): BatchParseResult {
  const workbook = XLSX.read(buffer, { type: "array" });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: "" });

  const items: BatchRow[] = [];
  const errors: BatchParseResult["errors"] = [];

  rows.forEach((row, index) => {
    const mapped: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(row)) {
      const field = COLUMN_MAP[key.trim()];
      if (field === "_size") {
        Object.assign(mapped, parseSize(value));
      } else if (field) {
        mapped[field] = value;
      }
    }

    const result = batchRowSchema.safeParse(mapped);
    if (result.success) {
      items.push(result.data);
    } else {
      for (const issue of result.error.issues) {
        errors.push({
          row: index + 2,
          field: issue.path.join(".") || "未知字段",
          message: issue.message,
        });
      }
    }
  });

  return {
    total: rows.length,
    valid: items.length,
    items,
    errors,
  };
}

export function generateBatchTemplateBuffer(): ArrayBuffer {
  const ws = XLSX.utils.aoa_to_sheet([
    ["产品名称", "行业", "场景", "主标题", "副标题", "卖点文案", "促销信息", "风格", "尺寸"],
    ["夏季防晒霜", "美妆护肤", "主图", "轻薄防晒", "48h防护", "不闷痘|成膜快", "618买2送1", "清新", "800x800"],
  ]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "批量参数");
  return XLSX.write(wb, { type: "array", bookType: "xlsx" }) as ArrayBuffer;
}
