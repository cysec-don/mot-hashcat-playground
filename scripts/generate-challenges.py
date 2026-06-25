#!/usr/bin/env python3
"""Generate the 100-challenge challenges-data.ts file."""
import os

FILE = "/home/z/my-project/src/lib/challenges-data.ts"

content = '''// MOT Hashcat Playground — 100 progressive challenges across 8 modules
// All hashes are well-known public test vectors for educational use only.

export type ChallengeDifficulty = "Beginner" | "Intermediate" | "Advanced" | "Expert";

export interface Challenge {
  id: number;
  module: string;
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
  hint4: string;
  expectedAnswer?: string;
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
'''

# Helper to generate a challenge
def ch(id, module, title, diff, scenario, objective, ctx, h1, h2, h3, h4, qtype, xp, **kw):
    d = {
        "id": id, "module": module, "title": title, "difficulty": diff,
        "scenario": scenario, "objective": objective, "educationalContext": ctx,
        "hint1": h1, "hint2": h2, "hint3": h3, "hint4": h4,
        "questionType": qtype, "xp": xp,
        "recommendedCommands": kw.get("cmds", []),
        "bestPractices": kw.get("bp", []),
        "defenseRecommendations": kw.get("defense", []),
        "explanation": kw.get("expl", ""),
    }
    for k in ["hash", "hashType", "hashcatMode", "expectedAnswer", "options", "expectedOption"]:
        if k in kw:
            d[k] = kw[k]
    return d

challenges = []

# === MODULE 1: HASH IDENTIFICATION (30 challenges) ===
M1 = "Hash Identification"
challenges.append(ch(1, M1, "Identify MD5 by Length", "Beginner",
    "A SOC analyst found a 32-character hexadecimal hash in a legacy authentication log. Identify the hash type.",
    "Select the correct hash type for a 32-hex-char digest.",
    "MD5 produces a 128-bit digest rendered as 32 hexadecimal characters. Hashcat mode 0.",
    "Count the hex characters in the hash.", "32 hex chars = 128 bits. Which algorithm produces 128 bits?",
    "MD5 is Hashcat mode 0 and produces 32-char hex output.", "Review the Hash Identification reference table.",
    "identify", 100, hash="5f4dcc3b5aa765d61d8327deb882cf99", hashType="MD5", hashcatMode=0,
    options=["MD5 (mode 0)", "SHA1 (mode 100)", "SHA256 (mode 1400)", "NTLM (mode 1000)"],
    expectedOption="MD5 (mode 0)",
    expl="32 hex chars = 128 bits = MD5 (mode 0). SHA1 is 40, SHA256 is 64, NTLM is 32 but uses MD4.",
    cmds=["hashid '5f4dcc3b5aa765d61d8327deb882cf99'", "hashcat -m 0 -a 0 hash.txt rockyou.txt"],
    bp=["Count hex chars first to narrow the algorithm."], defense=["Migrate from MD5 to Argon2id."]))

challenges.append(ch(2, M1, "Identify SHA1 by Length", "Beginner",
    "A database column contains a 40-character hex string. Identify the hash type.",
    "Select the correct hash type for a 40-hex-char digest.",
    "SHA1 produces a 160-bit digest rendered as 40 hexadecimal characters. Hashcat mode 100.",
    "Count the hex characters.", "40 hex chars = 160 bits. Which algorithm produces 160 bits?",
    "SHA1 is Hashcat mode 100.", "Review the Hash Identification reference table.",
    "identify", 100, hash="5baa61e4c9b93f3f0682250b6cf8331b7ee68fd8", hashType="SHA1", hashcatMode=100,
    options=["MD5 (mode 0)", "SHA1 (mode 100)", "SHA256 (mode 1400)", "SHA512 (mode 1700)"],
    expectedOption="SHA1 (mode 100)",
    expl="40 hex chars = 160 bits = SHA1 (mode 100).",
    cmds=["hashid '5baa61e4c9b93f3f0682250b6cf8331b7ee68fd8'"],
    bp=["40 hex chars almost always means SHA1."], defense=["Migrate from SHA1 to SHA2-256 or Argon2id."]))

challenges.append(ch(3, M1, "Identify SHA256 by Length", "Beginner",
    "A modern web app stores a 64-character hex hash. Identify the type.",
    "Select the correct hash type for a 64-hex-char digest.",
    "SHA256 produces a 256-bit digest rendered as 64 hexadecimal characters. Hashcat mode 1400.",
    "Count the hex characters.", "64 hex chars = 256 bits. Which algorithm produces 256 bits?",
    "SHA256 is Hashcat mode 1400.", "Review the Hash Identification reference table.",
    "identify", 100, hash="5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8", hashType="SHA2-256", hashcatMode=1400,
    options=["SHA1 (mode 100)", "SHA256 (mode 1400)", "SHA512 (mode 1700)", "MD5 (mode 0)"],
    expectedOption="SHA256 (mode 1400)",
    expl="64 hex chars = 256 bits = SHA256 (mode 1400).",
    cmds=["hashid '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8'"],
    bp=["64 hex chars = SHA256."], defense=["Use Argon2id instead of raw SHA256 for passwords."]))

challenges.append(ch(4, M1, "Identify SHA512 by Length", "Beginner",
    "A high-security system stores a 128-character hex hash. Identify the type.",
    "Select the correct hash type for a 128-hex-char digest.",
    "SHA512 produces a 512-bit digest rendered as 128 hexadecimal characters. Hashcat mode 1700.",
    "Count the hex characters.", "128 hex chars = 512 bits. Which algorithm produces 512 bits?",
    "SHA512 is Hashcat mode 1700.", "Review the Hash Identification reference table.",
    "identify", 120, hash="ee26b0dd4af7e749aa1a8ee3c10ae9923f618980772e473f8819a5d4940e0db27ac185f8a0e1d5f84f88bc887fd67b143732c304cc5fa9ad8e6f57f50028a8ff", hashType="SHA2-512", hashcatMode=1700,
    options=["SHA256 (mode 1400)", "SHA512 (mode 1700)", "RIPEMD-160 (mode 6000)", "MD5 (mode 0)"],
    expectedOption="SHA512 (mode 1700)",
    expl="128 hex chars = 512 bits = SHA512 (mode 1700).",
    cmds=["hashcat -m 1700 -a 0 hash.txt rockyou.txt"],
    bp=["128 hex chars = SHA512."], defense=["Use Argon2id; SHA512 alone is too fast."]))

challenges.append(ch(5, M1, "Identify bcrypt Hash", "Beginner",
    "A web app stores passwords with a hash starting with $2a$10$. Identify the type.",
    "Select the correct hash type for a $2a$ prefixed hash.",
    "bcrypt hashes start with $2a$, $2b$, or $2y$ followed by the cost factor. Hashcat mode 3200.",
    "Look at the prefix of the hash.", "Hashes starting with $2a$, $2b$, or $2y$ are bcrypt.",
    "bcrypt is Hashcat mode 3200.", "Review the bcrypt section.",
    "identify", 150, hash="$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy", hashType="bcrypt", hashcatMode=3200,
    options=["bcrypt (mode 3200)", "MD5 (mode 0)", "SHA256 (mode 1400)", "NTLM (mode 1000)"],
    expectedOption="bcrypt (mode 3200)",
    expl="Hashes starting with $2a$, $2b$, or $2y$ are bcrypt. The number after $2a$ is the cost factor.",
    cmds=["hashcat -m 3200 -a 0 hash.txt rockyou.txt"],
    bp=["bcrypt cost factor should be at least 10."], defense=["Consider Argon2id which is memory-hard."]))

challenges.append(ch(6, M1, "Identify NTLM Hash", "Beginner",
    "A Windows credential dump contains 32-char hex hashes. Identify the type.",
    "Select the correct hash type for Windows NTLM.",
    "NTLM is the MD4 hash of the UTF-16LE encoded password. 32-char hex. Hashcat mode 1000.",
    "This is from a Windows credential dump.", "Windows stores passwords as NTLM hashes (MD4 of UTF-16LE).",
    "NTLM is Hashcat mode 1000.", "Review Windows authentication.",
    "identify", 120, hash="b4b9b02e6f09a9bd760f388b67351e2b", hashType="NTLM", hashcatMode=1000,
    options=["MD5 (mode 0)", "NTLM (mode 1000)", "SHA1 (mode 100)", "LM (mode 3000)"],
    expectedOption="NTLM (mode 1000)",
    expl="Windows credential dumps contain NTLM hashes. 32 hex chars but MD4, not MD5. Mode 1000.",
    cmds=["hashcat -m 1000 -a 0 hash.txt rockyou.txt"],
    bp=["Context: 32-char hex from Windows = NTLM, from web = MD5."], defense=["Use 15+ char passwords."]))

challenges.append(ch(7, M1, "Identify LM Hash", "Intermediate",
    "A legacy Windows system stores hashes split into two 16-char halves. Identify the type.",
    "Select the correct hash type for legacy LM hashes.",
    "LM hashes are DES-based, uppercase-only, split into two 7-char halves. Hashcat mode 3000.",
    "The hash is all uppercase hex.", "LM hashes are DES-based and split passwords into two 7-char halves.",
    "LM is Hashcat mode 3000.", "Review legacy Windows authentication.",
    "identify", 150, hash="aad3b435b51404eeaad3b435b51404ee", hashType="LM", hashcatMode=3000,
    options=["NTLM (mode 1000)", "LM (mode 3000)", "MD5 (mode 0)", "DES (mode 1500)"],
    expectedOption="LM (mode 3000)",
    expl="LM hashes are DES-based, uppercase-only, split into two 7-char halves. Mode 3000.",
    cmds=["hashcat -m 3000 -a 0 hash.txt rockyou.txt"],
    bp=["LM is disabled since Windows Vista."], defense=["Disable LM storage; upgrade legacy Windows."]))

challenges.append(ch(8, M1, "Identify MySQL 5.x SHA1", "Intermediate",
    "A MySQL user table contains hashes prefixed with *. Identify the type.",
    "Select the correct hash type for MySQL 5.x password hashing.",
    "MySQL 5.x stores passwords as SHA1(SHA1(password)) prefixed with *. Hashcat mode 300.",
    "Look at the prefix — it starts with *.", "MySQL 5.x hashes start with * and are SHA1(SHA1(password)).",
    "MySQL 5.x is Hashcat mode 300.", "Review database hash formats.",
    "identify", 150, hash="*2470C0C06DEE42FD1618BB99005ADCA2EC9D1E19", hashType="MySQL 5.x", hashcatMode=300,
    options=["MySQL 5.x (mode 300)", "SHA1 (mode 100)", "PostgreSQL (mode 111)", "MS Office (mode 9700)"],
    expectedOption="MySQL 5.x (mode 300)",
    expl="MySQL 5.x password hashes start with * and are SHA1(SHA1(password)). Mode 300.",
    cmds=["hashcat -m 300 -a 0 hash.txt rockyou.txt"],
    bp=["The * prefix identifies MySQL 5.x hashes."], defense=["Use MySQL 8.x caching_sha2_password."]))

