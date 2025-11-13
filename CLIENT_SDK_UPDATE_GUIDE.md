# 🔧 Wavelength Cozy Game SDK Update Guide - SDK 2.0

**For:** Maintenance Team
**Date:** January 2025
**Priority:** High - Required for game compatibility

---

## 📋 Overview

The Wavelength Hub games have been migrated to use **Wavelength SDK 2.0**. The **Wavelength Cozy Game SDK** repository needs to be updated to provide the new SDK structure (`window.Wavelength`) that games now expect.

**⚠️ Important:** This is the **Wavelength Cozy Game SDK** (for games), NOT the client SDK (`@wavelength/client-sdk` which is for tenant plugins).

**Repository:** https://github.com/mimelator/wavelength-cozy-game-vibe-sdk
**Note:** This SDK provides `window.Wavelength` for games, separate from the client SDK used by tenant plugins.

---

## 🔍 SDK Distinction

To avoid confusion, here's the difference:

### Wavelength Cozy Game SDK (This Update)
- **Purpose:** Provides `window.Wavelength` SDK for games
- **Used by:** Hub games (autumn-grove, constellation-canvas, etc.)
- **Repository:** `wavelength-cozy-game-vibe-sdk`
- **Provides:** Game context, player context, badge API
- **This is what needs to be updated**

### Client SDK (`@wavelength/client-sdk`)
- **Purpose:** Provides `window.WavelengthHub` SDK for tenant plugins
- **Used by:** Tenant site plugins (content enhancers, chat widgets, etc.)
- **Repository:** `wavelength-lore-client-sdk`
- **Provides:** Tenant API, theme API, content API
- **NOT what this guide is about**

**This guide is ONLY for updating the Wavelength Cozy Game SDK.**

---

## 🎯 What Needs to Be Updated

Games now expect `window.Wavelength` SDK with the following structure:

```javascript
window.Wavelength = {
  game: {
    id: string,           // Game ID (e.g., 'autumn-grove-1-0-2')
    tenantId: string,     // Always 'hub' for hub games
    isHubGame: boolean    // Always true for hub games
  },
  player: {
    id: string | null,    // Player ID (null for anonymous players)
    sessionId: string,    // Session ID (always available)
    isAnonymous: boolean  // true if player is not logged in
  },
  badges: {
    award: (params) => Promise<Object>,  // Award a badge
    list: () => Promise<Array>            // List available badges
  },
  getContext: () => Object,  // Get full context object
  version: '1.0.0'
}
```

---

## 🔄 Migration Requirements

### 1. SDK Structure

The client SDK must provide `window.Wavelength` with the exact structure above. Games are already migrated and expect this API.

### 2. Badge API Changes

**Old API (deprecated but should still work):**
```javascript
window.WavelengthBadge.awardBadge({ badgeId: 'my-badge' })
```

**New API (required):**
```javascript
await window.Wavelength.badges.award({ badgeId: 'my-badge' })
```

### 3. Context Access

**Old way:**
```javascript
const gameId = window.wavelengthGameContext.gameId;
const tenantId = window.wavelengthGameContext.tenantId;
```

**New way:**
```javascript
const gameId = window.Wavelength.game.id;
const tenantId = window.Wavelength.game.tenantId; // Always 'hub'
const isHubGame = window.Wavelength.game.isHubGame;
```

---

## 📝 Implementation Guide

### Step 1: Create Wavelength SDK Module

Create a new module or update existing code to provide the SDK structure:

```javascript
/**
 * Wavelength SDK 2.0
 * Provides game context, player context, and badge functionality
 */
class WavelengthSDK {
  constructor(context) {
    this.context = context || {};
    this.gameId = context.gameId || 'unknown';
    this.tenantId = context.tenantId || 'hub';
    this.playerId = context.playerId || null;
    this.sessionId = context.sessionId || this.generateSessionId();
    this.apiBase = context.apiBase || '/api';

    // Store session ID for anonymous players
    if (!this.playerId) {
      const storedSessionId = localStorage.getItem('wavelength_game_session');
      if (storedSessionId) {
        this.sessionId = storedSessionId;
      } else {
        localStorage.setItem('wavelength_game_session', this.sessionId);
      }
    }
  }

  generateSessionId() {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  // Game context
  get game() {
    return {
      id: this.gameId,
      tenantId: this.tenantId,
      isHubGame: this.tenantId === 'hub'
    };
  }

  // Player context
  get player() {
    return {
      id: this.playerId,
      sessionId: this.sessionId,
      isAnonymous: !this.playerId
    };
  }

  // Badge API
  get badges() {
    return {
      award: async (params) => {
        const { badgeId, badgeImage, metadata = {} } = params;

        if (!badgeId) {
          throw new Error('Badge ID is required');
        }

        if (!this.gameId || this.gameId === 'unknown') {
          throw new Error('Game ID not available');
        }

        try {
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
              badgeImage,
              metadata
            })
          });

          const result = await response.json();

          if (!response.ok) {
            throw new Error(result.error || 'Failed to award badge');
          }

          return result;
        } catch (error) {
          console.error('[Wavelength SDK] Error awarding badge:', error);
          throw error;
        }
      },

      list: async () => {
        try {
          const response = await fetch(`${this.apiBase}/games/${this.gameId}/badges`);
          const result = await response.json();

          if (!response.ok) {
            throw new Error(result.error || 'Failed to get badges');
          }

          return result.badges || [];
        } catch (error) {
          console.error('[Wavelength SDK] Error getting badges:', error);
          throw error;
        }
      }
    };
  }

  // Get full context
  getContext() {
    return {
      gameId: this.gameId,
      tenantId: this.tenantId,
      playerId: this.playerId,
      sessionId: this.sessionId,
      apiBase: this.apiBase,
      isHubGame: this.tenantId === 'hub'
    };
  }

  // Version
  get version() {
    return '1.0.0';
  }
}
```

