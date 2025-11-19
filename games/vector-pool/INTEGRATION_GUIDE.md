# Vector Pool Asteroids - Hub Integration Guide

## 🎯 Overview

This guide shows how to integrate **Vector Pool Asteroids** with the Wavelength Hub platform, enabling badge achievements and proper game hosting.

---

## 📦 Platform SDK: Wavelength SDK

The Hub provides the **Wavelength SDK** (not "Cozy Games SDK") which is automatically injected into your game when hosted. It provides:

- **Badge API** - Award achievements to players
- **Game Context** - Access game ID, tenant info
- **Player Context** - Session tracking, player ID (if authenticated)

### SDK Availability

The SDK is automatically injected by the Hub's game player. You can access it via:

```javascript
// Check if SDK is available
if (window.Wavelength) {
  // SDK is ready!
  console.log('Game ID:', window.Wavelength.game.id);
  console.log('Player Session:', window.Wavelength.player.sessionId);
}
```

---

## 🔧 Integration Steps

### Step 1: Add Badge Achievement System

Add badge awarding to your game's achievement events. Here's how to integrate it into `main.js`:

```javascript
// Add at top of main.js (after imports)
let badgeAwarded = {
  firstPocket: false,
  highScore: false,
  perfectClear: false,
  blackHoleMaster: false,
  cometStorm: false,
  solarFlare: false
};

// Helper function to award badges
async function awardBadge(badgeId, metadata = {}) {
  if (window.Wavelength && window.Wavelength.badges) {
    try {
      await window.Wavelength.badges.award({
        badgeId: badgeId,
        metadata: {
          score: score,
          timestamp: Date.now(),
          ...metadata
        }
      });
      console.log(`🏆 Badge awarded: ${badgeId}`);
    } catch (error) {
      console.error('Failed to award badge:', error);
    }
  }
}

// Wait for SDK to be ready
function waitForSDK(callback) {
  if (window.Wavelength) {
    callback();
  } else {
    setTimeout(() => waitForSDK(callback), 100);
  }
}

// Initialize SDK connection
waitForSDK(() => {
  console.log('[Vector Pool] Wavelength SDK ready!');
});
```

### Step 2: Add Badge Triggers

Add badge awarding logic to your game events:

```javascript
// In the update() function, add badge checks:

// First Pocket Achievement
if (!badgeAwarded.firstPocket && entities.filter(e => e instanceof Ball).length < entities.length) {
  const ballsSunk = entities.filter(e => e instanceof Ball).length;
  if (ballsSunk > 0) {
    awardBadge('first-pocket', { ballsSunk });
    badgeAwarded.firstPocket = true;
  }
}

// Perfect Clear Achievement (clear all balls)
if (!badgeAwarded.perfectClear && entities.filter(e => e instanceof Ball).length === 0 && entities.length > 0) {
  awardBadge('perfect-clear', { score });
  badgeAwarded.perfectClear = true;
}

// High Score Achievement
if (!badgeAwarded.highScore && score >= 10000) {
  awardBadge('high-score', { score });
  badgeAwarded.highScore = true;
}

// Black Hole Master (survive black hole)
if (!badgeAwarded.blackHoleMaster && entities.some(e => e instanceof BlackHole)) {
  // Award after black hole disappears
  setTimeout(() => {
    if (!entities.some(e => e instanceof BlackHole) && !badgeAwarded.blackHoleMaster) {
      awardBadge('black-hole-master', { score });
      badgeAwarded.blackHoleMaster = true;
    }
  }, 5000);
}

// Comet Storm Achievement
if (!badgeAwarded.cometStorm && entities.some(e => e instanceof Comet)) {
  const cometCount = entities.filter(e => e instanceof Comet).length;
  if (cometCount >= 5) {
    awardBadge('comet-storm', { cometCount, score });
    badgeAwarded.cometStorm = true;
  }
}

// Solar Flare Achievement
if (!badgeAwarded.solarFlare && currentMechanic === 'SOLAR_FLARE') {
  awardBadge('solar-flare-survivor', { score });
  badgeAwarded.solarFlare = true;
}
```

### Step 3: Update Score Display with Badge Notifications

Add visual feedback when badges are awarded:

```javascript
// Add badge notification system
const badgeNotifications = [];

function showBadgeNotification(badgeId) {
  const notification = {
    id: Date.now(),
    badgeId: badgeId,
    text: `🏆 Achievement Unlocked: ${badgeId.replace(/-/g, ' ').toUpperCase()}`,
    time: 0,
    duration: 3.0
  };
  badgeNotifications.push(notification);
}

// Update badge notification rendering (add to render function)
function renderBadgeNotifications() {
  const ctx = canvas.getContext('2d'); // You'll need to add 2D context for text
  // Or use your WebGL text rendering system
  
  badgeNotifications.forEach((notif, index) => {
    notif.time += 0.016; // Assuming 60fps
    if (notif.time >= notif.duration) {
      badgeNotifications.splice(index, 1);
    } else {
      // Render notification (adjust based on your rendering system)
      const alpha = 1.0 - (notif.time / notif.duration);
      // Render text with fade out
    }
  });
}

// Update awardBadge function to show notification
async function awardBadge(badgeId, metadata = {}) {
  if (window.Wavelength && window.Wavelength.badges) {
    try {
      await window.Wavelength.badges.award({
        badgeId: badgeId,
        metadata: {
          score: score,
          timestamp: Date.now(),
          ...metadata
        }
      });
      console.log(`🏆 Badge awarded: ${badgeId}`);
      showBadgeNotification(badgeId); // Show notification
    } catch (error) {
      console.error('Failed to award badge:', error);
    }
  }
}
```

### Step 4: Ensure Game Meets Platform Requirements

#### ✅ Requirements Checklist

- [x] **Self-Contained** - All assets use relative paths ✓
- [x] **No External Dependencies** - Uses only WebGL APIs ✓
- [x] **ES Modules** - Uses `import/export` ✓ (needs adjustment for Hub)
- [ ] **Badge Integration** - Must award at least one badge
- [ ] **Size Limits** - Total < 50MB, individual files < 5MB

#### ⚠️ ES Modules Consideration

Your game uses ES modules (`import/export`). The Hub supports this, but you may need to ensure:

1. **Module Paths** - All imports use relative paths (you already do this ✓)
2. **Type Attributes** - Keep `type="module"` in script tag ✓
3. **Testing** - Test in Hub's iframe environment

---

## 📝 Complete Integration Example

Here's a complete example of how to modify your `main.js`:

```javascript
import { Renderer } from './renderer.js';
import { Background } from './background.js';
import { Input } from './input.js';
import { Ship, Ball, Particle, BlackHole, WhiteHole, Comet } from './entities.js';
import { Vec2 as MathVec2 } from './math.js';

// ... existing code ...

// ============================================
// WAVELENGTH SDK INTEGRATION
// ============================================

let badgeAwarded = {
  firstPocket: false,
  highScore: false,
  perfectClear: false,
  blackHoleMaster: false,
  cometStorm: false,
  solarFlare: false
};

async function awardBadge(badgeId, metadata = {}) {
  if (window.Wavelength && window.Wavelength.badges) {
    try {
      await window.Wavelength.badges.award({
        badgeId: badgeId,
        metadata: {
          score: score,
          timestamp: Date.now(),
          ...metadata
        }
      });
      console.log(`🏆 Badge awarded: ${badgeId}`);
      
      // Show in-game notification (if you have UI system)
      if (document.getElementById('t-alert')) {
        const alertEl = document.getElementById('t-alert');
        alertEl.innerText = `🏆 ${badgeId.toUpperCase()}`;
        alertEl.style.color = "#ffd700";
        setTimeout(() => {
          updateTelemetry(); // Reset to normal
        }, 2000);
      }
    } catch (error) {
      console.error('Failed to award badge:', error);
    }
  }
}

function waitForSDK(callback) {
  if (window.Wavelength) {
    callback();
  } else {
    setTimeout(() => waitForSDK(callback), 100);
  }
}

// Initialize SDK when ready
waitForSDK(() => {
  console.log('[Vector Pool] Wavelength SDK ready!', {
    gameId: window.Wavelength.game.id,
    sessionId: window.Wavelength.player.sessionId
  });
});

// ... existing game code ...

// In update() function, add badge checks:
function update(dt) {
  // ... existing update code ...
  
  // Badge: First Pocket
  const ballCount = entities.filter(e => e instanceof Ball).length;
  if (!badgeAwarded.firstPocket && ballCount < 5 && score > 0) {
    awardBadge('first-pocket', { ballsSunk: 5 - ballCount });
    badgeAwarded.firstPocket = true;
  }
  
  // Badge: Perfect Clear
  if (!badgeAwarded.perfectClear && ballCount === 0 && entities.length > 0) {
    awardBadge('perfect-clear', { score });
    badgeAwarded.perfectClear = true;
  }
  
  // Badge: High Score
  if (!badgeAwarded.highScore && score >= 10000) {
    awardBadge('high-score', { score });
    badgeAwarded.highScore = true;
  }
  
  // Badge: Black Hole Master
  if (!badgeAwarded.blackHoleMaster && entities.some(e => e instanceof BlackHole)) {
    const blackHole = entities.find(e => e instanceof BlackHole);
    if (blackHole && blackHole.dead) {
      awardBadge('black-hole-master', { score });
      badgeAwarded.blackHoleMaster = true;
    }
  }
  
  // Badge: Comet Storm
  const cometCount = entities.filter(e => e instanceof Comet).length;
  if (!badgeAwarded.cometStorm && cometCount >= 5) {
    awardBadge('comet-storm', { cometCount, score });
    badgeAwarded.cometStorm = true;
  }
  
  // Badge: Solar Flare Survivor
  if (!badgeAwarded.solarFlare && currentMechanic === 'SOLAR_FLARE' && solarFlareTimer > 2.0) {
    awardBadge('solar-flare-survivor', { score });
    badgeAwarded.solarFlare = true;
  }
  
  // ... rest of existing update code ...
}
```

