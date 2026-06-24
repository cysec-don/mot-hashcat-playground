// Challenge progress + answer verification — hardened post-pentest
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getStudentFromRequest, validateCSRF } from "../auth/route";
import { CHALLENGES, getChallenge } from "@/lib/challenges-data";
import { ACHIEVEMENTS, RANKS, getRankByXp } from "@/lib/achievements-data";
import {
  rateLimit,
  rateLimitResponse,
  sanitizeString,
  parseJsonObjectBody,
  asInteger,
} from "@/lib/security";

const TOTAL_CHALLENGES = CHALLENGES.length;

// GET /api/progress — returns challenge list with completion status
export async function GET(req: NextRequest) {
  const student = await getStudentFromRequest(req);
  if (!student) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // L9: rate limit GET
  const rl = rateLimit(req, { windowMs: 60_000, maxRequests: 60 });
  if (!rl.allowed) return rateLimitResponse(rl.retryAfter, 60);

  const results = await db.challengeResult.findMany({
    where: { studentId: student.id },
  });

  const result = CHALLENGES.map((c) => {
    const r = results.find((x) => x.challengeId === c.id);
    return {
      id: c.id,
      module: c.module,
      title: c.title,
      difficulty: c.difficulty,
      xp: c.xp,
      completed: r?.completed ?? false,
      attempts: r?.attempts ?? 0,
      hintsUsed: r?.hintsUsed ?? 0,
      xpEarned: r?.xpEarned ?? 0,
    };
  });

  return NextResponse.json({ challenges: result });
}