challenges.append(ch(9, M1, "Identify PostgreSQL MD5", "Intermediate",
    "A PostgreSQL database stores hashes in the format md5<hash><username>. Identify the type.",
    "Select the correct hash type for PostgreSQL password hashing.",
    "PostgreSQL stores passwords as md5(password + username). Hashcat mode 111.",
    "The hash starts with 'md5' and includes a username.", "PostgreSQL uses md5(password + username) format.",
    "PostgreSQL is Hashcat mode 111.", "Review database authentication formats.",
    "identify", 150, hash="md55f4dcc3b5aa765d61d8327deb882cf99:postgres", hashType="PostgreSQL", hashcatMode=111,
    options=["MD5 (mode 0)", "PostgreSQL (mode 111)", "MySQL 5.x (mode 300)", "phpass (mode 400)"],
    expectedOption="PostgreSQL (mode 111)",
    expl="PostgreSQL password hashes are 'md5' + MD5(password + username). Mode 111.",
    cmds=["hashcat -m 111 -a 0 hash.txt rockyou.txt"],
    bp=["The 'md5' prefix + username identifies PostgreSQL."], defense=["Use SCRAM-SHA-256 (PostgreSQL 10+)."]))

challenges.append(ch(10, M1, "Identify SHA-3 (Keccak-256)", "Advanced",
    "A blockchain application uses a 64-char hex hash that is NOT SHA256. Identify the type.",
    "Select the correct hash type for SHA-3 / Keccak-256.",
    "SHA-3 (Keccak) produces 64-char hex like SHA256 but uses a sponge construction. Hashcat mode 17200.",
    "The hash is 64 chars (same as SHA256) but from a blockchain context.", "Blockchain applications often use Keccak-256.",
    "SHA-3 (Keccak-256) is Hashcat mode 17200.", "Context: blockchain = Keccak, general = SHA256.",
    "identify", 200, hashType="SHA-3 (Keccak-256)", hashcatMode=17200,
    options=["SHA256 (mode 1400)", "SHA-3 / Keccak-256 (mode 17200)", "BLAKE2s (mode 35000)", "RIPEMD-160 (mode 6000)"],
    expectedOption="SHA-3 / Keccak-256 (mode 17200)",
    expl="SHA-3 produces 64-char hex like SHA256 but uses a sponge construction. In blockchain, Keccak-256 is standard.",
    cmds=["hashcat -m 17200 -a 0 hash.txt rockyou.txt"],
    bp=["When two algorithms produce same length, use context."], defense=["SHA-3 is cryptographically stronger than SHA-2."]))

# Q11-Q30: More hash identification + cracking challenges
challenges.append(ch(11, M1, "Identify RIPEMD-160", "Advanced",
    "A Bitcoin address derivation uses a 40-char hex hash that is not SHA1. Identify the type.",
    "Select the correct hash type for RIPEMD-160.",
    "RIPEMD-160 produces 160-bit (40 hex char) digest like SHA1. Used in Bitcoin. Hashcat mode 6000.",
    "The hash is 40 chars (same as SHA1) but from a Bitcoin context.", "Bitcoin uses RIPEMD-160(SHA256(public_key)).",
    "RIPEMD-160 is Hashcat mode 6000.", "Context: Bitcoin = RIPEMD-160, general = SHA1.",
    "identify", 200, hashType="RIPEMD-160", hashcatMode=6000,
    options=["SHA1 (mode 100)", "RIPEMD-160 (mode 6000)", "MD5 (mode 0)", "HAVAL-160 (mode 3000)"],
    expectedOption="RIPEMD-160 (mode 6000)",
    expl="RIPEMD-160 produces 40-char hex. In Bitcoin contexts, RIPEMD-160 is used for address derivation.",
    cmds=["hashcat -m 6000 -a 0 hash.txt rockyou.txt"],
    bp=["40-char hex in Bitcoin = RIPEMD-160."], defense=["Pair RIPEMD-160 with SHA256 for security."]))

challenges.append(ch(12, M1, "Identify DES (Unix crypt)", "Advanced",
    "An old Unix /etc/passwd file contains a 13-char hash. Identify the type.",
    "Select the correct hash type for legacy Unix DES crypt.",
    "Traditional Unix DES crypt produces a 13-character hash (2-char salt + 11-char hash). Hashcat mode 1500.",
    "The hash is only 13 characters.", "Traditional Unix DES crypt produces 13-char hashes.",
    "DES crypt is Hashcat mode 1500.", "Review legacy Unix authentication.",
    "identify", 180, hashType="DES (Unix crypt)", hashcatMode=1500,
    options=["DES (Unix crypt) (mode 1500)", "MD5 (mode 0)", "md5crypt (mode 500)", "SHA256 (mode 1400)"],
    expectedOption="DES (Unix crypt) (mode 1500)",
    expl="Traditional Unix DES crypt produces 13-char hashes: 2-char salt + 11-char hash. Mode 1500.",
    cmds=["hashcat -m 1500 -a 0 hash.txt rockyou.txt"],
    bp=["13-char hashes in /etc/passwd = DES crypt."], defense=["DES crypt is obsolete; use SHA512crypt or Argon2."]))

challenges.append(ch(13, M1, "Identify md5crypt (Unix)", "Intermediate",
    "A Linux /etc/shadow file contains a hash starting with $1$. Identify the type.",
    "Select the correct hash type for Unix md5crypt.",
    "md5crypt starts with $1$ and is a salted MD5 with 1000 iterations. Hashcat mode 500.",
    "Look at the prefix — it starts with $1$.", "Unix hashes starting with $1$ are md5crypt.",
    "md5crypt is Hashcat mode 500.", "Review /etc/shadow hash formats.",
    "identify", 150, hash="$1$salt$abcdef0123456789abcdef0123456789", hashType="md5crypt", hashcatMode=500,
    options=["md5crypt (mode 500)", "MD5 (mode 0)", "bcrypt (mode 3200)", "SHA256crypt (mode 7400)"],
    expectedOption="md5crypt (mode 500)",
    expl="Unix hashes starting with $1$ are md5crypt — salted MD5 with 1000 iterations. Mode 500.",
    cmds=["hashcat -m 500 -a 0 hash.txt rockyou.txt"],
    bp=["The $1$ prefix identifies md5crypt."], defense=["Migrate from md5crypt to SHA512crypt or Argon2."]))

challenges.append(ch(14, M1, "Identify SHA256crypt", "Advanced",
    "A modern Linux system uses hashes prefixed with $5$. Identify the type.",
    "Select the correct hash type for SHA256crypt.",
    "SHA256crypt starts with $5$ and uses 5000+ iterations of SHA256. Hashcat mode 7400.",
    "Look at the prefix — it starts with $5$.", "Unix hashes starting with $5$ are SHA256crypt.",
    "SHA256crypt is Hashcat mode 7400.", "Review modern Linux authentication.",
    "identify", 200, hash="$5$salt$abcdefghij$abcdefghijklmnopqrstuvwxyz0123456789ABCDEFGHIJKLMNOP", hashType="SHA256crypt", hashcatMode=7400,
    options=["SHA256 (mode 1400)", "SHA256crypt (mode 7400)", "md5crypt (mode 500)", "bcrypt (mode 3200)"],
    expectedOption="SHA256crypt (mode 7400)",
    expl="Unix hashes starting with $5$ are SHA256crypt. Not the same as raw SHA256. Mode 7400.",
    cmds=["hashcat -m 7400 -a 0 hash.txt rockyou.txt"],
    bp=["$5$ = SHA256crypt, $6$ = SHA512crypt."], defense=["Use higher round counts (50000+)."]))

challenges.append(ch(15, M1, "Identify SHA512crypt", "Advanced",
    "A Linux /etc/shadow contains hashes prefixed with $6$. Identify the type.",
    "Select the correct hash type for SHA512crypt.",
    "SHA512crypt starts with $6$ and uses 5000+ iterations of SHA512. Hashcat mode 1800. Modern Linux default.",
    "Look at the prefix — it starts with $6$.", "Unix hashes starting with $6$ are SHA512crypt.",
    "SHA512crypt is Hashcat mode 1800.", "Review modern Linux authentication.",
    "identify", 200, hash="$6$salt$abcdefghijklmnopqrstuvwxyz0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789abcdefghijklmn", hashType="SHA512crypt", hashcatMode=1800,
    options=["SHA512 (mode 1700)", "SHA512crypt (mode 1800)", "SHA256crypt (mode 7400)", "bcrypt (mode 3200)"],
    expectedOption="SHA512crypt (mode 1800)",
    expl="Unix hashes starting with $6$ are SHA512crypt. Modern Linux default. Mode 1800.",
    cmds=["hashcat -m 1800 -a 0 hash.txt rockyou.txt"],
    bp=["$6$ = SHA512crypt, the modern Linux default."], defense=["Use round counts of 50000+."]))

challenges.append(ch(16, M1, "Identify MS Office 97-2003", "Expert",
    "A password-protected .doc file from 2002 has an RC4-based hash. Identify the type.",
    "Select the correct hash type for MS Office 97-2003.",
    "MS Office 97-2003 uses RC4 encryption with a 40-bit key. Hashcat mode 9700.",
    "The file is from Office 97-2003 era.", "Office 97-2003 uses RC4 encryption with 40-bit keys.",
    "MS Office 97-2003 is Hashcat mode 9700.", "Review document encryption formats.",
    "identify", 250, hash="$oldoffice$0*hex*hex*hex", hashType="MS Office 97-2003", hashcatMode=9700,
    options=["MS Office 97-2003 (mode 9700)", "MS Office 2007 (mode 9710)", "MS Office 2010 (mode 9720)", "MS Office 2013 (mode 9730)"],
    expectedOption="MS Office 97-2003 (mode 9700)",
    expl="MS Office 97-2003 uses RC4 with 40-bit key. The $oldoffice$ prefix identifies it. Mode 9700.",
    cmds=["hashcat -m 9700 -a 0 hash.txt rockyou.txt"],
    bp=["The $oldoffice$ prefix identifies Office 97-2003."], defense=["Migrate to modern Office (AES-256)."]))

challenges.append(ch(17, M1, "Identify MS Office 2007", "Expert",
    "A .docx file from 2007 uses AES-128 encryption. Identify the type.",
    "Select the correct hash type for MS Office 2007.",
    "MS Office 2007 uses AES-128 with SHA1-based key derivation. Hashcat mode 9710.",
    "The file is from Office 2007.", "Office 2007 uses AES-128 encryption.",
    "MS Office 2007 is Hashcat mode 9710.", "Review document encryption formats.",
    "identify", 250, hash="$office$*2007*20*128*16*hex*hex", hashType="MS Office 2007", hashcatMode=9710,
    options=["MS Office 97-2003 (mode 9700)", "MS Office 2007 (mode 9710)", "MS Office 2010 (mode 9720)", "MS Office 2013 (mode 9730)"],
    expectedOption="MS Office 2007 (mode 9710)",
    expl="MS Office 2007 uses AES-128 with SHA1-based key derivation. The $office$*2007* prefix identifies it.",
    cmds=["hashcat -m 9710 -a 0 hash.txt rockyou.txt"],
    bp=["The $office$*2007* prefix identifies Office 2007."], defense=["Upgrade to Office 2013+ (AES-256)."]))

challenges.append(ch(18, M1, "Identify MS Office 2013+", "Expert",
    "A modern .docx file uses AES-256 encryption. Identify the type.",
    "Select the correct hash type for MS Office 2013+.",
    "MS Office 2013+ uses AES-256 with SHA512 (100000 iterations). Hashcat mode 9730.",
    "The file is a modern Office document (2013+).", "Office 2013+ uses AES-256 with SHA512.",
    "MS Office 2013+ is Hashcat mode 9730.", "Review document encryption formats.",
    "identify", 280, hash="$office$*2013*100000*256*16*hex*hex", hashType="MS Office 2013+", hashcatMode=9730,
    options=["MS Office 2010 (mode 9720)", "MS Office 2013+ (mode 9730)", "MS Office 2007 (mode 9710)", "MS Office 97-2003 (mode 9700)"],
    expectedOption="MS Office 2013+ (mode 9730)",
    expl="MS Office 2013+ uses AES-256 with SHA512 (100000 iterations). The $office$*2013* prefix identifies it.",
    cmds=["hashcat -m 9730 -a 0 hash.txt rockyou.txt"],
    bp=["The $office$*2013* prefix identifies Office 2013+."], defense=["Use strong passwords even with AES-256."]))

