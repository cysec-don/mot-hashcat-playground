// Certificate verification endpoint (public) — hardened post-pentest
// H9: Removed studentName lookup — only certificateId and verificationNumber accepted.
// This prevents certificate enumeration via the public leaderboard.
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { rateLimit, rateLimitResponse } from "@/lib/security";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const rl = rateLimit(req, { windowMs: 60_000, maxRequests: 30 });
  if (!rl.allowed) return rateLimitResponse(rl.retryAfter, 30);

  const { id: query } = await params;

  // M8: Next.js already URL-decodes params.id. Do NOT call decodeURIComponent again
  // (it would throw URIError on values containing stray %). Just trim + cap length.
  const decoded = (typeof query === "string" ? query : "").trim().slice(0, 200);

  if (!decoded) {
    return NextResponse.json({ valid: false, error: "No ID provided" });
  }

  // H9: Only allow lookup by certificateId or verificationNumber (NOT studentName)
  const cert = await db.certificate.findFirst({
    where: {
      OR: [
        { certificateId: decoded },
        { verificationNumber: decoded },
      ],
    },
  });

  if (!cert) {
    return NextResponse.json({
      valid: false,
      error: "No certificate found for that ID or verification number.",
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
