#!/bin/bash

# 🎨 Wavelength Cozy Game SDK - AI Creative Workflow
# Natural game creation with intelligent SDK integration
# Create unique cozy games that generate real revenue

set -e

# Check dependencies
command -v jq >/dev/null 2>&1 || { echo "❌ jq is required but not installed. Install with: brew install jq"; exit 1; }

# Configuration
OPENAI_API_URL="https://api.openai.com/v1/chat/completions"
BASE_DIR="$(pwd)"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Check for API key (prioritize Anthropic if available)
if [[ -n "$ANTHROPIC_API_KEY" ]]; then
    AI_PROVIDER="anthropic"
    AI_API_KEY="$ANTHROPIC_API_KEY"
    AI_API_URL="https://api.anthropic.com/v1/messages"
elif [[ -n "$OPENAI_API_KEY" ]]; then
    AI_PROVIDER="openai"
    AI_API_KEY="$OPENAI_API_KEY"
    AI_API_URL="https://api.openai.com/v1/chat/completions"
else
    echo "❌ Error: No API key found"
    echo "💡 Set one with:"
    echo "  export ANTHROPIC_API_KEY='your-claude-key'"
    echo "  export OPENAI_API_KEY='your-openai-key'"
    exit 1
fi

# Function to call AI API (supports both OpenAI and Anthropic)
call_ai_api() {
    local prompt="$1"
    local response_file="$2"
    
    echo "🤖 Calling $AI_PROVIDER API..."
    
    # Escape the prompt for JSON
    local escaped_prompt=$(echo "$prompt" | jq -Rs .)
    
    if [[ "$AI_PROVIDER" == "anthropic" ]]; then
        curl -s "$AI_API_URL" \
            -H "Content-Type: application/json" \
            -H "x-api-key: $AI_API_KEY" \
            -H "anthropic-version: 2023-06-01" \
            -d "{
                \"model\": \"claude-3-5-sonnet-20241022\",
                \"max_tokens\": 4000,
                \"temperature\": 0.8,
                \"system\": \"You are an expert cozy game developer creating games for the Wavelength Cozy Game SDK. Create delightful, peaceful games using HTML, CSS, and JavaScript that generate revenue through integrated badge systems.\",
                \"messages\": [
                    {
                        \"role\": \"user\",
                        \"content\": $escaped_prompt
                    }
                ]
            }" > "$response_file"
    else
        curl -s "$AI_API_URL" \
            -H "Content-Type: application/json" \
            -H "Authorization: Bearer $AI_API_KEY" \
            -d "{
                \"model\": \"gpt-4\",
                \"messages\": [
                    {
                        \"role\": \"system\",
                        \"content\": \"You are an expert cozy game developer creating games for the Wavelength Cozy Game SDK. Create delightful, peaceful games using HTML, CSS, and JavaScript that generate revenue through integrated badge systems.\"
                    },
                    {
                        \"role\": \"user\",
                        \"content\": $escaped_prompt
                    }
                ],
                \"max_tokens\": 4000,
                \"temperature\": 0.8
            }" > "$response_file"
    fi
    
    if [[ $? -eq 0 ]]; then
        echo "✅ API call successful"
        return 0
    else
        echo "❌ API call failed"
        return 1
    fi
}

# Function to extract content from API response
extract_api_content() {
    local response_file="$1"
    
    # Check if response contains an error
    if jq -e '.error' "$response_file" >/dev/null 2>&1; then
        echo "❌ API Error:"
        jq -r '.error.message' "$response_file"
        return 1
    fi
    
    # Extract the content based on provider
    if [[ "$AI_PROVIDER" == "anthropic" ]]; then
        jq -r '.content[0].text' "$response_file" 2>/dev/null || {
            echo "❌ Failed to parse Anthropic API response"
            return 1
        }
    else
        jq -r '.choices[0].message.content' "$response_file" 2>/dev/null || {
            echo "❌ Failed to parse OpenAI API response"
            return 1
        }
    fi
}

