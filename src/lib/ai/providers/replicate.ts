import { v4 as uuidv4 } from "uuid";
import type { AIProvider, ImageGenerateInput, ImageGenerateResult, VideoGenerateInput, VideoGenerateResult } from "../types";
import { saveRemoteFile, saveBase64Image } from "@/lib/storage/files";
import { MockProvider } from "./mock";

async function replicateRun(model: string, input: Record<string, unknown>): Promise<unknown> {
  const token = process.env.REPLICATE_API_TOKEN;
  if (!token) throw new Error("REPLICATE_API_TOKEN not set");

  const createRes = await fetch("https://api.replicate.com/v1/predictions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Prefer: "wait",
    },
    body: JSON.stringify({ version: model, input }),
  });

  if (!createRes.ok) {
    // Try models endpoint format
    const modelRes = await fetch(`https://api.replicate.com/v1/models/${model}/predictions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Prefer: "wait=120",
      },
      body: JSON.stringify({ input }),
    });
    if (!modelRes.ok) {
      const err = await modelRes.text();
      throw new Error(`Replicate error: ${err}`);
    }
    return modelRes.json();
  }
  return createRes.json();
}

function extractOutputUrl(output: unknown): string | null {
  if (typeof output === "string") return output;
  if (Array.isArray(output) && typeof output[0] === "string") return output[0];
  if (output && typeof output === "object" && "output" in output) {
    return extractOutputUrl((output as { output: unknown }).output);
  }
  return null;
}

export class ReplicateProvider implements AIProvider {
  name = "replicate";
  private mock = new MockProvider();
  private videoModel: string;

  constructor() {
    this.videoModel =
      process.env.REPLICATE_VIDEO_MODEL ?? "stability-ai/stable-video-diffusion-img2vid-xt";
  }

  async generateImage(input: ImageGenerateInput): Promise<ImageGenerateResult[]> {
    return this.mock.generateImage(input);
  }

  async generateVideo(input: VideoGenerateInput): Promise<VideoGenerateResult> {
    const imageUrl = input.imageUrls[0];
    if (!imageUrl) throw new Error("至少上传一张图片");

    const absoluteImageUrl = imageUrl.startsWith("http")
      ? imageUrl
      : `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}${imageUrl}`;

    try {
      const prediction = await replicateRun(this.videoModel, {
        input_image: absoluteImageUrl,
        video_length: input.duration <= 15 ? "14_frames_with_svd" : "25_frames_with_svd_xt",
        sizing_strategy: "maintain_aspect_ratio",
        frames_per_second: 6,
        motion_bucket_id: 127,
      });

      const outputUrl = extractOutputUrl(prediction);
      if (!outputUrl) throw new Error("Replicate returned no video URL");

      const saved = await saveRemoteFile(outputUrl, "videos", "mp4");
      const thumb = await saveBase64Image(
        `data:image/svg+xml;base64,${Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400"><rect fill="#1f2937" width="100%" height="100%"/><text x="50%" y="50%" text-anchor="middle" fill="#9ca3af" font-size="16">Video</text></svg>`).toString("base64")}`,
        "videos"
      );

      return {
        id: uuidv4(),
        url: saved.url,
        thumbnailUrl: thumb.url,
        duration: input.duration,
        provider: "replicate",
      };
    } catch (err) {
      console.warn("[Replicate] falling back to mock:", err);
      return this.mock.generateVideo(input);
    }
  }
}