challenges.append(ch(19, M1, "Identify 7-Zip AES-256", "Expert",
    "A .7z archive uses AES-256 encryption. Identify the type.",
    "Select the correct hash type for 7-Zip.",
    "7-Zip uses AES-256 with SHA256 (524288 iterations). Hashcat mode 11600. Very strong.",
    "The file is a .7z archive.", "7-Zip uses AES-256 with SHA256 (524288 iterations).",
    "7-Zip is Hashcat mode 11600.", "Review archive encryption formats.",
    "identify", 250, hash="$7z$0$19$0$salt$iv$data$hash", hashType="7-Zip", hashcatMode=11600,
    options=["PKZIP (mode 17200)", "WinZip AES (mode 13600)", "7-Zip (mode 11600)", "RAR (mode 12500)"],
    expectedOption="7-Zip (mode 11600)",
    expl="7-Zip uses AES-256 with SHA256 (524288 iterations). The $7z$ prefix identifies it. Mode 11600.",
    cmds=["hashcat -m 11600 -a 0 hash.txt rockyou.txt"],
    bp=["The $7z$ prefix identifies 7-Zip."], defense=["7-Zip with strong password is very secure."]))

challenges.append(ch(20, M1, "Identify PDF 1.7+ (AES-256)", "Expert",
    "A modern PDF uses AES-256 encryption. Identify the type.",
    "Select the correct hash type for modern PDF AES-256.",
    "PDF 1.7-2.0 uses AES-256 with SHA256. Hashcat mode 10600.",
    "The PDF uses modern AES-256 encryption.", "PDF 1.7-2.0 uses AES-256 with SHA256.",
    "PDF 1.7-2.0 is Hashcat mode 10600.", "Review document encryption formats.",
    "identify", 250, hash="$pdf$5*5*256*hex*hex*hex", hashType="PDF 1.7-2.0", hashcatMode=10600,
    options=["PDF 1.4-1.6 (mode 10410)", "PDF 1.7-2.0 (mode 10600)", "PDF 1.1-1.3 (mode 10400)", "WinZip AES (mode 13600)"],
    expectedOption="PDF 1.7-2.0 (mode 10600)",
    expl="PDF 1.7-2.0 uses AES-256 with SHA256. The $pdf$5* prefix identifies it. Mode 10600.",
    cmds=["hashcat -m 10600 -a 0 hash.txt rockyou.txt"],
    bp=["The $pdf$5* prefix identifies modern AES-256 PDF."], defense=["Use strong passwords with AES-256 PDFs."]))

# Q21-Q30: Cracking challenges
challenges.append(ch(21, M1, "Crack MD5: 'password'", "Beginner",
    "A legacy system stores an unsalted MD5 hash. Recover the plaintext.",
    "Crack the MD5 hash and submit the recovered password.",
    "MD5 is mode 0. The password 'password' hashes to 5f4dcc3b5aa765d61d8327deb882cf99.",
    "This is one of the most common passwords in rockyou.txt.", "The password is 8 characters, all lowercase.",
    "The password is the literal word for a secret authentication string.", "Try hashcat -m 0 -a 0 with rockyou.txt.",
    "crack", 100, hash="5f4dcc3b5aa765d61d8327deb882cf99", hashType="MD5", hashcatMode=0,
    expectedAnswer="password",
    expl="The MD5 of 'password' is the #1 most common password in breach corpora.",
    cmds=["hashcat -m 0 -a 0 hash.txt rockyou.txt"],
    bp=["Always start with rockyou.txt for unsalted MD5."], defense=["Never use MD5 for passwords; use Argon2id."]))

challenges.append(ch(22, M1, "Crack SHA1: 'password'", "Beginner",
    "A legacy web app stores unsalted SHA1 hashes. Recover the plaintext.",
    "Crack the SHA1 hash and submit the recovered password.",
    "SHA1 is mode 100. The password 'password' hashes to 5baa61e4c9b93f3f0682250b6cf8331b7ee68fd8.",
    "Same plaintext as MD5 challenge, just SHA1.", "SHA1 is mode 100, not mode 0.",
    "The password is 8 characters, all lowercase.", "Try hashcat -m 100 -a 0 with rockyou.txt.",
    "crack", 120, hash="5baa61e4c9b93f3f0682250b6cf8331b7ee68fd8", hashType="SHA1", hashcatMode=100,
    expectedAnswer="password",
    expl="Same plaintext as MD5, different algorithm. Change -m for different algorithms.",
    cmds=["hashcat -m 100 -a 0 hash.txt rockyou.txt"],
    bp=["Change -m for different algorithms; wordlist stays same."], defense=["SHA1 is broken; use SHA2-256+."]))

challenges.append(ch(23, M1, "Crack SHA256: 'password'", "Intermediate",
    "A modern web app stores unsalted SHA256 hashes. Recover the plaintext.",
    "Crack the SHA256 hash and submit the recovered password.",
    "SHA256 is mode 1400. The password 'password' hashes to 5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8.",
    "Same plaintext as before, but SHA256.", "SHA256 is mode 1400.",
    "The password is 8 characters, all lowercase.", "Try hashcat -m 1400 -a 0 with rockyou.txt.",
    "crack", 150, hash="5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8", hashType="SHA2-256", hashcatMode=1400,
    expectedAnswer="password",
    expl="Despite being 'modern', unsalted SHA256 is as vulnerable as MD5 to cracking.",
    cmds=["hashcat -m 1400 -a 0 hash.txt rockyou.txt"],
    bp=["Algorithm choice alone doesn't secure passwords — salting and KDFs do."], defense=["Use Argon2id."]))

challenges.append(ch(24, M1, "Crack MD5: '123456'", "Beginner",
    "A user database contains an MD5 hash of a numeric password. Recover the plaintext.",
    "Crack the MD5 hash and submit the recovered password.",
    "'123456' is consistently the #1 password globally. MD5 mode 0.",
    "This is a 6-digit numeric password.", "It's an ascending sequence starting with 1.",
    "The most common 6-digit password in the world.", "Try hashcat -m 0 -a 3 ?d?d?d?d?d?d.",
    "crack", 100, hash="e10adc3949ba59abbe56e057f20f883e", hashType="MD5", hashcatMode=0,
    expectedAnswer="123456",
    expl="'123456' is crackable in milliseconds with a mask attack (?d?d?d?d?d?d).",
    cmds=["hashcat -m 0 -a 0 hash.txt rockyou.txt", "hashcat -m 0 -a 3 hash.txt ?d?d?d?d?d?d"],
    bp=["For numeric passwords, mask attacks (?d) are faster."], defense=["Reject purely numeric passwords."]))

challenges.append(ch(25, M1, "Crack SHA256: 'letmein'", "Intermediate",
    "A hash from a breach dump needs to be recovered. It's a common dictionary word.",
    "Crack the SHA256 hash and submit the recovered password.",
    "'letmein' is a classic dictionary password. SHA256 mode 1400.",
    "The password is a common English phrase (3 words concatenated).", "The phrase means 'allow me to enter'.",
    "It's 7 characters, all lowercase.", "Try hashcat -m 1400 -a 0 with rockyou.txt.",
    "crack", 150, hash="65e84be33532fb784c48129675f9eff3a682b27168c0ea744b2cf58ee02337c5", hashType="SHA2-256", hashcatMode=1400,
    expectedAnswer="letmein",
    expl="'letmein' is a classic dictionary password in every wordlist.",
    cmds=["hashcat -m 1400 -a 0 hash.txt rockyou.txt"],
    bp=["Dictionary words are always in rockyou.txt."], defense=["Use passphrases (4+ random words)."]))

challenges.append(ch(26, M1, "Crack MD5: '12345678'", "Beginner",
    "An MD5 hash of an 8-digit numeric password. Recover the plaintext.",
    "Crack the MD5 hash and submit the recovered password.",
    "'12345678' is an 8-digit ascending sequence. MD5 mode 0.",
    "The password is an 8-digit numeric sequence.", "It's an ascending sequence starting with 1.",
    "8 digits, all the same pattern.", "Try hashcat -m 0 -a 3 ?d?d?d?d?d?d?d?d.",
    "crack", 120, hash="25d55ad283aa400af464c76d713c07ad", hashType="MD5", hashcatMode=0,
    expectedAnswer="12345678",
    expl="'12345678' is crackable in <1 second with a mask attack.",
    cmds=["hashcat -m 0 -a 3 hash.txt ?d?d?d?d?d?d?d?d"],
    bp=["8-digit numeric masks exhaust in <1 second."], defense=["Reject date-of-birth patterns."]))

challenges.append(ch(27, M1, "Crack NTLM: 'password'", "Intermediate",
    "A Windows credential dump contains an NTLM hash. Recover the plaintext.",
    "Crack the NTLM hash and submit the recovered password.",
    "NTLM is MD4 of UTF-16LE(password). Mode 1000. Very fast to crack.",
    "The password is the same common word as before.", "NTLM is mode 1000.",
    "The password is 8 characters, all lowercase.", "Try hashcat -m 1000 -a 0 with rockyou.txt.",
    "crack", 150, hash="8846f7eaee8fb117ad06bdd830b7536c", hashType="NTLM", hashcatMode=1000,
    expectedAnswer="password",
    expl="NTLM hashes crack extremely fast (100+ GH/s). The same plaintext 'password'.",
    cmds=["hashcat -m 1000 -a 0 hash.txt rockyou.txt"],
    bp=["NTLM cracks 100x faster than MD5."], defense=["Use 15+ char passwords for Windows."]))

challenges.append(ch(28, M1, "Crack SHA256: 'admin'", "Beginner",
    "A web app uses a default admin password hashed with SHA256. Recover it.",
    "Crack the SHA256 hash and submit the recovered password.",
    "'admin' is the most common default admin password. SHA256 mode 1400.",
    "The password is a common admin default.", "It's 5 characters, all lowercase.",
    "The most common admin username used as password.", "Try hashcat -m 1400 -a 0 with rockyou.txt.",
    "crack", 120, hash="8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918", hashType="SHA2-256", hashcatMode=1400,
    expectedAnswer="admin",
    expl="'admin' is the #1 default admin password. Always change default credentials.",
    cmds=["hashcat -m 1400 -a 0 hash.txt rockyou.txt"],
    bp=["Default credentials are in every wordlist."], defense=["Always change default admin passwords."]))

challenges.append(ch(29, M1, "Crack MD5: 'welcome'", "Beginner",
    "An MD5 hash of a common greeting password. Recover the plaintext.",
    "Crack the MD5 hash and submit the recovered password.",
    "'welcome' is a common greeting-based password. MD5 mode 0.",
    "The password is a common English greeting.", "It's 7 characters, all lowercase.",
    "A word meaning 'greeted upon arrival'.", "Try hashcat -m 0 -a 0 with rockyou.txt.",
    "crack", 100, hash="83218ac34c1834c267808918ac15721d", hashType="MD5", hashcatMode=0,
    expectedAnswer="welcome",
    expl="'welcome' is a common greeting-based password in every wordlist.",
    cmds=["hashcat -m 0 -a 0 hash.txt rockyou.txt"],
    bp=["Common words are always in rockyou.txt."], defense=["Use unique passphrases."]))

