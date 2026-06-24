// MOT Hashcat Playground — Wordlists, Rules, Masks reference data

export interface Wordlist {
  id: string;
  name: string;
  description: string;
  size: string;
  entries: number;
  sample: string[];
  category: "common" | "leaked" | "custom" | "themed";
  isPremium?: boolean;
}

export const WORDLISTS: Wordlist[] = [
  {
    id: "rockyou-subset",
    name: "rockyou.txt (subset)",
    description:
      "A curated 10,000-entry subset of the legendary rockyou.txt leak (2009). Contains the most common passwords in the wild. This is the gold-standard first-pass wordlist for any engagement.",
    size: "85 KB",
    entries: 10000,
    sample: ["123456", "password", "iloveyou", "princess", "12345678", "abc123", "nicole", "daniel", "babygirl", "monkey"],
    category: "leaked",
  },
  {
    id: "common-passwords",
    name: "Common Passwords 1K",
    description:
      "The top 1,000 most common passwords compiled from multiple breach corpora. Extremely high yield per entry — recover 40-60% of real-world passwords in milliseconds.",
    size: "9 KB",
    entries: 1000,
    sample: ["password", "123456", "qwerty", "letmein", "admin", "welcome", "monkey", "dragon", "master", "sunshine"],
    category: "common",
  },
  {
    id: "leaked-top10k",
    name: "Leaked Top 10K",
    description:
      "The 10,000 most frequently seen passwords across public breach corpora (HIBP, Collection #1, PwndDB). Extremely effective against corporate password audits.",
    size: "82 KB",
    entries: 10000,
    sample: ["password1", "welcome1", "summer2024", "letmein123", "P@ssw0rd", "Qwerty123", "Admin2024", "changeme", "football", "baseball"],
    category: "leaked",
  },
  {
    id: "custom-corporate",
    name: "Corporate Pattern List",
    description:
      "Generated patterns common in corporate environments: 'Company+Year', 'Season+Year', 'Welcome+Digit'. Replace 'Company' with the target org name before use.",
    size: "15 KB",
    entries: 2000,
    sample: ["Company2024", "Company2023", "Summer2024", "Winter2024", "Welcome1", "Welcome123", "ChangeMe!", "Password1", "Company!2024", "Spring2024"],
    category: "custom",
  },
  {
    id: "themed-crypto",
    name: "Crypto-Themed List",
    description:
      "Cryptocurrency-themed passphrases for wallet recovery training: 'satoshi', 'bitcoin', 'blockchain', 'nakamoto', and 500 common variations. For training simulations only.",
    size: "8 KB",
    entries: 500,
    sample: ["satoshi", "nakamoto", "bitcoin", "blockchain", "crypto", "halving", "genesis", "mining", "wallet", "ledger"],
    category: "themed",
  },
  {
    id: "custom-names",
    name: "First Names 5K",
    description:
      "5,000 common first names (English). Useful as the left side of a combinator attack: name + year, name + '!'. Often yields 10-20% additional recovery on user-chosen passwords.",
    size: "32 KB",
    entries: 5000,
    sample: ["michael", "jessica", "matthew", "ashley", "david", "jennifer", "james", "amanda", "john", "sarah"],
    category: "custom",
  },
];

export interface RuleSet {
  id: string;
  name: string;
  filename: string;
  description: string;
  rules: number;
  exampleMutations: { rule: string; word: string; result: string; explanation: string }[];
  performanceNote: string;
}

