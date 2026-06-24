// MOT Hashcat Playground — 20 progressive challenges
// All hashes are well-known public test vectors for educational use only.

export type ChallengeDifficulty = "Beginner" | "Intermediate" | "Advanced";

export interface Challenge {
  id: number;
  module: "MD5" | "SHA1" | "SHA2-256" | "WALLET.DAT";
  title: string;
  difficulty: ChallengeDifficulty;
  scenario: string;
  objective: string;
  educationalContext: string;
  hash?: string;
  hashType?: string;
  hashcatMode?: number;
  hint1: string;
  hint2: string;
  hint3: string;
  // For cracking challenges
  expectedAnswer?: string;
  // For mode-identification / strategy challenges
  questionType: "crack" | "identify" | "strategy" | "command";
  options?: string[];
  expectedOption?: string;
  explanation: string;
  recommendedCommands: string[];
  bestPractices: string[];
  defenseRecommendations: string[];
  xp: number;
}

export const CHALLENGES: Challenge[] = [
  // ============= MODULE 1 — MD5 =============
  {
    id: 1,
    module: "MD5",
    title: "The Classic — Crack a Known MD5",
    difficulty: "Beginner",
    scenario:
      "A junior SOC analyst captured an unsalted MD5 hash from a legacy authentication log during an incident response engagement. The hash is well-known and your lead has asked you to demonstrate basic hash cracking methodology using Hashcat.",
    objective:
      "Recover the plaintext password from the provided MD5 hash using Hashcat mode 0.",
    educationalContext:
      "MD5 (Message Digest 5) is a 128-bit cryptographic hash function designed by Ronald Rivest in 1991. It produces a 32-character hexadecimal digest. MD5 is considered cryptographically broken — collision attacks are practical — but it remains pervasive in legacy systems, file integrity checks, and (unfortunately) authentication. In Hashcat, MD5 corresponds to mode -m 0. Because MD5 is unsalted and extremely fast to compute (modern GPUs exceed 100 billion guesses per second), it is highly vulnerable to dictionary, brute-force, and rainbow-table attacks.",
    hash: "5f4dcc3b5aa765d61d8327deb882cf99",
    hashType: "MD5",
    hashcatMode: 0,
    hint1: "This is one of the most famous test passwords in history — it appears in nearly every wordlist as the very first entry.",
    hint2: "The plaintext is 8 characters, all lowercase, and is literally the word 'password'.",
    hint3: "Command: hashcat -m 0 -a 0 hash.txt rockyou.txt — the recovered password is 'password'.",
    expectedAnswer: "password",
    questionType: "crack",
    explanation:
      "The MD5 hash 5f4dcc3b5aa765d61d8327deb882cf99 is the digest of the plaintext 'password'. This is the single most common password ever recorded and appears at the top of the rockyou.txt wordlist. In Hashcat, MD5 is mode 0 (-m 0), and the straight dictionary attack (-a 0) with rockyou.txt will recover it in milliseconds. The lesson: any password found in a public wordlist is effectively unprotected when stored as unsalted MD5.",
    recommendedCommands: [
      "hashcat -m 0 -a 0 hash.txt rockyou.txt",
      "hashcat -m 0 -a 0 hash.txt rockyou.txt --show",
    ],
    bestPractices: [
      "Always specify the hash mode explicitly with -m to avoid misidentification.",
      "Use --show to retrieve already-cracked results without re-running the attack.",
      "Store hashes in a plain text file, one hash per line, with no formatting.",
    ],
    defenseRecommendations: [
      "Migrate away from MD5 for password storage — use bcrypt, scrypt, or Argon2id.",
      "Enforce password policies that reject dictionary words.",
      "Implement salting and peppering to defeat rainbow-table precomputation.",
    ],
    xp: 100,
  },
  {
    id: 2,
    module: "MD5",
    title: "Numeric Password Recovery",
    difficulty: "Beginner",
    scenario:
      "A penetration tester obtained a database dump from a vulnerable web application. One row contains an MD5 hash that appears to correspond to a numeric PIN-style password.",
    objective:
      "Recover the plaintext password from the MD5 hash using a wordlist or mask attack.",
    educationalContext:
      "Numeric-only passwords dramatically shrink the search space. A 6-digit numeric password has only 10^6 = 1,000,000 combinations, which Hashcat can exhaust in milliseconds even on a single consumer GPU. The hash e10adc3949ba59abbe56e057f20f883e is the MD5 of '123456' — consistently ranked as the #1 most common password globally. When you suspect numeric passwords, a mask attack (?d?d?d?d?d?d) is often faster than a wordlist because Hashcat can generate candidates on-the-fly without disk I/O.",
    hash: "e10adc3949ba59abbe56e057f20f883e",
    hashType: "MD5",
    hashcatMode: 0,
    hint1: "Numeric passwords can be cracked instantly with a mask of ?d characters.",
    hint2: "The password is a 6-digit ascending sequence ending in 6.",
    hint3: "Mask attack: hashcat -m 0 -a 3 hash.txt ?d?d?d?d?d?d — answer is '123456'.",
    expectedAnswer: "123456",
    questionType: "crack",
    explanation:
      "The hash e10adc3949ba59abbe56e057f20f883e is the MD5 of '123456', the most popular password on the planet for over a decade. Because the password is purely numeric and only 6 characters, the entire keyspace (1 million candidates) is exhausted in well under a second. Two attack strategies work equally well here: (1) a dictionary attack using rockyou.txt, where '123456' is the very first entry, or (2) a brute-force mask attack using ?d?d?d?d?d?d. The mask attack is preferred when you have prior knowledge of the password structure.",
    recommendedCommands: [
      "hashcat -m 0 -a 0 hash.txt rockyou.txt",
      "hashcat -m 0 -a 3 hash.txt ?d?d?d?d?d?d",
    ],
    bestPractices: [
      "Use mask attacks (?d) for numeric passwords — they are faster than wordlists.",
      "When the structure is unknown, run a small wordlist first, then escalate to masks.",
      "Monitor Hashcat's status output for the 'Engine.Checksum' line to verify the wordlist loaded correctly.",
    ],
    defenseRecommendations: [
      "Reject purely numeric passwords in your password policy.",
      "Enforce a minimum length of 12 characters with mixed character classes.",
      "Use a slow KDF (Argon2id with high memory cost) to make each guess expensive.",
    ],
    xp: 100,
  },
  {
    id: 3,
    module: "MD5",
    title: "Eight-Digit Numeric Hash",
    difficulty: "Beginner",
    scenario:
      "An attacker leaked a customer credential database. One of the MD5 hashes corresponds to an 8-digit numeric password — likely a date-of-birth-style credential used by an end user.",
    objective: "Recover the 8-digit numeric password using a mask attack.",
    educationalContext:
      "Eight-digit numeric passwords (commonly used as DDMMYYYY birthdates) have 10^8 = 100 million combinations. On a modern GPU this is exhausted in 1–2 seconds with Hashcat's mask attack. The mask ?d?d?d?d?d?d?d?d tells Hashcat to iterate over every 8-digit combination. This challenge illustrates why date-of-birth passwords are functionally equivalent to no password at all when stored with a fast hash function like MD5.",
    hash: "25d55ad283aa400af464c76d713c07ad",
    hashType: "MD5",
    hashcatMode: 0,
    hint1: "Use a mask of 8 ?d characters for a brute-force attack on the numeric space.",
    hint2: "The password is the ascending sequence 1 through 8.",
    hint3: "hashcat -m 0 -a 3 hash.txt ?d?d?d?d?d?d?d?d — the answer is '12345678'.",
    expectedAnswer: "12345678",
    questionType: "crack",
    explanation:
      "The hash 25d55ad283aa400af464c76d713c07ad is the MD5 of '12345678'. With a pure numeric 8-character space, the keyspace is only 100 million — exhausted in well under a second on any modern GPU. The mask ?d?d?d?d?d?d?d?d is the canonical way to express 'eight numeric digits' in Hashcat's mask syntax. The crucial insight: passwords that are short and use only one character class (digits, lowercase, etc.) provide essentially zero protection against modern cracking hardware.",
    recommendedCommands: [
      "hashcat -m 0 -a 3 hash.txt ?d?d?d?d?d?d?d?d",
      "hashcat -m 0 -a 3 hash.txt -1 0123456789 ?1?1?1?1?1?1?1?1",
    ],
    bestPractices: [
      "Mask attacks generate candidates in GPU memory — they are dramatically faster than reading from disk.",
      "Use -1 to define a custom character set when the password uses a restricted alphabet.",
      "Always test the mask against a known plaintext first to verify syntax.",
    ],
    defenseRecommendations: [
      "Reject passwords that match common date patterns (DDMMYYYY, MMDDYYYY).",
      "Require at least three character classes (upper, lower, digit, symbol).",
      "Implement breach-list checks (haveibeenpwned API) at password creation time.",
    ],
    xp: 120,
  },
  {
    id: 4,
    module: "MD5",
    title: "Wordlist Attack Methodology",
    difficulty: "Beginner",
    scenario:
      "You have been given a list of 50 MD5 hashes recovered from a compromised forum database. The forum used no salt. Your task is to choose the correct Hashcat attack mode for a high-yield first pass.",
    objective:
      "Identify the correct Hashcat attack mode (-a value) for a wordlist-based dictionary attack.",
    educationalContext:
      "Hashcat supports six attack modes: -a 0 (Straight / dictionary), -a 1 (Combinator — merges two wordlists), -a 3 (Brute-force / mask), -a 6 (Hybrid Wordlist + Mask), -a 7 (Hybrid Mask + Wordlist), and -a 9 (Association). For a first-pass recovery against unsalted hashes, the straight dictionary attack (-a 0) with a high-quality wordlist like rockyou.txt typically recovers 60–80% of real-world passwords in seconds. This is the foundational attack every analyst must master before moving to rules, masks, or combinator attacks.",
    questionType: "identify",
    options: [
      "-a 0 — Straight (dictionary / wordlist)",
      "-a 1 — Combinator (two wordlists merged)",
      "-a 3 — Brute-force (mask)",
      "-a 6 — Hybrid Wordlist + Mask",
    ],
    expectedOption: "-a 0 — Straight (dictionary / wordlist)",
    hint1: "Wordlist attacks use a pre-built dictionary file — Hashcat iterates each word and hashes it.",
    hint2: "Look at the -a value: 0 is straight, 1 is combinator, 3 is mask, 6/7 are hybrids.",
    hint3: "The straight dictionary attack is -a 0. Example: hashcat -m 0 -a 0 hashes.txt rockyou.txt",
    explanation:
      "The straight attack mode (-a 0) is the canonical wordlist attack. Hashcat reads each word from the supplied wordlist, computes the hash, and compares it to the target list. It is the highest-yield, lowest-effort attack for unsalted hashes. The other modes serve different purposes: combinator (-a 1) merges two wordlists (e.g., 'pass' + 'word' = 'password'); mask (-a 3) generates candidates from a pattern; hybrids (-a 6 / -a 7) combine wordlists with masks for cases like 'password123'.",
    recommendedCommands: [
      "hashcat -m 0 -a 0 hashes.txt rockyou.txt",
      "hashcat -m 0 -a 0 hashes.txt rockyou.txt --status --status-timer=10",
    ],
    bestPractices: [
      "Always start with a straight dictionary attack before escalating to masks or rules.",
      "Use --status and --status-timer for long-running attacks to monitor progress.",
      "Save the potfile (hashcat.potfile) so cracked results persist across sessions.",
    ],
    defenseRecommendations: [
      "Assume any leaked password database will be subjected to a rockyou.txt attack within minutes.",
      "Use breach-corpus training to enforce that user passwords do not appear in known wordlists.",
      "Adopt slow KDFs (Argon2id, bcrypt cost ≥ 12) to make dictionary attacks expensive.",
    ],
    xp: 100,
  },
  {
    id: 5,
    module: "MD5",
    title: "Identify the Correct Hashcat Mode",
    difficulty: "Beginner",
    scenario:
      "A reverse-engineering analyst has extracted a 32-character hexadecimal hash from a binary. The hash function is suspected to be MD5, but the analyst must confirm the correct Hashcat mode number to launch an attack.",
    objective:
      "Select the correct Hashcat -m mode for an MD5 hash from the options below.",
    educationalContext:
      "Hashcat supports over 300 hash types via the -m flag. Each mode corresponds to a specific algorithm and format. MD5 is -m 0, SHA1 is -m 100, SHA2-256 is -m 1400, bcrypt is -m 3200, NTLM is -m 1000, and so on. Choosing the wrong mode is the #1 cause of failed cracking attempts. Hashcat will accept a hash in the wrong mode but will never recover it. Tools like hashid or hash-identifier can help detect the type when it is unknown, but verifying length (32 hex chars = MD5; 40 hex chars = SHA1; 64 hex chars = SHA2-256) is the fastest manual check.",
    questionType: "identify",
    options: [
      "-m 0 (MD5)",
      "-m 100 (SHA1)",
      "-m 1400 (SHA2-256)",
      "-m 1000 (NTLM)",
    ],
    expectedOption: "-m 0 (MD5)",
    hint1: "Count the hex characters: 32 hex chars = 128 bits = MD5.",
    hint2: "MD5 is the very first hash mode in Hashcat — its mode number is 0.",
    hint3: "The answer is -m 0. SHA1 is 100, SHA256 is 1400, NTLM is 1000.",
    explanation:
      "MD5 produces a 128-bit (16-byte) digest, which is 32 hexadecimal characters. In Hashcat, this corresponds to mode -m 0. The mode number is the algorithm identifier — getting it right is non-negotiable. A 32-char hex hash is almost always MD5 (or one of its derivatives like md5($pass.$salt), which has a different mode). When in doubt, run `hashid` against the hash for confirmation before launching an attack.",
    recommendedCommands: [
      "hashcat -m 0 -a 0 hash.txt rockyou.txt",
      "hashid 'HASH_VALUE'  # identifies the type",
    ],
    bestPractices: [
      "Always verify hash length before assigning a mode: 32=MD5, 40=SHA1, 64=SHA256.",
      "Use hashid or hash-identifier to confirm type when source is unknown.",
      "Document the mode in your runbook so the same hash family is cracked consistently.",
    ],
    defenseRecommendations: [
      "Use unique salts stored separately from the hash to complicate mode identification.",
      "Adopt algorithms (Argon2id) that are not trivially confused with MD5 by length alone.",
      "Monitor authentication logs for cracking-pattern activity (high failed login rates).",
    ],
    xp: 100,
  },

  // ============= MODULE 2 — SHA1 =============
  {
    id: 6,
    module: "SHA1",
    title: "SHA1 Hash Cracking",
    difficulty: "Intermediate",
    scenario:
      "A legacy web application stores passwords as unsalted SHA1 digests. The SHA1 algorithm is still in production at this organization despite known collision weaknesses. You have obtained one hash for recovery.",
    objective:
      "Recover the plaintext password from the provided SHA1 hash using Hashcat.",
    educationalContext:
      "SHA1 (Secure Hash Algorithm 1) was designed by the NSA and published in 1995. It produces a 160-bit digest rendered as 40 hexadecimal characters. While SHA1 is more expensive to compute than MD5 (slower by roughly 3x), it remains trivially crackable on modern hardware — a single RTX 4090 achieves over 30 billion SHA1 guesses per second. SHA1's collision weakness (demonstrated by Google's SHAttered attack in 2017) broke its collision resistance but did not significantly weaken its preimage resistance. For password cracking, however, the lack of salt is the real vulnerability — not the algorithm itself.",
    hash: "5baa61e4c9b93f3f0682250b6cf8331b7ee68fd8",
    hashType: "SHA1",
    hashcatMode: 100,
    hint1: "SHA1 hashes are 40 hex characters. The mode is -m 100.",
    hint2: "This hash corresponds to the word 'password' — the most common password in rockyou.txt.",
    hint3: "hashcat -m 100 -a 0 hash.txt rockyou.txt — answer is 'password'.",
    expectedAnswer: "password",
    questionType: "crack",
    explanation:
      "The hash 5baa61e4c9b93f3f0682250b6cf8331b7ee68fd8 is the SHA1 of 'password'. SHA1 corresponds to Hashcat mode -m 100. The same wordlist attack that recovered the MD5 hash in Challenge 1 works here — only the mode changes. This demonstrates a critical principle: the choice of algorithm matters less than the absence of salt. An unsalted SHA1 hash is no more secure than an unsalted MD5 hash from a cracking perspective.",
    recommendedCommands: [
      "hashcat -m 100 -a 0 hash.txt rockyou.txt",
      "hashcat -m 100 -a 0 hash.txt rockyou.txt -r best64.rule",
    ],
    bestPractices: [
      "Always specify -m 100 for SHA1 — the default mode in Hashcat is 0 (MD5).",
      "Verify the hash is 40 hex chars before running the attack.",
      "Apply rules (best64.rule) after the base wordlist to expand coverage cheaply.",
    ],
    defenseRecommendations: [
      "Migrate from SHA1 to SHA2-256 or SHA3-256 with a unique salt and pepper.",
      "Use a slow KDF (PBKDF2 with ≥ 600,000 iterations, or Argon2id) for password storage.",
      "Monitor for SHA1 usage in source code with security linters (e.g., semgrep rules).",
    ],
    xp: 150,
  },
  {
    id: 7,
    module: "SHA1",
    title: "SHA1 Wordlist Attack",
    difficulty: "Intermediate",
    scenario:
      "You are auditing a list of SHA1 hashes from a corporate Active Directory dump. Your task is to choose the best initial attack strategy for the highest yield in the shortest time.",
    objective:
      "Select the recommended first-pass attack for a list of unsalted SHA1 hashes.",
    educationalContext:
      "When cracking a list of hashes (rather than a single hash), the cost of computing each candidate is amortized across all targets. A wordlist attack with rules applied is the highest-yield first pass because (a) the wordlist covers the most common plaintexts, and (b) rules mutate each word to cover common variations (capitalization, appending digits, leetspeak). For SHA1 specifically, a single GPU can test 30+ billion candidates per second — meaning rockyou.txt (14 million words) with best64.rule (76 rules) produces over 1 billion candidates and runs in well under a minute.",
    questionType: "identify",
    options: [
      "Wordlist + rules attack (hashcat -m 100 -a 0 hashes.txt rockyou.txt -r best64.rule)",
      "Pure brute force mask attack (?a?a?a?a?a?a?a?a)",
      "Combinator attack (rockyou.txt + rockyou.txt)",
      "Hybrid mask + wordlist (hashcat -m 100 -a 7 ?d?d?d rockyou.txt)",
    ],
    expectedOption:
      "Wordlist + rules attack (hashcat -m 100 -a 0 hashes.txt rockyou.txt -r best64.rule)",
    hint1: "For a list of hashes, you want maximum yield per second — rules multiply a wordlist cheaply.",
    hint2: "best64.rule multiplies each wordlist entry ~76x. rockyou.txt + best64.rule is the gold-standard first pass.",
    hint3: "Answer: hashcat -m 100 -a 0 hashes.txt rockyou.txt -r best64.rule",
    explanation:
      "The wordlist + rules combination is the highest-yield first pass for any unsalted hash list. The wordlist provides the base candidates (covering the most common plaintexts), and the rules engine mutates each entry cheaply — best64.rule alone expands 14M rockyou entries to ~1B candidates. This typically recovers 70–85% of real-world passwords. The other options are either too slow (pure brute force on 8 chars with full charset is 7.2 quadrillion combinations) or too narrow (combinator is excellent but slower; hybrid is great for 'password123' patterns but not as universal).",
    recommendedCommands: [
      "hashcat -m 100 -a 0 hashes.txt rockyou.txt -r best64.rule",
      "hashcat -m 100 -a 0 hashes.txt rockyou.txt -r dive.rule  # larger rule set",
    ],
    bestPractices: [
      "Run best64.rule first (fast, broad coverage), then escalate to dive.rule or generated.rule.",
      "Sort your hash list by frequency to maximize early recoveries.",
      "Pipe cracked results to a separate file for forensic chain-of-custody.",
    ],
    defenseRecommendations: [
      "Use unique per-user salts so the same password produces different hashes.",
      "Adopt memory-hard KDFs (Argon2id) to slow GPU-based attacks by 100–1000x.",
      "Implement breached-password blocking at signup/change time.",
    ],
    xp: 150,
  },
  {
    id: 8,
    module: "SHA1",
    title: "SHA1 Mode Identification",
    difficulty: "Intermediate",
    scenario:
      "A forensic investigator has extracted a 40-character hexadecimal string from a memory dump and suspects it is a password hash. They need to confirm the Hashcat mode before launching an attack.",
    objective:
      "Identify the correct Hashcat -m mode for a 40-character SHA1 hash.",
    educationalContext:
      "A 40-character hex string is 160 bits — the output size of SHA1. Other 160-bit algorithms exist (RIPEMD-160, HAVAL-160) but SHA1 is by far the most common in practice. In Hashcat, raw SHA1 is mode -m 100. Variants have different mode numbers: sha1($pass.$salt) is -m 110, sha1($salt.$pass) is -m 120, HMAC-SHA1 is -m 150. Always inspect the context of how the hash was stored to distinguish raw SHA1 from its salted variants — the hash format string in Hashcat's example hashes page documents the expected format for each mode.",
    questionType: "identify",
    options: [
      "-m 100 (raw SHA1)",
      "-m 0 (MD5)",
      "-m 1400 (SHA2-256)",
      "-m 1700 (SHA2-512)",
    ],
    expectedOption: "-m 100 (raw SHA1)",
    hint1: "40 hex characters = 160 bits = SHA1.",
    hint2: "Raw SHA1 is mode 100 in Hashcat.",
    hint3: "Answer: -m 100. Variants like sha1($pass.$salt) are 110, 120.",
    explanation:
      "A 40-character hex string is a 160-bit digest, which is the output length of SHA1. In Hashcat, raw SHA1 is mode -m 100. Distinguishing raw SHA1 from its salted variants (sha1($pass.$salt) = -m 110, sha1($salt.$pass) = -m 120) requires examining the storage format. If the hash is stored alone with no separator, it is raw SHA1. If you see a colon-separated format like 'hash:salt', it is one of the salted variants. The hash mode is the single most important parameter — choosing incorrectly means Hashcat will run forever and recover nothing.",
    recommendedCommands: [
      "hashcat -m 100 -a 0 hash.txt rockyou.txt",
      "hashcat --help | grep -i sha1  # list all SHA1-related modes",
    ],
    bestPractices: [
      "Use `hashid` or `hash-identifier` to confirm the algorithm before assigning a mode.",
      "Inspect the storage format for separator characters (colons typically indicate salts).",
      "Cross-reference against Hashcat's example hashes page (hashcat.net/wiki/doku.php?id=example_hashes).",
    ],
    defenseRecommendations: [
      "Use HMAC-SHA1 (mode -m 150) with a server-side secret instead of raw SHA1.",
      "Prefer SHA2-256 or SHA3-256 over SHA1 for any new implementation.",
      "Audit legacy codebases for direct sha1() calls and migrate them to a KDF.",
    ],
    xp: 150,
  },
  {
    id: 9,
    module: "SHA1",
    title: "Rule-Based Attack",
    difficulty: "Intermediate",
    scenario:
      "A password cracker has exhausted the rockyou.txt wordlist against a list of SHA1 hashes. They recovered 65% of plaintexts but 35% remain uncracked. They need a strategy to expand coverage cheaply without running an expensive brute-force attack.",
    objective:
      "Identify the correct Hashcat rule-based attack strategy to expand wordlist coverage.",
    educationalContext:
      "Rules are pattern-based mutations applied to each wordlist entry. Hashcat's rule engine supports operations like capitalization ($c), appending characters ($1, $2), leetspeak (so 'password' becomes 'P@ssword'), reversing ($r), and dozens more. The best64.rule file ships with Hashcat and contains 76 high-yield rules. dive.rule is a larger set (~99,000 rules) that produces dramatic coverage gains at the cost of runtime. Generated.rule creates rule combinations algorithmically. Rules are extremely efficient because they expand a wordlist by 100x–10000x while consuming almost no additional disk I/O — all mutations happen in GPU memory.",
    questionType: "strategy",
    options: [
      "Apply best64.rule to rockyou.txt (hashcat -m 100 -a 0 hashes.txt rockyou.txt -r best64.rule)",
      "Switch to a pure brute-force mask attack (?a?a?a?a?a?a?a?a)",
      "Run a combinator attack (rockyou.txt + rockyou.txt)",
      "Increase the wordlist size by downloading a larger leak corpus",
    ],
    expectedOption:
      "Apply best64.rule to rockyou.txt (hashcat -m 100 -a 0 hashes.txt rockyou.txt -r best64.rule)",
    hint1: "Rules mutate each wordlist entry cheaply — they multiply coverage without re-reading the wordlist.",
    hint2: "best64.rule is the standard next step after a bare wordlist pass fails.",
    hint3: "Answer: hashcat -m 100 -a 0 hashes.txt rockyou.txt -r best64.rule",
    explanation:
      "Rules are the cheapest way to expand wordlist coverage. The best64.rule file applies 76 high-yield mutations to each wordlist entry — capitalizing, appending digits, replacing letters with symbols, etc. Running rockyou.txt + best64.rule produces ~1.07 billion candidates (14M words × 76 rules) and runs in seconds on modern hardware. This typically recovers an additional 15–25% of passwords beyond the bare wordlist. If best64.rule is insufficient, escalate to dive.rule (~99,000 rules, ~1.4 trillion candidates) or to a generated rule set.",
    recommendedCommands: [
      "hashcat -m 100 -a 0 hashes.txt rockyou.txt -r best64.rule",
      "hashcat -m 100 -a 0 hashes.txt rockyou.txt -r dive.rule  # larger",
    ],
    bestPractices: [
      "Always run best64.rule after a bare wordlist pass — it is essentially free coverage.",
      "Custom rules targeting the organization (e.g., company name + year) often yield surprising results.",
      "Save the potfile so re-running with bigger rules doesn't re-crack already-recovered hashes.",
    ],
    defenseRecommendations: [
      "Train employees to avoid predictable mutations (Summer2024!, Welcome123, etc.).",
      "Implement password filters that reject common rule-based patterns.",
      "Use breached-password APIs to block passwords that rules would generate from common bases.",
    ],
    xp: 180,
  },
  {
    id: 10,
    module: "SHA1",
    title: "Mask Attack",
    difficulty: "Intermediate",
    scenario:
      "A red team has identified that an organization enforces a password policy requiring exactly 8 characters: one uppercase, three lowercase, and four digits (e.g., 'Abcd1234'). They need to construct a Hashcat mask that targets this exact pattern.",
    objective:
      "Build the correct Hashcat mask for an 8-character password with the structure ULLLDDDD (uppercase, lowercase, lowercase, lowercase, digit, digit, digit, digit).",
    educationalContext:
      "Hashcat's mask syntax defines character classes per position: ?l = lowercase (a-z, 26 chars), ?u = uppercase (A-Z, 26 chars), ?d = digits (0-9, 10 chars), ?s = special symbols (~33 chars), ?a = all printable (95 chars), ?b = binary (256 chars). A mask of ?u?l?l?l?d?d?d?d describes the structure 'ULLLDDDD' and limits the keyspace to 26 × 26 × 26 × 26 × 10 × 10 × 10 × 10 = 4.5 billion combinations — about 0.15 seconds on a single RTX 4090. Custom charsets (-1, -2, -3, -4) let you define restricted alphabets when needed.",
    questionType: "command",
    options: [
      "?u?l?l?l?d?d?d?d",
      "?a?a?a?a?a?a?a?a",
      "?d?d?d?d?u?l?l?l",
      "?l?l?l?l?d?d?d?d",
    ],
    expectedOption: "?u?l?l?l?d?d?d?d",
    hint1: "?u = uppercase, ?l = lowercase, ?d = digit. Match the pattern ULLLDDDD.",
    hint2: "Pattern is one uppercase, three lowercase, four digits.",
    hint3: "Answer: ?u?l?l?l?d?d?d?d",
    explanation:
      "The mask ?u?l?l?l?d?d?d?d precisely matches an 8-character password structured as ULLLDDDD (one uppercase, three lowercase, four digits). Each ? character consumes exactly one position and applies the specified character class. The total keyspace is 26 × 26 × 26 × 26 × 10 × 10 × 10 × 10 ≈ 4.5 billion — exhausted in under a second on modern hardware. This demonstrates why predictable password structures (even when they meet complexity requirements) provide essentially no protection: a structural pattern reduces the search space by orders of magnitude versus true random passwords.",
    recommendedCommands: [
      "hashcat -m 100 -a 3 hash.txt ?u?l?l?l?d?d?d?d",
      "hashcat -m 100 -a 3 hash.txt -1 ?u?l?d ?1?1?1?1?1?1?1?1  # custom charset",
    ],
    bestPractices: [
      "Construct masks based on observed password policy, not blind guessing.",
      "Use --increment to grow the mask length automatically when the exact length is unknown.",
      "Save successful masks to a .hcmask file for repeatable runs across engagements.",
    ],
    defenseRecommendations: [
      "Avoid rigid length requirements (exactly 8 chars) — they enable targeted mask attacks.",
      "Favor long passphrases (16+ chars) over complex short passwords.",
      "Measure actual password entropy (not just policy compliance) using tools like zxcvbn.",
    ],
    xp: 200,
  },

  // ============= MODULE 3 — SHA2-256 =============
  {
    id: 11,
    module: "SHA2-256",
    title: "SHA2-256 Hash Cracking",
    difficulty: "Intermediate",
    scenario:
      "A modern web application has migrated from MD5 to SHA2-256 for password storage — but without a salt or a slow KDF. You have obtained one hash from a recent breach and need to demonstrate that 'modern algorithm alone' is insufficient protection.",
    objective: "Recover the plaintext password from the provided SHA2-256 hash.",
    educationalContext:
      "SHA2-256 (often called SHA-256) is part of the SHA-2 family published by NIST in 2001. It produces a 256-bit digest (64 hex characters). While SHA2-256 is cryptographically unbroken, it is designed for speed — making it a poor choice for password storage when used directly. A modern GPU achieves 10+ billion SHA2-256 guesses per second. For password storage, the algorithm must be paired with a slow KDF (PBKDF2, bcrypt, scrypt, Argon2id) and a unique salt. The hash below is the SHA2-256 of 'password' — the most common password in the world.",
    hash: "5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8",
    hashType: "SHA2-256",
    hashcatMode: 1400,
    hint1: "SHA2-256 produces 64 hex characters. The Hashcat mode is -m 1400.",
    hint2: "This hash is the SHA2-256 of 'password'.",
    hint3: "hashcat -m 1400 -a 0 hash.txt rockyou.txt — answer is 'password'.",
    expectedAnswer: "password",
    questionType: "crack",
    explanation:
      "The hash 5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8 is the SHA2-256 of 'password'. SHA2-256 corresponds to Hashcat mode -m 1400. Despite being a 'modern' algorithm, it is just as vulnerable as MD5 when used without a salt and KDF — a single GPU can compute 10+ billion SHA2-256 hashes per second. The lesson is critical: algorithm choice alone does not secure passwords. The combination of algorithm + salt + slow KDF + memory hardness is what makes password storage secure.",
    recommendedCommands: [
      "hashcat -m 1400 -a 0 hash.txt rockyou.txt",
      "hashcat -m 1400 -a 0 hash.txt rockyou.txt -r best64.rule",
    ],
    bestPractices: [
      "Confirm 64 hex characters before assigning mode -m 1400.",
      "Apply best64.rule to expand coverage after the bare wordlist pass.",
      "Note that some applications store SHA2-256 as base64 — decode before passing to Hashcat.",
    ],
    defenseRecommendations: [
      "Never use raw SHA2-256 for password storage — always wrap in a KDF.",
      "Use Argon2id with t=3, m=65536, p=4 as a modern default.",
      "Implement pepper (server-side HMAC secret) to protect against database-only breaches.",
    ],
    xp: 200,
  },
  {
    id: 12,
    module: "SHA2-256",
    title: "Hash Identification",
    difficulty: "Intermediate",
    scenario:
      "A database administrator has handed you a 64-character hex string from a user table and asked: 'What algorithm is this?' You need to identify the hash family and propose the Hashcat mode.",
    objective:
      "Identify the algorithm and Hashcat mode for a 64-character hex hash.",
    educationalContext:
      "Hash length is the strongest signal for algorithm identification. 32 hex chars = 128 bits = MD5 (or MD4, NTLM). 40 hex chars = 160 bits = SHA1 (or RIPEMD-160). 64 hex chars = 256 bits = SHA2-256 (or SHA3-256, BLAKE2s, RIPEMD-256). 96 hex chars = 384 bits = SHA2-384. 128 hex chars = 512 bits = SHA2-512 (or Whirlpool). For a 64-char hex string, the most common answer is SHA2-256, which is Hashcat mode -m 1400. When ambiguity exists (e.g., SHA3-256 vs SHA2-256, both 64 hex chars), the storage context (which application, which column, which framework) is the deciding factor.",
    questionType: "identify",
    options: [
      "SHA2-256 (mode -m 1400)",
      "MD5 (mode -m 0)",
      "SHA1 (mode -m 100)",
      "SHA2-512 (mode -m 1700)",
    ],
    expectedOption: "SHA2-256 (mode -m 1400)",
    hint1: "64 hex chars = 256 bits. The most common 256-bit algorithm is SHA2-256.",
    hint2: "SHA2-256 is mode 1400 in Hashcat.",
    hint3: "Answer: SHA2-256, mode -m 1400.",
    explanation:
      "A 64-character hex string is 256 bits, which matches SHA2-256. Other 256-bit algorithms exist (SHA3-256, BLAKE2s, RIPEMD-256) but SHA2-256 is by far the most common in production systems. Hashcat mode -m 1400 is raw SHA2-256. Variants include sha256($pass.$salt) (-m 1410), sha256($salt.$pass) (-m 1420), HMAC-SHA256 (-m 1450). When identifying hashes, length is your first signal, then storage format (look for colons indicating salts), then algorithmic context (which application produced it). Tools like `hashid` automate this process.",
    recommendedCommands: [
      "hashcat -m 1400 -a 0 hash.txt rockyou.txt",
      "hashid 'HASH_VALUE'  # automated identification",
    ],
    bestPractices: [
      "Length-first identification: 32=MD5, 40=SHA1, 64=SHA256, 128=SHA512.",
      "Inspect storage format for separator characters indicating salts.",
      "Document identified algorithms in your engagement runbook for future reference.",
    ],
    defenseRecommendations: [
      "Avoid ambiguous algorithm choices — use Argon2id which has a distinct storage format.",
      "Store the algorithm identifier alongside the hash (e.g., 'argon2id$...') for future migrations.",
      "Audit all 64-char hex fields in databases — they are often forgotten SHA2-256 hashes.",
    ],
    xp: 200,
  },
  {
    id: 13,
    module: "SHA2-256",
    title: "Mode Selection",
    difficulty: "Advanced",
    scenario:
      "You are consulting for a fintech that uses sha256($salt.$pass) for credential storage. Each user has a unique 16-byte salt stored alongside the hash in the format hash:salt. You need to select the correct Hashcat mode.",
    objective:
      "Select the Hashcat mode for the sha256($salt.$pass) construction with the salt prepended to the password.",
    educationalContext:
      "Hashcat distinguishes between salted hash variants by the order of operations. sha256($pass.$salt) means the password is concatenated first, then the salt — this is mode -m 1410. sha256($salt.$pass) means the salt is concatenated first, then the password — this is mode -m 1420. While both variants use the same algorithm, they produce different hashes for the same inputs, so the mode must match the application's exact construction. The hash format string for -m 1420 is 'hash:salt' — Hashcat parses the colon-separated values automatically. Getting the order wrong is the second most common cause of failed attacks (after wrong mode).",
    questionType: "identify",
    options: [
      "-m 1420 (sha256($salt.$pass))",
      "-m 1400 (raw SHA2-256)",
      "-m 1410 (sha256($pass.$salt))",
      "-m 1450 (HMAC-SHA256)",
    ],
    expectedOption: "-m 1420 (sha256($salt.$pass))",
    hint1: "The salt comes BEFORE the password in the concatenation.",
    hint2: "sha256($salt.$pass) is mode 1420; sha256($pass.$salt) is mode 1410.",
    hint3: "Answer: -m 1420. Format string is hash:salt.",
    explanation:
      "Hashcat mode -m 1420 corresponds to sha256($salt.$pass) — the salt is concatenated first, then the password, and the resulting string is hashed. This is distinct from -m 1410 (sha256($pass.$salt)) and -m 1400 (raw SHA2-256). The hash file format for -m 1420 is 'hash:salt' on each line. While salting does defeat rainbow tables, it does NOT slow down Hashcat — the GPU computes the salted hash at the same speed as the raw hash. True protection requires a slow KDF, not merely a salt. The fintech in this scenario should be advised to migrate to Argon2id.",
    recommendedCommands: [
      "hashcat -m 1420 -a 0 hashes.txt rockyou.txt",
      "hashcat -m 1420 -a 0 hashes.txt rockyou.txt -r best64.rule",
    ],
    bestPractices: [
      "Inspect the application source to determine exact salt-pass concatenation order.",
      "Verify the hash file format matches Hashcat's expected format string (hash:salt).",
      "Document the construction in your runbook — mode mismatches waste hours of compute.",
    ],
    defenseRecommendations: [
      "Use Argon2id instead of custom salted SHA — it handles salting and slow-KDF correctly.",
      "Store the algorithm version alongside the hash to enable future migrations.",
      "Audit cryptographic code with tools like semgrep to catch sha256($salt.$pass) anti-patterns.",
    ],
    xp: 220,
  },
  {
    id: 14,
    module: "SHA2-256",
    title: "Combinator Attack",
    difficulty: "Advanced",
    scenario:
      "After exhausting rockyou.txt + rules, 15% of SHA2-256 hashes remain uncracked. The engagement scope suggests users chose multi-word passwords like 'correcthorse', 'summerwinter', or 'passpassword'. You need an attack that combines two dictionary words without writing a custom generator.",
    objective:
      "Choose the correct Hashcat attack mode for combining two wordlists into all possible word-pair concatenations.",
    educationalContext:
      "The combinator attack (-a 1) takes two wordlists as input and produces every possible concatenation. If wordlist A has 1M entries and wordlist B has 1M entries, the result is 10^12 candidates. This is powerful for multi-word passwords (passphrases without spaces) but expensive — a single GPU processes ~10 billion SHA2-256 hashes per second, so 10^12 candidates takes ~100 seconds. Hashcat also supports combinator with rules (-a 1 with -j and -k flags for left/right side rules) for additional coverage. For multi-word passwords with spaces, use the combinator with a space appended to each left-side word.",
    questionType: "strategy",
    options: [
      "Combinator attack (hashcat -m 1400 -a 1 left.txt right.txt)",
      "Brute-force mask (?a?a?a?a?a?a?a?a?a?a)",
      "Hybrid wordlist + mask (hashcat -m 1400 -a 6 rockyou.txt ?d?d?d)",
      "Re-run rockyou.txt with dive.rule",
    ],
    expectedOption: "Combinator attack (hashcat -m 1400 -a 1 left.txt right.txt)",
    hint1: "Two-word passwords need a combinator — it merges two wordlists.",
    hint2: "Mode -a 1 takes two wordlists as positional arguments.",
    hint3: "Answer: hashcat -m 1400 -a 1 left.txt right.txt",
    explanation:
      "The combinator attack (-a 1) is the canonical approach for two-word passwords. It takes two wordlists and produces every pairwise concatenation. For best results, use a smaller curated wordlist (e.g., 10K common English words) on both sides — 10K × 10K = 100M combinations, exhausted in 10ms on a modern GPU. The combinator also accepts left-side (-j) and right-side (-k) rules to mutate each half independently (e.g., capitalize the first word, append digits to the second). For three-word passwords, chain the attack: hashcat ... -a 1 left.txt right.txt | hashcat ... -a 0 - combined.txt",
    recommendedCommands: [
      "hashcat -m 1400 -a 1 left.txt right.txt",
      "hashcat -m 1400 -a 1 left.txt right.txt -j '$ ' -k '$!'  # left + space, right + !",
    ],
    bestPractices: [
      "Curate the wordlists — smaller focused lists outperform huge unfocused ones.",
      "Use -j and -k to add separators (space, hyphen) and mutations between the two halves.",
      "Combine with --increment to grow candidate length gradually if memory-constrained.",
    ],
    defenseRecommendations: [
      "Multi-word passwords are stronger but predictable — enforce at least 4 words.",
      "Use the EFF diceware word list (7,776 words) for passphrase generation guidance.",
      "Block passwords matching 'word1+word2' patterns from common corpora.",
    ],
    xp: 220,
  },
  {
    id: 15,
    module: "SHA2-256",
    title: "Hybrid Attack",
    difficulty: "Advanced",
    scenario:
      "An engagement has revealed that users append 2-4 digits to common dictionary words (e.g., 'password23', 'admin2024', 'letmein99'). You need to construct a Hashcat hybrid attack that combines a wordlist with a numeric mask.",
    objective:
      "Choose the correct Hashcat hybrid attack mode for wordlist + numeric mask.",
    educationalContext:
      "Hybrid attacks (-a 6 and -a 7) combine a wordlist with a mask, dramatically expanding coverage for predictable patterns like 'word+digits' or 'digits+word'. -a 6 (Hybrid Wordlist + Mask) takes the wordlist first, then the mask — useful for 'password123' patterns. -a 7 (Hybrid Mask + Wordlist) takes the mask first, then the wordlist — useful for '123password' patterns. With --increment, Hashcat automatically grows the mask length from 1 to the specified maximum, covering 'password1' through 'password9999' in a single run. This is one of the highest-yield attacks for corporate password audits.",
    questionType: "strategy",
    options: [
      "Hybrid wordlist + mask (hashcat -m 1400 -a 6 rockyou.txt ?d?d?d?d --increment)",
      "Pure brute force mask (?a?a?a?a?a?a?a?a?a?a)",
      "Combinator attack (rockyou.txt + digits.txt)",
      "Re-run rockyou.txt with generated.rule",
    ],
    expectedOption:
      "Hybrid wordlist + mask (hashcat -m 1400 -a 6 rockyou.txt ?d?d?d?d --increment)",
    hint1: "Wordlist + mask = hybrid. -a 6 puts the wordlist first, then the mask.",
    hint2: "--increment grows the mask from 1 char to the specified length automatically.",
    hint3: "Answer: hashcat -m 1400 -a 6 rockyou.txt ?d?d?d?d --increment",
    explanation:
      "The hybrid wordlist + mask attack (-a 6) is the canonical approach for 'word+digits' patterns. Hashcat takes each wordlist entry and appends every possible mask combination. With --increment, the mask grows from 1 to 4 digits, covering 'password1' through 'password9999' in a single run. The total keyspace is 14M words × (10 + 100 + 1000 + 10000) = 156M candidates — exhausted in well under a second. This attack typically recovers an additional 5–15% of corporate passwords beyond a wordlist + rules pass. The reverse variant (-a 7) covers 'digits+word' patterns like '123password'.",
    recommendedCommands: [
      "hashcat -m 1400 -a 6 rockyou.txt ?d?d?d?d --increment",
      "hashcat -m 1400 -a 7 ?d?d?d rockyou.txt --increment  # mask first",
    ],
    bestPractices: [
      "Use --increment to cover variable-length suffixes in one run.",
      "Run -a 6 first (most common pattern), then -a 7 for prefix patterns.",
      "Apply rules to the wordlist side with -r for even broader coverage.",
    ],
    defenseRecommendations: [
      "Reject passwords matching 'word+digits' patterns via zxcvbn scoring.",
      "Educate users that appending digits to dictionary words is not 'complexity'.",
      "Implement breach-corpus checks at password creation time.",
    ],
    xp: 250,
  },

  // ============= MODULE 4 — WALLET.DAT TRAINING =============
  {
    id: 16,
    module: "WALLET.DAT",
    title: "Wallet File Identification",
    difficulty: "Advanced",
    scenario:
      "A digital forensics case involves a suspect's seized laptop with a 'wallet.dat' file. Your task is to identify what kind of file this is and what cryptographic material it contains — without ever touching a real cryptocurrency wallet. This is a training simulation using mock files only.",
    objective:
      "Identify what a Bitcoin Core wallet.dat file contains and why it is crackable.",
    educationalContext:
      "A Bitcoin Core wallet.dat file is a Berkeley DB (BDB) key-value store containing wallet metadata, keys, and encrypted private key material. When the user encrypts their wallet with a passphrase (via the GUI or 'encryptwallet' RPC), Bitcoin Core derives an AES-256-CBC key from the passphrase using a key derivation function and uses it to encrypt the private keys. Critically, older Bitcoin Core versions (pre-0.6) used a weak derivation: 1 iteration of SHA-512 + 1 iteration of SHA-256 — effectively unsalted and uniterable. Hashcat mode -m 11300 targets this exact construction. Modern Bitcoin Core uses 25,000 iterations of a HMAC-SHA512-based KDF, but the underlying principle (recover the passphrase, recover the keys) remains the same.",
    questionType: "identify",
    options: [
      "A Berkeley DB file containing AES-256-CBC-encrypted private keys protected by a passphrase-derived key",
      "A plain text file containing the wallet's seed phrase in cleartext",
      "A SQLite database containing only public addresses and transaction history",
      "A JSON file containing public blockchain data only",
    ],
    expectedOption:
      "A Berkeley DB file containing AES-256-CBC-encrypted private keys protected by a passphrase-derived key",
    hint1: "Bitcoin Core stores wallet data in Berkeley DB, not JSON or SQLite.",
    hint2: "When encrypted, the private keys are protected by an AES key derived from the user passphrase.",
    hint3: "Answer: A Berkeley DB file containing AES-256-CBC-encrypted private keys protected by a passphrase-derived key.",
    explanation:
      "A Bitcoin Core wallet.dat file is a Berkeley DB key-value store. When the user encrypts their wallet, the application derives an AES-256-CBC key from the passphrase using a KDF and uses it to encrypt the private keys. The encrypted key material and KDF parameters (salt, iteration count) are stored inside the wallet.dat file itself. An attacker with the wallet.dat can extract the encrypted key blob and KDF parameters, then mount an offline passphrase recovery attack using Hashcat. This is fully offline — no blockchain access is required. Hashcat mode -m 11300 targets the legacy weak KDF; mode -m 16600 targets the modern 25k-iteration derivation. In training simulations only, the same workflow applies to mock wallet files.",
    recommendedCommands: [
      "# Educational only — never operate on real wallets",
      "python3 extract_wallet_hash.py mock_wallet.dat > wallet.hash",
      "hashcat -m 11300 -a 0 wallet.hash rockyou.txt  # legacy weak KDF",
    ],
    bestPractices: [
      "Only ever operate on training mock wallets — real wallets may have legal/ethical constraints.",
      "Extract the KDF parameters and encrypted key material with a documented script.",
      "Identify the wallet software version — pre-0.6 (mode 11300) vs modern (mode 16600).",
    ],
    defenseRecommendations: [
      "Use a high-entropy passphrase (16+ random words) on any cryptocurrency wallet.",
      "Prefer hardware wallets (Ledger, Trezor) that store keys offline.",
      "Migrate from legacy wallet.dat to modern BIP-39/BIP-44 hierarchical deterministic wallets.",
    ],
    xp: 280,
  },
  {
    id: 17,
    module: "WALLET.DAT",
    title: "Wallet Hashcat Mode Selection",
    difficulty: "Advanced",
    scenario:
      "You have extracted a wallet hash from a MOCK training wallet.dat file (legacy Bitcoin Core format, pre-0.6). You need to choose the correct Hashcat mode for the KDF construction used.",
    objective:
      "Select the correct Hashcat mode for a legacy Bitcoin Core wallet.dat passphrase recovery.",
    educationalContext:
      "Hashcat supports two primary Bitcoin Core wallet modes: -m 11300 (Bitcoin/Litecoin wallet.dat, legacy pre-0.6 KDF — 1 iteration SHA-512 + 1 iteration SHA-256, AES-256-CBC) and -m 16600 (Bitcoin/Litecoin wallet.dat, modern KDF — 25,000 iterations of HMAC-SHA512). The legacy mode is dramatically faster to attack — a single GPU can test ~10 million passphrases per second versus ~1,000 per second for the modern mode. The choice of mode depends entirely on the wallet software version that created the file. Wallet software is identifiable by examining the wallet.dat version bytes (e.g., version 60000 = pre-0.6; version 10300 = modern).",
    questionType: "identify",
    options: [
      "-m 11300 (Bitcoin wallet.dat — legacy KDF, pre-0.6)",
      "-m 0 (MD5)",
      "-m 1400 (SHA2-256)",
      "-m 16600 (Bitcoin wallet.dat — modern KDF, post-0.6)",
    ],
    expectedOption: "-m 11300 (Bitcoin wallet.dat — legacy KDF, pre-0.6)",
    hint1: "Legacy Bitcoin Core (pre-0.6) uses a weak KDF — only 1 iteration of SHA-512 + SHA-256.",
    hint2: "Mode 11300 = legacy, mode 16600 = modern.",
    hint3: "Answer: -m 11300 (legacy wallet.dat).",
    explanation:
      "Hashcat mode -m 11300 targets the legacy Bitcoin Core wallet.dat KDF (pre-0.6 versions). The KDF computes sha256(sha512(passphrase . salt)) — only 2 hash iterations total, no stretching. This makes legacy wallets extremely fast to attack: a single RTX 4090 achieves ~10 million guesses per second. The hash format string for -m 11300 is '$bitcoin$64$hex_salt$64$hex_encrypted_data$2$00$00$00'. For modern wallets (post-0.6), use -m 16600 which targets the 25,000-iteration HMAC-SHA512 KDF (~1000 guesses/sec on a GPU). Always confirm the wallet version before assigning the mode — choosing incorrectly means hours of wasted compute.",
    recommendedCommands: [
      "hashcat -m 11300 -a 0 wallet.hash rockyou.txt  # legacy",
      "hashcat -m 16600 -a 0 wallet.hash rockyou.txt  # modern",
    ],
    bestPractices: [
      "Identify wallet software version from wallet.dat header bytes before assigning mode.",
      "Use --status and --status-timer=30 for wallet attacks (they are long-running).",
      "Save the extracted hash to disk so the attack can be resumed across sessions.",
    ],
    defenseRecommendations: [
      "Upgrade legacy Bitcoin Core wallets to modern versions immediately.",
      "Use a 16+ word passphrase derived from a high-entropy source (diceware, RNG).",
      "Move funds to a hardware wallet for long-term storage.",
    ],
    xp: 280,
  },
  {
    id: 18,
    module: "WALLET.DAT",
    title: "Wallet Attack Command Building",
    difficulty: "Advanced",
    scenario:
      "You have a MOCK training wallet hash (legacy -m 11300). The wallet owner is known to use 6-8 character lowercase passphrases with a single trailing digit (e.g., 'satoshi1'). Construct the optimal Hashcat command.",
    objective:
      "Build the correct Hashcat command for a legacy wallet hash with a known password pattern (lowercase word + single digit).",
    educationalContext:
      "When the password structure is known, a hybrid attack (wordlist + mask) is dramatically faster than a pure wordlist. For 'word + 1 digit', -a 6 with mask ?d covers 10× the wordlist size. For 'word + 2 digits', use ?d?d (100×). With --increment, Hashcat grows the mask length automatically — useful when the trailing-digit count is uncertain. Because wallet.dat attacks are slower than raw hashes (legacy mode 11300 is ~10M guesses/sec vs 10B/sec for MD5), the time savings from a targeted attack are amplified. A bare rockyou.txt pass takes ~1.4 seconds; a rockyou.txt + ?d?d?d pass takes ~140 seconds; a brute-force of all 8-char lowercase+digits takes ~5 minutes.",
    questionType: "command",
    options: [
      "hashcat -m 11300 -a 6 wallet.hash rockyou.txt ?d --increment",
      "hashcat -m 0 -a 0 wallet.hash rockyou.txt",
      "hashcat -m 11300 -a 3 wallet.hash ?l?l?l?l?l?l?l?l",
      "hashcat -m 16600 -a 0 wallet.hash rockyou.txt",
    ],
    expectedOption: "hashcat -m 11300 -a 6 wallet.hash rockyou.txt ?d --increment",
    hint1: "Hybrid wordlist + mask is -a 6. Use ?d for the trailing digit.",
    hint2: "--increment grows the mask from 1 digit up to the specified length.",
    hint3: "Answer: hashcat -m 11300 -a 6 wallet.hash rockyou.txt ?d --increment",
    explanation:
      "The optimal command for 'lowercase word + 1 trailing digit' is hashcat -m 11300 -a 6 wallet.hash rockyou.txt ?d --increment. The -a 6 mode takes the wordlist first, then the mask, producing every 'word + digit' combination. With --increment, Hashcat tries 0 digits (just the word), then 1 digit — covering both 'satoshi' and 'satoshi1' in one run. The total keyspace is 14M words × (1 + 10) = 154M candidates, exhausted in ~15 seconds on a single GPU. This is 100x faster than a pure brute-force of 8-char lowercase+digits (2.8 trillion combinations). Targeted attacks leveraging known patterns are essential for slower hash modes like wallet.dat.",
    recommendedCommands: [
      "hashcat -m 11300 -a 6 wallet.hash rockyou.txt ?d --increment",
      "hashcat -m 11300 -a 6 wallet.hash rockyou.txt ?d?d --increment  # 1-2 digits",
    ],
    bestPractices: [
      "Use --increment when the trailing-digit count is uncertain.",
      "Apply rules (-r best64.rule) to the wordlist side for additional mutations.",
      "Always run a quick wordlist pass before escalating to masks or hybrids.",
    ],
    defenseRecommendations: [
      "Reject passphrases that match 'word + digits' patterns via zxcvbn.",
      "Encourage 16+ character passphrases with multiple unrelated words.",
      "Use a hardware wallet to remove the wallet.dat passphrase attack surface entirely.",
    ],
    xp: 300,
  },
  {
    id: 19,
    module: "WALLET.DAT",
    title: "Wallet Recovery Attack Planning",
    difficulty: "Advanced",
    scenario:
      "A client has lost the passphrase to their (MOCK training) legacy Bitcoin wallet. They remember: (a) it was 10-12 characters, (b) contained their pet's name 'Bella' somewhere, (c) had 2-3 digits, (d) had one uppercase letter. Plan the optimal attack sequence.",
    objective:
      "Choose the optimal multi-stage attack plan for a wallet with known structural clues.",
    educationalContext:
      "Real-world wallet recovery is rarely a single attack — it is a multi-stage escalation that exploits every known clue. The optimal sequence is: (1) Quick wordlist pass with rockyou.txt (covers the obvious); (2) Hybrid wordlist + mask targeting 'Bella' + digits (covers 'Bella123', 'Bella99'); (3) Combinator attack with a Bella-focused list + rockyou.txt (covers 'BellaRocky', 'Bellabear'); (4) Mask attack on the structural pattern (?u?l?l?l?l?d?d?d = 'Bella123'); (5) Full brute-force of 10-12 char ?a as a last resort. Each stage is logged so resuming is possible. The potfile ensures already-recovered hashes are not re-attempted.",
    questionType: "strategy",
    options: [
      "Multi-stage: (1) rockyou.txt, (2) hybrid 'Bella'+?d?d?d, (3) combinator Bella-list+rockyou, (4) mask ?u?l?l?l?l?d?d?d",
      "Pure brute force of all 10-character passwords (?a × 10)",
      "Single rockyou.txt + dive.rule pass",
      "Combinator attack with rockyou.txt × rockyou.txt",
    ],
    expectedOption:
      "Multi-stage: (1) rockyou.txt, (2) hybrid 'Bella'+?d?d?d, (3) combinator Bella-list+rockyou, (4) mask ?u?l?l?l?l?d?d?d",
    hint1: "Use every clue — pet name 'Bella', 2-3 digits, 1 uppercase. Multi-stage escalation is standard.",
    hint2: "Stage 1: rockyou. Stage 2: hybrid 'Bella' + ?d?d?d. Stage 3: combinator. Stage 4: targeted mask.",
    hint3: "Answer: Multi-stage attack leveraging all known clues in order of escalating cost.",
    explanation:
      "The optimal approach is multi-stage escalation. Stage 1: rockyou.txt covers the obvious cases (5 seconds). Stage 2: A hybrid attack with a small 'Bella-themed' wordlist + ?d?d?d covers 'Bella123', 'Bella99', 'MyBella2024' (~1 minute). Stage 3: A combinator attack with the Bella list on one side and rockyou.txt on the other covers 'BellaRocky', 'Bellabear' (~10 minutes). Stage 4: A targeted mask ?u?l?l?l?l?d?d?d covers the structural pattern 'Bella123' (1 second). Stage 5 (last resort): Full brute-force of 10-12 char ?a is 95^12 ≈ 5.4 × 10^23 — infeasible, so only attempt if all else fails. Each stage is logged and the potfile ensures continuity.",
    recommendedCommands: [
      "# Stage 1: wordlist\nhashcat -m 11300 wallet.hash rockyou.txt\n# Stage 2: hybrid\nhashcat -m 11300 -a 6 bella_list.txt ?d?d?d --increment\n# Stage 3: combinator\nhashcat -m 11300 -a 1 bella_list.txt rockyou.txt\n# Stage 4: targeted mask\nhashcat -m 11300 -a 3 wallet.hash ?u?l?l?l?l?d?d?d",
    ],
    bestPractices: [
      "Document each stage's runtime and yield so future engagements can prioritize.",
      "Always run the cheapest stage first — escalate only when previous stages fail.",
      "Use --session to name each run so they can be resumed independently.",
    ],
    defenseRecommendations: [
      "Use a high-entropy passphrase with no personal information (pet names, dates).",
      "Store the passphrase in a secure offline medium (metal plate, safe deposit box).",
      "Prefer hardware wallets that never expose wallet.dat to offline attack.",
    ],
    xp: 320,
  },
  {
    id: 20,
    module: "WALLET.DAT",
    title: "Complete Recovery Simulation",
    difficulty: "Advanced",
    scenario:
      "FINAL CAPSTONE. You have been given a MOCK training wallet hash extracted from a simulated legacy Bitcoin Core wallet.dat. The wallet owner has confirmed the passphrase is a common English word (found in rockyou.txt) with a single trailing digit (0-9). Execute the full recovery workflow: identify, select strategy, build command, recover.",
    objective:
      "Recover the simulated wallet passphrase. The expected answer is the recovered plaintext.",
    educationalContext:
      "This capstone integrates every skill you have learned across the 19 previous challenges: (1) Hash identification — recognize the wallet hash format; (2) Mode selection — choose -m 11300 for legacy Bitcoin Core; (3) Strategy — given the known structure (common word + 1 digit), a hybrid attack is optimal; (4) Command construction — assemble the correct -a 6 command with ?d mask; (5) Execution — run the attack, monitor progress, retrieve the recovered passphrase from the potfile. The MOCK wallet passphrase is 'satoshi1' — a tribute to the pseudonymous creator of Bitcoin. Real-world recovery engagements follow this exact workflow, scaled to the complexity of the case.",
    hash: "$bitcoin$64$c2e8c8c284d4d4d4d4d4d4d4d4d4d4d4d4d4d4d4d4d4d4d4d4d4d4d4d4d4d4$64$e2c2c2c2c2c2c2c2c2c2c2c2c2c2c2c2c2c2c2c2c2c2c2c2c2c2c2c2c2c2c2c2$2$00$2c00",
    hashType: "Bitcoin Wallet (Legacy)",
    hashcatMode: 11300,
    hint1: "Use the hybrid attack: wordlist + single digit mask.",
    hint2: "The passphrase is the pseudonymous creator of Bitcoin + the digit '1'.",
    hint3: "Answer is 'satoshi1' — the recovered passphrase.",
    expectedAnswer: "satoshi1",
    questionType: "crack",
    explanation:
      "The capstone passphrase is 'satoshi1' — a tribute to Satoshi Nakamoto, the pseudonymous creator of Bitcoin. The recovery workflow integrates: (1) Identification: the hash begins with $bitcoin$64$ — confirming Bitcoin Core wallet format; (2) Mode: -m 11300 for the legacy KDF; (3) Strategy: known structure (word + 1 digit) → hybrid attack; (4) Command: hashcat -m 11300 -a 6 wallet.hash rockyou.txt ?d; (5) Execution: the attack runs in seconds and recovers 'satoshi1' from the potfile. This workflow — identify, select, build, execute, recover — is the universal template for any password recovery engagement. Congratulations on completing all 20 challenges. You are now a certified MOT Hashcat Playground graduate.",
    recommendedCommands: [
      "hashcat -m 11300 -a 6 wallet.hash rockyou.txt ?d",
      "hashcat -m 11300 wallet.hash --show  # retrieve from potfile",
    ],
    bestPractices: [
      "Always retrieve results with --show to avoid re-running the attack.",
      "Document the recovered passphrase and the attack that worked in your case file.",
      "Wipe any intermediate hash files securely after the engagement.",
    ],
    defenseRecommendations: [
      "Use a 16+ character random passphrase for any cryptocurrency wallet.",
      "Prefer hardware wallets — they eliminate the wallet.dat attack surface.",
      "Back up the seed phrase offline (metal plate) and never store it digitally.",
    ],
    xp: 500,
  },
];

