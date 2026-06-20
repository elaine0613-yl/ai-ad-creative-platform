import type { AIProvider } from "./types";
import { MockProvider } from "./providers/mock";
import { OpenAIProvider } from "./providers/openai";
import { ReplicateProvider } from "./providers/replicate";

let imageProvider: AIProvider | null = null;
let videoProvider: AIProvider | null = null;

export function getImageProvider(): AIProvider {
  if (!imageProvider) {
    if (process.env.OPENAI_API_KEY) {
      imageProvider = new OpenAIProvider(process.env.OPENAI_API_KEY);
    } else {
      imageProvider = new MockProvider();
    }
  }
  return imageProvider;
}

export function getVideoProvider(): AIProvider {
  if (!videoProvider) {
    if (process.env.REPLICATE_API_TOKEN) {
      videoProvider = new ReplicateProvider();
    } else if (process.env.OPENAI_API_KEY) {
      videoProvider = new OpenAIProvider(process.env.OPENAI_API_KEY);
    } else {
      videoProvider = new MockProvider();
    }
  }
  return videoProvider;
}

export function getActiveProviders() {
  return {
    image: getImageProvider().name,
    video: getVideoProvider().name,
    openaiConfigured: !!process.env.OPENAI_API_KEY,
    replicateConfigured: !!process.env.REPLICATE_API_TOKEN,
  };
}
