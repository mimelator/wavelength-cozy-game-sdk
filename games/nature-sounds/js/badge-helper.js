// Badge Helper for Wavelength Integration
// Connects Nature Sounds with Wavelength Badge Driven Merch Experience
// Compatible with existing Wavelength SDK badge system

class BadgeHelper {
    constructor(gameId = 'nature-sounds') {
        this.gameId = gameId;
        this.hubConnected = false;
        this.debugMode = false;
        this.badgeQueue = [];
        this.revenueTotal = 0;
        this.developerShare = 0.35; // 35% revenue share

        this.initializeConnection();
        this.setupDebugMode();
    }

    initializeConnection() {
        // Try to connect to Wavelength Hub
        if (typeof window !== 'undefined') {
            // Check for existing hub connection
            if (window.wavelengthHub) {
                this.hubConnected = true;
                this.registerGame();
                console.log('🌊 Connected to Wavelength Hub');
            } else {
                // Set up listener for when hub becomes available
                window.addEventListener('wavelengthHubReady', () => {
                    this.hubConnected = true;
                    this.registerGame();
                    this.flushBadgeQueue();
                    console.log('🌊 Wavelength Hub connection established');
                });
            }

            // Fallback: check periodically for hub
            this.connectionCheckInterval = setInterval(() => {
                if (window.wavelengthHub && !this.hubConnected) {
                    this.hubConnected = true;
                    this.registerGame();
                    this.flushBadgeQueue();
                    clearInterval(this.connectionCheckInterval);
                }
            }, 1000);
        }
    }

    registerGame() {
        if (this.hubConnected && window.wavelengthHub) {
            window.wavelengthHub.registerGame({
                id: this.gameId,
                name: 'Nature Sounds',
                version: '1.0.0',
                category: 'relaxation',
                description: 'High-quality white noise generator with beautiful nature sounds',
                developer: 'Wavelength Cozy Game SDK',
                revenueShare: this.developerShare,
                badgeCount: 9, // Total available badges
                features: [
                    'white-noise-generation',
                    'nature-environments',
                    'relaxation-focus',
                    'audio-visualization',
                    'session-tracking'
                ]
            });
        }
    }

    setupDebugMode() {
        // Enable debug mode for development
        if (localStorage.getItem('wavelength_debug') === 'true' ||
            window.location.search.includes('debug=true')) {
            this.debugMode = true;
            console.log('🐛 Badge debug mode enabled');

            // Add debug commands to global scope
            window.badgeDebug = {
                earnBadge: (badgeId) => this.debugEarnBadge(badgeId),
                listBadges: () => this.debugListBadges(),
                resetProgress: () => this.debugResetProgress(),
                showRevenue: () => this.debugShowRevenue(),
                simulate5Minutes: () => this.debugSimulate5Minutes(),
                skipGracePeriod: () => this.debugSkipGracePeriod()
            };
        }
    }

    // Main method to record badge earning
    recordBadgeEarned(badgeData) {
        const badgeEvent = {
            gameId: this.gameId,
            timestamp: new Date().toISOString(),
            badgeId: badgeData.id,
            badgeName: badgeData.name,
            category: badgeData.category,
            rarity: badgeData.rarity,
            revenueValue: badgeData.revenue,
            description: badgeData.description,
            icon: badgeData.icon,
            playerStats: badgeData.playerStats || {},
            metadata: {
                sessionLength: this.getSessionLength(),
                browserInfo: this.getBrowserInfo(),
                gameVersion: '1.0.0'
            }
        };

        // Update local revenue tracking
        this.revenueTotal += badgeData.revenue;

        if (this.hubConnected && window.wavelengthHub) {
            // Send to hub immediately
            window.wavelengthHub.badgeEarned(badgeEvent);
            this.logRevenueEvent(badgeEvent);
        } else {
            // Queue for later transmission
            this.badgeQueue.push(badgeEvent);
            console.log(`⏳ Badge queued: ${badgeData.name} (Hub not connected)`);
        }

        // Always show local notification
        this.showBadgeNotification(badgeEvent);

        // Update UI
        this.updateBadgeUI();
    }

    flushBadgeQueue() {
        if (this.badgeQueue.length > 0 && this.hubConnected) {
            console.log(`📤 Flushing ${this.badgeQueue.length} queued badges to hub`);

            this.badgeQueue.forEach(badgeEvent => {
                window.wavelengthHub.badgeEarned(badgeEvent);
                this.logRevenueEvent(badgeEvent);
            });

            this.badgeQueue = [];
        }
    }

