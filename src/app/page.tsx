"use client";

import { useEffect, useRef } from "react";
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

export default function Home() {
  const { view, setView } = useApp();
  const { student, setStudent } = useSession();
  const toastShownRef = useRef(false);

  // Restore session from localStorage on first mount
  useEffect(() => {
    const stored = localStorage.getItem("mot-hashcat-session");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed?.state?.student) {
          setStudent(parsed.state.student);
        }
      } catch {
        // Invalid session JSON — clear it
        localStorage.removeItem("mot-hashcat-session");
      }
    }
  }, [setStudent]);

  // Route guard: redirect to auth if accessing a protected view without a session
  useEffect(() => {
    const protectedViews = [
      "dashboard",
      "challenges",
      "challenge-detail",
      "playground",
      "achievements",
      "certificate",
      "admin",
    ];
    if (!student && protectedViews.includes(view)) {
      setView("login");
      // Show toast once per redirect cycle
      if (!toastShownRef.current) {
        import("sonner").then(({ toast }) => {
          toast.info("Please sign in to continue.");
        });
        toastShownRef.current = true;
      }
    }
    // Reset the toast flag when student becomes available
    if (student) {
      toastShownRef.current = false;
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
        {view === "register" && <AuthView mode="register" />}
        {view === "login" && <AuthView mode="login" />}
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
