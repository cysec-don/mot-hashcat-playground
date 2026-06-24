// Playground Learning Assistant - AI tutor endpoint
import { NextRequest, NextResponse } from "next/server";
import ZAI from "z-ai-web-dev-sdk";
import { getStudentFromRequest, validateCSRF } from "../auth/route";
import { rateLimit, rateLimitResponse, sanitizeString } from "@/lib/security";

export async function POST(req: NextRequest) {
  const student = await getStudentFromRequest(req);
  if (!student) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!validateCSRF(req)) {
    return NextResponse.json({ error: "Invalid CSRF token" }, { status: 403 });
  }

  // Rate limit: 30 tutor questions per hour per IP
  const rl = rateLimit(req, { windowMs: 3_600_000, maxRequests: 30 });
  if (!rl.allowed) {
    return rateLimitResponse(rl.retryAfter);
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { question, context } = body as { question?: unknown; context?: unknown };

  if (typeof question !== "string" || question.trim().length === 0) {
    return NextResponse.json({ error: "Question required" }, { status: 400 });
  }
  if (question.length > 1000) {
    return NextResponse.json({ error: "Question too long" }, { status: 400 });
  }

  const sanitizedQuestion = sanitizeString(question, 1000);

  const ctx = (context && typeof context === "object" ? context : {}) as Record<string, unknown>;
  const contextStr = `Current attack context:
- Hash type: ${String(ctx.hashType || "MD5")}
- Attack mode: ${String(ctx.attackMode || "Straight")}
- Wordlist: ${String(ctx.wordlist || "rockyou.txt")}
- Rules: ${String(ctx.rules || "none")}
- Mask: ${String(ctx.mask || "n/a")}
- Recovered password: ${String(ctx.recovered || "pending")}
- Command: ${String(ctx.command || "n/a")}`;

  const systemPrompt = `You are the MOT Hashcat Playground Learning Assistant — a friendly, expert AI tutor specializing in Hashcat, password cracking methodology, and password security.

Your role is to TEACH, not just answer. Always explain WHY something works, not just WHAT to do. Provide:
1. Direct answer to the student's question
2. Educational context (the principle behind the answer)
3. A practical recommendation or example
4. A defense recommendation where relevant

Keep responses concise (3-5 short paragraphs max). Use plain English — avoid jargon when possible, or explain it when used. Be encouraging and constructive.

${contextStr}

Focus on Hashcat methodology, password security principles, and educational best practices. Never provide guidance on attacking real systems or real credentials — this is a safe educational environment only. Never reveal or hint at challenge answers — students must earn them.`;

  try {
    const zai = await ZAI.create();
    const response = await zai.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: sanitizedQuestion },
      ],
      temperature: 0.7,
      max_tokens: 600,
    });

    const answer = response.choices[0]?.message?.content || "I couldn't generate a response. Please try rephrasing your question.";
    return NextResponse.json({ answer });
  } catch (e) {
    console.error("Tutor API error:", e);
    return NextResponse.json(
      { error: "Failed to generate response", answer: "I'm having trouble responding right now. Please try again in a moment." },
      { status: 500 }
    );
  }
}
