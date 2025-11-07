#!/bin/bash

# Wavelength Cozy Game SDK CLI - Command Line Interface
# Create cozy games that generate real revenue!

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(pwd)"

# Load AI integration if available
if [ -f "$SCRIPT_DIR/ai-integration.sh" ]; then
    source "$SCRIPT_DIR/ai-integration.sh"
fi

# Colors for pretty output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Emojis for VIBE feeling
GAME="🎮"
ROCKET="🚀"
STAR="⭐"
HEART="💖"
MAGIC="✨"
TOOLS="🛠️"
CHECK="✅"
WARNING="⚠️"

print_header() {
    echo ""
    echo -e "${PURPLE}${MAGIC} Wavelength Cozy Game SDK ${MAGIC}${NC}"
    echo -e "${CYAN}Create cozy games that generate real revenue!${NC}"
    echo ""
}

print_help() {
    print_header
    echo -e "${BLUE}Available Commands:${NC}"
    echo ""
    echo -e "  ${GREEN}new <game-name> [template]${NC}    Create a new game project"
    echo -e "  ${GREEN}test [game-dir]${NC}             Start local test server for specified game"
    echo -e "  ${GREEN}deploy${NC}                      Deploy to hub.wavelength.com"
    echo -e "  ${GREEN}package${NC}                     Package game for sharing"
    echo -e "  ${GREEN}validate${NC}                    Check if game meets Hub requirements"
    echo -e "  ${GREEN}themes${NC}                      List available themes"
    echo -e "  ${GREEN}examples${NC}                    Show example configurations"
    echo -e "  ${GREEN}help${NC}                        Show this help message"
    echo ""
    echo -e "${PURPLE}🤖 AI-Powered Commands:${NC}"
    echo -e "  ${GREEN}ai-setup <provider> <api-key>${NC} Configure AI integration"
    echo -e "  ${GREEN}ai-create \"<description>\"${NC}     Create game with AI assistance"
    echo -e "  ${GREEN}ai-refine \"<changes>\"${NC}        Refine existing game with AI"
    echo ""
    echo -e "${PURPLE}🎨 Creative Workflow:${NC}"
    echo -e "  ${GREEN}creative \"<description>\"${NC}      Let AI create freely, then integrate SDK"
    echo ""
    echo -e "${YELLOW}Examples:${NC}"
    echo -e "  ./vibe-cli.sh new beach-adventure simple-collector"
    echo -e "  ./vibe-cli.sh ai-setup openai sk-your-api-key-here"
    echo -e "  ./vibe-cli.sh ai-create \"cozy forest collection game\""
    echo -e "  ./vibe-cli.sh creative \"peaceful lighthouse keeper game\""
    echo -e "  ./vibe-cli.sh ai-refine \"make badges more nature-themed\""
    echo -e "  ./vibe-cli.sh test frozen-ice-palace-collection"
    echo -e "  ./vibe-cli.sh deploy"
    echo ""
}

# Create new game project
create_new_game() {
    local game_name="$1"
    local template="${2:-simple-collector}"

    if [ -z "$game_name" ]; then
        echo -e "${RED}${WARNING} Please provide a game name${NC}"
        echo "Usage: ./vibe-cli.sh new <game-name> [template]"
        exit 1
    fi

    # Clean up game name
    local clean_name=$(echo "$game_name" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9]/-/g' | sed 's/--*/-/g' | sed 's/^-\|-$//g')

    echo -e "${BLUE}${GAME} Creating new Wavelength cozy game: $clean_name${NC}"
    echo -e "${CYAN}Template: $template${NC}"

    # Check if template exists
    if [ ! -d "$SCRIPT_DIR/templates/$template" ]; then
        echo -e "${RED}${WARNING} Template '$template' not found${NC}"
        echo "Available templates:"
        ls "$SCRIPT_DIR/templates/" 2>/dev/null || echo "No templates found"
        exit 1
    fi

    # Check if directory already exists
    if [ -d "$clean_name" ]; then
        echo -e "${YELLOW}${WARNING} Directory '$clean_name' already exists${NC}"
        read -p "Overwrite? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            echo "Cancelled."
            exit 1
        fi
        rm -rf "$clean_name"
    fi

    # Copy template
    echo -e "${BLUE}Copying template files...${NC}"
    cp -r "$SCRIPT_DIR/templates/$template" "$clean_name"

    # Update game.json with project name
    if [ -f "$clean_name/game.json" ]; then
        echo -e "${BLUE}Updating game configuration...${NC}"

        # Create a temporary file for the updated JSON
        local temp_file=$(mktemp)

        # Update title in game.json (basic sed replacement)
        sed "s/\"title\": \"[^\"]*\"/\"title\": \"$(echo $game_name | sed 's/[&/\]/\\&/g')\"/" "$clean_name/game.json" > "$temp_file"
        mv "$temp_file" "$clean_name/game.json"
    fi

    echo ""
    echo -e "${GREEN}${CHECK} Game created successfully!${NC}"
    echo -e "${CYAN}${STAR} Project: $clean_name/${NC}"
    echo ""
    echo -e "${YELLOW}Next steps:${NC}"
    echo -e "  1. ${BLUE}cd $clean_name${NC}"
    echo -e "  2. ${BLUE}Edit game.json to customize your game${NC}"
    echo -e "  3. ${BLUE}../vibe-cli.sh test${NC} - Test your game"
    echo -e "  4. ${BLUE}../vibe-cli.sh deploy${NC} - Deploy to Hub"
    echo ""
}

