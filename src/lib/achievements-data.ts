// MOT Hashcat Playground — Ranks & Achievements

export interface Rank {
  id: number;
  name: string;
  minXp: number;
  description: string;
  color: string;
  badgeClass: string;
  icon: string;
}

export const RANKS: Rank[] = [
  {
    id: 1,
    name: "Script Kiddie",
    minXp: 0,
    description: "Every master started here. Welcome to the playground.",
    color: "#6B7280",
    badgeClass: "rank-script-kiddie",
    icon: "Terminal",
  },
  {
    id: 2,
    name: "Apprentice Cracker",
    minXp: 300,
    description: "You can crack a basic MD5 hash. The journey begins.",
    color: "#10B981",
    badgeClass: "rank-apprentice",
    icon: "Key",
  },
  {
    id: 3,
    name: "Hash Hunter",
    minXp: 800,
    description: "Wordlists fear you. Rules bend to your will.",
    color: "#00E5FF",
    badgeClass: "rank-hash-hunter",
    icon: "Crosshair",
  },
  {
    id: 4,
    name: "Password Slayer",
    minXp: 1500,
    description: "SHA1, SHA2-256 — none can withstand your GPU.",
    color: "#8B5CF6",
    badgeClass: "rank-password-slayer",
    icon: "Sword",
  },
  {
    id: 5,
    name: "Crypto Recovery Specialist",
    minXp: 2400,
    description: "Wallet recovery simulations bow to your methodology.",
    color: "#FFC857",
    badgeClass: "rank-crypto-specialist",
    icon: "Wallet",
  },
  {
    id: 6,
    name: "Elite Hashcat Operator",
    minXp: 3300,
    description: "You think in masks, dream in rules, breathe in candidate space.",
    color: "#FF5C5C",
    badgeClass: "rank-elite-operator",
    icon: "Crown",
  },
  {
    id: 7,
    name: "MOT Grandmaster",
    minXp: 4000,
    description: "Maximum certification achieved. You are the playground.",
    color: "#00FF88",
    badgeClass: "rank-grandmaster",
    icon: "Trophy",
  },
];

export function getRankByXp(xp: number): Rank {
  let result = RANKS[0];
  for (const rank of RANKS) {
    if (xp >= rank.minXp) result = rank;
  }
  return result;
}

export function getNextRank(xp: number): Rank | null {
  for (const rank of RANKS) {
    if (rank.minXp > xp) return rank;
  }
  return null;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  // unlock condition described in plain text for UI display
  condition: string;
  // function-style condition descriptor (we'll match in code)
  check: (ctx: AchievementContext) => boolean;
}

export interface AchievementContext {
  completedChallenges: number[];
  totalXp: number;
  playgroundRuns: number;
  md5Completed: number;
  sha1Completed: number;
  sha2Completed: number;
  walletCompleted: number;
  perfectScoreCount: number; // no hints used
  allCompleted: boolean;
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: "first-blood",
    name: "First Blood",
    description: "Complete your first challenge.",
    icon: "Droplet",
    color: "#FF5C5C",
    condition: "Complete 1 challenge",
    check: (c) => c.completedChallenges.length >= 1,
  },
  {
    id: "md5-master",
    name: "MD5 Master",
    description: "Complete all 5 MD5 challenges.",
    icon: "Hash",
    color: "#00E5FF",
    condition: "Complete Module 1 (MD5)",
    check: (c) => c.md5Completed >= 5,
  },
  {
    id: "sha-specialist",
    name: "SHA Specialist",
    description: "Complete all 5 SHA1 challenges.",
    icon: "Lock",
    color: "#00FF88",
    condition: "Complete Module 2 (SHA1)",
    check: (c) => c.sha1Completed >= 5,
  },
  {
    id: "sha2-savant",
    name: "SHA2 Savant",
    description: "Complete all 5 SHA2-256 challenges.",
    icon: "ShieldCheck",
    color: "#FFC857",
    condition: "Complete Module 3 (SHA2-256)",
    check: (c) => c.sha2Completed >= 5,
  },
  {
    id: "wallet-hunter",
    name: "Wallet Hunter",
    description: "Complete all 5 wallet.dat training simulations.",
    icon: "Wallet",
    color: "#B484FF",
    condition: "Complete Module 4 (Wallet.dat)",
    check: (c) => c.walletCompleted >= 5,
  },
  {
    id: "rule-wizard",
    name: "Rule Wizard",
    description: "Use the Hashcat Playground rules engine 5 times.",
    icon: "Wand2",
    color: "#8B5CF6",
    condition: "5 Playground rule-engine runs",
    check: (c) => c.playgroundRuns >= 5,
  },
  {
    id: "mask-master",
    name: "Mask Master",
    description: "Run 10 Hashcat Playground sessions.",
    icon: "Grid3x3",
    color: "#00E5FF",
    condition: "10 Playground sessions",
    check: (c) => c.playgroundRuns >= 10,
  },
  {
    id: "wordlist-warrior",
    name: "Wordlist Warrior",
    description: "Earn 800 XP from challenges alone.",
    icon: "ScrollText",
    color: "#10B981",
    condition: "Reach 800 XP",
    check: (c) => c.totalXp >= 800,
  },
  {
    id: "hashcat-expert",
    name: "Hashcat Expert",
    description: "Complete 15 of 20 challenges.",
    icon: "Cpu",
    color: "#FF5C5C",
    condition: "15 / 20 challenges",
    check: (c) => c.completedChallenges.length >= 15,
  },
  {
    id: "flawless",
    name: "Flawless",
    description: "Complete 5 challenges without using any hints.",
    icon: "Star",
    color: "#FFC857",
    condition: "5 perfect-score challenges",
    check: (c) => c.perfectScoreCount >= 5,
  },
  {
    id: "elite-operator",
    name: "Elite Operator",
    description: "Reach the Elite Hashcat Operator rank (3300 XP).",
    icon: "Crown",
    color: "#FF5C5C",
    condition: "Reach 3300 XP",
    check: (c) => c.totalXp >= 3300,
  },
  {
    id: "mot-grandmaster",
    name: "MOT Grandmaster",
    description: "Complete all 20 challenges and graduate.",
    icon: "Trophy",
    color: "#00FF88",
    condition: "Complete all 20 challenges",
    check: (c) => c.allCompleted,
  },
];
