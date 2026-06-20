export interface ImageGenerateInput {
  prompt: string;
  width: number;
  height: number;
  count?: number;
  style?: string;
}

export interface ImageGenerateResult {
  id: string;
  url: string;
  width: number;
  height: number;
  provider: string;
  revisedPrompt?: string;
}

export interface VideoGenerateInput {
  prompt?: string;
  imageUrls: string[];
  duration: number;
  aspectRatio: string;
  productName?: string;
  sellingPoints?: string;
  otherRequirements?: string;
}

export interface VideoGenerateResult {
  id: string;
  url: string;
  thumbnailUrl?: string;
  duration: number;
  provider: string;
}

export interface AIProvider {
  name: string;
  generateImage(input: ImageGenerateInput): Promise<ImageGenerateResult[]>;
  generateVideo(input: VideoGenerateInput): Promise<VideoGenerateResult>;
}

export function buildImagePrompt(input: {
  prompt?: string;
  productName?: string;
  mainTitle?: string;
  subTitle?: string;
  sellingPoints?: string;
  otherRequirements?: string;
  promotion?: string;
  industry?: string;
  scene?: string;
  style?: string;
}) {
  const parts = [
    input.prompt,
    input.productName && `Product: ${input.productName}`,
    input.mainTitle && `Headline: ${input.mainTitle}`,
    input.subTitle && `Subheadline: ${input.subTitle}`,
    input.sellingPoints && `Selling points: ${input.sellingPoints}`,
    input.otherRequirements && `Additional requirements: ${input.otherRequirements}`,
    input.promotion && `Promotion: ${input.promotion}`,
    input.industry && `Industry: ${input.industry}`,
    input.scene && `Scene: ${input.scene}`,
    input.style && `Visual style: ${input.style}`,
    "Professional advertising creative, high quality commercial photography, clean composition, suitable for e-commerce and social media ads.",
  ].filter(Boolean);
  return parts.join(". ");
}

export function mapSizeToOpenAI(width: number, height: number): "1024x1024" | "1792x1024" | "1024x1792" {
  const ratio = width / height;
  if (ratio > 1.2) return "1792x1024";
  if (ratio < 0.8) return "1024x1792";
  return "1024x1024";
}
