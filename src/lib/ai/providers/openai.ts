import OpenAI from "openai";
import { v4 as uuidv4 } from "uuid";
import type { AIProvider, ImageGenerateInput, ImageGenerateResult, VideoGenerateInput, VideoGenerateResult } from "../types";
import { mapSizeToOpenAI } from "../types";
import { saveRemoteFile } from "@/lib/storage/files";
import { MockProvider } from "./mock";

export class OpenAIProvider implements AIProvider {
  name = "openai";
  private client: OpenAI;
  private mock = new MockProvider();

  constructor(apiKey: string) {
    this.client = new OpenAI({ apiKey });
  }

  async generateImage(input: ImageGenerateInput): Promise<ImageGenerateResult[]> {
    const count = Math.min(input.count ?? 1, 4);
    const size = mapSizeToOpenAI(input.width, input.height);
    const model = process.env.OPENAI_IMAGE_MODEL ?? "dall-e-3";
    const results: ImageGenerateResult[] = [];

    for (let i = 0; i < count; i++) {
      const response = await this.client.images.generate({
        model,
        prompt: input.prompt,
        n: 1,
        size,
        quality: "standard",
        response_format: "url",
      });
      const item = response.data?.[0];
      if (!item?.url) throw new Error("OpenAI returned empty image");
      const saved = await saveRemoteFile(item.url, "images", "png");
      results.push({
        id: uuidv4(),
        url: saved.url,
        width: input.width,
        height: input.height,
        provider: "openai",
        revisedPrompt: item.revised_prompt,
      });
    }
    return results;
  }

  async generateVideo(input: VideoGenerateInput): Promise<VideoGenerateResult> {
    // OpenAI doesn't provide image-to-video; delegate to mock or Replicate chain
    return this.mock.generateVideo(input);
  }
}
