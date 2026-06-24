// Certificate verification endpoint (public)
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { rateLimit, rateLimitResponse } from "@/lib/security";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Rate limit: 30 verifications per minute per IP
  const rl = rateLimit(req, { windowMs: 60_000, maxRequests: 30 });
  if (!rl.allowed) {
    return rateLimitResponse(rl.retryAfter);
  }

  const { id: query } = await params;
  const decoded = decodeURIComponent(query).trim().slice(0, 200);

  if (!decoded) {
    return NextResponse.json({ valid: false, error: "No ID provided" });
  }

  const cert = await db.certificate.findFirst({
    where: {
      OR: [
        { certificateId: decoded },
        { verificationNumber: decoded },
        { studentName: { equals: decoded } },
      ],
    },
    include: { student: true },
  });

  if (!cert) {
    return NextResponse.json({
      valid: false,
      error: "No certificate found for that ID, verification number, or name.",
    });
  }

  return NextResponse.json({
    valid: true,
    certificate: {
      certificateId: cert.certificateId,
      verificationNumber: cert.verificationNumber,
      studentName: cert.studentName,
      issuedAt: cert.issuedAt,
      completionPercent: cert.completionPercent,
    },
  });
}
