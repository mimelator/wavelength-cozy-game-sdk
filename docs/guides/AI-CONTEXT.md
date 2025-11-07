# 🤖 VIBE Coding SDK - Complete AI Assistant Context

## What is VIBE Coding?

**VIBE Coding** is a visual, intuitive approach to creating cozy games without traditional programming. It stands for:
- **V**isual: See changes immediately, work with colors/themes/emojis
- **I**ntuitive: If it feels right, it probably is - no complex syntax
- **B**uilding Blocks: Combine simple pieces to create magic
- **E**xperience: Focus on the feeling and player joy, not technical details

## Game Development Philosophy

### Core Principles
1. **Cozy Over Complex**: Games should be peaceful, welcoming, and stress-free
2. **Accessibility First**: Everyone should be able to play and create
3. **JSON Configuration**: All customization happens through simple text files
4. **Mobile-First**: Touch controls and responsive design are built-in
5. **No Failure States**: Players explore and collect, never lose or fail
6. **Revenue Generation**: Badge system enables passive income for creators

### Target Audience
- **Players**: People seeking peaceful, meditative gaming experiences
- **Creators**: Non-programmers who want to build games and earn passive income
- **Platform**: hub.wavelength.com - a curated collection of cozy games

### Revenue Model for Creators
**VIBE Coded games generate passive income through the Badge Driven Merch Experience:**

- 🏅 **Games award badges** for player achievements (required - every game must award at least one badge)
- 🏆 **Players own their earned badges** - badges go to player's personal gallery
- 👕 **Players create their own merch** featuring badges they earned
- 💳 **Players purchase** their custom merch directly
- 💰 **Creators earn 35%** of all badge merch sales automatically
- 🔄 **Income is passive** - no ongoing work required after game creation
- 📈 **Revenue compounds** - popular badges continue selling as players discover them

**Example Badge Driven Revenue Flow:**
1. Player earns "Crystal Keeper" badge in your gem-hunting game 💎
2. Badge appears in player's personal Badge Gallery
3. Player clicks "Create Merch" and designs a hoodie featuring their earned badge
4. Player purchases the hoodie for $45
5. You automatically earn $10.50 (35% of $30 net profit)
6. This continues for every player who earns and monetizes your badges

**Key Insight**: Players buy merch featuring badges THEY earned, creating strong emotional connection and higher conversion rates than traditional merchandise.

## Technical Architecture

### File Structure
```
game-project/
├── index.html          # Game interface (responsive, accessible)
├── game.json          # All configuration (themes, items, gameplay)
├── css/styles.css     # Styling with CSS variables for easy theming
├── js/
│   ├── gameEngine.js  # Core mechanics (movement, collection, rendering)
│   ├── gameLogic.js   # Features (achievements, effects, seasonal events)
│   └── main.js        # Initialization and debugging tools
├── assets/            # Optional custom images/sounds
└── README.md          # Template documentation
```

### Game Templates Available

#### 1. Simple Collector
**Purpose**: Collection and exploration games
**Mechanics**:
- Move around a scrolling world
- Collect items with different rarities
- Build a personal collection/journal
- Achievement system with notifications

**Perfect for**: Mushroom hunting, seashell collecting, star gazing, flower picking

#### 2. Creative Canvas (Future)
**Purpose**: Drawing and artistic creation
**Mechanics**: Interactive drawing, pattern creation, collaborative art

#### 3. Physics Playground (Future)
**Purpose**: Relaxing physics interactions
**Mechanics**: Bouncing objects, gentle collisions, satisfying movement

## Game Configuration (game.json)

### Required Structure
```json
{
  "title": "Your Game Name",
  "description": "What players will experience",
  "version": "1.0.0",
  "template": "simple-collector",

  "theme": {
    "name": "forest|ocean|sunset|midnight|spring",
    "primaryColor": "#hex-color",
    "backgroundColor": "#hex-color",
    "textColor": "#hex-color",
    "accentColor": "#hex-color",
    "font": "CSS font family"
  },

  "gameplay": {
    "worldSize": "small|medium|large",
    "difficulty": "peaceful|relaxed|engaging",
    "movementSpeed": "slow|normal|fast",
    "collectionGoal": 50,
    "itemsToCollect": [...]
  },

  "deploy": {
    "hubUrl": "hub.wavelength.com",
    "category": "collection|creative|physics",
    "tags": ["cozy", "peaceful", "mobile-friendly"],
    "ageRating": "everyone",
    "accessibility": true
  }
}
```