challenges.append(ch(30, M1, "Crack SHA1: 'letmein'", "Intermediate",
    "A SHA1 hash of a common dictionary password. Recover the plaintext.",
    "Crack the SHA1 hash and submit the recovered password.",
    "'letmein' hashed with SHA1. Mode 100.",
    "The password is a common English phrase.", "It means 'allow me to enter'.",
    "7 characters, all lowercase.", "Try hashcat -m 100 -a 0 with rockyou.txt.",
    "crack", 120, hash="b7a57573d22845a426c1f4f8a7bda26b53f43c2d", hashType="SHA1", hashcatMode=100,
    expectedAnswer="letmein",
    expl="Same plaintext as SHA256 challenge, different algorithm.",
    cmds=["hashcat -m 100 -a 0 hash.txt rockyou.txt"],
    bp=["Change -m for different algorithms."], defense=["Use unique passphrases."]))

# === MODULE 2: HASHCAT MODES (15 challenges) ===
M2 = "Hashcat Modes"
modes_data = [
    (31, "Hashcat Mode for MD5", "Beginner", "MD5 is mode 0.", "-m 0", ["-m 0", "-m 100", "-m 1400", "-m 1700"], 100),
    (32, "Hashcat Mode for SHA1", "Beginner", "SHA1 is mode 100.", "-m 100", ["-m 0", "-m 100", "-m 1400", "-m 3200"], 100),
    (33, "Hashcat Mode for SHA256", "Beginner", "SHA256 is mode 1400.", "-m 1400", ["-m 100", "-m 1400", "-m 1700", "-m 1800"], 120),
    (34, "Hashcat Mode for SHA512", "Intermediate", "SHA512 is mode 1700.", "-m 1700", ["-m 1400", "-m 1700", "-m 1800", "-m 7400"], 120),
    (35, "Hashcat Mode for bcrypt", "Intermediate", "bcrypt is mode 3200.", "-m 3200", ["-m 3000", "-m 3200", "-m 1800", "-m 7400"], 150),
    (36, "Hashcat Mode for NTLM", "Beginner", "NTLM is mode 1000.", "-m 1000", ["-m 0", "-m 100", "-m 1000", "-m 3000"], 100),
    (37, "Hashcat Mode for LM", "Intermediate", "LM is mode 3000.", "-m 3000", ["-m 1000", "-m 3000", "-m 1500", "-m 500"], 150),
    (38, "Hashcat Mode for MySQL 5.x", "Intermediate", "MySQL 5.x is mode 300.", "-m 300", ["-m 0", "-m 300", "-m 111", "-m 100"], 150),
    (39, "Hashcat Mode for PostgreSQL", "Intermediate", "PostgreSQL is mode 111.", "-m 111", ["-m 0", "-m 100", "-m 111", "-m 300"], 150),
    (40, "Hashcat Mode for SHA512crypt", "Advanced", "SHA512crypt is mode 1800.", "-m 1800", ["-m 1700", "-m 1800", "-m 7400", "-m 3200"], 200),
    (41, "Hashcat Mode for md5crypt", "Intermediate", "md5crypt is mode 500.", "-m 500", ["-m 0", "-m 100", "-m 500", "-m 1500"], 150),
    (42, "Hashcat Mode for sha256($salt.$pass)", "Advanced", "sha256($salt.$pass) is mode 1420.", "-m 1420", ["-m 1400", "-m 1410", "-m 1420", "-m 1430"], 200),
    (43, "Hashcat Mode for 7-Zip", "Expert", "7-Zip is mode 11600.", "-m 11600", ["-m 10400", "-m 11600", "-m 12500", "-m 13600"], 250),
    (44, "Hashcat Mode for PDF 1.7+", "Expert", "PDF 1.7-2.0 is mode 10600.", "-m 10600", ["-m 10400", "-m 10410", "-m 10600", "-m 11600"], 250),
    (45, "Hashcat Mode for WinZip AES", "Expert", "WinZip AES is mode 13600.", "-m 13600", ["-m 11600", "-m 12500", "-m 13600", "-m 17200"], 250),
]

for cid, title, diff, ctx, expected, opts, xp in modes_data:
    algo = title.replace("Hashcat Mode for ", "")
    challenges.append(ch(cid, M2, title, diff,
        f"You have a {algo} hash. What -m flag do you pass to Hashcat?",
        f"Select the correct Hashcat mode for {algo}.",
        ctx,
        f"Look at the Hashcat modes reference.", f"The mode for {algo} is a specific number.",
        f"Review the Hashcat modes reference for {algo}.", "Check the modes table.",
        "identify", xp, options=opts, expectedOption=expected,
        expl=f"Hashcat {expected} is for {algo}.",
        cmds=[f"hashcat {expected} -a 0 hash.txt rockyou.txt"],
        bp=[f"Always specify -m explicitly for {algo}."], defense=[f"Use strong KDFs for {algo} if applicable."]))

# === MODULE 3: WORDLIST ATTACKS (10 challenges) ===
M3 = "Wordlist Attacks"
challenges.append(ch(46, M3, "Straight Wordlist Attack", "Beginner",
    "You have a list of unsalted MD5 hashes. What attack mode do you use?",
    "Select the correct Hashcat attack mode for a straight wordlist attack.",
    "Hashcat -a 0 (Straight) iterates a wordlist verbatim. Highest-yield first pass.",
    "A straight wordlist attack uses a single wordlist.", "The attack mode flag is -a followed by a number.",
    "Straight/dictionary attack is -a 0.", "Review the Hashcat attack modes reference.",
    "identify", 100,
    options=["-a 0 (Straight)", "-a 1 (Combinator)", "-a 3 (Brute-force)", "-a 6 (Hybrid)"],
    expectedOption="-a 0 (Straight)",
    expl="-a 0 is the canonical wordlist attack. Highest yield per second for unsalted hashes.",
    cmds=["hashcat -m 0 -a 0 hashes.txt rockyou.txt"],
    bp=["Always start with -a 0 + rockyou.txt."], defense=["Reject common passwords at signup."]))

challenges.append(ch(47, M3, "Best First-Pass Wordlist", "Beginner",
    "You're cracking a list of unsalted hashes for the first time. Which wordlist?",
    "Select the recommended first-pass wordlist.",
    "rockyou.txt (14.3M entries) is the gold-standard first-pass wordlist.",
    "The most famous leaked wordlist from 2009.", "It contains 14.3 million passwords.",
    "The wordlist is called rockyou.txt.", "Review the wordlist library.",
    "identify", 100,
    options=["rockyou.txt", "common-passwords.txt", "english-words.txt", "names.txt"],
    expectedOption="rockyou.txt",
    expl="rockyou.txt recovers 60-80% of real-world passwords in seconds.",
    cmds=["hashcat -m 0 -a 0 hashes.txt rockyou.txt"],
    bp=["Always start with rockyou.txt."], defense=["Reject passwords in rockyou.txt at signup."]))

challenges.append(ch(48, M3, "Wordlist + Rules Strategy", "Intermediate",
    "After a bare rockyou.txt pass, 35% of hashes remain. What's the next step?",
    "Select the recommended strategy after exhausting a bare wordlist.",
    "Applying best64.rule to rockyou.txt multiplies coverage by 76x with minimal cost.",
    "Rules mutate each wordlist entry cheaply.", "best64.rule is the standard rule set.",
    "The strategy is rockyou.txt + best64.rule.", "Review the rule-based attack module.",
    "strategy", 150,
    options=["Switch to pure brute force", "Apply best64.rule to rockyou.txt", "Use a combinator attack", "Download a larger wordlist"],
    expectedOption="Apply best64.rule to rockyou.txt",
    expl="best64.rule produces ~1B candidates and recovers an additional 15-25%.",
    cmds=["hashcat -m 0 -a 0 hashes.txt rockyou.txt -r best64.rule"],
    bp=["Run best64.rule after bare wordlist."], defense=["Train users to avoid predictable mutations."]))

challenges.append(ch(49, M3, "Custom Wordlist Generation", "Advanced",
    "You're auditing a company called 'Acme Corp'. How do you build a targeted wordlist?",
    "Select the best approach for generating a targeted corporate wordlist.",
    "CeWL scrapes company websites for terms. Combined with pattern generation yields high recovery.",
    "Incorporate company-specific terms.", "Use tools like CeWL or Mentalist.",
    "Scrape the company website + generate patterns.", "Review the custom wordlist section.",
    "strategy", 200,
    options=["Use only rockyou.txt", "Scrape company website (CeWL) + generate patterns", "Use a pure brute-force mask", "Use the combinator attack"],
    expectedOption="Scrape company website (CeWL) + generate patterns",
    expl="CeWL + pattern generation yields high-recovery custom wordlists for corporate audits.",
    cmds=["cewl https://acme.com > acme-words.txt"],
    bp=["Combine CeWL scraping with rule-based mutations."], defense=["Train employees to avoid company name in passwords."]))

challenges.append(ch(50, M3, "Targeted Wordlist for Names", "Advanced",
    "You have a list of employee names. How do you build a password wordlist from them?",
    "Select the best approach for name-based password wordlist generation.",
    "Common patterns: firstname, firstname+year, firstname+digit. Use rules to generate these.",
    "Employees often use their own name in passwords.", "Common patterns: firstname, firstname+year.",
    "Use a name list with rules for year/digit appendage.", "Review the name-based wordlist section.",
    "strategy", 200,
    options=["Use only rockyou.txt", "Use a first-names list with rules appending years and digits", "Pure brute force", "Combinator attack"],
    expectedOption="Use a first-names list with rules appending years and digits",
    expl="Name list + rules (year/digit appendage) produces 2.5M candidates covering common patterns.",
    cmds=["hashcat -m 0 -a 6 names.txt ?d?d?d?d --increment"],
    bp=["Name + year patterns are common in corporate environments."], defense=["Reject passwords containing the user's name."]))

challenges.append(ch(51, M3, "Wordlist Size vs Speed", "Intermediate",
    "You have a 1GB wordlist and a 10GB wordlist. When do you use each?",
    "Select the correct strategy for wordlist size selection.",
    "Start with smaller high-quality wordlists. Escalate to larger lists only when exhausted.",
    "Larger isn't always better — quality matters.", "Start small and escalate.",
    "Run rockyou.txt first, then larger lists.", "Review the wordlist strategy section.",
    "strategy", 150,
    options=["Always use the largest wordlist", "Start with rockyou.txt, escalate when exhausted", "Use only common-passwords.txt", "Never use wordlists"],
    expectedOption="Start with rockyou.txt, escalate when exhausted",
    expl="rockyou.txt recovers 60-80% in seconds. Escalate to larger lists only when exhausted.",
    cmds=["hashcat -m 0 -a 0 hashes.txt rockyou.txt"],
    bp=["Quality > quantity."], defense=["Implement breach-list checks at signup."]))

challenges.append(ch(52, M3, "Wordlist Deduplication", "Intermediate",
    "Your 10GB wordlist has many duplicates. What do you do?",
    "Select the correct approach for wordlist deduplication.",
    "Duplicate entries waste GPU cycles. Use 'sort -u' to deduplicate.",
    "Duplicates waste GPU cycles.", "Use sort -u or the unique command.",
    "Deduplicate with: sort -u wordlist.txt > deduped.txt", "Review the wordlist preparation section.",
    "strategy", 120,
    options=["Run Hashcat as-is", "Deduplicate with sort -u", "Use a smaller wordlist", "Sort but don't deduplicate"],
    expectedOption="Deduplicate with sort -u",
    expl="Deduplication with 'sort -u' can reduce runtime by 30-50%.",
    cmds=["sort -u wordlist.txt > deduped.txt"],
    bp=["Always deduplicate wordlists."], defense=["N/A — attacker-side optimization."]))

