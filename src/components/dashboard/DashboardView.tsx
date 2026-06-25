"use client";

import { useApp, useSession } from "@/lib/store";
import { useDashboardData } from "@/hooks/useDashboardData";
import { motion } from "framer-motion";
import {
  Terminal,
  Trophy,
  Award,
  Zap,
  Target,
  TrendingUp,
  Crown,
  CheckCircle2,
  Lock,
  ArrowRight,
  Activity,
  Wrench,
  Sparkles,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CHALLENGES, MODULES } from "@/lib/challenges-data";
import { ACHIEVEMENTS, RANKS } from "@/lib/achievements-data";
import { Skeleton } from "@/components/ui/skeleton";
import * as LucideIcons from "lucide-react";

export function DashboardView() {
  const { setView, setChallenge } = useApp();
  const { student } = useSession();
  const { data, loading } = useDashboardData();

  if (loading || !data) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <Skeleton className="h-10 w-72 mb-6 bg-cyan-500/10" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-28 bg-cyan-500/10" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-64 bg-cyan-500/10 lg:col-span-2" />
          <Skeleton className="h-64 bg-cyan-500/10" />
        </div>
      </div>
    );
  }

  const { stats, challengeResults, achievements, playgroundLogs, activityLogs, certificates } = data;
  const currentRank = stats.currentRank;
  const nextRank = stats.nextRank;
  const xpToNext = nextRank ? nextRank.minXp - stats.totalXp : 0;
  const rankProgress = nextRank
    ? ((stats.totalXp - currentRank.minXp) / (nextRank.minXp - currentRank.minXp)) * 100
    : 100;

  const completedIds = new Set(
    challengeResults.filter((r) => r.completed).map((r) => r.challengeId)
  );

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-2 text-xs text-cyan-400 mb-2">
          <Sparkles className="h-3.5 w-3.5" />
          <span className="uppercase tracking-wider">Operator Dashboard</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white">
          Welcome Back, <span className="cyber-gradient-text">{student?.fullName}</span>
        </h1>
        <p className="mt-2 text-sm text-slate-400">
          {stats.completedCount === 0
            ? "Your journey begins now. Start with Module 1 — MD5."
            : stats.completedCount === 20
            ? "Congratulations, Grandmaster. All 100 challenges complete."
            : `${stats.remainingCount} challenge${stats.remainingCount === 1 ? "" : "s"} remaining to graduation.`}
        </p>
      </motion.div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <StatCard
          label="Completed"
          value={`${stats.completedCount}/100`}
          icon={CheckCircle2}
          color="#00FF88"
        />
        <StatCard
          label="Remaining"
          value={String(stats.remainingCount)}
          icon={Target}
          color="#FFC857"
        />
        <StatCard
          label="XP Earned"
          value={stats.totalXp.toLocaleString()}
          icon={Zap}
          color="#00E5FF"
        />
        <StatCard
          label="Current Rank"
          value={`#${currentRank.id}`}
          sublabel={currentRank.name}
          icon={Crown}
          color="#B484FF"
        />
        <StatCard
          label="Completion"
          value={`${stats.completionPercent.toFixed(0)}%`}
          icon={TrendingUp}
          color="#00FF88"
        />
        <StatCard
          label="Certificates"
          value={String(stats.certificatesEarned)}
          icon={Award}
          color="#FFC857"
        />
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column - 2/3 */}
        <div className="lg:col-span-2 space-y-6">
          {/* Rank progress */}
          <Card className="cyber-card p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">
                  Rank Progress
                </div>
                <div className="flex items-center gap-3">
                  <RankBadge rankId={currentRank.id} />
                  <div>
                    <div className="text-xl font-bold text-white">
                      {currentRank.name}
                    </div>
                    <div className="text-xs text-slate-400">
                      {currentRank.description}
                    </div>
                  </div>
                </div>
              </div>
              {nextRank && (
                <div className="text-right">
                  <div className="text-xs text-slate-500">Next</div>
                  <div className="text-sm font-semibold" style={{ color: nextRank.color }}>
                    {nextRank.name}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">
                    {xpToNext.toLocaleString()} XP to go
                  </div>
                </div>
              )}
            </div>
            <div className="relative">
              <Progress
                value={rankProgress}
                className="h-3 bg-[#0B0F19] border border-cyan-500/20"
              />
              <div
                className="absolute top-0 left-0 h-3 rounded-full progress-flow opacity-50"
                style={{ width: `${rankProgress}%` }}
              />
            </div>
            <div className="mt-2 flex justify-between text-[11px] text-slate-500">
              <span>{currentRank.minXp.toLocaleString()} XP</span>
              <span>{stats.totalXp.toLocaleString()} XP</span>
              {nextRank && <span>{nextRank.minXp.toLocaleString()} XP</span>}
            </div>
          </Card>

          {/* Module progress */}
          <Card className="cyber-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Terminal className="h-4 w-4 text-cyan-400" />
                Module Progress
              </h3>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setView("challenges")}
                className="border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/10 h-7 text-xs"
              >
                View All
                <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            </div>
            <div className="space-y-4">
              {MODULES.map((m) => {
                const completed = m.challengeIds.filter((c) => completedIds.has(c)).length;
                const pct = (completed / m.challengeIds.length) * 100;
                return (
                  <div key={m.name}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <div
                          className="h-2 w-2 rounded-full"
                          style={{ background: m.color }}
                        />
                        <span className="text-sm font-medium text-white">
                          {m.code} — {m.name}
                        </span>
                      </div>
                      <span className="text-xs text-slate-400">
                        {completed}/{m.challengeIds.length}
                      </span>
                    </div>
                    <Progress
                      value={pct}
                      className="h-2 bg-[#0B0F19] border border-cyan-500/10"
                    />
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Recent activity */}
          <Card className="cyber-card p-6">
            <h3 className="text-base font-bold text-white flex items-center gap-2 mb-4">
              <Activity className="h-4 w-4 text-cyan-400" />
              Recent Activity
            </h3>
            {activityLogs.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center">
                No activity yet. Start a challenge to populate your timeline.
              </p>
            ) : (
              <div className="space-y-2 max-h-72 overflow-y-auto cyber-scrollbar pr-2">
                {activityLogs.map((log) => (
                  <div
                    key={log.id}
                    className="flex items-start gap-3 p-2 rounded-md hover:bg-white/5 transition"
                  >
                    <div className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-cyan-400/10 border border-cyan-400/20">
                      {log.xpDelta > 0 ? (
                        <Zap className="h-3.5 w-3.5 text-cyan-400" />
                      ) : (
                        <Activity className="h-3.5 w-3.5 text-slate-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs text-slate-300 truncate">
                        {log.detail || log.action}
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        {new Date(log.createdAt).toLocaleString()}
                      </div>
                    </div>
                    {log.xpDelta > 0 && (
                      <Badge className="bg-emerald-400/15 text-emerald-400 border-emerald-400/30 hover:bg-emerald-400/15 text-[10px]">
                        +{log.xpDelta} XP
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Right column - 1/3 */}
        <div className="space-y-6">
          {/* Quick actions */}
          <Card className="cyber-card p-6">
            <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-cyan-400" />
              Continue Learning
            </h3>
            <LearningRecommendations
              completedIds={completedIds}
              onSelectChallenge={(id) => {
                setChallenge(id);
                setView("challenge-detail");
              }}
              onOpenPlayground={() => setView("playground")}
              playgroundSessions={playgroundLogs.length}
            />
          </Card>

          {/* Leaderboard position */}
          <Card className="cyber-card p-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Trophy className="h-4 w-4 text-amber-400" />
                Leaderboard
              </h3>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setView("leaderboard")}
                className="text-cyan-300 hover:text-cyan-200 hover:bg-cyan-500/10 h-7 text-xs"
              >
                View All
              </Button>
            </div>
            <div className="text-center py-4">
              <div className="text-5xl font-bold cyber-gradient-text">
                #{stats.leaderboardPosition}
              </div>
              <div className="text-xs text-slate-400 mt-2">
                of {stats.totalStudents} students
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setView("leaderboard")}
              className="w-full border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/10"
            >
              See Global Rankings
            </Button>
          </Card>

          {/* Achievement showcase */}
          <Card className="cyber-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Award className="h-4 w-4 text-amber-400" />
                Achievements
              </h3>
              <span className="text-xs text-slate-400">
                {achievements.length}/{ACHIEVEMENTS.length}
              </span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {ACHIEVEMENTS.slice(0, 8).map((a) => {
                const unlocked = achievements.includes(a.id);
                const Icon = (LucideIcons as any)[a.icon] ?? Award;
                return (
                  <div
                    key={a.id}
                    className={`aspect-square flex flex-col items-center justify-center rounded-lg border ${
                      unlocked
                        ? "border-amber-400/40 bg-amber-400/10"
                        : "border-white/5 bg-white/[0.02] opacity-40"
                    }`}
                    title={`${a.name} — ${a.description}`}
                  >
                    <Icon
                      className="h-5 w-5"
                      style={{ color: unlocked ? a.color : "#475569" }}
                    />
                  </div>
                );
              })}
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setView("achievements")}
              className="w-full mt-3 text-amber-300 hover:text-amber-200 hover:bg-amber-400/10"
            >
              View All Achievements
            </Button>
          </Card>

          {/* Certificate widget */}
          <Card className="cyber-card p-6">
            <h3 className="text-base font-bold text-white mb-3 flex items-center gap-2">
              <Award className="h-4 w-4 text-amber-400" />
              Certification
            </h3>
            {certificates.length > 0 ? (
              <div className="space-y-3">
                <div className="text-center py-3">
                  <CheckCircle2 className="h-10 w-10 text-emerald-400 mx-auto mb-2" />
                  <div className="text-sm font-semibold text-white">
                    Certificate Issued
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1 font-mono">
                    {certificates[0].certificateId}
                  </div>
                </div>
                <Button
                  size="sm"
                  onClick={() => setView("certificate")}
                  className="w-full bg-gradient-to-r from-amber-500 to-yellow-400 text-[#0B0F19] hover:from-amber-400 hover:to-yellow-300 font-semibold"
                >
                  View Certificate
                </Button>
              </div>
            ) : (
              <div className="text-center py-3">
                <Lock className="h-10 w-10 text-slate-600 mx-auto mb-2" />
                <div className="text-sm text-slate-400">
                  Complete all 20 challenges
                </div>
                <div className="text-[11px] text-slate-500 mt-1">
                  {stats.completedCount}/100 completed
                </div>
                <Progress
                  value={stats.completionPercent}
                  className="h-2 mt-3 bg-[#0B0F19] border border-cyan-500/10"
                />
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  sublabel,
  icon: Icon,
  color,
}: {
  label: string;
  value: string;
  sublabel?: string;
  icon: any;
  color: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="cyber-card rounded-lg p-4 relative overflow-hidden"
    >
      <div
        className="absolute top-0 right-0 w-16 h-16 rounded-full opacity-10 blur-2xl"
        style={{ background: color }}
      />
      <Icon className="h-4 w-4 mb-2" style={{ color }} />
      <div className="text-2xl font-bold text-white">{value}</div>
      <div className="text-[10px] text-slate-500 uppercase tracking-wider mt-0.5">
        {label}
      </div>
      {sublabel && (
        <div className="text-[10px] text-slate-400 mt-0.5 truncate">{sublabel}</div>
      )}
    </motion.div>
  );
}

function RankBadge({ rankId }: { rankId: number }) {
  const rank = RANKS.find((r) => r.id === rankId) ?? RANKS[0];
  const Icon = (LucideIcons as any)[rank.icon] ?? Crown;
  return (
    <div
      className={`flex h-12 w-12 items-center justify-center rounded-xl ${rank.badgeClass}`}
    >
      <Icon className="h-6 w-6 text-white" />
    </div>
  );
}

function LearningRecommendations({
  completedIds,
  onSelectChallenge,
  onOpenPlayground,
  playgroundSessions,
}: {
  completedIds: Set<number>;
  onSelectChallenge: (id: number) => void;
  onOpenPlayground: () => void;
  playgroundSessions: number;
}) {
  // Find next uncompleted challenge
  const nextChallenge = CHALLENGES.find((c) => !completedIds.has(c.id));
  const nextModule = nextChallenge
    ? MODULES.find((m) => m.name === nextChallenge.module)
    : null;

  if (!nextChallenge) {
    return (
      <div className="text-center py-6">
        <Trophy className="h-10 w-10 text-amber-400 mx-auto mb-2" />
        <div className="text-sm font-semibold text-white">All challenges complete!</div>
        <Button
          size="sm"
          onClick={onOpenPlayground}
          className="mt-3 bg-gradient-to-r from-cyan-400 to-emerald-400 text-[#0B0F19] hover:from-cyan-300 hover:to-emerald-300 font-semibold"
        >
          Visit Playground
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <button
        onClick={() => onSelectChallenge(nextChallenge.id)}
        className="w-full text-left rounded-lg border border-cyan-500/30 bg-cyan-500/5 p-3 hover:bg-cyan-500/10 transition group"
      >
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider">
            Next Up · Q{nextChallenge.id}
          </span>
          <ArrowRight className="h-3 w-3 text-cyan-400 group-hover:translate-x-0.5 transition" />
        </div>
        <div className="text-sm font-semibold text-white">
          {nextChallenge.title}
        </div>
        <div className="text-[11px] text-slate-400 mt-0.5">
          {nextChallenge.module} · {nextChallenge.difficulty} · {nextChallenge.xp} XP
        </div>
      </button>

      {playgroundSessions === 0 && (
        <button
          onClick={onOpenPlayground}
          className="w-full text-left rounded-lg border border-white/5 bg-white/[0.02] p-3 hover:bg-white/5 transition"
        >
          <div className="flex items-center gap-2">
            <Wrench className="h-3.5 w-3.5 text-cyan-400" />
            <span className="text-xs font-medium text-white">
              Try the Hashcat Playground
            </span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Practice safely with educational simulations.
          </div>
        </button>
      )}
    </div>
  );
}
