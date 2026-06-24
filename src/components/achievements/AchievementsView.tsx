"use client";

import { useApp } from "@/lib/store";
import { useDashboardData } from "@/hooks/useDashboardData";
import { motion } from "framer-motion";
import {
  Award,
  Lock,
  CheckCircle2,
  Crown,
  Zap,
  TrendingUp,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ACHIEVEMENTS, RANKS } from "@/lib/achievements-data";
import * as LucideIcons from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export function AchievementsView() {
  const { data, loading } = useDashboardData();
  const { setView } = useApp();

  if (loading || !data) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8">
        <Skeleton className="h-10 w-72 mb-6 bg-cyan-500/10" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <Skeleton key={i} className="h-40 bg-cyan-500/10" />
          ))}
        </div>
      </div>
    );
  }

  const unlocked = new Set(data.achievements);
  const unlockedCount = unlocked.size;
  const totalAch = ACHIEVEMENTS.length;
  const pct = (unlockedCount / totalAch) * 100;

  const currentRank = data.stats.currentRank;
  const nextRank = data.stats.nextRank;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-2 text-xs text-amber-400 mb-2">
          <Award className="h-3.5 w-3.5" />
          <span className="uppercase tracking-wider">Honors &amp; Ranks</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white">
          Achievements <span className="cyber-gradient-text">&amp; Ranks</span>
        </h1>
        <p className="mt-2 text-sm text-slate-400">
          Unlock {totalAch} achievements and climb {RANKS.length} ranks as you
          master Hashcat.
        </p>
      </motion.div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card className="cyber-card p-5">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Award className="h-4 w-4 text-amber-400" />
              <span className="text-xs text-slate-400 uppercase tracking-wider">
                Achievements
              </span>
            </div>
            <span className="text-2xl font-bold text-white">
              {unlockedCount}<span className="text-sm text-slate-500">/{totalAch}</span>
            </span>
          </div>
          <Progress value={pct} className="h-2 bg-[#0B0F19] border border-amber-500/15" />
        </Card>

        <Card className="cyber-card p-5">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Crown className="h-4 w-4 text-violet-400" />
              <span className="text-xs text-slate-400 uppercase tracking-wider">
                Current Rank
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${currentRank.badgeClass}`}>
              {(() => {
                const Icon = (LucideIcons as any)[currentRank.icon] ?? Crown;
                return <Icon className="h-5 w-5 text-white" />;
              })()}
            </div>
            <div>
              <div className="text-base font-bold text-white">{currentRank.name}</div>
              <div className="text-[11px] text-slate-500">Rank #{currentRank.id}</div>
            </div>
          </div>
        </Card>

        <Card className="cyber-card p-5">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-cyan-400" />
              <span className="text-xs text-slate-400 uppercase tracking-wider">
                Total XP
              </span>
            </div>
            <span className="text-2xl font-bold text-white">
              {data.stats.totalXp.toLocaleString()}
            </span>
          </div>
          {nextRank ? (
            <div className="text-[11px] text-slate-500">
              {data.stats.totalXp - currentRank.minXp} / {nextRank.minXp - currentRank.minXp} XP to {nextRank.name}
            </div>
          ) : (
            <div className="text-[11px] text-emerald-400">Maximum rank achieved</div>
          )}
        </Card>
      </div>

      {/* Achievements grid */}
      <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
        <Award className="h-4 w-4 text-amber-400" />
        All Achievements
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
        {ACHIEVEMENTS.map((a, i) => {
          const isUnlocked = unlocked.has(a.id);
          const Icon = (LucideIcons as any)[a.icon] ?? Award;
          return (
            <motion.div
              key={a.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
            >
              <Card
                className={`cyber-card p-5 h-full ${
                  isUnlocked ? "border-amber-500/40 bg-amber-500/[0.03]" : "opacity-70"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-xl shrink-0 ${
                      isUnlocked ? "" : "bg-white/5"
                    }`}
                    style={
                      isUnlocked
                        ? {
                            background: `${a.color}15`,
                            border: `1px solid ${a.color}40`,
                          }
                        : { border: "1px solid rgba(255,255,255,0.05)" }
                    }
                  >
                    {isUnlocked ? (
                      <Icon className="h-6 w-6" style={{ color: a.color }} />
                    ) : (
                      <Lock className="h-5 w-5 text-slate-600" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-sm font-bold text-white">{a.name}</h3>
                      {isUnlocked && (
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed mb-2">
                      {a.description}
                    </p>
                    <Badge
                      variant="outline"
                      className={`text-[10px] ${
                        isUnlocked
                          ? "border-amber-500/30 text-amber-300"
                          : "border-white/10 text-slate-500"
                      }`}
                    >
                      {a.condition}
                    </Badge>
                  </div>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Rank ladder */}
      <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
        <Crown className="h-4 w-4 text-violet-400" />
        Rank Ladder
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {RANKS.map((r) => {
          const isCurrent = r.id === currentRank.id;
          const isAchieved = data.stats.totalXp >= r.minXp;
          return (
            <Card
              key={r.id}
              className={`cyber-card p-5 relative overflow-hidden ${
                isCurrent ? "border-cyan-400/60 bg-cyan-400/5" : ""
              }`}
            >
              <div
                className={`absolute inset-0 opacity-20 ${r.badgeClass}`}
                style={{ background: r.color }}
              />
              <div className="relative">
                <div className="flex items-center justify-between mb-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${r.badgeClass}`}>
                    {(() => {
                      const Icon = (LucideIcons as any)[r.icon] ?? Crown;
                      return <Icon className="h-5 w-5 text-white" />;
                    })()}
                  </div>
                  {isCurrent && (
                    <Badge className="bg-cyan-400/15 text-cyan-300 border-cyan-400/30 text-[10px]">
                      CURRENT
                    </Badge>
                  )}
                  {isAchieved && !isCurrent && (
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  )}
                </div>
                <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">
                  Rank {r.id}
                </div>
                <div className="text-base font-bold text-white">{r.name}</div>
                <div className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                  {r.description}
                </div>
                <div className="mt-3 pt-3 border-t border-white/10">
                  <div className="text-xs font-mono" style={{ color: r.color }}>
                    {r.minXp.toLocaleString()} XP
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="mt-8 text-center">
        <Button
          onClick={() => setView("challenges")}
          className="bg-gradient-to-r from-cyan-400 to-emerald-400 text-[#0B0F19] hover:from-cyan-300 hover:to-emerald-300 font-bold"
        >
          <TrendingUp className="h-4 w-4 mr-2" />
          Continue Challenges
        </Button>
      </div>
    </div>
  );
}
