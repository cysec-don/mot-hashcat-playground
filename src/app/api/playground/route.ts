// Playground session logging endpoint
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getStudentFromRequest } from "../auth/route";

export async function POST(req: NextRequest) {
  const student = await getStudentFromRequest(req);
  if (!student) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { hashType, attackMode, wordlist, rules, mask, command, recovered, duration } = body;

  const log = await db.playgroundLog.create({
    data: {
      studentId: student.id,
      hashType: hashType || "MD5",
      attackMode: attackMode || "Straight",
      wordlist: wordlist || null,
      rules: rules || null,
      mask: mask || null,
      command: command || "",
      recovered: Boolean(recovered),
      duration: Number(duration) || 0,
    },
  });

  // Award 10 XP per playground session (capped at 100/day implicit by frequency)
  await db.student.update({
    where: { id: student.id },
    data: { xp: { increment: 10 } },
  });

  await db.activityLog.create({
    data: {
      studentId: student.id,
      action: "playground_session",
      detail: `Ran ${attackMode} attack on ${hashType}`,
      xpDelta: 10,
    },
  });

  return NextResponse.json({ ok: true, logId: log.id, xpAwarded: 10 });
}

export async function GET(req: NextRequest) {
  const student = await getStudentFromRequest(req);
  if (!student) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const logs = await db.playgroundLog.findMany({
    where: { studentId: student.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  return NextResponse.json({ logs });
}