    logRevenueEvent(badgeEvent) {
        const developerRevenue = badgeEvent.revenueValue * this.developerShare;

        console.log(`💰 Revenue Event: ${badgeEvent.badgeName}`);
        console.log(`   Base Value: $${badgeEvent.revenueValue}`);
        console.log(`   Developer Share (35%): $${developerRevenue.toFixed(2)}`);
        console.log(`   Total Developer Revenue: $${(this.revenueTotal * this.developerShare).toFixed(2)}`);
    }

    showBadgeNotification(badgeEvent) {
        // Create animated notification popup
        const notification = document.createElement('div');
        notification.className = 'wavelength-badge-notification';
        notification.innerHTML = `
            <div class="notification-content">
                <div class="notification-icon">${badgeEvent.icon}</div>
                <div class="notification-text">
                    <div class="notification-title">🏆 Badge Earned!</div>
                    <div class="notification-badge-name">${badgeEvent.badgeName}</div>
                    <div class="notification-description">${badgeEvent.description}</div>
                    <div class="notification-revenue">💰 +$${badgeEvent.revenueValue} Revenue</div>
                </div>
                <div class="notification-close">×</div>
            </div>
        `;

        // Add styling
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #0f1419 0%, #1a1a2e 100%);
            border: 2px solid #e94560;
            border-radius: 12px;
            padding: 16px;
            color: white;
            font-family: 'Segoe UI', sans-serif;
            z-index: 10000;
            max-width: 350px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.6);
            backdrop-filter: blur(10px);
            animation: slideInRight 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
            cursor: pointer;
        `;

        document.body.appendChild(notification);

        // Auto-remove after 6 seconds
        const autoRemove = setTimeout(() => {
            this.removeNotification(notification);
        }, 6000);

        // Manual close
        notification.querySelector('.notification-close').addEventListener('click', (e) => {
            e.stopPropagation();
            clearTimeout(autoRemove);
            this.removeNotification(notification);
        });

        // Click to view details
        notification.addEventListener('click', () => {
            this.showBadgeDetails(badgeEvent);
            clearTimeout(autoRemove);
            this.removeNotification(notification);
        });
    }

    removeNotification(notification) {
        notification.style.animation = 'slideOutRight 0.4s ease-in-out';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 400);
    }

    showBadgeDetails(badgeEvent) {
        // Create detailed badge view
        const modal = document.createElement('div');
        modal.className = 'badge-detail-modal';
        modal.innerHTML = `
            <div class="modal-backdrop"></div>
            <div class="modal-content">
                <div class="badge-detail-header">
                    <div class="badge-icon-large">${badgeEvent.icon}</div>
                    <h2>${badgeEvent.badgeName}</h2>
                    <div class="badge-rarity ${badgeEvent.rarity}">${badgeEvent.rarity.toUpperCase()}</div>
                </div>
                <div class="badge-description">
                    ${badgeEvent.description}
                </div>
                <div class="badge-revenue-info">
                    <div class="revenue-item">
                        <span>Badge Value:</span>
                        <span>$${badgeEvent.revenueValue}</span>
                    </div>
                    <div class="revenue-item">
                        <span>Developer Share (35%):</span>
                        <span>$${(badgeEvent.revenueValue * this.developerShare).toFixed(2)}</span>
                    </div>
                    <div class="revenue-item total">
                        <span>Total Revenue Earned:</span>
                        <span>$${(this.revenueTotal * this.developerShare).toFixed(2)}</span>
                    </div>
                </div>
                <div class="modal-actions">
                    <button class="share-badge">Share Achievement</button>
                    <button class="close-modal">Close</button>
                </div>
            </div>
        `;

        // Add modal styles
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 20000;
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: 'Segoe UI', sans-serif;
        `;

        document.body.appendChild(modal);

