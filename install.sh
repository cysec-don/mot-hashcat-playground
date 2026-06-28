```bash
#!/usr/bin/env bash

###############################################################################
# MOT Hashcat Playground Installer
# Ubuntu 24.04+
###############################################################################

set -euo pipefail

REPO_URL="https://github.com/cysec-don/mot-hashcat-playground.git"
PROJECT_DIR="$HOME/mot-hashcat-playground"

GREEN="\033[0;32m"
BLUE="\033[0;34m"
RED="\033[0;31m"
YELLOW="\033[1;33m"
NC="\033[0m"

info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

success() {
    echo -e "${GREEN}[OK]${NC} $1"
}

warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

###############################################################################
# Root Check
###############################################################################

if [[ $EUID -eq 0 ]]; then
    error "Please do not run this installer as root."
    exit 1
fi

###############################################################################
# Check Ubuntu
###############################################################################

if ! grep -q "Ubuntu" /etc/os-release; then
    warn "This installer was designed for Ubuntu."
fi

###############################################################################
# Update Packages
###############################################################################

info "Updating package lists..."

sudo apt update

###############################################################################
# Install Dependencies
###############################################################################

info "Installing required packages..."

sudo apt install -y \
    build-essential \
    git \
    curl \
    unzip \
    sqlite3

success "System dependencies installed."

###############################################################################
# Install Bun
###############################################################################

if ! command -v bun >/dev/null 2>&1; then

    info "Installing Bun..."

    curl -fsSL https://bun.sh/install | bash

    export BUN_INSTALL="$HOME/.bun"
    export PATH="$BUN_INSTALL/bin:$PATH"

    if ! grep -q "BUN_INSTALL" ~/.bashrc; then
        cat <<EOF >> ~/.bashrc

export BUN_INSTALL="\$HOME/.bun"
export PATH="\$BUN_INSTALL/bin:\$PATH"
EOF
    fi

else
    success "Bun already installed."
fi

export BUN_INSTALL="$HOME/.bun"
export PATH="$BUN_INSTALL/bin:$PATH"

success "Bun version: $(bun --version)"

###############################################################################
# Clone or Update Repository
###############################################################################

if [[ -d "$PROJECT_DIR/.git" ]]; then

    info "Repository already exists."

    cd "$PROJECT_DIR"

    info "Pulling latest changes..."

    git pull

else

    info "Cloning repository..."

    git clone "$REPO_URL" "$PROJECT_DIR"

    cd "$PROJECT_DIR"

fi

###############################################################################
# Install Packages
###############################################################################

info "Installing project dependencies..."

bun install

###############################################################################
# Environment File
###############################################################################

if [[ ! -f ".env" ]]; then

    info "Creating .env file..."

    cp .env.example .env

else

    success ".env already exists."

fi

###############################################################################
# Prisma Client
###############################################################################

info "Generating Prisma Client..."

bun run db:generate

###############################################################################
# Database
###############################################################################

info "Creating SQLite database..."

bun run db:push

###############################################################################
# Clear Next Cache
###############################################################################

if [[ -d ".next" ]]; then

    info "Removing Next.js cache..."

    rm -rf .next

fi

###############################################################################
# Finished
###############################################################################

echo
success "Installation Complete!"
echo

echo "Project Directory:"
echo "    $PROJECT_DIR"

echo

echo "To start the application:"
echo

echo "    cd $PROJECT_DIR"
echo "    bun run dev"

echo

echo "Open your browser at:"
echo
echo "    http://localhost:3000"

echo
```