# Function to create a standalone cozy game
create_cozy_game() {
    local game_idea="$1"
    local game_dir="$2"
    
    echo "🎨 Creating standalone cozy game: $game_idea"
    
    # Create game directory
    mkdir -p "$game_dir"
    cd "$game_dir"
    
    # Step 1: Create the game concept and structure
    local concept_prompt="Create a complete, cozy, relaxing HTML5 game based on this idea: '$game_idea'

Please create a simple but engaging cozy game with these characteristics:
- Single HTML file with embedded CSS and JavaScript
- Peaceful, non-violent gameplay mechanics
- Beautiful, calming visual design with CSS gradients/effects
- Simple click/touch interactions
- Satisfying collection or creation mechanics
- Gentle sound effects (using Web Audio API)
- Responsive design that works on mobile
- No external dependencies
- Complete and immediately playable

IMPORTANT: Include proper HTML5 structure with:
- <!DOCTYPE html>
- <meta charset=\"UTF-8\">
- <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">
- <title> tag

Focus on creating something genuinely fun and relaxing. Be creative with the visual design and interactions. The game should feel polished and delightful.

Provide the complete HTML file with all CSS and JavaScript included."
    
    local response_file="api_response_concept.json"
    
    if call_ai_api "$concept_prompt" "$response_file"; then
        local game_content=$(extract_api_content "$response_file")
        
        if [[ -n "$game_content" ]]; then
            # Extract HTML content (remove markdown formatting if present)
            echo "$game_content" | sed '/```html/,/```/!d; /```/d' > index.html || \
            echo "$game_content" > index.html
            
            # Ensure proper UTF-8 encoding and HTML5 structure
            if ! grep -q "charset=.UTF-8" index.html; then
                # Add charset if missing
                sed -i '' 's/<head>/<head>\
    <meta charset="UTF-8">/' index.html
            fi
            
            if ! grep -q "viewport" index.html; then
                # Add viewport if missing
                sed -i '' 's/<meta charset="UTF-8">/<meta charset="UTF-8">\
    <meta name="viewport" content="width=device-width, initial-scale=1.0">/' index.html
            fi
            
            echo "✅ Created standalone game: index.html"
        else
            echo "❌ Failed to extract game content"
            return 1
        fi
    else
        echo "❌ Failed to create game concept"
        return 1
    fi
    
    # Step 2: Create game.json config by analyzing the created game
    local analysis_prompt="I've created a cozy game and need to generate a game.json configuration file for the WavelengthHub Cozy Game SDK.

Here's the game code:
$(cat index.html)

Please analyze this game and create a detailed game.json configuration file with these specifications:

{
  \"title\": \"Game Title\",
  \"description\": \"Short game description\",
  \"version\": \"1.0.0\",
  \"template\": \"standalone\",
  \"theme\": {
    \"name\": \"theme_name\",
    \"primaryColor\": \"#color\",
    \"secondaryColor\": \"#color\",
    \"backgroundColor\": \"#color\",
    \"textColor\": \"#color\",
    \"accentColor\": \"#color\",
    \"font\": \"Font Family\"
  },
  \"gameplay\": {
    \"type\": \"collection|creation|puzzle\",
    \"difficulty\": \"relaxed\",
    \"itemsToCollect\": [
      {
        \"id\": \"item_id\",
        \"name\": \"Item Name\",
        \"emoji\": \"📦\",
        \"description\": \"Item description\",
        \"rarity\": \"common|uncommon|rare|epic|legendary\",
        \"points\": 10,
        \"spawnRate\": 0.3
      }
    ]
  },
  \"badges\": {
    \"enabled\": true,
    \"insigniaOfMerit\": [
      {
        \"id\": \"badge_id\",
        \"name\": \"Badge Name\",
        \"description\": \"Achievement description\",
        \"image\": \"🏆\",
        \"rarity\": \"common\",
        \"trigger\": {
          \"type\": \"items_collected\",
          \"threshold\": 10
        }
      }
    ]
  }
}

Extract colors, theme, and mechanics from the actual game code. Create 5-8 meaningful badges that match the game's progression. Respond with ONLY the JSON, no other text."
    
    response_file="api_response_config.json"
    
    if call_ai_api "$analysis_prompt" "$response_file"; then
        local config_content=$(extract_api_content "$response_file")
        
        if [[ -n "$config_content" ]]; then
            # Clean up the JSON (remove markdown formatting if present)
            echo "$config_content" | sed '/```json/,/```/!d; /```/d' > game.json || \
            echo "$config_content" > game.json
            
            # Validate JSON
            if jq empty game.json 2>/dev/null; then
                echo "✅ Created game.json configuration"
            else
                echo "⚠️  game.json validation failed, but file created"
            fi
        else
            echo "❌ Failed to extract config content"
            return 1
        fi
    else
        echo "❌ Failed to create game config"
        return 1
    fi
    
    # Step 3: Integrate badge system
    echo "🏆 Integrating badge system..."
    
    # Copy badge helper files
    cp "$BASE_DIR/dev-kit/badge-helper.js" ./ 2>/dev/null || echo "⚠️  badge-helper.js not found"
    
    # Create integration script
    local integration_prompt="I have a standalone cozy game that needs WavelengthHub badge system integration.

