"use client";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Message } from "@/types";

interface ChatMessageProps {
  message: Message;
  isStreaming?: boolean;
}

export default function ChatMessage({ message, isStreaming }: ChatMessageProps) {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === "user";

  const copy = async () => {
    await navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className={`flex gap-2.5 mb-4 ${isUser ? "flex-row-reverse" : "flex-row"} group`}>
      {/* Avatar */}
      <div
        className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-sm mt-1"
        style={{
          background: isUser
            ? "linear-gradient(135deg, #C7B27A, #A8924F)"
            : "linear-gradient(135deg, #8FBE74, #6E9F57)",
          color: "#fff",
        }}
      >
        {isUser ? "👤" : "✦"}
      </div>

      <div className={`flex flex-col max-w-[80%] ${isUser ? "items-end" : "items-start"}`}>
        <div
          className={`rounded-2xl px-4 py-3 text-sm leading-relaxed relative ${isUser ? "rounded-tr-sm" : "rounded-tl-sm"}`}
          style={
            isUser
              ? { background: "var(--matcha-soft)", border: "1px solid var(--border)", color: "var(--ink)" }
              : { background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--ink-soft)" }
          }
        >
          {isUser ? (
            <p className="whitespace-pre-wrap">{message.content}</p>
          ) : (
            <div className="chat-message-content">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {message.content + (isStreaming ? "▋" : "")}
              </ReactMarkdown>
            </div>
          )}
        </div>

        {/* Copy button */}
        {!isStreaming && message.content && (
          <button
            onClick={copy}
            className="mt-1 opacity-0 group-hover:opacity-100 transition-opacity text-xs text-slate-600 hover:text-slate-400 flex items-center gap-1"
          >
            {copied ? "✓ Copied" : "Copy"}
          </button>
        )}
      </div>
    </div>
  );
}