// POST /api/progress — submit an answer
export async function POST(req: NextRequest) {
  const student = await getStudentFromRequest(req);
  if (!student) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!validateCSRF(req)) {
    return NextResponse.json({ error: "Invalid CSRF token" }, { status: 403 });
  }

  const rl = rateLimit(req, { windowMs: 60_000, maxRequests: 30 });
  if (!rl.allowed) return rateLimitResponse(rl.retryAfter, 30);

  const parsed = await parseJsonObjectBody(req);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: parsed.status });
  }
  const body = parsed.body;

  // L11: strict integer validation
  const challengeId = asInteger(body.challengeId, { min: 1, max: TOTAL_CHALLENGES });
  if (challengeId === null) {
    return NextResponse.json(
      { error: "Invalid challengeId (must be an integer 1-20)." },
      { status: 400 }
    );
  }

  if (typeof body.answer !== "string" || body.answer.length === 0 || body.answer.length > 1000) {
    return NextResponse.json(
      { error: "Invalid answer (must be a non-empty string, max 1000 chars)." },
      { status: 400 }
    );
  }

  const hintsUsed = asInteger(body.hintsUsed ?? 0, { min: 0, max: 3 });
  if (hintsUsed === null) {
    return NextResponse.json(
      { error: "Invalid hintsUsed (must be an integer 0-3)." },
      { status: 400 }
    );
  }

  const challenge = getChallenge(challengeId);
  if (!challenge) {
    return NextResponse.json({ error: "Challenge not found" }, { status: 404 });
  }

  const sanitizedAnswer = sanitizeString(body.answer, 200);

  let correct = false;
  if (challenge.questionType === "crack") {
    correct =
      sanitizedAnswer.toLowerCase() ===
      (challenge.expectedAnswer ?? "").toLowerCase();
  } else {
    correct = sanitizedAnswer === challenge.expectedOption;
  }

  let result = await db.challengeResult.findUnique({
    where: {
      studentId_challengeId: {
        studentId: student.id,
        challengeId: challenge.id,
      },
    },
  });

  if (!result) {
    result = await db.challengeResult.create({
      data: {
        studentId: student.id,
        challengeId: challenge.id,
        attempts: 1,
        hintsUsed,
        completed: correct,
        xpEarned: correct ? challenge.xp : 0,
        completedAt: correct ? new Date() : null,
      },
    });

    // Award XP on first-time completion (was missing — logic bug noted by Agent #6)
    if (correct) {
      await db.student.update({
        where: { id: student.id },
        data: { xp: { increment: challenge.xp } },
      });
      await db.activityLog.create({
        data: {
          studentId: student.id,
          action: "challenge_completed",
          detail: `Completed: ${challenge.title}`,
          xpDelta: challenge.xp,
        },
      });
    } else {
      await db.activityLog.create({
        data: {
          studentId: student.id,
          action: "challenge_attempt",
          detail: `Attempted: ${challenge.title}`,
          xpDelta: 0,
        },
      });
    }
  } else {
    const newAttempts = result.attempts + 1;
    const newHintsUsed = Math.max(result.hintsUsed, hintsUsed);
    const newlyCompleted = correct && !result.completed;

    result = await db.challengeResult.update({
      where: { id: result.id },
      data: {
        attempts: newAttempts,
        hintsUsed: newHintsUsed,
        completed: result.completed || correct,
        xpEarned: result.xpEarned + (newlyCompleted ? challenge.xp : 0),
        completedAt: newlyCompleted ? new Date() : result.completedAt,
      },
    });

    if (newlyCompleted) {
      await db.student.update({
        where: { id: student.id },
        data: { xp: { increment: challenge.xp } },
      });
      await db.activityLog.create({
        data: {
          studentId: student.id,
          action: "challenge_completed",
          detail: `Completed: ${challenge.title}`,
          xpDelta: challenge.xp,
        },
      });
    } else {
      await db.activityLog.create({
        data: {
          studentId: student.id,
          action: "challenge_attempt",
          detail: `Attempted: ${challenge.title}`,
          xpDelta: 0,
        },
      });
    }
  }

  // Re-evaluate achievements & rank
  const allResults = await db.challengeResult.findMany({
    where: { studentId: student.id },
  });
  const completedIds = allResults.filter((r) => r.completed).map((r) => r.challengeId);
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
  const perfectScoreCount = allResults.filter(
    (r) => r.completed && r.hintsUsed === 0
  ).length;

  const freshStudent = await db.student.findUnique({ where: { id: student.id } });
  const totalXp = freshStudent?.xp ?? 0;

  const ctx = {
    completedChallenges: completedIds,
    totalXp,
    playgroundRuns: await db.playgroundLog.count({ where: { studentId: student.id } }),
    md5Completed,
    sha1Completed,
    sha2Completed,
    walletCompleted,
    perfectScoreCount,
    allCompleted: completedIds.length === TOTAL_CHALLENGES,
  };

  const existingAch = await db.studentAchievement.findMany({
    where: { studentId: student.id },
  });
  const existingIds = new Set(existingAch.map((a) => a.achievementId));
  const newlyUnlocked: string[] = [];

  for (const ach of ACHIEVEMENTS) {
    if (!existingIds.has(ach.id) && ach.check(ctx)) {
      await db.studentAchievement.create({
        data: { studentId: student.id, achievementId: ach.id },
      });
      newlyUnlocked.push(ach.id);
      existingIds.add(ach.id);
    }
  }

  const currentRank = getRankByXp(totalXp);
  const newRankId = RANKS.indexOf(currentRank) + 1;
  if (freshStudent && freshStudent.rank !== newRankId) {
    await db.student.update({
      where: { id: freshStudent.id },
      data: { rank: newRankId },
    });
  }

  return NextResponse.json({
    correct,
    challengeId: challenge.id,
    completed: result.completed,
    xpEarned: result.xpEarned,
    totalXp,
    newlyUnlocked,
    newRankId,
    explanation: challenge.explanation,
    allCompleted: ctx.allCompleted,
  });
}

// PATCH — record hint usage (H5: now validates challengeId range)
export async function PATCH(req: NextRequest) {
  const student = await getStudentFromRequest(req);
  if (!student) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!validateCSRF(req)) {
    return NextResponse.json({ error: "Invalid CSRF token" }, { status: 403 });
  }

  const rl = rateLimit(req, { windowMs: 60_000, maxRequests: 60 });
  if (!rl.allowed) return rateLimitResponse(rl.retryAfter, 60);

  const parsed = await parseJsonObjectBody(req);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: parsed.status });
  }
  const body = parsed.body;

  // H5: validate challengeId is an integer in valid range
  const challengeId = asInteger(body.challengeId, { min: 1, max: TOTAL_CHALLENGES });
  if (challengeId === null) {
    return NextResponse.json(
      { error: "Invalid challengeId (must be an integer 1-20)." },
      { status: 400 }
    );
  }

  let result = await db.challengeResult.findUnique({
    where: {
      studentId_challengeId: {
        studentId: student.id,
        challengeId,
      },
    },
  });

  if (!result) {
    result = await db.challengeResult.create({
      data: {
        studentId: student.id,
        challengeId,
        attempts: 0,
        hintsUsed: 1,
        completed: false,
        xpEarned: 0,
      },
    });
  } else {
    result = await db.challengeResult.update({
      where: { id: result.id },
      data: { hintsUsed: result.hintsUsed + 1 },
    });
  }

  return NextResponse.json({ hintsUsed: result.hintsUsed });
}
