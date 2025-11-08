# 🎮 **VIBE SDK: Universal Tool Integration**
*Use VIBE Coding SDK with any text editor, AI assistant, or development environment*

> **📖 For basic setup and quick start**, see [QUICK-START.md](QUICK-START.md)

## 🎯 **Focus: Non-VS Code Workflows**

This guide is specifically for users who want to use VIBE SDK with tools other than VS Code and Claude. The SDK works with **any development environment** - here's how:

### **1. 📝 Text Editor Integrations**

The VIBE SDK works with **any text editor** - you just edit `game.json` files:

**Popular Editors:**
- **Visual Studio Code**: Full IDE experience (but optional)
- **Sublime Text**: Fast, lightweight, great for JSON
- **Atom / Pulsar**: Open source with packages
- **Notepad++**: Windows favorite with JSON syntax highlighting
- **vim / neovim**: Terminal-based editing with plugins
- **emacs**: Extensible editor with JSON modes
- **nano**: Simple terminal editor for quick edits

**Workflow Example (any editor):**
```bash
# Create game template
./vibe-cli.sh new my-ocean-game

# Edit in your preferred editor
sublime my-ocean-game/game.json    # Sublime Text
vim my-ocean-game/game.json        # vim
code my-ocean-game/game.json       # VS Code
notepad++ my-ocean-game/game.json  # Notepad++

# Test and deploy
cd my-ocean-game
../vibe-cli.sh test
../vibe-cli.sh deploy
```

---

### **2. 🤖 AI Assistant Integration (Any Platform)**

**Quick Setup for Any AI:**
```
I'm using VIBE Coding SDK to create cozy games. Help me design a [describe your game concept].

VIBE uses JSON configuration instead of code. Games have themes like 'ocean', 'forest', 'sunset' with emoji-based collectible items and peaceful gameplay.
```

**Platform-Specific Instructions:**

#### **ChatGPT / GPT-4:**
1. Upload `AI-CONTEXT.md` from the SDK
2. Ask: *"Create a magical garden game using VIBE principles"*
3. Copy the JSON configuration into your `game.json`

#### **Google Bard / Gemini:**
1. Copy-paste the AI-CONTEXT.md content
2. Request: *"Generate VIBE SDK configuration for underwater treasure hunting"*
3. Use the provided JSON in your game files

#### **Claude (any interface):**
- Works in web interface, API, or third-party clients
- Upload AI-CONTEXT.md for full understanding
- Natural conversation about game concepts

#### **GitHub Copilot:**
1. Open any `game.json` file in your editor
2. Copilot automatically understands VIBE patterns
3. Get intelligent autocompletion and suggestions

#### **Local AI Models (Ollama, LM Studio, etc.):**
1. Load the AI-CONTEXT.md into your model's context
2. Works with Code Llama, Mistral, Llama 2, etc.
3. Full offline game creation capability

---

### **3. 🌐 Web-Based Development**

**Online Code Editors:**
- **CodePen**: Quick prototyping and testing
- **Glitch**: Host and share games instantly
- **Replit**: Full development environment in browser
- **StackBlitz**: Instant web development
- **CodeSandbox**: React-like development experience

**File Sharing Workflow:**
```bash
# Package for web sharing
./vibe-cli.sh package

# Upload to your preferred platform:
# - GitHub Gist (for code snippets)
# - Dropbox, Google Drive (for ZIP files)
# - Discord/Slack (for team sharing)
```

---

### **4. 🎨 Visual JSON Editors (Non-Programmer Friendly)**

**Recommended Visual Editors:**
- **JSONEditor.io**: Browser-based with form interface
- **JSON Buddy**: Desktop editor with validation
- **Studio 3T**: Free with schema support
- **Altova XMLSpy**: Professional JSON tooling

**Visual Editing Workflow:**
1. Create template: `./vibe-cli.sh new my-game`
2. Open `game.json` in visual editor
3. Edit using forms/dropdowns instead of raw text
4. Validate: `../vibe-cli.sh validate`
5. Test: `../vibe-cli.sh test`

---

### **5. 📱 Mobile Development**

**Tablet/Phone Coding:**
- **Termux** (Android): Full Linux environment with CLI access
- **iSH** (iOS): Linux shell for iOS devices
- **CodeApp** (iOS): Mobile IDE with file management
- **Acode** (Android): Feature-rich mobile editor
- **Spck Editor** (Mobile): Web-based IDE in mobile browser

**Mobile Workflow:**
```bash
# In Termux (Android) or iSH (iOS)
pkg install git python  # Install tools
git clone https://github.com/mimelator/wavelength-cozy-game-vibe-sdk.git
cd wavelength-cozy-game-vibe-sdk
./vibe-cli.sh new mobile-game
```

---

### **6. 🔄 Build System Integration**

**GitHub Actions Example:**
```yaml
name: VIBE Game CI
on: [push]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Validate and Package Games
        run: |
          for game in */; do
            cd "$game"
            ../vibe-cli.sh validate
            ../vibe-cli.sh package
            cd ..
          done
```

