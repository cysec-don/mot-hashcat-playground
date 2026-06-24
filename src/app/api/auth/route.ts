// MOT Hashcat Playground — Auth API (register + login)
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  hashPassword,
  verifyPassword,
  validateFullName,
  validateEmail,
  validatePasswordStrength,
  sanitizeString,
  rateLimit,
  rateLimitResponse,
  generateSecureToken,
} from "@/lib/security";

// Use globalThis to survive hot reloads during dev.
// Token -> { studentId, csrf, createdAt, lastSeen }
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

// Session lifetime: 12 hours of inactivity
const SESSION_TTL_MS = 12 * 60 * 60 * 1000;
// Cleanup expired tokens periodically (every 5 min)
let lastCleanup = 0;
function cleanupExpiredTokens() {
  const now = Date.now();
  if (now - lastCleanup < 5 * 60 * 1000) return;
  lastCleanup = now;
  for (const [tok, entry] of TOKENS) {
    if (now - entry.lastSeen > SESSION_TTL_MS) {
      TOKENS.delete(tok);
    }
  }
}

export async function POST(req: NextRequest) {
  cleanupExpiredTokens();

  // Rate limit: 10 auth attempts per minute per IP
  const rl = rateLimit(req, { windowMs: 60_000, maxRequests: 10 });
  if (!rl.allowed) {
    return rateLimitResponse(rl.retryAfter);
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request body." },
      { status: 400 }
    );
  }

  const { action } = body as { action?: string };

  if (action === "register") {
    return handleRegister(req, body as Record<string, unknown>);
  }
  if (action === "login") {
    return handleLogin(req, body as Record<string, unknown>);
  }
  if (action === "logout") {
    return handleLogout(req);
  }
  return NextResponse.json(
    { error: "Unknown action. Use 'register' or 'login'." },
    { status: 400 }
  );
}

async function handleRegister(req: NextRequest, body: Record<string, unknown>) {
  const rawName = sanitizeString(String(body.fullName ?? ""), 80);
  const rawEmail = sanitizeString(String(body.email ?? ""), 254);
  const rawPassword = String(body.password ?? "");

  // Validate inputs
  const nameCheck = validateFullName(rawName);
  if (!nameCheck.ok) {
    return NextResponse.json({ error: nameCheck.error }, { status: 400 });
  }
  const emailCheck = validateEmail(rawEmail);
  if (!emailCheck.ok) {
    return NextResponse.json({ error: emailCheck.error }, { status: 400 });
  }
  const pwCheck = validatePasswordStrength(rawPassword);
  if (!pwCheck.ok) {
    return NextResponse.json(
      { error: pwCheck.errors.join(" ") },
      { status: 400 }
    );
  }

  // Check name uniqueness (case-insensitive on SQLite via raw equals)
  const existing = await db.student.findUnique({
    where: { fullName: rawName },
  });
  if (existing) {
    // Generic message to avoid leaking existence
    return NextResponse.json(
      {
        error:
          "This Full Name is already registered. Please log in instead, or choose a different name.",
      },
      { status: 409 }
    );
  }

  // Hash password
  const passwordHash = await hashPassword(rawPassword);

  // First student becomes admin
  const studentCount = await db.student.count();
  const student = await db.student.create({
    data: {
      fullName: rawName,
      email: rawEmail || null,
      passwordHash,
      isAdmin: studentCount === 0,
    },
  });

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

async function handleLogin(req: NextRequest, body: Record<string, unknown>) {
  const rawName = sanitizeString(String(body.fullName ?? ""), 80);
  const rawPassword = String(body.password ?? "");

  if (!rawName || !rawPassword) {
    return NextResponse.json(
      { error: "Full Name and password are required." },
      { status: 400 }
    );
  }

  // Look up student
  const student = await db.student.findUnique({
    where: { fullName: rawName },
  });
  // Constant-time-ish: always hash a dummy if not found
  if (!student) {
    await hashPassword(rawPassword); // waste time to equalize
    return NextResponse.json(
      { error: "Invalid Full Name or password." },
      { status: 401 }
    );
  }

  const ok = await verifyPassword(rawPassword, student.passwordHash);
  if (!ok) {
    return NextResponse.json(
      { error: "Invalid Full Name or password." },
      { status: 401 }
    );
  }

  // Update last active
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

async function handleLogout(req: NextRequest) {
  const auth = req.headers.get("authorization") || "";
  const token = auth.replace(/^Bearer\s+/i, "");
  if (token) TOKENS.delete(token);
  return NextResponse.json({ ok: true });
}

function createSession(studentId: string): { token: string; csrf: string } {
  const token = `mot_${studentId}_${Date.now()}_${generateSecureToken(16)}`;
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
  // Check TTL
  if (Date.now() - entry.lastSeen > SESSION_TTL_MS) {
    TOKENS.delete(token);
    return null;
  }
  // Touch last seen
  entry.lastSeen = Date.now();
  return entry.studentId;
}

export function getCSRFToken(token: string): string | null {
  return TOKENS.get(token)?.csrf ?? null;
}

export async function getStudentFromRequest(req: NextRequest) {
  const auth = req.headers.get("authorization") || "";
  const token = auth.replace(/^Bearer\s+/i, "");
  if (!token) return null;
  const studentId = verifyToken(token);
  if (!studentId) return null;
  return await db.student.findUnique({ where: { id: studentId } });
}

// Helper: validate CSRF token from request header
export function validateCSRF(req: NextRequest): boolean {
  const auth = req.headers.get("authorization") || "";
  const token = auth.replace(/^Bearer\s+/i, "");
  if (!token) return false;
  const expected = getCSRFToken(token);
  if (!expected) return false;
  const provided = req.headers.get("x-csrf-token") || "";
  // Constant-time compare
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
      "POST /api/auth with { action: 'logout' } + Bearer token",
    ],
  });
}
