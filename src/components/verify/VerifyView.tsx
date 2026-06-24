"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  ShieldCheck,
  Search,
  CheckCircle2,
  XCircle,
  Loader2,
  Award,
  Calendar,
  User,
  Hash,
  ExternalLink,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface VerifyResult {
  valid: boolean;
  error?: string;
  certificate?: {
    certificateId: string;
    verificationNumber: string;
    studentName: string;
    issuedAt: string;
    completionPercent: number;
  };
}

export function VerifyView() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VerifyResult | null>(null);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch(`/api/verify/${encodeURIComponent(query.trim())}`);
      const data: VerifyResult = await res.json();
      setResult(data);
    } catch {
      setResult({
        valid: false,
        error: "Failed to verify. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-8">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 text-center"
      >
        <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-400/15 border border-emerald-400/30 mb-4 pulse-glow-green">
          <ShieldCheck className="h-7 w-7 text-emerald-400" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white">
          Certificate <span className="cyber-gradient-text">Verification</span>
        </h1>
        <p className="mt-3 text-sm text-slate-400 max-w-xl mx-auto">
          Verify any MOT Hashcat Playground certificate by Certificate ID,
          Verification Number, or student Full Name. All certificates are
          globally verifiable.
        </p>
      </motion.div>

      <Card className="cyber-card p-6 mb-6">
        <form onSubmit={handleVerify} className="space-y-3">
          <div className="flex gap-2">
            <Input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter Certificate ID, Verification Number, or Full Name"
              className="bg-[#0B0F19] border-cyan-500/25 text-white font-mono focus:border-cyan-400"
              autoFocus
            />
            <Button
              type="submit"
              disabled={loading || !query.trim()}
              className="bg-gradient-to-r from-emerald-400 to-cyan-400 text-[#0B0F19] hover:from-emerald-300 hover:to-cyan-300 font-bold px-6"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Search className="h-4 w-4 mr-1.5" />
                  Verify
                </>
              )}
            </Button>
          </div>
          <div className="flex flex-wrap gap-2 text-[11px] text-slate-500">
            <span>Try:</span>
            {["MOT-ABCD1234", "MOT-XXXX-XXXX-XXXX", "Satoshi Nakamoto"].map((ex) => (
              <button
                key={ex}
                type="button"
                onClick={() => setQuery(ex)}
                className="px-2 py-0.5 rounded bg-white/5 hover:bg-cyan-500/15 text-slate-400 hover:text-cyan-300 transition font-mono"
              >
                {ex}
              </button>
            ))}
          </div>
        </form>
      </Card>

      {/* Result */}
      {result && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {result.valid && result.certificate ? (
            <Card className="cyber-card p-6 border-emerald-500/40 bg-emerald-500/5">
              <div className="flex items-center gap-3 mb-5">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-400/15 border border-emerald-400/40">
                  <CheckCircle2 className="h-7 w-7 text-emerald-400" />
                </div>
                <div>
                  <div className="text-lg font-bold text-emerald-300">
                    Certificate Verified
                  </div>
                  <div className="text-xs text-slate-400">
                    This certificate is authentic and globally valid.
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <DetailField
                  icon={User}
                  label="Recipient"
                  value={result.certificate.studentName}
                />
                <DetailField
                  icon={Calendar}
                  label="Issue Date"
                  value={new Date(result.certificate.issuedAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                />
                <DetailField
                  icon={Hash}
                  label="Certificate ID"
                  value={result.certificate.certificateId}
                  mono
                  color="#00E5FF"
                />
                <DetailField
                  icon={ShieldCheck}
                  label="Verification Number"
                  value={result.certificate.verificationNumber}
                  mono
                  color="#00FF88"
                />
              </div>

              <div className="mt-5 pt-5 border-t border-emerald-500/20">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs text-slate-400 mb-1">
                      Program
                    </div>
                    <div className="text-sm font-semibold text-white">
                      MOT Hashcat Playground Certification
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Completion: {result.certificate.completionPercent.toFixed(0)}%
                    </div>
                  </div>
                  <Badge className="bg-emerald-400/15 text-emerald-300 border-emerald-400/30">
                    <Award className="h-3 w-3 mr-1" />
                    Authentic
                  </Badge>
                </div>
              </div>
            </Card>
          ) : (
            <Card className="cyber-card p-6 border-rose-500/40 bg-rose-500/5">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-400/15 border border-rose-400/40">
                  <XCircle className="h-7 w-7 text-rose-400" />
                </div>
                <div>
                  <div className="text-lg font-bold text-rose-300">
                    Not Found
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    {result.error ||
                      "No certificate matches the provided query. Please check the ID or name and try again."}
                  </div>
                </div>
              </div>
            </Card>
          )}
        </motion.div>
      )}

      {/* Info section */}
      <Card className="cyber-card p-6 mt-6">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-cyan-400" />
          About Verification
        </h3>
        <div className="space-y-3 text-xs text-slate-400 leading-relaxed">
          <p>
            Every MOT Hashcat Playground certificate is issued with a unique
            Certificate ID (e.g., <span className="font-mono text-cyan-300">MOT-ABCD1234</span>) and a
            Verification Number (e.g., <span className="font-mono text-emerald-300">MOT-XXXXXX-XXXXXX-XXXXXX</span>).
          </p>
          <p>
            Employers, recruiters, and educational institutions can verify any
            certificate instantly using any of the three supported query types.
            The verification is performed against the official MOT Hashcat
            Playground certificate registry.
          </p>
          <p>
            Certificates are issued only to students who have successfully
            completed all 20 challenges across the four modules: MD5, SHA1,
            SHA2-256, and simulated wallet.dat recovery.
          </p>
        </div>
      </Card>
    </div>
  );
}

function DetailField({
  icon: Icon,
  label,
  value,
  mono,
  color = "#FFFFFF",
}: {
  icon: any;
  label: string;
  value: string;
  mono?: boolean;
  color?: string;
}) {
  return (
    <div className="rounded-lg bg-[#0B0F19] border border-cyan-500/15 p-3">
      <div className="flex items-center gap-1.5 text-[10px] text-slate-500 uppercase tracking-wider mb-1">
        <Icon className="h-3 w-3" />
        {label}
      </div>
      <div
        className={`text-sm font-semibold ${mono ? "font-mono" : ""}`}
        style={{ color }}
      >
        {value}
      </div>
    </div>
  );
}
