#!/bin/bash

# VIBE Coding AI Assistant Integration
# Extends vibe-cli.sh with AI-powered game creation

AI_CONFIG_FILE="$HOME/.vibe-ai-config"
AI_PROVIDER=""
AI_API_KEY=""

# Load AI configuration
load_ai_config() {
    if [ -f "$AI_CONFIG_FILE" ]; then
        source "$AI_CONFIG_FILE"
    fi
}

# Setup AI integration
setup_ai_integration() {
    local provider="$1"
    local api_key="$2"
    
    echo "🤖 Setting up AI integration..."
    echo "Provider: $provider"
    
    # Validate provider
    case "$provider" in
        "openai"|"anthropic"|"google"|"local")
            echo "AI_PROVIDER=\"$provider\"" > "$AI_CONFIG_FILE"
            echo "AI_API_KEY=\"$api_key\"" >> "$AI_CONFIG_FILE"
            echo "✅ AI integration configured!"
            echo ""
            echo "🎮 Now you can create games with AI:"
            echo "   ./vibe-cli.sh ai-create \"I want a cozy forest collection game\""
            ;;
        *)
            echo "❌ Unsupported provider. Use: openai, anthropic, google, or local"
            exit 1
            ;;
    esac
}

# Create game with AI assistance
create_game_with_ai() {
    local user_description="$1"
    
    if [ -z "$user_description" ]; then
        echo "❌ Please describe your game idea"
        echo "Example: ./vibe-cli.sh ai-create \"I want a cozy beach collection game\""
        exit 1
    fi
    
    load_ai_config
    
    if [ -z "$AI_PROVIDER" ] || [ -z "$AI_API_KEY" ]; then
        echo "❌ AI not configured. Run: ./vibe-cli.sh ai-setup <provider> <api-key>"
        exit 1
    fi
    
    echo "🤖 Creating your game with AI..."
    echo "💭 User idea: $user_description"
    echo ""
    
    # Create the AI prompt with full SDK context
    local prompt="You are a VIBE Coding Game Designer. VIBE stands for Visual, Intuitive, Building blocks, Experience.

CONTEXT: You create cozy games for hub.wavelength.com that generate passive income through badge-driven merchandise sales. Players earn badges, then buy merch featuring THEIR earned badges. Creators get 35% of sales.

USER REQUEST: \"$user_description\"

ANALYZE & CREATE a unique game:
1. What SPECIFIC environment? (enchanted forest vs dark forest vs bamboo forest)
2. What would players ACTUALLY collect there? (be specific, not generic)
3. What EMOTIONS should it evoke? (wonder, peace, discovery, etc.)
4. What makes THIS concept special?

GENERATE this EXACT JSON structure (required by VIBE SDK):

{
  \"title\": \"[Creative, specific title]\",
  \"description\": \"[Immersive description of the experience]\", 
  \"version\": \"1.0.0\",
  \"template\": \"simple-collector\",

  \"theme\": {
    \"name\": \"[forest|ocean|sunset|midnight|spring]\",
    \"primaryColor\": \"[Hex color matching environment]\",
    \"secondaryColor\": \"[Complementary hex color]\", 
    \"backgroundColor\": \"[Light hex for background]\",
    \"textColor\": \"[Dark hex for readability]\",
    \"accentColor\": \"[Bright hex for highlights]\",
    \"font\": \"[CSS font family]\"
  },

  \"gameplay\": {
    \"worldSize\": \"medium\",
    \"difficulty\": \"relaxed\",
    \"movementSpeed\": \"normal\",
    \"collectionGoal\": 50,

    \"itemsToCollect\": [
      {
        \"id\": \"[snake_case_id]\",
        \"name\": \"[Specific Item Name]\",
        \"emoji\": \"[Perfect emoji]\",
        \"description\": \"[Atmospheric, poetic description]\",
        \"rarity\": \"common\",
        \"points\": 5,
        \"spawnRate\": 0.4,
        \"soundEffect\": \"gentle_chime\",
        \"animation\": \"gentle_sway\"
      },
      {
        \"id\": \"[snake_case_id]\",
        \"name\": \"[Different Specific Item]\", 
        \"emoji\": \"[Different emoji]\",
        \"description\": \"[Atmospheric description]\",
        \"rarity\": \"common\",
        \"points\": 8,
        \"spawnRate\": 0.35,
        \"soundEffect\": \"soft_pop\",
        \"animation\": \"gentle_bounce\"
      },
      {
        \"id\": \"[snake_case_id]\",
        \"name\": \"[Uncommon Item Name]\",
        \"emoji\": \"[Fitting emoji]\", 
        \"description\": \"[More special description]\",
        \"rarity\": \"uncommon\",
        \"points\": 20,
        \"spawnRate\": 0.15,
        \"soundEffect\": \"magical_chime\",
        \"animation\": \"sparkle\"
      },
      {
        \"id\": \"[snake_case_id]\",
        \"name\": \"[Rare Item Name]\",
        \"emoji\": \"[Special emoji]\",
        \"description\": \"[Mystical description]\", 
        \"rarity\": \"rare\",
        \"points\": 75,
        \"spawnRate\": 0.05,
        \"soundEffect\": \"ethereal_bell\",
        \"animation\": \"magical_glow\"
      },
      {
        \"id\": \"[snake_case_id]\",
        \"name\": \"[Legendary Item Name]\",
        \"emoji\": \"[Extraordinary emoji]\",
        \"description\": \"[Legendary, emotional description]\",
        \"rarity\": \"legendary\", 
        \"points\": 200,
        \"spawnRate\": 0.01,
        \"soundEffect\": \"ethereal_bell\",
        \"animation\": \"magical_glow\"
      }
    ],

    \"environments\": [
      {
        \"name\": \"[Environment 1 Name]\",
        \"background\": \"[background_type]\",
        \"music\": \"peaceful_acoustic\",
        \"spawnBias\": {}
      }
    ]
  },

  \"ui\": {
    \"showScore\": true,
    \"showItemCount\": true,
    \"showProgress\": true,
    \"collectionPanelStyle\": \"cozy\",
    \"buttonStyle\": \"rounded\",
    \"enableSounds\": true,
    \"enableMusic\": true
  },

  \"accessibility\": {
    \"highContrast\": false,
    \"largeText\": false,
    \"colorBlindFriendly\": true,
    \"keyboardNavigation\": true,
    \"screenReaderSupport\": true
  },

  \"customization\": {
    \"allowPlayerName\": true,
    \"customizableColors\": true,
    \"customizableMusic\": true,
    \"unlockableThemes\": [\"sunset\", \"ocean\", \"midnight\"]
  },

  \"badges\": {
    \"enabled\": true,
    \"apiEndpoint\": \"https://hub.wavelength.com/api/games\",
    \"insigniaOfMerit\": [
      {
        \"id\": \"first_discovery\",
        \"name\": \"[Theme-specific Badge Name]\",
        \"description\": \"[Personal, emotional description that would look great on a t-shirt]\",
        \"image\": \"[Badge emoji]\",
        \"rarity\": \"common\",
        \"trigger\": { \"type\": \"items_collected\", \"threshold\": 1 },
        \"merch\": { \"enabled\": true, \"suggested_products\": [\"t-shirt\", \"sticker\", \"mug\"], \"placement_hints\": \"Works great on front chest, small corner designs\" }
      },
      {
        \"id\": \"dedicated_collector\",
        \"name\": \"[Theme-specific Achievement Name]\", 
        \"description\": \"[Achievement description that tells a story]\",
        \"image\": \"[Achievement emoji]\",
        \"rarity\": \"uncommon\",
        \"trigger\": { \"type\": \"items_collected\", \"threshold\": 15 },
        \"merch\": { \"enabled\": true, \"suggested_products\": [\"t-shirt\", \"hoodie\", \"canvas_print\"], \"placement_hints\": \"Beautiful as large back design or artistic front print\" }
      },
      {
        \"id\": \"rare_hunter\",
        \"name\": \"[Theme-specific Rare Hunter Name]\",
        \"description\": \"[Description of finding rare items in this world]\", 
        \"image\": \"[Rare hunting emoji]\",
        \"rarity\": \"rare\",
        \"trigger\": { \"type\": \"rare_items_collected\", \"threshold\": 3, \"rarities\": [\"rare\", \"legendary\"] },
        \"merch\": { \"enabled\": true, \"suggested_products\": [\"t-shirt\", \"poster\", \"phone_case\"], \"placement_hints\": \"Premium placement - center designs\" }
      },
      {
        \"id\": \"legendary_encounter\",
        \"name\": \"[Theme-specific Legendary Title]\",
        \"description\": \"[Epic description of legendary encounter]\",
        \"image\": \"[Legendary emoji]\",
        \"rarity\": \"legendary\",
        \"trigger\": { \"type\": \"specific_item_collected\", \"item_id\": \"[legendary_item_id]\" },
        \"merch\": { \"enabled\": true, \"suggested_products\": [\"premium_t-shirt\", \"canvas_art\", \"limited_edition\"], \"placement_hints\": \"Exclusive designs - large format art, premium materials only\" }
      },
      {
        \"id\": \"master_collector\",
        \"name\": \"[Theme-specific Master Title]\",
        \"description\": \"[Ultimate achievement description]\",
        \"image\": \"🏆\",
        \"rarity\": \"epic\",
        \"trigger\": { \"type\": \"goal_completion\", \"requirement\": \"collection_goal_met\" },
        \"merch\": { \"enabled\": true, \"suggested_products\": [\"trophy_shirt\", \"certificate_print\", \"badge_collection\"], \"placement_hints\": \"Achievement designs - bold statements, trophy themes\" }
      }
    ]
  }
}