### Step 2: Initialize SDK

The SDK should be initialized when games load. Reference implementation from hub:

```javascript
/**
 * Initialize Wavelength SDK
 * Called by game player when game iframe loads
 */
function initWavelengthSDK(context) {
  // Create SDK instance
  const sdk = new WavelengthSDK(context);

  // Expose as window.Wavelength
  window.Wavelength = {
    game: sdk.game,
    player: sdk.player,
    badges: sdk.badges,
    getContext: () => sdk.getContext(),
    version: sdk.version
  };

  // Backward compatibility: expose WavelengthBadgeHelper if needed
  // (for games that haven't migrated yet)
  if (typeof WavelengthBadgeHelper === 'undefined') {
    window.WavelengthBadgeHelper = class {
      constructor(ctx) {
        this.sdk = new WavelengthSDK(ctx);
      }
      async awardBadge(params) {
        return await this.sdk.badges.award(params);
      }
      async getBadges() {
        return await this.sdk.badges.list();
      }
      get sessionId() {
        return this.sdk.sessionId;
      }
    };
  }

  console.log('[Wavelength SDK] Initialized:', {
    gameId: context.gameId,
    tenantId: context.tenantId,
    isHubGame: context.isHubGame,
    hasPlayer: !!context.playerId
  });
}

// Auto-initialize if context is provided
if (window.wavelengthGameContext) {
  initWavelengthSDK(window.wavelengthGameContext);
}

// Listen for context from parent (if in iframe)
if (window.parent && window.parent !== window) {
  window.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'wavelength-game-context') {
      initWavelengthSDK(event.data.context);
    }
  });
}
```

### Step 3: Context Injection

Games receive context via `window.wavelengthGameContext` or postMessage. The SDK should handle both:

```javascript
// Context structure expected:
const context = {
  gameId: 'autumn-grove-1-0-2',
  tenantId: 'hub',
  playerId: null,  // null for anonymous players
  sessionId: 'session_...',  // optional, will be generated if missing
  apiBase: '/api',  // optional, defaults to '/api'
  isHubGame: true
};
```

---

## ✅ Testing Requirements

### Test 1: SDK Initialization

```javascript
// After SDK loads, verify:
console.assert(window.Wavelength !== undefined, 'SDK should exist');
console.assert(window.Wavelength.game !== undefined, 'Game context should exist');
console.assert(window.Wavelength.player !== undefined, 'Player context should exist');
console.assert(window.Wavelength.badges !== undefined, 'Badges API should exist');
console.assert(typeof window.Wavelength.getContext === 'function', 'getContext should be a function');
```

### Test 2: Game Context

```javascript
const game = window.Wavelength.game;
console.assert(game.id !== undefined, 'Game ID should exist');
console.assert(game.tenantId === 'hub', 'Tenant ID should be hub');
console.assert(game.isHubGame === true, 'isHubGame should be true');
```

### Test 3: Player Context

```javascript
const player = window.Wavelength.player;
console.assert(player.sessionId !== undefined, 'Session ID should exist');
console.assert(typeof player.isAnonymous === 'boolean', 'isAnonymous should be boolean');
```

### Test 4: Badge API

```javascript
// Test badge award
try {
  const result = await window.Wavelength.badges.award({
    badgeId: 'test-badge',
    metadata: { test: true }
  });
  console.log('Badge awarded:', result);
} catch (error) {
  console.error('Badge award failed:', error);
}

// Test badge list
try {
  const badges = await window.Wavelength.badges.list();
  console.log('Available badges:', badges);
} catch (error) {
  console.error('Badge list failed:', error);
}
```

### Test 5: Context Access

```javascript
const context = window.Wavelength.getContext();
console.assert(context.gameId !== undefined, 'Context should have gameId');
console.assert(context.tenantId !== undefined, 'Context should have tenantId');
console.assert(context.sessionId !== undefined, 'Context should have sessionId');
```

---

## 🔍 Reference Implementation

