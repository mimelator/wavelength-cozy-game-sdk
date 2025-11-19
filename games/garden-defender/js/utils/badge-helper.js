// 🏆 Wavelength Badge System Helper - Garden Defender
// Migrated to SDK 2.0 - hub-only, anonymous games

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
 * Badge Helper wrapper for Garden Defender
 * Uses the new Wavelength SDK for badge operations
 */
class GardenDefenderBadgeHelper {
    constructor() {
        this.awardedBadges = new Set();
        this.sdkReady = false;

        // Wait for SDK to initialize
        waitForSDK(() => {
            this.sdkReady = true;
            console.log('[GardenDefenderBadgeHelper] SDK ready:', {
                gameId: window.Wavelength?.game?.id,
                tenantId: window.Wavelength?.game?.tenantId,
                isHubGame: window.Wavelength?.game?.isHubGame,
                sessionId: window.Wavelength?.player?.sessionId
            });
        });
    }

    async awardBadge(badgeId, context = {}) {
        try {
            console.log(`[GardenDefenderBadgeHelper] Attempting to award badge: ${badgeId}`, context);

            // Wait for SDK if not ready
            if (!this.sdkReady) {
                await new Promise(resolve => waitForSDK(resolve));
                this.sdkReady = true;
            }

            // Use new Wavelength SDK
            if (window.Wavelength && window.Wavelength.badges) {
                const result = await window.Wavelength.badges.award({
                    badgeId: badgeId,
                    metadata: context
                });

                console.log(`[GardenDefenderBadgeHelper] Badge awarded successfully:`, result);
                return { success: true, data: result };
            } else {
                console.warn('[GardenDefenderBadgeHelper] SDK not available, badge award simulated');
                return { success: false, error: 'SDK not available', mode: 'local' };
            }
        } catch (error) {
            console.error(`[GardenDefenderBadgeHelper] Error awarding badge:`, error);
            return { success: false, error: error.message };
        }
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GardenDefenderBadgeHelper;
}
