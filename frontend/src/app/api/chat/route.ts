import { NextRequest, NextResponse } from "next/server";

const BASE_URL = process.env.LLAMA_BASE_URL ?? "http://localhost:8000";

export async function POST(req: NextRequest) {
  try {
    const { messages } = (await req.json()) as {
      messages: { role: "user" | "assistant" | "system"; content: string }[];
    };

    const res = await fetch(`${BASE_URL}/v1/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-oss-20b",
        messages,
        max_tokens: 512,
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

    const content =
      data.choices?.[0]?.message?.content ??
      "No content returned from model.";

    return NextResponse.json({ content });
  } catch (err: any) {
    console.error("API /api/chat error:", err);
    return NextResponse.json(
      { error: "Internal server error", details: err?.message },
      { status: 500 }
    );
  }
}
