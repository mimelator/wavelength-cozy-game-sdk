# 🏆 Badge Integration & Validation Guide

Complete guide for implementing compliant badge systems in Wavelength Cozy Games.

## 🎯 Badge Validation Requirements

The Wavelength Hub validation system requires all games to implement a compliant badge system. Here are the **exact requirements** your game must meet:

### ✅ Badge Validation Checklist

Your game **MUST** include all of the following to pass validation:

#### 1. **Badge API Endpoint Calls** ✅
- **Required**: API calls to `/api/games/{gameId}/badges/award` or `badges/award`
- **Implementation**: Use WavelengthBadgeHelper for automatic compliance

#### 2. **Badge Helper Class** ✅  
- **Required**: `WavelengthBadgeHelper` or `badgeHelper` class in your code
- **Implementation**: Include and initialize the badge helper class

#### 3. **Badge Helper Script** ✅
- **Required**: File named `badge-helper.js` included in your HTML
- **Implementation**: Add `<script src="./js/badge-helper.js"></script>` to your index.html

#### 4. **Method Calls** ✅
- **Required**: Calls to `awardBadge()` or `.awardBadge(` methods
- **Implementation**: Use the badge helper's `awardBadge()` method, not custom implementations

#### 5. **Badge Helper Files** ✅
- **Required**: Files with both "badge" and "helper" in the filename
- **Implementation**: Create `js/badge-helper.js` or similar path

## 🚀 Quick Implementation

### Step 1: Create Badge Helper File

Create `js/badge-helper.js` in your game directory:

```javascript
/**
 * Badge Helper for [Your Game Name]
 *
 * Provides easy API for awarding badges based on game interactions
 */

// Only define WavelengthBadgeHelper if it doesn't already exist
if (typeof WavelengthBadgeHelper === 'undefined') {
  window.WavelengthBadgeHelper = class WavelengthBadgeHelper {
    constructor(context = {}) {
      this.gameId = context.gameId || 'your-game-id';
      this.tenantId = context.tenantId || null;
      this.playerId = context.playerId || null;
      this.sessionId = context.sessionId || this.generateSessionId();
      this.apiBase = context.apiBase || '/api';
      this.awardedBadges = new Set();

      console.log('[WavelengthBadgeHelper] Initialized:', {
        gameId: this.gameId,
        mode: this.gameId && this.tenantId ? 'production' : 'local'
      });
    }

    generateSessionId() {
      return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * Award a badge to the player - REQUIRED METHOD
     * @param {string|Object} badgeIdOrParams - Badge ID or params object
     * @param {string} [badgeImage] - Base64 encoded badge image
     * @param {Object} [metadata] - Badge metadata
     * @returns {Promise<Object>} Badge award result
     */
    async awardBadge(badgeIdOrParams, badgeImage, metadata = {}) {
      let badgeId, params;

      if (typeof badgeIdOrParams === 'string') {
        badgeId = badgeIdOrParams;
        params = { badgeId, badgeImage, metadata };
      } else {
        params = badgeIdOrParams || {};
        badgeId = params.badgeId;
      }

      if (!badgeId) {
        throw new Error('Badge ID is required');
      }

      if (this.awardedBadges.has(badgeId)) {
        return { success: true, badgeId, duplicate: true };
      }

      this.awardedBadges.add(badgeId);

      // For local testing
      if (!this.gameId || !this.tenantId) {
        console.log('[WavelengthBadgeHelper] Local mode - simulating badge award:', badgeId);
        this.showBadgeNotification(badgeId);
        return { success: true, badgeId, mode: 'local' };
      }

      try {
        // REQUIRED API ENDPOINT - DO NOT CHANGE
        const response = await fetch(`${this.apiBase}/games/${this.gameId}/badges/award`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Game-Tenant': this.tenantId,
            'X-Game-Session': this.sessionId
          },
          body: JSON.stringify({
            badgeId,
            playerId: this.playerId,
            sessionId: this.sessionId,
            badgeImage: params.badgeImage,
            metadata: params.metadata
          })
        });

        const result = await response.json();
        if (!response.ok) {
          throw new Error(result.error || 'Failed to award badge');
        }

        this.showBadgeNotification(badgeId);
        return result;
      } catch (error) {
        console.error('[WavelengthBadgeHelper] Error awarding badge:', error);
        this.showBadgeNotification(badgeId);
        throw error;
      }
    }

    showBadgeNotification(badgeId) {
      // Your badge notification implementation
      console.log(`🏆 Badge earned: ${badgeId}`);
    }
  }

  // Auto-initialize
  window.badgeHelper = new WavelengthBadgeHelper();
}
```

