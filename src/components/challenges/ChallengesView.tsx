"use client";

import { useApp } from "@/lib/store";
import { useDashboardData } from "@/hooks/useDashboardData";
import { motion } from "framer-motion";
import {
  Terminal,
  CheckCircle2,
  Star,
  Zap,
  ChevronRight,
  Trophy,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CHALLENGES, MODULES } from "@/lib/challenges-data";
import { Skeleton } from "@/components/ui/skeleton";

const DIFFICULTY_COLOR: Record<string, string> = {
  Beginner: "#00FF88",
  Intermediate: "#FFC857",
  Advanced: "#FF5C5C",
  Expert: "#B484FF",
};

const MODULE_COLOR: Record<string, string> = {
  "Hash Identification": "#00E5FF",
  "Hashcat Modes": "#00FF88",
  "Wordlist Attacks": "#FFC857",
  "Rule Attacks": "#B484FF",
  "Mask Attacks": "#FF5C5C",
  "Combinator Attacks": "#10B981",
  "Hybrid Attacks": "#8B5CF6",
  "Wallet.dat Training": "#F59E0B",
};

export function ChallengesView() {
  const { setChallenge, setView } = useApp();
  const { data, loading } = useDashboardData();

  const completedIds = new Set(
    data?.challengeResults.filter((r) => r.completed).map((r) => r.challengeId) ?? []
  );

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <Skeleton className="h-10 w-72 mb-6 bg-cyan-500/10" />
        <div className="space-y-6">
          {[1, 2, 3, 4].map((m) => (
            <Skeleton key={m} className="h-96 bg-cyan-500/10" />
          ))}
        </div>
      </div>
    );
  }

  const totalCompleted = completedIds.size;
  const totalXp = data?.stats.totalXp ?? 0;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 text-xs text-cyan-400 mb-2">
            <Terminal className="h-3.5 w-3.5" />
            <span className="uppercase tracking-wider">Training Curriculum</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white">
            20 <span className="cyber-gradient-text">Challenges</span>
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            Progressive labs from beginner to advanced. Crack hashes, identify
            modes, and master every Hashcat attack mode.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Card className="cyber-card p-3 px-4 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <span className="text-sm font-bold text-white">{totalCompleted}/100</span>
            <span className="text-xs text-slate-500">completed</span>
          </Card>
          <Card className="cyber-card p-3 px-4 flex items-center gap-2">
            <Zap className="h-4 w-4 text-cyan-400" />
            <span className="text-sm font-bold text-white">{totalXp.toLocaleString()}</span>
            <span className="text-xs text-slate-500">XP</span>
          </Card>
        </div>
      </div>

      <div className="space-y-10">
        {MODULES.map((m, mIdx) => {
          const moduleChallenges = CHALLENGES.filter((c) => c.module === m.name);
          const moduleCompleted = moduleChallenges.filter((c) =>
            completedIds.has(c.id)
          ).length;
          const modulePct = (moduleCompleted / moduleChallenges.length) * 100;

          return (
            <div key={m.name}>
              {/* Module header */}
              <div className="mb-4 flex items-center gap-4">
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-xl text-lg font-bold"
                  style={{
                    background: `${m.color}15`,
                    border: `1px solid ${m.color}40`,
                    color: m.color,
                  }}
                >
                  {String(mIdx + 1).padStart(2, "0")}
                </div>
                <div className="flex-1">
                  <div
                    className="text-xs font-mono tracking-widest uppercase"
                    style={{ color: m.color }}
                  >
                    {m.code}
                  </div>
                  <h2 className="text-xl font-bold text-white">{m.name}</h2>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-white">
                    {moduleCompleted}/{moduleChallenges.length}
                  </div>
                  <div className="text-[10px] text-slate-500 uppercase tracking-wider">
                    completed
                  </div>
                </div>
              </div>

              {/* Module challenges grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {moduleChallenges.map((c, idx) => {
                  const completed = completedIds.has(c.id);
                  const result = data?.challengeResults.find(
                    (r) => r.challengeId === c.id
                  );
                  const attempts = result?.attempts ?? 0;
                  const hintsUsed = result?.hintsUsed ?? 0;
                  const isLocked = false; // all challenges are unlocked for flexibility

                  return (
                    <motion.button
                      key={c.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      onClick={() => {
                        setChallenge(c.id);
                        setView("challenge-detail");
                      }}
                      className={`cyber-card rounded-xl p-5 text-left group relative overflow-hidden ${
                        completed ? "border-emerald-500/30" : ""
                      }`}
                    >
                      {/* Status badge */}
                      <div className="absolute top-3 right-3">
                        {completed ? (
                          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-400/15 border border-emerald-400/40">
                            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                          </div>
                        ) : (
                          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/5 border border-white/10">
                            <span className="text-[10px] text-slate-500 font-mono">
                              {String(c.id).padStart(2, "0")}
                            </span>
                          </div>
                        )}
                      </div>

                      <div
                        className="text-[10px] font-mono uppercase tracking-wider mb-2"
                        style={{ color: DIFFICULTY_COLOR[c.difficulty] }}
                      >
                        {c.difficulty}
                      </div>

                      <h3 className="text-base font-bold text-white mb-2 pr-8 group-hover:text-cyan-300 transition">
                        {c.title}
                      </h3>

                      <p className="text-xs text-slate-400 line-clamp-2 mb-3">
                        {c.scenario}
                      </p>

                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge
                          variant="outline"
                          className="text-[10px] border-cyan-500/30 text-cyan-300"
                        >
                          Q{c.id}
                        </Badge>
                        <Badge
                          variant="outline"
                          className="text-[10px]"
                          style={{
                            borderColor: `${MODULE_COLOR[c.module]}40`,
                            color: MODULE_COLOR[c.module],
                          }}
                        >
                          {c.module}
                        </Badge>
                        <Badge
                          variant="outline"
                          className="text-[10px] border-amber-500/30 text-amber-300"
                        >
                          <Star className="h-2.5 w-2.5 mr-0.5" />
                          {c.xp} XP
                        </Badge>
                      </div>

                      {(attempts > 0 || hintsUsed > 0) && (
                        <div className="mt-3 pt-3 border-t border-white/5 flex items-center gap-3 text-[10px] text-slate-500">
                          {attempts > 0 && <span>{attempts} attempt{attempts === 1 ? "" : "s"}</span>}
                          {hintsUsed > 0 && <span>{hintsUsed} hint{hintsUsed === 1 ? "" : "s"} used</span>}
                        </div>
                      )}

                      <div className="mt-3 flex items-center text-xs text-cyan-400 group-hover:gap-1.5 gap-1 transition-all">
                        {completed ? "Review Challenge" : "Start Challenge"}
                        <ChevronRight className="h-3 w-3" />
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Graduation card */}
      {totalCompleted === 20 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-12"
        >
          <Card className="cyber-card p-8 text-center border-amber-500/40 bg-gradient-to-br from-amber-500/10 to-transparent">
            <Trophy className="h-12 w-12 text-amber-400 mx-auto mb-3" />
            <h3 className="text-2xl font-bold text-white">
              All 100 Challenges Complete!
            </h3>
            <p className="mt-2 text-sm text-slate-400 max-w-xl mx-auto">
              You've earned your certification. Generate your premium PDF
              certificate and join the ranks of MOT Hashcat Playground graduates.
            </p>
            <Button
              size="lg"
              onClick={() => setView("certificate")}
              className="mt-5 bg-gradient-to-r from-amber-500 to-yellow-400 text-[#0B0F19] hover:from-amber-400 hover:to-yellow-300 font-bold"
            >
              <Trophy className="h-4 w-4 mr-2" />
              Claim Your Certificate
            </Button>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
