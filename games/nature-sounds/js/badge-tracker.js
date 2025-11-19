// Badge Tracker for Nature Sounds
// Tracks achievements and milestones for white noise sessions

// Achievement definitions for Nature Sounds
const NATURE_ACHIEVEMENTS = {
    // Time-based achievements
    first_session: {
        id: 'first_session',
        name: 'First Relaxation',
        description: 'Started your first nature sounds session',
        emoji: '🌱',
        trigger: 'session_start',
        threshold: 1
    },

    zen_master: {
        id: 'zen_master',
        name: 'Zen Master',
        description: 'Enjoyed 30 minutes of continuous nature sounds',
        emoji: '🧘',
        trigger: 'session_duration',
        threshold: 30 * 60 // 30 minutes in seconds
    },

    night_owl: {
        id: 'night_owl',
        name: 'Night Owl',
        description: 'Used nature sounds for sleep (after 10 PM)',
        emoji: '🦉',
        trigger: 'late_session',
        threshold: 22 // 10 PM
    },

    // Environment exploration
    explorer: {
        id: 'explorer',
        name: 'Sound Explorer',
        description: 'Tried all 5 nature environments',
        emoji: '🗺️',
        trigger: 'environments_explored',
        threshold: 5
    },

    mixer: {
        id: 'mixer',
        name: 'Audio Mixer',
        description: 'Created a custom sound blend',
        emoji: '🎚️',
        trigger: 'custom_mix',
        threshold: 1
    },

    preset_master: {
        id: 'preset_master',
        name: 'Preset Master',
        description: 'Tried all preset environments',
        emoji: '🏞️',
        trigger: 'presets_tried',
        threshold: 5
    },

    // Usage patterns
    daily_ritual: {
        id: 'daily_ritual',
        name: 'Daily Ritual',
        description: 'Used nature sounds for 7 consecutive days',
        emoji: '📅',
        trigger: 'daily_streak',
        threshold: 7
    },

    focus_master: {
        id: 'focus_master',
        name: 'Focus Master',
        description: 'Used timer feature for focused sessions',
        emoji: '⏰',
        trigger: 'timer_used',
        threshold: 5
    },

    // Sound quality appreciation
    audiophile: {
        id: 'audiophile',
        name: 'Audiophile',
        description: 'Used high-quality audio for extended sessions',
        emoji: '🎧',
        trigger: 'hq_session',
        threshold: 60 * 60 // 1 hour in high quality
    }
};

// Global tracking variables
let achievementState = {
    sessions_started: 0,
    environments_explored: new Set(),
    presets_tried: new Set(),
    timer_sessions: 0,
    custom_mixes: 0,
    total_session_time: 0,
    daily_sessions: [],
    hq_session_time: 0,
    earned_badges: new Set(),
    // Badge timing controls
    gameStartTime: Date.now(),
    lastBadgeTime: 0,
    gracePeriod: 5 * 60 * 1000, // 5 minutes
    minBadgeInterval: 5 * 60 * 1000 // 5 minutes between badges
};

