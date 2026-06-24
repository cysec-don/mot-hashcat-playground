"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Trophy,
  Crown,
  Zap,
  Award,
  TrendingUp,
  Users,
  Star,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useSession } from "@/lib/store";
import { RANKS } from "@/lib/achievements-data";

interface LeaderboardEntry {
  position: number;
  fullName: string;
  xp: number;
  rankName: string;
  rankId: number;
  rankColor: string;
  completedCount: number;
  completionPercent: number;
  certificatesEarned: number;
  lastActiveAt: string;
}

export function LeaderboardView() {
  const { student } = useSession();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/leaderboard?limit=50")
      .then((r) => r.json())
      .then((data) => {
        setEntries(data.leaderboard || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const podium = entries.slice(0, 3);
  const rest = entries.slice(3);

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-8">
        <Skeleton className="h-10 w-72 mb-6 bg-cyan-500/10" />
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-48 bg-cyan-500/10" />
          ))}
        </div>
        <div className="space-y-2">
          {Array.from({ length: 10 }).map((_, i) => (
            <Skeleton key={i} className="h-14 bg-cyan-500/10" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-2 text-xs text-amber-400 mb-2">
          <Trophy className="h-3.5 w-3.5" />
          <span className="uppercase tracking-wider">Global Rankings</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white">
          The <span className="cyber-gradient-text">Leaderboard</span>
        </h1>
        <p className="mt-2 text-sm text-slate-400">
          The world&rsquo;s top Hashcat operators, ranked by total XP earned across
          all challenges and playground sessions.
        </p>
      </motion.div>

      {/* Podium */}
      {podium.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {/* 2nd place */}
          {podium[1] && (
            <PodiumCard entry={podium[1]} place={2} isYou={podium[1].fullName === student?.fullName} />
          )}
          {/* 1st place */}
          {podium[0] && (
            <PodiumCard entry={podium[0]} place={1} isYou={podium[0].fullName === student?.fullName} />
          )}
          {/* 3rd place */}
          {podium[2] && (
            <PodiumCard entry={podium[2]} place={3} isYou={podium[2].fullName === student?.fullName} />
          )}
        </div>
      )}

      {/* Rest of leaderboard */}
      <Card className="cyber-card p-0 overflow-hidden">
        <div className="px-4 py-3 border-b border-cyan-500/15 bg-[#0B0F19]/60">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-cyan-400" />
              <span className="text-sm font-bold text-white">All Operators</span>
            </div>
            <span className="text-xs text-slate-500">{entries.length} total</span>
          </div>
        </div>
        <div className="divide-y divide-cyan-500/10">
          {rest.length === 0 && (
            <div className="py-12 text-center text-sm text-slate-500">
              No additional operators yet. Be the first to climb the ranks.
            </div>
          )}
          {rest.map((e, i) => {
            const isYou = e.fullName === student?.fullName;
            return (
              <motion.div
                key={e.fullName}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.02 }}
                className={`flex items-center gap-4 px-4 py-3 hover:bg-white/5 transition ${
                  isYou ? "bg-cyan-400/5 border-l-2 border-cyan-400" : ""
                }`}
              >
                <div className="text-sm font-mono text-slate-500 w-8">#{e.position}</div>
                <div
                  className="flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold text-white"
                  style={{ background: e.rankColor }}
                >
                  {e.fullName.slice(0, 1).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-white truncate flex items-center gap-2">
                    {e.fullName}
                    {isYou && (
                      <Badge variant="outline" className="text-[10px] border-cyan-400/40 text-cyan-300">
                        YOU
                      </Badge>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-500">{e.rankName}</div>
                </div>
                <div className="hidden sm:flex flex-col items-end mr-4">
                  <div className="text-xs text-slate-400">
                    {e.completedCount}/20 challenges
                  </div>
                  <div className="text-[10px] text-slate-600">
                    {e.certificatesEarned} cert{e.certificatesEarned === 1 ? "" : "s"}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-cyan-300">
                    {e.xp.toLocaleString()}
                  </div>
                  <div className="text-[10px] text-slate-600 uppercase tracking-wider">XP</div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </Card>

      {/* Ranks ladder */}
      <div className="mt-8">
        <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
          <Crown className="h-4 w-4 text-amber-400" />
          Rank Ladder
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {RANKS.map((r) => (
            <Card key={r.id} className={`cyber-card p-4 ${r.badgeClass} relative overflow-hidden`}>
              <div className="absolute inset-0 bg-black/50" />
              <div className="relative">
                <div className="text-[10px] uppercase tracking-wider text-white/70 mb-1">
                  Rank {r.id}
                </div>
                <div className="text-sm font-bold text-white">{r.name}</div>
                <div className="text-[11px] text-white/80 mt-1">{r.description}</div>
                <div className="mt-2 text-xs font-mono text-white/90">
                  {r.minXp.toLocaleString()} XP
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

function PodiumCard({
  entry,
  place,
  isYou,
}: {
  entry: LeaderboardEntry;
  place: number;
  isYou: boolean;
}) {
  const placeColor = place === 1 ? "#FFD700" : place === 2 ? "#C0C0C0" : "#CD7F32";
  const placeIcon = place === 1 ? Crown : place === 2 ? Trophy : Star;
  const Icon = placeIcon;
  const heightClass = place === 1 ? "md:order-2 md:-mt-6" : place === 2 ? "md:order-1" : "md:order-3";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: place * 0.1 }}
      className={`${heightClass} ${isYou ? "ring-2 ring-cyan-400/50" : ""}`}
    >
      <Card
        className="cyber-card p-6 text-center relative overflow-hidden"
        style={{ borderColor: `${placeColor}40` }}
      >
        <div
          className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-10 blur-3xl"
          style={{ background: placeColor }}
        />
        <div
          className="inline-flex h-12 w-12 items-center justify-center rounded-full mb-3"
          style={{ background: `${placeColor}25`, border: `1px solid ${placeColor}60` }}
        >
          <Icon className="h-6 w-6" style={{ color: placeColor }} />
        </div>
        <div className="text-xs font-mono text-slate-500 mb-1">#{entry.position}</div>
        <div className="text-base font-bold text-white truncate">{entry.fullName}</div>
        <div className="text-xs" style={{ color: entry.rankColor }}>
          {entry.rankName}
        </div>
        <div className="mt-3 text-3xl font-bold cyber-gradient-text">
          {entry.xp.toLocaleString()}
        </div>
        <div className="text-[10px] text-slate-500 uppercase tracking-wider">XP</div>
        <div className="mt-2 flex justify-center gap-3 text-[10px] text-slate-500">
          <span>{entry.completedCount}/20</span>
          <span>·</span>
          <span>{entry.certificatesEarned} cert{entry.certificatesEarned === 1 ? "" : "s"}</span>
        </div>
        {isYou && (
          <Badge className="mt-3 bg-cyan-400/15 text-cyan-300 border-cyan-400/30">
            YOU
          </Badge>
        )}
      </Card>
    </motion.div>
  );
}
