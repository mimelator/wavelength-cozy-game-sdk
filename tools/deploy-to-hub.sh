#!/bin/bash

# Deploy to hub.wavelength.com script
# One-click deployment for VIBE Coded games

set -e

# Colors and emojis
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'
ROCKET="🚀"
CHECK="✅"
WARNING="⚠️"
MAGIC="✨"

echo -e "${BLUE}${ROCKET} VIBE Game Deployment to hub.wavelength.com${NC}"
echo ""

# Check if we're in a game directory
if [ ! -f "game.json" ]; then
    echo -e "${RED}${WARNING} No game.json found. Are you in a game directory?${NC}"
    echo "Run this script from your game's root directory."
    exit 1
fi

# Validate game first
echo -e "${BLUE}Validating game...${NC}"

# Basic validation
if [ ! -f "index.html" ]; then
    echo -e "${RED}${WARNING} Missing index.html${NC}"
    exit 1
fi

if [ ! -d "css" ] || [ ! -d "js" ]; then
    echo -e "${RED}${WARNING} Missing css/ or js/ directory${NC}"
    exit 1
fi

# Check JSON syntax
if ! python3 -c "import json; json.load(open('game.json'))" 2>/dev/null; then
    echo -e "${RED}${WARNING} Invalid JSON syntax in game.json${NC}"
    exit 1
fi

echo -e "${GREEN}${CHECK} Game validation passed${NC}"

# Extract game info
GAME_TITLE=$(python3 -c "import json; print(json.load(open('game.json')).get('title', 'Untitled Game'))" 2>/dev/null || echo "Untitled Game")
GAME_DESC=$(python3 -c "import json; print(json.load(open('game.json')).get('description', 'A cozy VIBE Coded game'))" 2>/dev/null || echo "A cozy VIBE Coded game")

echo ""
echo -e "${BLUE}Game: ${GAME_TITLE}${NC}"
echo -e "${BLUE}Description: ${GAME_DESC}${NC}"
echo ""

# Package the game
echo -e "${BLUE}Packaging game...${NC}"

# Create package directory
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
CLEAN_TITLE=$(echo "$GAME_TITLE" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9]/-/g' | sed 's/--*/-/g' | sed 's/^-\|-$//g')
PACKAGE_NAME="${CLEAN_TITLE}-${TIMESTAMP}"
PACKAGE_DIR="deploy-package"

# Clean up any existing package
rm -rf "$PACKAGE_DIR"
mkdir -p "$PACKAGE_DIR"

# Copy game files
cp index.html "$PACKAGE_DIR/"
cp game.json "$PACKAGE_DIR/"
cp -r css "$PACKAGE_DIR/"
cp -r js "$PACKAGE_DIR/"

# Copy optional files
[ -f "README.md" ] && cp README.md "$PACKAGE_DIR/"
[ -d "assets" ] && cp -r assets "$PACKAGE_DIR/"

# Create deployment metadata
cat > "$PACKAGE_DIR/deploy-info.json" << EOF
{
  "packagedAt": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "vibeSDKVersion": "1.0",
  "deploymentTarget": "hub.wavelength.com",
  "gameTitle": "$GAME_TITLE",
  "packageName": "$PACKAGE_NAME"
}
EOF

# Create ZIP for upload
echo -e "${BLUE}Creating deployment package...${NC}"
ZIP_NAME="${PACKAGE_NAME}.zip"

cd "$PACKAGE_DIR"
zip -r "../$ZIP_NAME" . > /dev/null 2>&1
cd ..

echo -e "${GREEN}${CHECK} Package created: $ZIP_NAME${NC}"
echo ""

# Display deployment instructions
echo -e "${YELLOW}${ROCKET} Ready for Deployment!${NC}"
echo ""
echo -e "${BLUE}Automatic Deployment (Recommended):${NC}"
echo -e "1. Visit: ${GREEN}https://hub.wavelength.com/upload${NC}"
echo -e "2. Drag and drop: ${GREEN}$ZIP_NAME${NC}"
echo -e "3. Review auto-filled information"
echo -e "4. Click 'Publish Game'"
echo ""

echo -e "${BLUE}Manual Deployment (Alternative):${NC}"
echo -e "1. Email ${GREEN}$ZIP_NAME${NC} to: games@wavelength.com"
echo -e "2. Include any special instructions"
echo ""

# Try to open the upload page automatically
if command -v open >/dev/null 2>&1; then
    echo -e "${BLUE}Opening hub.wavelength.com/upload in browser...${NC}"
    open "https://hub.wavelength.com/upload" 2>/dev/null || true
elif command -v xdg-open >/dev/null 2>&1; then
    echo -e "${BLUE}Opening hub.wavelength.com/upload in browser...${NC}"
    xdg-open "https://hub.wavelength.com/upload" 2>/dev/null || true
fi

echo ""
echo -e "${GREEN}${MAGIC} Deployment package ready! ${MAGIC}${NC}"
echo -e "${YELLOW}Your cozy game will be live on hub.wavelength.com soon!${NC}"
echo ""

# Cleanup
read -p "Delete temporary files? (Y/n): " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Nn]$ ]]; then
    echo -e "${BLUE}Temporary files kept in: $PACKAGE_DIR${NC}"
else
    rm -rf "$PACKAGE_DIR"
    echo -e "${GREEN}${CHECK} Cleanup complete${NC}"
fi

echo ""
echo -e "${BLUE}Thank you for using VIBE Coding! ${MAGIC}${NC}"