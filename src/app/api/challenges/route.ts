// Public challenge list endpoint (for landing page preview) — rate-limited
import { NextRequest, NextResponse } from "next/server";
import { CHALLENGES, MODULES } from "@/lib/challenges-data";
import { rateLimit, rateLimitResponse } from "@/lib/security";

export async function GET(req: NextRequest) {
  const rl = rateLimit(req, { windowMs: 60_000, maxRequests: 60 });
  if (!rl.allowed) return rateLimitResponse(rl.retryAfter, 60);

  return NextResponse.json({
    modules: MODULES,
    challenges: CHALLENGES.map((c) => ({
      id: c.id,
      module: c.module,
      title: c.title,
      difficulty: c.difficulty,
      xp: c.xp,
      questionType: c.questionType,
    })),
  });
}
