import type { Message, SiteConfig } from "@/types";
import { streamOpenAI, generateSuggestedQuestions as genOpenAI } from "./openai";
import { streamAnthropic, generateSuggestedQuestionsAnthropic } from "./anthropic";

const DEEPSEEK_BASE_URL = "https://api.deepseek.com/v1";

export async function* streamChat(
  messages: Message[],
  systemPrompt: string,
  config: Partial<SiteConfig>
): AsyncGenerator<string> {
  const provider = config.ai_provider || "openai";
  const apiKey = config.ai_api_key || "";
  const model = config.ai_model || "gpt-4o";

  switch (provider) {
    case "anthropic":
      yield* streamAnthropic(messages, systemPrompt, apiKey, model);
      break;
    case "deepseek":
      yield* streamOpenAI(messages, systemPrompt, apiKey, model, DEEPSEEK_BASE_URL);
      break;
    case "openai":
    default:
      yield* streamOpenAI(messages, systemPrompt, apiKey, model);
      break;
  }
}

export async function generateSuggestedQuestions(
  prompt: string,
  config: Partial<SiteConfig>
): Promise<string[]> {
  const provider = config.ai_provider || "openai";
  const apiKey = config.ai_api_key || "";
  const model = config.ai_model || "gpt-4o";

  try {
    switch (provider) {
      case "anthropic":
        return await generateSuggestedQuestionsAnthropic(prompt, apiKey, model);
      case "deepseek":
        return await genOpenAI(prompt, apiKey, model, DEEPSEEK_BASE_URL);
      case "openai":
      default:
        return await genOpenAI(prompt, apiKey, model);
    }
  } catch {
    return ["What is your research focus?", "What projects are you most proud of?", "How can I collaborate with you?"];
  }
}