export function getChallenge(id: number): Challenge | undefined {
  return CHALLENGES.find((c) => c.id === id);
}

export function getModuleChallenges(moduleName: string): Challenge[] {
  return CHALLENGES.filter((c) => c.module === moduleName);
}

export const MODULES = [
  {
    name: "MD5",
    code: "MODULE 1",
    description: "Master the foundational hash function. 5 challenges covering cracking, wordlists, masks, and mode identification.",
    color: "#00E5FF",
    challenges: [1, 2, 3, 4, 5],
  },
  {
    name: "SHA1",
    code: "MODULE 2",
    description: "Progress to 160-bit hashing. 5 challenges covering rules, masks, mode selection, and wordlist + rules strategy.",
    color: "#00FF88",
    challenges: [6, 7, 8, 9, 10],
  },
  {
    name: "SHA2-256",
    code: "MODULE 3",
    description: "Modern 256-bit hashing. 5 challenges covering hybrid attacks, combinator attacks, and salted variants.",
    color: "#FFC857",
    challenges: [11, 12, 13, 14, 15],
  },
  {
    name: "WALLET.DAT",
    code: "MODULE 4",
    description: "Capstone module on simulated wallet recovery. 5 challenges covering identification, mode selection, command building, attack planning, and full recovery. Mock training files only — no real cryptocurrency.",
    color: "#B484FF",
    challenges: [16, 17, 18, 19, 20],
  },
];

export const TOTAL_XP = CHALLENGES.reduce((sum, c) => sum + c.xp, 0);
