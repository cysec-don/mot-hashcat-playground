// MOT Hashcat Playground — Ranks & Achievements (updated for 100-challenge curriculum)

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
  { id: 1, name: "Script Kiddie", minXp: 0, description: "Every master started here. Welcome to the playground.", color: "#6B7280", badgeClass: "rank-script-kiddie", icon: "Terminal" },
  { id: 2, name: "Apprentice Cracker", minXp: 500, description: "You can identify hashes and run basic attacks.", color: "#10B981", badgeClass: "rank-apprentice", icon: "Key" },
  { id: 3, name: "Hash Hunter", minXp: 1500, description: "Wordlists fear you. Rules bend to your will.", color: "#00E5FF", badgeClass: "rank-hash-hunter", icon: "Crosshair" },
  { id: 4, name: "Password Slayer", minXp: 3000, description: "Multiple algorithms fall to your methodology.", color: "#8B5CF6", badgeClass: "rank-password-slayer", icon: "Sword" },
  { id: 5, name: "Crypto Recovery Specialist", minXp: 5000, description: "Wallet recovery simulations bow to your expertise.", color: "#FFC857", badgeClass: "rank-crypto-specialist", icon: "Wallet" },
  { id: 6, name: "Elite Hashcat Operator", minXp: 8000, description: "You think in masks, dream in rules.", color: "#FF5C5C", badgeClass: "rank-elite-operator", icon: "Crown" },
  { id: 7, name: "MOT Grandmaster", minXp: 12000, description: "Maximum certification achieved.", color: "#00FF88", badgeClass: "rank-grandmaster", icon: "Trophy" },
];

export function getRankByXp(xp: number): Rank {
  let result = RANKS[0];
  for (const rank of RANKS) { if (xp >= rank.minXp) result = rank; }
  return result;
}

export function getNextRank(xp: number): Rank | null {
  for (const rank of RANKS) { if (rank.minXp > xp) return rank; }
  return null;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  condition: string;
  check: (ctx: AchievementContext) => boolean;
}

export interface AchievementContext {
  completedChallenges: number[];
  totalXp: number;
  playgroundRuns: number;
  hashIdCompleted: number;
  hashcatModesCompleted: number;
  wordlistCompleted: number;
  ruleCompleted: number;
  maskCompleted: number;
  combinatorCompleted: number;
  hybridCompleted: number;
  walletCompleted: number;
  perfectScoreCount: number;
  allCompleted: boolean;
}

export const ACHIEVEMENTS: Achievement[] = [
  { id: "first-blood", name: "First Blood", description: "Complete your first challenge.", icon: "Droplet", color: "#FF5C5C", condition: "Complete 1 challenge", check: (c) => c.completedChallenges.length >= 1 },
  { id: "hash-id-apprentice", name: "Hash ID Apprentice", description: "Complete 10 Hash Identification challenges.", icon: "Hash", color: "#00E5FF", condition: "10/30 Hash Identification", check: (c) => c.hashIdCompleted >= 10 },
  { id: "hash-id-master", name: "Hash ID Master", description: "Complete all 30 Hash Identification challenges.", icon: "Hash", color: "#00E5FF", condition: "Complete Module 1 (30)", check: (c) => c.hashIdCompleted >= 30 },
  { id: "mode-specialist", name: "Mode Specialist", description: "Complete all 15 Hashcat Modes challenges.", icon: "Lock", color: "#00FF88", condition: "Complete Module 2 (15)", check: (c) => c.hashcatModesCompleted >= 15 },
  { id: "wordlist-warrior", name: "Wordlist Warrior", description: "Complete all 10 Wordlist Attacks challenges.", icon: "ScrollText", color: "#10B981", condition: "Complete Module 3 (10)", check: (c) => c.wordlistCompleted >= 10 },
  { id: "rule-wizard", name: "Rule Wizard", description: "Complete all 10 Rule Attacks challenges.", icon: "Wand2", color: "#8B5CF6", condition: "Complete Module 4 (10)", check: (c) => c.ruleCompleted >= 10 },
  { id: "mask-master", name: "Mask Master", description: "Complete all 10 Mask Attacks challenges.", icon: "Grid3x3", color: "#00E5FF", condition: "Complete Module 5 (10)", check: (c) => c.maskCompleted >= 10 },
  { id: "combinator-pro", name: "Combinator Pro", description: "Complete all 5 Combinator Attacks challenges.", icon: "Combine", color: "#FFC857", condition: "Complete Module 6 (5)", check: (c) => c.combinatorCompleted >= 5 },
  { id: "hybrid-expert", name: "Hybrid Expert", description: "Complete all 10 Hybrid Attacks challenges.", icon: "Cpu", color: "#FF5C5C", condition: "Complete Module 7 (10)", check: (c) => c.hybridCompleted >= 10 },
  { id: "wallet-hunter", name: "Wallet Hunter", description: "Complete all 10 Wallet.dat Training challenges.", icon: "Wallet", color: "#B484FF", condition: "Complete Module 8 (10)", check: (c) => c.walletCompleted >= 10 },
  { id: "playground-explorer", name: "Playground Explorer", description: "Use the Hashcat Playground 10 times.", icon: "Wrench", color: "#00E5FF", condition: "10 Playground sessions", check: (c) => c.playgroundRuns >= 10 },
  { id: "flawless", name: "Flawless", description: "Complete 10 challenges without using any hints.", icon: "Star", color: "#FFC857", condition: "10 perfect-score challenges", check: (c) => c.perfectScoreCount >= 10 },
  { id: "halfway-there", name: "Halfway There", description: "Complete 50 of 100 challenges.", icon: "TrendingUp", color: "#00FF88", condition: "50 / 100 challenges", check: (c) => c.completedChallenges.length >= 50 },
  { id: "hashcat-expert", name: "Hashcat Expert", description: "Complete 80 of 100 challenges.", icon: "Cpu", color: "#FF5C5C", condition: "80 / 100 challenges", check: (c) => c.completedChallenges.length >= 80 },
  { id: "elite-operator", name: "Elite Operator", description: "Reach the Elite Hashcat Operator rank (8000 XP).", icon: "Crown", color: "#FF5C5C", condition: "Reach 8000 XP", check: (c) => c.totalXp >= 8000 },
  { id: "mot-grandmaster", name: "MOT Grandmaster", description: "Complete all 100 challenges and graduate.", icon: "Trophy", color: "#00FF88", condition: "Complete all 100 challenges", check: (c) => c.allCompleted },
];
