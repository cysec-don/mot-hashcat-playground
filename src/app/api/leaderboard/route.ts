// Leaderboard endpoint
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getRankByXp } from "@/lib/achievements-data";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const limit = Math.min(Number(url.searchParams.get("limit") || "50"), 200);

  const students = await db.student.findMany({
    orderBy: { xp: "desc" },
    take: limit,
    include: {
      challengeResults: { where: { completed: true } },
      certificates: true,
    },
  });

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
      completionPercent: (s.challengeResults.length / 20) * 100,
      certificatesEarned: s.certificates.length,
      lastActiveAt: s.lastActiveAt,
    };
  });

  return NextResponse.json({ leaderboard: ranked, total: students.length });
}
