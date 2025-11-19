/**
 * Badge Tracker for Constellation Canvas
 *
 * Tracks player achievements and awards badges for celestial creations
 * Uses inline badge configuration for self-contained game
 */
class ConstellationBadgeTracker {
    constructor(badgeHelper) {
        this.badgeHelper = badgeHelper;

        // Inline badge configuration (no external dependencies)
        this.BADGE_CONFIG = {
            INITIAL_GRACE_PERIOD: 5 * 60 * 1000, // 5 minutes before any badges
            RATE_LIMIT: 30 * 1000, // 30 seconds between badges for constellation canvas
        };

        this.gameStats = {
            starsCreated: 0,
            connectionsCreated: 0,
            colorsUsed: new Set(),
            meteorsTriggered: 0,
            longestConstellation: 0,
            totalPlayTime: 0,
            sessionStartTime: Date.now(),
            largestStarCluster: 0,
            perfectCircles: 0,
            rainbowConstellations: 0,
            rotationTime: 0, // Track how long stars have been rotating
            fastestRotationSpeed: 0,
            blackHoleEventsTriggered: 0,
            largestRotatingGroup: 0,
            displacementEvents: 0,
            strongestDisplacement: 0,
            gravitationalDominance: 0
        };

        // Use inline configuration for timing
        this.lastBadgeAwarded = 0;

        console.log('[ConstellationBadgeTracker] Initialized with inline badge config');
    }    /**
     * Track when a star is created
     */
    onStarCreated(star) {
        this.gameStats.starsCreated++;
        this.gameStats.colorsUsed.add(star.color);

        console.log(`[Badge Tracker] Star created: ${this.gameStats.starsCreated} total, color: ${star.color}`);

        this.checkBadgeAchievements();
    }

    /**
     * Track when stars are connected
     */
    onConnectionCreated(star1, star2) {
        this.gameStats.connectionsCreated++;

        // Check for constellation patterns
        this.analyzeConstellationPattern(star1, star2);

        console.log(`[Badge Tracker] Connection created: ${this.gameStats.connectionsCreated} total`);

        this.checkBadgeAchievements();
    }

    /**
     * Track when meteor shower is triggered
     */
    onMeteorShower() {
        this.gameStats.meteorsTriggered++;

        console.log(`[Badge Tracker] Meteor shower triggered: ${this.gameStats.meteorsTriggered} total`);

        this.checkBadgeAchievements();
    }

    /**
     * Track fastest rotation speed achievement
     */
    onFastestRotation(rotationSpeed, groupSize) {
        if (rotationSpeed > this.gameStats.fastestRotationSpeed) {
            this.gameStats.fastestRotationSpeed = rotationSpeed;
            this.gameStats.largestRotatingGroup = Math.max(this.gameStats.largestRotatingGroup, groupSize);

            console.log(`[Badge Tracker] New fastest rotation: ${rotationSpeed.toFixed(6)} with ${groupSize} stars`);
            this.checkBadgeAchievements();
        }
    }

    /**
     * Track black hole event achievement
     */
    onBlackHoleEvent(rotationSpeed, groupSize) {
        this.gameStats.blackHoleEventsTriggered++;
        this.gameStats.fastestRotationSpeed = Math.max(this.gameStats.fastestRotationSpeed, rotationSpeed);
        this.gameStats.largestRotatingGroup = Math.max(this.gameStats.largestRotatingGroup, groupSize);

        console.log(`[Badge Tracker] BLACK HOLE EVENT! Speed: ${rotationSpeed.toFixed(6)}, Group size: ${groupSize}, Total events: ${this.gameStats.blackHoleEventsTriggered}`);
        this.checkBadgeAchievements();
    }

    /**
     * Track gravitational displacement events
     */
    onDisplacementEvent(sourceEnergy, targetEnergy, displacementMagnitude) {
        this.gameStats.displacementEvents++;

        // Track strongest displacement (energy ratio)
        const displacementStrength = sourceEnergy / (targetEnergy + 1);
        if (displacementStrength > this.gameStats.strongestDisplacement) {
            this.gameStats.strongestDisplacement = displacementStrength;
        }

        // Track gravitational dominance (cumulative displacement events)
        this.gameStats.gravitationalDominance += displacementStrength;

        console.log(`[Badge Tracker] Displacement event: strength ${displacementStrength.toFixed(2)}, total events: ${this.gameStats.displacementEvents}`);
        this.checkBadgeAchievements();
    }

