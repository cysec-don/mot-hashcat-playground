// Playground session logging endpoint
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getStudentFromRequest, validateCSRF } from "../auth/route";
import { rateLimit, rateLimitResponse, sanitizeString } from "@/lib/security";

const ALLOWED_HASH_TYPES = ["MD5", "SHA1", "SHA2-256", "Bitcoin/Litecoin wallet.dat (legacy)"];
const ALLOWED_ATTACK_MODES = ["Straight", "Combination", "Brute-force (Mask)", "Hybrid Wordlist + Mask", "Hybrid Mask + Wordlist", "Association"];

export async function POST(req: NextRequest) {
  const student = await getStudentFromRequest(req);
  if (!student) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!validateCSRF(req)) {
    return NextResponse.json({ error: "Invalid CSRF token" }, { status: 403 });
  }

  // Rate limit: 60 playground sessions per hour per IP
  const rl = rateLimit(req, { windowMs: 3_600_000, maxRequests: 60 });
  if (!rl.allowed) {
    return rateLimitResponse(rl.retryAfter);
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { hashType, attackMode, wordlist, rules, mask, command, recovered, duration } = body as Record<string, unknown>;

  // Validate inputs
  if (typeof hashType !== "string" || !ALLOWED_HASH_TYPES.includes(hashType)) {
    return NextResponse.json({ error: "Invalid hashType" }, { status: 400 });
  }
  if (typeof attackMode !== "string" || !ALLOWED_ATTACK_MODES.includes(attackMode)) {
    return NextResponse.json({ error: "Invalid attackMode" }, { status: 400 });
  }
  if (typeof command !== "string" || command.length > 2000) {
    return NextResponse.json({ error: "Invalid command" }, { status: 400 });
  }
  if (typeof duration !== "number" || duration < 0 || duration > 3600) {
    return NextResponse.json({ error: "Invalid duration" }, { status: 400 });
  }

  const log = await db.playgroundLog.create({
    data: {
      studentId: student.id,
      hashType,
      attackMode,
      wordlist: typeof wordlist === "string" ? sanitizeString(wordlist, 100) : null,
      rules: typeof rules === "string" ? sanitizeString(rules, 100) : null,
      mask: typeof mask === "string" ? sanitizeString(mask, 200) : null,
      command: sanitizeString(command, 2000),
      recovered: Boolean(recovered),
      duration: Number(duration),
    },
  });

  // Award 10 XP per playground session
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
