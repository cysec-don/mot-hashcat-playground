"use client";

import { useApp, useSession } from "@/lib/store";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Terminal,
  LayoutDashboard,
  Trophy,
  Award,
  ShieldCheck,
  Wrench,
  Users,
  BadgeCheck,
  LogOut,
  ChevronDown,
  Home,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { view: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { view: "challenges", label: "Challenges", icon: Terminal },
  { view: "playground", label: "Playground", icon: Wrench },
  { view: "leaderboard", label: "Leaderboard", icon: Trophy },
  { view: "achievements", label: "Achievements", icon: Award },
  { view: "certificate", label: "Certificate", icon: BadgeCheck },
  { view: "verify", label: "Verify", icon: ShieldCheck },
] as const;

export function Navbar() {
  const { view, setView } = useApp();
  const { student, logout } = useSession();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-cyan-500/15 bg-[#0B0F19]/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <button
          onClick={() => setView(student ? "dashboard" : "landing")}
          className="flex items-center gap-2.5 group"
        >
          <div className="relative flex h-9 w-9 items-center justify-center rounded-md overflow-hidden border border-cyan-400/30">
            <img
              src="/mot-logo.jpg"
              alt="MOT Hashcat Playground Logo"
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 rounded-md pulse-glow opacity-50 pointer-events-none" />
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-sm font-bold tracking-tight text-white">
              MOT <span className="cyber-gradient-text">Hashcat</span>
            </span>
            <span className="text-[10px] text-cyan-400/70 tracking-[0.18em] uppercase">
              Playground
            </span>
          </div>
        </button>

        {/* Nav items - desktop */}
        {student && (
          <nav className="hidden lg:flex items-center gap-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const active = view === item.view;
              return (
                <button
                  key={item.view}
                  onClick={() => setView(item.view)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-medium transition-all",
                    active
                      ? "text-cyan-400 bg-cyan-400/10 border border-cyan-400/30"
                      : "text-slate-400 hover:text-cyan-300 hover:bg-white/5 border border-transparent"
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {item.label}
                </button>
              );
            })}
            {student.isAdmin && (
              <button
                onClick={() => setView("admin")}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-medium transition-all",
                  view === "admin"
                    ? "text-amber-400 bg-amber-400/10 border border-amber-400/30"
                    : "text-slate-400 hover:text-amber-300 hover:bg-white/5 border border-transparent"
                )}
              >
                <Users className="h-3.5 w-3.5" />
                Admin
              </button>
            )}
          </nav>
        )}

        {/* Right side */}
        <div className="flex items-center gap-3">
          {student ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 rounded-md border border-cyan-500/20 bg-white/5 px-3 py-1.5 text-xs hover:bg-white/10 transition">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-emerald-400 text-[10px] font-bold text-[#0B0F19]">
                    {student.fullName.slice(0, 1).toUpperCase()}
                  </div>
                  <span className="hidden sm:inline text-slate-200 font-medium max-w-[120px] truncate">
                    {student.fullName}
                  </span>
                  <ChevronDown className="h-3 w-3 text-slate-400" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-60 bg-[#111827] border-cyan-500/20"
              >
                <div className="px-3 py-2">
                  <div className="text-xs text-slate-400">Signed in as</div>
                  <div className="text-sm font-semibold text-white truncate">
                    {student.fullName}
                  </div>
                  {student.email && (
                    <div className="text-xs text-slate-500 truncate">
                      {student.email}
                    </div>
                  )}
                  <div className="mt-1.5 text-xs text-cyan-400">
                    {student.xp.toLocaleString()} XP
                  </div>
                </div>
                <DropdownMenuSeparator className="bg-cyan-500/10" />
                <DropdownMenuItem
                  onClick={() => setView("dashboard")}
                  className="text-slate-300 hover:text-cyan-300 cursor-pointer"
                >
                  <LayoutDashboard className="h-4 w-4 mr-2" /> Dashboard
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setView("certificate")}
                  className="text-slate-300 hover:text-cyan-300 cursor-pointer"
                >
                  <BadgeCheck className="h-4 w-4 mr-2" /> My Certificate
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    logout();
                    setView("landing");
                  }}
                  className="text-rose-300 hover:text-rose-200 cursor-pointer"
                >
                  <LogOut className="h-4 w-4 mr-2" /> Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              size="sm"
              onClick={() => setView("auth")}
              className="bg-gradient-to-r from-cyan-400 to-emerald-400 text-[#0B0F19] hover:from-cyan-300 hover:to-emerald-300 font-bold"
            >
              Sign In
            </Button>
          )}
        </div>
      </div>

      {/* Mobile nav */}
      {student && (
        <nav className="lg:hidden border-t border-cyan-500/10 overflow-x-auto cyber-scrollbar">
          <div className="flex items-center gap-1 px-2 py-2 min-w-max">
            <button
              onClick={() => setView("dashboard")}
              className={cn(
                "flex items-center gap-1.5 px-2.5 py-1.5 rounded text-[11px] font-medium transition-all whitespace-nowrap",
                view === "dashboard"
                  ? "text-cyan-400 bg-cyan-400/10"
                  : "text-slate-400 hover:text-cyan-300"
              )}
            >
              <Home className="h-3 w-3" /> Home
            </button>
            {NAV_ITEMS.slice(1).map((item) => {
              const Icon = item.icon;
              const active = view === item.view;
              return (
                <button
                  key={item.view}
                  onClick={() => setView(item.view)}
                  className={cn(
                    "flex items-center gap-1.5 px-2.5 py-1.5 rounded text-[11px] font-medium transition-all whitespace-nowrap",
                    active
                      ? "text-cyan-400 bg-cyan-400/10"
                      : "text-slate-400 hover:text-cyan-300"
                  )}
                >
                  <Icon className="h-3 w-3" />
                  {item.label}
                </button>
              );
            })}
          </div>
        </nav>
      )}
    </header>
  );
}
