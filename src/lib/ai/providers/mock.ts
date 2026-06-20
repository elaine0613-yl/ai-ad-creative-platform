import { v4 as uuidv4 } from "uuid";
import type { AIProvider, ImageGenerateInput, ImageGenerateResult, VideoGenerateInput, VideoGenerateResult } from "../types";
import { saveBase64Image } from "@/lib/storage/files";

function svgPlaceholder(width: number, height: number, label: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
    <defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#6366f1"/><stop offset="100%" style="stop-color:#a855f7"/>
    </linearGradient></defs>
    <rect width="100%" height="100%" fill="url(#g)"/>
    <text x="50%" y="45%" text-anchor="middle" fill="white" font-size="24" font-family="sans-serif">${label}</text>
    <text x="50%" y="55%" text-anchor="middle" fill="rgba(255,255,255,0.8)" font-size="14" font-family="sans-serif">${width}×${height}</text>
  </svg>`;
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
}

export class MockProvider implements AIProvider {
  name = "mock";

  async generateImage(input: ImageGenerateInput): Promise<ImageGenerateResult[]> {
    const count = Math.min(input.count ?? 1, 4);
    await new Promise((r) => setTimeout(r, 800));
    const results: ImageGenerateResult[] = [];
    for (let i = 0; i < count; i++) {
      const dataUrl = svgPlaceholder(input.width, input.height, `AI Mock #${i + 1}`);
      const saved = await saveBase64Image(dataUrl);
      results.push({
        id: uuidv4(),
        url: saved.url,
        width: input.width,
        height: input.height,
        provider: "mock",
        revisedPrompt: input.prompt.slice(0, 120),
      });
    }
    return results;
  }

  async generateVideo(input: VideoGenerateInput): Promise<VideoGenerateResult> {
    await new Promise((r) => setTimeout(r, 1500));
    const thumb = svgPlaceholder(1080, 1920, "Video Mock");
    const saved = await saveBase64Image(thumb, "videos");
    return {
      id: uuidv4(),
      url: saved.url,
      thumbnailUrl: saved.url,
      duration: input.duration,
      provider: "mock",
    };
  }
}
