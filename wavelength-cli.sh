#!/bin/bash

# Wavelength Cozy Game SDK CLI - Professional Game Development Toolkit
# Create cozy games with enterprise-grade tools

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(pwd)"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
NC='\033[0m' # No Color

# Icons
CHECKMARK="✅"
WARNING="⚠️"
INFO="ℹ️"
ROCKET="🚀"
TOOLS="🛠️"
GAME="🎮"

print_header() {
    echo -e "${BLUE}"
    echo "🌊 Wavelength Cozy Game SDK"
    echo "Professional Game Development Toolkit"
    echo "====================================="
    echo -e "${NC}"
}

print_help() {
    print_header
    echo -e "${WHITE}USAGE:${NC}"
    echo -e "  ./wavelength-cli.sh <command> [options]"
    echo ""
    echo -e "${WHITE}COMMANDS:${NC}"
    echo -e "  ${GREEN}new${NC} <name> [template]     Create new game project"
    echo -e "  ${GREEN}test${NC} [game-dir]          Test game locally"
    echo -e "  ${GREEN}deploy${NC}                   Deploy to Wavelength Hub"
    echo -e "  ${GREEN}validate${NC}                 Validate game configuration"
    echo -e "  ${GREEN}clean${NC}                    Clean build artifacts"
    echo -e "  ${GREEN}help${NC}                     Show this help message"
    echo ""
    echo -e "${WHITE}EXAMPLES:${NC}"
    echo -e "  ./wavelength-cli.sh new beach-adventure simple-collector"
    echo -e "  ./wavelength-cli.sh test beach-adventure"
    echo -e "  ./wavelength-cli.sh deploy"
    echo ""
}

# Create new game project
cmd_new() {
    local game_name="$1"
    local template="${2:-simple-collector}"
    
    if [[ -z "$game_name" ]]; then
        echo -e "${RED}${WARNING} Error: Game name required${NC}"
        echo "Usage: ./wavelength-cli.sh new <game-name> [template]"
        return 1
    fi
    
    echo -e "${BLUE}${TOOLS} Creating new game: ${WHITE}$game_name${NC}"
    
    # Check if template exists
    local template_dir="$SCRIPT_DIR/templates/$template"
    if [[ ! -d "$template_dir" ]]; then
        echo -e "${RED}${WARNING} Template '$template' not found${NC}"
        echo "Available templates:"
        ls "$SCRIPT_DIR/templates/" 2>/dev/null || echo "  No templates available"
        return 1
    fi
    
    # Create game directory
    if [[ -d "$game_name" ]]; then
        echo -e "${RED}${WARNING} Directory '$game_name' already exists${NC}"
        return 1
    fi
    
    echo -e "${BLUE}📁 Copying template files...${NC}"
    cp -r "$template_dir" "$game_name"
    
    # Update game.json if it exists
    if [[ -f "$game_name/game.json" ]]; then
        echo -e "${BLUE}⚙️ Configuring game settings...${NC}"
        # Update title in game.json
        if command -v jq >/dev/null 2>&1; then
            tmp_file=$(mktemp)
            jq --arg title "$game_name" '.title = $title' "$game_name/game.json" > "$tmp_file" && mv "$tmp_file" "$game_name/game.json"
        fi
    fi
    
    echo -e "${GREEN}${CHECKMARK} Game created successfully!${NC}"
    echo ""
    echo -e "${WHITE}Next steps:${NC}"
    echo -e "  1. ${BLUE}cd $game_name${NC}"
    echo -e "  2. ${BLUE}Edit game.json to customize your game${NC}"
    echo -e "  3. ${BLUE}../wavelength-cli.sh test${NC} - Test your game"
    echo -e "  4. ${BLUE}../wavelength-cli.sh deploy${NC} - Deploy to Hub"
    echo ""
}