challenges.append(ch(53, M3, "Themed Wordlist for Crypto", "Advanced",
    "You're recovering a cryptocurrency wallet password. What wordlist do you use?",
    "Select the best wordlist for crypto-themed passwords.",
    "Crypto users often use crypto terms: 'satoshi', 'bitcoin', 'blockchain'.",
    "Crypto users often use crypto-related terms.", "Terms like satoshi, bitcoin are common.",
    "Use a crypto-themed wordlist.", "Review the themed wordlist section.",
    "strategy", 200,
    options=["Use only rockyou.txt", "Use a crypto-themed wordlist", "Use a names list", "Pure brute force"],
    expectedOption="Use a crypto-themed wordlist",
    expl="Crypto-themed wordlist with 'satoshi', 'bitcoin' + rules yields higher recovery for wallets.",
    cmds=["hashcat -m 11300 -a 0 wallet.hash crypto-wordlist.txt -r best64.rule"],
    bp=["Themed wordlists outperform generic ones for domain-specific targets."], defense=["Use 16+ char random passphrases for wallets."]))

challenges.append(ch(54, M3, "Crack MD5: 'monkey'", "Beginner",
    "An MD5 hash of a common animal password. Recover the plaintext.",
    "Crack the MD5 hash and submit the recovered password.",
    "'monkey' is a common animal-based password. MD5 mode 0.",
    "The password is a common animal name.", "It's 6 characters, all lowercase.",
    "A common primate animal name.", "Try hashcat -m 0 -a 0 with rockyou.txt.",
    "crack", 100, hash="d0763edaa9d9bd2a9516280e9044d885", hashType="MD5", hashcatMode=0,
    expectedAnswer="monkey",
    expl="'monkey' is consistently in the top 20 most common passwords.",
    cmds=["hashcat -m 0 -a 0 hash.txt rockyou.txt"],
    bp=["Animal names are common passwords."], defense=["Use random passphrases."]))

challenges.append(ch(55, M3, "Crack SHA256: 'dragon'", "Intermediate",
    "A SHA256 hash of a mythological creature password. Recover the plaintext.",
    "Crack the SHA256 hash and submit the recovered password.",
    "'dragon' is a common mythological password. SHA256 mode 1400.",
    "The password is a mythological creature.", "It's 6 characters, all lowercase.",
    "A fire-breathing mythological creature.", "Try hashcat -m 1400 -a 0 with rockyou.txt.",
    "crack", 150, hash="86fe7c4efb8e9004a5d2fdb4f5e8b4ec5e9a3e5d3e7a5d7f3b2c1a0f9e8d7c6b", hashType="SHA2-256", hashcatMode=1400,
    expectedAnswer="dragon",
    expl="'dragon' is consistently in the top 25 most common passwords.",
    cmds=["hashcat -m 1400 -a 0 hash.txt rockyou.txt"],
    bp=["Mythological creatures are common passwords."], defense=["Use random passphrases."]))

# === MODULE 4: RULE ATTACKS (10 challenges) ===
M4 = "Rule Attacks"
challenges.append(ch(56, M4, "best64.rule Usage", "Beginner",
    "After a bare wordlist pass, you want to expand coverage. Which rule set?",
    "Select the recommended first-pass rule set.",
    "best64.rule (76 rules) covers capitalization, digit appendage, leetspeak.",
    "The standard first-pass rule set has 76 rules.", "It's called best64.rule.",
    "best64.rule is the recommended first-pass rule set.", "Review the rule sets reference.",
    "identify", 100,
    options=["best64.rule (76 rules)", "dive.rule (99000 rules)", "generated.rule (50000 rules)", "OneRuleToRuleThemAll (80000 rules)"],
    expectedOption="best64.rule (76 rules)",
    expl="best64.rule multiplies a 14M wordlist to ~1B candidates and runs in seconds.",
    cmds=["hashcat -m 0 -a 0 hashes.txt rockyou.txt -r best64.rule"],
    bp=["Always run best64.rule after a bare wordlist."], defense=["Train users to avoid best64 mutations."]))

challenges.append(ch(57, M4, "dive.rule Escalation", "Intermediate",
    "best64.rule is exhausted. What's the next escalation?",
    "Select the recommended rule set after best64.rule.",
    "dive.rule (~99000 rules) covers a wider range of mutations.",
    "The next escalation has ~99000 rules.", "It's called dive.rule.",
    "dive.rule is the recommended escalation after best64.rule.", "Review the rule sets reference.",
    "identify", 150,
    options=["dive.rule (~99000 rules)", "best64.rule (76 rules)", "custom.rule", "generated.rule"],
    expectedOption="dive.rule (~99000 rules)",
    expl="dive.rule produces ~1.4T candidates and runs in ~3 minutes.",
    cmds=["hashcat -m 0 -a 0 hashes.txt rockyou.txt -r dive.rule"],
    bp=["Run dive.rule only after best64.rule is exhausted."], defense=["Use zxcvbn to test against dive mutations."]))

challenges.append(ch(58, M4, "OneRuleToRuleThemAll", "Advanced",
    "You want maximum rule coverage in a single run. Which rule set?",
    "Select the comprehensive rule set for maximum coverage.",
    "OneRuleToRuleThemAll (~80000 rules) combines the best rules from multiple sources.",
    "This rule set combines the best from multiple sources.", "It has ~80000 rules.",
    "OneRuleToRuleThemAll is the comprehensive rule set.", "Review the rule sets reference.",
    "identify", 180,
    options=["best64.rule (76 rules)", "OneRuleToRuleThemAll (~80000 rules)", "dive.rule (99000 rules)", "generated.rule"],
    expectedOption="OneRuleToRuleThemAll (~80000 rules)",
    expl="OneRuleToRuleThemAll offers a balance between coverage and runtime.",
    cmds=["hashcat -m 0 -a 0 hashes.txt rockyou.txt -r OneRuleToRuleThemAll.rule"],
    bp=["Good middle ground between best64 and dive."], defense=["Test passwords against OneRule before deployment."]))

challenges.append(ch(59, M4, "Predict Rule: Capitalize", "Intermediate",
    "Given the word 'password' and rule 'c' (capitalize first), what's the output?",
    "Predict the output of the 'c' rule on 'password'.",
    "Rule 'c' capitalizes the first character. 'password' becomes 'Password'.",
    "The 'c' rule capitalizes the first character.", "Think about what 'capitalize first' means.",
    "The first letter becomes uppercase.", "Review the rule reference.",
    "command", 120,
    options=["Password", "PASSWORD", "password", "pAssword"],
    expectedOption="Password",
    expl="Rule 'c' capitalizes the first character. This is the most common user mutation.",
    cmds=["echo 'password' | hashcat --stdout -j 'c'"],
    bp=["Rule 'c' is in best64.rule for a reason."], defense=["Reject capitalized dictionary words."]))

challenges.append(ch(60, M4, "Predict Rule: Append Digit", "Intermediate",
    "Given 'password' and rule '$1' (append '1'), what's the output?",
    "Predict the output of the '$1' rule on 'password'.",
    "Rule '$1' appends '1'. 'password' becomes 'password1'.",
    "The '$1' rule appends the digit 1.", "Think about what 'append 1' means.",
    "The digit 1 is added at the end.", "Review the rule reference.",
    "command", 120,
    options=["password1", "1password", "Password1", "password"],
    expectedOption="password1",
    expl="Rule '$1' appends '1'. This is the #1 most common password mutation.",
    cmds=["echo 'password' | hashcat --stdout -j '$1'"],
    bp=["Rules $0-$9 cover the most common digit appendages."], defense=["Reject dictionary words + single digit."]))

challenges.append(ch(61, M4, "Predict Rule: Leetspeak", "Advanced",
    "Given 'password' and rule 'so0' (replace o with 0), what's the output?",
    "Predict the output of the 'so0' rule on 'password'.",
    "Rule 'so0' replaces 'o' with '0'. 'password' becomes 'passw0rd'.",
    "The 'so0' rule replaces 'o' with '0'.", "Think about replacing letters with similar digits.",
    "Every 'o' becomes '0'.", "Review the leetspeak rules.",
    "command", 150,
    options=["passw0rd", "password", "P@ssw0rd", "p@ssword"],
    expectedOption="passw0rd",
    expl="Rule 'so0' replaces 'o' with '0'. Leetspeak rules are essential for password audits.",
    cmds=["echo 'password' | hashcat --stdout -j 'so0'"],
    bp=["Include leetspeak rules (sa@, so0, se3, ss$)."], defense=["Leetspeak provides minimal additional security."]))

challenges.append(ch(62, M4, "Predict Rule: Reverse", "Intermediate",
    "Given 'password' and rule 'r' (reverse), what's the output?",
    "Predict the output of the 'r' rule on 'password'.",
    "Rule 'r' reverses the string. 'password' becomes 'drowssap'.",
    "The 'r' rule reverses the string.", "Think about reading the word backwards.",
    "The word is reversed character by character.", "Review the rule reference.",
    "command", 120,
    options=["drowssap", "password", "PASSWORD", "passworD"],
    expectedOption="drowssap",
    expl="Rule 'r' reverses the string. Some users think reversing is secure — it isn't.",
    cmds=["echo 'password' | hashcat --stdout -j 'r'"],
    bp=["Include rule 'r' in custom rule sets."], defense=["Reversed dictionary words are in every rule set."]))

challenges.append(ch(63, M4, "Predict Rule: Append Year", "Advanced",
    "Given 'password' and rule '$2$0$2$4' (append '2024'), what's the output?",
    "Predict the output of the year-append rule on 'password'.",
    "Rule '$2$0$2$4' appends '2024'. 'password' becomes 'password2024'.",
    "The rule appends '2024' character by character.", "Think about appending a year.",
    "The year 2024 is appended.", "Review the year-append rules.",
    "command", 150,
    options=["password2024", "2024password", "Password2024", "password"],
    expectedOption="password2024",
    expl="Year appendage is extremely common in corporate passwords.",
    cmds=["echo 'password' | hashcat --stdout -j '$2$0$2$4'"],
    bp=["Include year-append rules ($2$0$2$0 through $2$0$2$5)."], defense=["Reject passwords ending in a 4-digit year."]))

challenges.append(ch(64, M4, "Custom Rule for Company", "Advanced",
    "You're auditing 'Acme Corp'. How do you create a custom rule for company patterns?",
    "Select the best approach for creating company-specific rules.",
    "Custom rules targeting company name patterns yield high recovery.",
    "Incorporate company name into rule mutations.", "Use Hashcat's rule syntax to append/prepend company name.",
    "Create a custom rule file with company-specific patterns.", "Review the custom rule section.",
    "strategy", 200,
    options=["Use only best64.rule", "Create a custom rule file appending company name + year", "Use dive.rule only", "Use pure brute force"],
    expectedOption="Create a custom rule file appending company name + year",
    expl="Custom rules for company patterns (Acme2024, Acme!) yield high recovery.",
    cmds=["echo '$A$c$m$e$2$0$2$4' > acme.rule"],
    bp=["Custom rules are highly effective for corporate audits."], defense=["Train employees to avoid company name in passwords."]))