Game HTML file:
$(cat index.html)

Game configuration:
$(cat game.json)

Badge helper functions are available in badge-helper.js (assume it exists).

Please modify the HTML file to:
1. Add badge system script tags before closing </body>
2. Initialize badge tracking in the game's initialization
3. Add badge triggers for appropriate game events (collecting items, scoring points, achievements)
4. Use these badge functions:
   - initializeBadgeSystem()
   - checkAndAwardBadge(badgeId, playerData)
   - trackGameProgress(eventType, data)

Keep all existing game functionality intact. Only add badge integration hooks. Return the complete modified HTML file."
    
    response_file="api_response_integration.json"
    
    if call_ai_api "$integration_prompt" "$response_file"; then
        local integrated_content=$(extract_api_content "$response_file")
        
        if [[ -n "$integrated_content" ]]; then
            # Backup original
            cp index.html index_original.html
            
            # Apply integration
            echo "$integrated_content" | sed '/```html/,/```/!d; /```/d' > index.html || \
            echo "$integrated_content" > index.html
            
            echo "✅ Integrated badge system"
        else
            echo "❌ Failed to integrate badge system"
            return 1
        fi
    else
        echo "❌ Failed to create badge integration"
        return 1
    fi
    
    # Create documentation
    cat > README.md << EOF
# $(jq -r '.title' game.json 2>/dev/null || echo "Cozy Game")

$(jq -r '.description' game.json 2>/dev/null || echo "A delightful cozy game experience")

## Files
- \`index.html\` - Complete game (integrated with badge system)
- \`index_original.html\` - Original standalone version
- \`game.json\` - WavelengthHub configuration
- \`badge-helper.js\` - Badge system integration

## How to Play
Open \`index.html\` in a web browser and enjoy!

## Development Process
This game was created using the Wavelength Cozy Game SDK Creative Workflow:
1. ✅ AI created standalone cozy game
2. ✅ Generated SDK configuration from game analysis
3. ✅ Integrated badge system while preserving original gameplay

Generated on: $(date)
EOF
    
    echo "📝 Created README.md"
    
    # Test the game
    echo "🧪 Testing integrated game..."
    
    if [[ -f "index.html" && -f "game.json" ]]; then
        echo "✅ All files created successfully!"
        echo ""
        echo "🎮 Game created in: $game_dir"
        echo "📂 Files:"
        ls -la
        echo ""
        echo "🚀 To test: ./vibe-cli.sh test $(basename "$game_dir")"
        return 0
    else
        echo "❌ Missing required files"
        return 1
    fi
    
    cd "$BASE_DIR"
}

# Main function
main() {
    if [[ $# -eq 0 ]]; then
        echo "🎨 Wavelength Cozy Game SDK - AI Creative Workflow"
        echo ""
        echo "Usage: $0 \"game idea description\""
        echo ""
        echo "Example: $0 \"peaceful garden where I grow magical flowers\""
        echo "         $0 \"cozy lighthouse where I guide ships safely home\""
        echo ""
        echo "This workflow creates revenue-generating cozy games:"
        echo "1. 🎨 AI creates a complete standalone cozy game"
        echo "2. 📝 Analyzes the game to generate Wavelength SDK configuration"
        echo "3. 🏆 Integrates badge system for merchandise revenue (35% creator share)"
        echo "4. 🧪 Creates testable WavelengthHub-compatible game"
        exit 1
    fi
    
    local game_idea="$1"
    local game_name=$(echo "$game_idea" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9 ]//g' | tr ' ' '-' | sed 's/--*/-/g' | head -c 30)
    local game_dir="${game_name}-${TIMESTAMP}"
    
    echo "🎨 Starting Wavelength Cozy Game SDK Creative Workflow"
    echo "💡 Idea: $game_idea"
    echo "📁 Directory: $game_dir"
    echo ""
    
    if create_cozy_game "$game_idea" "$game_dir"; then
        echo ""
        echo "🌟 SUCCESS! Cozy game created and integrated!"
        echo "📂 Location: $game_dir"
        echo ""
        echo "Next steps:"
        echo "  🎮 Test: ./vibe-cli.sh test $game_dir"
        echo "  🌐 Play: Open $game_dir/index.html in browser"
        echo "  📝 Edit: Modify $game_dir/index.html for customization"
    else
        echo ""
        echo "❌ Failed to create cozy game"
        exit 1
    fi
}

# Run main function
main "$@"