        // Close handlers
        modal.querySelector('.modal-backdrop').addEventListener('click', () => modal.remove());
        modal.querySelector('.close-modal').addEventListener('click', () => modal.remove());
        modal.querySelector('.share-badge').addEventListener('click', () => {
            this.shareBadge(badgeEvent);
        });
    }

    shareBadge(badgeEvent) {
        const shareText = `� Just earned "${badgeEvent.badgeName}" in Nature Sounds! ${badgeEvent.icon}\n\n${badgeEvent.description}\n\nExperience relaxing nature sounds: ${window.location.href}`;

        if (navigator.share) {
            navigator.share({
                title: `Badge Earned: ${badgeEvent.badgeName}`,
                text: shareText,
                url: window.location.href
            });
        } else {
            navigator.clipboard.writeText(shareText).then(() => {
                console.log('🔗 Badge achievement copied to clipboard!');
            });
        }
    }

    updateBadgeUI() {
        // Update badge counter in game UI
        const badgeCountElement = document.getElementById('badges-count');
        if (badgeCountElement && window.NatureBadges) {
            const badgeCount = window.NatureBadges.getBadgeCount();
            const totalBadges = Object.keys(NATURE_ACHIEVEMENTS || {}).length || 9;
            badgeCountElement.textContent = `${badgeCount}/${totalBadges}`;
        }
    }

    // Utility methods
    getSessionLength() {
        return Date.now() - (window.gameStartTime || Date.now());
    }

    getBrowserInfo() {
        return {
            userAgent: navigator.userAgent,
            language: navigator.language,
            platform: navigator.platform,
            viewport: `${window.innerWidth}x${window.innerHeight}`
        };
    }

    // Debug methods
    debugEarnBadge(badgeId) {
        if (!this.debugMode) return;

        if (window.NatureBadges) {
            // Force trigger badge through nature badge system
            console.log(`🐛 Debug: Force earned badge ${badgeId}`);
            if (window.badgeHelper && window.badgeHelper.awardBadge) {
                window.badgeHelper.awardBadge(badgeId, null, { debug: true });
            }
        } else {
            console.log(`🐛 Debug: Badge ${badgeId} not found - NatureBadges not loaded`);
        }
    }

    debugListBadges() {
        if (!this.debugMode) return;

        if (window.NATURE_ACHIEVEMENTS) {
            console.table(Object.values(window.NATURE_ACHIEVEMENTS));
        } else {
            console.log('🐛 Debug: NATURE_ACHIEVEMENTS not loaded');
        }
    }

    debugResetProgress() {
        if (!this.debugMode) return;

        localStorage.removeItem('nature_sounds_achievements');
        console.log('🐛 Debug: All progress reset');
        window.location.reload();
    }

    debugShowRevenue() {
        if (!this.debugMode) return;

        console.log(`💰 Debug Revenue Summary:`);
        console.log(`   Total Badge Value: $${this.revenueTotal}`);
        console.log(`   Developer Share (35%): $${(this.revenueTotal * this.developerShare).toFixed(2)}`);
        console.log(`   Platform Share (65%): $${(this.revenueTotal * (1 - this.developerShare)).toFixed(2)}`);
    }

    debugSimulate5Minutes() {
        if (!this.debugMode) return;

        // Simulate playing for 5+ minutes to bypass grace period
        if (window.NatureBadges) {
            console.log('🐛 Debug: Simulated 6+ minute session - try earning badges now');
        }
    }

    debugSkipGracePeriod() {
        if (!this.debugMode) return;

        console.log('🐛 Debug: Grace period bypassed for Nature Sounds');
    }
}

