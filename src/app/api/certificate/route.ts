// Certificate generation endpoint
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getStudentFromRequest } from "../auth/route";
import { CHALLENGES } from "@/lib/challenges-data";

function genId(prefix: string, length = 8) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < length; i++) {
    out += chars[Math.floor(Math.random() * chars.length)];
  }
  return `${prefix}-${out}`;
}

function genVerificationNumber() {
  const part = () => Math.random().toString(36).slice(2, 8).toUpperCase();
  return `MOT-${part()}-${part()}-${part()}`;
}

export async function POST(req: NextRequest) {
  const student = await getStudentFromRequest(req);
  if (!student) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Verify all 20 challenges completed
  const results = await db.challengeResult.findMany({
    where: { studentId: student.id, completed: true },
  });

  const completedIds = new Set(results.map((r) => r.challengeId));
  const allCompleted = CHALLENGES.every((c) => completedIds.has(c.id));

  if (!allCompleted) {
    return NextResponse.json(
      {
        error: "All 20 challenges must be completed to generate a certificate.",
        completedCount: completedIds.size,
        totalCount: CHALLENGES.length,
      },
      { status: 400 }
    );
  }

  // Check for existing certificate
  let cert = await db.certificate.findFirst({
    where: { studentId: student.id },
  });

  if (!cert) {
    cert = await db.certificate.create({
      data: {
        studentId: student.id,
        certificateId: genId("MOT"),
        verificationNumber: genVerificationNumber(),
        studentName: student.fullName,
        completionPercent: 100,
      },
    });

    await db.activityLog.create({
      data: {
        studentId: student.id,
        action: "certificate_issued",
        detail: `Certificate ${cert.certificateId} issued`,
        xpDelta: 0,
      },
    });
  }

  return NextResponse.json({
    certificate: {
      id: cert.id,
      certificateId: cert.certificateId,
      verificationNumber: cert.verificationNumber,
      studentName: cert.studentName,
      issuedAt: cert.issuedAt,
      completionPercent: cert.completionPercent,
    },
  });
}

export async function GET(req: NextRequest) {
  const student = await getStudentFromRequest(req);
  if (!student) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const certs = await db.certificate.findMany({
    where: { studentId: student.id },
    orderBy: { issuedAt: "desc" },
  });
  return NextResponse.json({ certificates: certs });
}
