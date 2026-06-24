// MOT Hashcat Playground — Auth API (register + login) — hardened post-pentest
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  hashPassword,
  verifyPassword,
  compareAgainstDummy,
  validateFullName,
  validateEmail,
  validatePasswordStrength,
  sanitizeString,
  rateLimit,
  rateLimitResponse,
  accountRateLimit,
  generateSecureToken,
  parseJsonObjectBody,
} from "@/lib/security";

// ============ Session store (M10: opaque tokens, no embedded studentId/timestamp) ============
interface TokenEntry {
  studentId: string;
  csrf: string;
  createdAt: number;
  lastSeen: number;
}

const globalForTokens = globalThis as unknown as {
  __motTokens?: Map<string, TokenEntry>;
};
export const TOKENS: Map<string, TokenEntry> =
  globalForTokens.__motTokens ?? new Map();
globalForTokens.__motTokens = TOKENS;

const SESSION_TTL_MS = 12 * 60 * 60 * 1000; // 12h inactivity
const MAX_TOKENS = 100_000; // H2 cap

// Periodic cleanup — runs on every auth request (opportunistic).
// We avoid setInterval at module scope to prevent HMR/dev-server crashes.
let lastTokenCleanup = 0;
function cleanupExpiredTokens() {
  const now = Date.now();
  if (now - lastTokenCleanup < 60_000) return; // at most once per minute
  lastTokenCleanup = now;
  for (const [tok, entry] of TOKENS) {
    if (now - entry.lastSeen > SESSION_TTL_MS) {
      TOKENS.delete(tok);
    }
  }
}

export async function POST(req: NextRequest) {
  cleanupExpiredTokens();

  // C1+global rate limit: 10 auth attempts/min/IP (now actually enforced)
  const rl = rateLimit(req, { windowMs: 60_000, maxRequests: 10 });
  if (!rl.allowed) {
    return rateLimitResponse(rl.retryAfter, 10);
  }

  const parsed = await parseJsonObjectBody(req);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: parsed.status });
  }
  const body = parsed.body;

  const action = body.action;
  if (action === "register") {
    return handleRegister(body);
  }
  if (action === "login") {
    return handleLogin(body);
  }
  if (action === "logout") {
    return handleLogout(req);
  }
  return NextResponse.json(
    { error: "Unknown action. Use 'register' or 'login'." },
    { status: 400 }
  );
}

async function handleRegister(body: Record<string, unknown>) {
  // Validate types first
  if (typeof body.fullName !== "string" || typeof body.password !== "string") {
    return NextResponse.json(
      { error: "Full Name and password are required." },
      { status: 400 }
    );
  }

  // H7: validate length on RAW input BEFORE sanitize
  const nameCheck = validateFullName(body.fullName);
  if (!nameCheck.ok) {
    return NextResponse.json({ error: nameCheck.error }, { status: 400 });
  }
  const cleanName = nameCheck.normalized!;

  const rawEmail = typeof body.email === "string" ? body.email : "";
  const emailCheck = validateEmail(rawEmail);
  if (!emailCheck.ok) {
    return NextResponse.json({ error: emailCheck.error }, { status: 400 });
  }
  const cleanEmail = rawEmail.trim();

  const pwCheck = validatePasswordStrength(body.password);
  if (!pwCheck.ok) {
    return NextResponse.json(
      { error: pwCheck.errors.join(" ") },
      { status: 400 }
    );
  }

  const nameLower = cleanName.toLowerCase();

  // M4: Wrap count + create in a transaction to prevent TOCTOU race on first-admin
  // Also enforce case-insensitive uniqueness via fullNameLower (M1)
  let student;
  try {
    student = await db.$transaction(async (tx) => {
      // Check case-insensitive uniqueness
      const existing = await tx.student.findUnique({
        where: { fullNameLower: nameLower },
      });
      if (existing) {
        // L7: generic message — don't confirm existence explicitly
        throw new Error("NAME_TAKEN");
      }

      const passwordHash = await hashPassword(body.password);
      const studentCount = await tx.student.count();
      return tx.student.create({
        data: {
          fullName: cleanName,
          fullNameLower: nameLower,
          email: cleanEmail || null,
          passwordHash,
          isAdmin: studentCount === 0,
        },
      });
    });
  } catch (e: unknown) {
    if (e instanceof Error && e.message === "NAME_TAKEN") {
      // L7: generic message
      return NextResponse.json(
        {
          error:
            "Unable to register with these credentials. Please try a different name or log in.",
        },
        { status: 409 }
      );
    }
    throw e;
  }

  await db.activityLog.create({
    data: {
      studentId: student.id,
      action: "register",
      detail: "Account created",
      xpDelta: 0,
    },
  });

  const { token, csrf } = createSession(student.id);
  return NextResponse.json({
    token,
    csrf,
    student: serializeStudent(student),
  });
}

