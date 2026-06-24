import type { ProductRecommendation, SelectionRules, SkuRecord } from "@/lib/campaign/types";

export function scoreSku(sku: SkuRecord, rules: SelectionRules, keywords: string): ProductRecommendation {
  let score = 0;
  const reasons: string[] = [];

  if (rules.categories.some((c) => sku.category.includes(c) || c.includes(sku.category))) {
    score += 30;
    reasons.push(`类目匹配「${sku.category}」`);
  }

  if (rules.tagsAny?.length) {
    const matched = rules.tagsAny.filter((t) =>
      sku.tags.some((tag) => tag.includes(t) || t.includes(tag))
    );
    if (matched.length) {
      score += matched.length * 15;
      reasons.push(`标签命中：${matched.join("、")}`);
    }
  }

  if (keywords) {
    const kw = keywords.toLowerCase();
    if (sku.name.toLowerCase().includes(kw) || kw.split(/\s+/).some((k) => sku.name.includes(k))) {
      score += 20;
      reasons.push("商品名与诉求关键词相关");
    }
  }

  if (rules.priceMin != null && sku.price >= rules.priceMin) score += 10;
  if (rules.priceMax != null && sku.price <= rules.priceMax) score += 10;
  if (rules.priceMin != null && rules.priceMax != null && sku.price >= rules.priceMin && sku.price <= rules.priceMax) {
    reasons.push(`价格 ¥${sku.price} 落在目标区间`);
  }

  if (rules.promoPool && sku.promoPool === rules.promoPool) {
    score += 25;
    reasons.push(`在「${rules.promoPool}」活动商品池`);
  }

  if (sku.stock > 0) score += 5;

  return {
    sku,
    score,
    reason: reasons.length ? reasons.join("；") : "综合匹配推荐",
  };
}

export function recommendProducts(
  skus: SkuRecord[],
  rules: SelectionRules,
  keywords: string,
  limit = 4
): ProductRecommendation[] {
  return skus
    .filter((s) => s.stock > 0 && s.status !== "inactive")
    .map((sku) => scoreSku(sku, rules, keywords))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}
