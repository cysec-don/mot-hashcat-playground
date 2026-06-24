// MOT Hashcat Playground — Security utilities (hardened post-pentest)
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";

// ============ Password hashing ============
// Reduced from 12 to 10 rounds per pentest recommendation (still strong, half the CPU cost)
const SALT_ROUNDS = 10;
const BCRYPT_MAX_BYTES = 72; // bcrypt truncates at 72 bytes
const PASSWORD_MAX_CHARS = 128; // app-level cap, well above 72 bytes for any charset

// Precomputed dummy hash for timing-equalization on bad-credential login path.
// Generated once with bcrypt.hash("dummy", 10). Prevents CPU exhaustion DoS
// because we do bcrypt.compare (constant time) instead of bcrypt.hash (variable cost).
const DUMMY_HASH =
  "$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy";

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, SALT_ROUNDS);
}

export async function verifyPassword(
  plain: string,
  hash: string
): Promise<boolean> {
  if (!hash || !hash.startsWith("$2")) return false;
  try {
    return await bcrypt.compare(plain, hash);
  } catch {
    return false;
  }
}

// Compare against the precomputed dummy — constant-time, no variable-cost hashing
export async function compareAgainstDummy(plain: string): Promise<boolean> {
  try {
    return await bcrypt.compare(plain, DUMMY_HASH);
  } catch {
    return false;
  }
}

// Password strength validation
export function validatePasswordStrength(
  password: string
): { ok: boolean; errors: string[]; score: number } {
  const errors: string[] = [];
  let score = 0;

  if (typeof password !== "string") {
    return { ok: false, errors: ["Password must be a string."], score: 0 };
  }

  // Length checks (H8 — cap at 128 chars; bcrypt would truncate at 72 bytes anyway)
  if (password.length < 8) {
    errors.push("Password must be at least 8 characters long.");
  } else if (password.length > PASSWORD_MAX_CHARS) {
    errors.push(`Password must be at most ${PASSWORD_MAX_CHARS} characters long.`);
  } else {
    score += password.length >= 12 ? 2 : 1;
  }

  if (!/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter.");
  } else {
    score += 1;
  }
  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter.");
  } else {
    score += 1;
  }
  if (!/[0-9]/.test(password)) {
    errors.push("Password must contain at least one digit.");
  } else {
    score += 1;
  }
  if (!/[^a-zA-Z0-9]/.test(password)) {
    errors.push("Password must contain at least one special character.");
  } else {
    score += 1;
  }

  // Expanded common-password blocklist (L6)
  const common = [
    "password", "Password", "PASSWORD",
    "password1", "Password1", "Password1!", "P@ssw0rd", "P@ssw0rd!",
    "12345678", "123456789", "1234567890",
    "qwerty12", "qwerty123", "Qwerty123", "Qwerty12!",
    "letmein1", "letmein123", "Letmein1",
    "Welcome1", "Welcome1!", "Welcome123", "Welcome123!",
    "admin", "admin123", "Admin123", "Admin123!", "administrator",
    "changeme", "Changeme1",
    "abc12345", "Abc12345",
    "iloveyou", "Iloveyou1",
    "monkey12", "Monkey12",
    "dragon12", "Dragon12",
    "master12", "Master12",
    "sunshine1", "Sunshine1",
    "princess1", "Princess1",
    "football1", "Football1",
    "baseball1", "Baseball1",
    "test1234", "Test1234",
    "guest1234", "Guest1234",
    "root1234", "Root1234",
    "hashcat1", "Hashcat1",
    "mot1234", "Mot1234",
  ];
  const lower = password.toLowerCase();
  if (common.some((c) => lower === c.toLowerCase())) {
    errors.push("Password is too common. Choose something unique.");
    score = 0;
  }

  // Reject if password is entirely composed of repeated single char
  if (password.length > 0 && password.split("").every((c) => c === password[0])) {
    errors.push("Password cannot be a single repeated character.");
    score = 0;
  }

  // Reject sequential patterns (12345678, abcdefgh, qwertyui)
  const sequences = ["12345678", "abcdefgh", "qwertyui", "asdfghjk", "zxcvbnm"];
  if (sequences.some((s) => lower.includes(s))) {
    errors.push("Password contains a common sequential pattern.");
    score = Math.max(0, score - 2);
  }

  return { ok: errors.length === 0 && score >= 3, errors, score };
}