### Item Configuration
```json
{
  "id": "unique_identifier",
  "name": "Human-readable name",
  "emoji": "🌸",
  "description": "Poetic, atmospheric description",
  "rarity": "common|uncommon|rare|legendary",
  "points": 10,
  "spawnRate": 0.3,
  "soundEffect": "gentle_chime|soft_pop|magical_chime|ethereal_bell",
  "animation": "gentle_sway|sparkle|gentle_bounce|magical_glow"
}
```

### Rarity System
- **common** (40% spawn rate): Green color, 5-15 points, basic items
- **uncommon** (25% spawn rate): Blue color, 20-35 points, interesting items
- **rare** (10% spawn rate): Purple color, 40-75 points, special treasures
- **legendary** (1% spawn rate): Gold color, 100+ points, magical items

### Badge Configuration (Revenue Generation)
Every VIBE game MUST include badges (Insignia of Merit) that players can earn:

```json
{
  "badges": {
    "enabled": true,
    "apiEndpoint": "https://hub.wavelength.com/api/games",
    "insigniaOfMerit": [
      {
        "id": "first_collection",
        "name": "Nature's Friend",
        "description": "Discovered your first treasure in the magical forest",
        "image": "🌱",
        "rarity": "common",
        "trigger": {
          "type": "items_collected",
          "threshold": 1
        },
        "merch": {
          "enabled": true,
          "suggested_products": ["t-shirt", "sticker", "mug"],
          "placement_hints": "Works great on front chest, small corner designs"
        }
      }
    ]
  }
}
```

**Badge Design for Maximum Revenue:**
- **Meaningful names**: "Forest Guardian" > "Achievement #1"
- **Attractive emojis**: Visual impact on merchandise (🌟⭐💎🏆🦋🌸)
- **Clear descriptions**: Tell a story that players connect with emotionally
- **Balanced difficulty**: Too easy = low value, too hard = few earners
- **Rarity tiers**: Common badges for participation, legendary for dedication

**Trigger Types:**
- `items_collected`: Based on total collection count
- `rare_items_collected`: Based on rare/legendary items found
- `specific_item_collected`: Earned by finding a specific item
- `goal_completion`: Awarded when reaching the collection goal

## Built-in Features

### Technical Features
- **HTML5 Canvas rendering** with smooth 60fps performance
- **Mobile touch controls** with virtual D-pad and gesture support
- **Responsive design** that adapts to any screen size
- **Auto-save/load** using localStorage for progress persistence
- **Accessibility** with screen reader support, high contrast mode, large text
- **Performance optimization** with efficient rendering and memory management

### Gameplay Features
- **Achievement system** with visual notifications
- **Collection journal** showing discovered items with descriptions
- **Progress tracking** with goals and milestones
- **Seasonal events** that change item spawns based on real date
- **Sound system** with ambient audio and collection feedback
- **Visual effects** like sparkles for rare items and collection animations

### Developer Features
- **Debug console** with commands like `debugGame.spawnItem()`, `debugGame.addScore(100)`
- **Error handling** with user-friendly messages that never break the game
- **Hot reloading** for development (change game.json and refresh)
- **Validation** ensuring games meet platform requirements
- **Packaging tools** for easy distribution and deployment

## AI Assistant Guidelines

### When helping with VIBE Coding:

1. **Always prioritize the cozy, peaceful aesthetic**
   - Suggest soft, welcoming colors
   - Use nature-inspired themes and items
   - Avoid aggressive or competitive elements

2. **Keep technical complexity hidden**
   - Focus on game.json configuration
   - Don't suggest code changes unless specifically requested
   - Emphasize visual and thematic customization

3. **Mobile-first thinking**
   - Ensure suggestions work well on phones/tablets
   - Consider touch interaction in gameplay
   - Test ideas with accessibility in mind

4. **Encourage creativity within constraints**
   - Work within the template system
   - Suggest interesting item combinations
   - Help with thematic consistency

### Common Requests and Responses

**"Help me create a [theme] game"**
- Suggest appropriate template (usually simple-collector)
- Recommend theme setting and color palette
- Provide 5-8 themed items with proper rarity distribution
- Include atmospheric descriptions

