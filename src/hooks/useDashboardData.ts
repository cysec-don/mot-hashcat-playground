"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "@/lib/store";

export interface DashboardData {
  student: {
    id: string;
    fullName: string;
    email: string | null;
    xp: number;
    rank: number;
    isAdmin: boolean;
    createdAt: string;
  };
  stats: {
    completedCount: number;
    remainingCount: number;
    completionPercent: number;
    totalXp: number;
    currentRank: {
      id: number;
      name: string;
      minXp: number;
      description: string;
      color: string;
      badgeClass: string;
      icon: string;
    };
    nextRank: {
      id: number;
      name: string;
      minXp: number;
      description: string;
      color: string;
      badgeClass: string;
      icon: string;
    } | null;
    certificatesEarned: number;
    leaderboardPosition: number;
    totalStudents: number;
    md5Completed: number;
    sha1Completed: number;
    sha2Completed: number;
    walletCompleted: number;
    perfectScoreCount: number;
  };
  challengeResults: Array<{
    id: string;
    challengeId: number;
    completed: boolean;
    attempts: number;
    hintsUsed: number;
    xpEarned: number;
  }>;
  achievements: string[];
  newlyUnlocked: string[];
  playgroundLogs: Array<{
    id: string;
    hashType: string;
    attackMode: string;
    command: string;
    recovered: boolean;
    duration: number;
    createdAt: string;
  }>;
  activityLogs: Array<{
    id: string;
    action: string;
    detail: string | null;
    xpDelta: number;
    createdAt: string;
  }>;
  certificates: Array<{
    id: string;
    certificateId: string;
    verificationNumber: string;
    studentName: string;
    issuedAt: string;
    completionPercent: number;
  }>;
}

export function useDashboardData() {
  const { student } = useSession();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!student) {
      setLoading(false);
      return;
    }
    const token = localStorage.getItem("mot-token");
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const res = await fetch("/api/student", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to load dashboard");
      const json = await res.json();
      setData(json);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [student]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { data, loading, error, refresh };
}
