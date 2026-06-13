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
        className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-sm mt-1 ${
          isUser
            ? "bg-gradient-to-br from-pink-500 to-purple-500"
            : "bg-gradient-to-br from-purple-500 to-blue-500"
        }`}
      >
        {isUser ? "👤" : "✦"}
      </div>

      <div className={`flex flex-col max-w-[80%] ${isUser ? "items-end" : "items-start"}`}>
        <div
          className={`rounded-2xl px-4 py-3 text-sm leading-relaxed relative ${
            isUser
              ? "bg-gradient-to-br from-pink-500/30 to-purple-500/30 border border-pink-500/20 text-white rounded-tr-sm"
              : "bg-white/5 border border-white/8 text-slate-200 rounded-tl-sm"
          }`}
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