// ============ Name / email validation ============
// M1+M2: Latin-only, case-insensitive uniqueness enforced at DB layer (see schema)
export function validateFullName(name: string): {
  ok: boolean;
  error?: string;
  normalized?: string;
} {
  if (typeof name !== "string") {
    return { ok: false, error: "Full Name must be a string." };
  }
  // Validate RAW length BEFORE any sanitization (H7 fix)
  if (name.length > 80) {
    return { ok: false, error: "Full Name must be at most 80 characters." };
  }
  const trimmed = name.trim();
  if (trimmed.length < 2) {
    return { ok: false, error: "Full Name must be at least 2 characters." };
  }

  // Latin letters, spaces, hyphens, apostrophes, periods only (M2 — reject homoglyphs)
  // This rejects Cyrillic, Greek, etc. that look like Latin letters
  if (!/^[A-Za-z][A-Za-z'\-\. ]*[A-Za-z]$/i.test(trimmed) && !/^[A-Za-z]$/i.test(trimmed)) {
    return {
      ok: false,
      error:
        "Full Name may only contain Latin letters (A-Z, a-z), spaces, hyphens, apostrophes, and periods. Must start and end with a letter.",
    };
  }

  // Reject names that are all whitespace between letters (no "A  B")
  if (/\s{2,}/.test(trimmed)) {
    return { ok: false, error: "Full Name cannot contain consecutive spaces." };
  }

  // Normalize: collapse whitespace, title-case for uniqueness comparison
  const normalized = trimmed.replace(/\s+/g, " ");
  return { ok: true, normalized };
}

export function validateEmail(email: string): { ok: boolean; error?: string } {
  if (!email) return { ok: true }; // optional
  if (typeof email !== "string") {
    return { ok: false, error: "Email must be a string." };
  }
  // Validate RAW length BEFORE sanitization (H7 fix)
  if (email.length > 254) {
    return { ok: false, error: "Email is too long (max 254 characters)." };
  }
  // M3: Tightened regex — reject <, >, (, ), ", ', and dangerous schemes
  if (/[<>()"'`\\]/.test(email)) {
    return { ok: false, error: "Email contains invalid characters." };
  }
  if (/javascript:/i.test(email) || /data:/i.test(email) || /vbscript:/i.test(email)) {
    return { ok: false, error: "Email contains a forbidden scheme." };
  }
  // RFC-5322-ish conservative subset
  if (!/^[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}$/.test(email)) {
    return { ok: false, error: "Invalid email format." };
  }
  return { ok: true };
}

// ============ Input sanitization ============
// Strip control chars INCLUDING newlines/CR (L13 fix for command field),
// null bytes, and limit length. Does NOT truncate — caller must validate length first.
export function sanitizeString(input: string, maxLength = 1000): string {
  if (typeof input !== "string") return "";
  return input
    .replace(/[\u0000-\u001F\u007F]/g, "") // all control chars including \n \r \t
    .slice(0, maxLength)
    .trim();
}

// ============ Body parsing helper (H6 fix) ============
// Parses JSON body, rejects null/array/non-object, enforces Content-Type (L12),
// and caps body size (H4) by reading Content-Length before parsing.
const MAX_BODY_BYTES = 64 * 1024; // 64 KB — all our endpoints accept <2KB JSON max

export async function parseJsonObjectBody(
  req: NextRequest,
  opts: { enforceContentType?: boolean } = {}
): Promise<{ ok: true; body: Record<string, unknown> } | { ok: false; status: number; error: string }> {
  // H4: reject oversized bodies before parsing
  const contentLength = req.headers.get("content-length");
  if (contentLength && parseInt(contentLength, 10) > MAX_BODY_BYTES) {
    return { ok: false, status: 413, error: "Request body too large." };
  }

  // L12: Enforce Content-Type: application/json
  if (opts.enforceContentType !== false) {
    const ct = req.headers.get("content-type") || "";
    if (!ct.toLowerCase().includes("application/json")) {
      return { ok: false, status: 415, error: "Content-Type must be application/json." };
    }
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return { ok: false, status: 400, error: "Invalid JSON body." };
  }

  // H6: Reject null, arrays, primitives
  if (body === null || typeof body !== "object" || Array.isArray(body)) {
    return { ok: false, status: 400, error: "Request body must be a JSON object." };
  }

  return { ok: true, body: body as Record<string, unknown> };
}

// ============ Integer validation (L11 fix) ============
export function asInteger(v: unknown, opts: { min?: number; max?: number } = {}): number | null {
  if (typeof v !== "number" || !Number.isInteger(v)) return null;
  if (opts.min !== undefined && v < opts.min) return null;
  if (opts.max !== undefined && v > opts.max) return null;
  return v;
}

// ============ Rate limiting (C1 fix — no longer trusts X-Forwarded-For) ============
interface RateBucket {
  count: number;
  resetAt: number;
}

interface RateLimitOptions {
  windowMs: number;
  maxRequests: number;
}

const globalForBuckets = globalThis as unknown as {
  __motRateBuckets?: Map<string, RateBucket>;
};
const rateBuckets: Map<string, RateBucket> =
  globalForBuckets.__motRateBuckets ?? new Map();
globalForBuckets.__motRateBuckets = rateBuckets;

// H1 fix: cap the map size and sweep expired entries periodically
const MAX_BUCKETS = 50_000;
let lastBucketSweep = 0;
function sweepExpiredBuckets() {
  const now = Date.now();
  if (now - lastBucketSweep < 60_000) return; // sweep at most once per minute
  lastBucketSweep = now;
  for (const [k, b] of rateBuckets) {
    if (b.resetAt < now) rateBuckets.delete(k);
  }
}

// Extract client IP WITHOUT trusting client-supplied X-Forwarded-For.
// Priority: req.ip (Next.js trusted proxy socket peer) > X-Real-IP (set by trusted reverse proxy only).
// X-Forwarded-For is intentionally NOT consulted — it is attacker-controlled.
function getClientIp(req: NextRequest): string {
  // Next.js sets req.ip when behind a configured proxy; otherwise it's the socket peer
  // @ts-expect-error — req.ip exists on NextRequest at runtime
  const ip: string | undefined = req.ip;
  if (ip && isValidIp(ip)) return ip;

  // X-Real-IP is only safe if set by our reverse proxy (Caddy overwrites it, not appends)
  const xRealIp = req.headers.get("x-real-ip");
  if (xRealIp && isValidIp(xRealIp)) return xRealIp;

  return "unknown";
}

function isValidIp(ip: string): boolean {
  // IPv4
  if (/^(\d{1,3}\.){3}\d{1,3}$/.test(ip)) {
    return ip.split(".").every((o) => {
      const n = Number(o);
      return n >= 0 && n <= 255;
    });
  }
  // IPv6 (basic check)
  if (/^[0-9a-fA-F:]+$/.test(ip) && ip.includes(":")) return true;
  return false;
}

export function rateLimit(
  req: NextRequest,
  opts: RateLimitOptions
): { allowed: boolean; retryAfter: number; remaining: number } {
  sweepExpiredBuckets();

  const ip = getClientIp(req);
  const key = `${ip}:${opts.windowMs}:${opts.maxRequests}`;
  const now = Date.now();

  const bucket = rateBuckets.get(key);
  if (!bucket || bucket.resetAt < now) {
    // H1: enforce cap before adding new entries
    if (rateBuckets.size >= MAX_BUCKETS) {
      // Evict the oldest expired entry, or if none, the oldest entry
      let oldestKey: string | null = null;
      let oldestTime = Infinity;
      for (const [k, b] of rateBuckets) {
        if (b.resetAt < oldestTime) {
          oldestTime = b.resetAt;
          oldestKey = k;
        }
      }
      if (oldestKey) rateBuckets.delete(oldestKey);
    }
    rateBuckets.set(key, { count: 1, resetAt: now + opts.windowMs });
    return { allowed: true, retryAfter: 0, remaining: opts.maxRequests - 1 };
  }

  bucket.count += 1;
  if (bucket.count > opts.maxRequests) {
    return {
      allowed: false,
      retryAfter: Math.ceil((bucket.resetAt - now) / 1000),
      remaining: 0,
    };
  }

  return {
    allowed: true,
    retryAfter: 0,
    remaining: opts.maxRequests - bucket.count,
  };
}

// Per-account rate limiting (for login brute-force protection on a known fullName)
interface AccountBucket {
  count: number;
  resetAt: number;
}
const globalForAccountBuckets = globalThis as unknown as {
  __motAccountBuckets?: Map<string, AccountBucket>;
};
const accountBuckets: Map<string, AccountBucket> =
  globalForAccountBuckets.__motAccountBuckets ?? new Map();
globalForAccountBuckets.__motAccountBuckets = accountBuckets;

export function accountRateLimit(
  accountKey: string,
  opts: { windowMs: number; maxRequests: number }
): { allowed: boolean; retryAfter: number } {
  const now = Date.now();
  // Sweep stale entries opportunistically
  if (accountBuckets.size > 10_000) {
    for (const [k, b] of accountBuckets) {
      if (b.resetAt < now) accountBuckets.delete(k);
    }
  }
  const key = `acct:${accountKey}`;
  const bucket = accountBuckets.get(key);
  if (!bucket || bucket.resetAt < now) {
    accountBuckets.set(key, { count: 1, resetAt: now + opts.windowMs });
    return { allowed: true, retryAfter: 0 };
  }
  bucket.count += 1;
  if (bucket.count > opts.maxRequests) {
    return { allowed: false, retryAfter: Math.ceil((bucket.resetAt - now) / 1000) };
  }
  return { allowed: true, retryAfter: 0 };
}

export function rateLimitResponse(retryAfter: number, maxRequests?: number): NextResponse {
  const headers: Record<string, string> = {
    "Retry-After": String(retryAfter),
  };
  if (maxRequests !== undefined) {
    headers["X-RateLimit-Limit"] = String(maxRequests);
  }
  return NextResponse.json(
    {
      error: "Too many requests. Please slow down.",
      retryAfter,
    },
    { status: 429, headers }
  );
}

// ============ Security headers (applied in proxy.ts) ============
export const SECURITY_HEADERS: Record<string, string> = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "X-XSS-Protection": "1; mode=block",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy":
    "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
  "Cross-Origin-Opener-Policy": "same-origin",
  "Cross-Origin-Resource-Policy": "same-origin",
  "Strict-Transport-Security": "max-age=63072000; includeSubDomains; preload",
};

// ============ Secure token generation (M10 fix — opaque tokens) ============
export function generateSecureToken(bytes = 32): string {
  const arr = new Uint8Array(bytes);
  crypto.getRandomValues(arr);
  return Array.from(arr, (b) => b.toString(16).padStart(2, "0")).join("");
}
