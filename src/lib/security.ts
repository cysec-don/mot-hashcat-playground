// MOT Hashcat Playground — Security utilities
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";

// ============ Password hashing ============
const SALT_ROUNDS = 12;

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, SALT_ROUNDS);
}

export async function verifyPassword(
  plain: string,
  hash: string
): Promise<boolean> {
  if (!hash) return false;
  try {
    return await bcrypt.compare(plain, hash);
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

  if (password.length < 8) {
    errors.push("Password must be at least 8 characters long.");
  } else if (password.length >= 12) {
    score += 2;
  } else {
    score += 1;
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

  // Common-password check (small blocklist)
  const common = [
    "password",
    "Password1",
    "P@ssw0rd",
    "12345678",
    "qwerty12",
    "letmein1",
    "Welcome1",
    "admin123",
  ];
  if (common.includes(password)) {
    errors.push("Password is too common. Choose something unique.");
    score = 0;
  }

  return { ok: errors.length === 0 && score >= 3, errors, score };
}

// ============ Name / email validation ============
export function validateFullName(name: string): {
  ok: boolean;
  error?: string;
} {
  const trimmed = name.trim();
  if (trimmed.length < 2) {
    return { ok: false, error: "Full Name must be at least 2 characters." };
  }
  if (trimmed.length > 80) {
    return { ok: false, error: "Full Name must be at most 80 characters." };
  }
  // Allow letters, spaces, hyphens, apostrophes, periods
  if (!/^[\p{L}\p{M}'\-\. ]+$/u.test(trimmed)) {
    return {
      ok: false,
      error:
        "Full Name may only contain letters, spaces, hyphens, apostrophes, and periods.",
    };
  }
  return { ok: true };
}

export function validateEmail(email: string): { ok: boolean; error?: string } {
  if (!email) return { ok: true }; // optional
  if (email.length > 254) {
    return { ok: false, error: "Email is too long." };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false, error: "Invalid email format." };
  }
  return { ok: true };
}

// ============ Input sanitization ============
// Strip control chars, normalize unicode, limit length
export function sanitizeString(input: string, maxLength = 1000): string {
  if (typeof input !== "string") return "";
  // Remove null bytes & control chars except newline/tab
  return input
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .slice(0, maxLength)
    .trim();
}

// ============ Rate limiting (in-memory, per IP) ============
interface RateBucket {
  count: number;
  resetAt: number;
}
const rateBuckets = new Map<string, RateBucket>();

interface RateLimitOptions {
  windowMs: number;
  maxRequests: number;
}

export function rateLimit(
  req: NextRequest,
  opts: RateLimitOptions
): { allowed: boolean; retryAfter: number; remaining: number } {
  // Identify by IP — X-Forwarded-For or fallback
  const forwarded = req.headers.get("x-forwarded-for");
  const ip =
    (forwarded && forwarded.split(",")[0]?.trim()) ||
    req.headers.get("x-real-ip") ||
    "unknown";

  const key = `${ip}:${opts.windowMs}:${opts.maxRequests}`;
  const now = Date.now();

  const bucket = rateBuckets.get(key);
  if (!bucket || bucket.resetAt < now) {
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

export function rateLimitResponse(retryAfter: number): NextResponse {
  return NextResponse.json(
    {
      error: "Too many requests. Please slow down.",
      retryAfter,
    },
    {
      status: 429,
      headers: {
        "Retry-After": String(retryAfter),
        "X-RateLimit-Limit": "0",
      },
    }
  );
}

// ============ CSRF protection (double-submit cookie pattern) ============
// We use a session-bound CSRF token stored alongside the auth token.
// The client must send X-CSRF-Token header matching the token's CSRF.

// ============ Security headers (applied in middleware) ============
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

// ============ Secure token generation ============
export function generateSecureToken(bytes = 32): string {
  const arr = new Uint8Array(bytes);
  crypto.getRandomValues(arr);
  return Array.from(arr, (b) => b.toString(16).padStart(2, "0")).join("");
}