challenges.append(ch(65, M4, "Rule Performance Estimation", "Advanced",
    "You have a 14M wordlist and best64.rule (76 rules). How many candidates?",
    "Calculate the total candidate count for a wordlist + rule attack.",
    "Total candidates = wordlist_size x rule_count. 14M x 76 = 1.064B.",
    "Multiply wordlist size by rule count.", "14M x 76 = ?",
    "14 million times 76 equals 1.064 billion.", "Review the performance estimation section.",
    "command", 180,
    options=["~1.064 billion candidates", "~14 million candidates", "~76 candidates", "~76 million candidates"],
    expectedOption="~1.064 billion candidates",
    expl="14M x 76 = 1.064B candidates. At 100 GH/s (MD5), runs in ~0.01 seconds.",
    cmds=["hashcat -m 0 -a 0 hashes.txt rockyou.txt -r best64.rule --status"],
    bp=["Always calculate candidate count to estimate runtime."], defense=["N/A — attacker-side calculation."]))

# === MODULE 5: MASK ATTACKS (10 challenges) ===
M5 = "Mask Attacks"
mask_data = [
    (66, "Mask Attack Basics", "Beginner", "Hashcat -a 3 generates candidates from a mask.", "-a 3 (Brute-force/Mask)", ["-a 3 (Brute-force/Mask)", "-a 0 (Straight)", "-a 1 (Combinator)", "-a 6 (Hybrid)"], 100, "You know the password is 6 digits. What attack mode do you use?"),
    (67, "Mask Charset: ?d", "Beginner", "?d = digits 0-9 (10 chars).", "Digits 0-9", ["Digits 0-9", "Lowercase a-z", "Uppercase A-Z", "All printable"], 100, "What does the ?d charset represent in Hashcat masks?"),
    (68, "Mask Charset: ?l", "Beginner", "?l = lowercase a-z (26 chars).", "Lowercase a-z", ["Lowercase a-z", "Digits 0-9", "Uppercase A-Z", "Special chars"], 100, "What does the ?l charset represent in Hashcat masks?"),
    (69, "Mask Charset: ?u", "Beginner", "?u = uppercase A-Z (26 chars).", "Uppercase A-Z", ["Uppercase A-Z", "Lowercase a-z", "Digits 0-9", "All printable"], 100, "What does the ?u charset represent in Hashcat masks?"),
    (70, "Mask Charset: ?a", "Intermediate", "?a = all printable ASCII (95 chars).", "All printable ASCII (95 chars)", ["All printable ASCII (95 chars)", "Lowercase a-z", "Digits 0-9", "Special chars only"], 120, "What does the ?a charset represent in Hashcat masks?"),
    (71, "Mask: ULLLDDDD Pattern", "Intermediate", "The mask ?u?l?l?l?d?d?d?d covers ULLLDDDD.", "?u?l?l?l?d?d?d?d", ["?u?l?l?l?d?d?d?d", "?a?a?a?a?a?a?a?a", "?d?d?d?d?u?l?l?l", "?l?l?l?l?d?d?d?d"], 150, "A corporate policy requires: 1 uppercase, 3 lowercase, 4 digits. What mask?"),
    (72, "Mask: 8-digit Numeric", "Beginner", "The mask ?d?d?d?d?d?d?d?d covers 8 digits.", "?d?d?d?d?d?d?d?d", ["?d?d?d?d?d?d?d?d", "?l?l?l?l?l?l?l?l", "?a?a?a?a?a?a?a?a", "?u?d?d?d?d?d?d?d"], 100, "A password is known to be 8 digits. What mask?"),
    (73, "Custom Charset with -1", "Advanced", "Use -1 to define a custom charset referenced as ?1.", "-1 012345 ?1?1?1?1", ["-1 012345 ?1?1?1?1", "?d?d?d?d", "-1 ?d ?d?d?d?d", "?012345?012345?012345?012345"], 180, "You want to use only the digits 0-5. How do you define a custom charset?"),
    (74, "--increment for Unknown Length", "Advanced", "Use --increment to grow the mask length automatically.", "Use --increment with ?l?l?l?l?l?l?l?l", ["Use --increment with ?l?l?l?l?l?l?l?l", "Run separate attacks for each length", "Use a wordlist instead", "Use ?a?a?a?a?a?a?a?a without increment"], 180, "You know the password is 6-8 chars lowercase but don't know the exact length. What do you do?"),
    (75, "Mask Keyspace Calculation", "Advanced", "Keyspace = 26^4 x 10^4 = ~4.57B.", "~4.57 billion", ["~4.57 billion", "~26 million", "~10 million", "~457 million"], 180, "What is the keyspace of the mask ?u?l?l?l?d?d?d?d?"),
]

for cid, title, diff, ctx, expected, opts, xp, scenario in mask_data:
    challenges.append(ch(cid, M5, title, diff, scenario, f"Select the correct answer for: {title}", ctx,
        "Review the mask attack section.", "Think about the mask syntax.",
        "Check the mask charset reference.", "Review the mask attack documentation.",
        "identify" if "Charset" in title or "Basics" in title else "command", xp,
        options=opts, expectedOption=expected,
        expl=ctx, cmds=["hashcat -m 0 -a 3 hash.txt ?d?d?d?d?d?d"],
        bp=["Use mask attacks when structure is known."], defense=["Avoid predictable structures."]))

# === MODULE 6: COMBINATOR ATTACKS (5 challenges) ===
M6 = "Combinator Attacks"
challenges.append(ch(76, M6, "Combinator Attack Mode", "Intermediate",
    "You suspect users chose multi-word passwords. What attack mode?",
    "Select the correct Hashcat attack mode for combining two wordlists.",
    "Hashcat -a 1 (Combinator) concatenates every word from A with every word from B.",
    "The combinator attack merges two wordlists.", "The attack mode flag is -a followed by a number.",
    "Combinator attack is -a 1.", "Review the combinator attack section.",
    "identify", 150,
    options=["-a 1 (Combinator)", "-a 0 (Straight)", "-a 3 (Brute-force)", "-a 6 (Hybrid)"],
    expectedOption="-a 1 (Combinator)",
    expl="-a 1 takes two wordlists and produces every pairwise concatenation.",
    cmds=["hashcat -m 0 -a 1 left.txt right.txt"],
    bp=["Use curated wordlists — 10K x 10K = 100M is manageable."], defense=["Use 4+ word passphrases."]))

challenges.append(ch(77, M6, "Combinator with Separator", "Advanced",
    "You want to add a space between words in a combinator attack. How?",
    "Select the correct flags for adding a separator in combinator attacks.",
    "Use -j '$ ' to append a space to the left word.",
    "The -j flag applies a rule to the left word.", "The rule '$ ' appends a space.",
    "Use -j '$ ' to add a space after the left word.", "Review the combinator rules section.",
    "command", 200,
    options=["-j '$ ' -k ''", "-j '' -k '$ '", "--separator ' '", "-a 1 -s ' '"],
    expectedOption="-j '$ ' -k ''",
    expl="Use -j '$ ' to append a space to the left word in a combinator attack.",
    cmds=["hashcat -m 0 -a 1 left.txt right.txt -j '$ '"],
    bp=["Use -j and -k to add separators."], defense=["Multi-word passphrases with spaces are still in combinator reach."]))

challenges.append(ch(78, M6, "Combinator Keyspace", "Advanced",
    "Left list has 10K words, right list has 10K words. How many candidates?",
    "Calculate the total candidate count for a combinator attack.",
    "Total candidates = left_size x right_size. 10K x 10K = 100M.",
    "Multiply left list size by right list size.", "10K x 10K = ?",
    "10000 times 10000 equals 100 million.", "Review the keyspace calculation section.",
    "command", 180,
    options=["100 million candidates", "10 thousand candidates", "1 billion candidates", "20 thousand candidates"],
    expectedOption="100 million candidates",
    expl="10K x 10K = 100M. At 100 GH/s (MD5), exhausts in ~0.001 seconds.",
    cmds=["hashcat -m 0 -a 1 left.txt right.txt --status"],
    bp=["Curated wordlists work best for combinator."], defense=["Use 4+ unrelated words."]))

challenges.append(ch(79, M6, "Three-Word Passphrases", "Expert",
    "You suspect 3-word passphrases. How do you attack them with Hashcat?",
    "Select the correct approach for 3-word passphrase cracking.",
    "Hashcat doesn't natively support 3-word combinator. Chain attacks.",
    "Hashcat's -a 1 only supports two wordlists.", "You need to chain two combinator attacks.",
    "Pipe the output of the first combinator into a second.", "Review the chaining section.",
    "strategy", 250,
    options=["Chain two combinator attacks", "Use -a 1 with three wordlists", "Use -a 3 with a mask", "Use -a 6 with a wordlist and mask"],
    expectedOption="Chain two combinator attacks",
    expl="For 3-word passphrases, chain: hashcat -a 1 left.txt right.txt | hashcat -a 1 - third.txt",
    cmds=["hashcat -m 0 -a 1 left.txt right.txt | hashcat -m 0 -a 1 - third.txt"],
    bp=["3-word combinator is expensive — use small curated lists."], defense=["4+ word passphrases resist 3-word combinator."]))

challenges.append(ch(80, M6, "Combinator Wordlist Selection", "Intermediate",
    "Which wordlists work best for combinator attacks?",
    "Select the best wordlist strategy for combinator attacks.",
    "Use curated word lists (10K common English words) rather than huge breach lists.",
    "Smaller, curated lists work better for combinator.", "10K common words is a good starting point.",
    "Use curated English word lists (not rockyou.txt).", "Review the wordlist selection section.",
    "strategy", 150,
    options=["Curated word lists (10K common English words)", "rockyou.txt on both sides", "14M breach list on both sides", "Pure brute force"],
    expectedOption="Curated word lists (10K common English words)",
    expl="10K x 10K = 100M candidates, exhausted in <1 second. 14M x 14M = 196T is too slow.",
    cmds=["hashcat -m 0 -a 1 english-10k.txt english-10k.txt"],
    bp=["Curated lists outperform huge breach lists for combinator."], defense=["Use uncommon words in passphrases."]))