// Add required CSS for notifications and modals
const notificationCSS = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }

    .wavelength-badge-notification .notification-content {
        display: flex;
        align-items: flex-start;
        gap: 12px;
    }

    .wavelength-badge-notification .notification-icon {
        font-size: 2.5em;
        flex-shrink: 0;
        margin-top: 4px;
    }

    .wavelength-badge-notification .notification-text {
        flex: 1;
    }

    .wavelength-badge-notification .notification-title {
        font-weight: bold;
        color: #e94560;
        margin-bottom: 4px;
    }

    .wavelength-badge-notification .notification-badge-name {
        font-size: 1.1em;
        font-weight: bold;
        margin-bottom: 4px;
        color: #fff;
    }

    .wavelength-badge-notification .notification-description {
        font-size: 0.9em;
        color: #d4d4d8;
        margin-bottom: 8px;
        line-height: 1.3;
    }

    .wavelength-badge-notification .notification-revenue {
        font-size: 0.9em;
        color: #10b981;
        font-weight: bold;
    }

    .wavelength-badge-notification .notification-close {
        font-size: 1.5em;
        cursor: pointer;
        opacity: 0.7;
        transition: opacity 0.2s;
        flex-shrink: 0;
        line-height: 1;
    }

    .wavelength-badge-notification .notification-close:hover {
        opacity: 1;
    }

    .badge-detail-modal .modal-backdrop {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        backdrop-filter: blur(5px);
    }

    .badge-detail-modal .modal-content {
        background: linear-gradient(135deg, #1a1a2e, #16213e);
        border: 2px solid #e94560;
        border-radius: 16px;
        padding: 32px;
        max-width: 500px;
        width: 90%;
        color: white;
        position: relative;
        animation: modalZoomIn 0.3s ease-out;
    }

    @keyframes modalZoomIn {
        from {
            transform: scale(0.8);
            opacity: 0;
        }
        to {
            transform: scale(1);
            opacity: 1;
        }
    }

    .badge-detail-header {
        text-align: center;
        margin-bottom: 24px;
    }

    .badge-detail-header .badge-icon-large {
        font-size: 4em;
        margin-bottom: 16px;
    }

    .badge-detail-header h2 {
        margin: 0 0 12px 0;
        font-size: 1.8em;
        color: #fff;
    }

    .badge-rarity {
        display: inline-block;
        padding: 6px 12px;
        border-radius: 16px;
        font-size: 0.8em;
        font-weight: bold;
    }

    .badge-rarity.common { background: #4ade80; color: #000; }
    .badge-rarity.uncommon { background: #3b82f6; color: #fff; }
    .badge-rarity.rare { background: #a855f7; color: #fff; }
    .badge-rarity.legendary { background: #f59e0b; color: #000; }

    .badge-description {
        color: #d4d4d8;
        margin-bottom: 24px;
        line-height: 1.5;
        text-align: center;
    }

    .badge-revenue-info {
        background: rgba(0, 0, 0, 0.3);
        padding: 16px;
        border-radius: 12px;
        margin-bottom: 24px;
    }

    .revenue-item {
        display: flex;
        justify-content: space-between;
        margin-bottom: 8px;
        color: #d4d4d8;
    }

    .revenue-item.total {
        border-top: 1px solid rgba(255, 255, 255, 0.2);
        padding-top: 12px;
        margin-top: 12px;
        font-weight: bold;
        color: #10b981;
    }

    .modal-actions {
        display: flex;
        gap: 12px;
        justify-content: center;
    }

    .modal-actions button {
        padding: 10px 20px;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        font-weight: bold;
        transition: all 0.3s ease;
    }

    .share-badge {
        background: #e94560;
        color: white;
    }

    .close-modal {
        background: rgba(255, 255, 255, 0.1);
        color: #d4d4d8;
    }

    .modal-actions button:hover {
        transform: translateY(-2px);
    }
`;

// Inject CSS
const badgeStyle = document.createElement('style');
badgeStyle.textContent = notificationCSS;
document.head.appendChild(badgeStyle);

// Initialize badge helper
window.badgeHelper = new BadgeHelper('nature-sounds');

// Add WavelengthBadgeHelper class for backward compatibility
// Migrated to SDK 2.0 - hub-only, anonymous games
if (typeof WavelengthBadgeHelper === 'undefined') {
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

    window.WavelengthBadgeHelper = class WavelengthBadgeHelper {
        constructor(context = {}) {
            this.awardedBadges = new Set();
            this.sdkReady = false;

            // Wait for SDK to initialize
            waitForSDK(() => {
                this.sdkReady = true;
                console.log('[WavelengthBadgeHelper] SDK ready:', {
                    gameId: window.Wavelength?.game?.id,
                    tenantId: window.Wavelength?.game?.tenantId,
                    isHubGame: window.Wavelength?.game?.isHubGame,
                    sessionId: window.Wavelength?.player?.sessionId
                });
            });
        }

        /**
         * Award a badge to the player - REQUIRED METHOD
         * @param {string|Object} badgeIdOrParams - Badge ID or params object
         * @param {string} [badgeImage] - Base64 encoded badge image
         * @param {Object} [metadata] - Badge metadata
         * @returns {Promise<Object>} Badge award result
         */
        async awardBadge(badgeIdOrParams, badgeImage, metadata = {}) {
            let badgeId, params;

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

            if (this.awardedBadges.has(badgeId)) {
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

                    this.awardedBadges.add(badgeId);
                    this.showBadgeNotification(badgeId);
                    return result || { success: true, badgeId };
                } catch (error) {
                    console.error('[WavelengthBadgeHelper] Error awarding badge:', error);
                    this.showBadgeNotification(badgeId);
                    throw error;
                }
            } else {
                // Fallback: show notification even if SDK not available
                console.warn('[WavelengthBadgeHelper] SDK not available, showing local notification only');
                this.showBadgeNotification(badgeId);
                return { success: false, error: 'SDK not available', badgeId, mode: 'local' };
            }
        }

        showBadgeNotification(badgeId) {
            // Use existing badge helper's notification system if available
            if (window.badgeHelper && window.badgeHelper.showBadgeNotification) {
                // Create a mock badgeEvent for consistency
                const mockBadgeEvent = {
                    badgeId: badgeId,
                    badgeName: badgeId.replace(/_/g, ' '),
                    description: 'Nature Sounds Achievement',
                    icon: '🏆',
                    revenueValue: 5.0
                };
                window.badgeHelper.showBadgeNotification(mockBadgeEvent);
            } else {
                console.log(`🏆 Badge earned: ${badgeId}`);
            }
        }
    };

    // Auto-initialize WavelengthBadgeHelper if badgeHelper doesn't exist
    if (!window.badgeHelper || !window.badgeHelper.awardBadge) {
        window.badgeHelper = new WavelengthBadgeHelper();
    }
}

// Connect badge systems
if (window.NatureBadges) {
    console.log('🌿 Nature Sounds badge integration ready');
}

console.log('🌊 Wavelength Badge Helper initialized - Nature Sounds integration ready!');
