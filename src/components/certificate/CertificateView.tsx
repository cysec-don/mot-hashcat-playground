"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Award,
  Download,
  Lock,
  Trophy,
  ShieldCheck,
  Loader2,
  CheckCircle2,
  ExternalLink,
  Copy,
  Sparkles,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useSession, useApp } from "@/lib/store";
import { useDashboardData } from "@/hooks/useDashboardData";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { generateCertificatePDF } from "@/lib/certificate-pdf";
import { apiFetch } from "@/lib/api-client";

export function CertificateView() {
  const { student } = useSession();
  const { setView } = useApp();
  const { data, loading } = useDashboardData();
  const [generating, setGenerating] = useState(false);
  const [downloading, setDownloading] = useState(false);

  if (loading || !data) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-8">
        <Skeleton className="h-10 w-72 mb-6 bg-cyan-500/10" />
        <Skeleton className="h-[500px] bg-cyan-500/10" />
      </div>
    );
  }

  const { stats, certificates } = data;
  const completedCount = stats.completedCount;

  const handleGenerate = async () => {
    if (!student) return;

    setGenerating(true);
    try {
      const res = await apiFetch("/api/certificate", {
        method: "POST",
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Failed to generate certificate");
      }
      toast.success("Certificate issued successfully!");
      // Refresh dashboard data instead of full reload
      setTimeout(() => window.location.reload(), 800);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Generation failed";
      toast.error(msg);
    } finally {
      setGenerating(false);
    }
  };

  const handleDownload = async () => {
    if (!certificates[0]) return;
    setDownloading(true);
    try {
      await generateCertificatePDF({
        fullName: certificates[0].studentName,
        certificateId: certificates[0].certificateId,
        verificationNumber: certificates[0].verificationNumber,
        issuedAt: new Date(certificates[0].issuedAt),
        completionPercent: certificates[0].completionPercent,
      });
      toast.success("Certificate PDF downloaded");
    } catch (e) {
      toast.error("Failed to generate PDF");
    } finally {
      setDownloading(false);
    }
  };

  // Locked state
  if (completedCount < 20) {
    return (
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-2 text-xs text-amber-400 mb-2">
            <Award className="h-3.5 w-3.5" />
            <span className="uppercase tracking-wider">Certification</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white">
            Your <span className="cyber-gradient-text">Certificate</span>
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            Complete all 20 challenges to unlock your premium PDF certificate.
          </p>
        </motion.div>

        <Card className="cyber-card p-8 sm:p-12 text-center">
          <div className="inline-flex h-20 w-20 items-center justify-center rounded-2xl bg-amber-400/10 border border-amber-400/30 mb-6">
            <Lock className="h-10 w-10 text-amber-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">
            Certificate Locked
          </h2>
          <p className="text-sm text-slate-400 max-w-md mx-auto">
            Complete all 20 challenges across the 4 modules to unlock your
            premium PDF certificate. You&rsquo;re <span className="text-amber-300 font-bold">{20 - completedCount}</span> challenge{20 - completedCount === 1 ? "" : "s"} away.
          </p>

          <div className="mt-6 max-w-md mx-auto">
            <div className="flex justify-between text-xs text-slate-400 mb-2">
              <span>{completedCount}/20 completed</span>
              <span>{stats.completionPercent.toFixed(0)}%</span>
            </div>
            <div className="h-3 rounded-full bg-[#0B0F19] border border-cyan-500/15 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-400 to-emerald-400 transition-all"
                style={{ width: `${stats.completionPercent}%` }}
              />
            </div>
          </div>

          <Button
            onClick={() => setView("challenges")}
            className="mt-6 bg-gradient-to-r from-cyan-400 to-emerald-400 text-[#0B0F19] hover:from-cyan-300 hover:to-emerald-300 font-bold"
          >
            <Trophy className="h-4 w-4 mr-2" />
            Continue Challenges
          </Button>
        </Card>
      </div>
    );
  }

  // No certificate yet — show generate CTA
  if (certificates.length === 0) {
    return (
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-2 text-xs text-amber-400 mb-2">
            <Award className="h-3.5 w-3.5" />
            <span className="uppercase tracking-wider">Certification</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white">
            Your <span className="cyber-gradient-text">Certificate</span>
          </h1>
        </motion.div>

        <Card className="cyber-card p-8 sm:p-12 text-center border-amber-500/40 bg-gradient-to-br from-amber-500/10 to-transparent">
          <Trophy className="h-16 w-16 text-amber-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">
            All 20 Challenges Complete!
          </h2>
          <p className="text-sm text-slate-300 max-w-md mx-auto">
            You&rsquo;ve mastered MD5, SHA1, SHA2-256, and simulated wallet.dat
            recovery. Claim your premium certificate now.
          </p>
          <Button
            onClick={handleGenerate}
            disabled={generating}
            className="mt-6 bg-gradient-to-r from-amber-500 to-yellow-400 text-[#0B0F19] hover:from-amber-400 hover:to-yellow-300 font-bold text-base h-12 px-8 pulse-glow"
          >
            {generating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Issuing Certificate...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Claim Your Certificate
              </>
            )}
          </Button>
        </Card>
      </div>
    );
  }

  // Certificate display
  const cert = certificates[0];
  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-2 text-xs text-amber-400 mb-2">
          <Award className="h-3.5 w-3.5" />
          <span className="uppercase tracking-wider">Certification</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white">
          Your <span className="cyber-gradient-text">Certificate</span>
        </h1>
        <p className="mt-2 text-sm text-slate-400">
          Premium PDF certificate · Globally verifiable · Frame-worthy.
        </p>
      </motion.div>

      {/* Certificate preview */}
      <CertificatePreview
        fullName={cert.studentName}
        certificateId={cert.certificateId}
        verificationNumber={cert.verificationNumber}
        issuedAt={new Date(cert.issuedAt)}
      />

      {/* Actions */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="cyber-card p-5">
          <div className="flex items-center gap-3 mb-3">
            <Download className="h-5 w-5 text-cyan-400" />
            <div>
              <div className="text-sm font-bold text-white">Download PDF</div>
              <div className="text-[11px] text-slate-500">
                Premium certificate · Landscape · Print-ready
              </div>
            </div>
          </div>
          <Button
            onClick={handleDownload}
            disabled={downloading}
            className="w-full bg-gradient-to-r from-cyan-400 to-emerald-400 text-[#0B0F19] hover:from-cyan-300 hover:to-emerald-300 font-bold"
          >
            {downloading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating PDF...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Download Certificate
              </>
            )}
          </Button>
        </Card>

        <Card className="cyber-card p-5">
          <div className="flex items-center gap-3 mb-3">
            <ShieldCheck className="h-5 w-5 text-emerald-400" />
            <div>
              <div className="text-sm font-bold text-white">Verification</div>
              <div className="text-[11px] text-slate-500">
                Globally verifiable · Share with employers
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between rounded-md bg-[#0B0F19] border border-cyan-500/15 px-3 py-2">
              <div className="min-w-0">
                <div className="text-[10px] text-slate-500 uppercase tracking-wider">
                  Certificate ID
                </div>
                <div className="text-xs font-mono text-cyan-300 truncate">
                  {cert.certificateId}
                </div>
              </div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(cert.certificateId);
                  toast.success("Copied");
                }}
                className="text-slate-500 hover:text-cyan-300 transition shrink-0 ml-2"
              >
                <Copy className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="flex items-center justify-between rounded-md bg-[#0B0F19] border border-cyan-500/15 px-3 py-2">
              <div className="min-w-0">
                <div className="text-[10px] text-slate-500 uppercase tracking-wider">
                  Verification #
                </div>
                <div className="text-xs font-mono text-emerald-300 truncate">
                  {cert.verificationNumber}
                </div>
              </div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(cert.verificationNumber);
                  toast.success("Copied");
                }}
                className="text-slate-500 hover:text-cyan-300 transition shrink-0 ml-2"
              >
                <Copy className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
          <Button
            onClick={() => setView("verify")}
            variant="outline"
            className="w-full mt-3 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/10"
          >
            <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
            Open Verification Portal
          </Button>
        </Card>
      </div>

      {/* Certificate details */}
      <Card className="cyber-card p-6 mt-6">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          Certificate Details
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <DetailRow label="Recipient" value={cert.studentName} />
          <DetailRow label="Issue Date" value={new Date(cert.issuedAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })} />
          <DetailRow label="Completion" value={`${cert.completionPercent.toFixed(0)}%`} />
          <DetailRow label="Program" value="MOT Hashcat Playground Certification" />
          <DetailRow label="Modules Completed" value="4 / 4" />
          <DetailRow label="Challenges Completed" value="20 / 20" />
        </div>
      </Card>
    </div>
  );
}