---

## 🚀 Upload Process

### 1. Prepare Game Package

Ensure your game folder structure:
```
vector-pool-asteroids/
├── index.html          ✓ (already exists)
├── main.js            ✓ (needs badge integration)
├── renderer.js        ✓
├── background.js      ✓
├── input.js           ✓
├── entities.js        ✓
├── math.js            ✓
├── shaders.js         ✓
└── style.css          ✓
```

### 2. Create game.json (Required)

Create a `game.json` file in the root:

```json
{
  "name": "Vector Pool Asteroids",
  "version": "1.0.0",
  "description": "A vector graphics game combining Asteroids drift with billiards physics",
  "thumbnail": "thumbnail.png",
  "screenshot": "screenshot.png"
}
```

### 3. Upload via Hub Admin

1. Navigate to: `http://localhost:3000/admin/games/sandbox`
2. Upload your game folder as a ZIP file
3. The Hub will validate and process your game
4. Once validated, publish it

### 4. Test Badge Integration

After upload, test that badges are awarded:

```javascript
// In browser console while playing:
window.Wavelength.badges.list().then(badges => {
  console.log('Earned badges:', badges);
});
```

---

## 🎮 Badge Suggestions

Based on your game mechanics, here are badge ideas:

| Badge ID | Trigger | Description |
|----------|---------|-------------|
| `first-pocket` | Sink first ball | "First Pocket" |
| `perfect-clear` | Clear all balls | "Perfect Clear" |
| `high-score` | Score ≥ 10,000 | "High Score Master" |
| `black-hole-master` | Survive black hole | "Black Hole Navigator" |
| `white-hole-expert` | Use white hole effectively | "White Hole Expert" |
| `comet-storm` | Survive 5+ comets | "Comet Storm Survivor" |
| `solar-flare-survivor` | Survive solar flare | "Solar Flare Survivor" |
| `speed-demon` | High velocity collision | "Speed Demon" |
| `precision-shot` | Sink ball from far | "Precision Shot" |
| `chain-reaction` | Multiple splits in sequence | "Chain Reaction Master" |

---

## 🔍 Testing Checklist

Before uploading, verify:

- [ ] Game loads without errors
- [ ] SDK initializes (`window.Wavelength` exists)
- [ ] Badges can be awarded (check console)
- [ ] No external dependencies (all assets local)
- [ ] File sizes under limits (50MB total, 5MB per file)
- [ ] Works in iframe (test locally with iframe wrapper)

---

## 📚 SDK Reference

### Badge API

```javascript
// Award badge
await window.Wavelength.badges.award({
  badgeId: 'my-badge',
  badgeImage: 'data:image/png;base64,...', // Optional
  metadata: { score: 1000 }
});

// List earned badges
const badges = await window.Wavelength.badges.list();
```

### Context API

```javascript
// Game context
window.Wavelength.game.id          // Game ID
window.Wavelength.game.tenantId   // Always 'hub'
window.Wavelength.game.isHubGame   // Always true

// Player context
window.Wavelength.player.id         // null for anonymous
window.Wavelength.player.sessionId  // Always available
window.Wavelength.player.isAnonymous // true/false

// Full context
const context = window.Wavelength.getContext();
```

---

## 🆘 Troubleshooting

### SDK Not Available

If `window.Wavelength` is undefined:

1. **Check if game is loaded in Hub** - SDK only injects in Hub environment
2. **Wait for SDK** - Use `waitForSDK()` helper function
3. **Check console** - Look for SDK initialization messages

### Badges Not Awarding

1. **Check network** - Badge API requires network connection
2. **Check console** - Look for error messages
3. **Verify badge ID** - Must be valid string
4. **Test manually** - Try awarding badge in console

### Game Not Loading

1. **Check ES modules** - Ensure `type="module"` in script tag
2. **Check paths** - All imports must use relative paths
3. **Check file structure** - `index.html` must be at root
4. **Check console** - Look for import/module errors

---

## 📖 Additional Resources

- **SDK Quick Reference**: `docs/GAME_SDK_QUICK_REFERENCE.md`
- **Game Requirements**: `docs/GAME_REQUIREMENTS.md`
- **Migration Guide**: `docs/GAME_DEVELOPER_MIGRATION_GUIDE.md`

---

## ✅ Next Steps

1. **Integrate badge system** - Add badge awarding to your game
2. **Test locally** - Verify badges work before upload
3. **Create game.json** - Add metadata file
4. **Upload to Hub** - Use admin sandbox to upload
5. **Test in Hub** - Play game and verify badges award correctly

Good luck! 🚀

