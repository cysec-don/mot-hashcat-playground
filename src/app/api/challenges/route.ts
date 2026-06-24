// Public challenge list endpoint (for landing page preview)
import { NextResponse } from "next/server";
import { CHALLENGES, MODULES } from "@/lib/challenges-data";

export async function GET() {
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
