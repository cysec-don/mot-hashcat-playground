"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Users,
  Award,
  TrendingUp,
  Activity,
  Cpu,
  Trophy,
  RotateCcw,
  ShieldAlert,
  Download,
  Loader2,
  Search,
  BarChart3,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { CHALLENGES } from "@/lib/challenges-data";
import { toast } from "sonner";

interface StudentRow {
  id: string;
  fullName: string;
  email: string | null;
  xp: number;
  rank: string;
  isAdmin: boolean;
  completedCount: number;
  completionPercent: number;
  certificatesEarned: number;
  playgroundSessions: number;
  achievementsUnlocked: number;
  createdAt: string;
  lastActiveAt: string;
}

interface Analytics {
  overview: {
    totalStudents: number;
    totalCertificates: number;
    totalPlaygroundSessions: number;
    totalChallengeCompletions: number;
    totalAchievementsUnlocked?: number;
  };
  perChallenge?: Array<{
    id: number;
    title: string;
    module: string;
    completions: number;
  }>;
  topStudents?: Array<{ fullName: string; xp: number }>;
}

export function AdminView() {
  const [tab, setTab] = useState<"overview" | "students" | "analytics">("overview");
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    let cancelled = false;
    const token = localStorage.getItem("mot-token");
    if (!token) {
      return;
    }
    Promise.all([
      fetch(`/api/admin?action=students`, {
        headers: { Authorization: `Bearer ${token}` },
      }).then((r) => r.json()),
      fetch(`/api/admin?action=analytics`, {
        headers: { Authorization: `Bearer ${token}` },
      }).then((r) => r.json()),
    ])
      .then(([s, a]) => {
        if (cancelled) return;
        setStudents(s.students || []);
        setAnalytics(a);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleReset = async (studentId: string, name: string) => {
    if (!confirm(`Reset progress for ${name}? This cannot be undone.`)) return;
    const token = localStorage.getItem("mot-token");
    if (!token) return;
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ action: "reset-progress", studentId }),
      });
      if (res.ok) {
        toast.success(`Progress reset for ${name}`);
        setStudents((prev) =>
          prev.map((s) =>
            s.id === studentId
              ? { ...s, xp: 0, rank: "Script Kiddie", completedCount: 0, completionPercent: 0, certificatesEarned: 0, achievementsUnlocked: 0 }
              : s
          )
        );
      } else {
        toast.error("Reset failed");
      }
    } catch {
      toast.error("Reset failed");
    }
  };

  const exportCSV = () => {
    const headers = ["Full Name", "Email", "XP", "Rank", "Completed", "Completion %", "Certificates", "Playground Sessions", "Achievements", "Created", "Last Active"];
    const rows = students.map((s) => [
      s.fullName,
      s.email || "",
      s.xp,
      s.rank,
      s.completedCount,
      s.completionPercent.toFixed(1),
      s.certificatesEarned,
      s.playgroundSessions,
      s.achievementsUnlocked,
      new Date(s.createdAt).toISOString(),
      new Date(s.lastActiveAt).toISOString(),
    ]);
    const csv = [headers, ...rows].map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `mot-hashcat-students-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Report exported");
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8">
        <Skeleton className="h-10 w-72 mb-6 bg-cyan-500/10" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 bg-cyan-500/10" />
          ))}
        </div>
        <Skeleton className="h-96 bg-cyan-500/10" />
      </div>
    );
  }

  const filtered = students.filter((s) =>
    s.fullName.toLowerCase().includes(search.toLowerCase()) ||
    (s.email || "").toLowerCase().includes(search.toLowerCase())
  );

  const overview = analytics?.overview;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-2 text-xs text-amber-400 mb-2">
          <ShieldAlert className="h-3.5 w-3.5" />
          <span className="uppercase tracking-wider">Administrator</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white">
          Admin <span className="cyber-gradient-text">Panel</span>
        </h1>
        <p className="mt-2 text-sm text-slate-400">
          Manage students, view analytics, and export reports.
        </p>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {[
          { key: "overview", label: "Overview", icon: Activity },
          { key: "students", label: "Students", icon: Users },
          { key: "analytics", label: "Analytics", icon: BarChart3 },
        ].map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key as any)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-md text-xs font-medium transition ${
                tab === t.key
                  ? "bg-amber-400/15 text-amber-300 border border-amber-400/30"
                  : "text-slate-400 hover:text-amber-300 border border-transparent"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {t.label}
            </button>
          );
        })}
      </div>

      {tab === "overview" && overview && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatBox icon={Users} label="Total Students" value={overview.totalStudents} color="#00E5FF" />
            <StatBox icon={Award} label="Certificates Issued" value={overview.totalCertificates} color="#FFC857" />
            <StatBox icon={Cpu} label="Playground Sessions" value={overview.totalPlaygroundSessions} color="#00FF88" />
            <StatBox icon={Trophy} label="Challenge Completions" value={overview.totalChallengeCompletions} color="#B484FF" />
          </div>

          {analytics?.topStudents && (
            <Card className="cyber-card p-6">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
                Top Students
              </h3>
              <div className="space-y-2">
                {analytics.topStudents.map((s, i) => (
                  <div key={s.fullName} className="flex items-center gap-3 p-2 rounded-md hover:bg-white/5 transition">
                    <div className="text-sm font-mono text-slate-500 w-6">#{i + 1}</div>
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-emerald-400 text-xs font-bold text-[#0B0F19]">
                      {s.fullName.slice(0, 1).toUpperCase()}
                    </div>
                    <div className="flex-1 text-sm font-medium text-white">{s.fullName}</div>
                    <div className="text-sm font-bold text-cyan-300">{s.xp.toLocaleString()} XP</div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      )}

      {tab === "students" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name or email..."
                className="pl-10 bg-[#0B0F19] border-cyan-500/25 text-white"
              />
            </div>
            <Button
              onClick={exportCSV}
              variant="outline"
              className="border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/10"
            >
              <Download className="h-4 w-4 mr-1.5" />
              Export CSV
            </Button>
          </div>

          <Card className="cyber-card p-0 overflow-hidden">
            <div className="overflow-x-auto cyber-scrollbar">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-cyan-500/15 bg-[#0B0F19]/60">
                    <th className="text-left text-[10px] uppercase tracking-wider text-slate-500 font-medium py-2.5 px-3">Student</th>
                    <th className="text-left text-[10px] uppercase tracking-wider text-slate-500 font-medium py-2.5 px-3 hidden md:table-cell">XP</th>
                    <th className="text-left text-[10px] uppercase tracking-wider text-slate-500 font-medium py-2.5 px-3 hidden sm:table-cell">Rank</th>
                    <th className="text-left text-[10px] uppercase tracking-wider text-slate-500 font-medium py-2.5 px-3">Progress</th>
                    <th className="text-left text-[10px] uppercase tracking-wider text-slate-500 font-medium py-2.5 px-3 hidden lg:table-cell">Certs</th>
                    <th className="text-left text-[10px] uppercase tracking-wider text-slate-500 font-medium py-2.5 px-3 hidden lg:table-cell">Playground</th>
                    <th className="text-right text-[10px] uppercase tracking-wider text-slate-500 font-medium py-2.5 px-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-sm text-slate-500">
                        No students found.
                      </td>
                    </tr>
                  )}
                  {filtered.map((s) => (
                    <tr key={s.id} className="border-b border-cyan-500/5 hover:bg-white/[0.02] transition">
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-emerald-400 text-xs font-bold text-[#0B0F19]">
                            {s.fullName.slice(0, 1).toUpperCase()}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-white flex items-center gap-1.5">
                              {s.fullName}
                              {s.isAdmin && (
                                <Badge className="bg-amber-400/15 text-amber-300 border-amber-400/30 text-[9px] py-0">
                                  ADMIN
                                </Badge>
                              )}
                            </div>
                            <div className="text-[10px] text-slate-500">{s.email || "no email"}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3 hidden md:table-cell">
                        <span className="text-sm font-bold text-cyan-300">{s.xp.toLocaleString()}</span>
                      </td>
                      <td className="py-3 px-3 hidden sm:table-cell">
                        <span className="text-xs text-slate-300">{s.rank}</span>
                      </td>
                      <td className="py-3 px-3">
                        <div className="text-xs text-white font-medium">{s.completedCount}/20</div>
                        <div className="text-[10px] text-slate-500">{s.completionPercent.toFixed(0)}%</div>
                      </td>
                      <td className="py-3 px-3 hidden lg:table-cell">
                        <span className="text-sm text-amber-300">{s.certificatesEarned}</span>
                      </td>
                      <td className="py-3 px-3 hidden lg:table-cell">
                        <span className="text-sm text-slate-300">{s.playgroundSessions}</span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleReset(s.id, s.fullName)}
                          className="text-rose-300 hover:text-rose-200 hover:bg-rose-500/10 h-7 text-xs"
                        >
                          <RotateCcw className="h-3 w-3 mr-1" />
                          Reset
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {tab === "analytics" && analytics?.perChallenge && (
        <div className="space-y-6">
          <Card className="cyber-card p-6">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-cyan-400" />
              Completions per Challenge
            </h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.perChallenge}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,229,255,0.1)" />
                  <XAxis
                    dataKey="id"
                    tick={{ fontSize: 10, fill: "#8B95A7" }}
                    stroke="rgba(0,229,255,0.2)"
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: "#8B95A7" }}
                    stroke="rgba(0,229,255,0.2)"
                  />
                  <Tooltip
                    contentStyle={{
                      background: "#111827",
                      border: "1px solid rgba(0,229,255,0.3)",
                      color: "#F5F7FA",
                      fontSize: 12,
                    }}
                    labelStyle={{ color: "#00E5FF" }}
                  />
                  <Bar dataKey="completions" fill="#00E5FF" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="cyber-card p-6">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
              Challenge Details
            </h3>
            <div className="space-y-2 max-h-80 overflow-y-auto cyber-scrollbar">
              {analytics.perChallenge.map((c) => {
                const challenge = CHALLENGES.find((x) => x.id === c.id);
                return (
                  <div
                    key={c.id}
                    className="flex items-center gap-3 p-2 rounded-md hover:bg-white/5 transition"
                  >
                    <div className="text-[10px] font-mono text-slate-500 w-6">Q{c.id}</div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs text-white truncate">
                        {challenge?.title || c.title}
                      </div>
                      <div className="text-[10px] text-slate-500">{c.module}</div>
                    </div>
                    <div className="text-sm font-bold text-cyan-300">
                      {c.completions}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

function StatBox({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: any;
  label: string;
  value: number;
  color: string;
}) {
  return (
    <Card className="cyber-card p-4 relative overflow-hidden">
      <div
        className="absolute top-0 right-0 w-20 h-20 rounded-full opacity-10 blur-2xl"
        style={{ background: color }}
      />
      <Icon className="h-4 w-4 mb-2" style={{ color }} />
      <div className="text-2xl font-bold text-white">{value.toLocaleString()}</div>
      <div className="text-[10px] text-slate-500 uppercase tracking-wider mt-0.5">
        {label}
      </div>
    </Card>
  );
}
