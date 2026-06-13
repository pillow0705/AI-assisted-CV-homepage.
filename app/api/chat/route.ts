import { NextRequest, NextResponse } from "next/server";
import { getSiteConfig, getHonors, getProjects, getCVSections } from "@/lib/config";
import { streamChat } from "@/lib/ai";
import { buildSystemPrompt, buildInterviewPrompt, truncateMessages } from "@/lib/ai/prompts";
import { getDb } from "@/lib/db";
import { v4 as uuidv4 } from "uuid";
import type { Message } from "@/types";

// In-memory rate limit: sessionId -> { count, resetAt }
const sessionLimits = new Map<string, { count: number; resetAt: number }>();
const MAX_PER_SESSION = 50;

function checkSessionLimit(sessionId: string): boolean {
  const now = Date.now();
  const limit = sessionLimits.get(sessionId);
  if (!limit || now > limit.resetAt) {
    sessionLimits.set(sessionId, { count: 1, resetAt: now + 3600000 });
    return true;
  }
  if (limit.count >= MAX_PER_SESSION) return false;
  limit.count++;
  return true;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages, sessionId, mode } = body as {
      messages: Message[];
      sessionId: string;
      mode?: "chat" | "interview";
    };

    if (!messages?.length || !sessionId) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    if (!checkSessionLimit(sessionId)) {
      return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
    }

    const config = getSiteConfig();
    if (!config.ai_api_key) {
      return NextResponse.json({ error: "AI not configured" }, { status: 503 });
    }

    const honors = getHonors();
    const projects = getProjects();
    const cvSections = getCVSections();

    const promptCtx = { config, honors, projects, cvSections };
    const systemPrompt =
      mode === "interview"
        ? buildInterviewPrompt(promptCtx)
        : buildSystemPrompt(promptCtx);
    const truncated = truncateMessages(messages);

    const encoder = new TextEncoder();
    const conversationId = uuidv4();
    let fullResponse = "";

    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const delta of streamChat(truncated, systemPrompt, config)) {
            fullResponse += delta;
            const line = `data: ${JSON.stringify({ delta })}\n\n`;
            controller.enqueue(encoder.encode(line));
          }
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));

          // Persist conversation asynchronously
          try {
            const db = getDb();
            const allMessages = [
              ...truncated,
              { role: "assistant" as const, content: fullResponse },
            ];
            db.prepare(`
              INSERT OR REPLACE INTO conversations (id, session_id, messages_json, updated_at)
              VALUES (?, ?, ?, datetime('now'))
            `).run(conversationId, sessionId, JSON.stringify(allMessages));
          } catch {
            // non-critical
          }
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : "Unknown error";
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ error: msg })}\n\n`)
          );
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
        "X-Accel-Buffering": "no",
      },
    });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
