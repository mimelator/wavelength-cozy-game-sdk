#!/bin/bash

# VIBE Game Test Server
# Quick local testing for your cozy games

set -e

# Colors and emojis
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'
GAME="🎮"
CHECK="✅"
WARNING="⚠️"
MAGIC="✨"

echo -e "${BLUE}${GAME} VIBE Game Test Server${NC}"
echo ""

# Check if we're in a game directory
if [ ! -f "game.json" ]; then
    echo -e "${RED}${WARNING} No game.json found. Are you in a game directory?${NC}"
    echo "Usage: Run this from your game's root directory"
    exit 1
fi

# Get game info
GAME_TITLE=$(python3 -c "import json; print(json.load(open('game.json')).get('title', 'VIBE Game'))" 2>/dev/null || echo "VIBE Game")

echo -e "${BLUE}Testing: ${GAME_TITLE}${NC}"
echo ""

# Find available port
PORT=3000
while lsof -Pi :$PORT -sTCP:LISTEN -t >/dev/null 2>&1; do
    PORT=$((PORT + 1))
done

echo -e "${GREEN}${CHECK} Server starting on port $PORT${NC}"
echo ""
echo -e "${YELLOW}Access your game:${NC}"
echo -e "  Desktop: ${BLUE}http://localhost:$PORT${NC}"
echo -e "  Mobile:  ${BLUE}http://$(ipconfig getifaddr en0 2>/dev/null || hostname -I | awk '{print $1}' || echo "YOUR-IP"):$PORT${NC}"
echo ""
echo -e "${YELLOW}Testing tips:${NC}"
echo -e "  • Use WASD or arrow keys to move"
echo -e "  • Click items to collect them"
echo -e "  • Test on your phone for mobile experience"
echo -e "  • Press Ctrl+C to stop the server"
echo ""

# Start the server
if command -v python3 >/dev/null 2>&1; then
    echo -e "${BLUE}Starting Python 3 server...${NC}"
    python3 -m http.server $PORT
elif command -v python >/dev/null 2>&1; then
    echo -e "${BLUE}Starting Python server...${NC}"
    python -m http.server $PORT
else
    echo -e "${RED}${WARNING} Python not found.${NC}"
    echo "Please install Python or open index.html directly in your browser."
    exit 1
fi