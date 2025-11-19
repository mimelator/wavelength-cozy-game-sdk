// Badge System Integration for Mood Melodies
// Connects to Wavelength Badge Driven Merch Experience

class MoodMelodiesBadges {
    constructor() {
        this.badges = new Map();
        this.earnedBadges = new Set();
        this.totalEarned = 0;
        this.sessionStats = {
            melodiesCreated: 0,
            moodsExplored: new Set(),
            sessionTime: 0,
            consecutiveDays: this.getConsecutiveDays(),
            uniqueInstruments: new Set(),
            longSessions: 0,
            creativeBursts: 0
        };

        // Badge timing controls - Best Practices Implementation
        this.gameStartTime = Date.now();
        this.lastBadgeTime = 0;
        this.gracePeriod = 5 * 60 * 1000; // 5 minutes in milliseconds
        this.minBadgeInterval = 5 * 60 * 1000; // 5 minutes between badges
        this.debugMode = localStorage.getItem('wavelength_debug') === 'true' || window.location.search.includes('debug=true');

        this.initializeBadges();
        this.loadProgress();
        console.log('🏆 Badge system initialized for Mood Melodies with 5-min grace period');
    }    initializeBadges() {
        // Musical Creativity Badges
        this.addBadge('first-note', {
            name: 'First Note',
            description: 'Create your very first musical note',
            icon: '🎵',
            category: 'creativity',
            rarity: 'common',
            condition: () => this.sessionStats.melodiesCreated >= 1
        });

        this.addBadge('melody-maker', {
            name: 'Melody Maker',
            description: 'Create 10 beautiful melodies',
            icon: '🎼',
            category: 'creativity',
            rarity: 'common',
            condition: () => this.sessionStats.melodiesCreated >= 10
        });

        this.addBadge('composer', {
            name: 'Composer',
            description: 'Create 50 musical pieces',
            icon: '🎹',
            category: 'creativity',
            rarity: 'uncommon',
            condition: () => this.sessionStats.melodiesCreated >= 50
        });

        this.addBadge('virtuoso', {
            name: 'Virtuoso',
            description: 'Master of 100+ musical creations',
            icon: '🏆',
            category: 'mastery',
            rarity: 'rare',
            condition: () => this.sessionStats.melodiesCreated >= 100
        });

        // Emotional Exploration Badges
        this.addBadge('emotional-explorer', {
            name: 'Emotional Explorer',
            description: 'Experience 3 different moods',
            icon: '🎭',
            category: 'exploration',
            rarity: 'common',
            condition: () => this.sessionStats.moodsExplored.size >= 3
        });

        this.addBadge('mood-master', {
            name: 'Mood Master',
            description: 'Express through all 6 moods',
            icon: '🌈',
            category: 'exploration',
            rarity: 'uncommon',
            condition: () => this.sessionStats.moodsExplored.size >= 6
        });

        this.addBadge('empathy-artist', {
            name: 'Empathy Artist',
            description: 'Create 5+ melodies in each mood',
            icon: '💝',
            category: 'mastery',
            rarity: 'rare',
            condition: () => this.checkMoodMastery()
        });

        // Instrument Mastery Badges
        this.addBadge('instrument-dabbler', {
            name: 'Instrument Dabbler',
            description: 'Try 3 different instruments',
            icon: '🎸',
            category: 'exploration',
            rarity: 'common',
            condition: () => this.sessionStats.uniqueInstruments.size >= 3
        });

        this.addBadge('multi-instrumentalist', {
            name: 'Multi-Instrumentalist',
            description: 'Master all available instruments',
            icon: '🎺',
            category: 'mastery',
            rarity: 'rare',
            condition: () => this.sessionStats.uniqueInstruments.size >= 6,
        });

        // Time & Dedication Badges
        this.addBadge('patient-creator', {
            name: 'Patient Creator',
            description: 'Spend 10+ minutes in one session',
            icon: '⏰',
            category: 'dedication',
            rarity: 'common',
            condition: () => this.sessionStats.sessionTime >= 600000, // 10 minutes
        });

        this.addBadge('meditation-musician', {
            name: 'Meditation Musician',
            description: 'Create for 30+ minutes straight',
            icon: '🧘',
            category: 'dedication',
            rarity: 'uncommon',
            condition: () => this.sessionStats.sessionTime >= 1800000, // 30 minutes
        });

        this.addBadge('daily-harmony', {
            name: 'Daily Harmony',
            description: 'Create music 3 days in a row',
            icon: '📅',
            category: 'consistency',
            rarity: 'uncommon',
            condition: () => this.sessionStats.consecutiveDays >= 3,
        });

        this.addBadge('weekly-warrior', {
            name: 'Weekly Warrior',
            description: 'Create music 7 days straight',
            icon: '🗓️',
            category: 'consistency',
            rarity: 'rare',
            condition: () => this.sessionStats.consecutiveDays >= 7,
        });

        // Special Achievement Badges
        this.addBadge('zen-master', {
            name: 'Zen Master',
            description: 'Create 20+ calm melodies',
            icon: '☯️',
            category: 'specialization',
            rarity: 'rare',
            condition: () => this.getMoodCount('calm') >= 20,
        });

        this.addBadge('joy-spreader', {
            name: 'Joy Spreader',
            description: 'Create 20+ happy melodies',
            icon: '🌟',
            category: 'specialization',
            rarity: 'rare',
            condition: () => this.getMoodCount('happy') >= 20,
        });

        this.addBadge('dream-weaver', {
            name: 'Dream Weaver',
            description: 'Master of dreamy atmospheres',
            icon: '🌙',
            category: 'specialization',
            rarity: 'rare',
            condition: () => this.getMoodCount('dreamy') >= 20,
        });

        // Ultra Rare Achievements
        this.addBadge('sonic-sage', {
            name: 'Sonic Sage',
            description: 'Create 500+ total melodies',
            icon: '🎊',
            category: 'legendary',
            rarity: 'legendary',
            condition: () => this.sessionStats.melodiesCreated >= 500,
        });

        this.addBadge('music-mystic', {
            name: 'Music Mystic',
            description: 'Achieve perfect emotional balance',
            icon: '✨',
            category: 'legendary',
            rarity: 'legendary',
            condition: () => this.checkPerfectBalance(),
        });
    }

