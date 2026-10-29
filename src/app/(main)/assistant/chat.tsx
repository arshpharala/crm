"use client";

import { useState, useRef, useEffect } from "react";
import { askAssistant, type ChatMessage } from "./actions";
import { Avatar } from "@/components/ui";
import { SparkleIcon } from "@/components/icons";

export function AssistantChat({ userName }: { userName: string }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, pending]);

  async function handleSend() {
    const text = input.trim();
    if (!text || pending) return;

    const nextMessages: ChatMessage[] = [...messages, { role: "user", content: text }];
    setMessages(nextMessages);
    setInput("");
    setError(null);
    setPending(true);

    const result = await askAssistant(nextMessages);
    setPending(false);

    if (result.error) {
      setError(result.error);
      return;
    }
    if (result.reply) {
      setMessages((prev) => [...prev, { role: "assistant", content: result.reply as string }]);
    }
  }

  return (
    <div className="flex h-[calc(100vh-180px)] flex-col rounded-xl border border-slate-200/80 bg-white shadow-sm shadow-slate-200/50">
      <div className="flex-1 overflow-y-auto p-6">
        {messages.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center text-center text-slate-400">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-indigo-50 text-indigo-500">
              <SparkleIcon size={22} />
            </div>
            <p className="text-sm font-medium text-slate-600">Ask about leads, deals, properties or developers</p>
            <p className="mt-1 max-w-sm text-xs text-slate-400">
              e.g. &quot;Which of my leads are hot right now?&quot;, &quot;Find 2BR properties under AED 2M in JVC&quot;,
              or &quot;Draft a WhatsApp follow-up for Pandit Harish Kumar&quot;
            </p>
          </div>
        )}

        <div className="space-y-4">
          {messages.map((m, i) => (
            <div key={i} className={`flex items-start gap-2.5 ${m.role === "user" ? "flex-row-reverse" : ""}`}>
              {m.role === "assistant" ? (
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
                  <SparkleIcon size={14} />
                </div>
              ) : (
                <Avatar name={userName} size="sm" />
              )}
              <div
                className={`max-w-[75%] whitespace-pre-wrap rounded-xl px-3.5 py-2.5 text-sm ${
                  m.role === "user" ? "bg-indigo-600 text-white" : "bg-slate-50 text-slate-800"
                }`}
              >
                {m.content}
              </div>
            </div>
          ))}

          {pending && (
            <div className="flex items-start gap-2.5">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
                <SparkleIcon size={14} />
              </div>
              <div className="rounded-xl bg-slate-50 px-3.5 py-2.5 text-sm text-slate-400">Thinking…</div>
            </div>
          )}
        </div>
        <div ref={bottomRef} />
      </div>

      {error && (
        <div className="border-t border-rose-100 bg-rose-50 px-4 py-2.5 text-sm text-rose-700">{error}</div>
      )}

      <div className="flex items-center gap-2 border-t border-slate-100 p-3">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder="Ask the assistant..."
          className="flex-1 rounded-lg border border-slate-200 px-3.5 py-2 text-sm focus:border-indigo-400 focus:outline-none"
        />
        <button
          onClick={handleSend}
          disabled={pending || !input.trim()}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Send
        </button>
      </div>
    </div>
  );
}