# Start local test server
start_test_server() {
    local game_dir="$1"
    
    echo -e "${BLUE}${GAME} Starting Wavelength cozy game test server...${NC}"

    # If a game directory is specified, change to it
    if [ -n "$game_dir" ]; then
        if [ ! -d "$game_dir" ]; then
            echo -e "${RED}${WARNING} Game directory '$game_dir' not found${NC}"
            exit 1
        fi
        echo -e "${CYAN}Testing game: $game_dir${NC}"
        cd "$game_dir"
    fi

    # Check if we're in a game directory
    if [ ! -f "game.json" ]; then
        echo -e "${RED}${WARNING} No game.json found. Are you in a game directory?${NC}"
        echo -e "${YELLOW}Usage:${NC}"
        echo -e "  From game directory: ${BLUE}../vibe-cli.sh test${NC}"
        echo -e "  From SDK root: ${BLUE}./vibe-cli.sh test <game-directory>${NC}"
        echo ""
        echo -e "${CYAN}Available games:${NC}"
        # List directories that contain game.json
        for dir in */; do
            if [ -f "$dir/game.json" ]; then
                echo -e "  ${GREEN}$dir${NC}"
            fi
        done
        exit 1
    fi

    # Find available port
    local port=3000
    while lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; do
        port=$((port + 1))
    done

    echo -e "${CYAN}Server will start on: http://localhost:$port${NC}"
    echo -e "${YELLOW}Press Ctrl+C to stop the server${NC}"
    echo ""

    # Start simple Python server
    if command -v python3 >/dev/null 2>&1; then
        python3 -m http.server $port
    elif command -v python >/dev/null 2>&1; then
        python -m http.server $port
    else
        echo -e "${RED}${WARNING} Python not found. Please install Python to run the test server.${NC}"
        echo "Alternatively, open index.html directly in your browser."
        exit 1
    fi
}

# Deploy to Hub
deploy_to_hub() {
    echo -e "${BLUE}${ROCKET} Deploying to hub.wavelength.com...${NC}"

    # Check if we're in a game directory
    if [ ! -f "game.json" ]; then
        echo -e "${RED}${WARNING} No game.json found. Are you in a game directory?${NC}"
        exit 1
    fi

    # Validate first
    validate_game

    # Package the game
    echo -e "${BLUE}Packaging game...${NC}"
    package_game

    # Get game info from game.json
    local game_title=$(grep -o '"title"[[:space:]]*:[[:space:]]*"[^"]*"' game.json | sed 's/.*"\([^"]*\)".*/\1/')
    local game_zip="${game_title// /-}-$(date +%Y%m%d).zip"

    echo ""
    echo -e "${GREEN}${CHECK} Game packaged successfully!${NC}"
    echo -e "${CYAN}Package: packaged-games/$game_zip${NC}"
    echo ""
    echo -e "${YELLOW}${ROCKET} Ready for deployment!${NC}"
    echo ""
    echo -e "${BLUE}Deployment Options:${NC}"
    echo -e "  ${GREEN}Option 1 (Recommended):${NC} Upload to hub.wavelength.com/upload"
    echo -e "  ${GREEN}Option 2:${NC} Use the automated deployment API (coming soon)"
    echo ""
    echo -e "${CYAN}Visit: https://hub.wavelength.com/upload${NC}"
    echo -e "${CYAN}Upload: packaged-games/$game_zip${NC}"
    echo ""
}