# Test game locally
cmd_test() {
    local game_dir="${1:-.}"
    
    echo -e "${BLUE}${GAME} Testing game...${NC}"
    
    if [[ ! -f "$game_dir/index.html" ]]; then
        echo -e "${RED}${WARNING} No index.html found in '$game_dir'${NC}"
        echo ""
        echo -e "${WHITE}Usage:${NC}"
        echo -e "  From game directory: ${BLUE}../wavelength-cli.sh test${NC}"
        echo -e "  From SDK root: ${BLUE}./wavelength-cli.sh test <game-directory>${NC}"
        return 1
    fi
    
    # Start local server
    echo -e "${BLUE}🌐 Starting local server...${NC}"
    echo -e "${GREEN}${CHECKMARK} Game running at: ${WHITE}http://localhost:8080${NC}"
    echo -e "${YELLOW}${INFO} Press Ctrl+C to stop server${NC}"
    echo ""
    
    cd "$game_dir"
    
    # Try different Python versions
    if command -v python3 >/dev/null 2>&1; then
        python3 -m http.server 8080 2>/dev/null || python3 -m SimpleHTTPServer 8080
    elif command -v python >/dev/null 2>&1; then
        python -m http.server 8080 2>/dev/null || python -m SimpleHTTPServer 8080
    else
        echo -e "${RED}${WARNING} Python not found. Please install Python or use another web server${NC}"
        return 1
    fi
}

# Validate game
cmd_validate() {
    echo -e "${BLUE}${TOOLS} Validating game configuration...${NC}"
    
    local errors=0
    
    # Check for required files
    if [[ ! -f "index.html" ]]; then
        echo -e "${RED}${WARNING} Missing index.html${NC}"
        ((errors++))
    fi
    
    if [[ ! -f "game.json" ]]; then
        echo -e "${RED}${WARNING} Missing game.json${NC}"
        ((errors++))
    fi
    
    # Validate game.json if it exists
    if [[ -f "game.json" ]] && command -v jq >/dev/null 2>&1; then
        if ! jq empty game.json >/dev/null 2>&1; then
            echo -e "${RED}${WARNING} Invalid JSON in game.json${NC}"
            ((errors++))
        else
            echo -e "${GREEN}${CHECKMARK} game.json is valid JSON${NC}"
        fi
    fi
    
    if [[ $errors -eq 0 ]]; then
        echo -e "${GREEN}${CHECKMARK} Game validation passed!${NC}"
        return 0
    else
        echo -e "${RED}${WARNING} Game validation failed with $errors error(s)${NC}"
        return 1
    fi
}

# Deploy to Wavelength Hub
cmd_deploy() {
    echo -e "${BLUE}${ROCKET} Deploying to Wavelength Hub...${NC}"
    
    # Validate first
    if ! cmd_validate; then
        echo -e "${RED}${WARNING} Cannot deploy - validation failed${NC}"
        return 1
    fi
    
    echo -e "${YELLOW}${INFO} Deploy functionality coming soon!${NC}"
    echo -e "${BLUE}For now, your game is ready to upload manually to:${NC}"
    echo -e "${WHITE}https://hub.wavelengthlore.com${NC}"
}

# Clean build artifacts
cmd_clean() {
    echo -e "${BLUE}🧹 Cleaning build artifacts...${NC}"
    
    # Remove common build/debug files
    find . -name "*.log" -type f -delete 2>/dev/null || true
    find . -name ".DS_Store" -type f -delete 2>/dev/null || true
    find . -name "Thumbs.db" -type f -delete 2>/dev/null || true
    
    echo -e "${GREEN}${CHECKMARK} Cleanup complete!${NC}"
}

# Main command dispatcher
main() {
    case "${1:-help}" in
        "new")
            shift
            cmd_new "$@"
            ;;
        "test")
            shift
            cmd_test "$@"
            ;;
        "validate")
            cmd_validate
            ;;
        "deploy")
            cmd_deploy
            ;;
        "clean")
            cmd_clean
            ;;
        "help"|"--help"|"-h")
            print_help
            ;;
        *)
            echo -e "${RED}${WARNING} Unknown command: $1${NC}"
            echo ""
            print_help
            exit 1
            ;;
    esac
}

# Run main function
main "$@"