export const RULES: RuleSet[] = [
  {
    id: "best64",
    name: "best64.rule",
    filename: "best64.rule",
    description:
      "76 high-yield rules hand-curated by the Hashcat community. Covers capitalization, common digit appendages, leetspeak, and reversals. This is the standard first-pass rule set after a bare wordlist attack.",
    rules: 76,
    exampleMutations: [
      { rule: ":", word: "password", result: "password", explanation: "Identity — keep the word as-is" },
      { rule: "l", word: "Password", result: "password", explanation: "Lowercase all characters" },
      { rule: "u", word: "password", result: "PASSWORD", explanation: "Uppercase all characters" },
      { rule: "c", word: "password", result: "Password", explanation: "Capitalize first letter" },
      { rule: "$1", word: "password", result: "password1", explanation: "Append '1'" },
      { rule: "$2$0$2$4", word: "password", result: "password2024", explanation: "Append '2024'" },
      { rule: "r", word: "password", result: "drowssap", explanation: "Reverse the word" },
      { rule: "so0", word: "password", result: "pa55w0rd", explanation: "Replace 'o' with '0'" },
    ],
    performanceNote:
      "Multiplies a 14M wordlist to ~1B candidates. Runs in <1 second on a modern GPU. Always run after the bare wordlist pass.",
  },
  {
    id: "dive",
    name: "dive.rule",
    filename: "dive.rule",
    description:
      "~99,000 rules covering an enormous range of mutations. The next escalation after best64.rule. Dramatically higher coverage but takes significantly longer (minutes vs seconds).",
    rules: 99000,
    exampleMutations: [
      { rule: "c$1", word: "password", result: "Password1", explanation: "Capitalize + append '1'" },
      { rule: "u$!$9$9", word: "password", result: "PASSWORD!99", explanation: "Uppercase + append '!99'" },
      { rule: "ss$", word: "password", result: "pas$word", explanation: "Replace 's' with '$'" },
      { rule: "f", word: "password", result: "passwordpassword", explanation: "Duplicate the word" },
    ],
    performanceNote:
      "Multiplies a 14M wordlist to ~1.4T candidates. Runs in ~3 minutes on a modern GPU. Use only after best64.rule has been exhausted.",
  },
  {
    id: "generated",
    name: "generated.rule",
    filename: "generated.rule",
    description:
      "Algorithmically generated rules covering combinations of single-character append/prepend and case toggles. Useful when best64 and dive have been exhausted and you suspect structured patterns.",
    rules: 50000,
    exampleMutations: [
      { rule: "$a", word: "password", result: "passworda", explanation: "Append 'a'" },
      { rule: "^a", word: "password", result: "apassword", explanation: "Prepend 'a'" },
      { rule: "t0", word: "password", result: "Password", explanation: "Toggle case at position 0" },
    ],
    performanceNote:
      "Runs in ~1.5 minutes on a modern GPU. Best used as a third escalation step after best64 and dive.",
  },
  {
    id: "custom",
    name: "custom.rule",
    filename: "custom.rule",
    description:
      "User-defined rules tailored to the engagement. Often incorporates the target organization name, year, and known patterns. Custom rules typically yield the highest incremental recovery when other rules have been exhausted.",
    rules: 0,
    exampleMutations: [
      { rule: "$Y$e$a$r", word: "Welcome", result: "Welcome2024", explanation: "Append current year" },
      { rule: "c$!", word: "company", result: "Company!", explanation: "Capitalize + append '!'" },
    ],
    performanceNote:
      "Custom rules are sized by the analyst. Start small (50-200 rules) and expand based on yield.",
  },
];

export interface MaskPreset {
  id: string;
  name: string;
  mask: string;
  description: string;
  keyspace: number;
  examplePassword: string;
}

export const MASK_PRESETS: MaskPreset[] = [
  {
    id: "6digit",
    name: "6-digit PIN",
    mask: "?d?d?d?d?d?d",
    description: "All 6-digit numeric combinations. Common for banking PINs and short numeric passwords.",
    keyspace: 1000000,
    examplePassword: "123456",
  },
  {
    id: "8digit",
    name: "8-digit Numeric",
    mask: "?d?d?d?d?d?d?d?d",
    description: "All 8-digit numeric combinations. Often matches DDMMYYYY birth dates.",
    keyspace: 100000000,
    examplePassword: "12345678",
  },
  {
    id: "8lower",
    name: "8-char Lowercase",
    mask: "?l?l?l?l?l?l?l?l",
    description: "All 8-character lowercase alphabetic combinations.",
    keyspace: 208827064576,
    examplePassword: "password",
  },
  {
    id: "ullldddd",
    name: "ULLLDDDD Pattern",
    mask: "?u?l?l?l?d?d?d?d",
    description: "One uppercase, three lowercase, four digits. Common in corporate password policies.",
    keyspace: 4569760000,
    examplePassword: "Abcd1234",
  },
  {
    id: "8all",
    name: "8-char All Printable",
    mask: "?a?a?a?a?a?a?a?a",
    description: "All 8-character combinations from the printable ASCII set. The full keyspace — slow.",
    keyspace: 6634204312890625,
    examplePassword: "P@ssw0rd",
  },
];

export const MASK_CHARSET_LEGEND = [
  { token: "?l", description: "Lowercase a-z", size: "26 chars" },
  { token: "?u", description: "Uppercase A-Z", size: "26 chars" },
  { token: "?d", description: "Digits 0-9", size: "10 chars" },
  { token: "?s", description: "Special: !@#$%^&*...", size: "33 chars" },
  { token: "?a", description: "All printable (l+u+d+s)", size: "95 chars" },
  { token: "?b", description: "Binary (0x00 - 0xFF)", size: "256 chars" },
  { token: "?1 - ?4", description: "Custom charsets defined via -1, -2, -3, -4", size: "user-defined" },
];

