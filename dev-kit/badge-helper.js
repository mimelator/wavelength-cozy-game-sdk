/**
 * Badge Helper for Games
 * 
 * Provides easy API for games to award badges
 * Injected into game iframe by GamePlayer
 */

class WavelengthBadgeHelper {
  constructor(context) {
    this.gameId = context.gameId;
    this.tenantId = context.tenantId;
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
    
    console.log('[WavelengthBadgeHelper] Initialized:', {
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
   * Award a badge to the player
   * @param {Object} params - Badge parameters
   * @param {string} params.badgeId - Badge identifier
   * @param {string} [params.badgeImage] - Base64 encoded badge image (optional)
   * @param {Object} [params.metadata] - Badge metadata (score, achievement, etc.)
   * @returns {Promise<Object>} Badge award result
   */
  async awardBadge(params) {
    const { badgeId, badgeImage, metadata = {} } = params;

    if (!badgeId) {
      throw new Error('Badge ID is required');
    }

    if (!this.gameId) {
      throw new Error('Game ID not available');
    }

    if (!this.tenantId) {
      throw new Error('Tenant ID not available');
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

      console.log('[WavelengthBadgeHelper] Badge awarded:', result);
      return result;
    } catch (error) {
      console.error('[WavelengthBadgeHelper] Error awarding badge:', error);
      throw error;
    }
  }

  /**
   * Get available badges for this game
   * @returns {Promise<Array>} Array of badge definitions
   */
  async getBadges() {
    try {
      const response = await fetch(`${this.apiBase}/games/${this.gameId}/badges`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to get badges');
      }

      return result.badges || [];
    } catch (error) {
      console.error('[WavelengthBadgeHelper] Error getting badges:', error);
      throw error;
    }
  }
}

// Auto-initialize if context is provided via postMessage or window property
if (window.parent && window.parent !== window) {
  // We're in an iframe - wait for context from parent
  window.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'wavelength-game-context') {
      window.WavelengthBadge = new WavelengthBadgeHelper(event.data.context);
      console.log('[WavelengthBadgeHelper] Context received from parent');
    }
  });

  // Also check if context was already set (for page reloads)
  if (window.wavelengthGameContext) {
    window.WavelengthBadge = new WavelengthBadgeHelper(window.wavelengthGameContext);
  }
} else {
  // Not in iframe - initialize with default context (for testing)
  console.warn('[WavelengthBadgeHelper] Not in iframe, using default context');
}