    addBadge(id, badge) {
        this.badges.set(id, {
            id,
            earned: false,
            earnedDate: null,
            ...badge
        });
    }

    // Called when player creates music
    recordMelodyCreation(mood, instrument) {
        this.sessionStats.melodiesCreated++;
        this.sessionStats.moodsExplored.add(mood);
        this.sessionStats.uniqueInstruments.add(instrument);

        // Store mood-specific counts
        const moodKey = `${mood}_count`;
        if (!this.sessionStats[moodKey]) {
            this.sessionStats[moodKey] = 0;
        }
        this.sessionStats[moodKey]++;

        this.checkAllBadges();
        this.saveProgress();
    }

    // Called when player creates individual notes (not full melodies)
    recordNoteCreation(mood, instrument) {
        // Track mood and instrument usage without incrementing melody count
        this.sessionStats.moodsExplored.add(mood);
        this.sessionStats.uniqueInstruments.add(instrument);

        // Don't check badges for individual notes, only for full melodies
        this.saveProgress();
    }

    // Called periodically to update session time
    updateSessionTime(time) {
        this.sessionStats.sessionTime = time;
        this.checkAllBadges();
    }

    checkAllBadges() {
        // Implement badge best practices:
        // 1. No badges in first 5 minutes (grace period)
        // 2. No more than one badge every 5 minutes after that

        const currentTime = Date.now();
        const timeSinceStart = currentTime - this.gameStartTime;
        const timeSinceLastBadge = currentTime - this.lastBadgeTime;

        // Grace period check - no badges first 5 minutes (unless debug mode)
        if (!this.debugMode && timeSinceStart < this.gracePeriod) {
            console.log(`⏳ Badge grace period active: ${Math.ceil((this.gracePeriod - timeSinceStart) / 1000)}s remaining`);
            return;
        }

        // Rate limiting check - minimum 5 minutes between badges (unless debug mode)
        if (!this.debugMode && this.lastBadgeTime > 0 && timeSinceLastBadge < this.minBadgeInterval) {
            console.log(`⏳ Badge cooldown active: ${Math.ceil((this.minBadgeInterval - timeSinceLastBadge) / 1000)}s remaining`);
            return;
        }

        let eligibleBadges = [];

        for (let [id, badge] of this.badges) {
            if (!badge.earned && badge.condition()) {
                eligibleBadges.push({ id, badge });
            }
        }

        if (eligibleBadges.length > 0) {
            // Award only the first eligible badge to respect timing constraints
            const { id, badge } = eligibleBadges[0];
            this.earnBadge(id);
            this.displayBadgeNotifications([badge]);

            // Update last badge time
            this.lastBadgeTime = currentTime;

            // Log remaining eligible badges for next opportunity
            if (eligibleBadges.length > 1) {
                console.log(`🏆 ${eligibleBadges.length - 1} more badges ready for next interval`);
            }
        }
    }    earnBadge(badgeId) {
        const badge = this.badges.get(badgeId);
        if (badge && !badge.earned) {
            badge.earned = true;
            badge.earnedDate = new Date();
            this.earnedBadges.add(badgeId);
            this.totalEarned++;

            // Trigger badge event (connects to Wavelength system)

            console.log(`🏆 Badge earned: ${badge.name}!`);
            return true;
        }
        return false;
    }