async function handleLogin(body: Record<string, unknown>) {
  if (typeof body.fullName !== "string" || typeof body.password !== "string") {
    return NextResponse.json(
      { error: "Full Name and password are required." },
      { status: 400 }
    );
  }

  const rawName = body.fullName;
  if (rawName.length > 80) {
    return NextResponse.json(
      { error: "Invalid Full Name or password." },
      { status: 401 }
    );
  }
  const nameLower = rawName.trim().toLowerCase();
  if (nameLower.length < 2) {
    return NextResponse.json(
      { error: "Invalid Full Name or password." },
      { status: 401 }
    );
  }

  // Per-account rate limit: 5 failed attempts per 15 min per account
  // This is independent of IP rate limit (C1) and slows brute force even with IP rotation
  const acctRl = accountRateLimit(nameLower, {
    windowMs: 15 * 60 * 1000,
    maxRequests: 5,
  });
  if (!acctRl.allowed) {
    return rateLimitResponse(acctRl.retryAfter, 5);
  }

  // Look up student by case-insensitive name
  const student = await db.student.findUnique({
    where: { fullNameLower: nameLower },
  });

  // C2: Always run a constant-time bcrypt.compare, never a variable-cost bcrypt.hash
  // If student doesn't exist, compare against precomputed dummy hash for timing equalization
  const ok = student
    ? await verifyPassword(body.password, student.passwordHash)
    : await compareAgainstDummy(body.password);

  if (!student || !ok) {
    return NextResponse.json(
      { error: "Invalid Full Name or password." },
      { status: 401 }
    );
  }

  // Successful login — reset the account rate limit counter
  // (so a user who fat-fingers their password 4 times then gets it right isn't penalized)
  // Actually we DON'T reset — successful logins shouldn't clear the failed-attempt counter
  // because that would allow 5-then-success-5-then-success brute force. Leave it.

  await db.student.update({
    where: { id: student.id },
    data: { lastActiveAt: new Date() },
  });

  const { token, csrf } = createSession(student.id);
  return NextResponse.json({
    token,
    csrf,
    student: serializeStudent(student),
  });
}

// L1: logout now validates CSRF
export async function handleLogout(req: NextRequest) {
  if (!validateCSRF(req)) {
    return NextResponse.json({ error: "Invalid CSRF token" }, { status: 403 });
  }
  const auth = req.headers.get("authorization") || "";
  const token = auth.replace(/^Bearer\s+/i, "");
  if (token) TOKENS.delete(token);
  return NextResponse.json({ ok: true });
}

// M10: token is now an opaque 64-char hex string — no embedded studentId/timestamp
function createSession(studentId: string): { token: string; csrf: string } {
  // H2: enforce cap before adding new tokens
  if (TOKENS.size >= MAX_TOKENS) {
    cleanupExpiredTokens();
    if (TOKENS.size >= MAX_TOKENS) {
      // Evict oldest by lastSeen
      let oldestKey: string | null = null;
      let oldestTime = Infinity;
      for (const [k, v] of TOKENS) {
        if (v.lastSeen < oldestTime) {
          oldestTime = v.lastSeen;
          oldestKey = k;
        }
      }
      if (oldestKey) TOKENS.delete(oldestKey);
    }
  }
  const token = `mot_${generateSecureToken(32)}`; // 64 hex chars, fully opaque
  const csrf = generateSecureToken(24);
  TOKENS.set(token, {
    studentId,
    csrf,
    createdAt: Date.now(),
    lastSeen: Date.now(),
  });
  return { token, csrf };
}

function serializeStudent(s: {
  id: string;
  fullName: string;
  email: string | null;
  xp: number;
  rank: number;
  isAdmin: boolean;
  createdAt: Date;
}) {
  return {
    id: s.id,
    fullName: s.fullName,
    email: s.email,
    xp: s.xp,
    rank: s.rank,
    isAdmin: s.isAdmin,
    createdAt: s.createdAt,
  };
}

export function verifyToken(token: string): string | null {
  const entry = TOKENS.get(token);
  if (!entry) return null;
  if (Date.now() - entry.lastSeen > SESSION_TTL_MS) {
    TOKENS.delete(token);
    return null;
  }
  entry.lastSeen = Date.now();
  return entry.studentId;
}

export function getCSRFToken(token: string): string | null {
  return TOKENS.get(token)?.csrf ?? null;
}

export async function getStudentFromRequest(req: NextRequest) {
  const auth = req.headers.get("authorization") || "";
  const token = auth.replace(/^Bearer\s+/i, "");
  if (!token || token.length < 10) return null;
  const studentId = verifyToken(token);
  if (!studentId) return null;
  return await db.student.findUnique({ where: { id: studentId } });
}

// CSRF validation — constant-time comparison
export function validateCSRF(req: NextRequest): boolean {
  const auth = req.headers.get("authorization") || "";
  const token = auth.replace(/^Bearer\s+/i, "");
  if (!token) return false;
  const expected = getCSRFToken(token);
  if (!expected) return false;
  const provided = req.headers.get("x-csrf-token") || "";
  if (provided.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) {
    diff |= provided.charCodeAt(i) ^ expected.charCodeAt(i);
  }
  return diff === 0;
}

export async function GET() {
  return NextResponse.json({
    message: "MOT Hashcat Playground Auth API",
    methods: [
      "POST /api/auth with { action: 'register', fullName, password, email? }",
      "POST /api/auth with { action: 'login', fullName, password }",
      "POST /api/auth with { action: 'logout' } + Bearer token + CSRF",
    ],
  });
}