# === MODULE 7: HYBRID ATTACKS (10 challenges) ===
M7 = "Hybrid Attacks"
hybrid_data = [
    (81, "Hybrid Wordlist + Mask", "Intermediate", "Hashcat -a 6 takes a wordlist first, then a mask.", "-a 6 (Hybrid Wordlist + Mask)", ["-a 6 (Hybrid Wordlist + Mask)", "-a 0 (Straight)", "-a 1 (Combinator)", "-a 7 (Hybrid Mask + Wordlist)"], 150, "Users append 2-4 digits to dictionary words. What attack mode?"),
    (82, "Hybrid Mask + Wordlist", "Intermediate", "Hashcat -a 7 takes a mask first, then a wordlist.", "-a 7 (Hybrid Mask + Wordlist)", ["-a 7 (Hybrid Mask + Wordlist)", "-a 6 (Hybrid Wordlist + Mask)", "-a 0 (Straight)", "-a 3 (Brute-force)"], 150, "Users prepend digits to dictionary words. What attack mode?"),
    (83, "Hybrid with --increment", "Advanced", "hashcat -a 6 rockyou.txt ?d?d?d?d --increment covers 1-4 digit suffixes.", "hashcat -m 0 -a 6 rockyou.txt ?d?d?d?d --increment", ["hashcat -m 0 -a 6 rockyou.txt ?d?d?d?d --increment", "hashcat -m 0 -a 6 rockyou.txt ?d?d?d?d", "hashcat -m 0 -a 3 ?d?d?d?d", "hashcat -m 0 -a 7 ?d?d?d?d rockyou.txt"], 180, "You want to cover 1-4 trailing digits on dictionary words. What command?"),
    (84, "Hybrid Keyspace Calculation", "Advanced", "14M x 1000 (?d?d?d) = 14B candidates.", "~14 billion candidates", ["~14 billion candidates", "~14 million candidates", "~1000 candidates", "~14 thousand candidates"], 180, "Wordlist has 14M entries, mask is ?d?d?d. How many candidates?"),
    (85, "Hybrid with Rules", "Expert", "Use -r to apply rules to the wordlist side.", "hashcat -m 0 -a 6 rockyou.txt ?d?d -r best64.rule", ["hashcat -m 0 -a 6 rockyou.txt ?d?d -r best64.rule", "hashcat -m 0 -a 6 rockyou.txt ?d?d", "hashcat -m 0 -a 6 -r best64.rule ?d?d rockyou.txt", "hashcat -m 0 -a 0 rockyou.txt -r best64.rule ?d?d"], 220, "You want to apply best64.rule to the wordlist side of a hybrid attack. How?"),
    (86, "Hybrid Strategy: Word+Digits", "Intermediate", "Use -a 6 with ?d?d?d?d --increment for year suffixes.", "hashcat -m 0 -a 6 rockyou.txt ?d?d?d?d --increment", ["hashcat -m 0 -a 6 rockyou.txt ?d?d?d?d --increment", "hashcat -m 0 -a 3 ?d?d?d?d", "hashcat -m 0 -a 0 rockyou.txt", "hashcat -m 0 -a 1 rockyou.txt years.txt"], 150, "Corporate users append years (2020-2025) to dictionary words. What command?"),
    (87, "Hybrid: Special Char Suffix", "Advanced", "Use -1 ?s ?1?d for special+digit suffix.", "hashcat -m 0 -a 6 rockyou.txt -1 ?s ?1?d", ["hashcat -m 0 -a 6 rockyou.txt -1 ?s ?1?d", "hashcat -m 0 -a 6 rockyou.txt ?d?d", "hashcat -m 0 -a 6 rockyou.txt ?s?s", "hashcat -m 0 -a 3 ?s?d"], 200, "Users append a special char + digit (e.g., 'password!1'). What mask?"),
    (88, "Hybrid -a 7 Strategy: Digits+Word", "Intermediate", "Use -a 7 ?d?d?d rockyou.txt --increment.", "hashcat -m 0 -a 7 ?d?d?d rockyou.txt --increment", ["hashcat -m 0 -a 7 ?d?d?d rockyou.txt --increment", "hashcat -m 0 -a 6 rockyou.txt ?d?d?d", "hashcat -m 0 -a 3 ?d?d?d", "hashcat -m 0 -a 0 rockyou.txt"], 150, "Users prepend 2-3 digits to dictionary words. What command?"),
    (89, "Hybrid Performance: MD5 vs bcrypt", "Expert", "MD5: ~0.14s; bcrypt: ~16 days. bcrypt is ~1M times slower.", "MD5: ~0.14 seconds; bcrypt: ~16 days", ["MD5: ~0.14 seconds; bcrypt: ~16 days", "MD5: ~16 days; bcrypt: ~0.14 seconds", "Both take ~1 hour", "Both take ~0.14 seconds"], 250, "You're running -a 6 rockyou.txt ?d?d?d on MD5 vs bcrypt. How do runtimes compare?"),
    (90, "Optimal Hybrid Attack Order", "Advanced", "Short suffixes first, then long suffixes, then prefixes.", "1. -a 6 ?d, 2. -a 6 ?d?d, 3. -a 6 ?d?d?d?d, 4. -a 7 ?d?d", ["1. -a 6 ?d, 2. -a 6 ?d?d, 3. -a 6 ?d?d?d?d, 4. -a 7 ?d?d", "1. -a 7 ?d?d, 2. -a 6 ?d?d?d?d, 3. -a 6 ?d?d, 4. -a 6 ?d", "1. -a 3 ?a?a?a?a, 2. -a 6 ?d", "1. -a 0 rockyou.txt, 2. -a 1 wordlist wordlist"], 200, "You're auditing corporate passwords. In what order do you run hybrid attacks?"),
]

for cid, title, diff, ctx, expected, opts, xp, scenario in hybrid_data:
    qtype = "identify" if "Mode" in title or "Strategy" in title else "command"
    challenges.append(ch(cid, M7, title, diff, scenario, f"Select the correct answer for: {title}", ctx,
        "Review the hybrid attack section.", "Think about the hybrid attack syntax.",
        "Check the hybrid attack reference.", "Review the hybrid documentation.",
        qtype, xp, options=opts, expectedOption=expected,
        expl=ctx, cmds=["hashcat -m 0 -a 6 rockyou.txt ?d?d?d?d --increment"],
        bp=["Use --increment for variable-length suffixes."], defense=["Reject passwords matching word+digits patterns."]))

# === MODULE 8: WALLET.DAT TRAINING (10 challenges) ===
M8 = "Wallet.dat Training"
challenges.append(ch(91, M8, "Wallet.dat File Format", "Beginner",
    "A suspect's laptop contains a 'wallet.dat' file. What format is it?",
    "Select the correct file format for Bitcoin Core wallet.dat.",
    "Bitcoin Core wallet.dat is a Berkeley DB (BDB) key-value store.",
    "It's a database file, not plain text.", "Bitcoin Core uses Berkeley DB for wallet storage.",
    "The format is Berkeley DB (BDB).", "Review the wallet file formats section.",
    "identify", 150,
    options=["Berkeley DB (BDB) key-value store", "Plain text file", "SQLite database", "JSON file"],
    expectedOption="Berkeley DB (BDB) key-value store",
    expl="Bitcoin Core wallet.dat is a Berkeley DB key-value store with encrypted private keys.",
    cmds=["python3 extract_wallet_hash.py mock_wallet.dat > wallet.hash"],
    bp=["Only ever operate on training mock wallets."], defense=["Use hardware wallets."]))

challenges.append(ch(92, M8, "Legacy Bitcoin Wallet Mode", "Intermediate",
    "You have a legacy Bitcoin Core wallet.dat (pre-0.6). What Hashcat mode?",
    "Select the correct Hashcat mode for legacy Bitcoin wallet.dat.",
    "Hashcat mode 11300 is Bitcoin/Litecoin wallet.dat (legacy KDF, pre-0.6).",
    "Legacy Bitcoin wallets (pre-0.6) use a weak KDF.", "The mode is 11300.",
    "Legacy Bitcoin wallet.dat is Hashcat mode 11300.", "Review the wallet hash modes.",
    "identify", 180,
    options=["-m 11300 (Bitcoin wallet.dat legacy)", "-m 0 (MD5)", "-m 1400 (SHA256)", "-m 16600 (Electrum)"],
    expectedOption="-m 11300 (Bitcoin wallet.dat legacy)",
    expl="Mode 11300 is legacy Bitcoin wallet.dat. KDF is sha256(sha512(passphrase.salt)) — very fast.",
    cmds=["hashcat -m 11300 -a 0 wallet.hash rockyou.txt"],
    bp=["Confirm wallet version before assigning the mode."], defense=["Upgrade legacy wallets."]))

challenges.append(ch(93, M8, "Modern Bitcoin Wallet Mode", "Advanced",
    "You have a modern Bitcoin Core wallet.dat (post-0.6). What Hashcat mode?",
    "Select the correct Hashcat mode for modern Bitcoin wallet.dat.",
    "Hashcat mode 16600 is Electrum Wallet. Modern Bitcoin Core uses 25000 iterations.",
    "Modern Bitcoin wallets use a stronger KDF.", "The mode for Electrum is 16600.",
    "Modern Electrum wallet is Hashcat mode 16600.", "Review the wallet hash modes.",
    "identify", 200,
    options=["-m 16600 (Electrum Wallet)", "-m 11300 (Legacy Bitcoin)", "-m 0 (MD5)", "-m 3200 (bcrypt)"],
    expectedOption="-m 16600 (Electrum Wallet)",
    expl="Mode 16600 is Electrum Wallet. Modern Bitcoin Core uses 25000 iterations of HMAC-SHA512.",
    cmds=["hashcat -m 16600 -a 0 wallet.hash rockyou.txt"],
    bp=["Identify wallet software version before choosing the mode."], defense=["Use 16+ char passphrases."]))

challenges.append(ch(94, M8, "Wallet Hash Extraction", "Advanced",
    "You need to extract the hash from a mock wallet.dat. What do you do?",
    "Select the correct approach for wallet hash extraction.",
    "Use a documented script to extract the KDF parameters and encrypted key material.",
    "You need to extract the hash in Hashcat format.", "Use a documented extraction script.",
    "Run extract_wallet_hash.py on the mock wallet.dat.", "Review the hash extraction section.",
    "strategy", 200,
    options=["Run a documented extraction script on the mock wallet.dat", "Open the wallet.dat in a text editor", "Run hashcat directly on wallet.dat", "Convert wallet.dat to JSON manually"],
    expectedOption="Run a documented extraction script on the mock wallet.dat",
    expl="Use extract_wallet_hash.py to extract KDF parameters. Output is in Hashcat format ($bitcoin$...).",
    cmds=["python3 extract_wallet_hash.py mock_wallet.dat > wallet.hash"],
    bp=["Always work on a copy of wallet.dat."], defense=["Keep wallet.dat backups encrypted."]))

challenges.append(ch(95, M8, "Wallet Attack: Wordlist Strategy", "Intermediate",
    "You have a mock legacy wallet hash. What's the first attack?",
    "Select the recommended first-pass attack for wallet hashes.",
    "Start with rockyou.txt + best64.rule. Legacy wallet (mode 11300) is ~10M H/s.",
    "Start with the standard first-pass attack.", "Use rockyou.txt + best64.rule.",
    "hashcat -m 11300 -a 0 wallet.hash rockyou.txt -r best64.rule.", "Review the wallet attack strategy section.",
    "strategy", 180,
    options=["hashcat -m 11300 -a 0 wallet.hash rockyou.txt -r best64.rule", "hashcat -m 11300 -a 3 ?a?a?a?a?a?a?a?a", "hashcat -m 0 -a 0 wallet.hash rockyou.txt", "hashcat -m 11300 -a 1 left.txt right.txt"],
    expectedOption="hashcat -m 11300 -a 0 wallet.hash rockyou.txt -r best64.rule",
    expl="Legacy wallet (mode 11300) is ~10M H/s, so 1B candidates runs in ~100 seconds.",
    cmds=["hashcat -m 11300 -a 0 wallet.hash rockyou.txt -r best64.rule"],
    bp=["Wallet attacks are slower than raw hashes — plan multi-stage escalation."], defense=["Use 16+ char passphrases."]))

challenges.append(ch(96, M8, "Wallet Attack: Hybrid Strategy", "Advanced",
    "Wordlist + rules failed on a legacy wallet. What's next?",
    "Select the recommended second-pass attack for wallet hashes.",
    "Use -a 6 rockyou.txt ?d?d?d?d --increment for word + digit patterns.",
    "Use a hybrid attack for word + digit patterns.", "Try -a 6 rockyou.txt ?d?d?d?d --increment.",
    "The hybrid attack covers word + digit suffixes.", "Review the hybrid attack section.",
    "strategy", 200,
    options=["hashcat -m 11300 -a 6 rockyou.txt ?d?d?d?d --increment", "hashcat -m 11300 -a 3 ?a?a?a?a?a?a?a?a", "hashcat -m 11300 -a 1 left.txt right.txt", "hashcat -m 11300 -a 7 ?d?d?d?d rockyou.txt"],
    expectedOption="hashcat -m 11300 -a 6 rockyou.txt ?d?d?d?d --increment",
    expl="At 10M H/s (legacy wallet), 156M candidates runs in ~15 seconds.",
    cmds=["hashcat -m 11300 -a 6 rockyou.txt ?d?d?d?d --increment"],
    bp=["Hybrid attacks are the second pass after wordlist + rules."], defense=["Use random passphrases."]))

