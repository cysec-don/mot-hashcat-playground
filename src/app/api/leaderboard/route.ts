// Leaderboard endpoint (public, rate-limited) — enhanced with time-period tabs
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getRankByXp } from "@/lib/achievements-data";
import { rateLimit, rateLimitResponse } from "@/lib/security";

export async function GET(req: NextRequest) {
  const rl = rateLimit(req, { windowMs: 60_000, maxRequests: 30 });
  if (!rl.allowed) return rateLimitResponse(rl.retryAfter, 30);

  const url = new URL(req.url);
  const raw = url.searchParams.get("limit");
  const period = url.searchParams.get("period") || "all";

  let limit = 50;
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

  // Calculate date filter for time periods
  let dateFilter: Date | undefined;
  if (period === "weekly") {
    dateFilter = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  } else if (period === "monthly") {
    dateFilter = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  }

  const where = dateFilter ? { lastActiveAt: { gte: dateFilter } } : {};

  const students = await db.student.findMany({
    where,
    orderBy: { xp: "desc" },
    take: limit,
    include: {
      challengeResults: { where: { completed: true } },
      certificates: true,
    },
  });

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
    };
  });

  return NextResponse.json({
    leaderboard: ranked,
    returned: students.length,
    total: totalStudents,
    period,
  });
}
