// Leaderboard endpoint (public, rate-limited) — hardened post-pentest
// M11: removed lastActiveAt from public response (admin-only now)
// M6+M7+L14: fixed limit validation (NaN, negative, zero) and total count
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getRankByXp } from "@/lib/achievements-data";
import { rateLimit, rateLimitResponse } from "@/lib/security";

export async function GET(req: NextRequest) {
  const rl = rateLimit(req, { windowMs: 60_000, maxRequests: 30 });
  if (!rl.allowed) return rateLimitResponse(rl.retryAfter, 30);

  const url = new URL(req.url);
  const raw = url.searchParams.get("limit");

  // M6+M7: validate limit — must be a positive integer, capped at 200
  let limit = 50; // default
  if (raw !== null) {
    const parsed = parseInt(raw, 10);
    if (!Number.isInteger(parsed) || parsed < 1) {
      return NextResponse.json(
        { error: "Invalid limit. Must be a positive integer." },
        { status: 400 }
      );
    }
    limit = Math.min(parsed, 200);
  }

  const students = await db.student.findMany({
    orderBy: { xp: "desc" },
    take: limit,
    include: {
      challengeResults: { where: { completed: true } },
      certificates: true,
    },
  });

  // L14: total is the ACTUAL total student count, not the returned slice
  const totalStudents = await db.student.count();

  const ranked = students.map((s, i) => {
    const rank = getRankByXp(s.xp);
    return {
      position: i + 1,
      fullName: s.fullName,
      xp: s.xp,
      rankName: rank.name,
      rankId: rank.id,
      rankColor: rank.color,
      completedCount: s.challengeResults.length,
      completionPercent: (s.challengeResults.length / 100) * 100,
      certificatesEarned: s.certificates.length,
      // M11: lastActiveAt intentionally omitted from public leaderboard
    };
  });

  return NextResponse.json({
    leaderboard: ranked,
    returned: students.length,
    total: totalStudents,
  });
}
