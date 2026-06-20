export const FORBIDDEN_WORDS = [
  "最好",
  "第一",
  "顶级",
  "极致",
  "100%",
  "绝对",
  "国家级",
  "全网最低",
  "史上最强",
  "永久",
  "根治",
  "特效",
  "药到病除",
  "立即见效",
  "零风险",
  "保本",
  "稳赚",
];

export const WARNING_WORDS = [
  "最",
  "超",
  "领先",
  "独家",
  "爆款",
  "限时",
  "免费",
  "秒杀",
  "保证",
];

export interface ComplianceItem {
  id: string;
  type: "text" | "visual" | "copyright";
  severity: "warning" | "error";
  message: string;
  location?: string;
  matchedText?: string;
}

export interface ComplianceReport {
  status: "passed" | "warning" | "rejected";
  items: ComplianceItem[];
  score: number;
}

export function checkTextCompliance(text: string, location = "文案"): ComplianceItem[] {
  const items: ComplianceItem[] = [];
  const lower = text.toLowerCase();

  for (const word of FORBIDDEN_WORDS) {
    if (text.includes(word) || lower.includes(word.toLowerCase())) {
      items.push({
        id: `err-${word}`,
        type: "text",
        severity: "error",
        message: `含违禁极限词「${word}」，禁止导出`,
        location,
        matchedText: word,
      });
    }
  }

  for (const word of WARNING_WORDS) {
    if (text.includes(word)) {
      const alreadyError = items.some((i) => i.matchedText === word);
      if (!alreadyError) {
        items.push({
          id: `warn-${word}`,
          type: "text",
          severity: "warning",
          message: `含风险用语「${word}」，建议修改`,
          location,
          matchedText: word,
        });
      }
    }
  }

  return items;
}

export function runComplianceCheck(input: {
  texts?: { content: string; location?: string }[];
  hasAiLabel?: boolean;
}): ComplianceReport {
  const items: ComplianceItem[] = [];

  for (const t of input.texts ?? []) {
    items.push(...checkTextCompliance(t.content, t.location ?? "文案"));
  }

  if (!input.hasAiLabel) {
    items.push({
      id: "copyright-ai-label",
      type: "copyright",
      severity: "warning",
      message: "建议添加 AI 生成标识，规避版权风险",
      location: "元数据",
    });
  }

  const hasError = items.some((i) => i.severity === "error");
  const hasWarning = items.some((i) => i.severity === "warning");

  let status: ComplianceReport["status"] = "passed";
  if (hasError) status = "rejected";
  else if (hasWarning) status = "warning";

  const score = Math.max(0, 100 - items.filter((i) => i.severity === "error").length * 30 - items.filter((i) => i.severity === "warning").length * 10);

  return { status, items, score };
}
