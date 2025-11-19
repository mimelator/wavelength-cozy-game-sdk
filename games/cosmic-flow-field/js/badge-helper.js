/**
 * Badge Helper for Cosmic Flow Field Game
 *
 * Provides easy API for awarding badges using the new Wavelength SDK
 * Migrated to SDK 2.0 - hub-only, anonymous games
 */

/**
 * Wait for Wavelength SDK to be available
 */
function waitForSDK(callback, maxAttempts = 50) {
  if (window.Wavelength) {
    callback();
  } else if (maxAttempts > 0) {
    setTimeout(() => waitForSDK(callback, maxAttempts - 1), 100);
  } else {
    console.warn('[Badge Helper] Wavelength SDK not available after timeout');
  }
}

/**
 * Badge Helper wrapper for Cosmic Flow Field
 * Uses the new Wavelength SDK for badge operations
 */
class CosmicFlowBadgeHelper {
  constructor() {
    this.awardedBadges = new Set(); // Track awarded badges to prevent duplicates
    this.sdkReady = false;

    // Wait for SDK to initialize
    waitForSDK(() => {
      this.sdkReady = true;
      console.log('[CosmicFlowBadgeHelper] SDK ready:', {
        gameId: window.Wavelength?.game?.id,
        tenantId: window.Wavelength?.game?.tenantId,
        isHubGame: window.Wavelength?.game?.isHubGame,
        sessionId: window.Wavelength?.player?.sessionId
      });
    });
  }

  /**
   * Award a badge to the player
   * @param {string|Object} badgeIdOrParams - Badge ID string or params object
   * @param {string} [badgeImage] - Base64 encoded badge image (optional)
   * @param {Object} [metadata] - Badge metadata (score, achievement, etc.)
   * @returns {Promise<Object>} Badge award result
   */
  async awardBadge(badgeIdOrParams, badgeImage, metadata = {}) {
    let badgeId, params;

    // Support both string and object formats
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

    // Prevent duplicate badges locally
    if (this.awardedBadges.has(badgeId)) {
      console.log('[CosmicFlowBadgeHelper] Badge already awarded:', badgeId);
      return { success: true, badgeId, duplicate: true };
    }

    // Wait for SDK if not ready
    if (!this.sdkReady) {
      await new Promise(resolve => waitForSDK(resolve));
      this.sdkReady = true;
    }

    // Use new Wavelength SDK
    if (window.Wavelength && window.Wavelength.badges) {
      try {
        const result = await window.Wavelength.badges.award({
          badgeId: badgeId,
          badgeImage: params.badgeImage || badgeImage,
          metadata: params.metadata || metadata
        });

        if (result && result.success !== false) {
          this.awardedBadges.add(badgeId);
          return { success: true, badgeId, ...result };
        }

        return result || { success: true, badgeId };
      } catch (error) {
        console.error('[CosmicFlowBadgeHelper] Failed to award badge:', error);
        return { success: false, error: error.message, badgeId };
      }
    } else {
      // Fallback: return success even if SDK not available
      console.warn('[CosmicFlowBadgeHelper] SDK not available, badge award simulated');
      return { success: false, error: 'SDK not available', badgeId, mode: 'local' };
    }
  }

  /**
   * Get available badges for this game
   * @returns {Promise<Array>} Array of badge definitions
   */
  async getBadges() {
    if (!this.sdkReady) {
      await new Promise(resolve => waitForSDK(resolve));
      this.sdkReady = true;
    }

    if (window.Wavelength && window.Wavelength.badges) {
      try {
        return await window.Wavelength.badges.list();
      } catch (error) {
        console.error('[CosmicFlowBadgeHelper] Failed to get badges:', error);
        return [];
      }
    }

    return [];
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CosmicFlowBadgeHelper;
}