**Make/NPM Integration:**
```makefile
# Makefile
validate:
	./vibe-cli.sh validate

package:
	./vibe-cli.sh package

deploy:
	./vibe-cli.sh deploy

test-all:
	for game in */; do cd "$$game" && ../vibe-cli.sh test; cd ..; done
```

```json
// package.json scripts
{
  "scripts": {
    "validate": "./vibe-cli.sh validate",
    "test": "./vibe-cli.sh test",
    "deploy": "./vibe-cli.sh deploy",
    "package": "./vibe-cli.sh package"
  }
}
```

---

### **7. 🔧 Advanced Integration & Automation**

**Custom Automation Scripts:**
```bash
#!/bin/bash
# bulk-game-processor.sh

for game_dir in */; do
    if [ -f "$game_dir/game.json" ]; then
        echo "Processing $game_dir"
        cd "$game_dir"

        # Validate game
        ../vibe-cli.sh validate || continue

        # Add custom metadata
        echo "Adding build timestamp..."
        # Your custom processing here

        # Package for distribution
        ../vibe-cli.sh package

        cd ..
    fi
done
```

**CMS Integration Concepts:**
- **WordPress**: Plugin could generate `game.json` from admin forms
- **Notion**: Database exports could create VIBE configurations
- **Airtable**: Form submissions could auto-generate games
- **Google Sheets**: Spreadsheet data could drive game content

**API-Driven Game Generation:**
```python
# Python example: Programmatic game creation
import json

def create_vibe_game(title, theme, items):
    game_config = {
        "title": title,
        "theme": {"name": theme},
        "gameplay": {"itemsToCollect": items},
        "meta": {"created_by": "api", "version": "1.0"}
    }

    with open("game.json", "w") as f:
        json.dump(game_config, f, indent=2)

# Generate game from external data
create_vibe_game("Ocean Explorer", "ocean", [
    {"name": "Seashell", "emoji": "🐚", "rarity": "common"}
])
```

---

## 🌟 **Key Universal Advantages**

### ✅ **Complete Tool Freedom**
- Works with any text editor or IDE
- No vendor lock-in to specific platforms
- Choose tools that match your workflow

### ✅ **AI Platform Agnostic**
- Compatible with all major AI assistants
- Works with local and cloud AI models
- Standardized context for consistent results

### ✅ **Development Environment Flexible**
- Command line, GUI, or web-based workflows
- Mobile development capability
- Offline development support

### ✅ **Integration Ready**
- CI/CD pipeline compatible
- Build system integration
- Version control friendly JSON format

---

## 🎯 **Quick Integration Recipes**

### **Recipe: ChatGPT + Sublime Text**
```bash
# Setup
git clone https://github.com/mimelator/wavelength-cozy-game-vibe-sdk.git
cd wavelength-cozy-game-vibe-sdk

# Workflow
./vibe-cli.sh new forest-adventure
# Ask ChatGPT: "Create mystical forest items for VIBE game"
# Edit game.json in Sublime Text with AI suggestions
subl forest-adventure/game.json
cd forest-adventure && ../vibe-cli.sh test
```

### **Recipe: Local AI + vim**
```bash
# Setup with local AI context
cat AI-CONTEXT.md | your-local-ai-tool
# Create game with vim
./vibe-cli.sh new retro-arcade
vim retro-arcade/game.json
# Test and deploy
cd retro-arcade && ../vibe-cli.sh deploy
```

### **Recipe: Visual Editor + Mobile**
```bash
# Mobile setup (Termux/iSH)
./vibe-cli.sh new beach-collector
# Copy game.json content to JSONEditor.io on mobile browser
# Edit visually, copy back to file
# Test on mobile browser
../vibe-cli.sh test
```

---

## 📄 **Essential Files Reference**

When working outside VS Code/Claude, these files are crucial:

- **`vibe-cli.sh`** - Your main command interface
- **`AI-CONTEXT.md`** - Upload to any AI assistant for instant expertise
- **`templates/`** - Starting points for different game types
- **`QUICK-START.md`** - Basic setup and first game creation

---

## 💡 **Universal Development Tips**

### **Editor Configuration**
- **JSON syntax highlighting** - Essential for readability
- **File validation** - Many editors can validate JSON automatically
- **Auto-formatting** - Keep your game.json files clean
- **Git integration** - Track changes to your game configurations

### **AI Assistant Optimization**
- **Upload AI-CONTEXT.md first** - Gives full VIBE understanding
- **Be specific about game concepts** - Better AI suggestions
- **Ask for complete JSON blocks** - Easier copy-paste workflow
- **Request validation checks** - AI can spot JSON errors

### **Testing Strategy**
- **Test early and often** - Use built-in test server frequently
- **Mobile testing** - Always check on actual mobile devices
- **Cross-browser testing** - Different browsers may behave differently
- **Performance testing** - Ensure smooth gameplay on various devices

---

**The VIBE SDK is designed to be truly universal** - create amazing cozy games with the tools you already know and love! 🎮✨