// Badge notification system - Updated to use WavelengthBadgeHelper with timing controls
function showBadgeNotification(achievement) {
    if (achievementState.earned_badges.has(achievement.id)) {
        return; // Already earned
    }

    // Validate badge timing before awarding
    const timingValidation = validateBadgeTiming();
    if (!timingValidation.canAward) {
        console.log(`⏳ Badge "${achievement.name}" delayed: ${timingValidation.reason}`);
        if (timingValidation.reason === 'grace_period') {
            console.log(`   Grace period: ${Math.ceil(timingValidation.timeRemaining / 1000)}s remaining`);
        } else if (timingValidation.reason === 'rate_limit') {
            console.log(`   Rate limit: ${Math.ceil(timingValidation.timeRemaining / 1000)}s until next badge`);
        }
        return;
    }

    achievementState.earned_badges.add(achievement.id);
    achievementState.lastBadgeTime = Date.now();

    // Use proper WavelengthBadgeHelper for compliance
    if (window.badgeHelper && typeof window.badgeHelper.awardBadge === 'function') {
        // Award badge using compliant helper
        window.badgeHelper.awardBadge(achievement.id, null, {
            name: achievement.name,
            description: achievement.description,
            emoji: achievement.emoji,
            trigger: achievement.trigger,
            threshold: achievement.threshold,
            timestamp: Date.now(),
            sessionTime: Date.now() - achievementState.gameStartTime
        }).then(result => {
            console.log(`🏆 Badge awarded via WavelengthBadgeHelper: ${achievement.name}`);
        }).catch(error => {
            console.error('Badge award error:', error);
        });
    } else {
        console.warn('WavelengthBadgeHelper not available, showing fallback notification');

        // Fallback notification for development/testing
        const notification = document.createElement('div');
        notification.className = 'badge-notification-fallback';
        notification.innerHTML = `
            <div class="badge-content">
                <div class="badge-emoji">${achievement.emoji}</div>
                <div class="badge-text">
                    <div class="badge-title">${achievement.name}</div>
                    <div class="badge-description">${achievement.description}</div>
                </div>
            </div>
        `;

        // Add styles
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, rgba(74, 144, 226, 0.95), rgba(90, 200, 250, 0.95));
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 12px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
            backdrop-filter: blur(15px);
            border: 1px solid rgba(255, 255, 255, 0.2);
            z-index: 10000;
            max-width: 300px;
            transform: translateX(350px);
            transition: transform 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        `;

        const badgeContent = notification.querySelector('.badge-content');
        badgeContent.style.cssText = `
            display: flex;
            align-items: center;
            gap: 1rem;
        `;

        const badgeEmoji = notification.querySelector('.badge-emoji');
        badgeEmoji.style.cssText = `
            font-size: 2rem;
            line-height: 1;
        `;

        const badgeTitle = notification.querySelector('.badge-title');
        badgeTitle.style.cssText = `
            font-weight: 600;
            font-size: 1rem;
            margin-bottom: 0.25rem;
        `;

        const badgeDescription = notification.querySelector('.badge-description');
        badgeDescription.style.cssText = `
            font-size: 0.85rem;
            opacity: 0.9;
            line-height: 1.3;
        `;

        document.body.appendChild(notification);

        // Slide in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);

        // Slide out after delay
        setTimeout(() => {
            notification.style.transform = 'translateX(350px)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 500);
        }, 4000);
    }

    console.log(`🏆 Achievement earned: ${achievement.name} - ${achievement.description}`);
}

// Badge timing validation function
function validateBadgeTiming() {
    const currentTime = Date.now();
    const timeSinceStart = currentTime - achievementState.gameStartTime;
    const timeSinceLastBadge = currentTime - achievementState.lastBadgeTime;

    // Grace period check - no badges in first 5 minutes
    if (timeSinceStart < achievementState.gracePeriod) {
        return {
            canAward: false,
            reason: 'grace_period',
            timeRemaining: achievementState.gracePeriod - timeSinceStart
        };
    }

    // Rate limiting check - minimum 5 minutes between badges
    if (achievementState.lastBadgeTime > 0 && timeSinceLastBadge < achievementState.minBadgeInterval) {
        return {
            canAward: false,
            reason: 'rate_limit',
            timeRemaining: achievementState.minBadgeInterval - timeSinceLastBadge
        };
    }

    return { canAward: true, reason: 'ready' };
}

// Achievement trigger functions
function trackSessionStart() {
    achievementState.sessions_started++;

    // Track daily sessions
    const today = new Date().toDateString();
    if (!achievementState.daily_sessions.includes(today)) {
        achievementState.daily_sessions.push(today);
    }

    // Check for late session (night owl)
    const hour = new Date().getHours();
    if (hour >= 22 || hour <= 6) {
        checkAchievement('late_session');
    }

    checkAchievement('session_start');
}

function trackEnvironmentExplored(environment) {
    achievementState.environments_explored.add(environment);
    checkAchievement('environments_explored');
}

function trackPresetTried(preset) {
    achievementState.presets_tried.add(preset);
    checkAchievement('presets_tried');
}

function trackTimerUsed() {
    achievementState.timer_sessions++;
    checkAchievement('timer_used');
}

function trackCustomMix() {
    achievementState.custom_mixes++;
    checkAchievement('custom_mix');
}

function trackSessionDuration(seconds, isHighQuality = false) {
    achievementState.total_session_time += seconds;

    if (isHighQuality) {
        achievementState.hq_session_time += seconds;
        checkAchievement('hq_session');
    }

    checkAchievement('session_duration');
}

function checkDailyStreak() {
    // Check if last 7 days have sessions
    const today = new Date();
    let streak = 0;

    for (let i = 0; i < 7; i++) {
        const checkDate = new Date(today);
        checkDate.setDate(today.getDate() - i);
        const dateString = checkDate.toDateString();

        if (achievementState.daily_sessions.includes(dateString)) {
            streak++;
        } else {
            break;
        }
    }

    if (streak >= 7) {
        checkAchievement('daily_streak');
    }
}

function checkAchievement(trigger) {
    Object.values(NATURE_ACHIEVEMENTS).forEach(achievement => {
        if (achievement.trigger === trigger && !achievementState.earned_badges.has(achievement.id)) {
            let shouldEarn = false;

            switch (trigger) {
                case 'session_start':
                    shouldEarn = achievementState.sessions_started >= achievement.threshold;
                    break;
                case 'session_duration':
                    shouldEarn = achievementState.total_session_time >= achievement.threshold;
                    break;
                case 'late_session':
                    const hour = new Date().getHours();
                    shouldEarn = hour >= achievement.threshold || hour <= 6;
                    break;
                case 'environments_explored':
                    shouldEarn = achievementState.environments_explored.size >= achievement.threshold;
                    break;
                case 'presets_tried':
                    shouldEarn = achievementState.presets_tried.size >= achievement.threshold;
                    break;
                case 'timer_used':
                    shouldEarn = achievementState.timer_sessions >= achievement.threshold;
                    break;
                case 'custom_mix':
                    shouldEarn = achievementState.custom_mixes >= achievement.threshold;
                    break;
                case 'daily_streak':
                    checkDailyStreak();
                    return; // Handled in checkDailyStreak
                case 'hq_session':
                    shouldEarn = achievementState.hq_session_time >= achievement.threshold;
                    break;
            }

            if (shouldEarn) {
                showBadgeNotification(achievement);
            }
        }
    });
}

// Initialize badge system
function initializeNatureBadges() {
    // Set initial game start time
    achievementState.gameStartTime = Date.now();

    // Load saved state if available
    try {
        const saved = localStorage.getItem('nature_sounds_achievements');
        if (saved) {
            const savedState = JSON.parse(saved);
            achievementState = {
                ...achievementState,
                ...savedState,
                environments_explored: new Set(savedState.environments_explored || []),
                presets_tried: new Set(savedState.presets_tried || []),
                earned_badges: new Set(savedState.earned_badges || []),
                // Always reset timing for new session
                gameStartTime: Date.now(),
                lastBadgeTime: savedState.lastBadgeTime || 0
            };
        }
    } catch (error) {
        console.log('Could not load achievement state:', error);
    }

    console.log('🏆 Nature Sounds badge system initialized');
    console.log(`⏳ Grace period: ${achievementState.gracePeriod / 1000}s, Rate limit: ${achievementState.minBadgeInterval / 1000}s`);
}

// Save state periodically
function saveAchievementState() {
    try {
        const stateToSave = {
            ...achievementState,
            environments_explored: Array.from(achievementState.environments_explored),
            presets_tried: Array.from(achievementState.presets_tried),
            earned_badges: Array.from(achievementState.earned_badges)
        };
        localStorage.setItem('nature_sounds_achievements', JSON.stringify(stateToSave));
    } catch (error) {
        console.log('Could not save achievement state:', error);
    }
}

// Auto-save every 30 seconds
setInterval(saveAchievementState, 30000);

// Initialize on load
document.addEventListener('DOMContentLoaded', initializeNatureBadges);

// Export functions for use in main game
window.NatureBadges = {
    trackSessionStart,
    trackEnvironmentExplored,
    trackPresetTried,
    trackTimerUsed,
    trackCustomMix,
    trackSessionDuration,
    checkDailyStreak,
    getBadgeCount: () => achievementState.earned_badges.size,
    getAchievements: () => Array.from(achievementState.earned_badges),

    // Timing and debug functions
    validateTiming: validateBadgeTiming,
    getTimingInfo: () => ({
        gameStartTime: achievementState.gameStartTime,
        lastBadgeTime: achievementState.lastBadgeTime,
        timeSinceStart: Date.now() - achievementState.gameStartTime,
        timeSinceLastBadge: achievementState.lastBadgeTime > 0 ? Date.now() - achievementState.lastBadgeTime : 0,
        gracePeriod: achievementState.gracePeriod,
        minBadgeInterval: achievementState.minBadgeInterval
    }),

    // Debug functions for testing
    skipGracePeriod: () => {
        achievementState.gameStartTime = Date.now() - (achievementState.gracePeriod + 1000);
        console.log('🐛 Debug: Grace period skipped');
    },

    resetBadgeCooldown: () => {
        achievementState.lastBadgeTime = 0;
        console.log('🐛 Debug: Badge cooldown reset');
    },

    forceTimingCheck: () => {
        const timing = validateBadgeTiming();
        console.log('🐛 Debug timing check:', timing);
        return timing;
    }
};
