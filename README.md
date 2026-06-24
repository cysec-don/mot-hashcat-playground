# MOT Hashcat Playground

### Master Password Recovery. Master Hashcat. Master the Art of Cracking.

An elite, production-grade cybersecurity training platform for mastering Hashcat, password recovery, MD5/SHA1/SHA2-256 cracking, and simulated cryptocurrency wallet analysis. Combines interactive challenges, a live cyber range, gamification, and professional PDF certification.

![MOT Hashcat Playground](https://img.shields.io/badge/Platform-Next.js%2016-black) ![TypeScript](https://img.shields.io/badge/Language-TypeScript-blue) ![License](https://img.shields.io/badge/License-MIT-green) ![Status](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
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
- [Security](#security)
- [Testing](#testing)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)
- [License](#license)

---

## Overview

MOT Hashcat Playground is a complete cybersecurity certification platform that teaches password-cracking methodology through 20 progressive hands-on challenges across four modules:

1. **MD5** — Foundational hash cracking (5 challenges)
2. **SHA1** — 160-bit hash operations (5 challenges)
3. **SHA2-256** — Modern hash analysis (5 challenges)
4. **Wallet.dat Training** — Simulated cryptocurrency wallet recovery (5 challenges)

The platform features a flagship **Hashcat Playground** — an interactive cyber range with an attack builder, simulated terminal, and AI-powered learning assistant. Students earn XP, climb ranks (Script Kiddie → MOT Grandmaster), unlock achievements, compete on a global leaderboard, and earn a premium PDF certificate upon completing all 20 challenges.

> **Educational Use Only**: All hashes are well-known public test vectors. No real wallets, no real cryptocurrency, no real credentials are used. The wallet.dat module uses 100% mock training files.

---

## Features

### Core Platform
- **20 Progressive Challenges** — Beginner → Intermediate → Advanced, each with scenario, objective, educational context, 3-tier hint system, recommended commands, best practices, and defense recommendations
- **Interactive Hashcat Playground** — Visual attack builder (Config / Wordlist / Rules / Mask tabs), real-time command generator, simulated terminal with speed/progress/ETA, and an AI learning assistant
- **Gamification** — 7 ranks, 12 achievements, XP system, global leaderboard with podium
- **Premium PDF Certification** — Luxury gold-bordered certificate with embossed seal, binary watermark, QR-verifiable ID, and dual signature lines
- **Certificate Verification Portal** — Public lookup by Certificate ID or Verification Number
- **Admin Panel** — Student management, CSV export, analytics dashboard with per-challenge completion charts
- **Authentication** — Register + login with bcrypt-hashed passwords, CSRF protection, opaque session tokens

### Security Hardened
- bcrypt password hashing (10 rounds)
- CSRF protection on all mutating endpoints (double-submit token pattern)
- Rate limiting (per-IP and per-account) — no X-Forwarded-For trust
- Input validation and sanitization on every endpoint
- Security headers (CSP, X-Frame-Options, HSTS, COOP, CORP, Permissions-Policy)
- Body size limits (64 KB)
- Opaque session tokens (no embedded user data)
- Case-insensitive username uniqueness with Latin-only character validation

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 16 (App Router), React 19, TypeScript 5 |
| **Styling** | Tailwind CSS 4, shadcn/ui (New York), Framer Motion |
| **Backend** | Next.js API Routes (Node.js runtime) |
| **Database** | Prisma ORM + SQLite |
| **State** | Zustand (client), TanStack Query (server) |
| **Charts** | Recharts |
| **PDF** | jsPDF |
| **AI Tutor** | z-ai-web-dev-sdk |
| **Icons** | Lucide React |
| **Runtime** | Bun (recommended) or Node.js 20+ |

---

## Project Structure

```
mot-hashcat-playground/
├── prisma/
│   └── schema.prisma              # Database schema (Student, ChallengeResult, Certificate, etc.)
├── public/                        # Static assets
├── scripts/
│   ├── mark-complete.ts           # Dev utility: mark all challenges complete
│   └── check-students.ts          # Dev utility: list students
├── src/
│   ├── app/
│   │   ├── api/                   # API routes
│   │   │   ├── auth/              # Register, login, logout
│   │   │   ├── student/           # Dashboard data
│   │   │   ├── progress/          # Challenge submission + hint tracking
│   │   │   ├── playground/        # Playground session logging
│   │   │   ├── playground-tutor/  # AI tutor endpoint
│   │   │   ├── certificate/       # Certificate generation
│   │   │   ├── verify/[id]/       # Public certificate verification
│   │   │   ├── leaderboard/       # Public leaderboard
│   │   │   ├── challenges/        # Public challenge list
│   │   │   └── admin/             # Admin-only endpoints
│   │   ├── globals.css            # Global styles + cyber theme
│   │   ├── layout.tsx             # Root layout
│   │   └── page.tsx               # Main page (view router)
│   ├── components/
│   │   ├── auth/                  # AuthView (register/login)
│   │   ├── dashboard/             # Student dashboard
│   │   ├── challenges/            # Challenges list + detail
│   │   ├── playground/            # Hashcat Playground
│   │   ├── leaderboard/           # Leaderboard view
│   │   ├── achievements/          # Achievements + ranks
│   │   ├── certificate/           # Certificate view + PDF download
│   │   ├── verify/                # Public verification portal
│   │   ├── admin/                 # Admin panel
│   │   ├── landing/               # Landing page
│   │   ├── layout/                # Navbar, Footer, CyberGridBackground
│   │   └── ui/                    # shadcn/ui components
│   ├── hooks/
│   │   └── useDashboardData.ts    # Dashboard data fetch hook
│   ├── lib/
│   │   ├── security.ts            # Auth, rate limiting, validation, sanitization
│   │   ├── api-client.ts          # Authenticated fetch helper
│   │   ├── store.ts               # Zustand stores (app state + session)
│   │   ├── challenges-data.ts     # 20 challenge definitions
│   │   ├── achievements-data.ts   # 7 ranks + 12 achievements
│   │   ├── hashcat-data.ts        # Wordlists, rules, masks, attack modes
│   │   ├── certificate-pdf.ts     # PDF certificate generator
│   │   ├── db.ts                  # Prisma client
│   │   └── utils.ts               # Utility functions
│   └── proxy.ts                   # Security headers middleware
├── .env.example                   # Environment variable template
├── next.config.ts                 # Next.js configuration
├── package.json                   # Dependencies and scripts
└── README.md                      # This file
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
# Clone to your preferred directory
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

#### Step 5: Configure Environment

```bash
# Copy the example environment file
cp .env.example .env

# The default DATABASE_URL points to ./db/custom.db
# No changes needed for local development
# If you want a custom database path, edit .env:
#   nano .env
```

#### Step 6: Initialize the Database

```bash
# Generate Prisma client
bun run db:generate
# OR: npx prisma generate

# Create the database schema
bun run db:push
# OR: npx prisma db push
```

#### Step 7: Start the Development Server

```bash
# Using Bun
bun run dev

# OR using npm
npm run dev
```

The application will be available at **http://localhost:3000**.

---

### Fedora

#### Step 1: Install System Dependencies

```bash
# Update system
sudo dnf update -y

# Install build tools and Git
sudo dnf install -y gcc gcc-c++ make git curl unzip
```

#### Step 2: Install Bun (Recommended)

```bash
# Install Bun
curl -fsSL https://bun.sh/install | bash

# Add Bun to PATH
echo 'export BUN_INSTALL="$HOME/.bun"' >> ~/.bashrc
echo 'export PATH="$BUN_INSTALL/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc

# Verify
bun --version
```

#### Alternative: Install Node.js 20+ (if you prefer npm)

```bash
# Install Node.js via NodeSource
curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
sudo dnf install -y nodejs

# Verify
node --version
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
# Using Bun
bun install

# OR using npm
npm install
```

#### Step 5: Configure Environment

```bash
cp .env.example .env
```

#### Step 6: Initialize the Database

```bash
bun run db:generate
bun run db:push
```

#### Step 7: Start the Development Server

```bash
bun run dev
```

Open **http://localhost:3000** in your browser.

---

### Arch Linux

#### Step 1: Install System Dependencies

```bash
# Update system
sudo pacman -Syu

# Install base-devel, Git, curl, and unzip
sudo pacman -S --needed base-devel git curl unzip
```

#### Step 2: Install Bun (Recommended)

```bash
# Install Bun
curl -fsSL https://bun.sh/install | bash

# Add Bun to PATH
echo 'export BUN_INSTALL="$HOME/.bun"' >> ~/.bashrc
echo 'export PATH="$BUN_INSTALL/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc

# Verify
bun --version
```

#### Alternative: Install Node.js 20+ (if you prefer npm)

```bash
# Arch repos have the latest Node.js
sudo pacman -S nodejs npm

# Verify
node --version
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
# Using Bun
bun install

# OR using npm
npm install
```

#### Step 5: Configure Environment

```bash
cp .env.example .env
```

#### Step 6: Initialize the Database

```bash
bun run db:generate
bun run db:push
```

#### Step 7: Start the Development Server

```bash
bun run dev
```

Open **http://localhost:3000** in your browser.

---

### Windows

#### Step 1: Install Git

1. Download Git for Windows from **https://git-scm.com/download/win**
2. Run the installer with default settings
3. Open **Git Bash** (installed with Git) or **PowerShell**

#### Step 2: Install Bun (Recommended) or Node.js

**Option A: Install Bun**

1. Open PowerShell as Administrator
2. Run:
   ```powershell
   powershell -c "irm bun.sh/install.ps1 | iex"
   ```
3. Close and reopen your terminal
4. Verify:
   ```powershell
   bun --version
   ```

**Option B: Install Node.js 20+**

1. Download the LTS installer from **https://nodejs.org/**
2. Run the installer (select "Add to PATH")
3. Restart your terminal
4. Verify:
   ```powershell
   node --version
   npm --version
   ```

#### Step 3: Clone the Repository

```powershell
# In PowerShell or Git Bash
cd $HOME
git clone https://github.com/cysec-don/mot-hashcat-playground.git
cd mot-hashcat-playground
```

#### Step 4: Install Dependencies

```powershell
# Using Bun
bun install

# OR using npm
npm install
```

#### Step 5: Configure Environment

```powershell
# Copy the example environment file
Copy-Item .env.example .env

# The default DATABASE_URL is file:./db/custom.db
# This works on Windows — just use forward slashes
```

#### Step 6: Initialize the Database

```powershell
# Using Bun
bun run db:generate
bun run db:push

# OR using npm
npx prisma generate
npx prisma db push
```

#### Step 7: Start the Development Server

```powershell
# Using Bun
bun run dev

# OR using npm
npm run dev
```

Open **http://localhost:3000** in your browser.

> **Note**: If you encounter execution policy errors in PowerShell, run:
> ```powershell
> Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
> ```

---

### macOS

#### Step 1: Install Homebrew (if not already installed)

```bash
# Install Homebrew
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Add Homebrew to PATH (Apple Silicon)
echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zprofile
eval "$(/opt/homebrew/bin/brew shellenv)"

# Verify
brew --version
```

#### Step 2: Install System Dependencies

```bash
# Install Git (comes with Xcode Command Line Tools, but explicit install is safer)
brew install git curl unzip
```

#### Step 3: Install Bun (Recommended) or Node.js

**Option A: Install Bun**

```bash
# Install Bun
curl -fsSL https://bun.sh/install | bash

# Add Bun to PATH
echo 'export BUN_INSTALL="$HOME/.bun"' >> ~/.zshrc
echo 'export PATH="$BUN_INSTALL/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc

# Verify
bun --version
```

**Option B: Install Node.js 20+ via Homebrew**

```bash
brew install node

# Verify
node --version
npm --version
```

#### Step 4: Clone the Repository

```bash
cd ~
git clone https://github.com/cysec-don/mot-hashcat-playground.git
cd mot-hashcat-playground
```

#### Step 5: Install Dependencies

```bash
# Using Bun
bun install

# OR using npm
npm install
```

#### Step 6: Configure Environment

```bash
cp .env.example .env
```

#### Step 7: Initialize the Database

```bash
bun run db:generate
bun run db:push
```

#### Step 8: Start the Development Server

```bash
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
| `dev` | Start the development server on port 3000 |
| `build` | Build the production standalone bundle |
| `start` | Start the production server (requires build first) |
| `lint` | Run ESLint to check code quality |
| `db:push` | Push the Prisma schema to the database |
| `db:generate` | Generate the Prisma client |
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

### Production Mode

```bash
# Build the standalone bundle
bun run build

# Start the production server
bun run start
```

### First Run Setup

1. **Open** http://localhost:3000 in your browser
2. **Click** "Start Learning" or "Sign In"
3. **Register** with your Full Name and a strong password
   - The first registered user automatically becomes the admin
4. **Start challenges** from the Dashboard

### Admin Access

The first user to register is automatically granted admin privileges. Admins can:
- View all students
- Export student data as CSV
- View analytics (per-challenge completion rates, top students)
- Reset any non-admin student's progress
- Verify certificates via the admin dialog

---

## Usage Guide

### For Students

1. **Register** with your full name and a password (min 8 chars, must include upper/lower/digit/special)
2. **Complete Challenges** — Start with Module 1 (MD5), progress through SHA1, SHA2-256, and Wallet.dat
3. **Use Hints** — Each challenge has 3 progressive hints (using hints doesn't block progress)
4. **Practice** in the Hashcat Playground — experiment with attack modes, wordlists, rules, and masks
5. **Ask the AI Tutor** — Built into the Playground, explains concepts and suggests strategies
6. **Climb the Leaderboard** — Earn XP from challenges (100-500 XP each) and playground sessions (10 XP each)
7. **Earn Achievements** — 12 achievements unlock automatically as you progress
8. **Get Certified** — Complete all 20 challenges to unlock your premium PDF certificate

### For Administrators

1. **Access Admin Panel** — Click "Admin" in the navbar (visible only to admins)
2. **Monitor Students** — View the student table with search and CSV export
3. **View Analytics** — See per-challenge completion rates and top students
4. **Verify Certificates** — Use the "Verify Certificate" dialog to check any certificate
5. **Manage Progress** — Reset any non-admin student's progress if needed

### For Employers / Verifiers

1. **Visit** the Certificate Verification portal (accessible from the navbar)
2. **Enter** the Certificate ID or Verification Number from the student's PDF
3. **Verify** — The system confirms whether the certificate was issued by this platform

---

## Security

MOT Hashcat Playground has been penetration-tested and hardened against common web vulnerabilities:

| Protection | Implementation |
|------------|---------------|
| **Password Hashing** | bcrypt (10 rounds) |
| **CSRF Protection** | Double-submit token on all mutating endpoints |
| **Rate Limiting** | Per-IP (10-60 req/min depending on endpoint) + per-account (5 failed logins / 15 min) |
| **Session Management** | Opaque tokens, 12-hour inactivity TTL, server-side invalidation |
| **Input Validation** | Strict type checking, length limits, Latin-only names, email format enforcement |
| **SQL Injection** | Prisma ORM with parameterized queries (zero raw SQL) |
| **XSS Protection** | React JSX auto-escaping, strict CSP (no unsafe-eval) |
| **Security Headers** | CSP, X-Frame-Options: DENY, HSTS, COOP, CORP, Permissions-Policy |
| **Body Size Limit** | 64 KB max request body |
| **Certificate Security** | CSPRNG-generated IDs (32^8 keyspace), no name-based enumeration |

### Security Best Practices for Production Deployment

1. **Use HTTPS** — Always deploy behind a reverse proxy (Caddy, Nginx) with TLS
2. **Set `NODE_ENV=production`** — Enables production optimizations
3. **Regular Backups** — Back up the SQLite database file regularly
4. **Monitor Logs** — Watch for rate-limit violations and error patterns
5. **Rotate Secrets** — If you add JWT or session secrets, rotate them periodically

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

---

## Troubleshooting

### Common Issues

#### "Cannot find module '@prisma/client'"

The Prisma client hasn't been generated. Run:

```bash
bun run db:generate
# OR
npx prisma generate
```

#### "Database connection error"

Ensure the `DATABASE_URL` in `.env` points to a valid, writable path. The `db/` directory must exist:

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

---

### Getting Help

If you encounter issues not covered here:

1. Check the dev server console output for error messages
2. Run `bun run lint` to catch code issues
3. Verify your Node.js/Bun version meets the prerequisites
4. Ensure all environment variables are set correctly
5. Try deleting `node_modules` and reinstalling: `rm -rf node_modules && bun install`

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

---

<div align="center">

**MOT Hashcat Playground**

Master Password Recovery. Master Hashcat. Master the Art of Cracking.

Educational simulations only. No real wallets, no real cryptocurrency, no real credentials.

</div>
