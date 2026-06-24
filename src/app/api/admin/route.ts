// Admin endpoints
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getStudentFromRequest } from "../auth/route";
import { CHALLENGES } from "@/lib/challenges-data";
import { getRankByXp } from "@/lib/achievements-data";

async function requireAdmin(req: NextRequest) {
  const student = await getStudentFromRequest(req);
  if (!student || !student.isAdmin) return null;
  return student;
}

export async function GET(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (!admin) {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }

  const url = new URL(req.url);
  const action = url.searchParams.get("action") || "overview";

  if (action === "students") {
    const students = await db.student.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        challengeResults: { where: { completed: true } },
        certificates: true,
        _count: {
          select: { playgroundLogs: true, achievements: true },
        },
      },
    });
    const data = students.map((s) => ({
      id: s.id,
      fullName: s.fullName,
      email: s.email,
      xp: s.xp,
      rank: getRankByXp(s.xp).name,
      isAdmin: s.isAdmin,
      completedCount: s.challengeResults.length,
      completionPercent: (s.challengeResults.length / 20) * 100,
      certificatesEarned: s.certificates.length,
      playgroundSessions: s._count.playgroundLogs,
      achievementsUnlocked: s._count.achievements,
      createdAt: s.createdAt,
      lastActiveAt: s.lastActiveAt,
    }));
    return NextResponse.json({ students: data });
  }

  if (action === "analytics") {
    const totalStudents = await db.student.count();
    const totalCertificates = await db.certificate.count();
    const totalPlaygroundSessions = await db.playgroundLog.count();
    const totalChallengeCompletions = await db.challengeResult.count({
      where: { completed: true },
    });
    const totalAchievementsUnlocked = await db.studentAchievement.count();

    // Per-challenge completion counts
    const allResults = await db.challengeResult.findMany({
      where: { completed: true },
    });
    const perChallenge = CHALLENGES.map((c) => ({
      id: c.id,
      title: c.title,
      module: c.module,
      completions: allResults.filter((r) => r.challengeId === c.id).length,
    }));

    // Top 5 students
    const topStudents = await db.student.findMany({
      orderBy: { xp: "desc" },
      take: 5,
      select: { fullName: true, xp: true },
    });

    return NextResponse.json({
      overview: {
        totalStudents,
        totalCertificates,
        totalPlaygroundSessions,
        totalChallengeCompletions,
        totalAchievementsUnlocked,
      },
      perChallenge,
      topStudents,
    });
  }

  // Default: overview
  const totalStudents = await db.student.count();
  const totalCertificates = await db.certificate.count();
  const totalPlaygroundSessions = await db.playgroundLog.count();
  const totalChallengeCompletions = await db.challengeResult.count({
    where: { completed: true },
  });

  return NextResponse.json({
    overview: {
      totalStudents,
      totalCertificates,
      totalPlaygroundSessions,
      totalChallengeCompletions,
    },
  });
}

export async function POST(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (!admin) {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }

  const body = await req.json();
  const { action, studentId } = body;

  if (action === "reset-progress") {
    await db.challengeResult.deleteMany({ where: { studentId } });
    await db.studentAchievement.deleteMany({ where: { studentId } });
    await db.certificate.deleteMany({ where: { studentId } });
    await db.student.update({
      where: { id: studentId },
      data: { xp: 0, rank: 1 },
    });
    return NextResponse.json({ ok: true });
  }

  if (action === "promote-admin") {
    await db.student.update({
      where: { id: studentId },
      data: { isAdmin: true },
    });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
