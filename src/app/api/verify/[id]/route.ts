// Certificate verification endpoint
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: query } = await params;
  const decoded = decodeURIComponent(query).trim();

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