### Step 2: Include Script in HTML

Add to your `index.html` **before** your game code:

```html
<!DOCTYPE html>
<html>
<head>
    <title>Your Game</title>
    <!-- Other head content -->
    
    <!-- REQUIRED: Badge Helper Script -->
    <script src="./js/badge-helper.js"></script>
</head>
<body>
    <!-- Your game content -->
    <script>
        // Your game code here
    </script>
</body>
</html>
```

### Step 3: Use Badge Helper in Game Code

Replace any custom badge awarding with the helper:

```javascript
// ❌ INCORRECT - Will fail validation
function awardCustomBadge(badgeId) {
    fetch('/api/badges', { /* custom implementation */ });
}

// ✅ CORRECT - Will pass validation
async function awardGameBadge(badgeId, metadata = {}) {
    if (window.badgeHelper) {
        try {
            await window.badgeHelper.awardBadge(badgeId, null, metadata);
            console.log('Badge awarded successfully');
        } catch (error) {
            console.error('Badge award failed:', error);
        }
    }
}

// Usage examples
await awardGameBadge('first_level_complete', { level: 1, score: 100 });
await awardGameBadge('high_score', { score: 5000, timestamp: Date.now() });
```

## 🎮 Complete Game Integration Example

Here's a complete example showing proper badge integration:

```javascript
// Badge Manager Class - COMPLIANT IMPLEMENTATION
class BadgeManager {
    constructor() {
        this.startTime = Date.now();
        this.gameStats = {
            score: 0,
            level: 1,
            interactions: 0
        };
        this.awardedBadges = new Set();
        
        // Wait for badge helper to be available
        this.initializeBadgeHelper();
    }

    async initializeBadgeHelper() {
        // Ensure badge helper is ready
        let attempts = 0;
        while (!window.badgeHelper && attempts < 30) {
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
        }
        
        if (window.badgeHelper) {
            console.log('✅ Badge helper ready');
        } else {
            console.warn('⚠️ Badge helper not available');
        }
    }

    async checkAchievements() {
        const timeElapsed = (Date.now() - this.startTime) / 1000;
        
        // Time-based badges
        if (timeElapsed > 300 && !this.awardedBadges.has('explorer')) {
            await this.awardBadge('explorer', { 
                timeElapsed: timeElapsed,
                achievement: 'Played for 5 minutes'
            });
        }

        // Score-based badges  
        if (this.gameStats.score > 1000 && !this.awardedBadges.has('high_scorer')) {
            await this.awardBadge('high_scorer', {
                score: this.gameStats.score,
                achievement: 'Reached high score'
            });
        }
    }

    async awardBadge(badgeId, metadata = {}) {
        if (this.awardedBadges.has(badgeId)) return;
        
        this.awardedBadges.add(badgeId);
        
        // REQUIRED: Use WavelengthBadgeHelper.awardBadge() method
        if (window.badgeHelper && typeof window.badgeHelper.awardBadge === 'function') {
            try {
                await window.badgeHelper.awardBadge(badgeId, null, metadata);
                console.log(`🏆 Badge awarded: ${badgeId}`);
            } catch (error) {
                console.error('Badge award error:', error);
            }
        } else {
            console.warn('Badge helper not available for:', badgeId);
        }
    }

    // Call this regularly in your game loop
    update() {
        this.checkAchievements();
    }
}

// Initialize badge manager
const badgeManager = new BadgeManager();

// Example game events
function onLevelComplete(level, score) {
    badgeManager.gameStats.level = level;
    badgeManager.gameStats.score = score;
    badgeManager.update();
}

function onPlayerInteraction() {
    badgeManager.gameStats.interactions++;
    badgeManager.update();
}
```

