// 🏆 Garden Defender Badge Tracker
// Tracks achievements and awards badges based on tower defense events
// Version 1.0.0

class GardenDefenderBadgeTracker {
    constructor(badgeHelper) {
        this.badgeHelper = badgeHelper;
        this.gameStats = {
            wavesCompleted: 0,
            plantsGrown: 0,
            bugsDefeated: 0,
            bugsDestroyedDirectly: 0,
            tomatoesLost: 0,
            perfectWaves: 0,
            ecosystemBalance: 0,
            sessionStartTime: Date.now(),
            lastBadgeAwarded: 0,
            consecutiveWaves: 0,
            plantTypes: new Set()
        };

        // Badge configuration from game.json
        this.BADGE_CONFIG = {
            RATE_LIMIT: 30000, // 30 seconds between badges
            INITIAL_GRACE_PERIOD: 5 * 60 * 1000 // 5 minutes
        };

        console.log('[Garden Badge Tracker] Initialized with badge helper');
    }

    // Main event handler for game events
    onEvent(eventData) {
        const { type, data } = eventData;

        try {
            switch (type) {
                case 'wave_completed':
                    this.handleWaveCompletion(data);
                    break;
                case 'plant_grown':
                    this.handlePlantGrown(data);
                    break;
                case 'bug_defeated':
                    this.handleBugDefeated(data);
                    break;
                case 'bug_destroyed_directly':
                    this.handleBugDestroyedDirectly(data);
                    break;
                case 'tomato_lost':
                    this.handleTomatoLost(data);
                    break;
                case 'perfect_wave':
                    this.handlePerfectWave(data);
                    break;
                case 'ecosystem_balance':
                    this.handleEcosystemBalance(data);
                    break;
                default:
                    console.log('[Garden Badge Tracker] Unhandled event type:', type);
            }
        } catch (error) {
            console.error('[Garden Badge Tracker] Error handling event:', error);
        }
    }

    handleWaveCompletion(data) {
        this.gameStats.wavesCompleted++;

        if (data.tomatoesLost === 0) {
            this.gameStats.consecutiveWaves++;
            this.gameStats.perfectWaves++;
        } else {
            this.gameStats.consecutiveWaves = 0;
        }

        this.gameStats.tomatoesLost += data.tomatoesLost || 0;

        console.log(`[Garden Badge Tracker] Wave ${this.gameStats.wavesCompleted} completed`);

        // Check wave-based badges
        // Badges temporarily disabled for Garden Defender
        // this.checkWaveBadges();
    }

    handlePlantGrown(data) {
        this.gameStats.plantsGrown++;
        this.gameStats.plantTypes.add(data.plantType);

        console.log(`[Garden Badge Tracker] Plant grown: ${data.plantType}`);
        // this.checkPlantBadges();
    }

    handleBugDefeated(data) {
        this.gameStats.bugsDefeated++;
        console.log(`[Garden Badge Tracker] Bug defeated: ${data.bugType}`);
        // this.checkBugBadges();
    }

    handleBugDestroyedDirectly(data) {
        this.gameStats.bugsDefeated++;
        this.gameStats.bugsDestroyedDirectly++;
        console.log(`[Garden Badge Tracker] Bug destroyed directly: ${data.bugType}`);
        // this.checkBugBadges();
        // this.checkDirectDestructionBadges();
    }

    handleTomatoLost(data) {
        this.gameStats.tomatoesLost++;
        this.gameStats.consecutiveWaves = 0; // Reset perfect streak
        console.log('[Garden Badge Tracker] Tomato lost - streak reset');
    }

    handlePerfectWave(data) {
        this.gameStats.perfectWaves++;
        console.log('[Garden Badge Tracker] Perfect wave achieved!');
        // this.checkPerfectionBadges();
    }

    handleEcosystemBalance(data) {
        this.gameStats.ecosystemBalance = data.balanceScore;
        console.log(`[Garden Badge Tracker] Ecosystem balance: ${data.balanceScore}`);
        // this.checkEcosystemBadges();
    }

    // Badge checking methods
    async checkWaveBadges() {
        const timingCheck = this.validateBadgeTiming();
        if (!timingCheck.canAward) {
            console.log('[Garden Badge Tracker] Badge timing validation failed:', timingCheck.reason);
            return;
        }

        // First Garden - Complete first wave without losing tomatoes
        if (this.gameStats.wavesCompleted === 1 && this.gameStats.tomatoesLost === 0) {
            await this.awardBadge('first_garden', {
                wavesCompleted: this.gameStats.wavesCompleted,
                tomatoesLost: this.gameStats.tomatoesLost,
                trigger: 'first_wave_perfect'
            });
        }

        // Tomato Guardian - 10 consecutive waves without losing tomatoes
        if (this.gameStats.consecutiveWaves >= 10) {
            await this.awardBadge('tomato_guardian', {
                consecutiveWaves: this.gameStats.consecutiveWaves,
                totalWaves: this.gameStats.wavesCompleted,
                trigger: 'consecutive_perfection'
            });
        }
    }

