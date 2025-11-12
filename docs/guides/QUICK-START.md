# 🚀 Quick Start Guide - Get Started in 5 Minutes

## Prerequisites
- Any computer with a web browser
- Text editor (Notepad, TextEdit, VS Code, etc.)
- Internet connection
- Creativity (most important!)

## Why Create VIBE Games?
**🎮 No Programming**: Just edit simple text files to create complete games
**📱 Mobile Ready**: Automatically works on phones, tablets, and computers
**🌍 Global Reach**: Deploy to hub.wavelength.com with one command
**🏆 Achievement System**: Built-in badge system for player accomplishments

## Step 1: Download the SDK (30 seconds)

### Option A: GitHub Download
```bash
git clone https://github.com/mimelator/wavelength-cozy-game-vibe-sdk.git
cd wavelength-cozy-game-vibe-sdk
```

### Option B: ZIP Download
1. Visit: https://github.com/mimelator/wavelength-cozy-game-vibe-sdk/archive/main.zip
2. Download and extract the ZIP file
3. Open terminal/command prompt in the extracted folder

## Step 2: Create Your First Game (2 minutes)

```bash
# Create a new game project
./vibe-cli.sh new my-beach-game

# Move into your game directory
cd my-beach-game
```

## Step 3: Customize Your Game (2 minutes)

Edit `game.json` in any text editor:

```json
{
  "title": "Peaceful Beach Explorer",
  "description": "Collect beautiful seashells on a serene coastline",
  "theme": {
    "name": "ocean"
  },
  "gameplay": {
    "itemsToCollect": [
      {
        "name": "Rainbow Shell",
        "emoji": "🐚",
        "description": "Shimmers with ocean colors",
        "rarity": "common",
        "points": 10,
        "spawnRate": 0.3
      },
      {
        "name": "Starfish",
        "emoji": "⭐",
        "description": "A lucky find from the tide pools",
        "rarity": "uncommon",
        "points": 25,
        "spawnRate": 0.15
      },
      {
        "name": "Pearl",
        "emoji": "🤍",
        "description": "A rare treasure from the deep",
        "rarity": "rare",
        "points": 100,
        "spawnRate": 0.05
      }
    ]
  },
  "deploy": {
    "category": "collection",
    "tags": ["beach", "peaceful", "collection", "cozy"]
  }
}
```

## Step 4: Test Your Game (30 seconds)

```bash
# Start local test server
../vibe-cli.sh test
```

This opens your game at http://localhost:3000

**Test on your phone:**
- Connect to same WiFi
- Visit the URL shown in terminal
- Test touch controls!

## Step 5: Add Badge System ⚠️ **REQUIRED** (1 minute)

**ALL GAMES must include a compliant badge system for validation:**

```bash
# Copy badge system to your game
cp ../dev-kit/badge-helper.js ./js/
```

Edit your `index.html` to include the badge system:

```html
<!-- Add this line before your closing </body> tag -->
<script src="./js/badge-helper.js"></script>
```

**The CLI automatically adds badge integration - no additional code needed!**

## Step 6: Deploy to Wavelength Hub (30 seconds)

```bash
# One-click deployment with badge validation
../vibe-cli.sh deploy
```

This will:
1. ✅ Validate your game meets Hub requirements (including badge system)
2. 📦 Package your game automatically  
3. 🌐 Open hub.wavelength.com/upload in your browser
4. 🎮 Generate your deployment package

**Just drag and drop the ZIP file to complete deployment!**


---

## 🎉 Congratulations!

Your cozy game is now live on hub.wavelength.com and playable by people around the world!

## What's Next?

### Make It Yours
- **Change theme**: Try "forest", "sunset", "midnight", or "spring"
- **Add more items**: Create a collection of 8-12 unique items
- **Customize colors**: Use custom color palettes
- **Write descriptions**: Make items feel magical and special

### Share & Get Feedback
- **Discord**: Join the VIBE Coding community
- **Social**: Share your game URL
- **Friends**: Get feedback from people you know
- **Iterate**: Make improvements based on feedback

### Create More Games
- **Try different themes**: Each theme feels completely different
- **Experiment**: What happens if you make items very rare? Very common?
- **Learn from others**: Play games other creators have made
- **Help others**: Answer questions in the community

---

## 🆘 Need Help?

### Community Support
- **Discord**: https://discord.gg/vibe-coding
- **Forum**: https://hub.wavelength.com/forum
- **Email**: help@wavelength.com

Ask questions in our community forums or Discord channels. Share your game.json configuration for help with specific issues.

### Common Issues
- **Game won't load**: Check that all files are in the right place
- **Items not appearing**: Increase `spawnRate` values
- **Colors look wrong**: Try different theme names
- **Mobile issues**: Test with the provided mobile CSS

---

## 🌟 Pro Tips

### Theme Combinations
```json
// Mystical forest
"theme": { "name": "forest" }
// Items: 🍄🌿🦋🌸🐛

// Peaceful ocean
"theme": { "name": "ocean" }
// Items: 🐚⭐🦀🐟🌊

// Warm sunset
"theme": { "name": "sunset" }
// Items: 🌅🦋🌺🍯🌸

// Mysterious night
"theme": { "name": "midnight" }
// Items: 🌙✨🦉🔮💫

// Fresh spring
"theme": { "name": "spring" }
// Items: 🌸🐝🌿🦋🌷
```

### Rarity Balance
- **70% common items** - Players find these regularly
- **20% uncommon items** - Nice surprises
- **9% rare items** - Exciting discoveries
- **1% legendary items** - Memorable moments

### Mobile-First Design
- Use large, clear emojis
- Keep descriptions short but evocative
- Test touch controls on actual devices
- Consider one-handed play

---

**Ready to create your second game? It gets easier and more fun each time!** 🎮✨