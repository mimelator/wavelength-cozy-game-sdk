// 🏆 Cosmic Pool Collector Badge Tracker
// Tracks achievements and awards badges based on game events
// Version 1.0.1

class CosmicPoolBadgeTracker {
    constructor(badgeHelper) {
        this.badgeHelper = badgeHelper;
        this.gameStats = {
            itemsCollected: 0,
            totalScore: 0,
            maxCombo: 0,
            cosmicShiftsTriggered: 0,
            legendaryItemsCollected: 0,
            rareItemsCollected: 0,
            sessionStartTime: Date.now(),
            lastBadgeAwarded: 0
        };

        // Badge configuration from game.json
        this.BADGE_CONFIG = {
            RATE_LIMIT: 30000, // 30 seconds between badges
            INITIAL_GRACE_PERIOD: 5 * 60 * 1000 // 5 minutes
        };

        console.log('[Cosmic Badge Tracker] Initialized with badge helper');
    }

    // Main event handler for game events
    onEvent(eventData) {
        const { type, data } = eventData;

        try {
            switch (type) {
                case 'item_collected':
                    this.handleItemCollection(data);
                    break;
                case 'score_updated':
                    this.handleScoreUpdate(data);
                    break;
                case 'combo_achieved':
                    this.handleComboAchievement(data);
                    break;
                case 'cosmic_shift':
                    this.handleCosmicShift(data);
                    break;
                case 'legendary_collected':
                    this.handleLegendaryCollection(data);
                    break;
                default:
                    console.log('[Cosmic Badge Tracker] Unhandled event type:', type);
            }
        } catch (error) {
            console.error('[Cosmic Badge Tracker] Error handling event:', error);
        }
    }

    handleItemCollection(data) {
        this.gameStats.itemsCollected++;

        // Track rarity-specific collections
        if (data.rarity === 'legendary') {
            this.gameStats.legendaryItemsCollected++;
        } else if (['rare', 'ultra-rare'].includes(data.rarity)) {
            this.gameStats.rareItemsCollected++;
        }

        console.log(`[Cosmic Badge Tracker] Item collected: ${data.name} (${data.rarity})`);

        // Check collection-based badges
        this.checkCollectionBadges();
    }

    handleScoreUpdate(data) {
        this.gameStats.totalScore = data.score;
        this.checkScoreBadges();
    }

    handleComboAchievement(data) {
        if (data.combo > this.gameStats.maxCombo) {
            this.gameStats.maxCombo = data.combo;
        }
        this.checkComboBadges();
    }

    handleCosmicShift(data) {
        this.gameStats.cosmicShiftsTriggered++;
        console.log('[Cosmic Badge Tracker] Cosmic shift triggered!');
        this.checkCosmicBadges();
    }

    handleLegendaryCollection(data) {
        this.gameStats.legendaryItemsCollected++;
        console.log('[Cosmic Badge Tracker] Legendary item collected!');
        this.checkLegendaryBadges();
    }

    // Badge checking methods
    async checkCollectionBadges() {
        const timingCheck = this.validateBadgeTiming();
        if (!timingCheck.canAward) {
            console.log('[Cosmic Badge Tracker] Badge timing validation failed:', timingCheck.reason);
            return;
        }

        // Stardust Collector - First collection
        if (this.gameStats.itemsCollected === 1) {
            await this.awardBadge('stardust_collector', {
                itemsCollected: this.gameStats.itemsCollected,
                trigger: 'first_collection'
            });
        }

        // Nebula Explorer - 25 items
        if (this.gameStats.itemsCollected === 25) {
            await this.awardBadge('nebula_explorer', {
                itemsCollected: this.gameStats.itemsCollected,
                trigger: 'collection_milestone'
            });
        }

        // Void Navigator - 100 items
        if (this.gameStats.itemsCollected === 100) {
            await this.awardBadge('void_navigator', {
                itemsCollected: this.gameStats.itemsCollected,
                trigger: 'collection_mastery'
            });
        }
    }