CRITICAL: Return ONLY valid JSON matching this exact structure. No markdown, no explanations."
    
    # Call AI service based on provider
    case "$AI_PROVIDER" in
        "openai")
            call_openai_api "$prompt" "$user_description"
            ;;
        "anthropic")
            call_anthropic_api "$prompt" "$user_description"
            ;;
        "local")
            call_local_ai "$prompt" "$user_description"
            ;;
        *)
            echo "❌ Unsupported AI provider: $AI_PROVIDER"
            exit 1
            ;;
    esac
}

# OpenAI API integration
call_openai_api() {
    local prompt="$1"
    local description="$2"
    
    echo "🔄 Calling OpenAI API..."
    
    # We'll determine the game name from the AI response later
    local temp_game_name=$(echo "$description" | sed 's/[^a-zA-Z0-9 ]//g' | head -c 30 | tr ' ' '-' | tr '[:upper:]' '[:lower:]')
    temp_game_name="${temp_game_name:-ai-generated-game}"
    
    # Properly escape JSON content using jq
    local escaped_prompt=$(echo "$prompt" | jq -R -s '.')
    local system_message="You are a VIBE Coding expert who creates cozy games with revenue-generating badge systems."
    local escaped_system=$(echo "$system_message" | jq -R -s '.')
    
    # Call OpenAI API with properly escaped JSON
    local response=$(curl -s -X POST "https://api.openai.com/v1/chat/completions" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $AI_API_KEY" \
        -d "{
            \"model\": \"gpt-4\",
            \"messages\": [
                {\"role\": \"system\", \"content\": $escaped_system},
                {\"role\": \"user\", \"content\": $escaped_prompt}
            ],
            \"temperature\": 0.8,
            \"max_tokens\": 2000
        }")
    
    # Check if curl succeeded
    if [ $? -ne 0 ]; then
        echo "❌ Failed to connect to OpenAI API"
        exit 1
    fi
    
    # Parse response and create game
    if echo "$response" | grep -q "error"; then
        echo "❌ API Error:"
        echo "$response" | jq -r '.error.message' 2>/dev/null || echo "$response"
        exit 1
    fi
    
    # Check if response is valid JSON
    if ! echo "$response" | jq . > /dev/null 2>&1; then
        echo "❌ Invalid JSON response from API:"
        echo "$response"
        exit 1
    fi
    
    # Extract game configuration
    local game_config=$(echo "$response" | jq -r '.choices[0].message.content' 2>/dev/null)
    
    if [ -z "$game_config" ]; then
        echo "❌ Failed to get response from AI"
        exit 1
    fi
    
    # Create the game
    create_ai_generated_game "$temp_game_name" "$game_config" "$description"
}

# Anthropic Claude API integration
call_anthropic_api() {
    local prompt="$1"
    local description="$2"
    
    echo "🔄 Calling Anthropic Claude API..."
    
    local game_name=$(echo "$description" | sed 's/[^a-zA-Z0-9 ]//g' | head -c 30 | tr ' ' '-' | tr '[:upper:]' '[:lower:]')
    game_name="${game_name:-ai-generated-game}"
    
    local response=$(curl -s -X POST "https://api.anthropic.com/v1/messages" \
        -H "Content-Type: application/json" \
        -H "x-api-key: $AI_API_KEY" \
        -H "anthropic-version: 2023-06-01" \
        -d "{
            \"model\": \"claude-3-sonnet-20240229\",
            \"max_tokens\": 2000,
            \"messages\": [
                {\"role\": \"user\", \"content\": \"$prompt\"}
            ]
        }")
    
    local game_config=$(echo "$response" | jq -r '.content[0].text' 2>/dev/null)
    
    if [ -z "$game_config" ]; then
        echo "❌ Failed to get response from Claude"
        exit 1
    fi
    
    create_ai_generated_game "$game_name" "$game_config" "$description"
}

# Local AI integration (Ollama)
call_local_ai() {
    local prompt="$1"
    local description="$2"
    
    echo "🔄 Calling local AI (Ollama)..."
    
    # Check if Ollama is running
    if ! curl -s http://localhost:11434/api/tags > /dev/null; then
        echo "❌ Ollama is not running. Start it with: ollama serve"
        exit 1
    fi
    
    local game_name=$(echo "$description" | sed 's/[^a-zA-Z0-9 ]//g' | head -c 30 | tr ' ' '-' | tr '[:upper:]' '[:lower:]')
    game_name="${game_name:-ai-generated-game}"
    
    local response=$(curl -s -X POST http://localhost:11434/api/generate \
        -d "{
            \"model\": \"llama2\",
            \"prompt\": \"$prompt\",
            \"stream\": false
        }")
    
    local game_config=$(echo "$response" | jq -r '.response' 2>/dev/null)
    
    create_ai_generated_game "$game_name" "$game_config" "$description"
}

# Create the actual game from AI response
create_ai_generated_game() {
    local temp_name="$1"
    local game_config="$2"
    local description="$3"
    
    # Clean up the AI response - remove markdown code blocks
    local cleaned_config=$(echo "$game_config" | sed '/^```json$/d' | sed '/^```$/d' | sed '/^````json$/d' | sed '/^````$/d')
    
    # Try to parse and get the actual game title
    local game_title=""
    if echo "$cleaned_config" | jq . > /dev/null 2>&1; then
        game_title=$(echo "$cleaned_config" | jq -r '.game.title // .title // empty' 2>/dev/null)
    fi
    
    # Create proper game directory name from title or fallback to temp name
    local game_name
    if [ -n "$game_title" ] && [ "$game_title" != "null" ]; then
        game_name=$(echo "$game_title" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9]/-/g' | sed 's/--*/-/g' | sed 's/^-\|-$//g')
    else
        game_name="$temp_name"
    fi
    
    echo "🎮 Creating game: $game_name"
    echo "📝 Game title: ${game_title:-$game_name}"
    
    # Create game directory
    mkdir -p "$game_name"
    cd "$game_name"
    
    # Copy template files
    echo "📁 Setting up game structure..."
    cp -r ../templates/simple-collector/* .
    
    # Validate and save game config
    echo "💾 Saving AI-generated configuration..."
    
    # Save the original AI response for debugging
    echo "$game_config" > ai-response-original.txt
    echo "$cleaned_config" > ai-response-cleaned.txt
    
    # Try to parse and validate the cleaned JSON
    if echo "$cleaned_config" | jq . > /dev/null 2>&1; then
        echo "$cleaned_config" | jq . > game.json
        echo "✅ Valid JSON configuration saved!"
        echo "🔍 Debug: Original AI response saved to ai-response-original.txt"
    else
        echo "⚠️  AI response might not be valid JSON. Saving raw response..."
        echo "$cleaned_config" > game-ai-raw.json
        echo "📝 Please check game-ai-raw.json and manually create game.json"
        echo "🔍 Debug: Original AI response saved to ai-response-original.txt"
    fi
    
    # Create AI generation log
    cat > AI-GENERATION-LOG.md << EOF
# AI Generation Log

## Original Request
$description

## AI Provider
$AI_PROVIDER

## Generated Configuration
See game.json for the AI-generated configuration.

## Next Steps
1. Test your game: ../vibe-cli.sh test
2. Refine with AI: ../vibe-cli.sh ai-refine "make badges more appealing"
3. Deploy: ../vibe-cli.sh deploy

## Badge Revenue Potential
The AI has designed badges specifically for merchandise appeal. 
Each badge represents a personal achievement that players will want to showcase.
EOF
    
    echo ""
    echo "🎉 AI-generated game created successfully!"
    echo ""
    echo "📁 Game directory: $game_name/"
    echo "🎮 Test your game: ./vibe-cli.sh test"
    echo "🤖 Refine with AI: ./vibe-cli.sh ai-refine \"make it more colorful\""
    echo "🚀 Deploy when ready: ./vibe-cli.sh deploy"
    echo ""
    echo "💰 Badge Revenue: Each badge is designed for merchandise appeal!"
}

# Refine existing game with AI
refine_with_ai() {
    local refinement_request="$1"
    
    if [ -z "$refinement_request" ]; then
        echo "❌ Please specify what you want to refine"
        echo "Example: ./vibe-cli.sh ai-refine \"make the badges more nature-themed\""
        exit 1
    fi
    
    if [ ! -f "game.json" ]; then
        echo "❌ No game.json found. Run this from a game directory."
        exit 1
    fi
    
    load_ai_config
    
    echo "🔄 Refining game with AI..."
    echo "📝 Request: $refinement_request"
    
    local current_config=$(cat game.json)
    local prompt="Refine this VIBE Coding game configuration based on the user's request.

Current Configuration:
$current_config

User Refinement Request: \"$refinement_request\"

Return the updated JSON configuration with the requested changes, maintaining the VIBE Coding structure and badge revenue optimization."
    
    # Call AI based on provider (similar to create function)
    case "$AI_PROVIDER" in
        "openai")
            # Similar API call but for refinement
            echo "🔄 Refining with OpenAI..."
            # Implementation similar to call_openai_api
            ;;
        *)
            echo "🚧 Refinement for $AI_PROVIDER coming soon!"
            echo "💡 For now, you can manually edit game.json"
            ;;
    esac
}

# Export functions for use in main vibe-cli.sh
export -f setup_ai_integration
export -f create_game_with_ai
export -f refine_with_ai