# Package game for sharing
package_game() {
    echo -e "${BLUE}${TOOLS} Packaging Wavelength cozy game...${NC}"

    # Check if we're in a game directory
    if [ ! -f "game.json" ]; then
        echo -e "${RED}${WARNING} No game.json found. Are you in a game directory?${NC}"
        exit 1
    fi

    # Create package directory
    mkdir -p packaged-games

    # Get game title for filename
    local game_title=$(grep -o '"title"[[:space:]]*:[[:space:]]*"[^"]*"' game.json | sed 's/.*"\([^"]*\)".*/\1/')
    local clean_title=$(echo "$game_title" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9]/-/g' | sed 's/--*/-/g' | sed 's/^-\|-$//g')
    local timestamp=$(date +%Y%m%d-%H%M)
    local package_name="${clean_title}-${timestamp}"
    local package_dir="packaged-games/$package_name"

    # Clean up any existing package
    rm -rf "$package_dir"

    # Copy game files
    echo -e "${BLUE}Copying game files...${NC}"
    mkdir -p "$package_dir"

    # Copy essential files
    cp index.html "$package_dir/" 2>/dev/null || echo "Warning: index.html not found"
    cp game.json "$package_dir/" 2>/dev/null || echo "Warning: game.json not found"
    cp -r css "$package_dir/" 2>/dev/null || echo "Warning: css/ directory not found"
    cp -r js "$package_dir/" 2>/dev/null || echo "Warning: js/ directory not found"
    cp README.md "$package_dir/" 2>/dev/null || echo "Info: README.md not found (optional)"

    # Copy assets if they exist
    if [ -d "assets" ]; then
        cp -r assets "$package_dir/"
    fi

    # Create deployment guide
    cat > "$package_dir/DEPLOY.md" << 'EOF'
# 🚀 Deployment Guide

## Quick Deploy to Wavelength Hub
1. Visit hub.wavelength.com/upload
2. Drag and drop the ZIP file of this folder
3. Fill in any additional details
4. Click "Publish Game"

## Test Locally
1. Open index.html in a web browser
2. Or run: python3 -m http.server 8000

## File Overview
- index.html - Main game page
- game.json - Game configuration
- css/ - Styling
- js/ - Game logic
- assets/ - Images/sounds (if any)

Happy gaming! 🎮✨
EOF

    # Create ZIP file
    echo -e "${BLUE}Creating ZIP archive...${NC}"
    cd packaged-games
    zip -r "${package_name}.zip" "$package_name" > /dev/null 2>&1
    cd ..

    echo -e "${GREEN}${CHECK} Package created: packaged-games/${package_name}.zip${NC}"
}

# Validate game meets Hub requirements
validate_game() {
    echo -e "${BLUE}${TOOLS} Validating VIBE game...${NC}"

    local errors=0
    local warnings=0

    # Check required files
    if [ ! -f "index.html" ]; then
        echo -e "${RED}${WARNING} Missing: index.html${NC}"
        errors=$((errors + 1))
    fi

    if [ ! -f "game.json" ]; then
        echo -e "${RED}${WARNING} Missing: game.json${NC}"
        errors=$((errors + 1))
    else
        # Validate JSON syntax
        if ! python3 -m json.tool game.json > /dev/null 2>&1; then
            echo -e "${RED}${WARNING} Invalid JSON syntax in game.json${NC}"
            errors=$((errors + 1))
        fi

        # Check required fields
        if ! grep -q '"title"' game.json; then
            echo -e "${RED}${WARNING} Missing 'title' in game.json${NC}"
            errors=$((errors + 1))
        fi

        if ! grep -q '"description"' game.json; then
            echo -e "${YELLOW}${WARNING} Missing 'description' in game.json (recommended)${NC}"
            warnings=$((warnings + 1))
        fi
    fi

    if [ ! -d "css" ]; then
        echo -e "${RED}${WARNING} Missing: css/ directory${NC}"
        errors=$((errors + 1))
    fi

    if [ ! -d "js" ]; then
        echo -e "${RED}${WARNING} Missing: js/ directory${NC}"
        errors=$((errors + 1))
    fi

    # Check for mobile responsiveness (basic check)
    if [ -f "css/styles.css" ]; then
        if ! grep -q "@media" css/styles.css; then
            echo -e "${YELLOW}${WARNING} No responsive CSS found (recommended for mobile)${NC}"
            warnings=$((warnings + 1))
        fi
    fi

    # Summary
    echo ""
    if [ $errors -eq 0 ]; then
        echo -e "${GREEN}${CHECK} Validation passed!${NC}"
        if [ $warnings -gt 0 ]; then
            echo -e "${YELLOW}${warnings} warning(s) found (game will still work)${NC}"
        fi
        return 0
    else
        echo -e "${RED}${WARNING} Validation failed with $errors error(s)${NC}"
        if [ $warnings -gt 0 ]; then
            echo -e "${YELLOW}Also found $warnings warning(s)${NC}"
        fi
        return 1
    fi
}