The hub's implementation can be found at:
- **Badge Helper:** `/Volumes/5bits/current/wavelength-dev/wavelength-hub/public/js/badge-helper.js`
- **Game Player:** `/Volumes/5bits/current/wavelength-dev/wavelength-hub/public/js/game-player.js` (lines 190-240)

These files show exactly how the SDK is initialized and structured.

---

## 📦 Distribution

### NPM Package

After updating, publish to NPM (if applicable):

```bash
cd wavelength-cozy-game-vibe-sdk
npm version patch  # or minor/major
npm run build
npm publish --access public  # Only if SDK is published to NPM
```

**Note:** The Wavelength Cozy Game SDK may be distributed differently than the client SDK. Check the repository for distribution method.

### CDN Distribution

If the Wavelength Cozy Game SDK is distributed via CDN, ensure the built files are available:
- Check the repository for specific file names and distribution method
- Files may be served from the hub directly or via CDN
- Verify games can load the SDK correctly

---

## 🚨 Breaking Changes

### What Changed

1. **New SDK Structure:** Games now use `window.Wavelength` instead of `window.WavelengthBadge`
2. **Badge API:** Method changed from `awardBadge()` to `badges.award()`
3. **Context Access:** Games use `window.Wavelength.game` instead of `window.wavelengthGameContext`

### Backward Compatibility

**Important:** Maintain backward compatibility with old API:

```javascript
// Old API should still work (for games not yet migrated)
if (window.WavelengthBadge) {
  await window.WavelengthBadge.awardBadge({ badgeId: 'my-badge' });
}

// New API (preferred)
if (window.Wavelength) {
  await window.Wavelength.badges.award({ badgeId: 'my-badge' });
}
```

---

## 📚 Documentation Updates

Update Wavelength Cozy Game SDK documentation to include:

1. **SDK 2.0 API Reference**
   - Game context access
   - Player context access
   - Badge API methods
   - Context getter

2. **Migration Guide**
   - How to migrate from old API
   - Examples of new API usage

3. **Examples**
   - Basic badge awarding
   - Context access
   - Error handling

---

## ✅ Checklist

- [ ] Create/update WavelengthSDK class in Wavelength Cozy Game SDK repo
- [ ] Implement `window.Wavelength` structure
- [ ] Implement badge API (`badges.award`, `badges.list`)
- [ ] Implement context access (`game`, `player`, `getContext`)
- [ ] Add session ID persistence for anonymous players
- [ ] Maintain backward compatibility with old API
- [ ] Add initialization logic for iframe and direct contexts
- [ ] Write unit tests for SDK functionality
- [ ] Test with migrated games
- [ ] Update Wavelength Cozy Game SDK documentation
- [ ] Build and distribute SDK (check repo for distribution method)
- [ ] Verify SDK is loaded correctly by games

---

## 🐛 Common Issues

### Issue: SDK Not Initializing

**Symptoms:** `window.Wavelength` is undefined

**Solutions:**
- Check that SDK script loads before games
- Verify context is provided (`window.wavelengthGameContext`)
- Check browser console for initialization errors

### Issue: Badge Award Fails

**Symptoms:** `badges.award()` throws error

**Solutions:**
- Verify game ID is set correctly
- Check API endpoint is correct (`/api/games/{gameId}/badges/award`)
- Verify session ID is generated/stored
- Check network requests in browser DevTools

### Issue: Session ID Not Persisting

**Symptoms:** Session ID changes on page reload

**Solutions:**
- Verify localStorage is available
- Check localStorage key: `wavelength_game_session`
- Ensure session ID is stored before page unload

---

## 📞 Support

If you encounter issues:

1. **Check Hub Implementation:** Reference `/Volumes/5bits/current/wavelength-dev/wavelength-hub/public/js/badge-helper.js`
2. **Review Migration Guide:** See `/Volumes/5bits/current/wavelength-dev/wavelength-hub/docs/GAME_DEVELOPER_MIGRATION_GUIDE.md`
3. **Test with Games:** Use migrated games to verify SDK works correctly

---

## 📋 Games Using SDK 2.0

All these games have been migrated and expect the new SDK:

- autumn-grove-1-0-2
- constellation-canvas-1-0-2
- cosmic-flow-field-1-0-0
- cosmic-pool-collector-1-0-1
- frequency-1-0-1
- garden-defender-1-0-0
- mood-melodies-1-0-0
- nature-sounds-1-0-0

**Test with these games to verify SDK compatibility.**

---

**Last Updated:** January 2025
**SDK Version:** 1.0.0
**Priority:** High - Games are already migrated and require this SDK

---

## 📌 Quick Reference

- **Repository to Update:** `wavelength-cozy-game-vibe-sdk` (NOT `wavelength-lore-client-sdk`)
- **What It Provides:** `window.Wavelength` SDK for games
- **Different From:** `@wavelength/client-sdk` (which provides `window.WavelengthHub` for plugins)
- **Status:** All 8 games migrated and waiting for SDK update

