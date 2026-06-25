"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useApp, useSession, type SessionStudent } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  User,
  Mail,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Lock,
  AlertCircle,
  Eye,
  EyeOff,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

type Mode = "register" | "login";

export function AuthView({ mode }: { mode: Mode }) {
  const { setView } = useApp();
  const { setStudent } = useSession();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isRegister = mode === "register";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (fullName.trim().length < 2) {
      setError("Full Name must be at least 2 characters.");
      return;
    }

    if (isRegister) {
      if (password.length < 8) {
        setError("Password must be at least 8 characters.");
        return;
      }
      if (!/[a-z]/.test(password) || !/[A-Z]/.test(password) || !/[0-9]/.test(password) || !/[^a-zA-Z0-9]/.test(password)) {
        setError(
          "Password must include upper & lower case letters, a digit, and a special character."
        );
        return;
      }
      if (email && !/^[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}$/.test(email)) {
        setError("Please enter a valid email address.");
        return;
      }
    } else {
      if (!password) {
        setError("Password is required.");
        return;
      }
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: mode,
          fullName: fullName.trim(),
          email: isRegister && email ? email.trim() : undefined,
          password,
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
      localStorage.setItem("mot-csrf", data.csrf);
      toast.success(
        isRegister
          ? `Account created — welcome aboard, ${student.fullName}!`
          : `Welcome back, ${student.fullName}!`
      );
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
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-xl overflow-hidden border border-cyan-400/30 mb-4 pulse-glow">
              <img
                src="/mot-logo.jpg"
                alt="MOT Hashcat Playground"
                className="h-full w-full object-cover"
              />
            </div>
            <h1 className="text-2xl font-bold text-white">
              {isRegister ? (
                <>
                  Create your <span className="cyber-gradient-text">account</span>
                </>
              ) : (
                <>
                  Sign in to <span className="cyber-gradient-text">Playground</span>
                </>
              )}
            </h1>
            <p className="mt-2 text-sm text-slate-400">
              {isRegister
                ? "Register with your Full Name and a strong password."
                : "Welcome back. Sign in with your Full Name and password."}
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
                  autoComplete="name"
                  autoFocus
                />
              </div>
              <p className="text-[11px] text-slate-500">
                This exact name appears on your certificate and leaderboard entry.
              </p>
            </div>

            {isRegister && (
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
                    autoComplete="email"
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="password" className="text-xs text-slate-300 font-medium">
                Password <span className="text-rose-400">*</span>
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={isRegister ? "Min 8 chars, mixed classes" : "Your password"}
                  className="pl-10 pr-10 bg-[#0B0F19] border-cyan-500/25 text-white placeholder:text-slate-600 focus:border-cyan-400"
                  required
                  autoComplete={isRegister ? "new-password" : "current-password"}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-cyan-300 transition"
                  tabIndex={-1}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {isRegister && (
                <p className="text-[11px] text-slate-500">
                  Min 8 chars · include upper &amp; lower case, a digit, and a special character.
                </p>
              )}
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
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {isRegister ? "Creating account..." : "Signing in..."}
                </>
              ) : (
                <>
                  {isRegister ? "Create Account" : "Sign In"}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          </form>

          {/* Cross-link to the other auth mode */}
          <div className="mt-6 pt-6 border-t border-cyan-500/10 text-center">
            <p className="text-xs text-slate-400 mb-3">
              {isRegister
                ? "Already have an account?"
                : "Don't have an account yet?"}
            </p>
            <Button
              onClick={() => setView(isRegister ? "login" : "register")}
              variant="outline"
              className="w-full border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/10"
            >
              {isRegister ? "Go to Sign In" : "Go to Register"}
            </Button>
          </div>

          <div className="mt-6 pt-6 border-t border-cyan-500/10 space-y-2">
            <div className="flex items-center gap-2 text-[11px] text-slate-400">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
              Passwords are bcrypt-hashed (10 rounds). Never stored in plaintext.
            </div>
            <div className="flex items-center gap-2 text-[11px] text-slate-400">
              <Lock className="h-3.5 w-3.5 text-cyan-400" />
              Educational simulations only — no real wallets or credentials.
            </div>
          </div>
        </div>

        <p className="mt-6 text-center text-[11px] text-slate-500">
          By continuing, you agree to use this platform for educational purposes only.
        </p>
      </motion.div>
    </div>
  );
}