**"My game feels too easy/hard"**
- Adjust spawnRate values (higher = more items)
- Rebalance rarity distribution
- Suggest collectionGoal adjustments

**"I want custom colors"**
- Provide hex codes that work well together
- Ensure good contrast for accessibility
- Test combinations for cozy feeling

**"How do I deploy this?"**
- Guide through the deployment script
- Explain hub.wavelength.com upload process
- Help with game description and tags

### Example AI Response Pattern

```
I'll help you create a cozy [theme] collection game! Here's what I recommend:

**Theme Setup:**
```json
"theme": {
  "name": "[preset-theme]",
  "primaryColor": "#[color]"
}
```

**Items to Collect:**
I suggest these [number] items that fit your [theme] perfectly:

1. **[Common Item Name]** 🌸
   - Description: "[Atmospheric description]"
   - Rarity: common, spawns frequently

2. **[Rare Item Name]** ✨
   - Description: "[Special description]"
   - Rarity: rare, exciting to find!

**Next Steps:**
1. Copy the simple-collector template
2. Update your game.json with these settings
3. Test in browser with ./test-game.sh
4. Deploy with ./deploy-to-hub.sh

Would you like me to help you customize any of these elements further?
```

## Platform Requirements (hub.wavelength.com)

### Technical Requirements
- ✅ Responsive design (works on desktop + mobile)
- ✅ Accessibility features (screen reader, keyboard navigation)
- ✅ Family-friendly content only
- ✅ No external dependencies or API calls
- ✅ Complete offline functionality
- ✅ Performance: 60fps on mid-range mobile devices

### Content Guidelines
- ✅ Peaceful, cozy themes
- ✅ Inclusive and welcoming to all players
- ✅ No violence, competition, or stress-inducing mechanics
- ✅ Clear, helpful UI and instructions
- ❌ No inappropriate content for any age
- ❌ No data collection or privacy concerns
- ❌ No aggressive monetization or ads

### Deployment Process
1. **Package** game using provided tools
2. **Validate** against platform requirements (automatic)
3. **Upload** ZIP file to hub.wavelength.com/upload
4. **Review** by platform team (usually approved within 24 hours)
5. **Publish** with automatic URL and social sharing

## Development Workflow

### Typical Creator Session (15-30 minutes):
1. **Idea** (2 min): "I want a beach shell collecting game"
2. **Template** (1 min): Copy simple-collector template
3. **Configure** (10 min): Edit game.json with theme and items
4. **Test** (5 min): Run locally, test on phone
5. **Deploy** (2 min): Upload to hub.wavelength.com
6. **Share** (5 min): Post in community, get feedback

### AI-Assisted Workflow:
1. **Context** (30 sec): Share this file with AI assistant
2. **Request** (1 min): "Help me create a [description] game"
3. **Generate** (2 min): AI provides complete game.json configuration
4. **Implement** (5 min): Copy settings into template
5. **Refine** (10 min): Test and adjust with AI help
6. **Deploy** (2 min): One-click deployment

## Success Metrics

### Player Engagement
- **Session length**: Average 10-15 minutes of peaceful play
- **Return rate**: Players come back to complete collections
- **Collection rate**: Most players collect 60-80% of available items
- **Mobile usage**: 70% of players use mobile devices

### Creator Success
- **Time to first game**: Under 30 minutes for complete beginners
- **Learning curve**: Non-programmers successfully create games
- **Template usage**: 90% of games use provided templates successfully
- **Community growth**: Creators help each other and share ideas

## Troubleshooting Guide

### Common Issues
**"Game won't load"**: Check file paths, ensure all template files present
**"Items not spawning"**: Increase spawnRate values in game.json
**"Mobile controls not working"**: Verify template includes mobile CSS and JS
**"Colors look wrong"**: Use theme presets or ensure color contrast
**"Deployment failed"**: Check game.json syntax and content guidelines

### AI Assistant Debugging
When creators report issues, help them:
1. Check game.json syntax (validate JSON)
2. Test in browser console for errors
3. Verify all required files are present
4. Ensure content meets platform guidelines
5. Guide through debug console commands if needed

---

This context should give any AI assistant everything needed to help creators build successful VIBE Coded games for the Wavelength Hub platform. The focus is always on making game creation accessible, fun, and aligned with the cozy gaming aesthetic.