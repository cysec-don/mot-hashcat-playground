"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Terminal,
  Upload,
  Settings2,
  Library,
  Wand2,
  Grid3x3,
  Cpu,
  Play,
  Square,
  Copy,
  RotateCcw,
  CheckCircle2,
  Zap,
  Lightbulb,
  Bot,
  Send,
  Loader2,
  Hash,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { WORDLISTS, RULES, MASK_PRESETS, MASK_CHARSET_LEGEND, ATTACK_MODES, HASHCAT_MODES } from "@/lib/hashcat-data";
import { toast } from "sonner";

type Phase = "idle" | "running" | "complete";

interface TerminalLine {
  type: "input" | "info" | "success" | "warn" | "error" | "progress" | "result";
  text: string;
  ts: number;
}

export function PlaygroundView() {
  // Config
  const [hashType, setHashType] = useState("MD5");
  const [hashcatMode, setHashcatMode] = useState(0);
  const [attackMode, setAttackMode] = useState(0);
  const [wordlist, setWordlist] = useState("rockyou-subset");
  const [rules, setRules] = useState<string>("");
  const [mask, setMask] = useState("?d?d?d?d?d?d");
  const [customHash, setCustomHash] = useState("");

  // Sim state
  const [phase, setPhase] = useState<Phase>("idle");
  const [progress, setProgress] = useState(0);
  const [speed, setSpeed] = useState(0);
  const [eta, setEta] = useState("");
  const [recovered, setRecovered] = useState<string | null>(null);
  const [lines, setLines] = useState<TerminalLine[]>([]);
  const [startTime, setStartTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // Chat
  const [chatMessages, setChatMessages] = useState<
    { role: "user" | "bot"; text: string }[]
  >([
    {
      role: "bot",
      text: "Welcome to the MOT Hashcat Playground learning assistant. Ask me anything about your attack — why it succeeded, better strategies, or alternative approaches.",
    },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);

  const terminalRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [lines]);

  // Set hashcat mode based on hashType
  useEffect(() => {
    const m = HASHCAT_MODES.find((x) => x.name === hashType);
    if (m) setHashcatMode(m.mode);
  }, [hashType]);

  const buildCommand = () => {
    let cmd = `hashcat -m ${hashcatMode} -a ${attackMode}`;
    if (attackMode === 0) {
      cmd += ` hashes.txt ${WORDLISTS.find((w) => w.id === wordlist)?.name ?? "rockyou.txt"}`;
      if (rules) cmd += ` -r ${RULES.find((r) => r.id === rules)?.filename}`;
    } else if (attackMode === 1) {
      cmd += ` hashes.txt left.txt right.txt`;
    } else if (attackMode === 3) {
      cmd += ` hashes.txt ${mask}`;
    } else if (attackMode === 6 || attackMode === 7) {
      cmd += ` ${attackMode === 6 ? "rockyou.txt ?d?d?d --increment" : "?d?d?d rockyou.txt --increment"}`;
      cmd += ` hashes.txt`;
    }
    return cmd;
  };

  const addLine = (type: TerminalLine["type"], text: string) => {
    setLines((prev) => [...prev, { type, text, ts: Date.now() }]);
  };

  const startAttack = async () => {
    if (phase === "running") return;
    setPhase("running");
    setProgress(0);
    setRecovered(null);
    setLines([]);
    setStartTime(Date.now());

    const cmd = buildCommand();
    addLine("input", `$ ${cmd}`);
    addLine("info", "hashcat (v6.2.6) starting in autodetect mode");
    addLine("info", `OpenCL Platform: NVIDIA CUDA / GeForce RTX 4090`);
    addLine("info", `Device: NVIDIA GeForce RTX 4090, 24576 MB, 128MCU`);
    addLine("info", `Hash.Mode........: ${hashcatMode} (${hashType})`);
    if (customHash) {
      addLine("info", `Hash.Target......: ${customHash.slice(0, 32)}${customHash.length > 32 ? "..." : ""}`);
    }
    addLine("info", `Time.Started.....: ${new Date().toLocaleString()}`);

    // Simulate speeds based on hash type
    const baseSpeed: Record<string, number> = {
      MD5: 100_000_000_000, // 100 GH/s
      SHA1: 35_000_000_000,
      "SHA2-256": 12_000_000_000,
      "Bitcoin/Litecoin wallet.dat (legacy)": 10_000_000,
    };
    const mySpeed = baseSpeed[hashType] ?? 1_000_000_000;
    const totalCandidates = attackMode === 3
      ? computeMaskKeyspace(mask)
      : 14_000_000 * (rules ? RULES.find((r) => r.id === rules)?.rules ?? 1 : 1);

    const realDurationMs = 4000; // 4 seconds of simulated runtime
    const intervalMs = 100;

    intervalRef.current = setInterval(() => {
      setProgress((prev) => {
        const next = Math.min(prev + (intervalMs / realDurationMs) * 100, 100);
        const elapsedMs = Date.now() - startTime;
        const curSpeed = mySpeed * (0.9 + Math.random() * 0.2);
        setSpeed(curSpeed);
        const remainingPct = 100 - next;
        const remainingMs = (remainingPct / 100) * realDurationMs;
        setEta(remainingMs > 1000 ? `${(remainingMs / 1000).toFixed(1)}s` : `${Math.round(remainingMs)}ms`);

        // Periodic progress lines
        if (Math.random() > 0.85 && next < 95) {
          addLine("progress", `Speed.#1.........: ${formatSpeed(curSpeed)} (${(elapsedMs / 1000).toFixed(2)}ms)`);
        }

        if (next >= 100) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          setPhase("complete");
          setDuration(realDurationMs);
          setSpeed(mySpeed);
          setEta("0s");

          // Simulate success based on hash type
          const successMap: Record<string, string> = {
            MD5: "password",
            SHA1: "password",
            "SHA2-256": "password",
            "Bitcoin/Litecoin wallet.dat (legacy)": "satoshi1",
          };
          const recoveredPw = successMap[hashType] ?? "password";
          setRecovered(recoveredPw);

          if (customHash || true) {
            const displayHash = customHash || "5f4dcc3b5aa765d61d8327deb882cf99";
            addLine("result", `${displayHash.slice(0, 32)}${displayHash.length > 32 ? "..." : ""}:${recoveredPw}`);
          }
          addLine("success", "Status...........: Cracked");
          addLine("info", `Recovered........: 1/1 (100.00%) Digests`);
          addLine("info", `Time.Elapsed.....: ${(realDurationMs / 1000).toFixed(2)}s`);

          // Log to server
          const token = localStorage.getItem("mot-token");
          if (token) {
            fetch("/api/playground", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                hashType,
                attackMode: ATTACK_MODES.find((a) => a.mode === attackMode)?.name ?? "Straight",
                wordlist: wordlist,
                rules: rules || null,
                mask: attackMode === 3 ? mask : null,
                command: cmd,
                recovered: true,
                duration: realDurationMs / 1000,
              }),
            }).then(() => {
              toast.success("+10 XP for playground session");
            }).catch(() => {});
          }
        }
        return next;
      });
    }, intervalMs);
  };

  const stopAttack = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setPhase("idle");
    setProgress(0);
    addLine("error", "Status...........: Aborted");
  };

  const reset = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setPhase("idle");
    setProgress(0);
    setSpeed(0);
    setEta("");
    setRecovered(null);
    setLines([]);
    setDuration(0);
  };

  const sendChat = async () => {
    if (!chatInput.trim() || chatLoading) return;
    const userMsg = chatInput.trim();
    setChatMessages((prev) => [...prev, { role: "user", text: userMsg }]);
    setChatInput("");
    setChatLoading(true);

    try {
      const res = await fetch("/api/playground-tutor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: userMsg,
          context: {
            hashType,
            attackMode: ATTACK_MODES.find((a) => a.mode === attackMode)?.name,
            wordlist: WORDLISTS.find((w) => w.id === wordlist)?.name,
            rules: rules ? RULES.find((r) => r.id === rules)?.name : null,
            mask: attackMode === 3 ? mask : null,
            recovered,
            command: buildCommand(),
          },
        }),
      });
      const data = await res.json();
      setChatMessages((prev) => [
        ...prev,
        { role: "bot", text: data.answer || "I couldn't generate a response." },
      ]);
    } catch {
      // Fallback: local response
      const fallback = generateLocalTutorResponse(userMsg, { hashType, attackMode, recovered });
      setChatMessages((prev) => [
        ...prev,
        { role: "bot", text: fallback },
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div className="flex items-center gap-2 text-xs text-cyan-400 mb-2">
          <Cpu className="h-3.5 w-3.5" />
          <span className="uppercase tracking-wider">Flagship Feature</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white">
          MOT <span className="cyber-gradient-text">Hashcat</span> Playground
        </h1>
        <p className="mt-2 text-sm text-slate-400 max-w-2xl">
          A dedicated cyber range for safe, educational Hashcat practice. Build
          attacks visually, watch the simulated terminal, and consult the
          built-in learning assistant.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left column - 2/3 - Builder + Terminal */}
        <div className="xl:col-span-2 space-y-6">
          {/* Builder */}
          <Card className="cyber-card p-6">
            <div className="flex items-center gap-2 mb-4">
              <Settings2 className="h-4 w-4 text-cyan-400" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Attack Builder
              </h2>
            </div>

            <Tabs defaultValue="config" className="w-full">
              <TabsList className="grid w-full grid-cols-4 bg-[#0B0F19] border border-cyan-500/15 h-9">
                <TabsTrigger value="config" className="text-xs data-[state=active]:bg-cyan-400/15 data-[state=active]:text-cyan-300">
                  Config
                </TabsTrigger>
                <TabsTrigger value="wordlist" className="text-xs data-[state=active]:bg-cyan-400/15 data-[state=active]:text-cyan-300">
                  Wordlist
                </TabsTrigger>
                <TabsTrigger value="rules" className="text-xs data-[state=active]:bg-cyan-400/15 data-[state=active]:text-cyan-300">
                  Rules
                </TabsTrigger>
                <TabsTrigger value="mask" className="text-xs data-[state=active]:bg-cyan-400/15 data-[state=active]:text-cyan-300">
                  Mask
                </TabsTrigger>
              </TabsList>

              {/* Config tab */}
              <TabsContent value="config" className="space-y-4 mt-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs text-slate-400">Hash Type</Label>
                    <Select value={hashType} onValueChange={setHashType}>
                      <SelectTrigger className="bg-[#0B0F19] border-cyan-500/25 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#111827] border-cyan-500/25">
                        {HASHCAT_MODES.filter((m) =>
                          ["MD5", "SHA1", "SHA2-256", "Bitcoin/Litecoin wallet.dat (legacy)"].includes(m.name)
                        ).map((m) => (
                          <SelectItem key={m.mode} value={m.name} className="text-white focus:bg-cyan-500/15">
                            <span className="font-mono text-xs">-m {m.mode}</span> · {m.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs text-slate-400">Attack Mode</Label>
                    <Select
                      value={String(attackMode)}
                      onValueChange={(v) => setAttackMode(Number(v))}
                    >
                      <SelectTrigger className="bg-[#0B0F19] border-cyan-500/25 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#111827] border-cyan-500/25">
                        {ATTACK_MODES.map((a) => (
                          <SelectItem key={a.mode} value={String(a.mode)} className="text-white focus:bg-cyan-500/15">
                            <span className="font-mono text-xs">{a.flag}</span> · {a.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs text-slate-400">
                    Custom Hash <span className="text-slate-600">(optional)</span>
                  </Label>
                  <Input
                    type="text"
                    value={customHash}
                    onChange={(e) => setCustomHash(e.target.value)}
                    placeholder="5f4dcc3b5aa765d61d8327deb882cf99"
                    className="bg-[#0B0F19] border-cyan-500/25 text-white font-mono focus:border-cyan-400"
                  />
                  <p className="text-[11px] text-slate-500">
                    Leave blank to use a default educational hash.
                  </p>
                </div>

                {attackMode === 3 && (
                  <div className="space-y-2">
                    <Label className="text-xs text-slate-400">Mask</Label>
                    <Input
                      type="text"
                      value={mask}
                      onChange={(e) => setMask(e.target.value)}
                      placeholder="?d?d?d?d?d?d"
                      className="bg-[#0B0F19] border-cyan-500/25 text-cyan-300 font-mono focus:border-cyan-400"
                    />
                    <div className="text-[11px] text-slate-500">
                      Keyspace: <span className="text-cyan-300 font-mono">{computeMaskKeyspace(mask).toLocaleString()}</span> candidates
                    </div>
                  </div>
                )}
              </TabsContent>

              {/* Wordlist tab */}
              <TabsContent value="wordlist" className="space-y-3 mt-4">
                <Label className="text-xs text-slate-400">Select a Wordlist</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-80 overflow-y-auto cyber-scrollbar pr-2">
                  {WORDLISTS.map((w) => (
                    <button
                      key={w.id}
                      onClick={() => setWordlist(w.id)}
                      className={`text-left rounded-lg border p-3 transition ${
                        wordlist === w.id
                          ? "border-cyan-400/50 bg-cyan-400/5"
                          : "border-white/10 hover:border-cyan-500/30 hover:bg-white/5"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-semibold text-white">{w.name}</span>
                        {wordlist === w.id && (
                          <CheckCircle2 className="h-3.5 w-3.5 text-cyan-400" />
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500 mb-1">
                        {w.entries.toLocaleString()} entries · {w.size}
                      </div>
                      <div className="text-[11px] text-slate-400 line-clamp-2">{w.description}</div>
                    </button>
                  ))}
                </div>
              </TabsContent>

              {/* Rules tab */}
              <TabsContent value="rules" className="space-y-3 mt-4">
                <Label className="text-xs text-slate-400">
                  Apply a Rule Set <span className="text-slate-600">(optional)</span>
                </Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <button
                    onClick={() => setRules("")}
                    className={`text-left rounded-lg border p-3 transition ${
                      !rules
                        ? "border-cyan-400/50 bg-cyan-400/5"
                        : "border-white/10 hover:border-cyan-500/30 hover:bg-white/5"
                    }`}
                  >
                    <div className="text-sm font-semibold text-white">No rules</div>
                    <div className="text-[11px] text-slate-500">Straight wordlist pass only</div>
                  </button>
                  {RULES.map((r) => (
                    <button
                      key={r.id}
                      onClick={() => setRules(r.id)}
                      className={`text-left rounded-lg border p-3 transition ${
                        rules === r.id
                          ? "border-cyan-400/50 bg-cyan-400/5"
                          : "border-white/10 hover:border-cyan-500/30 hover:bg-white/5"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-semibold text-white">{r.name}</span>
                        {rules === r.id && (
                          <CheckCircle2 className="h-3.5 w-3.5 text-cyan-400" />
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500 mb-1">
                        {r.rules > 0 ? `${r.rules.toLocaleString()} rules` : "user-defined"}
                      </div>
                      <div className="text-[11px] text-slate-400 line-clamp-2">{r.description}</div>
                    </button>
                  ))}
                </div>

                {rules && (
                  <div className="rounded-lg bg-[#060912] border border-cyan-500/15 p-3 mt-2">
                    <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-2">
                      Example mutations
                    </div>
                    <div className="space-y-1.5 max-h-40 overflow-y-auto cyber-scrollbar">
                      {RULES.find((r) => r.id === rules)?.exampleMutations.map((m, i) => (
                        <div key={i} className="flex items-center gap-2 text-[11px] font-mono">
                          <span className="text-slate-500">{m.word}</span>
                          <span className="text-cyan-400">+{m.rule}</span>
                          <span className="text-slate-500">→</span>
                          <span className="text-emerald-300">{m.result}</span>
                          <span className="text-slate-600 ml-auto text-[10px]">{m.explanation}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </TabsContent>

              {/* Mask tab */}
              <TabsContent value="mask" className="space-y-3 mt-4">
                <Label className="text-xs text-slate-400">Choose a Mask Preset</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {MASK_PRESETS.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => {
                        setMask(p.mask);
                        setAttackMode(3);
                      }}
                      className={`text-left rounded-lg border p-3 transition ${
                        mask === p.mask
                          ? "border-cyan-400/50 bg-cyan-400/5"
                          : "border-white/10 hover:border-cyan-500/30 hover:bg-white/5"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-semibold text-white">{p.name}</span>
                        {mask === p.mask && (
                          <CheckCircle2 className="h-3.5 w-3.5 text-cyan-400" />
                        )}
                      </div>
                      <div className="font-mono text-xs text-cyan-300">{p.mask}</div>
                      <div className="text-[11px] text-slate-400 mt-1">{p.description}</div>
                      <div className="text-[10px] text-slate-500 mt-1">
                        Keyspace: {p.keyspace.toLocaleString()} · e.g. {p.examplePassword}
                      </div>
                    </button>
                  ))}
                </div>

                <div className="rounded-lg bg-[#060912] border border-cyan-500/15 p-3 mt-2">
                  <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-2">
                    Mask charset legend
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {MASK_CHARSET_LEGEND.map((c) => (
                      <div key={c.token} className="text-[11px]">
                        <span className="font-mono text-cyan-300">{c.token}</span>{" "}
                        <span className="text-slate-400">{c.description}</span>
                        <div className="text-[10px] text-slate-600">{c.size}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            {/* Command preview */}
            <div className="mt-4 rounded-lg bg-[#060912] border border-cyan-500/25 p-3">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider">
                  Generated Hashcat Command
                </span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(buildCommand());
                    toast.success("Command copied");
                  }}
                  className="text-slate-500 hover:text-cyan-300 transition"
                >
                  <Copy className="h-3.5 w-3.5" />
                </button>
              </div>
              <code className="text-xs text-cyan-300 font-mono break-all">
                {buildCommand()}
              </code>
            </div>

            {/* Action buttons */}
            <div className="mt-4 flex gap-3">
              {phase !== "running" ? (
                <Button
                  onClick={startAttack}
                  className="flex-1 bg-gradient-to-r from-emerald-400 to-cyan-400 text-[#0B0F19] hover:from-emerald-300 hover:to-cyan-300 font-bold h-11"
                >
                  <Play className="h-4 w-4 mr-2" />
                  Launch Attack
                </Button>
              ) : (
                <Button
                  onClick={stopAttack}
                  variant="destructive"
                  className="flex-1 h-11"
                >
                  <Square className="h-4 w-4 mr-2" />
                  Abort
                </Button>
              )}
              <Button
                onClick={reset}
                variant="outline"
                className="border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/10 h-11"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
          </Card>

          {/* Simulated terminal */}
          <Card className="cyber-card p-0 overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-2.5 border-b border-cyan-500/20 bg-[#0B0F19]/80">
              <div className="flex gap-1.5">
                <div className="h-3 w-3 rounded-full bg-rose-500/70" />
                <div className="h-3 w-3 rounded-full bg-amber-500/70" />
                <div className="h-3 w-3 rounded-full bg-emerald-500/70" />
              </div>
              <div className="flex-1 text-center text-xs text-slate-500 font-mono">
                mot@hashcat-playground: ~/cyber-range
              </div>
              <Terminal className="h-3.5 w-3.5 text-cyan-400" />
            </div>

            {/* Status bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-cyan-500/10">
              <StatusCell label="Status" value={phase === "running" ? "Running" : phase === "complete" ? "Cracked" : "Idle"} color={phase === "running" ? "#FFC857" : phase === "complete" ? "#00FF88" : "#8B95A7"} />
              <StatusCell label="Speed" value={formatSpeed(speed)} color="#00E5FF" />
              <StatusCell label="Progress" value={`${progress.toFixed(1)}%`} color="#00FF88" />
              <StatusCell label="ETA" value={eta || "—"} color="#FFC857" />
            </div>

            {/* Progress bar */}
            <div className="px-3 py-2 bg-[#0B0F19]/60 border-b border-cyan-500/10">
              <div className="relative h-2 rounded-full bg-[#0B0F19] border border-cyan-500/15 overflow-hidden">
                <div
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-cyan-400 to-emerald-400 transition-all duration-100"
                  style={{ width: `${progress}%` }}
                />
                {phase === "running" && (
                  <div
                    className="absolute inset-y-0 left-0 progress-flow opacity-50"
                    style={{ width: `${progress}%` }}
                  />
                )}
              </div>
            </div>

            {/* Terminal output */}
            <div
              ref={terminalRef}
              className="terminal-bg p-4 h-80 overflow-y-auto cyber-scrollbar font-mono text-xs"
            >
              {lines.length === 0 ? (
                <div className="text-slate-600">
                  <div>$ <span className="cursor-blink" /></div>
                  <div className="mt-2">Configure your attack and press &ldquo;Launch Attack&rdquo; to begin.</div>
                </div>
              ) : (
                lines.map((line, i) => (
                  <div
                    key={i}
                    className={`mb-0.5 ${
                      line.type === "input"
                        ? "text-slate-300"
                        : line.type === "info"
                        ? "text-slate-400"
                        : line.type === "success"
                        ? "text-emerald-400 font-bold"
                        : line.type === "warn"
                        ? "text-amber-400"
                        : line.type === "error"
                        ? "text-rose-400"
                        : line.type === "progress"
                        ? "text-cyan-400"
                        : line.type === "result"
                        ? "text-white font-bold"
                        : "text-slate-300"
                    }`}
                  >
                    {line.text}
                  </div>
                ))
              )}
              {phase === "running" && (
                <div className="text-cyan-400 mt-1">$ <span className="cursor-blink" /></div>
              )}
            </div>
          </Card>

          {/* Results */}
          <AnimatePresence>
            {phase === "complete" && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <Card className="cyber-card p-6 border-emerald-500/40 bg-emerald-500/5">
                  <div className="flex items-center gap-2 mb-4">
                    <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                    <h3 className="text-base font-bold text-white">Attack Results</h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <ResultRow label="Recovered Password" value={recovered ?? "—"} highlight />
                    <ResultRow label="Attack Method" value={ATTACK_MODES.find((a) => a.mode === attackMode)?.name ?? "—"} />
                    <ResultRow label="Time Required" value={`${(duration / 1000).toFixed(2)}s`} />
                    <ResultRow label="Peak Speed" value={formatSpeed(speed)} />
                  </div>
                  <div className="mt-4 pt-4 border-t border-emerald-500/20">
                    <div className="text-xs text-slate-400 mb-2">Recommended Improvements</div>
                    <ul className="space-y-1.5">
                      {generateImprovements(hashType, attackMode, rules).map((imp, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-slate-300">
                          <Zap className="h-3 w-3 mt-0.5 text-amber-400 shrink-0" />
                          <span>{imp}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right column - 1/3 - Learning Assistant */}
        <div className="space-y-6">
          <Card className="cyber-card p-0 overflow-hidden flex flex-col h-[600px]">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-cyan-500/20 bg-gradient-to-r from-violet-500/10 to-transparent">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-400/15 border border-violet-400/30">
                <Bot className="h-4 w-4 text-violet-300" />
              </div>
              <div>
                <div className="text-sm font-bold text-white">Learning Assistant</div>
                <div className="text-[10px] text-slate-500">AI tutor for Hashcat</div>
              </div>
              <span className="ml-auto flex h-2 w-2">
                <span className="absolute inline-flex h-2 w-2 animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
              </span>
            </div>

            <div className="flex-1 overflow-y-auto cyber-scrollbar p-4 space-y-3">
              {chatMessages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-lg p-2.5 text-xs leading-relaxed ${
                      msg.role === "user"
                        ? "bg-cyan-400/15 border border-cyan-400/30 text-cyan-100"
                        : "bg-[#0B0F19] border border-violet-400/20 text-slate-300"
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
              {chatLoading && (
                <div className="flex justify-start">
                  <div className="bg-[#0B0F19] border border-violet-400/20 rounded-lg p-2.5">
                    <Loader2 className="h-3.5 w-3.5 text-violet-400 animate-spin" />
                  </div>
                </div>
              )}
            </div>

            <div className="border-t border-cyan-500/10 p-3">
              <div className="flex gap-2">
                <Input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      sendChat();
                    }
                  }}
                  placeholder="Ask about your attack..."
                  className="bg-[#0B0F19] border-cyan-500/25 text-white text-xs h-9"
                />
                <Button
                  onClick={sendChat}
                  disabled={chatLoading || !chatInput.trim()}
                  size="sm"
                  className="bg-violet-500/80 hover:bg-violet-500 text-white h-9 px-3"
                >
                  <Send className="h-3.5 w-3.5" />
                </Button>
              </div>

              {/* Suggested questions */}
              <div className="flex flex-wrap gap-1.5 mt-2">
                {[
                  "Why did this attack work?",
                  "What's a better strategy?",
                  "Common mistakes?",
                ].map((q) => (
                  <button
                    key={q}
                    onClick={() => setChatInput(q)}
                    className="text-[10px] px-2 py-1 rounded-md bg-white/5 hover:bg-violet-500/15 text-slate-400 hover:text-violet-300 transition border border-white/5"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          </Card>

          {/* Quick reference */}
          <Card className="cyber-card p-4">
            <div className="flex items-center gap-2 mb-3">
              <Hash className="h-3.5 w-3.5 text-cyan-400" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Hashcat Mode Reference
              </span>
            </div>
            <div className="space-y-1.5 max-h-64 overflow-y-auto cyber-scrollbar">
              {HASHCAT_MODES.slice(0, 8).map((m) => (
                <div key={m.mode} className="flex items-center gap-2 text-[11px]">
                  <span className="font-mono text-cyan-300 w-12">-m {m.mode}</span>
                  <span className="text-slate-300 flex-1 truncate">{m.name}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function StatusCell({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="bg-[#0B0F19] px-3 py-2">
      <div className="text-[10px] text-slate-500 uppercase tracking-wider">{label}</div>
      <div className="text-sm font-bold font-mono" style={{ color }}>
        {value}
      </div>
    </div>
  );
}

function ResultRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="rounded-lg bg-[#0B0F19] border border-cyan-500/15 p-3">
      <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">{label}</div>
      <div
        className={`text-base font-bold font-mono ${highlight ? "text-emerald-400" : "text-white"}`}
      >
        {value}
      </div>
    </div>
  );
}

function formatSpeed(s: number): string {
  if (s >= 1_000_000_000_000) return `${(s / 1_000_000_000_000).toFixed(2)} TH/s`;
  if (s >= 1_000_000_000) return `${(s / 1_000_000_000).toFixed(2)} GH/s`;
  if (s >= 1_000_000) return `${(s / 1_000_000).toFixed(2)} MH/s`;
  if (s >= 1_000) return `${(s / 1_000).toFixed(2)} kH/s`;
  return `${s.toFixed(0)} H/s`;
}

function computeMaskKeyspace(mask: string): number {
  const charsets: Record<string, number> = {
    "?l": 26,
    "?u": 26,
    "?d": 10,
    "?s": 33,
    "?a": 95,
    "?b": 256,
  };
  let keyspace = 1;
  let i = 0;
  while (i < mask.length) {
    if (mask[i] === "?") {
      const token = mask.slice(i, i + 2);
      if (charsets[token]) {
        keyspace *= charsets[token];
        i += 2;
        continue;
      }
    }
    i++;
  }
  return keyspace;
}

function generateImprovements(hashType: string, attackMode: number, rules: string | null): string[] {
  const tips: string[] = [];
  if (!rules && attackMode === 0) {
    tips.push("Apply best64.rule to multiply your wordlist by 76x — essentially free coverage.");
  }
  if (attackMode === 0) {
    tips.push("After best64.rule, try dive.rule for ~99,000 additional mutations.");
    tips.push("If you know the password structure, switch to a hybrid attack (-a 6) for wordlist + mask.");
  } else if (attackMode === 3) {
    tips.push("If the password is dictionary-based, switch to a wordlist + rules attack for higher yield.");
    tips.push("Use --increment to grow the mask length automatically when length is uncertain.");
  } else if (attackMode === 6 || attackMode === 7) {
    tips.push("Apply best64.rule to the wordlist side for additional mutations.");
    tips.push("Try the reverse hybrid (-a 7) if users prepend digits to dictionary words.");
  }
  if (hashType === "MD5" || hashType === "SHA1" || hashType === "SHA2-256") {
    tips.push("For production defense, replace this hash with Argon2id — memory-hard and GPU-resistant.");
  }
  return tips.slice(0, 4);
}

function generateLocalTutorResponse(question: string, ctx: { hashType: string; attackMode: number; recovered: string | null }): string {
  const q = question.toLowerCase();
  if (q.includes("why") && q.includes("work")) {
    return `Your ${ctx.hashType} attack succeeded because the password is short, common, and found in standard wordlists. ${ctx.hashType} is a fast hash — modern GPUs test billions of candidates per second, so any password in rockyou.txt is effectively unprotected.`;
  }
  if (q.includes("better") || q.includes("improve")) {
    return `To improve: (1) Apply best64.rule to multiply your wordlist by 76x. (2) Try a hybrid attack (-a 6) if you suspect word+digits patterns. (3) For exhaustive coverage, run dive.rule (~99,000 mutations). (4) As a last resort, construct a targeted mask based on the password policy.`;
  }
  if (q.includes("mistake") || q.includes("wrong")) {
    return `Common mistakes: (1) Choosing the wrong Hashcat -m mode — verify hash length first. (2) Forgetting --show to retrieve cracked results from the potfile. (3) Running pure brute force when a wordlist+rules would suffice. (4) Not saving the session with --session for resumability.`;
  }
  return `Great question. For ${ctx.hashType} with attack mode ${ctx.attackMode}, the key principle is: targeted attacks always outperform exhaustive ones. Use every clue (length, charset, dictionary patterns) to shrink the keyspace. The fastest attack is the one you don't have to run.`;
}
