/**
 * VIBE Coding Template: Game Logic Extensions
 * Enhanced with Badge System for Badge Driven Merch Experience
 */

class GameLogicExtensions {
    constructor(gameEngine) {
        this.game = gameEngine;
        this.init();
    }

    init() {
        console.log('🎯 Game Logic Extensions with Badge System loaded!');

        // Load badge configuration from game.json
        this.badgeConfig = this.game.config.badges || { enabled: false };
        
        // Initialize badge tracking
        this.achievements = {
            first_collection: false,
            dedicated_collector: false,
            treasure_hunter: false,
            spirit_whisperer: false,
            completionist: false
        };

        // Initialize Badge API client
        this.badgeAPI = new BadgeAPI(this.badgeConfig);
        this.checkAchievements();
    }

    checkAchievements() {
        setInterval(() => {
            this.updateAchievements();
        }, 2000);
    }

    updateAchievements() {
        const state = this.game.gameState;
        
        if (this.badgeConfig.enabled && this.badgeConfig.insigniaOfMerit) {
            this.badgeConfig.insigniaOfMerit.forEach(badge => {
                this.checkBadgeTrigger(badge, state);
            });
        }
    }

    checkBadgeTrigger(badge, gameState) {
        if (this.achievements[badge.id]) return;

        const trigger = badge.trigger;
        let earned = false;

        switch (trigger.type) {
            case 'items_collected':
                earned = gameState.itemsCollected >= trigger.threshold;
                break;
            case 'rare_items_collected':
                const rareItems = gameState.collectedItems.filter(item => 
                    trigger.rarities.includes(item.rarity)
                );
                earned = rareItems.length >= trigger.threshold;
                break;
            case 'specific_item_collected':
                earned = gameState.collectedItems.some(item => 
                    item.id === trigger.item_id
                );
                break;
            case 'goal_completion':
                if (trigger.requirement === 'collection_goal_met') {
                    const goal = this.game.config.gameplay.collectionGoal;
                    earned = gameState.itemsCollected >= goal;
                }
                break;
        }

        if (earned) {
            this.awardBadge(badge, gameState);
        }
    }

    async awardBadge(badge, gameState) {
        this.achievements[badge.id] = true;
        this.showAchievement(badge.name, badge.description, badge.image);
        
        if (this.badgeConfig.enabled && this.badgeAPI) {
            try {
                const result = await this.badgeAPI.awardBadge({
                    badgeId: badge.id,
                    metadata: {
                        score: gameState.score || 0,
                        itemsCollected: gameState.itemsCollected || 0
                    }
                });
                
                if (result.success) {
                    this.showBadgeEarnedNotification(result.badge);
                }
                
            } catch (error) {
                console.warn('Badge API error:', error);
            }
        }
    }

    showAchievement(title, description, emoji = '🏅') {
        const notification = document.createElement('div');
        notification.innerHTML = `
            <div style="font-size: 2rem; margin-right: 1rem;">${emoji}</div>
            <div>
                <div style="font-weight: bold; color: #FFD700;">${title}</div>
                <div style="opacity: 0.9;">${description}</div>
            </div>
        `;

        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #4CAF50, #45A049);
            color: white;
            padding: 1rem;
            border-radius: 15px;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
            z-index: 1000;
            display: flex;
            align-items: center;
            min-width: 300px;
        `;

        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 4000);
    }

    showBadgeEarnedNotification(badge) {
        const notification = document.createElement('div');
        notification.innerHTML = `
            <div style="font-size: 2rem; margin-right: 1rem;">${badge.image || '🏅'}</div>
            <div>
                <div style="font-weight: bold; color: #FFD700;">🎉 Badge Earned!</div>
                <div style="font-weight: bold;">${badge.name}</div>
                <div style="opacity: 0.9;">${badge.description}</div>
                <div style="font-size: 0.8rem; opacity: 0.8;">Available for merch!</div>
            </div>
        `;

        notification.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: linear-gradient(135deg, #8B5CF6, #A855F7);
            color: white;
            padding: 1.5rem;
            border-radius: 20px;
            box-shadow: 0 10px 25px rgba(139, 92, 246, 0.4);
            z-index: 1001;
            display: flex;
            align-items: center;
            min-width: 350px;
        `;

        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 6000);
    }

    addSpecialEffects() {
        console.log('✨ Special effects ready');
    }

    addCustomItemBehaviors() {
        console.log('🎨 Custom item behaviors ready');
    }

    addSeasonalEvents() {
        console.log('🌸 Seasonal events ready');
    }
}

/**
 * Badge API Client for dev kit testing
 */
class BadgeAPI {
    constructor(config) {
        this.config = config || {};
        this.endpoint = config.apiEndpoint || 'https://hub.wavelength.com/api/games';
        this.gameId = this.getGameId();
        this.sessionId = this.getSessionId();
    }

    getGameId() {
        const params = new URLSearchParams(window.location.search);
        return params.get('gameId') || 'simple-collector';
    }

    getSessionId() {
        let sessionId = sessionStorage.getItem('vibeGameSessionId');
        if (!sessionId) {
            sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            sessionStorage.setItem('vibeGameSessionId', sessionId);
        }
        return sessionId;
    }

    async awardBadge(badgeData) {
        if (!this.config.enabled) {
            console.log('Badge API disabled - local only');
            return { 
                success: false, 
                message: 'Badge API disabled',
                badge: {
                    badgeId: badgeData.badgeId,
                    name: badgeData.badgeId.replace(/_/g, ' ').toUpperCase(),
                    image: '🏅'
                }
            };
        }

        const payload = {
            badgeId: badgeData.badgeId,
            playerId: this.sessionId,
            metadata: badgeData.metadata || {},
            timestamp: Date.now()
        };

        try {
            const response = await fetch(`${this.endpoint}/${this.gameId}/badges/award`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Game-Session': this.sessionId
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error(`Badge API error: ${response.status}`);
            }

            return await response.json();

        } catch (error) {
            console.warn('Badge API failed:', error);
            return { 
                success: false, 
                error: error.message,
                badge: {
                    badgeId: badgeData.badgeId,
                    name: badgeData.badgeId.replace(/_/g, ' ').toUpperCase(),
                    image: '🏅'
                }
            };
        }
    }
}