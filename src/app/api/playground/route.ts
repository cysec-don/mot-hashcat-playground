// Playground session logging endpoint — hardened post-pentest
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getStudentFromRequest, validateCSRF } from "../auth/route";
import {
  rateLimit,
  rateLimitResponse,
  sanitizeString,
  parseJsonObjectBody,
} from "@/lib/security";

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

  const rl = rateLimit(req, { windowMs: 3_600_000, maxRequests: 60 });
  if (!rl.allowed) return rateLimitResponse(rl.retryAfter, 60);

  const parsed = await parseJsonObjectBody(req);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: parsed.status });
  }
  const body = parsed.body;

  // Validate types strictly
  if (typeof body.hashType !== "string" || !ALLOWED_HASH_TYPES.includes(body.hashType)) {
    return NextResponse.json({ error: "Invalid hashType" }, { status: 400 });
  }
  if (typeof body.attackMode !== "string" || !ALLOWED_ATTACK_MODES.includes(body.attackMode)) {
    return NextResponse.json({ error: "Invalid attackMode" }, { status: 400 });
  }
  if (typeof body.command !== "string" || body.command.length === 0 || body.command.length > 2000) {
    return NextResponse.json({ error: "Invalid command" }, { status: 400 });
  }
  // L11: duration must be a finite number
  if (typeof body.duration !== "number" || !Number.isFinite(body.duration) || body.duration < 0 || body.duration > 3600) {
    return NextResponse.json({ error: "Invalid duration" }, { status: 400 });
  }
  // M5: recovered must be a real boolean — reject strings/arrays/objects
  if (typeof body.recovered !== "boolean") {
    return NextResponse.json({ error: "Invalid recovered (must be boolean)" }, { status: 400 });
  }

  const log = await db.playgroundLog.create({
    data: {
      studentId: student.id,
      hashType: body.hashType,
      attackMode: body.attackMode,
      wordlist: typeof body.wordlist === "string" ? sanitizeString(body.wordlist, 100) : null,
      rules: typeof body.rules === "string" ? sanitizeString(body.rules, 100) : null,
      mask: typeof body.mask === "string" ? sanitizeString(body.mask, 200) : null,
      command: sanitizeString(body.command, 2000),
      recovered: body.recovered, // already validated as boolean
      duration: body.duration,
    },
  });

  await db.student.update({
    where: { id: student.id },
    data: { xp: { increment: 10 } },
  });

  await db.activityLog.create({
    data: {
      studentId: student.id,
      action: "playground_session",
      detail: `Ran ${body.attackMode} attack on ${body.hashType}`,
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
  const rl = rateLimit(req, { windowMs: 60_000, maxRequests: 60 });
  if (!rl.allowed) return rateLimitResponse(rl.retryAfter, 60);

  const logs = await db.playgroundLog.findMany({
    where: { studentId: student.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  return NextResponse.json({ logs });
}
