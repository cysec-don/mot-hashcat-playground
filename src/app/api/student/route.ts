// Student dashboard data endpoint
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getStudentFromRequest } from "../auth/route";
import { CHALLENGES } from "@/lib/challenges-data";
import { ACHIEVEMENTS } from "@/lib/achievements-data";
import { getRankByXp, getNextRank, RANKS } from "@/lib/achievements-data";
import { rateLimit, rateLimitResponse } from "@/lib/security";

export async function GET(req: NextRequest) {
  const student = await getStudentFromRequest(req);
  if (!student) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // L9: rate limit
  const rl = rateLimit(req, { windowMs: 60_000, maxRequests: 60 });
  if (!rl.allowed) return rateLimitResponse(rl.retryAfter, 60);

  const results = await db.challengeResult.findMany({
    where: { studentId: student.id },
  });
  const achievements = await db.studentAchievement.findMany({
    where: { studentId: student.id },
  });
  const playgroundLogs = await db.playgroundLog.findMany({
    where: { studentId: student.id },
    orderBy: { createdAt: "desc" },
    take: 10,
  });
  const activityLogs = await db.activityLog.findMany({
    where: { studentId: student.id },
    orderBy: { createdAt: "desc" },
    take: 10,
  });
  const certificates = await db.certificate.findMany({
    where: { studentId: student.id },
  });

  // Compute counts
  const completedIds = results.filter((r) => r.completed).map((r) => r.challengeId);
  const totalChallenges = CHALLENGES.length;
  const completedCount = completedIds.length;

  const md5Completed = CHALLENGES.filter(
    (c) => c.module === "MD5" && completedIds.includes(c.id)
  ).length;
  const sha1Completed = CHALLENGES.filter(
    (c) => c.module === "SHA1" && completedIds.includes(c.id)
  ).length;
  const sha2Completed = CHALLENGES.filter(
    (c) => c.module === "SHA2-256" && completedIds.includes(c.id)
  ).length;
  const walletCompleted = CHALLENGES.filter(
    (c) => c.module === "WALLET.DAT" && completedIds.includes(c.id)
  ).length;

  const perfectScoreCount = results.filter(
    (r) => r.completed && r.hintsUsed === 0
  ).length;

  const currentRank = getRankByXp(student.xp);
  const nextRank = getNextRank(student.xp);
  const allCompleted = completedCount === totalChallenges;

  // Check newly unlocked achievements
  const ctx = {
    completedChallenges: completedIds,
    totalXp: student.xp,
    playgroundRuns: playgroundLogs.length,
    md5Completed,
    sha1Completed,
    sha2Completed,
    walletCompleted,
    perfectScoreCount,
    allCompleted,
  };

  const unlockedAchievementIds = new Set(achievements.map((a) => a.achievementId));
  const newlyUnlocked: string[] = [];

  for (const ach of ACHIEVEMENTS) {
    if (!unlockedAchievementIds.has(ach.id) && ach.check(ctx)) {
      await db.studentAchievement.create({
        data: { studentId: student.id, achievementId: ach.id },
      });
      newlyUnlocked.push(ach.id);
      unlockedAchievementIds.add(ach.id);
    }
  }

  // Update rank
  const newRankId = RANKS.indexOf(currentRank) + 1;
  if (student.rank !== newRankId) {
    await db.student.update({
      where: { id: student.id },
      data: { rank: newRankId },
    });
  }

  // Leaderboard position
  const higherXp = await db.student.count({
    where: { xp: { gt: student.xp } },
  });
  const leaderboardPosition = higherXp + 1;

  // Total students
  const totalStudents = await db.student.count();

  return NextResponse.json({
    student: {
      id: student.id,
      fullName: student.fullName,
      email: student.email,
      xp: student.xp,
      rank: newRankId,
      isAdmin: student.isAdmin,
      createdAt: student.createdAt,
    },
    stats: {
      completedCount,
      remainingCount: totalChallenges - completedCount,
      completionPercent: (completedCount / totalChallenges) * 100,
      totalXp: student.xp,
      currentRank,
      nextRank,
      certificatesEarned: certificates.length,
      leaderboardPosition,
      totalStudents,
      md5Completed,
      sha1Completed,
      sha2Completed,
      walletCompleted,
      perfectScoreCount,
    },
    challengeResults: results,
    achievements: Array.from(unlockedAchievementIds),
    newlyUnlocked,
    playgroundLogs,
    activityLogs,
    certificates,
  });
}