export interface HashcatMode {
  mode: number;
  name: string;
  category: string;
  exampleHash: string;
  notes?: string;
}

export const HASHCAT_MODES: HashcatMode[] = [
  { mode: 0, name: "MD5", category: "Raw Hash", exampleHash: "5f4dcc3b5aa765d61d8327deb882cf99" },
  { mode: 100, name: "SHA1", category: "Raw Hash", exampleHash: "5baa61e4c9b93f3f0682250b6cf8331b7ee68fd8" },
  { mode: 1400, name: "SHA2-256", category: "Raw Hash", exampleHash: "5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8" },
  { mode: 1700, name: "SHA2-512", category: "Raw Hash", exampleHash: "b109f3bbbc244eb82441917ed06d618b9008dd09b3befd1b5..." },
  { mode: 1000, name: "NTLM", category: "Operating System", exampleHash: "b4b9b02e6f09a9bd760f388b67351e2b" },
  { mode: 1100, name: "Domain Cached Credential (DCC), NTLM", category: "Operating System", exampleHash: " Administrator:..." },
  { mode: 1410, name: "sha256($pass.$salt)", category: "Salted", exampleHash: "<hash>:<salt>" },
  { mode: 1420, name: "sha256($salt.$pass)", category: "Salted", exampleHash: "<hash>:<salt>" },
  { mode: 1450, name: "HMAC-SHA256 (key = $pass)", category: "HMAC", exampleHash: "<hmac>:<msg>" },
  { mode: 3200, name: "bcrypt $2*$", category: "Slow KDF", exampleHash: "$2a$05$..." },
  { mode: 11300, name: "Bitcoin/Litecoin wallet.dat (legacy)", category: "Wallet", exampleHash: "$bitcoin$64$<salt>$64$<encrypted>$2$00$00$..." },
  { mode: 16600, name: "Electrum Wallet (Salt-Type 5)", category: "Wallet", exampleHash: "$electrum$5*<salt>*<encrypted>" },
  { mode: 12100, name: "PBKDF2-HMAC-SHA512", category: "Slow KDF", exampleHash: "...:..." },
  { mode: 22000, name: "WPA-PBKDF2-PMKID+EAPOL", category: "Network", exampleHash: "..." },
];

export interface AttackMode {
  mode: number;
  flag: string;
  name: string;
  description: string;
  useCase: string;
  exampleCommand: string;
}

export const ATTACK_MODES: AttackMode[] = [
  {
    mode: 0,
    flag: "-a 0",
    name: "Straight",
    description: "Iterate a wordlist verbatim, optionally applying rules.",
    useCase: "First-pass dictionary attack. Highest yield per second on any unsalted hash list.",
    exampleCommand: "hashcat -m 0 -a 0 hashes.txt rockyou.txt",
  },
  {
    mode: 1,
    flag: "-a 1",
    name: "Combination",
    description: "Concatenate every word from wordlist A with every word from wordlist B.",
    useCase: "Multi-word passwords like 'correcthorse', 'summerwinter'.",
    exampleCommand: "hashcat -m 0 -a 1 left.txt right.txt",
  },
  {
    mode: 3,
    flag: "-a 3",
    name: "Brute-force (Mask)",
    description: "Generate candidates from a mask pattern (?l?u?d?s?a).",
    useCase: "Known password structure (length, charset pattern).",
    exampleCommand: "hashcat -m 0 -a 3 hash.txt ?d?d?d?d?d?d",
  },
  {
    mode: 6,
    flag: "-a 6",
    name: "Hybrid Wordlist + Mask",
    description: "Wordlist first, then mask appended to each word.",
    useCase: "'password123' patterns — dictionary word + trailing digits.",
    exampleCommand: "hashcat -m 0 -a 6 rockyou.txt ?d?d?d --increment",
  },
  {
    mode: 7,
    flag: "-a 7",
    name: "Hybrid Mask + Wordlist",
    description: "Mask first, then wordlist appended to each mask pattern.",
    useCase: "'123password' patterns — leading digits + dictionary word.",
    exampleCommand: "hashcat -m 0 -a 7 ?d?d?d rockyou.txt --increment",
  },
  {
    mode: 9,
    flag: "-a 9",
    name: "Association",
    description: "Rule-based association attack — for each hash, apply a rule that depends on the hash itself.",
    useCase: "Specialized: mode-specific transformations tied to the target.",
    exampleCommand: "hashcat -m 0 -a 9 hash.txt wordlist.txt",
  },
];