    async checkScoreBadges() {
        const timingCheck = this.validateBadgeTiming();
        if (!timingCheck.canAward) return;

        // Galaxy Guardian - 5000 points
        if (this.gameStats.totalScore >= 5000) {
            await this.awardBadge('galaxy_guardian', {
                score: this.gameStats.totalScore,
                itemsCollected: this.gameStats.itemsCollected,
                maxCombo: this.gameStats.maxCombo,
                trigger: 'high_score'
            });
        }
    }

    async checkCosmicBadges() {
        const timingCheck = this.validateBadgeTiming();
        if (!timingCheck.canAward) return;

        // Universe Master - Cosmic shifts + legendary items
        if (this.gameStats.cosmicShiftsTriggered >= 1 && this.gameStats.legendaryItemsCollected >= 1) {
            await this.awardBadge('universe_master', {
                cosmicShifts: this.gameStats.cosmicShiftsTriggered,
                legendaryItems: this.gameStats.legendaryItemsCollected,
                totalScore: this.gameStats.totalScore,
                trigger: 'cosmic_mastery'
            });
        }
    }

    async checkComboBadges() {
        // Combo-based achievements could be added here
        // Currently integrated into Galaxy Guardian requirements
    }

    async checkLegendaryBadges() {
        // Legendary collection contributes to Universe Master
        this.checkCosmicBadges();
    }

    // Badge timing validation
    validateBadgeTiming() {
        const now = Date.now();
        const timeSinceStart = now - this.gameStats.sessionStartTime;

        // Grace period check (5 minutes)
        if (timeSinceStart < this.BADGE_CONFIG.INITIAL_GRACE_PERIOD) {
            return { canAward: false, reason: 'grace_period' };
        }

        // Rate limiting check (30 seconds)
        if (this.gameStats.lastBadgeAwarded > 0 &&
            (now - this.gameStats.lastBadgeAwarded) < this.BADGE_CONFIG.RATE_LIMIT) {
            return { canAward: false, reason: 'rate_limit' };
        }

        return { canAward: true, reason: 'ready' };
    }

    // Award badge with validation
    async awardBadge(badgeId, context = {}) {
        try {
            console.log(`[Cosmic Badge Tracker] Attempting to award: ${badgeId}`, context);

            const result = await this.badgeHelper.awardBadge(badgeId, context);

            if (result.success) {
                this.gameStats.lastBadgeAwarded = Date.now();
                console.log(`[Cosmic Badge Tracker] Badge awarded successfully: ${badgeId}`);

                // Update UI to show badge award
                this.showBadgeAwardFeedback(badgeId);
            } else {
                console.warn(`[Cosmic Badge Tracker] Badge award failed: ${badgeId}`, result);
            }

            return result;
        } catch (error) {
            console.error(`[Cosmic Badge Tracker] Error awarding badge ${badgeId}:`, error);
            return { success: false, error: error.message };
        }
    }

    showBadgeAwardFeedback(badgeId) {
        // Create visual feedback for badge award
        const feedback = document.createElement('div');
        feedback.className = 'cosmic-badge-feedback';
        feedback.innerHTML = `🏆 Achievement Unlocked: ${badgeId.replace('_', ' ').toUpperCase()}!`;

        // Style the feedback
        feedback.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: linear-gradient(45deg, #6f42c1, #fd7e14);
            color: white;
            padding: 20px 40px;
            border-radius: 15px;
            font-size: 1.2em;
            font-weight: bold;
            z-index: 1000;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
            animation: bounceIn 0.6s ease-out;
        `;

        document.body.appendChild(feedback);

        // Remove after animation
        setTimeout(() => {
            feedback.style.animation = 'fadeOut 0.3s ease-in';
            setTimeout(() => feedback.remove(), 300);
        }, 3000);
    }

    // Get current stats for debugging
    getStats() {
        return { ...this.gameStats };
    }

    // Reset stats (for testing)
    resetStats() {
        this.gameStats = {
            itemsCollected: 0,
            totalScore: 0,
            maxCombo: 0,
            cosmicShiftsTriggered: 0,
            legendaryItemsCollected: 0,
            rareItemsCollected: 0,
            sessionStartTime: Date.now(),
            lastBadgeAwarded: 0
        };
        console.log('[Cosmic Badge Tracker] Stats reset');
    }
}

// Export for use in main game
window.CosmicPoolBadgeTracker = CosmicPoolBadgeTracker;
