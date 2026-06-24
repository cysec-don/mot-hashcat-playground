// MOT Hashcat Playground — Client-side app state (view router + transient UI)
import { create } from "zustand";

export type ViewKey =
  | "landing"
  | "auth"
  | "dashboard"
  | "challenges"
  | "challenge-detail"
  | "playground"
  | "leaderboard"
  | "achievements"
  | "certificate"
  | "verify"
  | "admin";

interface AppState {
  view: ViewKey;
  selectedChallengeId: number | null;
  authModalOpen: boolean;
  setView: (v: ViewKey) => void;
  setChallenge: (id: number | null) => void;
  setAuthModal: (open: boolean) => void;
}

export const useApp = create<AppState>((set) => ({
  view: "landing",
  selectedChallengeId: null,
  authModalOpen: false,
  setView: (v) => set({ view: v }),
  setChallenge: (id) => set({ selectedChallengeId: id }),
  setAuthModal: (open) => set({ authModalOpen: open }),
}));

// In-memory student session (mirrors server-side student record)
export interface SessionStudent {
  id: string;
  fullName: string;
  email: string | null;
  xp: number;
  rank: number;
  isAdmin: boolean;
  createdAt: string;
}

import { create as createPersist } from "zustand";
import { persist } from "zustand/middleware";

interface SessionState {
  student: SessionStudent | null;
  setStudent: (s: SessionStudent | null) => void;
  logout: () => void;
  updateXp: (xp: number) => void;
}

export const useSession = createPersist<SessionState>()(
  persist(
    (set) => ({
      student: null,
      setStudent: (s) => set({ student: s }),
      logout: () => {
        // Best-effort server logout (don't block UI on it)
        if (typeof window !== "undefined") {
          const token = localStorage.getItem("mot-token");
          const csrf = localStorage.getItem("mot-csrf");
          if (token) {
            fetch("/api/auth", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
                "X-CSRF-Token": csrf || "",
              },
              body: JSON.stringify({ action: "logout" }),
            }).catch(() => {});
            localStorage.removeItem("mot-token");
            localStorage.removeItem("mot-csrf");
          }
        }
        set({ student: null });
      },
      updateXp: (xp) =>
        set((state) =>
          state.student ? { student: { ...state.student, xp } } : state
        ),
    }),
    { name: "mot-hashcat-session" }
  )
);
