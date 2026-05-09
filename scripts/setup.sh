#!/usr/bin/env bash
# scripts/setup.sh — First-time local setup

set -e
RED='\033[0;31m'; GREEN='\033[0;32m'; CYAN='\033[0;36m'; BOLD='\033[1m'; NC='\033[0m'

echo -e "${CYAN}${BOLD}"
echo "╔══════════════════════════════════════════════╗"
echo "║      ENTITY X  —  Website Setup              ║"
echo "╚══════════════════════════════════════════════╝"
echo -e "${NC}"

# Check Node.js
if ! command -v node &>/dev/null; then
  echo -e "${RED}✗ Node.js not found. Install from https://nodejs.org/${NC}"; exit 1
fi
NODE_VERSION=$(node -v | cut -d'.' -f1 | tr -d 'v')
if [ "$NODE_VERSION" -lt 18 ]; then
  echo -e "${RED}✗ Node.js 18+ required (found $(node -v))${NC}"; exit 1
fi
echo -e "${GREEN}✓ Node.js $(node -v)${NC}"

# Install backend dependencies
echo -e "\n${CYAN}Installing backend dependencies...${NC}"
cd backend
npm install
cd ..

# Create .env if missing
if [ ! -f backend/.env ]; then
  cp backend/.env.example backend/.env
  echo -e "${GREEN}✓ Created backend/.env from template${NC}"
  echo -e "${RED}  → Open backend/.env and fill in your values before starting!${NC}"
fi

# Initialize database
echo -e "\n${CYAN}Initializing database...${NC}"
cd database
node -e "
  require('dotenv').config({ path: '../backend/.env' });
  require('../backend/config/database');
  console.log('Database initialized.');
"
cd ..

echo -e "\n${GREEN}${BOLD}✅ Setup complete!${NC}"
echo -e "\nTo start the server:"
echo -e "  ${CYAN}cd backend && npm run dev${NC}"
echo -e "\nThen open: ${CYAN}http://localhost:4000${NC}"