    displayBadgeNotifications(newBadges) {
        // Only display one badge at a time per best practices
        if (newBadges.length > 0) {
            this.createBadgePopup(newBadges[0]);
        }
    }

    createBadgePopup(badge) {
        const popup = document.createElement('div');
        popup.className = 'badge-popup';
        popup.innerHTML = `
            <div class="badge-content">
                <div class="badge-icon">${badge.icon}</div>
                <div class="badge-details">
                    <h3>🏆 Badge Earned!</h3>
                    <h4>${badge.name}</h4>
                    <p>${badge.description}</p>
                    <div class="badge-rarity ${badge.rarity}">${badge.rarity.toUpperCase()}</div>
                </div>
            </div>
        `;

        // Add CSS for popup
        popup.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #1a1a2e, #16213e);
            border: 2px solid #e94560;
            border-radius: 15px;
            padding: 20px;
            color: white;
            z-index: 1000;
            min-width: 300px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.5);
            animation: slideIn 0.5s ease-out;
        `;

        document.body.appendChild(popup);

        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (popup.parentNode) {
                popup.style.animation = 'slideOut 0.5s ease-in';
                setTimeout(() => popup.remove(), 500);
            }
        }, 5000);
    }

    // Helper methods for complex conditions
    checkMoodMastery() {
        const requiredMoods = ['happy', 'calm', 'dreamy', 'energetic', 'melancholy', 'mysterious'];
        return requiredMoods.every(mood => this.getMoodCount(mood) >= 5);
    }

    checkPerfectBalance() {
        const moods = ['happy', 'calm', 'dreamy', 'energetic', 'melancholy', 'mysterious'];
        const counts = moods.map(mood => this.getMoodCount(mood));
        const avg = counts.reduce((sum, count) => sum + count, 0) / counts.length;

        // Perfect balance: each mood within 20% of average, minimum 50 total
        return counts.every(count => Math.abs(count - avg) <= avg * 0.2) &&
               counts.reduce((sum, count) => sum + count, 0) >= 50;
    }

    getMoodCount(mood) {
        return this.sessionStats[`${mood}_count`] || 0;
    }

    getConsecutiveDays() {
        // Load from localStorage - simplified for demo
        const lastPlayDate = localStorage.getItem('moodMelodies_lastPlay');
        const consecutiveDays = parseInt(localStorage.getItem('moodMelodies_consecutive')) || 0;

        if (!lastPlayDate) return 0;

        const today = new Date().toDateString();
        const yesterday = new Date(Date.now() - 86400000).toDateString();

        if (lastPlayDate === today) {
            return consecutiveDays;
        } else if (lastPlayDate === yesterday) {
            return consecutiveDays + 1;
        } else {
            return 1; // Reset streak
        }
    }

    saveProgress() {
        // Save to localStorage (real version would sync with Wavelength hub)
        const data = {
            stats: this.sessionStats,
            earnedBadges: Array.from(this.earnedBadges),
            totalEarned: this.totalEarned,
            lastPlay: new Date().toDateString(),
            lastBadgeTime: this.lastBadgeTime,
            gameStartTime: this.gameStartTime
        };

        localStorage.setItem('moodMelodies_progress', JSON.stringify(data));
        localStorage.setItem('moodMelodies_lastPlay', new Date().toDateString());
        localStorage.setItem('moodMelodies_consecutive', this.sessionStats.consecutiveDays.toString());
    }    loadProgress() {
        try {
            const saved = localStorage.getItem('moodMelodies_progress');
            if (saved) {
                const data = JSON.parse(saved);

                // Merge saved stats with current session
                Object.assign(this.sessionStats, data.stats);
                this.earnedBadges = new Set(data.earnedBadges || []);
                this.totalEarned = data.totalEarned || 0;
                this.lastBadgeTime = data.lastBadgeTime || 0;

                // Only restore gameStartTime if it's from the same session
                const lastPlay = data.lastPlay;
                const today = new Date().toDateString();
                if (lastPlay === today && data.gameStartTime) {
                    this.gameStartTime = data.gameStartTime;
                } else {
                    // New session - reset start time
                    this.gameStartTime = Date.now();
                }

                // Mark badges as earned
                for (let badgeId of this.earnedBadges) {
                    const badge = this.badges.get(badgeId);
                    if (badge) {
                        badge.earned = true;
                    }
                }
            }
        } catch (error) {
            console.log('Could not load saved progress:', error);
        }
    }

    // Public API for game integration
    getBadgeProgress() {
        return {
            total: this.badges.size,
            earned: this.earnedBadges.size,
            percentage: (this.earnedBadges.size / this.badges.size * 100).toFixed(1),
            totalBadges: this.badges.size,
            earnedBadges: this.earnedBadges.size,
            completionPercentage: ((this.earnedBadges.size / this.badges.size) * 100).toFixed(1)
        };
    }

    getEarnedBadges() {
        return Array.from(this.badges.values()).filter(badge => badge.earned);
    }

    getAvailableBadges() {
        return Array.from(this.badges.values()).filter(badge => !badge.earned);
    }

    exportProgress() {
        // For potential Wavelength hub sync
        return {
            gameId: 'mood-melodies',
            version: '1.0',
            stats: this.sessionStats,
            badges: this.getEarnedBadges()
        };
    }
}

// Add required CSS for badge popups
const badgeCSS = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }

    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }

    .badge-popup {
        font-family: 'Segoe UI', sans-serif;
    }

    .badge-content {
        display: flex;
        align-items: center;
        gap: 15px;
    }

    .badge-icon {
        font-size: 3em;
        flex-shrink: 0;
    }

    .badge-details h3 {
        margin: 0 0 5px 0;
        color: #e94560;
        font-size: 1.1em;
    }

    .badge-details h4 {
        margin: 0 0 8px 0;
        color: #f5f5f5;
        font-size: 1.2em;
    }

    .badge-details p {
        margin: 0 0 10px 0;
        color: #d4d4d8;
        font-size: 0.9em;
        line-height: 1.4;
    }

    .badge-rarity {
        display: inline-block;
        padding: 4px 8px;
        border-radius: 12px;
        font-size: 0.8em;
        font-weight: bold;
        margin-bottom: 5px;
    }

    .badge-rarity.common { background: #4ade80; color: #000; }
    .badge-rarity.uncommon { background: #3b82f6; color: #fff; }
    .badge-rarity.rare { background: #a855f7; color: #fff; }
    .badge-rarity.legendary { background: #f59e0b; color: #000; }

        color: #10b981;
        font-weight: bold;
        font-size: 0.9em;
    }
`;

// Inject CSS
const style = document.createElement('style');
style.textContent = badgeCSS;
document.head.appendChild(style);

// Initialize global badge system
window.moodMelodiesBadges = new MoodMelodiesBadges();

console.log('🏆 Mood Melodies Badge System Loaded!');