function CertificatePreview({
  fullName,
  certificateId,
  verificationNumber,
  issuedAt,
}: {
  fullName: string;
  certificateId: string;
  verificationNumber: string;
  issuedAt: Date;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative w-full overflow-hidden rounded-lg"
      style={{
        aspectRatio: "1.414 / 1",
        background: "linear-gradient(135deg, #0a0d1a 0%, #111827 100%)",
        border: "10px solid #C9A85C",
        boxShadow:
          "0 0 0 1px rgba(201,168,92,0.3), 0 0 80px rgba(201,168,92,0.2), inset 0 0 0 2px rgba(201,168,92,0.25)",
      }}
    >
      {/* Inner border */}
      <div
        className="absolute inset-3 rounded"
        style={{ border: "2px solid rgba(201,168,92,0.5)" }}
      />
      {/* Corner ornaments */}
      {[
        "top-4 left-4",
        "top-4 right-4",
        "bottom-4 left-4",
        "bottom-4 right-4",
      ].map((pos) => (
        <div
          key={pos}
          className={`absolute ${pos} text-amber-400/70 text-xl`}
        >
          ❖
        </div>
      ))}
      {/* Ribbon top */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 translate-y-[-30%] z-10">
        <div className="bg-gradient-to-r from-amber-600 via-yellow-400 to-amber-600 text-[#0B0F19] text-[10px] font-bold px-6 py-1 tracking-widest uppercase">
          Certified
        </div>
      </div>

      {/* Binary background */}
      <div
        className="absolute inset-0 opacity-[0.05] flex flex-wrap content-start font-mono text-amber-200 text-[8px] leading-none p-8 pointer-events-none select-none"
      >
        {Array.from({ length: 250 })
          .map(() =>
            Array.from({ length: 40 })
              .map(() => (Math.random() > 0.5 ? "1" : "0"))
              .join("")
          )
          .map((s, i) => (
            <div key={i} className="mr-2">
              {s}
            </div>
          ))}
      </div>

      {/* Watermark */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.04]">
        <div className="text-amber-300 text-[180px] font-bold tracking-widest rotate-[-25deg]">
          MOT
        </div>
      </div>

      {/* Content */}
      <div className="relative h-full flex flex-col items-center justify-center text-center px-[6%] py-[5%]">
        <div className="mb-4 flex flex-col items-center">
          <ShieldCheck className="h-14 w-14 text-amber-400 mb-1" />
          <div className="text-[11px] tracking-[0.3em] text-amber-300/80 uppercase">
            MOT Hashcat Playground
          </div>
        </div>

        <div className="text-[1.6vw] font-light text-slate-300 tracking-[0.4em] uppercase">
          Certificate of Completion
        </div>

        <div className="mt-3 text-[1vw] text-slate-400 italic">
          This certifies that
        </div>
        <div
          className="mt-2 text-[3vw] font-bold text-white px-4"
          style={{
            fontFamily: "Georgia, serif",
            textShadow: "0 0 25px rgba(201,168,92,0.5)",
          }}
        >
          {fullName}
        </div>

        <div className="mt-3 text-[0.9vw] text-slate-400 max-w-[80%] leading-relaxed">
          has successfully completed the MOT Hashcat Playground Certification
          Program and demonstrated practical competency in password recovery
          methodologies, Hashcat operations, MD5, SHA1, SHA2-256 analysis, and
          simulated cryptocurrency wallet recovery exercises.
        </div>

        {/* Bottom row */}
        <div className="absolute bottom-[8%] left-0 right-0 flex justify-between items-end px-[10%]">
          <div className="text-left">
            <div
              className="text-[1vw] italic text-amber-300"
              style={{ fontFamily: "Georgia, serif" }}
            >
              Program Director
            </div>
            <div className="mt-1 h-[1px] w-32 bg-amber-400/50" />
            <div className="mt-1 text-[0.75vw] text-slate-500">
              Issued {issuedAt.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
            </div>
          </div>

          <div className="flex flex-col items-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-amber-400/60 text-amber-400">
              <Award className="h-8 w-8" />
            </div>
            <div className="mt-1 text-[0.65vw] tracking-widest text-amber-300/70 uppercase">
              Official Seal
            </div>
          </div>

          <div className="text-right">
            <div
              className="text-[1vw] italic text-amber-300"
              style={{ fontFamily: "Georgia, serif" }}
            >
              Certificate ID
            </div>
            <div className="mt-1 h-[1px] w-32 bg-amber-400/50 ml-auto" />
            <div className="mt-1 text-[0.75vw] text-cyan-300 font-mono">
              {certificateId}
            </div>
            <div className="text-[0.65vw] text-slate-500 font-mono mt-0.5">
              {verificationNumber}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-[#0B0F19] border border-cyan-500/15 p-3">
      <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">
        {label}
      </div>
      <div className="text-sm font-semibold text-white">{value}</div>
    </div>
  );
}