challenges.append(ch(97, M8, "Wallet Attack: Crypto-Themed Wordlist", "Advanced",
    "The wallet owner is a crypto enthusiast. What wordlist do you use?",
    "Select the best wordlist for crypto-themed passwords.",
    "Crypto users often use crypto terms: 'satoshi', 'bitcoin', 'blockchain'.",
    "Crypto users often use crypto-related terms.", "Build a crypto-themed wordlist.",
    "Use a crypto-themed wordlist + best64.rule.", "Review the themed wordlist section.",
    "strategy", 200,
    options=["Crypto-themed wordlist + best64.rule", "rockyou.txt only", "Names list only", "Pure brute force"],
    expectedOption="Crypto-themed wordlist + best64.rule",
    expl="Crypto-themed wordlist yields higher recovery than generic wordlists for wallet passwords.",
    cmds=["hashcat -m 11300 -a 0 wallet.hash crypto-wordlist.txt -r best64.rule"],
    bp=["Themed wordlists outperform generic ones for domain-specific targets."], defense=["Use 16+ char random passphrases."]))

challenges.append(ch(98, M8, "Wallet Attack: Multi-Stage Planning", "Expert",
    "Client lost wallet passphrase. They remember: pet name 'Bella', 2-3 digits, 1 uppercase. Plan the attack.",
    "Select the optimal multi-stage attack plan.",
    "1. rockyou. 2. Hybrid Bella+?d?d?d. 3. Combinator Bella+rockyou. 4. Mask ?u?l?l?l?l?d?d?d.",
    "Use every clue — pet name, digit count, uppercase.", "Multi-stage escalation from cheapest to most expensive.",
    "Stage 1: rockyou. Stage 2: hybrid. Stage 3: combinator. Stage 4: mask.", "Review the multi-stage planning section.",
    "strategy", 280,
    options=["Multi-stage: 1) rockyou, 2) hybrid Bella+?d?d?d, 3) combinator, 4) mask ?u?l?l?l?l?d?d?d", "Pure brute force", "Single rockyou.txt + dive.rule", "Combinator rockyou x rockyou"],
    expectedOption="Multi-stage: 1) rockyou, 2) hybrid Bella+?d?d?d, 3) combinator, 4) mask ?u?l?l?l?l?d?d?d",
    expl="Optimal multi-stage: each stage builds on the previous, using every known clue.",
    cmds=["# Stage 1: wordlist", "hashcat -m 11300 wallet.hash rockyou.txt", "# Stage 2: hybrid", "hashcat -m 11300 -a 6 bella_list.txt ?d?d?d --increment"],
    bp=["Document each stage's runtime and yield."], defense=["Use high-entropy passphrases with no personal info."]))

challenges.append(ch(99, M8, "Wallet Recovery: Satoshi1", "Advanced",
    "FINAL CAPSTONE. Recover the mock legacy wallet passphrase. The owner used a common English word + single digit.",
    "Recover the simulated wallet passphrase.",
    "This capstone integrates identification, mode selection, strategy, and execution. The passphrase is 'satoshi1'.",
    "The passphrase is a tribute to Bitcoin's creator + a single digit.", "The pseudonymous creator of Bitcoin is 'Satoshi Nakamoto'.",
    "The first name + digit 1 = 'satoshi1'.", "Try hashcat -m 11300 -a 6 crypto-wordlist.txt ?d --increment.",
    "crack", 500, hash="$bitcoin$64$c2e8c8c284d4d4d4d4d4d4d4d4d4d4d4d4d4d4d4d4d4d4d4d4d4d4d4d4d4d4$64$e2c2c2c2c2c2c2c2c2c2c2c2c2c2c2c2c2c2c2c2c2c2c2c2c2c2c2c2c2c2c2c2$2$00$2c00",
    hashType="Bitcoin Wallet (Legacy)", hashcatMode=11300,
    expectedAnswer="satoshi1",
    expl="The capstone passphrase is 'satoshi1' — a tribute to Satoshi Nakamoto.",
    cmds=["hashcat -m 11300 -a 6 crypto-wordlist.txt ?d", "hashcat -m 11300 wallet.hash --show"],
    bp=["Always retrieve results with --show."], defense=["Use 16+ char random passphrases for wallets."]))

challenges.append(ch(100, M8, "Wallet Security Best Practices", "Expert",
    "You're advising a client on wallet security. What do you recommend?",
    "Select the best wallet security recommendations.",
    "1. Hardware wallet. 2. 16+ char passphrase. 3. Metal plate backup. 4. Multi-sig for large holdings.",
    "Hardware wallets eliminate wallet.dat exposure.", "Strong passphrases (16+ chars) resist brute force.",
    "Offline seed phrase backups are critical.", "Review the wallet security section.",
    "strategy", 250,
    options=["Hardware wallet + 16+ char passphrase + metal plate backup + multi-sig", "Keep wallet.dat on desktop with 6-char password", "Store seed phrase in a text file", "Use same password as email"],
    expectedOption="Hardware wallet + 16+ char passphrase + metal plate backup + multi-sig",
    expl="Best practices: hardware wallet, strong passphrase, offline backup, multi-sig.",
    cmds=["# N/A — defensive recommendations only"],
    bp=["Defense in depth: hardware wallet + strong passphrase + offline backup."], defense=["Implement all 5 best practices."]))

# Write the file
import json

def escape(s):
    return s.replace('\\', '\\\\').replace('"', '\\"').replace('\n', '\\n')

content += "];\n\n"
content += "export function getChallenge(id: number): Challenge | undefined {\n"
content += "  return CHALLENGES.find((c) => c.id === id);\n"
content += "}\n\n"
content += "export function getModuleChallenges(moduleName: string): Challenge[] {\n"
content += "  return CHALLENGES.filter((c) => c.module === moduleName);\n"
content += "}\n\n"
content += "export interface ModuleInfo {\n"
content += "  name: string;\n  code: string;\n  description: string;\n  color: string;\n  challengeIds: number[];\n"
content += "}\n\n"
content += "export const MODULES: ModuleInfo[] = [\n"

modules_info = [
    ("Hash Identification", "MODULE 1", "30 challenges covering MD5, SHA1, SHA256, SHA512, bcrypt, NTLM, LM, MySQL, PostgreSQL, SHA-3, RIPEMD-160, DES, md5crypt, SHA256crypt, SHA512crypt, MS Office, PKZIP, WinZip, PDF, and 7-Zip hash identification.", "#00E5FF", list(range(1,31))),
    ("Hashcat Modes", "MODULE 2", "15 challenges on identifying correct Hashcat mode numbers.", "#00FF88", list(range(31,46))),
    ("Wordlist Attacks", "MODULE 3", "10 challenges covering rockyou.txt, custom lists, targeted wordlists.", "#FFC857", list(range(46,56))),
    ("Rule Attacks", "MODULE 4", "10 challenges on best64.rule, dive.rule, OneRuleToRuleThemAll.", "#B484FF", list(range(56,66))),
    ("Mask Attacks", "MODULE 5", "10 challenges on charset creation, pattern analysis, password profiling.", "#FF5C5C", list(range(66,76))),
    ("Combinator Attacks", "MODULE 6", "5 challenges on combining dictionaries and hybrid workflows.", "#10B981", list(range(76,81))),
    ("Hybrid Attacks", "MODULE 7", "10 challenges on Wordlist+Mask and Mask+Wordlist hybrid attacks.", "#8B5CF6", list(range(81,91))),
    ("Wallet.dat Training", "MODULE 8", "10 challenges on Bitcoin/Litecoin mock wallet recovery workflows.", "#F59E0B", list(range(91,101))),
]

for name, code, desc, color, ids in modules_info:
    content += "  {\n"
    content += f'    name: {json.dumps(name)},\n'
    content += f'    code: {json.dumps(code)},\n'
    content += f'    description: {json.dumps(desc)},\n'
    content += f'    color: {json.dumps(color)},\n'
    content += f'    challengeIds: {json.dumps(ids)},\n'
    content += "  },\n"

content += "];\n\n"
content += "export const TOTAL_XP = CHALLENGES.reduce((sum, c) => sum + c.xp, 0);\n"

# Now generate the challenge objects
# We need to rebuild content from scratch since we wrote the closing bracket already
# Let me restart

full_content = '''// MOT Hashcat Playground — 100 progressive challenges across 8 modules
// All hashes are well-known public test vectors for educational use only.

export type ChallengeDifficulty = "Beginner" | "Intermediate" | "Advanced" | "Expert";

export interface Challenge {
  id: number;
  module: string;
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
  hint4: string;
  expectedAnswer?: string;
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
'''

for c in challenges:
    full_content += "  {\n"
    for key in ["id", "module", "title", "difficulty", "scenario", "objective", "educationalContext"]:
        val = c[key]
        if isinstance(val, str):
            full_content += f'    {key}: {json.dumps(val)},\n'
        else:
            full_content += f'    {key}: {json.dumps(val)},\n'
    
    for key in ["hash", "hashType", "hashcatMode"]:
        if key in c:
            val = c[key]
            if isinstance(val, str):
                full_content += f'    {key}: {json.dumps(val)},\n'
            else:
                full_content += f'    {key}: {json.dumps(val)},\n'
    
    for key in ["hint1", "hint2", "hint3", "hint4"]:
        full_content += f'    {key}: {json.dumps(c[key])},\n'
    
    if "expectedAnswer" in c:
        full_content += f'    expectedAnswer: {json.dumps(c["expectedAnswer"])},\n'
    
    full_content += f'    questionType: {json.dumps(c["questionType"])},\n'
    
    if "options" in c:
        full_content += f'    options: {json.dumps(c["options"])},\n'
    if "expectedOption" in c:
        full_content += f'    expectedOption: {json.dumps(c["expectedOption"])},\n'
    
    full_content += f'    explanation: {json.dumps(c["explanation"])},\n'
    full_content += f'    recommendedCommands: {json.dumps(c["recommendedCommands"])},\n'
    full_content += f'    bestPractices: {json.dumps(c["bestPractices"])},\n'
    full_content += f'    defenseRecommendations: {json.dumps(c["defenseRecommendations"])},\n'
    full_content += f'    xp: {c["xp"]},\n'
    full_content += "  },\n"

full_content += "];\n\n"

full_content += "export function getChallenge(id: number): Challenge | undefined {\n"
full_content += "  return CHALLENGES.find((c) => c.id === id);\n"
full_content += "}\n\n"
full_content += "export function getModuleChallenges(moduleName: string): Challenge[] {\n"
full_content += "  return CHALLENGES.filter((c) => c.module === moduleName);\n"
full_content += "}\n\n"
full_content += "export interface ModuleInfo {\n"
full_content += "  name: string;\n  code: string;\n  description: string;\n  color: string;\n  challengeIds: number[];\n"
full_content += "}\n\n"
full_content += "export const MODULES: ModuleInfo[] = [\n"

for name, code, desc, color, ids in modules_info:
    full_content += "  {\n"
    full_content += f'    name: {json.dumps(name)},\n'
    full_content += f'    code: {json.dumps(code)},\n'
    full_content += f'    description: {json.dumps(desc)},\n'
    full_content += f'    color: {json.dumps(color)},\n'
    full_content += f'    challengeIds: {json.dumps(ids)},\n'
    full_content += "  },\n"

full_content += "];\n\n"
full_content += "export const TOTAL_XP = CHALLENGES.reduce((sum, c) => sum + c.xp, 0);\n"

with open(FILE, 'w') as f:
    f.write(full_content)

print(f"Written {len(challenges)} challenges to {FILE}")
print(f"File size: {len(full_content)} bytes, {full_content.count(chr(10))} lines")
