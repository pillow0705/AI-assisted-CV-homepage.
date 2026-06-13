import OpenAI from "openai";
import type { Message } from "@/types";

export async function* streamOpenAI(
  messages: Message[],
  systemPrompt: string,
  apiKey: string,
  model: string,
  baseURL?: string
): AsyncGenerator<string> {
  const client = new OpenAI({
    apiKey,
    ...(baseURL ? { baseURL } : {}),
  });

  // Reasoning models (e.g. deepseek-reasoner) reject temperature and emit a
  // separate reasoning_content stream before the final answer.
  const isReasoner = /reason/i.test(model);

  const stream = await client.chat.completions.create({
    model,
    messages: [
      { role: "system", content: systemPrompt },
      ...messages.map((m) => ({ role: m.role as "user" | "assistant", content: m.content })),
    ],
    stream: true,
    max_tokens: isReasoner ? 2048 : 1024,
    ...(isReasoner ? {} : { temperature: 0.7 }),
  });

  for await (const chunk of stream) {
    // Only surface the final answer, not the chain-of-thought reasoning.
    const delta = chunk.choices[0]?.delta?.content;
    if (delta) yield delta;
  }
}

export async function generateSuggestedQuestions(
  prompt: string,
  apiKey: string,
  model: string,
  baseURL?: string
): Promise<string[]> {
  const client = new OpenAI({ apiKey, ...(baseURL ? { baseURL } : {}) });
  const response = await client.chat.completions.create({
    model,
    messages: [{ role: "user", content: prompt }],
    max_tokens: 200,
    temperature: 0.8,
  });
  const text = response.choices[0]?.message?.content || "[]";
  try {
    const parsed = JSON.parse(text);
    return Array.isArray(parsed) ? parsed.slice(0, 3) : [];
  } catch {
    return [];
  }
}
