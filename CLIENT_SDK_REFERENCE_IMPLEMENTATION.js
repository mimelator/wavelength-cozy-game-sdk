/**
 * Wavelength SDK 2.0 - Reference Implementation
 *
 * This is a reference implementation for the Wavelength Cozy Game SDK update.
 * Copy and adapt this code to the Wavelength Cozy Game SDK repository.
 *
 * ⚠️ Important: This is for the Wavelength Cozy Game SDK (for games),
 * NOT the client SDK (@wavelength/client-sdk which is for tenant plugins).
 *
 * Repository: https://github.com/mimelator/wavelength-cozy-game-vibe-sdk
 */

/**
 * Wavelength SDK 2.0
 * Provides game context, player context, and badge functionality
 */
class WavelengthSDK {
  constructor(context) {
    // Handle undefined or null context gracefully
    if (!context) {
      console.warn('[WavelengthSDK] Context is undefined, using defaults');
      context = {};
    }

    this.context = context;
    this.gameId = context.gameId || 'unknown';
    this.tenantId = context.tenantId || 'hub';
    this.playerId = context.playerId || null;
    this.sessionId = context.sessionId || this.generateSessionId();
    this.apiBase = context.apiBase || '/api';

    // Store session ID in localStorage for persistence across page reloads
    if (!this.playerId) {
      const storedSessionId = localStorage.getItem('wavelength_game_session');
      if (storedSessionId) {
        this.sessionId = storedSessionId;
      } else {
        localStorage.setItem('wavelength_game_session', this.sessionId);
      }
    }

    console.log('[WavelengthSDK] Initialized:', {
      gameId: this.gameId,
      tenantId: this.tenantId,
      hasPlayerId: !!this.playerId,
      sessionId: this.sessionId
    });
  }

  /**
   * Generate a session ID for anonymous players
   */
  generateSessionId() {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  /**
   * Game context getter
   */
  get game() {
    return {
      id: this.gameId,
      tenantId: this.tenantId,
      isHubGame: this.tenantId === 'hub'
    };
  }

  /**
   * Player context getter
   */
  get player() {
    return {
      id: this.playerId,
      sessionId: this.sessionId,
      isAnonymous: !this.playerId
    };
  }

  /**
   * Badge API getter
   */
  get badges() {
    const self = this;
    return {
      /**
       * Award a badge to the player
       * @param {Object} params - Badge parameters
       * @param {string} params.badgeId - Badge identifier
       * @param {string} [params.badgeImage] - Base64 encoded badge image (optional)
       * @param {Object} [params.metadata] - Badge metadata (score, achievement, etc.)
       * @returns {Promise<Object>} Badge award result
       */
      award: async (params) => {
        const { badgeId, badgeImage, metadata = {} } = params;

        if (!badgeId) {
          throw new Error('Badge ID is required');
        }

        if (!self.gameId || self.gameId === 'unknown') {
          throw new Error('Game ID not available');
        }

        if (!self.tenantId) {
          throw new Error('Tenant ID not available');
        }

        try {
          const response = await fetch(`${self.apiBase}/games/${self.gameId}/badges/award`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-Game-Tenant': self.tenantId,
              'X-Game-Session': self.sessionId
            },
            body: JSON.stringify({
              badgeId,
              playerId: self.playerId,
              sessionId: self.sessionId,
              badgeImage,
              metadata
            })
          });

          const result = await response.json();

          if (!response.ok) {
            throw new Error(result.error || 'Failed to award badge');
          }

          console.log('[WavelengthSDK] Badge awarded:', result);
          return result;
        } catch (error) {
          console.error('[WavelengthSDK] Error awarding badge:', error);
          throw error;
        }
      },

      /**
       * Get available badges for this game
       * @returns {Promise<Array>} Array of badge definitions
       */
      list: async () => {
        try {
          const response = await fetch(`${self.apiBase}/games/${self.gameId}/badges`);
          const result = await response.json();

          if (!response.ok) {
            throw new Error(result.error || 'Failed to get badges');
          }

          return result.badges || [];
        } catch (error) {
          console.error('[WavelengthSDK] Error getting badges:', error);
          throw error;
        }
      }
    };
  }

  /**
   * Get full context object
   * @returns {Object} Full context including gameId, tenantId, playerId, etc.
   */
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

  /**
   * SDK version
   */
  get version() {
    return '1.0.0';
  }
}

/**
 * Initialize Wavelength SDK
 * Called when game context is available
 */
function initWavelengthSDK(context) {
  // Create SDK instance
  const sdk = new WavelengthSDK(context);

  // Expose as window.Wavelength with the expected structure
  window.Wavelength = {
    // Game context (read-only)
    get game() {
      return sdk.game;
    },

    // Player context (read-only)
    get player() {
      return sdk.player;
    },

    // Badge API
    get badges() {
      return sdk.badges;
    },

    // Context access
    getContext: () => sdk.getContext(),

    // Version
    get version() {
      return sdk.version;
    }
  };

  // Backward compatibility: expose WavelengthBadgeHelper for old games
  if (typeof WavelengthBadgeHelper === 'undefined') {
    window.WavelengthBadgeHelper = class WavelengthBadgeHelper {
      constructor(ctx) {
        this.sdk = new WavelengthSDK(ctx);
      }

      async awardBadge(params) {
        // Support both old and new parameter formats
        if (typeof params === 'string') {
          return await this.sdk.badges.award({ badgeId: params });
        }
        return await this.sdk.badges.award(params);
      }

      async getBadges() {
        return await this.sdk.badges.list();
      }

      get sessionId() {
        return this.sdk.sessionId;
      }

      get gameId() {
        return this.sdk.gameId;
      }

      get tenantId() {
        return this.sdk.tenantId;
      }

      get playerId() {
        return this.sdk.playerId;
      }
    };
  }

  console.log('[Wavelength SDK] Initialized:', {
    gameId: context.gameId,
    tenantId: context.tenantId,
    isHubGame: context.isHubGame || context.tenantId === 'hub',
    hasPlayer: !!context.playerId,
    sessionId: sdk.sessionId
  });
}

// Auto-initialize if context is already available
if (window.wavelengthGameContext) {
  initWavelengthSDK(window.wavelengthGameContext);
}

// Listen for context from parent (if game is in iframe)
if (window.parent && window.parent !== window) {
  window.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'wavelength-game-context') {
      initWavelengthSDK(event.data.context);
    }
  });
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { WavelengthSDK, initWavelengthSDK };
}

