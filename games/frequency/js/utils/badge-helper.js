/**
 * Badge Helper for Frequency Game
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
 * Badge Helper wrapper for Frequency
 * Uses the new Wavelength SDK for badge operations
 */
class FrequencyBadgeHelper {
  constructor() {
    this.awardedBadges = new Set(); // Track awarded badges to prevent duplicates
    this.sdkReady = false;

    // Wait for SDK to initialize
    waitForSDK(() => {
      this.sdkReady = true;
      console.log('[FrequencyBadgeHelper] SDK ready:', {
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
      console.log('[FrequencyBadgeHelper] Badge already awarded:', badgeId);
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
          this.showBadgeNotification(badgeId);
          return { success: true, badgeId, ...result };
        }

        return result || { success: true, badgeId };
      } catch (error) {
        console.error('[FrequencyBadgeHelper] Failed to award badge:', error);
        // Still show local notification for better UX
        this.showBadgeNotification(badgeId);
        return { success: false, error: error.message, badgeId };
      }
    } else {
      // Fallback: show notification even if SDK not available
      console.warn('[FrequencyBadgeHelper] SDK not available, showing local notification only');
      this.showBadgeNotification(badgeId);
      return { success: false, error: 'SDK not available', badgeId, mode: 'local' };
    }
  }

  /**
   * Show visual badge notification
   * @param {string} badgeId - Badge identifier
   */
  showBadgeNotification(badgeId) {
    // Frequency badge definitions for display
    const badges = {
      first_tone: { name: "First Tone", rarity: "common", emoji: "🎵" },
      frequency_explorer: { name: "Frequency Explorer", rarity: "uncommon", emoji: "🔊" },
      sound_weaver: { name: "Sound Weaver", rarity: "rare", emoji: "🎶" },
      meditation_master: { name: "Meditation Master", rarity: "epic", emoji: "🧘" },
      harmonic_genius: { name: "Harmonic Genius", rarity: "legendary", emoji: "✨" }
    };

    const badge = badges[badgeId];
    if (!badge) {
      console.warn('[FrequencyBadgeHelper] Unknown badge ID:', badgeId);
      return;
    }

    const container = document.getElementById('badge-notifications') || this.createNotificationContainer();

    const notification = document.createElement('div');
    notification.className = `badge-notification ${badge.rarity}`;
    notification.innerHTML = `
      <div style="font-size: 24px; margin-bottom: 5px;">${badge.emoji}</div>
      <div>Badge Earned!</div>
      <div style="font-size: 16px; margin-top: 5px;">${badge.name}</div>
    `;

    container.appendChild(notification);

    // Remove notification after animation
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 3000);
  }

  /**
   * Create notification container if it doesn't exist
   */
  createNotificationContainer() {
    const container = document.createElement('div');
    container.id = 'badge-notifications';
    container.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      z-index: 1000;
      pointer-events: none;
    `;
    document.body.appendChild(container);
    return container;
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
        console.error('[FrequencyBadgeHelper] Failed to get badges:', error);
        return [];
      }
    }

    return [];
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = FrequencyBadgeHelper;
}
