import Anthropic from "@anthropic-ai/sdk";
import type { Message } from "@/types";

export async function* streamAnthropic(
  messages: Message[],
  systemPrompt: string,
  apiKey: string,
  model: string
): AsyncGenerator<string> {
  const client = new Anthropic({ apiKey });

  const stream = client.messages.stream({
    model,
    max_tokens: 1024,
    system: systemPrompt,
    messages: messages.map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    })),
  });

  for await (const event of stream) {
    if (
      event.type === "content_block_delta" &&
      event.delta.type === "text_delta"
    ) {
      yield event.delta.text;
    }
  }
}

export async function generateSuggestedQuestionsAnthropic(
  prompt: string,
  apiKey: string,
  model: string
): Promise<string[]> {
  const client = new Anthropic({ apiKey });
  const response = await client.messages.create({
    model,
    max_tokens: 200,
    messages: [{ role: "user", content: prompt }],
  });
  const text = response.content[0]?.type === "text" ? response.content[0].text : "[]";
  try {
    const parsed = JSON.parse(text);
    return Array.isArray(parsed) ? parsed.slice(0, 3) : [];
  } catch {
    return [];
  }
}
