"use client";

import { FormEvent, useState } from "react";

type Message = {
  role: "user" | "assistant";
  content: string;
  explanation?: string; // only for assistant
};

export default function HomePage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!input.trim()) return;

    const newMessages: Message[] = [
      ...messages,
      { role: "user", content: input.trim() },
    ];

    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      });

      if (!res.ok) {
        console.error("API error", res.status);
        setMessages([
          ...newMessages,
          {
            role: "assistant",
            content:
              "Error: failed to reach the local model server on localhost:8000.",
          },
        ]);
        return;
      }

      const data: { answer: string; explanation?: string } = await res.json();

      setMessages([
        ...newMessages,
        {
          role: "assistant",
          content: data.answer,
          explanation: data.explanation,
        },
      ]);
    } catch (err) {
      console.error(err);
      setMessages([
        ...newMessages,
        {
          role: "assistant",
          content: "Unexpected error while calling the API.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-black text-white">
      <div className="w-full max-w-2xl border border-gray-700 rounded-xl p-4 flex flex-col gap-4 bg-zinc-900/60">
        <h1 className="text-xl font-semibold text-center">
          GPT-OSS 20B Local-Daily Chat Interface
        </h1>

        <div className="flex-1 max-h-[400px] overflow-y-auto space-y-3 border border-gray-800 rounded-lg p-3 bg-black/40">
          {messages.length === 0 && (
            <p className="text-sm text-gray-400">
              Ask anything to your local GPT-OSS 20B instance running on your
              Mac.
            </p>
          )}
          {messages.map((m, i) => (
            <div key={i} className="space-y-1">
              <div
                className={`p-2 rounded-md text-sm whitespace-pre-wrap ${
                  m.role === "user"
                    ? "bg-emerald-600/30 border border-emerald-500/40 self-end"
                    : "bg-zinc-800/70 border border-zinc-700"
                }`}
              >
                <strong className="block mb-1 text-xs uppercase text-gray-400">
                  {m.role === "user" ? "You" : "Model"}
                </strong>
                {m.role === "assistant" ? (
                  <div className="space-y-2">
                    <div>
                      <div className="text-[10px] font-semibold uppercase tracking-wide text-emerald-400 mb-1">
                        Answer
                      </div>
                      <div>{m.content}</div>
                    </div>
                    {m.explanation && m.explanation.trim() !== "" && (
                      <details className="mt-2 border-t border-zinc-700 pt-2 text-xs text-gray-300 group">
                        <summary className="cursor-pointer list-none flex items-center justify-between">
                          <span className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">
                            Why this answer (short)
                          </span>
                          <span className="text-[10px] text-gray-500 group-open:rotate-90 transition-transform">
                            ▶
                          </span>
                        </summary>
                        <div className="mt-1 whitespace-pre-wrap text-gray-300">
                          {m.explanation}
                        </div>
                      </details>
                    )}
                  </div>
                ) : (
                  m.content
                )}
              </div>
            </div>
          ))}
          {loading && (
            <div className="text-xs text-gray-400 animate-pulse">
              Model is thinking…
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            className="flex-1 rounded-lg px-3 py-2 bg-black/70 border border-gray-700 text-sm outline-none focus:border-emerald-500"
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="px-4 py-2 rounded-lg bg-emerald-600 text-sm font-semibold disabled:opacity-50"
          >
            {loading ? "Sending..." : "Send"}
          </button>
        </form>
      </div>
    </main>
  );
}