## 🔍 Validation Troubleshooting

### Common Validation Failures

#### ❌ "No badge helper class found"
**Problem**: Missing WavelengthBadgeHelper class
**Solution**: 
```javascript
// Ensure this exists in your code:
window.WavelengthBadgeHelper = class WavelengthBadgeHelper { /* implementation */ }
// And this:
window.badgeHelper = new WavelengthBadgeHelper();
```

#### ❌ "No badge-helper.js file found"  
**Problem**: Missing or incorrectly named badge helper file
**Solution**: Create file with exact name `badge-helper.js` containing "badge" and "helper"

#### ❌ "No awardBadge method calls found"
**Problem**: Using custom badge methods instead of awardBadge()
**Solution**:
```javascript
// ❌ Wrong:
customBadgeFunction();
sendBadgeToAPI();

// ✅ Correct:
window.badgeHelper.awardBadge(badgeId);
await badgeHelper.awardBadge(badgeId);
```

#### ❌ "Invalid API endpoint"
**Problem**: Using custom API endpoints
**Solution**: Use WavelengthBadgeHelper which automatically calls `/api/games/{gameId}/badges/award`

#### ❌ "Badge helper script not included"
**Problem**: Missing script tag in HTML
**Solution**:
```html
<!-- Add this to your index.html -->
<script src="./js/badge-helper.js"></script>
```

## 📋 Validation Checklist

Before submitting your game, verify:

- [ ] File named `badge-helper.js` exists and is included in HTML
- [ ] `WavelengthBadgeHelper` class is defined in the badge helper file
- [ ] `window.badgeHelper` instance is created
- [ ] Game code calls `badgeHelper.awardBadge()` method (not custom methods)
- [ ] API calls are made to `/api/games/{gameId}/badges/award` endpoint
- [ ] Badge helper handles both local testing and production modes
- [ ] Error handling is implemented for badge operations
- [ ] Game respects badge timing requirements (no spam awarding)


When your badge system is compliant, you automatically get:

- **Automatic Badge Gallery** integration  
- **Professional Badge Notifications** for players
- **Cross-Game Badge Collections** for players
- **Merchandise Generation** from badge designs
- **Analytics Dashboard** for badge engagement

## 🛠️ Testing Your Implementation

### Local Testing
1. Ensure your badge helper shows console logs: `Badge helper ready`
2. Test badge awarding: Should show `Badge awarded: [badge-id]`  
3. Verify no console errors during badge operations

### Validation Testing
1. Upload to Wavelength Hub sandbox
2. Run automated validation scan
3. Check validation report for any failures
4. Fix issues and re-validate

### Production Testing  
1. Deploy to production environment
2. Test badge earning in live game
3. Verify badges appear in player gallery

## 📚 Additional Resources

- **[Badge Development Kit](../dev-kit/README.md)** - Local testing tools
- **[Game Templates](../../templates/)** - Examples with compliant badge systems
- **[API Documentation](../api/badges.md)** - Complete badge API reference

---

> **🎯 Pro Tip**: The fastest way to ensure compliance is to copy the badge helper from a working template and modify the badge definitions for your specific game mechanics.

*This guide ensures 100% validation compliance. For support, visit our [GitHub Issues](https://github.com/mimelator/wavelength-cozy-game-sdk/issues).*