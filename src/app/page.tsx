"use client";

import { useEffect } from "react";
import { useApp, useSession } from "@/lib/store";
import { CyberGridBackground } from "@/components/layout/CyberGridBackground";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { LandingPage } from "@/components/landing/LandingPage";
import { AuthView } from "@/components/auth/AuthView";
import { DashboardView } from "@/components/dashboard/DashboardView";
import { ChallengesView } from "@/components/challenges/ChallengesView";
import { ChallengeDetailView } from "@/components/challenges/ChallengeDetailView";
import { PlaygroundView } from "@/components/playground/PlaygroundView";
import { LeaderboardView } from "@/components/leaderboard/LeaderboardView";
import { AchievementsView } from "@/components/achievements/AchievementsView";
import { CertificateView } from "@/components/certificate/CertificateView";
import { VerifyView } from "@/components/verify/VerifyView";
import { AdminView } from "@/components/admin/AdminView";
import { toast } from "sonner";

export default function Home() {
  const { view, setView } = useApp();
  const { student, setStudent } = useSession();

  // Auto-redirect to dashboard if logged in and on landing
  // (only on first mount, not on intentional navigation)
  useEffect(() => {
    // Restore session from localStorage if any
    const stored = localStorage.getItem("mot-hashcat-session");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed?.state?.student) {
          setStudent(parsed.state.student);
        }
      } catch {}
    }
  }, [setStudent]);

  // Route guard - if not logged in and trying to access protected views, redirect to auth
  useEffect(() => {
    const protectedViews = ["dashboard", "challenges", "challenge-detail", "playground", "certificate", "admin"];
    if (!student && protectedViews.includes(view)) {
      toast.info("Please sign in to continue.");
      setView("auth");
    }
  }, [student, view, setView]);

  // Scroll to top on view change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [view]);

  return (
    <div className="relative min-h-screen flex flex-col">
      <CyberGridBackground />
      <Navbar />
      <main className="flex-1">
        {view === "landing" && <LandingPage />}
        {view === "auth" && <AuthView />}
        {view === "dashboard" && student && <DashboardView />}
        {view === "challenges" && student && <ChallengesView />}
        {view === "challenge-detail" && student && <ChallengeDetailView />}
        {view === "playground" && student && <PlaygroundView />}
        {view === "leaderboard" && <LeaderboardView />}
        {view === "achievements" && student && <AchievementsView />}
        {view === "certificate" && student && <CertificateView />}
        {view === "verify" && <VerifyView />}
        {view === "admin" && student?.isAdmin && <AdminView />}
      </main>
      <Footer />
    </div>
  );
}