    async checkPlantBadges() {
        const timingCheck = this.validateBadgeTiming();
        if (!timingCheck.canAward) return;

        // Master Cultivator - 50 plants grown
        if (this.gameStats.plantsGrown === 50) {
            await this.awardBadge('master_cultivator', {
                plantsGrown: this.gameStats.plantsGrown,
                plantTypes: Array.from(this.gameStats.plantTypes),
                trigger: 'cultivation_mastery'
            });
        }
    }

    async checkBugBadges() {
        const timingCheck = this.validateBadgeTiming();
        if (!timingCheck.canAward) return;

        // Bug Whisperer - 100 bugs defeated
        if (this.gameStats.bugsDefeated === 100) {
            await this.awardBadge('bug_whisperer', {
                bugsDefeated: this.gameStats.bugsDefeated,
                plantsGrown: this.gameStats.plantsGrown,
                trigger: 'bug_mastery'
            });
        }
    }

    async checkDirectDestructionBadges() {
        const timingCheck = this.validateBadgeTiming();
        if (!timingCheck.canAward) return;

        // Click Master - 25 bugs destroyed by direct clicking
        if (this.gameStats.bugsDestroyedDirectly === 25) {
            await this.awardBadge('click_master', {
                bugsDestroyedDirectly: this.gameStats.bugsDestroyedDirectly,
                bugsDefeated: this.gameStats.bugsDefeated,
                trigger: 'direct_destruction_mastery'
            });
        }
    }

    async checkPerfectionBadges() {
        // Perfect waves contribute to other badge requirements
        this.checkWaveBadges();
    }

    async checkEcosystemBadges() {
        const timingCheck = this.validateBadgeTiming();
        if (!timingCheck.canAward) return;

        // Ecosystem Master - Perfect ecosystem balance with all plant types
        if (this.gameStats.ecosystemBalance >= 100 && this.gameStats.plantTypes.size >= 5) {
            await this.awardBadge('ecosystem_master', {
                ecosystemBalance: this.gameStats.ecosystemBalance,
                plantTypes: Array.from(this.gameStats.plantTypes),
                plantsGrown: this.gameStats.plantsGrown,
                wavesCompleted: this.gameStats.wavesCompleted,
                trigger: 'ecosystem_perfection'
            });
        }
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
            console.log(`[Garden Badge Tracker] Attempting to award: ${badgeId}`, context);

            const result = await this.badgeHelper.awardBadge(badgeId, context);

            if (result.success) {
                this.gameStats.lastBadgeAwarded = Date.now();
                console.log(`[Garden Badge Tracker] Badge awarded successfully: ${badgeId}`);

                // Update UI to show badge award
                this.showBadgeAwardFeedback(badgeId);
            } else {
                console.warn(`[Garden Badge Tracker] Badge award failed: ${badgeId}`, result);
            }

            return result;
        } catch (error) {
            console.error(`[Garden Badge Tracker] Error awarding badge ${badgeId}:`, error);
            return { success: false, error: error.message };
        }
    }

    showBadgeAwardFeedback(badgeId) {
        // Create visual feedback for badge award
        const feedback = document.createElement('div');
        feedback.className = 'garden-badge-feedback';
        feedback.innerHTML = `🏆 Achievement Unlocked: ${badgeId.replace('_', ' ').toUpperCase()}!`;

        // Style the feedback with garden theme
        feedback.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: linear-gradient(45deg, #4a7c59, #50c878);
            color: white;
            padding: 20px 40px;
            border-radius: 15px;
            font-size: 1.2em;
            font-weight: bold;
            z-index: 1000;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
            border: 2px solid #daa520;
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
        return {
            ...this.gameStats,
            plantTypes: Array.from(this.gameStats.plantTypes)
        };
    }

    // Reset stats (for testing)
    resetStats() {
        this.gameStats = {
            wavesCompleted: 0,
            plantsGrown: 0,
            bugsDefeated: 0,
            bugsDestroyedDirectly: 0,
            tomatoesLost: 0,
            perfectWaves: 0,
            ecosystemBalance: 0,
            sessionStartTime: Date.now(),
            lastBadgeAwarded: 0,
            consecutiveWaves: 0,
            plantTypes: new Set()
        };
        console.log('[Garden Badge Tracker] Stats reset');
    }
}

// Export for use in main game
window.GardenDefenderBadgeTracker = GardenDefenderBadgeTracker;
