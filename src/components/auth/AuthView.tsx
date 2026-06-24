"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useApp, useSession, type SessionStudent } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Terminal,
  User,
  Mail,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Lock,
  Sparkles,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";

export function AuthView() {
  const { setView } = useApp();
  const { setStudent } = useSession();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (fullName.trim().length < 2) {
      setError("Full Name must be at least 2 characters.");
      return;
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: fullName.trim(),
          email: email.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Authentication failed.");
      }
      const student: SessionStudent = {
        id: data.student.id,
        fullName: data.student.fullName,
        email: data.student.email,
        xp: data.student.xp,
        rank: data.student.rank,
        isAdmin: data.student.isAdmin,
        createdAt: data.student.createdAt,
      };
      setStudent(student);
      localStorage.setItem("mot-token", data.token);
      toast.success(`Welcome aboard, ${student.fullName}!`);
      setView("dashboard");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Authentication failed.";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <button
          onClick={() => setView("landing")}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-cyan-300 mb-6 transition"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to home
        </button>

        <div className="cyber-card rounded-2xl p-8 scanline">
          <div className="text-center mb-6">
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-xl bg-cyan-400/15 border border-cyan-400/30 mb-4 pulse-glow">
              <Terminal className="h-7 w-7 text-cyan-400" />
            </div>
            <h1 className="text-2xl font-bold text-white">
              Enter the <span className="cyber-gradient-text">Playground</span>
            </h1>
            <p className="mt-2 text-sm text-slate-400">
              Sign in with your Full Name to begin your Hashcat journey.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-xs text-slate-300 font-medium">
                Full Name <span className="text-rose-400">*</span>
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <Input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Satoshi Nakamoto"
                  className="pl-10 bg-[#0B0F19] border-cyan-500/25 text-white placeholder:text-slate-600 focus:border-cyan-400"
                  required
                  autoFocus
                />
              </div>
              <p className="text-[11px] text-slate-500">
                This exact name will appear on your certificate and leaderboard entry.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs text-slate-300 font-medium">
                Email <span className="text-slate-500">(optional)</span>
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="pl-10 bg-[#0B0F19] border-cyan-500/25 text-white placeholder:text-slate-600 focus:border-cyan-400"
                />
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-2 rounded-md bg-rose-500/10 border border-rose-500/30 px-3 py-2 text-xs text-rose-300">
                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-cyan-400 to-emerald-400 text-[#0B0F19] hover:from-cyan-300 hover:to-emerald-300 font-bold h-11"
            >
              {loading ? (
                <>
                  <Sparkles className="h-4 w-4 mr-2 animate-spin" />
                  Authenticating...
                </>
              ) : (
                <>
                  Enter Playground
                  <ArrowRight className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-cyan-500/10 space-y-2">
            <div className="flex items-center gap-2 text-[11px] text-slate-400">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
              No passwords. No usernames. Just your Full Name.
            </div>
            <div className="flex items-center gap-2 text-[11px] text-slate-400">
              <Lock className="h-3.5 w-3.5 text-cyan-400" />
              Educational simulations only — no real wallets or credentials.
            </div>
          </div>
        </div>

        <p className="mt-6 text-center text-[11px] text-slate-500">
          By signing in, you agree to use this platform for educational purposes only.
        </p>
      </motion.div>
    </div>
  );
}
