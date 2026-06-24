// MOT Hashcat Playground — Auth + Student API
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// Use globalThis to survive hot reloads during dev
const globalForTokens = globalThis as unknown as {
  __motTokens?: Map<string, string>;
};
export const TOKENS = globalForTokens.__motTokens ?? new Map<string, string>();
globalForTokens.__motTokens = TOKENS;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { fullName, email } = body;

    if (!fullName || typeof fullName !== "string" || fullName.trim().length < 2) {
      return NextResponse.json(
        { error: "Full Name is required (minimum 2 characters)." },
        { status: 400 }
      );
    }

    const cleanName = fullName.trim();
    const cleanEmail = email && typeof email === "string" ? email.trim() : null;

    let student = await db.student.findUnique({
      where: { fullName: cleanName },
    });

    if (!student) {
      const studentCount = await db.student.count();
      student = await db.student.create({
        data: {
          fullName: cleanName,
          email: cleanEmail,
          isAdmin: studentCount === 0,
        },
      });
    } else {
      if (cleanEmail && student.email !== cleanEmail) {
        student = await db.student.update({
          where: { id: student.id },
          data: { email: cleanEmail, lastActiveAt: new Date() },
        });
      } else {
        student = await db.student.update({
          where: { id: student.id },
          data: { lastActiveAt: new Date() },
        });
      }
    }

    const token = `mot_${student.id}_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
    TOKENS.set(token, student.id);

    return NextResponse.json({
      token,
      student: {
        id: student.id,
        fullName: student.fullName,
        email: student.email,
        xp: student.xp,
        rank: student.rank,
        isAdmin: student.isAdmin,
        createdAt: student.createdAt,
      },
    });
  } catch (e) {
    console.error("Auth error:", e);
    return NextResponse.json(
      { error: "Authentication failed. Please try again." },
      { status: 500 }
    );
  }
}

export function verifyToken(token: string): string | null {
  return TOKENS.get(token) ?? null;
}

export async function getStudentFromRequest(req: NextRequest) {
  const auth = req.headers.get("authorization") || "";
  const token = auth.replace(/^Bearer\s+/i, "");
  if (!token) return null;
  const studentId = verifyToken(token);
  if (!studentId) return null;
  return await db.student.findUnique({ where: { id: studentId } });
}
