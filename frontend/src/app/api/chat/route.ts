import { NextRequest, NextResponse } from "next/server";

const BASE_URL = process.env.LLAMA_BASE_URL ?? "http://localhost:8000";

type ChatMessage = {
  role: "user" | "assistant" | "system";
  content: string;
};

// Helper: grab the last JSON object from the content string
function extractJsonObject(raw: string): { answer: string; explanation?: string } {
  if (!raw) return { answer: "No content", explanation: "" };

  // Find the last '{' and the last '}' – assume everything between is JSON
  const start = raw.lastIndexOf("{");
  const end = raw.lastIndexOf("}");

  if (start === -1 || end === -1 || end <= start) {
    // Fallback: treat whole thing as answer
    return { answer: raw.trim(), explanation: "" };
  }

  const jsonSlice = raw.slice(start, end + 1);

  try {
    const parsed = JSON.parse(jsonSlice);
    return {
      answer: typeof parsed.answer === "string" ? parsed.answer : jsonSlice,
      explanation:
        typeof parsed.explanation === "string" ? parsed.explanation : "",
    };
  } catch (e) {
    console.error("Failed to parse JSON from model content:", e, jsonSlice);
    return { answer: raw.trim(), explanation: "" };
  }
}

export async function POST(req: NextRequest) {
  try {
    const { messages } = (await req.json()) as {
      messages: ChatMessage[];
    };

    const clientMessages = messages ?? [];

    const res = await fetch(`${BASE_URL}/v1/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-oss-20b",
        messages: [
          {
            role: "system",
            content: [
              "You are a helpful assistant.",
              'Respond in **JSON** with this exact shape: { "answer": string, "explanation": string }.',
              'The "answer" field is your final reply to the user.',
              'The "explanation" field is a SHORT, high-level description of why you gave that answer (1–3 bullet points).',
              "Do not include any <|channel|> markers or other metadata in the JSON itself.",
            ].join(" "),
          },
          ...clientMessages,
        ],
        max_tokens: 512,
        temperature: 0.7,
        stream: false,
      }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error("llama-server error:", res.status, errorText);
      return NextResponse.json(
        { error: "llama-server request failed", details: errorText },
        { status: 500 }
      );
    }

    const data = await res.json();

    // This is the whole string that includes analysis + JSON
    const rawContent: string =
      data?.choices?.[0]?.message?.content ?? "No content returned from model.";

    const { answer, explanation } = extractJsonObject(rawContent);

    return NextResponse.json({ answer, explanation });
  } catch (err: any) {
    console.error("API /api/chat error:", err);
    return NextResponse.json(
      { error: "Internal server error", details: err?.message },
      { status: 500 }
    );
  }
}
