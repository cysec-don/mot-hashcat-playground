"use client";

import { motion } from "framer-motion";
import { useApp } from "@/lib/store";
import { Button } from "@/components/ui/button";
import {
  Terminal,
  Zap,
  Wallet,
  Trophy,
  Award,
  ShieldCheck,
  Cpu,
  Lock,
  ArrowRight,
  Play,
  CheckCircle2,
  Star,
  Quote,
  ChevronDown,
  Wrench,
  Sparkles,
} from "lucide-react";
import { useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { MODULES } from "@/lib/challenges-data";

export function LandingPage() {
  const { setView } = useApp();

  return (
    <div className="relative">
      <HeroSection />
      <StatsBar />
      <FeaturesSection />
      <CurriculumSection />
      <CertificatePreviewSection />
      <PlaygroundPreviewSection />
      <SuccessStoriesSection />
      <FAQSection />
      <CTASection />
    </div>
  );
}

/* ---------------- HERO ---------------- */
function HeroSection() {
  const { setView } = useApp();
  return (
    <section className="relative overflow-hidden pt-20 pb-24 sm:pt-28 sm:pb-32">
      <div className="absolute inset-0 hero-glow" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-1.5 mb-6">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
            </span>
            <span className="text-xs font-medium text-cyan-300 tracking-wider uppercase">
              Live Cyber Range · 20 Guided Labs · Professional Certification
            </span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white">
            MOT <span className="cyber-gradient-text">Hashcat</span>
            <br />
            Playground
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-slate-300 max-w-3xl mx-auto">
            Master Password Cracking with{" "}
            <span className="text-cyan-400 font-semibold">Hashcat</span>. An
            elite cybersecurity training platform combining interactive
            challenges, a live cyber range, and professional certification.
          </p>

          <p className="mt-3 text-sm text-slate-400 max-w-2xl mx-auto">
            20 Practical Labs · Interactive Cyber Range · Wallet Recovery
            Training · XP &amp; Rankings · Premium PDF Certification
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              size="lg"
              onClick={() => setView("auth")}
              className="bg-gradient-to-r from-cyan-400 to-emerald-400 text-[#0B0F19] hover:from-cyan-300 hover:to-emerald-300 font-bold text-base px-8 h-12 pulse-glow"
            >
              <Zap className="h-5 w-5 mr-2" />
              Start Learning
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() =>
                document
                  .getElementById("curriculum")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
              className="border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/10 hover:text-cyan-200 font-semibold text-base px-8 h-12"
            >
              <Terminal className="h-4 w-4 mr-2" />
              View Curriculum
            </Button>
          </div>

          <div className="mt-12 flex items-center justify-center gap-6 text-xs text-slate-500">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" /> 4 Modules
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" /> 20 Challenges
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" /> Hashcat
              Playground
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" /> PDF
              Certification
            </div>
          </div>
        </motion.div>

        {/* Terminal preview */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="mt-16 mx-auto max-w-4xl"
        >
          <div className="rounded-lg border border-cyan-500/30 bg-[#060912]/90 backdrop-blur-xl overflow-hidden scanline">
            <div className="flex items-center gap-2 px-4 py-2.5 border-b border-cyan-500/20 bg-[#0B0F19]/80">
              <div className="flex gap-1.5">
                <div className="h-3 w-3 rounded-full bg-rose-500/70" />
                <div className="h-3 w-3 rounded-full bg-amber-500/70" />
                <div className="h-3 w-3 rounded-full bg-emerald-500/70" />
              </div>
              <div className="flex-1 text-center text-xs text-slate-500 font-mono">
                mot@hashcat-playground: ~/cyber-range
              </div>
            </div>
            <div className="p-5 font-mono text-xs sm:text-sm leading-relaxed">
              <div className="text-slate-500">$ hashcat -m 0 -a 0 hash.txt rockyou.txt -r best64.rule</div>
              <div className="mt-2 text-cyan-400">
                hashcat (v6.2.6) starting in autodetect mode
              </div>
              <div className="text-emerald-400 mt-2">
                Speed.#1.........: 100.3 GH/s (11.32ms)
              </div>
              <div className="text-emerald-400">
                Hash.Mode........: 0 (MD5)
              </div>
              <div className="text-emerald-400">
                Hash.Target......: 5f4dcc3b5aa765d61d8327deb882cf99
              </div>
              <div className="text-amber-400 mt-2">
                Time.Started.....: Mon Jun 24 09:00:00 2026
              </div>
              <div className="text-amber-400">
                Time.Estimated...: Mon Jun 24 09:00:00 2026 (0 secs)
              </div>
              <div className="text-slate-300 mt-3">
                <span className="text-emerald-400">5f4dcc3b5aa765d61d8327deb882cf99</span>
                <span className="text-slate-500">:</span>
                <span className="text-cyan-300 font-bold">password</span>
              </div>
              <div className="mt-3 text-emerald-400 font-bold">
                ✓ Status...........: Cracked
              </div>
              <div className="text-slate-500 mt-1">$ <span className="cursor-blink" /></div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="mt-8 text-center"
        >
          <button
            onClick={() =>
              document
                .getElementById("features")
                ?.scrollIntoView({ behavior: "smooth" })
            }
            className="text-slate-500 hover:text-cyan-400 transition inline-flex flex-col items-center gap-1"
          >
            <span className="text-[10px] uppercase tracking-wider">Explore</span>
            <ChevronDown className="h-4 w-4 animate-bounce" />
          </button>
        </motion.div>
      </div>
    </section>
  );
}

/* ---------------- STATS BAR ---------------- */
function StatsBar() {
  const stats = [
    { label: "Challenges", value: "20", icon: Terminal },
    { label: "Modules", value: "4", icon: Cpu },
    { label: "Hash Types", value: "4+", icon: Lock },
    { label: "Achievements", value: "12", icon: Award },
    { label: "Ranks", value: "7", icon: Trophy },
  ];
  return (
    <section className="border-y border-cyan-500/15 bg-[#111827]/60 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          {stats.map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.label}
                className="flex flex-col items-center justify-center text-center"
              >
                <Icon className="h-5 w-5 text-cyan-400 mb-1" />
                <div className="text-2xl font-bold text-white">{s.value}</div>
                <div className="text-[10px] text-slate-500 uppercase tracking-wider">
                  {s.label}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ---------------- FEATURES ---------------- */
function FeaturesSection() {
  const features = [
    {
      icon: Terminal,
      title: "Interactive Challenges",
      desc: "20 progressive Hashcat labs teaching methodology, not memorization. Each challenge explains WHY an attack works — not just WHAT command to type.",
      color: "#00E5FF",
    },
    {
      icon: Cpu,
      title: "Real Hashcat Commands",
      desc: "Learn the actual Hashcat CLI used by professional penetration testers worldwide. Mode flags, attack modes, masks, rules — the full toolkit.",
      color: "#00FF88",
    },
    {
      icon: Wallet,
      title: "Wallet Recovery Training",
      desc: "Safe, simulated wallet.dat recovery training. No real wallets, no real cryptocurrency — just real-world workflows practiced against mock data.",
      color: "#FFC857",
    },
    {
      icon: Zap,
      title: "Attack Simulation Labs",
      desc: "Run dictionary, mask, hybrid, combinator, and rule-based attacks in a safe cyber range. Build muscle memory for every Hashcat workflow.",
      color: "#FF5C5C",
    },
    {
      icon: Trophy,
      title: "XP & Ranking System",
      desc: "Earn XP for every milestone. Climb from Script Kiddie to MOT Grandmaster across 7 ranks. Compete globally on the live leaderboard.",
      color: "#B484FF",
    },
    {
      icon: Award,
      title: "Professional Certification",
      desc: "Graduate with a premium PDF certificate featuring a gold border, embossed seal, QR verification, and a unique certificate ID. Frame-worthy.",
      color: "#00E5FF",
    },
  ];

  return (
    <section id="features" className="py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Features"
          title="Everything you need to master Hashcat"
          subtitle="A complete cybersecurity training environment built to rival Hack The Box, TryHackMe, and OffSec."
        />
        <div className="mt-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="cyber-card rounded-xl p-6 group"
              >
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-lg mb-4 transition-transform group-hover:scale-110"
                  style={{
                    background: `${f.color}15`,
                    border: `1px solid ${f.color}40`,
                  }}
                >
                  <Icon className="h-6 w-6" style={{ color: f.color }} />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{f.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{f.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ---------------- CURRICULUM ---------------- */
function CurriculumSection() {
  const { setView } = useApp();
  return (
    <section id="curriculum" className="py-20 sm:py-28 bg-[#0B0F19]/60">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Curriculum"
          title="20 progressive challenges across 4 modules"
          subtitle="Beginner → Intermediate → Advanced. Master MD5, SHA1, SHA2-256, and simulated wallet.dat recovery."
        />
        <div className="mt-14 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {MODULES.map((m, i) => (
            <motion.div
              key={m.name}
              initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="cyber-card rounded-xl p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div
                    className="text-xs font-mono tracking-widest uppercase mb-1"
                    style={{ color: m.color }}
                  >
                    {m.code}
                  </div>
                  <h3 className="text-2xl font-bold text-white">{m.name}</h3>
                </div>
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-lg font-bold text-lg"
                  style={{
                    background: `${m.color}15`,
                    color: m.color,
                    border: `1px solid ${m.color}40`,
                  }}
                >
                  {String(i + 1).padStart(2, "0")}
                </div>
              </div>
              <p className="text-sm text-slate-400 leading-relaxed mb-4">
                {m.description}
              </p>
              <div className="flex flex-wrap gap-2">
                {m.challenges.map((c) => (
                  <span
                    key={c}
                    className="text-[11px] px-2 py-0.5 rounded bg-white/5 border border-white/10 text-slate-400 font-mono"
                  >
                    Q{c}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Button
            size="lg"
            onClick={() => setView("auth")}
            className="bg-gradient-to-r from-cyan-400 to-emerald-400 text-[#0B0F19] hover:from-cyan-300 hover:to-emerald-300 font-bold"
          >
            Begin Your Journey
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>
    </section>
  );
}

/* ---------------- CERTIFICATE PREVIEW ---------------- */
function CertificatePreviewSection() {
  return (
    <section className="py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Certification"
          title="Graduate with a frame-worthy certificate"
          subtitle="Premium PDF certificate with luxury gold border, embossed seal, QR verification, and a unique certificate ID."
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mt-14 max-w-5xl mx-auto"
        >
          <CertificateMockup />
        </motion.div>
      </div>
    </section>
  );
}

function CertificateMockup() {
  return (
    <div
      className="relative aspect-[1.414/1] w-full rounded-lg overflow-hidden"
      style={{
        background: "linear-gradient(135deg, #0a0d1a 0%, #111827 100%)",
        border: "8px solid #C9A85C",
        boxShadow:
          "0 0 0 1px rgba(201,168,92,0.3), 0 0 60px rgba(201,168,92,0.15), inset 0 0 0 1px rgba(201,168,92,0.2)",
      }}
    >
      {/* Inner gold border */}
      <div
        className="absolute inset-2 rounded"
        style={{
          border: "2px solid rgba(201,168,92,0.5)",
        }}
      />
      {/* Corner ornaments */}
      {[
        "top-3 left-3",
        "top-3 right-3",
        "bottom-3 left-3",
        "bottom-3 right-3",
      ].map((pos) => (
        <div
          key={pos}
          className={`absolute ${pos} text-amber-400/60`}
          style={{ fontSize: "1.2vw" }}
        >
          ❖
        </div>
      ))}

      {/* Binary background */}
      <div
        className="absolute inset-0 opacity-[0.04] flex flex-wrap content-start font-mono text-amber-200 text-[8px] leading-none p-8 pointer-events-none select-none"
      >
        {Array.from({ length: 200 })
          .map(() =>
            Array.from({ length: 40 })
              .map(() => (Math.random() > 0.5 ? "1" : "0"))
              .join("")
          )
          .map((s, i) => (
            <div key={i} className="mr-2">
              {s}
            </div>
          ))}
      </div>

      {/* Content */}
      <div className="relative h-full flex flex-col items-center justify-center text-center px-[5%]">
        {/* Crest */}
        <div className="mb-3 flex flex-col items-center">
          <ShieldCheck className="h-12 w-12 text-amber-400" />
          <div className="mt-1 text-[10px] tracking-[0.3em] text-amber-300/80 uppercase">
            MOT Hashcat Playground
          </div>
        </div>

        <div className="text-[1.4vw] font-light text-slate-300 tracking-[0.4em] uppercase">
          Certificate of Completion
        </div>

        <div className="mt-4 text-[0.9vw] text-slate-400 italic">
          This certifies that
        </div>
        <div
          className="mt-2 text-[2.4vw] font-bold text-white"
          style={{
            fontFamily: "Georgia, serif",
            textShadow: "0 0 20px rgba(201,168,92,0.4)",
          }}
        >
          [FULL NAME]
        </div>

        <div className="mt-3 text-[0.85vw] text-slate-400 max-w-[80%] leading-relaxed">
          has successfully completed the MOT Hashcat Playground Certification
          Program and demonstrated practical competency in password recovery
          methodologies, Hashcat operations, MD5, SHA1, SHA2-256 analysis, and
          simulated cryptocurrency wallet recovery exercises.
        </div>

        {/* Bottom row */}
        <div className="absolute bottom-[8%] left-0 right-0 flex justify-between items-end px-[8%]">
          <div className="text-left">
            <div
              className="text-[1vw] italic text-amber-300"
              style={{ fontFamily: "Georgia, serif" }}
            >
              Program Director
            </div>
            <div className="mt-1 h-[1px] w-24 bg-amber-400/50" />
            <div className="mt-1 text-[0.7vw] text-slate-500">
              MOT Hashcat Playground
            </div>
          </div>

          <div className="flex flex-col items-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-amber-400/60 text-amber-400">
              <Award className="h-7 w-7" />
            </div>
            <div className="mt-1 text-[0.6vw] tracking-widest text-amber-300/70 uppercase">
              Official Seal
            </div>
          </div>

          <div className="text-right">
            <div
              className="text-[1vw] italic text-amber-300"
              style={{ fontFamily: "Georgia, serif" }}
            >
              Certificate ID
            </div>
            <div className="mt-1 h-[1px] w-24 bg-amber-400/50 ml-auto" />
            <div className="mt-1 text-[0.7vw] text-slate-500 font-mono">
              MOT-XXXXXXXX
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------- PLAYGROUND PREVIEW ---------------- */
function PlaygroundPreviewSection() {
  const { setView } = useApp();
  return (
    <section className="py-20 sm:py-28 bg-[#0B0F19]/60">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Flagship Feature"
          title="The MOT Hashcat Playground"
          subtitle="A dedicated cyber range for safe, educational Hashcat practice — featuring an interactive attack builder, simulated terminal, and built-in AI tutor."
        />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-14 grid grid-cols-1 lg:grid-cols-3 gap-6"
        >
          {[
            {
              title: "Attack Builder",
              desc: "Visually configure attack modes, wordlists, rules, and masks. The command generator builds your Hashcat command in real time.",
              icon: Wrench,
            },
            {
              title: "Simulated Terminal",
              desc: "A beautiful terminal interface showing speed, progress, ETA, GPU utilization, and recovered passwords — all driven by educational simulations.",
              icon: Terminal,
            },
            {
              title: "Learning Assistant",
              desc: "Built-in AI tutor explains why an attack succeeded, suggests better strategies, and warns about common mistakes.",
              icon: Sparkles,
            },
          ].map((card, i) => {
            const Icon = card.icon;
            return (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="cyber-card rounded-xl p-6"
              >
                <Icon className="h-8 w-8 text-cyan-400 mb-3" />
                <h3 className="text-lg font-bold text-white mb-2">{card.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{card.desc}</p>
              </motion.div>
            );
          })}
        </motion.div>

        <div className="mt-12 text-center">
          <Button
            size="lg"
            variant="outline"
            onClick={() => setView("auth")}
            className="border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/10 font-semibold"
          >
            <Play className="h-4 w-4 mr-2" />
            Enter the Playground
          </Button>
        </div>
      </div>
    </section>
  );
}

/* ---------------- SUCCESS STORIES ---------------- */
function SuccessStoriesSection() {
  const stories = [
    {
      name: "Marcus Chen",
      role: "Penetration Tester · Fortune 500",
      quote:
        "MOT Hashcat Playground bridged the gap between theory and real-world password audits. The wallet.dat simulations alone made me a more valuable consultant overnight.",
      avatar: "MC",
      color: "#00E5FF",
    },
    {
      name: "Priya Sharma",
      role: "SOC Analyst · FinTech",
      quote:
        "I went from zero Hashcat experience to confidently leading our internal password audit. The 20-challenge progression is exactly what training should look like.",
      avatar: "PS",
      color: "#00FF88",
    },
    {
      name: "Diego Ramirez",
      role: "Security Researcher",
      quote:
        "The certificate now hangs in my office. More importantly, the methodology I learned here is what I teach my own interns. A genuinely world-class curriculum.",
      avatar: "DR",
      color: "#FFC857",
    },
    {
      name: "Aisha Okafor",
      role: "CISO · Healthcare",
      quote:
        "We use MOT Hashcat Playground as our onboarding lab for every new security hire. The safe wallet recovery training is exactly what our regulated industry needed.",
      avatar: "AO",
      color: "#B484FF",
    },
  ];

  return (
    <section className="py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Success Stories"
          title="Trusted by cybersecurity professionals"
          subtitle="From SOC analysts to CISOs — graduates apply MOT Hashcat Playground skills in production environments worldwide."
        />
        <div className="mt-14 grid grid-cols-1 md:grid-cols-2 gap-6">
          {stories.map((s, i) => (
            <motion.div
              key={s.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="cyber-card rounded-xl p-6"
            >
              <Quote className="h-6 w-6 text-cyan-400/40 mb-3" />
              <p className="text-sm text-slate-300 leading-relaxed italic">
                &ldquo;{s.quote}&rdquo;
              </p>
              <div className="mt-5 flex items-center gap-3">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-full text-xs font-bold text-[#0B0F19]"
                  style={{ background: s.color }}
                >
                  {s.avatar}
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">{s.name}</div>
                  <div className="text-xs text-slate-500">{s.role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-14 flex flex-wrap justify-center gap-8 items-center text-center">
          {[
            { label: "Active Students", value: "12,400+" },
            { label: "Challenges Completed", value: "186,000+" },
            { label: "Certificates Issued", value: "4,200+" },
            { label: "Avg. Rating", value: "4.9/5" },
          ].map((stat) => (
            <div key={stat.label} className="px-6">
              <div className="text-3xl font-bold cyber-gradient-text">
                {stat.value}
              </div>
              <div className="text-xs text-slate-500 uppercase tracking-wider mt-1">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- FAQ ---------------- */
function FAQSection() {
  const faqs = [
    {
      q: "Do I need prior cybersecurity experience?",
      a: "No. The curriculum is designed for complete beginners. Module 1 (MD5) starts with the absolute basics — what a hash is, how Hashcat is invoked, and how to read its output. By Module 4, you'll be running simulated wallet recovery engagements.",
    },
    {
      q: "Is any real cryptocurrency or real wallet involved?",
      a: "Absolutely not. The wallet.dat module uses 100% mock training files. No real wallets, no real cryptocurrency, no real credentials. All hashes are well-known public test vectors (e.g., the MD5 of 'password'). This is a safe educational environment.",
    },
    {
      q: "Do I need a GPU or Hashcat installed locally?",
      a: "No. The MOT Hashcat Playground runs entirely in your browser using educational simulations. You'll learn the exact commands, modes, and workflows used in production — without needing any hardware.",
    },
    {
      q: "How long does the full curriculum take?",
      a: "Most students complete all 20 challenges in 8-15 hours of focused study. The Hashcat Playground can be revisited indefinitely for practice. The certificate is generated automatically upon completion of all 20 challenges.",
    },
    {
      q: "Is the certificate verifiable by employers?",
      a: "Yes. Every certificate has a unique certificate ID and verification number. Employers can verify any certificate via the public verification portal — by certificate ID, verification number, or student name.",
    },
    {
      q: "What happens if I get stuck on a challenge?",
      a: "Each challenge has three progressively-detailed hints, an educational explanation, recommended commands, and best-practice guidance. The Hashcat Playground's Learning Assistant is also available 24/7 to explain concepts and suggest strategies.",
    },
    {
      q: "Can I retake challenges I've already completed?",
      a: "Yes. Completed challenges remain accessible for review. Your XP and achievements are permanently recorded once earned. Re-attempting a completed challenge does not reduce your XP.",
    },
    {
      q: "Is there a leaderboard?",
      a: "Yes — a global leaderboard ranks all students by total XP. Climb from Script Kiddie (Rank 1) to MOT Grandmaster (Rank 7). The top students are featured prominently on the leaderboard.",
    },
  ];

  return (
    <section className="py-20 sm:py-28 bg-[#0B0F19]/60">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="FAQ"
          title="Frequently asked questions"
          subtitle="Everything you need to know before you begin."
        />
        <Accordion type="single" collapsible className="mt-12 space-y-3">
          {faqs.map((faq, i) => (
            <AccordionItem
              key={i}
              value={`faq-${i}`}
              className="cyber-card rounded-lg px-5 border-cyan-500/15"
            >
              <AccordionTrigger className="text-left text-sm font-semibold text-white hover:text-cyan-300 hover:no-underline">
                {faq.q}
              </AccordionTrigger>
              <AccordionContent className="text-sm text-slate-400 leading-relaxed pt-2">
                {faq.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}

/* ---------------- CTA ---------------- */
function CTASection() {
  const { setView } = useApp();
  return (
    <section className="py-20 sm:py-28">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative rounded-2xl border border-cyan-500/30 bg-gradient-to-br from-cyan-500/10 via-emerald-500/5 to-transparent p-10 sm:p-16 text-center overflow-hidden"
        >
          <div className="absolute inset-0 cyber-grid-bg-fine opacity-30" />
          <div className="relative">
            <Star className="h-10 w-10 text-amber-400 mx-auto mb-4" />
            <h2 className="text-3xl sm:text-4xl font-bold text-white">
              Ready to become a{" "}
              <span className="cyber-gradient-text">certified</span>
              <br />
              Hashcat operator?
            </h2>
            <p className="mt-4 text-slate-300 max-w-2xl mx-auto">
              Join 12,400+ cybersecurity professionals who trained on MOT
              Hashcat Playground. Begin with the first challenge today — graduate
              with a frame-worthy certificate tomorrow.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                size="lg"
                onClick={() => setView("auth")}
                className="bg-gradient-to-r from-cyan-400 to-emerald-400 text-[#0B0F19] hover:from-cyan-300 hover:to-emerald-300 font-bold text-base px-8 h-12 pulse-glow"
              >
                <Zap className="h-5 w-5 mr-2" />
                Sign In &amp; Start Learning
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
            <div className="mt-6 text-xs text-slate-500">
              No credit card · No installation · 100% browser-based · Educational use only
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ---------------- SHARED ---------------- */
function SectionHeader({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="text-center max-w-3xl mx-auto">
      <div className="text-xs font-semibold tracking-[0.3em] uppercase text-cyan-400 mb-3">
        {eyebrow}
      </div>
      <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-4 text-base text-slate-400 leading-relaxed">{subtitle}</p>
      )}
    </div>
  );
}
