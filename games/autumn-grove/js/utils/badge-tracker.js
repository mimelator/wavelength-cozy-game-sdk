/**
 * Badge Tracker for Autumn Grove
 *
 * Tracks player achievements and awards badges for autumn treasure collection
 * Uses inline badge configuration for self-contained game
 */
class AutumnBadgeTracker {
    constructor(badgeHelper) {
        this.badgeHelper = badgeHelper;

        // Inline badge configuration (no external dependencies)
        this.BADGE_CONFIG = {
            INITIAL_GRACE_PERIOD: 0, // No grace period for immediate engagement
            RATE_LIMIT: 5000, // 5 seconds between badges
        };

        this.gameStats = {
            itemsCollected: 0,
            totalScore: 0,
            rarityCollected: new Set(),
            legendaryFound: false,
            sessionStartTime: Date.now(),
            spiritLevel: 1,
            perfectCollection: 0,
            autumnMagicUsed: 0
        };

        // Use inline configuration for timing
        this.lastBadgeAwarded = 0;

        console.log('[AutumnBadgeTracker] Initialized with inline badge config');
    }

    /**
     * Track when an autumn item is collected
     */
    onItemCollected(item) {
        this.gameStats.itemsCollected++;
        this.gameStats.totalScore += item.value || 0;
        this.gameStats.rarityCollected.add(item.rarity);

        if (item.rarity === 'legendary') {
            this.gameStats.legendaryFound = true;
        }

        console.log(`[Badge Tracker] Item collected: ${item.name} (${item.rarity}). Total: ${this.gameStats.itemsCollected}`);

        this.checkBadgeAchievements();
    }

    /**
     * Track when autumn magic is used
     */
    onAutumnMagic() {
        this.gameStats.autumnMagicUsed++;
        this.checkBadgeAchievements();
    }

    /**
     * Track spirit level changes
     */
    onSpiritLevelUp(level) {
        this.gameStats.spiritLevel = level;
        this.checkBadgeAchievements();
    }

    /**
     * Validate badge timing (inline logic, no external dependencies)
     */
    validateBadgeTiming() {
        const now = Date.now();
        const timeSinceStart = now - this.gameStats.sessionStartTime;

        // Check grace period
        if (timeSinceStart < this.BADGE_CONFIG.INITIAL_GRACE_PERIOD) {
            return {
                canAward: false,
                reason: 'grace_period',
                remainingTime: this.BADGE_CONFIG.INITIAL_GRACE_PERIOD - timeSinceStart,
                message: `Grace period active (${Math.ceil((this.BADGE_CONFIG.INITIAL_GRACE_PERIOD - timeSinceStart) / 1000)}s remaining)`
            };
        }

        // Check rate limiting
        if (this.lastBadgeAwarded > 0 && (now - this.lastBadgeAwarded) < this.BADGE_CONFIG.RATE_LIMIT) {
            const remainingTime = this.BADGE_CONFIG.RATE_LIMIT - (now - this.lastBadgeAwarded);
            return {
                canAward: false,
                reason: 'rate_limit',
                remainingTime: remainingTime,
                message: `Rate limit active (${Math.ceil(remainingTime / 1000)}s remaining)`
            };
        }

        return {
            canAward: true,
            reason: 'ready',
            remainingTime: 0,
            message: 'Ready for badge award'
        };
    }

    /**
     * Generate badge metadata (inline logic)
     */
    generateBadgeMetadata(badgeId) {
        return {
            gameType: 'autumn_grove',
            awardedAt: Date.now(),
            sessionStats: { ...this.gameStats, rarityCollected: Array.from(this.gameStats.rarityCollected) },
            autumnTheme: 'enchanted_forest',
            spiritLevel: this.gameStats.spiritLevel,
            version: '1.1.3'
        };
    }

    /**
     * Check if player has earned any new badges
     */
    async checkBadgeAchievements() {
        // Use inline badge timing validation
        const timingCheck = this.validateBadgeTiming();

        if (!timingCheck.canAward) {
            console.log(`[Badge Tracker] ${timingCheck.message}`);
            return;
        }

        // Define badge conditions in priority order (easiest first)
        const badgeConditions = [
            {
                id: 'autumn_walker',
                condition: () => this.gameStats.itemsCollected >= 1,
                priority: 1
            },
            {
                id: 'leaf_whisperer',
                condition: () => this.gameStats.itemsCollected >= 25,
                priority: 2
            },
            {
                id: 'forest_guardian',
                condition: () => this.gameStats.itemsCollected >= 100,
                priority: 3
            },
            {
                id: 'autumn_sage',
                condition: () => this.gameStats.totalScore >= 2000 && this.gameStats.rarityCollected.has('rare'),
                priority: 4
            },
            {
                id: 'grove_keeper',
                condition: () => this.gameStats.legendaryFound,
                priority: 5
            }
        ];

        // Check conditions in priority order
        for (const badge of badgeConditions) {
            // Badges temporarily disabled for Autumn Grove
            // if (badge.condition()) { ... }
            /*
            if (badge.condition()) {
                try {
                    const metadata = this.generateBadgeMetadata(badge.id);

                    const result = await this.badgeHelper.awardBadge({
                        badgeId: badge.id,
                        metadata: metadata
                    });

                    if (result.success && !result.duplicate) {
                        this.lastBadgeAwarded = Date.now();
                        console.log(`[Badge Tracker] Badge awarded: ${badge.id}`, result);

                        // Only award one badge per check to respect rate limiting
                        break;
                    }
                } catch (error) {
                    console.error(`[Badge Tracker] Failed to award badge ${badge.id}:`, error);
                }
            }
            */
        }
    }

    /**
     * Get current game statistics
     */
    getGameStats() {
        return { ...this.gameStats, rarityCollected: Array.from(this.gameStats.rarityCollected) };
    }

    /**
     * Reset game statistics (for new session)
     */
    resetStats() {
        this.gameStats = {
            itemsCollected: 0,
            totalScore: 0,
            rarityCollected: new Set(),
            legendaryFound: false,
            sessionStartTime: Date.now(),
            spiritLevel: 1,
            perfectCollection: 0,
            autumnMagicUsed: 0
        };

        this.lastBadgeAwarded = 0;
        console.log('[Badge Tracker] Stats reset for new session');
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AutumnBadgeTracker;
}
