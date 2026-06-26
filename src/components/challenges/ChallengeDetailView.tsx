"use client";

import { useApp, useSession } from "@/lib/store";
import { useDashboardData } from "@/hooks/useDashboardData";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import {
  Terminal,
  ArrowLeft,
  Lightbulb,
  CheckCircle2,
  XCircle,
  Zap,
  Award,
  Target,
  BookOpen,
  Shield,
  Wrench,
  ChevronRight,
  Loader2,
  Lock,
  ArrowRight,
  Copy,
  Share2,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { getChallenge, CHALLENGES } from "@/lib/challenges-data";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { apiFetch } from "@/lib/api-client";
import { ShareCard } from "@/components/shared/ShareCard";

const DIFFICULTY_COLOR: Record<string, string> = {
  Beginner: "#00FF88",
  Intermediate: "#FFC857",
  Advanced: "#FF5C5C",
  Expert: "#B484FF",
};

// Fisher-Yates shuffle for answer randomization (Issue #1 fix)
function shuffleArray<T>(arr: T[]): T[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor((crypto.getRandomValues(new Uint32Array(1))[0] / 2 ** 32) * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Progressive hint messages — never reveal the answer (Issue #2 fix)
const PROGRESSIVE_HINTS = [
  "Incorrect. Review the challenge materials and try again.",
  "Incorrect. Take a closer look at the educational context above.",
  "Incorrect. Consider reviewing the recommended commands and best practices.",
  "Incorrect. Would you like to revisit the lesson? The hint system can guide you.",
];

export function ChallengeDetailView() {
  const { selectedChallengeId, setView, setChallenge } = useApp();
  const { student } = useSession();
  const { data, refresh } = useDashboardData();
  const [answer, setAnswer] = useState("");
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const [shuffledOptions, setShuffledOptions] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [result, setResult] = useState<{
    correct: boolean;
    explanation: string;
    newlyUnlocked?: string[];
  } | null>(null);

  const challenge = selectedChallengeId ? getChallenge(selectedChallengeId) : null;

  // Issue #1: Shuffle options on every challenge load
  // Issue #2: Reset wrong attempts and result on challenge change
  useEffect(() => {
    setAnswer("");
    setSelectedOption(null);
    setHintsUsed(0);
    setWrongAttempts(0);
    setResult(null);
    if (challenge?.options) {
      setShuffledOptions(shuffleArray(challenge.options));
    } else {
      setShuffledOptions([]);
    }
  }, [selectedChallengeId]);

  if (!challenge) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12 text-center">
        <p className="text-slate-400">Challenge not found.</p>
        <Button onClick={() => setView("challenges")} className="mt-4">
          Back to Challenges
        </Button>
      </div>
    );
  }

  const existingResult = data?.challengeResults.find(
    (r) => r.challengeId === challenge.id
  );
  const alreadyCompleted = existingResult?.completed ?? false;
  const preHintsUsed = existingResult?.hintsUsed ?? 0;
  const effectiveHintsUsed = Math.max(hintsUsed, preHintsUsed);

  const handleSubmit = async () => {
    if (!student) return;

    const userAnswer =
      challenge.questionType === "crack" ? answer.trim() : selectedOption;

    if (!userAnswer) {
      toast.error("Please provide an answer before submitting.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await apiFetch("/api/progress", {
        method: "POST",
        body: {
          challengeId: challenge.id,
          answer: userAnswer,
          hintsUsed: effectiveHintsUsed,
        },
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Submission failed");

      setResult({
        correct: json.correct,
        explanation: json.explanation,
        newlyUnlocked: json.newlyUnlocked,
      });

      if (json.correct) {
        toast.success(`Correct! +${challenge.xp} XP earned`);
        if (json.newlyUnlocked?.length) {
          for (const achId of json.newlyUnlocked) {
            setTimeout(() => toast.success(`Achievement unlocked: ${achId}`), 500);
          }
        }
      } else {
        // Issue #2: Increment wrong attempts, NEVER reveal the answer
        setWrongAttempts((prev) => prev + 1);
        toast.error("Incorrect. Review the materials and try again.");
      }
      refresh();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Submission failed";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const useHint = async () => {
    if (hintsUsed >= 4) return;
    setHintsUsed(hintsUsed + 1);
    apiFetch("/api/progress", {
      method: "PATCH",
      body: { challengeId: challenge.id },
    }).catch(() => {});
  };

  const nextChallenge = CHALLENGES.find((c) => c.id === challenge.id + 1);

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8">
      <button
        onClick={() => setView("challenges")}
        className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-cyan-300 mb-4 transition"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to Challenges
      </button>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div className="flex items-center gap-2 mb-2">
          <Badge
            variant="outline"
            className="text-[10px]"
            style={{ color: DIFFICULTY_COLOR[challenge.difficulty], borderColor: `${DIFFICULTY_COLOR[challenge.difficulty]}40` }}
          >
            {challenge.difficulty}
          </Badge>
          <Badge variant="outline" className="text-[10px] border-cyan-500/30 text-cyan-300">
            {challenge.module}
          </Badge>
          <Badge variant="outline" className="text-[10px] border-amber-500/30 text-amber-300">
            <Zap className="h-2.5 w-2.5 mr-0.5" /> {challenge.xp} XP
          </Badge>
          {alreadyCompleted && (
            <Badge variant="outline" className="text-[10px] border-emerald-500/40 text-emerald-300 bg-emerald-500/10">
              <CheckCircle2 className="h-2.5 w-2.5 mr-0.5" /> Completed
            </Badge>
          )}
        </div>
        <div className="text-xs text-slate-500 mb-1">Challenge {String(challenge.id).padStart(2, "0")}/100</div>
        <h1 className="text-3xl font-bold text-white">{challenge.title}</h1>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main column - 2/3 */}
        <div className="lg:col-span-2 space-y-6">
          {/* Scenario */}
          <Card className="cyber-card p-6">
            <div className="flex items-center gap-2 mb-3">
              <BookOpen className="h-4 w-4 text-cyan-400" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">Scenario</h2>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed">{challenge.scenario}</p>
          </Card>

          {/* Objective */}
          <Card className="cyber-card p-6">
            <div className="flex items-center gap-2 mb-3">
              <Target className="h-4 w-4 text-emerald-400" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">Objective</h2>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed">{challenge.objective}</p>
          </Card>

          {/* Hash (if applicable) */}
          {challenge.hash && (
            <Card className="cyber-card p-6">
              <div className="flex items-center gap-2 mb-3">
                <Lock className="h-4 w-4 text-amber-400" />
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                  {challenge.hashType || "Hash"}
                </h2>
                {challenge.hashcatMode !== undefined && (
                  <Badge variant="outline" className="text-[10px] border-cyan-500/30 text-cyan-300 ml-auto">
                    Hashcat -m {challenge.hashcatMode}
                  </Badge>
                )}
              </div>
              <div className="rounded-lg bg-[#060912] border border-cyan-500/20 p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider">Hash Value</span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(challenge.hash!);
                      toast.success("Hash copied to clipboard");
                    }}
                    className="text-slate-500 hover:text-cyan-300 transition"
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </button>
                </div>
                <div className="hash-mono text-sm text-cyan-300 break-all">
                  {challenge.hash}
                </div>
              </div>
            </Card>
          )}

          {/* Educational context */}
          <Card className="cyber-card p-6">
            <div className="flex items-center gap-2 mb-3">
              <BookOpen className="h-4 w-4 text-violet-400" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">Educational Context</h2>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed">{challenge.educationalContext}</p>
          </Card>

          {/* Answer area */}
          <Card className="cyber-card p-6">
            <div className="flex items-center gap-2 mb-4">
              <Terminal className="h-4 w-4 text-cyan-400" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">Your Answer</h2>
            </div>

            {challenge.questionType === "crack" ? (
              <div className="space-y-3">
                <Label className="text-xs text-slate-400">
                  Enter the recovered plaintext password
                </Label>
                <Input
                  type="text"
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder="e.g. password"
                  className="bg-[#0B0F19] border-cyan-500/25 text-white font-mono focus:border-cyan-400"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !submitting) handleSubmit();
                  }}
                />
                <p className="text-[11px] text-slate-500">
                  Tip: passwords are case-insensitive for this challenge.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <Label className="text-xs text-slate-400">
                  Select the correct answer
                </Label>
                <RadioGroup
                  value={selectedOption ?? ""}
                  onValueChange={setSelectedOption}
                  className="space-y-2"
                >
                  {shuffledOptions.map((opt) => (
                    <label
                      key={opt}
                      className={`flex items-start gap-3 rounded-lg border p-3 cursor-pointer transition ${
                        selectedOption === opt
                          ? "border-cyan-400/50 bg-cyan-400/5"
                          : "border-white/10 hover:border-cyan-500/30 hover:bg-white/5"
                      }`}
                    >
                      <RadioGroupItem value={opt} className="mt-0.5 border-cyan-500/40 text-cyan-400" />
                      <span className="text-sm text-slate-300 font-mono">{opt}</span>
                    </label>
                  ))}
                </RadioGroup>
              </div>
            )}

            <Button
              onClick={handleSubmit}
              disabled={submitting || (!answer && !selectedOption)}
              className="w-full mt-4 bg-gradient-to-r from-cyan-400 to-emerald-400 text-[#0B0F19] hover:from-cyan-300 hover:to-emerald-300 font-bold h-11"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4 mr-2" />
                  Submit Answer
                </>
              )}
            </Button>

            {/* Result — Issue #2: NEVER reveal explanation on wrong answers */}
            <AnimatePresence>
              {result && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className={`mt-4 rounded-lg border p-4 ${
                    result.correct
                      ? "border-emerald-500/40 bg-emerald-500/5"
                      : "border-rose-500/40 bg-rose-500/5"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    {result.correct ? (
                      <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                    ) : (
                      <XCircle className="h-5 w-5 text-rose-400" />
                    )}
                    <span
                      className={`text-sm font-bold ${
                        result.correct ? "text-emerald-300" : "text-rose-300"
                      }`}
                    >
                      {result.correct ? "Correct!" : "Incorrect"}
                    </span>
                  </div>
                  {/* Explanation ONLY shown when correct — never on wrong answers */}
                  {result.correct ? (
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {result.explanation}
                    </p>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-xs text-rose-200 leading-relaxed">
                        {PROGRESSIVE_HINTS[Math.min(wrongAttempts - 1, PROGRESSIVE_HINTS.length - 1)] || PROGRESSIVE_HINTS[PROGRESSIVE_HINTS.length - 1]}
                      </p>
                      {wrongAttempts >= 2 && (
                        <p className="text-[11px] text-slate-400">
                          Wrong attempts: {wrongAttempts}. Use the hint system on the right for progressive guidance.
                        </p>
                      )}
                    </div>
                  )}
                  {result.correct && nextChallenge && (
                    <div className="mt-3 flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => {
                          setChallenge(nextChallenge.id);
                          setResult(null);
                        }}
                        className="bg-gradient-to-r from-cyan-400 to-emerald-400 text-[#0B0F19] hover:from-cyan-300 hover:to-emerald-300 font-semibold"
                      >
                        Next Challenge
                        <ArrowRight className="h-3 w-3 ml-1" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setShareOpen(true)}
                        className="border-amber-500/30 text-amber-300 hover:bg-amber-500/10"
                      >
                        <Share2 className="h-3 w-3 mr-1" />
                        Share
                      </Button>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </Card>
        </div>

        {/* Sidebar - 1/3 */}
        <div className="space-y-6">
          {/* Progressive Hints — 4 levels, never reveal the answer */}
          <Card className="cyber-card p-6">
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb className="h-4 w-4 text-amber-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Progressive Hints</h3>
              <span className="ml-auto text-xs text-slate-500">
                {effectiveHintsUsed}/4 used
              </span>
            </div>
            <div className="space-y-3">
              {[challenge.hint1, challenge.hint2, challenge.hint3, challenge.hint4].map((h, i) => {
                const revealed = effectiveHintsUsed > i;
                return (
                  <div
                    key={i}
                    className={`rounded-lg border p-3 transition ${
                      revealed
                        ? "border-amber-500/30 bg-amber-500/5"
                        : "border-white/5 bg-white/[0.02]"
                    }`}
                  >
                    {revealed ? (
                      <div>
                        <div className="text-[10px] text-amber-400/70 uppercase tracking-wider mb-1">Hint {i + 1}</div>
                        <p className="text-xs text-slate-300 leading-relaxed">{h}</p>
                      </div>
                    ) : (
                      <button
                        onClick={useHint}
                        disabled={hintsUsed < i || hintsUsed >= 4}
                        className="w-full flex items-center gap-2 text-xs text-slate-500 hover:text-amber-300 transition"
                      >
                        <Lock className="h-3 w-3" />
                        Reveal Hint {i + 1}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
            <p className="text-[10px] text-slate-500 mt-3">
              Hints provide educational guidance only — they never reveal the answer.
              Using hints reduces your &ldquo;perfect score&rdquo; achievement count.
            </p>
          </Card>

          {/* Recommended commands */}
          <Card className="cyber-card p-6">
            <div className="flex items-center gap-2 mb-3">
              <Terminal className="h-4 w-4 text-cyan-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Recommended Commands
              </h3>
            </div>
            <div className="space-y-2">
              {challenge.recommendedCommands.map((cmd, i) => (
                <div
                  key={i}
                  className="rounded-md bg-[#060912] border border-cyan-500/15 p-2.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <code className="text-[11px] text-cyan-300 font-mono break-all flex-1">
                      {cmd}
                    </code>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(cmd);
                        toast.success("Command copied");
                      }}
                      className="text-slate-500 hover:text-cyan-300 transition shrink-0"
                    >
                      <Copy className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Best practices */}
          <Card className="cyber-card p-6">
            <div className="flex items-center gap-2 mb-3">
              <Wrench className="h-4 w-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Best Practices
              </h3>
            </div>
            <ul className="space-y-2">
              {challenge.bestPractices.map((bp, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-slate-300">
                  <ChevronRight className="h-3 w-3 mt-0.5 text-emerald-400 shrink-0" />
                  <span>{bp}</span>
                </li>
              ))}
            </ul>
          </Card>

          {/* Defense recommendations */}
          <Card className="cyber-card p-6">
            <div className="flex items-center gap-2 mb-3">
              <Shield className="h-4 w-4 text-rose-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Defense Recommendations
              </h3>
            </div>
            <ul className="space-y-2">
              {challenge.defenseRecommendations.map((d, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-slate-300">
                  <Shield className="h-3 w-3 mt-0.5 text-rose-400 shrink-0" />
                  <span>{d}</span>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>

      {/* Social Share Card */}
      <ShareCard
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        moduleName={challenge.module}
        xpEarned={challenge.xp}
        rankName={data?.stats?.currentRank?.name}
      />
    </div>
  );
}