    /**
     * Track play time and check for time-based achievements
     */
    updatePlayTime() {
        this.gameStats.totalPlayTime = Date.now() - this.gameStats.sessionStartTime;
        this.gameStats.rotationTime = this.gameStats.totalPlayTime; // Track rotation time
        this.checkBadgeAchievements();
    }

    /**
     * Analyze constellation patterns for special badges
     */
    analyzeConstellationPattern(star1, star2) {
        // Check for rainbow connections (different colored stars)
        if (star1.color !== star2.color) {
            this.gameStats.rainbowConstellations++;
        }

        // Additional pattern analysis could be added here
        // - Geometric shapes (triangles, squares)
        // - Symmetrical patterns
        // - Specific constellation recreations
    }

    /**
     * Validate badge timing (inline logic, no external dependencies)
     */
    validateBadgeTiming() {
        const now = Date.now();
        const timeSinceStart = now - this.gameStats.sessionStartTime;

        // Check grace period
        if (timeSinceStart < this.BADGE_CONFIG.INITIAL_GRACE_PERIOD) {
            const remainingTime = Math.ceil((this.BADGE_CONFIG.INITIAL_GRACE_PERIOD - timeSinceStart) / 1000);
            return {
                canAward: false,
                reason: 'grace_period',
                remainingTime: remainingTime,
                message: `Badges available in ${Math.floor(remainingTime / 60)}m ${remainingTime % 60}s`
            };
        }

        // Check rate limiting
        if (this.lastBadgeAwarded > 0 && (now - this.lastBadgeAwarded) < this.BADGE_CONFIG.RATE_LIMIT) {
            const remainingTime = Math.ceil((this.BADGE_CONFIG.RATE_LIMIT - (now - this.lastBadgeAwarded)) / 1000);
            return {
                canAward: false,
                reason: 'rate_limit',
                remainingTime: remainingTime,
                message: `Next badge available in ${remainingTime}s`
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
            gameType: 'constellation',
            awardedAt: Date.now(),
            sessionStats: { ...this.gameStats, colorsUsed: Array.from(this.gameStats.colorsUsed) },
            rotationTime: this.gameStats.rotationTime,
            colorDiversity: Array.from(this.gameStats.colorsUsed),
            version: '1.0.1'
        };
    }

    /**
     * Check if player has earned any new badges
     */
    async checkBadgeAchievements() {
        // Use inline badge timing validation
        const timingCheck = this.validateBadgeTiming();

        if (!timingCheck.canAward) {
            if (timingCheck.reason === 'grace_period' && timingCheck.remainingTime % 30 === 0) {
                console.log(`[Badge Tracker] ${timingCheck.message}`);
            }
            return;
        }        // Define badge conditions in priority order (easiest first)
        const badgeConditions = [
            {
                id: 'first_star',
                condition: () => this.gameStats.starsCreated >= 1,
                metadata: { starsCreated: this.gameStats.starsCreated }
            },
            {
                id: 'rainbow_creator',
                condition: () => this.gameStats.colorsUsed.size >= 3,
                metadata: { colorsUsed: Array.from(this.gameStats.colorsUsed), totalColors: this.gameStats.colorsUsed.size }
            },
            {
                id: 'constellation_artist',
                condition: () => this.gameStats.connectionsCreated >= 5,
                metadata: { connectionsCreated: this.gameStats.connectionsCreated }
            },
            {
                id: 'rotational_energy',
                condition: () => this.gameStats.fastestRotationSpeed > 0.001,
                metadata: {
                    fastestRotationSpeed: this.gameStats.fastestRotationSpeed,
                    largestRotatingGroup: this.gameStats.largestRotatingGroup
                }
            },
            {
                id: 'black_hole_event_horizon',
                condition: () => this.gameStats.blackHoleEventsTriggered >= 1,
                metadata: {
                    blackHoleEventsTriggered: this.gameStats.blackHoleEventsTriggered,
                    fastestRotationSpeed: this.gameStats.fastestRotationSpeed,
                    largestRotatingGroup: this.gameStats.largestRotatingGroup
                }
            },
            {
                id: 'gravitational_force',
                condition: () => this.gameStats.displacementEvents >= 1,
                metadata: {
                    displacementEvents: this.gameStats.displacementEvents,
                    strongestDisplacement: this.gameStats.strongestDisplacement
                }
            },
            {
                id: 'cosmic_dominance',
                condition: () => this.gameStats.displacementEvents >= 10,
                metadata: {
                    displacementEvents: this.gameStats.displacementEvents,
                    gravitationalDominance: this.gameStats.gravitationalDominance,
                    strongestDisplacement: this.gameStats.strongestDisplacement
                }
            },
            {
                id: 'galactic_emperor',
                condition: () => this.gameStats.strongestDisplacement >= 50 && this.gameStats.displacementEvents >= 25,
                metadata: {
                    displacementEvents: this.gameStats.displacementEvents,
                    gravitationalDominance: this.gameStats.gravitationalDominance,
                    strongestDisplacement: this.gameStats.strongestDisplacement,
                    blackHoleEventsTriggered: this.gameStats.blackHoleEventsTriggered
                }
            },
            {
                id: 'meteor_caller',
                condition: () => this.gameStats.meteorsTriggered >= 1,
                metadata: { meteorsTriggered: this.gameStats.meteorsTriggered }
            },
            {
                id: 'cosmic_architect',
                condition: () => this.gameStats.starsCreated >= 15 && this.gameStats.connectionsCreated >= 10,
                metadata: {
                    starsCreated: this.gameStats.starsCreated,
                    connectionsCreated: this.gameStats.connectionsCreated,
                    colorsUsed: this.gameStats.colorsUsed.size
                }
            },
            {
                id: 'celestial_master',
                condition: () => this.gameStats.starsCreated >= 25 &&
                           this.gameStats.connectionsCreated >= 20 &&
                           this.gameStats.colorsUsed.size >= 6 &&
                           this.gameStats.meteorsTriggered >= 3,
                metadata: {
                    starsCreated: this.gameStats.starsCreated,
                    connectionsCreated: this.gameStats.connectionsCreated,
                    colorsUsed: Array.from(this.gameStats.colorsUsed),
                    meteorsTriggered: this.gameStats.meteorsTriggered,
                    totalPlayTime: Math.floor(this.gameStats.totalPlayTime / 1000),
                    fastestRotationSpeed: this.gameStats.fastestRotationSpeed
                }
            }
        ];

        // Check conditions and award first eligible badge
        for (const badge of badgeConditions) {
            if (badge.condition() && !this.badgeHelper.awardedBadges.has(badge.id)) {
                try {
                    // Generate metadata using inline logic
                    const metadata = this.generateBadgeMetadata(badge.id);

                    console.log(`[Badge Tracker] Awarding badge: ${badge.id}`, metadata);

                    await this.badgeHelper.awardBadge(badge.id, null, metadata);
                    this.lastBadgeAwarded = Date.now();

                    // Only award one badge at a time to prevent spam
                    break;
                } catch (error) {
                    console.error(`[Badge Tracker] Failed to award badge ${badge.id}:`, error);
                }
            }
        }
    }

    /**
     * Get current game statistics
     */
    getGameStats() {
        return {
            ...this.gameStats,
            colorsUsed: Array.from(this.gameStats.colorsUsed),
            totalPlayTime: Math.floor(this.gameStats.totalPlayTime / 1000),
            badgesEarned: this.badgeHelper.awardedBadges.size
        };
    }

    /**
     * Reset game statistics (for new session)
     */
    resetStats() {
        this.gameStats = {
            starsCreated: 0,
            connectionsCreated: 0,
            colorsUsed: new Set(),
            meteorsTriggered: 0,
            longestConstellation: 0,
            totalPlayTime: 0,
            sessionStartTime: Date.now(),
            largestStarCluster: 0,
            perfectCircles: 0,
            rainbowConstellations: 0,
            rotationTime: 0,
            fastestRotationSpeed: 0,
            blackHoleEventsTriggered: 0,
            largestRotatingGroup: 0,
            displacementEvents: 0,
            strongestDisplacement: 0,
            gravitationalDominance: 0
        };

        console.log('[Badge Tracker] Game statistics reset');
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ConstellationBadgeTracker;
}
