# 🌟 Simple Collector Game Template

A beginner-friendly template for creating cozy collection games using VIBE Coding!

## 🎮 What This Template Does

This template creates a peaceful exploration game where players:
- Move around a beautiful world
- Collect different types of items
- Build a personal collection
- Unlock achievements
- Enjoy cozy, stress-free gameplay

## 🚀 Quick Start (30 Minutes to Your First Game!)

### Step 1: Customize Your Theme (5 minutes)
Edit `game.json` to change colors, title, and description:

```json
{
  "title": "My Amazing Adventure",
  "theme": {
    "name": "sunset",
    "primaryColor": "#ff6b9d",
    "backgroundColor": "#ffe0e6"
  }
}
```

### Step 2: Add Your Items (10 minutes)
In `game.json`, customize what players can collect:

```json
"itemsToCollect": [
  {
    "name": "Magic Crystal",
    "emoji": "💎",
    "description": "A sparkling gem full of magic",
    "rarity": "rare",
    "points": 50,
    "spawnRate": 0.1
  }
]
```

### Step 3: Test Your Game (5 minutes)
1. Open `index.html` in your web browser
2. Use WASD or arrow keys to move
3. Click items to collect them
4. Open collection panel to see your items

### Step 4: Polish and Share (10 minutes)
1. Adjust colors and descriptions
2. Test on mobile device
3. Share with friends!

## 🎨 Easy Customization

### Themes
Choose from pre-made themes by changing `"name"` in game.json:
- `"forest"` - Green and natural
- `"ocean"` - Blue and peaceful
- `"sunset"` - Orange and warm
- `"midnight"` - Purple and mysterious
- `"spring"` - Light green and fresh

### Item Rarities
- `"common"` - Easy to find (green)
- `"uncommon"` - Harder to find (blue)
- `"rare"` - Special treasures (purple)
- `"legendary"` - Extremely rare (gold)

### Emojis You Can Use
Perfect for items: 🌸🍄💎✨🌟🦋🐛🌿🍃🌺🌻🌷🌹🥀🌾🍯🍊🍋🍌🍇🫐🍓

## 📱 Mobile Friendly

The template automatically:
- Shows touch controls on mobile devices
- Scales properly for different screen sizes
- Works with swipe gestures
- Supports both portrait and landscape

## 🎯 Built-in Features

### Achievement System
- First Collection achievement
- Milestone achievements
- Rare item achievements
- Custom achievement notifications

### Save System
- Auto-saves progress every 30 seconds
- Remembers collected items
- Saves current score
- Works offline

### Accessibility
- High contrast mode
- Large text option
- Keyboard navigation
- Screen reader support

## 🔧 Advanced Customization

### Adding New Environments
```json
"environments": [
  {
    "name": "Enchanted Forest",
    "background": "forest",
    "music": "mystical_ambient",
    "spawnBias": {
      "rare_items": 1.5
    }
  }
]
```

### Custom Item Behaviors
Edit `js/gameLogic.js` to add special effects:
- Floating legendary items
- Sparkle effects for rare items
- Seasonal item variations
- Special sound effects

### Audio Integration
Add your own music and sounds:
1. Put audio files in an `audio/` folder
2. Reference them in game.json
3. The template handles the rest!

## 🐛 Testing & Debugging

### Quick Testing Commands
Open browser console and try:
```javascript
// Spawn a test item
debugGame.spawnItem();

// Add 100 points
debugGame.addScore(100);

// Reset the game
debugGame.resetGame();
```

### Keyboard Shortcuts
- `Ctrl + T` - Spawn test item
- `Ctrl + R` - Reset game
- `C` - Open collection panel

## 📦 Publishing Your Game

### For Wavelength Hub
1. Test your game thoroughly
2. Run the package script: `./package-game.sh`
3. Upload to Wavelength Hub
4. Add tags and description
5. Publish!

### For Your Own Website
1. Upload all files to your web server
2. Make sure `index.html` is accessible
3. Share the URL with friends!

## 🌟 Community Examples

Games made with this template:
- "Sunset Seashell Collector" - Beach theme with shell collecting
- "Mystical Garden Explorer" - Fantasy theme with magical plants
- "Cozy Cabin Treasures" - Winter theme with warm collectibles

## 📚 Learning Resources

### VIBE Coding Philosophy
- Start simple, add magic later
- Focus on feeling over features
- Community over competition
- Iterate to create

### Getting Help
- Discord: [Wavelength VIBE Community]
- Forum: [VIBE Coding Help]
- Email: vibe@wavelengthhub.com

## 🎊 Congratulations!

You've created a cozy game using VIBE Coding! Share it with friends, get feedback, and keep creating.

Remember: **Every expert was once a beginner.** Your creativity + our template = amazing games! 🌈

---

*Happy VIBE Coding! 🎮✨*