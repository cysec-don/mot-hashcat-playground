// Premium PDF Certificate generator using jsPDF
import jsPDF from "jspdf";

export interface CertificateData {
  fullName: string;
  certificateId: string;
  verificationNumber: string;
  issuedAt: Date;
  completionPercent: number;
}

export async function generateCertificatePDF(data: CertificateData): Promise<void> {
  // Landscape Letter size: 11" x 8.5" = 792 x 612 pt
  const pdf = new jsPDF({
    orientation: "landscape",
    unit: "pt",
    format: [792, 612],
  });

  const W = 792;
  const H = 612;

  // ============ Background ============
  // Deep navy gradient simulation with rectangles
  pdf.setFillColor(10, 13, 26);
  pdf.rect(0, 0, W, H, "F");
  // Subtle vignette
  for (let i = 0; i < 30; i++) {
    pdf.setFillColor(17, 24, 39);
    pdf.setDrawColor(0, 0, 0);
    const inset = i * 2;
    pdf.rect(inset, inset, W - 2 * inset, H - 2 * inset, "F");
  }
  pdf.setFillColor(11, 15, 25);
  pdf.rect(20, 20, W - 40, H - 40, "F");

  // ============ Binary watermark pattern ============
  pdf.setFontSize(7);
  pdf.setTextColor(201, 168, 92);
  pdf.setFont("courier", "normal");
  for (let row = 0; row < 30; row++) {
    for (let col = 0; col < 90; col++) {
      if (Math.random() > 0.85) {
        const x = 30 + col * 8;
        const y = 35 + row * 18;
        if (x < W - 30 && y < H - 30) {
          pdf.setTextColor(201, 168, 92, 8);
          pdf.text(Math.random() > 0.5 ? "1" : "0", x, y);
        }
      }
    }
  }

  // ============ MOT Watermark (large, centered, rotated) ============
  pdf.saveGraphicsState();
  pdf.setTextColor(201, 168, 92);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(180);
  // We don't have setGState opacity in jspdf without plugins; use very light color
  pdf.setTextColor(201, 168, 92);
  // Approximate opacity by using a dim color
  pdf.setTextColor(28, 24, 18);
  // Rotate
  const cx = W / 2;
  const cy = H / 2;
  const angle = -25 * Math.PI / 180;
  pdf.text("MOT", cx - 120, cy + 40, { angle: angle });
  pdf.restoreGraphicsState();

  // ============ Outer Gold Border ============
  pdf.setDrawColor(201, 168, 92);
  pdf.setLineWidth(8);
  pdf.rect(20, 20, W - 40, H - 40);

  // Inner thin gold border
  pdf.setLineWidth(1);
  pdf.rect(32, 32, W - 64, H - 64);

  // Innermost thin gold border
  pdf.setLineWidth(0.5);
  pdf.rect(40, 40, W - 80, H - 80);

  // ============ Corner ornaments ============
  pdf.setDrawColor(201, 168, 92);
  pdf.setLineWidth(1);
  const cornerSize = 18;
  const corners = [
    [50, 50],
    [W - 50 - cornerSize, 50],
    [50, H - 50 - cornerSize],
    [W - 50 - cornerSize, H - 50 - cornerSize],
  ];
  corners.forEach(([x, y]) => {
    pdf.rect(x, y, cornerSize, cornerSize);
    pdf.line(x + 3, y + 3, x + cornerSize - 3, y + cornerSize - 3);
    pdf.line(x + cornerSize - 3, y + 3, x + 3, y + cornerSize - 3);
  });

  // ============ Top ribbon ============
  pdf.setFillColor(201, 168, 92);
  pdf.rect(W / 2 - 90, 55, 180, 22, "F");
  pdf.setTextColor(11, 15, 25);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(10);
  pdf.text("CERTIFIED", W / 2, 70, { align: "center" });

  // ============ Header — Crest + Org Name ============
  // Crest circle
  pdf.setDrawColor(201, 168, 92);
  pdf.setLineWidth(2);
  pdf.setFillColor(20, 25, 40);
  pdf.circle(W / 2, 115, 22, "FD");
  // Inner shield pattern
  pdf.setLineWidth(1);
  pdf.line(W / 2 - 10, 100, W / 2 - 10, 130);
  pdf.line(W / 2 + 10, 100, W / 2 + 10, 130);
  pdf.line(W / 2 - 10, 100, W / 2 + 10, 100);
  pdf.line(W / 2 - 10, 130, W / 2, 138);
  pdf.line(W / 2 + 10, 130, W / 2, 138);

  pdf.setTextColor(201, 168, 92);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(9);
  pdf.text("MOT HASHCAT PLAYGROUND", W / 2, 155, { align: "center" });

  // ============ Title ============
  pdf.setTextColor(220, 220, 220);
  pdf.setFont("helvetica", "light");
  pdf.setFontSize(22);
  pdf.text("Certificate of Completion", W / 2, 195, { align: "center" });

  // Decorative line
  pdf.setDrawColor(201, 168, 92);
  pdf.setLineWidth(0.5);
  pdf.line(W / 2 - 120, 205, W / 2 + 120, 205);

  // ============ "This certifies that" ============
  pdf.setTextColor(150, 160, 175);
  pdf.setFont("helvetica", "italic");
  pdf.setFontSize(11);
  pdf.text("This certifies that", W / 2, 235, { align: "center" });

  // ============ Full Name ============
  pdf.setTextColor(255, 255, 255);
  pdf.setFont("times", "bold");
  pdf.setFontSize(38);
  // Limit name width
  const nameText = data.fullName.length > 40 ? data.fullName.slice(0, 38) + "..." : data.fullName;
  pdf.text(nameText, W / 2, 285, { align: "center" });

  // Underline
  const nameWidth = pdf.getTextWidth(nameText);
  pdf.setDrawColor(201, 168, 92);
  pdf.setLineWidth(1);
  pdf.line(W / 2 - nameWidth / 2 - 10, 295, W / 2 + nameWidth / 2 + 10, 295);

  // ============ Certification statement ============
  pdf.setTextColor(180, 190, 205);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(10);
  const statement =
    "has successfully completed the MOT Hashcat Playground Certification Program and demonstrated practical competency in password recovery methodologies, Hashcat operations, MD5, SHA1, SHA2-256 analysis, and simulated cryptocurrency wallet recovery exercises.";
  const splitStatement = pdf.splitTextToSize(statement, 540);
  pdf.text(splitStatement, W / 2, 320, { align: "center" });

  // ============ Bottom row — signatures + seal ============
  const bottomY = 510;

  // Left signature - Program Director
  pdf.setDrawColor(201, 168, 92);
  pdf.setLineWidth(0.5);
  pdf.line(90, bottomY, 240, bottomY);
  pdf.setTextColor(201, 168, 92);
  pdf.setFont("times", "italic");
  pdf.setFontSize(11);
  pdf.text("Program Director", 165, bottomY + 15, { align: "center" });
  pdf.setTextColor(150, 160, 175);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(8);
  pdf.text("MOT Hashcat Playground", 165, bottomY + 27, { align: "center" });

  // Center seal
  const sealX = W / 2;
  const sealY = bottomY + 5;
  pdf.setDrawColor(201, 168, 92);
  pdf.setLineWidth(1.5);
  pdf.setFillColor(15, 20, 35);
  pdf.circle(sealX, sealY, 32, "FD");
  pdf.circle(sealX, sealY, 26, "S");
  // Star/seal icon
  pdf.setFillColor(201, 168, 92);
  // Draw a 5-pointed star manually
  drawStar(pdf, sealX, sealY, 14);
  pdf.setTextColor(201, 168, 92);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(6);
  pdf.text("OFFICIAL SEAL", sealX, sealY + 22, { align: "center" });
  pdf.text("MOT · HASHCAT · PLAYGROUND", sealX, sealY - 22, { align: "center" });

  // Right signature - Certificate ID
  pdf.setDrawColor(201, 168, 92);
  pdf.setLineWidth(0.5);
  pdf.line(W - 240, bottomY, W - 90, bottomY);
  pdf.setTextColor(201, 168, 92);
  pdf.setFont("times", "italic");
  pdf.setFontSize(11);
  pdf.text("Certificate ID", W - 165, bottomY + 15, { align: "center" });
  pdf.setTextColor(0, 229, 255);
  pdf.setFont("courier", "bold");
  pdf.setFontSize(10);
  pdf.text(data.certificateId, W - 165, bottomY + 28, { align: "center" });
  pdf.setTextColor(120, 130, 145);
  pdf.setFontSize(7);
  pdf.text(data.verificationNumber, W - 165, bottomY + 38, { align: "center" });

  // ============ Footer — Date + verification URL ============
  pdf.setTextColor(120, 130, 145);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(8);
  const dateStr = data.issuedAt.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  pdf.text(
    `Issued on ${dateStr} · Completion: ${data.completionPercent.toFixed(0)}%`,
    W / 2,
    H - 55,
    { align: "center" }
  );
  pdf.text(
    "Verify at: mot-hashcat-playground/verify · This certificate is globally verifiable.",
    W / 2,
    H - 45,
    { align: "center" }
  );

  // ============ Security pattern overlay (subtle) ============
  pdf.setDrawColor(201, 168, 92);
  pdf.setLineWidth(0.2);
  for (let i = 0; i < 20; i++) {
    const y = 60 + i * 25;
    if (y > H - 60) break;
    pdf.line(60, y, W - 60, y);
  }

  // ============ Save ============
  const safeName = data.fullName.replace(/[^a-zA-Z0-9]/g, "_");
  pdf.save(`MOT_Hashcat_Certificate_${safeName}_${data.certificateId}.pdf`);
}

function drawStar(pdf: jsPDF, cx: number, cy: number, r: number) {
  const points: [number, number][] = [];
  for (let i = 0; i < 10; i++) {
    const angle = (Math.PI / 5) * i - Math.PI / 2;
    const radius = i % 2 === 0 ? r : r * 0.4;
    points.push([cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius]);
  }
  // Draw filled star
  pdf.lines(
    points.slice(1).map(([x, y]) => ({ x: x - points[0][0], y: y - points[0][1] })),
    points[0][0],
    points[0][1],
    [1, 1],
    "F",
    true
  );
}