# Show available themes
show_themes() {
    print_header
    echo -e "${BLUE}Available Wavelength Cozy Themes:${NC}"
    echo ""
    echo -e "${GREEN}🌲 forest${NC}      - Green, natural, peaceful"
    echo -e "${BLUE}🌊 ocean${NC}       - Blue, calming, aquatic"
    echo -e "${YELLOW}🌅 sunset${NC}      - Orange/pink, warm, cozy"
    echo -e "${PURPLE}🌙 midnight${NC}    - Purple/dark, mysterious"
    echo -e "${CYAN}🌸 spring${NC}      - Light green, fresh, bright"
    echo ""
    echo -e "${YELLOW}Usage in game.json:${NC}"
    echo -e '  "theme": { "name": "forest" }'
    echo ""
}

# Show example configurations
show_examples() {
    print_header
    echo -e "${BLUE}Wavelength Cozy Game Examples:${NC}"
    echo ""
    echo -e "${GREEN}🏖️  Beach Collection Game:${NC}"
    echo '{
  "title": "Peaceful Beach Explorer",
  "theme": { "name": "ocean" },
  "gameplay": {
    "itemsToCollect": [
      {
        "name": "Rainbow Shell",
        "emoji": "🐚",
        "rarity": "common",
        "points": 10
      }
    ]
  }
}'
    echo ""
    echo -e "${GREEN}🌲 Forest Adventure:${NC}"
    echo '{
  "title": "Mushroom Forest Walk",
  "theme": { "name": "forest" },
  "gameplay": {
    "itemsToCollect": [
      {
        "name": "Magic Mushroom",
        "emoji": "🍄",
        "rarity": "rare",
        "points": 50
      }
    ]
  }
}'
    echo ""
}

# AI assistant setup instructions
show_ai_setup() {
    print_header
    echo -e "${BLUE}${MAGIC} AI Assistant Setup for Wavelength Cozy Game SDK${NC}"
    echo ""
    echo -e "${GREEN}Quick Setup (Copy & Paste to any AI):${NC}"
    echo ""
    echo -e "${CYAN}I'm using the Wavelength Cozy Game SDK to create revenue-generating cozy games. I build peaceful, mobile-friendly games for hub.wavelength.com that generate passive income through integrated badge merchandise systems (35% creator revenue share). Please help me create games using cozy themes with emoji-based collectible items and relaxing aesthetics.${NC}"
    echo ""
    echo -e "${GREEN}For Detailed Help:${NC}"
    echo -e "  1. Upload AI-CONTEXT.md from the SDK to your AI assistant"
    echo -e "  2. Check ai-prompts/ folder for specific use cases"
    echo -e "  3. Ask for help with game.json configuration"
    echo ""
    echo -e "${YELLOW}Example AI Request:${NC}"
    echo -e "${CYAN}\"Help me create a cozy beach collection game using the Wavelength Cozy Game SDK. I want players to collect seashells with different rarities on a peaceful shoreline that generates badge merchandise revenue.\"${NC}"
    echo ""
}

# Main command dispatcher
main() {
    case "${1:-help}" in
        "new")
            create_new_game "$2" "$3"
            ;;
        "test")
            start_test_server "$2"
            ;;
        "deploy")
            deploy_to_hub
            ;;
        "package")
            package_game
            ;;
        "validate")
            validate_game
            ;;
        "themes")
            show_themes
            ;;
        "examples")
            show_examples
            ;;
        "ai-setup")
            if command -v setup_ai_integration >/dev/null 2>&1; then
                setup_ai_integration "$2" "$3"
            else
                show_ai_setup
            fi
            ;;
        "ai-create")
            if command -v create_game_with_ai >/dev/null 2>&1; then
                create_game_with_ai "$2"
            else
                echo -e "${RED}${WARNING} AI integration not available. Run: ./vibe-cli.sh ai-setup${NC}"
                exit 1
            fi
            ;;
        "ai-refine")
            if command -v refine_with_ai >/dev/null 2>&1; then
                refine_with_ai "$2"
            else
                echo -e "${RED}${WARNING} AI integration not available. Run: ./vibe-cli.sh ai-setup${NC}"
                exit 1
            fi
            ;;
        "creative")
            if [ -f "$SCRIPT_DIR/ai-creative-workflow.sh" ]; then
                "$SCRIPT_DIR/ai-creative-workflow.sh" "$2"
            else
                echo -e "${RED}${WARNING} Creative workflow script not found${NC}"
                exit 1
            fi
            ;;
        "help"|"--help"|"-h")
            print_help
            ;;
        *)
            echo -e "${RED}${WARNING} Unknown command: $1${NC}"
            print_help
            exit 1
            ;;
    esac
}

# Run main function with all arguments
main "$@"