"use client";

import { useApp, useSession } from "@/lib/store";
import { Shield, Github, Twitter, Mail } from "lucide-react";

export function Footer() {
  const { setView } = useApp();
  const { student } = useSession();

  return (
    <footer className="mt-auto border-t border-cyan-500/15 bg-[#0B0F19]/90 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="flex h-7 w-7 items-center justify-center rounded overflow-hidden border border-cyan-400/30">
                <img
                  src="/mot-logo.jpg"
                  alt="MOT Hashcat Playground"
                  className="h-full w-full object-cover"
                />
              </div>
              <span className="text-sm font-bold text-white">
                MOT <span className="cyber-gradient-text">Hashcat</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Master Password Recovery. Master Hashcat. Master the Art of
              Cracking.
            </p>
            <p className="mt-3 text-[11px] text-slate-500">
              Educational simulations only. No real wallets, no real cryptocurrency,
              no real credentials. All hashes are public test vectors.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-cyan-400 mb-3 tracking-wider uppercase">
              Platform
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <button
                  onClick={() => setView(student ? "challenges" : "register")}
                  className="hover:text-cyan-300 transition"
                >
                  Challenges
                </button>
              </li>
              <li>
                <button
                  onClick={() => setView(student ? "playground" : "register")}
                  className="hover:text-cyan-300 transition"
                >
                  Playground
                </button>
              </li>
              <li>
                <button
                  onClick={() => setView(student ? "leaderboard" : "register")}
                  className="hover:text-cyan-300 transition"
                >
                  Leaderboard
                </button>
              </li>
              <li>
                <button
                  onClick={() => setView("verify")}
                  className="hover:text-cyan-300 transition"
                >
                  Verify Certificate
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-cyan-400 mb-3 tracking-wider uppercase">
              Curriculum
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>Module 1 — MD5</li>
              <li>Module 2 — SHA1</li>
              <li>Module 3 — SHA2-256</li>
              <li>Module 4 — Wallet.dat Training</li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-cyan-400 mb-3 tracking-wider uppercase">
              Connect
            </h4>
            <div className="flex gap-3">
              <button className="flex h-8 w-8 items-center justify-center rounded border border-cyan-500/20 hover:border-cyan-400/50 hover:text-cyan-300 text-slate-400 transition">
                <Github className="h-4 w-4" />
              </button>
              <button className="flex h-8 w-8 items-center justify-center rounded border border-cyan-500/20 hover:border-cyan-400/50 hover:text-cyan-300 text-slate-400 transition">
                <Twitter className="h-4 w-4" />
              </button>
              <button className="flex h-8 w-8 items-center justify-center rounded border border-cyan-500/20 hover:border-cyan-400/50 hover:text-cyan-300 text-slate-400 transition">
                <Mail className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-4 flex items-center gap-2 text-[11px] text-emerald-400">
              <Shield className="h-3.5 w-3.5" />
              <span>Safe Training Environment</span>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-cyan-500/10 flex flex-col md:flex-row justify-between gap-3 text-[11px] text-slate-500">
          <div>
            © {new Date().getFullYear()} MOT Hashcat Playground. All rights
            reserved. For educational use only.
          </div>
          <div className="flex items-center gap-4">
            <span>v1.0.0 — Certified Edition</span>
            <span className="text-emerald-400">●</span>
            <span>Systems Operational</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
