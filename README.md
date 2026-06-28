# MOT Hashcat Playground

### Master Password Recovery. Master Hashcat. Master the Art of Cracking.

An elite, production-grade cybersecurity training platform for mastering Hashcat, password recovery, and simulated cryptocurrency wallet analysis. Combines 100 interactive challenges across 8 modules, a live cyber range, gamification, social sharing, digital badges, and professional PDF certification.

![Platform](https://img.shields.io/badge/Platform-Next.js%2016-black) ![Language](https://img.shields.io/badge/Language-TypeScript-blue) ![Challenges](https://img.shields.io/badge/Challenges-100-brightgreen) ![Modules](https://img.shields.io/badge/Modules-8-cyan) ![License](https://img.shields.io/badge/License-MIT-green)

---

## Table of Contents

- [Overview](#overview)
- [Curriculum](#curriculum)
- [Features](#features)
  - [Core Platform](#core-platform)
  - [Anti-Cheat System](#anti-cheat-system)
  - [Gamification & Social](#gamification--social)
  - [Security Hardened](#security-hardened)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation Guide](#installation-guide)
  - [Ubuntu 24.04](#ubuntu-2404)
  - [Fedora](#fedora)
  - [Arch Linux](#arch-linux)
  - [Windows](#windows)
  - [macOS](#macos)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [Usage Guide](#usage-guide)
  - [For Students](#for-students)
  - [For Administrators](#for-administrators)
  - [For Employers / Verifiers](#for-employers--verifiers)
- [Security](#security)
- [Testing](#testing)
- [Deployment](#deployment)
  - [Option 1: Vercel](#option-1-vercel-recommended-for-simplicity)
  - [Option 2: Docker](#option-2-docker)
  - [Option 3: VPS / Bare Metal](#option-3-vps--bare-metal)
- [Troubleshooting](#troubleshooting)
- [License](#license)
- [Acknowledgments](#acknowledgments)

---

## Overview

MOT Hashcat Playground is a complete cybersecurity certification platform that teaches password-cracking methodology through **100 progressive hands-on challenges** across **eight modules**. The platform is designed to rival and exceed the quality of Hack The Box, TryHackMe, OffSec, and SANS Cyber Ranges.

### What Makes This Platform Different

1. **Students learn WHY, not just WHAT** — Every challenge includes educational context, progressive hints that guide without revealing answers, best practices, and defense recommendations
2. **Anti-cheat design** — Answer randomization, progressive hints that never reveal the answer, explanations shown only after correct completion, and hash type/mode hidden until challenge is solved
3. **Real Hashcat methodology** — Students learn the actual Hashcat CLI, mode flags, attack modes, masks, rules, and workflows used by professional penetration testers
4. **Safe simulations** — All hashes are well-known public test vectors. No real wallets, no real cryptocurrency, no real credentials

> **Educational Use Only**: All hashes are well-known public test vectors. No real wallets, no real cryptocurrency, no real credentials are used. The wallet.dat module uses 100% mock training files.

---

## Curriculum

The platform offers **100 challenges** across **8 modules**, with 4 difficulty levels (Beginner → Intermediate → Advanced → Expert):

### Module 1: Hash Identification (30 Challenges)

Students learn to identify hash types by examining length, prefix, and context:

| Hash Type | Length | Prefix | Hashcat Mode |
|-----------|--------|--------|-------------|
| MD5 | 32 hex | — | 0 |
| SHA1 | 40 hex | — | 100 |
| SHA256 | 64 hex | — | 1400 |
| SHA512 | 128 hex | — | 1700 |
| bcrypt | variable | `$2a$`, `$2b$`, `$2y$` | 3200 |
| NTLM | 32 hex | — | 1000 |
| LM | 32 hex | — | 3000 |
| MySQL 5.x | 40 hex | `*` | 300 |
| PostgreSQL | variable | `md5` | 111 |
| SHA-3 (Keccak-256) | 64 hex | — | 17200 |
| RIPEMD-160 | 40 hex | — | 6000 |
| DES (Unix crypt) | 13 chars | — | 1500 |
| md5crypt | variable | `$1$` | 500 |
| SHA256crypt | variable | `$5$` | 7400 |
| SHA512crypt | variable | `$6$` | 1800 |
| MS Office 97-2003 | variable | `$oldoffice$` | 9700 |
| MS Office 2007 | variable | `$office$*2007*` | 9710 |
| MS Office 2013+ | variable | `$office$*2013*` | 9730 |
| 7-Zip | variable | `$7z$` | 11600 |
| PDF 1.7-2.0 | variable | `$pdf$5*` | 10600 |

Challenges include both identification (multiple-choice) and cracking (enter the plaintext) questions.

### Module 2: Hashcat Modes (15 Challenges)

Students identify the correct `-m` flag for each hash type. Covers all algorithms from Module 1.

### Module 3: Wordlist Attacks (10 Challenges)

Topics: rockyou.txt, custom lists, CeWL, targeted wordlists, wordlist deduplication, themed wordlists.

### Module 4: Rule Attacks (10 Challenges)

Topics: best64.rule, dive.rule, OneRuleToRuleThemAll, rule prediction (capitalize, append digit, leetspeak, reverse, append year), custom rules, performance estimation.

### Module 5: Mask Attacks (10 Challenges)

Topics: charset (?d, ?l, ?u, ?a, ?s), mask construction, custom charsets (-1), `--increment`, keyspace calculation.

### Module 6: Combinator Attacks (5 Challenges)

Topics: `-a 1` mode, separators, three-word passphrase chaining, wordlist selection.

### Module 7: Hybrid Attacks (10 Challenges)

Topics: `-a 6` (Wordlist + Mask), `-a 7` (Mask + Wordlist), `--increment`, rules with hybrid, performance comparison.

### Module 8: Wallet.dat Training (10 Challenges)

Topics: wallet.dat file format (Berkeley DB), legacy vs modern KDF, hash extraction, attack planning, multi-stage recovery, crypto-themed wordlists. **100% mock training files — no real wallets or cryptocurrency.**

### Difficulty Distribution

| Difficulty | Challenges | XP Range |
|-----------|-----------|----------|
| Beginner | ~40 | 100-150 XP |
| Intermediate | ~30 | 120-200 XP |
| Advanced | ~20 | 180-280 XP |
| Expert | ~10 | 250-500 XP |

---

## Features

### Core Platform

- **100 Progressive Challenges** — Each with scenario, objective, educational context, 4-tier progressive hint system, recommended commands (with mode numbers hidden), best practices, and defense recommendations
- **Interactive Hashcat Playground** — Visual attack builder with 4 tabs:
  - **Config** — Hash type, attack mode, custom hash entry
  - **Wordlist** — 6 built-in wordlists (rockyou subset, common passwords, leaked top 10K, corporate patterns, crypto-themed, first names)
  - **Rules** — 4 rule sets (best64.rule, dive.rule, generated.rule, custom.rule) with example mutations
  - **Mask** — 5 mask presets with charset legend and real-time keyspace calculation
- **Real-time Command Generator** — Builds the Hashcat command as you configure, with copy-to-clipboard
- **Simulated Terminal** — Beautiful terminal interface showing speed, progress, ETA, GPU utilization, and recovered passwords
- **AI Learning Assistant** — Built-in tutor powered by z-ai-web-dev-sdk, with prompt-injection protection and system-prompt extraction prevention
- **Premium PDF Certification** — Luxury gold-bordered certificate with embossed seal, binary watermark, QR-verifiable ID, dual signature lines, generated via jsPDF
- **Certificate Verification Portal** — Public lookup by Certificate ID or Verification Number (no name-based enumeration)
- **Admin Panel** — Student management with search, CSV export (with formula-injection protection), analytics dashboard with per-challenge completion charts (Recharts)
- **Separate Register & Login Pages** — Each with its own button in the navbar and on the landing page
- **Custom Branding** — MOT logo integrated in navbar, footer, auth pages, landing hero, and browser favicon
- **Responsive Design** — Mobile-first, works on all screen sizes
- **Cyber SOC Theme** — Dark theme (#0B0F19), cyan (#00E5FF) and green (#00FF88) accents, glassmorphism, neon highlights, matrix rain animation, cyber grid backgrounds

### Anti-Cheat System

The platform is designed so students must **earn** their certification through genuine understanding:

- **Answer Randomization** — Fisher-Yates shuffle using `crypto.getRandomValues` on every challenge load. Correct answers appear in random positions (A/B/C/D) each time — eliminates pattern recognition
- **Progressive Hints (4 tiers)** — Hints guide students to reference materials and analytical approaches. They NEVER reveal:
  - The correct answer
  - The algorithm name
  - The mode number
  - The password
  - The mask pattern
- **No Explanation on Wrong Answers** — Wrong attempts show progressive guidance messages:
  - Attempt 1: "Incorrect. Review the challenge materials and try again."
  - Attempt 2: "Incorrect. Take a closer look at the educational context above."
  - Attempt 3: "Incorrect. Consider reviewing the recommended commands and best practices."
  - Attempt 4: "Incorrect. Would you like to revisit the lesson?"
- **Explanation Only After Correct Answer** — The full explanation (which contains the answer) is shown ONLY when the student answers correctly
- **Hidden Hash Type & Mode** — The hash type label shows "Unknown Hash" and the Hashcat mode badge is hidden until the challenge is completed
- **Hidden Educational Context** — The educational context (which may reference the algorithm by name) is hidden until the challenge is completed
- **No Answer in Recommended Commands** — All commands use `hashcat -m <hash_type>` instead of actual mode numbers
- **No Algorithm Names in Titles** — Challenge titles describe the hash characteristics, not the algorithm name (e.g., "Identify This 32-Character Hash" instead of "Identify MD5")
- **No Algorithm Names in Scenarios** — Scenarios describe the context without naming the algorithm

### Gamification & Social

- **7 Ranks** — Script Kiddie → Apprentice Cracker → Hash Hunter → Password Slayer → Crypto Recovery Specialist → Elite Hashcat Operator → MOT Grandmaster
- **16 Achievements** — Module-specific badges (Hash ID Master, Mode Specialist, Rule Wizard, etc.) plus progressive achievements (First Blood, Halfway There, Flawless, MOT Grandmaster)
- **XP System** — Challenges award 100-500 XP; Playground sessions award 10 XP each
- **Global Leaderboard** — Three time-period tabs:
  - **All-Time** — All students ranked by total XP
  - **Monthly** — Students active in the last 30 days
  - **Weekly** — Students active in the last 7 days
- **Social Sharing** — One-click sharing to 6 platforms:
  - LinkedIn, Facebook, X (Twitter), Instagram, WhatsApp, Telegram
  - Pre-filled message with student name, module completed, XP earned, rank, and hashtags
  - Downloadable share card as PNG (canvas-generated with cyber theme)
- **Digital Badges** — 8 downloadable PNG badges:
  - Hash ID Apprentice, Hash ID Master, Mode Specialist, Rule Wizard, Mask Master, Wallet Hunter, Hashcat Operator, MOT Grandmaster
  - Canvas-generated with badge design, student name, and platform branding

### Security Hardened

The platform has been **penetration-tested by 10 parallel pentest agents** and hardened against all found vulnerabilities:

| Protection | Implementation |
|------------|---------------|
| **Password Hashing** | bcrypt (10 rounds), precomputed dummy hash for timing equalization |
| **CSRF Protection** | Double-submit token on all mutating endpoints (constant-time comparison) |
| **Rate Limiting** | Per-IP (10-60 req/min depending on endpoint) + per-account (5 failed logins / 15 min). Uses socket peer IP, NOT X-Forwarded-For |
| **Session Management** | Opaque tokens (64-char hex, no embedded user data), 12-hour inactivity TTL, server-side invalidation on logout |
| **Input Validation** | Strict type checking, length limits, Latin-only names (rejects homoglyphs), email format enforcement, integer validation |
| **SQL Injection** | Prisma ORM with parameterized queries (zero raw SQL) |
| **XSS Protection** | React JSX auto-escaping, strict CSP (no unsafe-eval), no dangerouslySetInnerHTML in app code |
| **Security Headers** | CSP, X-Frame-Options: DENY, X-XSS-Protection, HSTS, COOP, CORP, Permissions-Policy, Referrer-Policy |
| **Body Size Limit** | 64 KB max request body (Content-Length check before parsing) |
| **Content-Type Enforcement** | All POST/PATCH endpoints require `Content-Type: application/json` |
| **Certificate Security** | CSPRNG-generated IDs (32^8 keyspace), no name-based enumeration |
| **AI Tutor Hardening** | System prompt extraction prevention, prompt-injection pattern filtering, response post-filtering |
| **CSV Formula Injection** | Export prefixes cells starting with `=+-@\t\r` with single quote |
| **Prisma Turbopack Fix** | Dynamic `require()` + `serverExternalPackages` + `predev` cache clear prevents `Cannot find module @prisma/client-<hash>` error |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 16 (App Router), React 19, TypeScript 5 |
| **Styling** | Tailwind CSS 4, shadcn/ui (New York), Framer Motion |
| **Backend** | Next.js API Routes (Node.js runtime) |
| **Database** | Prisma ORM + SQLite |
| **State Management** | Zustand (client state with persist middleware) |
| **Charts** | Recharts |
| **PDF Generation** | jsPDF |
| **AI Tutor** | z-ai-web-dev-sdk |
| **Icons** | Lucide React |
| **Runtime** | Bun (recommended) or Node.js 20+ |
| **Security** | bcryptjs, custom rate limiter, CSRF tokens, CSP headers |

---

## Project Structure

```
mot-hashcat-playground/
├── prisma/
│   └── schema.prisma                # Database schema (Student, ChallengeResult, Certificate, etc.)
├── public/
│   └── mot-logo.jpg                 # MOT brand logo
├── scripts/
│   ├── generate-challenges.py       # Generates the 100-challenge data file
│   ├── mark-complete.ts             # Dev utility: mark all challenges complete
│   ├── check-students.ts            # Dev utility: list students
│   └── e2e-test.py                  # End-to-end API tests
├── src/
│   ├── app/
│   │   ├── api/                     # API routes (all rate-limited, validated)
│   │   │   ├── auth/                # Register, login, logout (bcrypt, CSRF, opaque tokens)
│   │   │   ├── student/             # Dashboard data (8-module progress)
│   │   │   ├── progress/            # Challenge submission + 4-tier hint tracking
│   │   │   ├── playground/          # Playground session logging (+10 XP)
│   │   │   ├── playground-tutor/    # AI tutor (prompt-injection hardened)
│   │   │   ├── certificate/         # Certificate generation (100-challenge gate)
│   │   │   ├── verify/[id]/         # Public cert verification (ID + verification number only)
│   │   │   ├── leaderboard/         # Public leaderboard (all/monthly/weekly tabs)
│   │   │   ├── challenges/          # Public challenge list
│   │   │   └── admin/               # Admin-only (student mgmt, analytics, CSV export)
│   │   ├── globals.css              # Global styles + cyber SOC theme
│   │   ├── layout.tsx               # Root layout (fonts, metadata, logo favicon)
│   │   └── page.tsx                 # Main page (client-side view router)
│   ├── components/
│   │   ├── auth/                    # AuthView (separate register/login modes)
│   │   ├── dashboard/               # Student dashboard (stats, progress, activity)
│   │   ├── challenges/              # Challenges list + detail (answer shuffle, progressive hints)
│   │   ├── playground/              # Hashcat Playground (attack builder, terminal, AI tutor)
│   │   ├── leaderboard/             # Leaderboard (all-time/monthly/weekly tabs, podium)
│   │   ├── achievements/            # Achievements + ranks + digital badges
│   │   ├── certificate/             # Certificate view + PDF download
│   │   ├── verify/                  # Public verification portal
│   │   ├── admin/                   # Admin panel (students, analytics, CSV, cert verify dialog)
│   │   ├── landing/                 # Landing page (hero, features, curriculum, FAQ)
│   │   ├── layout/                  # Navbar, Footer, CyberGridBackground (matrix animation)
│   │   ├── shared/                  # ShareCard (social sharing), DigitalBadges (PNG download)
│   │   └── ui/                      # shadcn/ui component library
│   ├── hooks/
│   │   └── useDashboardData.ts      # Dashboard data fetch hook (auto-refresh)
│   ├── lib/
│   │   ├── security.ts              # bcrypt, rate limiting, validation, sanitization, body parsing
│   │   ├── api-client.ts            # Authenticated fetch helper (Bearer + CSRF headers)
│   │   ├── store.ts                 # Zustand stores (view router + persisted session)
│   │   ├── challenges-data.ts       # 100 challenge definitions (8 modules, 4 difficulties)
│   │   ├── achievements-data.ts     # 7 ranks + 16 achievements
│   │   ├── hashcat-data.ts          # Wordlists, rules, masks, attack modes reference
│   │   ├── certificate-pdf.ts       # PDF certificate generator (jsPDF)
│   │   ├── db.ts                    # Prisma client (dynamic require, globalThis singleton)
│   │   └── utils.ts                 # Utility functions (cn, etc.)
│   └── proxy.ts                     # Security headers proxy (CSP, HSTS, TRACE block)
├── .env.example                     # Environment variable template
├── .gitignore                       # Git ignore rules
├── next.config.ts                   # Next.js config (serverExternalPackages, poweredByHeader)
├── package.json                     # Dependencies and scripts (predev, postinstall, prebuild: prisma generate)
├── LICENSE                          # MIT License
└── README.md                        # This file
```

---

## Prerequisites

Before installing MOT Hashcat Playground, ensure you have:

- **Git** (any recent version)
- **Node.js 20+** OR **Bun 1.1+** (Bun is recommended — faster installs and runtime)
- **A terminal/command prompt** with administrator/sudo access

### Why Bun?

Bun is the recommended runtime because it:
- Installs dependencies 10-30x faster than npm
- Runs TypeScript natively (no transpilation step)
- Starts the dev server faster
- Is fully compatible with the Next.js ecosystem

However, **Node.js + npm** also works perfectly. Both paths are documented below.

---

## Installation Guide

Choose your operating system:

- [Ubuntu 24.04](#ubuntu-2404)
- [Fedora](#fedora)
- [Arch Linux](#arch-linux)
- [Windows](#windows)
- [macOS](#macos)

---

### Ubuntu 24.04

#### Step 1: Install System Dependencies

```bash
# Update package index
sudo apt update && sudo apt upgrade -y

# Install essential build tools and Git
sudo apt install -y build-essential git curl unzip
```

#### Step 2: Install Bun (Recommended)

```bash
# Install Bun
curl -fsSL https://bun.sh/install | bash

# Add Bun to PATH (restart terminal after this)
echo 'export BUN_INSTALL="$HOME/.bun"' >> ~/.bashrc
echo 'export PATH="$BUN_INSTALL/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc

# Verify installation
bun --version
```

#### Alternative: Install Node.js 20+ (if you prefer npm)

```bash
# Install Node.js via NodeSource
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verify
node --version   # should be v20.x or higher
npm --version
```

#### Step 3: Clone the Repository

```bash
cd ~
git clone https://github.com/cysec-don/mot-hashcat-playground.git
cd mot-hashcat-playground
```

#### Step 4: Install Dependencies

```bash
# Using Bun (recommended)
bun install

# OR using npm
npm install
```

> **Note**: The `postinstall` script automatically runs `mkdir -p db && prisma generate` — it creates the `db/` directory and generates the Prisma client. If it doesn't run automatically, execute `bun run db:generate` manually.

#### Step 5: Configure Environment

```bash
# Copy the example environment file
cp .env.example .env

# The default DATABASE_URL is file:./db/custom.db
# The db/ directory is created automatically by postinstall
# No changes needed for local development
```

#### Step 6: Initialize the Database

```bash
# Create the database schema (also regenerates the Prisma client)
bun run db:push
# OR: npx prisma db push
```

> **Note**: If you see a Prisma module error, the `predev` script handles this automatically. See [Troubleshooting](#cannot-find-module-prismaclient-hash-turbopack-error) for manual steps.

> **Note**: If you see a Prisma module error like `Cannot find module '@prisma/client-<hash>'`, run `bun run db:generate` to regenerate the client. The project uses `require()` instead of `import` in `db.ts` and includes a `predev` script that auto-clears the `.next` cache — see [Troubleshooting](#cannot-find-module-prismaclient-hash-turbopack-error) for details.

#### Step 7: Start the Development Server

```bash
# Using Bun (predev script auto-regenerates Prisma + clears cache)
bun run dev

# OR using npm
npm run dev
```

The application will be available at **http://localhost:3000**.

---

### Fedora

#### Step 1: Install System Dependencies

```bash
sudo dnf update -y
sudo dnf install -y gcc gcc-c++ make git curl unzip
```

#### Step 2: Install Bun (Recommended)

```bash
curl -fsSL https://bun.sh/install | bash
echo 'export BUN_INSTALL="$HOME/.bun"' >> ~/.bashrc
echo 'export PATH="$BUN_INSTALL/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc
bun --version
```

#### Alternative: Install Node.js 20+

```bash
curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
sudo dnf install -y nodejs
node --version
npm --version
```

#### Step 3: Clone and Install

```bash
cd ~
git clone https://github.com/cysec-don/mot-hashcat-playground.git
cd mot-hashcat-playground
bun install   # OR: npm install
```

> **Note**: The `postinstall` script runs `mkdir -p db && prisma generate` automatically. If it doesn't, run `bun run db:generate` manually.

#### Step 4: Configure and Initialize

```bash
cp .env.example .env
bun run db:push
```

> **Note**: If you see a Prisma module error, the `predev` script handles this automatically. See [Troubleshooting](#cannot-find-module-prismaclient-hash-turbopack-error) for manual steps.

#### Step 5: Start the Server

```bash
# predev script auto-regenerates Prisma + clears .next cache
bun run dev
```

Open **http://localhost:3000** in your browser.

---

### Arch Linux

#### Step 1: Install System Dependencies

```bash
sudo pacman -Syu
sudo pacman -S --needed base-devel git curl unzip
```

#### Step 2: Install Bun (Recommended)

```bash
curl -fsSL https://bun.sh/install | bash
echo 'export BUN_INSTALL="$HOME/.bun"' >> ~/.bashrc
echo 'export PATH="$BUN_INSTALL/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc
bun --version
```

#### Alternative: Install Node.js 20+

```bash
sudo pacman -S nodejs npm
node --version
npm --version
```

#### Step 3: Clone and Install

```bash
cd ~
git clone https://github.com/cysec-don/mot-hashcat-playground.git
cd mot-hashcat-playground
bun install   # OR: npm install
```

> **Note**: The `postinstall` script runs `mkdir -p db && prisma generate` automatically. If it doesn't, run `bun run db:generate` manually.

#### Step 4: Configure and Initialize

```bash
cp .env.example .env
bun run db:push
```

> **Note**: If you see a Prisma module error, the `predev` script handles this automatically. See [Troubleshooting](#cannot-find-module-prismaclient-hash-turbopack-error) for manual steps.

#### Step 5: Start the Server

```bash
# predev script auto-regenerates Prisma + clears .next cache
bun run dev
```

Open **http://localhost:3000** in your browser.

---

### Windows

#### Step 1: Install Git

1. Download Git for Windows from **https://git-scm.com/download/win**
2. Run the installer with default settings
3. Open **Git Bash** or **PowerShell**

#### Step 2: Install Bun or Node.js

**Option A: Install Bun**

```powershell
powershell -c "irm bun.sh/install.ps1 | iex"
```
Close and reopen your terminal, then verify: `bun --version`

**Option B: Install Node.js 20+**

1. Download the LTS installer from **https://nodejs.org/**
2. Run the installer (select "Add to PATH")
3. Restart your terminal
4. Verify: `node --version` and `npm --version`

#### Step 3: Clone the Repository

```powershell
cd $HOME
git clone https://github.com/cysec-don/mot-hashcat-playground.git
cd mot-hashcat-playground
```

#### Step 4: Install Dependencies

```powershell
bun install   # OR: npm install
```

> **Note**: The `postinstall` script runs `mkdir -p db && prisma generate` automatically. If it doesn't, run `bun run db:generate` (or `npx prisma generate`) manually.

#### Step 5: Configure Environment

```powershell
Copy-Item .env.example .env
```

#### Step 6: Initialize the Database

```powershell
bun run db:push   # OR: npx prisma db push
```

> **Note**: If you see a Prisma module error, the `predev` script handles this automatically. See [Troubleshooting](#cannot-find-module-prismaclient-hash-turbopack-error) for manual steps.

#### Step 7: Start the Development Server

```powershell
# predev script auto-regenerates Prisma + clears .next cache
bun run dev   # OR: npm run dev
```

Open **http://localhost:3000** in your browser.

> **Note**: If you encounter execution policy errors in PowerShell, run:
> ```powershell
> Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
> ```

---

### macOS

#### Step 1: Install Homebrew

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zprofile
eval "$(/opt/homebrew/bin/brew shellenv)"
brew --version
```

#### Step 2: Install System Dependencies

```bash
brew install git curl unzip
```

#### Step 3: Install Bun or Node.js

**Option A: Install Bun**

```bash
curl -fsSL https://bun.sh/install | bash
echo 'export BUN_INSTALL="$HOME/.bun"' >> ~/.zshrc
echo 'export PATH="$BUN_INSTALL/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
bun --version
```

**Option B: Install Node.js via Homebrew**

```bash
brew install node
node --version
npm --version
```

#### Step 4: Clone and Install

```bash
cd ~
git clone https://github.com/cysec-don/mot-hashcat-playground.git
cd mot-hashcat-playground
bun install   # OR: npm install
```

> **Note**: The `postinstall` script runs `mkdir -p db && prisma generate` automatically. If it doesn't, run `bun run db:generate` manually.

#### Step 5: Configure and Initialize

```bash
cp .env.example .env
bun run db:push
```

> **Note**: If you see a Prisma module error, the `predev` script handles this automatically. See [Troubleshooting](#cannot-find-module-prismaclient-hash-turbopack-error) for manual steps.

#### Step 6: Start the Server

```bash
# predev script auto-regenerates Prisma + clears .next cache
bun run dev
```

Open **http://localhost:3000** in your browser.

---

## Configuration

### Environment Variables

The application uses a single environment variable:

| Variable | Default | Description |
|----------|---------|-------------|
| `DATABASE_URL` | `file:./db/custom.db` | SQLite database file path. Use forward slashes on all platforms. |

To customize, edit the `.env` file:

```bash
# Example: Use a database in your home directory
DATABASE_URL=file:/home/username/mot-hashcat.db

# Example: Windows path (use forward slashes)
DATABASE_URL=file:C:/Users/username/mot-hashcat.db
```

### NPM Scripts

| Script | Description |
|--------|-------------|
| `dev` | Start the development server on port 3000 (auto-runs `predev` first) |
| `predev` | Automatically regenerates Prisma client + clears `.next` cache before each dev start |
| `prebuild` | Automatically regenerates Prisma client before each build |
| `build` | Build the production standalone bundle |
| `start` | Start the production server (requires build first) |
| `lint` | Run ESLint to check code quality |
| `postinstall` | Creates `db/` directory + runs `prisma generate` after `bun install` / `npm install` |
| `db:push` | Push the Prisma schema to the database |
| `db:generate` | Generate the Prisma client manually |
| `db:reset` | Reset the database (destroys all data) |

---

## Running the Application

### Development Mode

```bash
bun run dev
# OR
npm run dev
```

The dev server runs at **http://localhost:3000** with hot-reloading.

> **Note**: The `predev` script runs automatically before each `bun run dev` — it regenerates the Prisma client and clears the `.next` cache to prevent the Turbopack `@prisma/client-<hash>` error. You don't need to manually run `prisma generate` or clear caches.

### Production Mode

```bash
# Build the standalone bundle
bun run build

# Start the production server
bun run start
```

### First Run Setup

1. **Open** http://localhost:3000 in your browser
2. **Click** "Get Started" (to register) or "Sign In" (if you already have an account)
   - The navbar also has separate "Register" and "Sign In" buttons
3. **Register** with your Full Name and a strong password
   - Password requirements: min 8 chars, must include upper/lower case, a digit, and a special character
   - Full Name: Latin letters only (A-Z, a-z), spaces, hyphens, apostrophes, periods
   - The first registered user automatically becomes the admin
4. **Start challenges** from the Dashboard — begin with Module 1 (Hash Identification)

### Admin Access

The first user to register is automatically granted admin privileges. Admins can:
- View all students with search
- Export student data as CSV (with formula-injection protection)
- View analytics (per-challenge completion rates, top students)
- Reset any non-admin student's progress
- Verify certificates via the admin dialog

---

## Usage Guide

### Authentication

The platform has **separate Register and Login pages**:

- **Register** — Click the "Register" button in the navbar or "Get Started" on the landing page. Requires Full Name, optional email, and a strong password.
- **Sign In** — Click the "Sign In" button in the navbar or on the landing page. Requires Full Name and password.
- Each page has a cross-link button to switch to the other if you're on the wrong one.

### For Students

1. **Register** with your full name (Latin letters only) and a password (min 8 chars, must include upper/lower/digit/special)
2. **Complete Challenges** — Start with Module 1 (Hash Identification), progress through all 8 modules
3. **Use Progressive Hints** — Each challenge has 4 progressive hints that guide without revealing the answer. Using hints doesn't block progress but reduces your "perfect score" achievement count
4. **Wrong Answers** — You'll never see the correct answer on a wrong attempt. Instead, you'll get progressive guidance messages that encourage you to review the materials
5. **Practice** in the Hashcat Playground — experiment with attack modes, wordlists, rules, and masks. Earn 10 XP per session
6. **Ask the AI Tutor** — Built into the Playground, explains concepts and suggests strategies. The tutor is hardened against prompt-injection and system-prompt extraction
7. **Climb the Leaderboard** — Earn XP from challenges (100-500 XP each) and playground sessions (10 XP each). Check the All-Time, Monthly, and Weekly tabs
8. **Earn Achievements** — 16 achievements unlock automatically as you progress
9. **Share Achievements** — Click "Share" after completing a challenge to share on LinkedIn, Facebook, X, Instagram, WhatsApp, or Telegram. Download a share card as PNG
10. **Download Badges** — Visit the Achievements page to download digital badges as PNG
11. **Get Certified** — Complete all 100 challenges to unlock your premium PDF certificate

### For Administrators

1. **Access Admin Panel** — Click "Admin" in the navbar (visible only to admins)
2. **Monitor Students** — View the student table with search and CSV export
3. **View Analytics** — See per-challenge completion rates (bar chart) and top students
4. **Verify Certificates** — Use the "Verify Certificate" dialog to check any certificate by ID or verification number
5. **Manage Progress** — Reset any non-admin student's progress if needed (cannot reset own progress or other admins')

### For Employers / Verifiers

1. **Visit** the Certificate Verification portal (accessible from the navbar — "Verify")
2. **Enter** the Certificate ID or Verification Number from the student's PDF
3. **Verify** — The system confirms whether the certificate was issued by this platform
4. **Note** — Verification by student name is intentionally disabled to prevent certificate enumeration

---

## Security

MOT Hashcat Playground has been penetration-tested by 10 parallel pentest agents and hardened against all found vulnerabilities:

| Protection | Implementation |
|------------|---------------|
| **Password Hashing** | bcrypt (10 rounds), precomputed dummy hash for timing equalization on bad-credential login |
| **CSRF Protection** | Double-submit token on all mutating endpoints (constant-time comparison) |
| **Rate Limiting** | Per-IP (10-60 req/min depending on endpoint) + per-account (5 failed logins / 15 min). Uses socket peer IP, NOT X-Forwarded-For |
| **Session Management** | Opaque tokens (64-char hex, no embedded user data), 12-hour inactivity TTL, server-side invalidation on logout, Map size cap with LRU eviction |
| **Input Validation** | Strict type checking, length limits, Latin-only names (rejects homoglyphs), email format enforcement, integer validation (Number.isInteger), null/non-object body rejection |
| **SQL Injection** | Prisma ORM with parameterized queries (zero raw SQL, zero $queryRaw) |
| **XSS Protection** | React JSX auto-escaping, strict CSP (no unsafe-eval), no dangerouslySetInnerHTML in app code |
| **Security Headers** | CSP, X-Frame-Options: DENY, X-XSS-Protection, HSTS, COOP, CORP, Permissions-Policy, Referrer-Policy |
| **Body Size Limit** | 64 KB max request body (Content-Length check before parsing) |
| **Content-Type Enforcement** | All POST/PATCH endpoints require `Content-Type: application/json` |
| **Certificate Security** | CSPRNG-generated IDs (32^8 keyspace), no name-based enumeration |
| **AI Tutor Hardening** | System prompt extraction prevention, prompt-injection pattern filtering, response post-filtering |
| **CSV Formula Injection** | Export prefixes cells starting with `=+-@\t\r` with single quote |
| **Prisma Turbopack Fix** | Dynamic `require()` + `serverExternalPackages` + `predev` cache clear prevents `Cannot find module @prisma/client-<hash>` error |

### Security Best Practices for Production Deployment

1. **Use HTTPS** — Always deploy behind a reverse proxy (Caddy, Nginx) with TLS
2. **Set `NODE_ENV=production`** — Enables production optimizations and disables source maps
3. **Regular Backups** — Back up the SQLite database file regularly
4. **Monitor Logs** — Watch for rate-limit violations (429 responses) and error patterns
5. **Rotate Secrets** — If you add JWT or session secrets, rotate them periodically
6. **Database Migration** — For production, consider switching from SQLite to PostgreSQL

---

## Testing

### Lint Check

```bash
bun run lint
```

### End-to-End API Tests

```bash
# Register, login, submit challenges, test CSRF, verify certificates, logout
python3 scripts/e2e-test.py
```

### Security Regression Tests

```bash
python3 scripts/pentest/verify-fixes.py
```

---

## Deployment

### Option 1: Vercel (Recommended for simplicity)

1. Push your code to GitHub
2. Go to **https://vercel.com** and import the repository
3. Vercel auto-detects Next.js — no configuration needed
4. Set the environment variable `DATABASE_URL` in the Vercel dashboard
5. Deploy

> **Note**: For production, consider switching from SQLite to PostgreSQL by updating `prisma/schema.prisma`:
> ```prisma
> datasource db {
>   provider = "postgresql"
>   url      = env("DATABASE_URL")
> }
> ```

### Option 2: Docker

Create a `Dockerfile`:

```dockerfile
FROM oven/bun:1 as base
WORKDIR /app

# Install dependencies
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile --production

# Copy source
COPY . .

# Build
RUN bun run build

# Expose port
EXPOSE 3000

# Start
CMD ["bun", "run", "start"]
```

Build and run:

```bash
docker build -t mot-hashcat-playground .
docker run -p 3000:3000 -v $(pwd)/db:/app/db mot-hashcat-playground
```

### Option 3: VPS / Bare Metal

1. Install Bun and clone the repo (follow the installation guide for your OS)
2. Install dependencies: `bun install`
3. Build: `bun run build`
4. Use a process manager (PM2, systemd) to run `bun run start`
5. Configure a reverse proxy (Caddy/Nginx) with TLS

Example Caddyfile:

```
mot-hashcat.example.com {
    reverse_proxy localhost:3000
}
```

Example systemd service (`/etc/systemd/system/mot-hashcat.service`):

```ini
[Unit]
Description=MOT Hashcat Playground
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/opt/mot-hashcat-playground
ExecStart=/home/www-data/.bun/bin/bun run start
Restart=on-failure
RestartSec=5

[Install]
WantedBy=multi-user.target
```

---

## Troubleshooting

### Common Issues

#### "Cannot find module '@prisma/client-<hash>'" (Turbopack error)

This is a known Turbopack issue where Next.js tries to bundle `@prisma/client` but fails because the generated client uses dynamic requires. The error looks like:

```
Error: Failed to load external module @prisma/client-2c3a283f134fdcb6
ResolveMessage: Cannot find module '@prisma/client-2c3a283f134fdcb6'
```

**This project includes a permanent fix** using three complementary approaches:

1. **`src/lib/db.ts`** — Uses `require("@prisma/client")` instead of `import` to force runtime resolution, bypassing Turbopack's static bundling entirely
2. **`next.config.ts`** — `serverExternalPackages` config tells Turbopack to NOT bundle `@prisma/client`
3. **`package.json`** — `predev` script automatically regenerates the Prisma client and clears the `.next` cache before every `bun run dev` start

If you still see the error after pulling the latest code, run:

```bash
# 1. Delete the entire .next directory (not just cache)
rm -rf .next

# 2. Regenerate the Prisma client
bun run db:generate
# OR: npx prisma generate

# 3. Restart the dev server (predev will auto-clear cache + regenerate)
bun run dev
```

If the error persists, verify your `next.config.ts` contains:

```typescript
serverExternalPackages: ["@prisma/client", "@prisma/client/runtime", ".prisma/client"],
```

And verify `src/lib/db.ts` uses `require()` instead of `import`:

```typescript
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { PrismaClient } = require("@prisma/client");
```

#### "Cannot find module '@prisma/client'" (general)

The Prisma client hasn't been generated. Run:

```bash
bun run db:generate
# OR
npx prisma generate
```

#### "Database connection error"

Ensure the `DATABASE_URL` in `.env` points to a valid, writable path. The `db/` directory must exist. The `postinstall` and `predev` scripts create it automatically, but if you need to create it manually:

```bash
mkdir -p db
```

#### "Port 3000 already in use"

Either stop the other process or use a different port:

```bash
# Using Bun
bun run next dev -p 3001

# Using npm
npx next dev -p 3001
```

#### "Permission denied" on database file

Ensure the `db/` directory and database file are writable by the user running the application:

```bash
chmod -R 755 db/
chmod 644 db/custom.db
```

#### Bun installation fails on Windows

If the PowerShell install fails, try using npm instead:

```powershell
npm install -g bun
```

#### Prisma schema changes not reflected

After changing `prisma/schema.prisma`, always regenerate:

```bash
bun run db:generate
bun run db:push
```

If the database has existing data that conflicts with schema changes:

```bash
bun run db:push -- --force-reset
```

> **Warning**: `--force-reset` destroys all data in the database.

#### Rate limiting blocks legitimate testing

The rate limiter uses the socket peer IP. If you're testing rapidly from localhost, you may hit limits. Wait 60 seconds for the window to reset, or restart the dev server.

#### "Full Name may only contain Latin letters"

The platform enforces Latin-only characters (A-Z, a-z) in full names to prevent homoglyph attacks. Digits, Cyrillic, Greek, and other scripts are rejected. Use letters, spaces, hyphens, apostrophes, and periods only.

**Examples of accepted names:**
- `Satoshi Nakamoto` ✅
- `Jean-Pierre O'Brien` ✅
- `Mary Jane` ✅

**Examples of rejected names:**
- `User123` ❌ (contains digits)
- `Тest Operator` ❌ (contains Cyrillic Т)
- `Test_User` ❌ (underscore not allowed)

#### Hydration mismatch error

If you see a "Hydration failed because the server rendered text didn't match the client" error, it's likely caused by `Math.random()` in a server-rendered component. This project uses deterministic patterns instead of `Math.random()` for any server-rendered content. If you add new components, avoid `Math.random()` in the render path — use it only inside `useEffect`.

---

### Getting Help

If you encounter issues not covered here:

1. Check the dev server console output for error messages
2. Run `bun run lint` to catch code issues
3. Verify your Node.js/Bun version meets the prerequisites
4. Ensure all environment variables are set correctly
5. Try deleting `node_modules` and reinstalling: `rm -rf node_modules && bun install`
6. Check the [GitHub repository](https://github.com/cysec-don/mot-hashcat-playground) for issues

---

## License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

## Acknowledgments

- **Hashcat** — The password recovery tool this platform teaches
- **Hack The Box, TryHackMe, OffSec, SANS** — Inspiration for the training platform design
- **rockyou.txt** — The legendary wordlist used in educational examples
- **shadcn/ui** — The component library powering the UI
- **Next.js team** — The framework this platform is built on
- **Prisma** — The ORM that makes database interactions safe and type-safe
- **z-ai-web-dev-sdk** — Powering the AI Learning Assistant

---

<div align="center">

**MOT Hashcat Playground**

Master Password Recovery. Master Hashcat. Master the Art of Cracking.

100 Challenges · 8 Modules · 7 Ranks · 16 Achievements · Social Sharing · Digital Badges · PDF Certification

Educational simulations only. No real wallets, no real cryptocurrency, no real credentials.

</div>
