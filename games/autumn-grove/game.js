// 🍂 AUTUMN GROVE - Cozy Fall Collection Game 🍂
// A magical autumn experience with falling leaves and forest treasures
// Version 1.1.3 - Enhanced for Wavelength Hub

const gameConfig = {
    "title": "🍂 Autumn Grove 🍂",
    "theme": {
        "name": "autumn",
        "mood": "cozy",
        "background_color": "#8c510a"
    },
    "gameplay": {
        "type": "collection",
        "goal": "Wander through the enchanted autumn forest and gather nature's treasures as the seasons change",
        "itemsToCollect": [
            // Common autumn treasures
            { "name": "Maple Leaf", "emoji": "🍁", "rarity": "common", "value": 2, "effect": "gentle_spiral" },
            { "name": "Oak Leaf", "emoji": "🍂", "rarity": "common", "value": 1, "effect": "warm_glow" },
            { "name": "Acorn", "emoji": "🌰", "rarity": "common", "value": 3, "effect": "bounce" },

            // Uncommon forest finds
            { "name": "Pine Cone", "emoji": "🌲", "rarity": "uncommon", "value": 8, "effect": "forest_shimmer" },
            { "name": "Apple", "emoji": "🍎", "rarity": "uncommon", "value": 12, "effect": "crisp_burst" },
            { "name": "Pumpkin", "emoji": "🎃", "rarity": "uncommon", "value": 15, "effect": "harvest_glow" },

            // Rare seasonal treasures
            { "name": "Mushroom", "emoji": "🍄", "rarity": "rare", "value": 25, "effect": "fairy_circle" },
            { "name": "Chestnut", "emoji": "🌰", "rarity": "rare", "value": 30, "effect": "autumn_warmth" },
            { "name": "Sunflower", "emoji": "🌻", "rarity": "rare", "value": 40, "effect": "sunshine_burst" },

            // Epic autumn magic
            { "name": "Golden Leaf", "emoji": "🍃", "rarity": "epic", "value": 75, "effect": "golden_cascade", "special": "spirit_boost" },
            { "name": "Harvest Moon", "emoji": "🌕", "rarity": "epic", "value": 100, "effect": "moonbeam", "special": "time_slow" },

            // Legendary forest spirits
            { "name": "Autumn Spirit", "emoji": "🧚‍♀️", "rarity": "legendary", "value": 200, "effect": "spirit_dance", "special": "season_shift" },
            { "name": "Forest Heart", "emoji": "💚", "rarity": "legendary", "value": 300, "effect": "life_pulse", "special": "grove_blessing" }
        ]
    }
};

// 🎮 Game State Management
const gameState = {
    score: 0,
    leavesCollected: 0,
    spiritLevel: 1,
    cozyStreak: 0,
    maxStreak: 0,
    particles: [],
    seasonIntensity: 1.0,
    lastCollectionTime: 0,
    windActive: false,
    windTimer: 0
};

// 🎨 Particle System for Autumn Magic
class AutumnParticle {
    constructor(x, y, type = 'leaf_sparkle') {
        this.x = x;
        this.y = y;
        this.vx = (Math.random() - 0.5) * 3;
        this.vy = (Math.random() - 0.5) * 3;
        this.life = 1.0;
        this.decay = 0.015 + Math.random() * 0.01;
        this.type = type;
        this.size = Math.random() * 4 + 2;
        this.color = this.getParticleColor(type);
        this.angle = 0;
        this.rotationSpeed = (Math.random() - 0.5) * 0.1;
    }

    getParticleColor(type) {
        const colors = {
            gentle_spiral: `hsl(${Math.random() * 60 + 30}, 70%, 60%)`, // Orange/yellow
            warm_glow: `hsl(${Math.random() * 40 + 10}, 80%, 65%)`, // Warm orange
            forest_shimmer: `hsl(${Math.random() * 60 + 80}, 60%, 50%)`, // Green
            crisp_burst: `hsl(${Math.random() * 20 + 350}, 90%, 60%)`, // Red
            harvest_glow: `hsl(${Math.random() * 40 + 20}, 90%, 60%)`, // Orange
            fairy_circle: `hsl(${Math.random() * 60 + 280}, 70%, 70%)`, // Purple
            autumn_warmth: `hsl(${Math.random() * 40 + 15}, 85%, 55%)`, // Warm browns
            sunshine_burst: `hsl(${Math.random() * 20 + 50}, 100%, 65%)`, // Bright yellow
            golden_cascade: `hsl(${Math.random() * 20 + 45}, 100%, 70%)`, // Gold
            moonbeam: `hsl(${Math.random() * 30 + 200}, 60%, 80%)`, // Silver/blue
            spirit_dance: `hsl(${Math.random() * 360}, 80%, 70%)`, // Rainbow
            life_pulse: `hsl(${Math.random() * 60 + 100}, 80%, 60%)`, // Green spectrum
            bounce: `hsl(${Math.random() * 40 + 25}, 75%, 60%)` // Brown/orange
        };
        return colors[type] || colors.warm_glow;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.life -= this.decay;
        this.angle += this.rotationSpeed;

        // Wind effect on particles
        if (gameState.windActive) {
            this.vx += 0.2; // Wind blows right
        }

        // Gentle gravity and air resistance
        this.vy += 0.02; // Gentle fall
        this.vx *= 0.99; // Air resistance
        this.vy *= 0.99;

        // Special movement patterns
        if (this.type === 'gentle_spiral') {
            this.vx += Math.sin(this.life * 15) * 0.3;
        } else if (this.type === 'spirit_dance') {
            this.vx += Math.sin(this.life * 20) * 0.5;
            this.vy += Math.cos(this.life * 20) * 0.3;
        }

        return this.life > 0;
    }

    draw(ctx) {
        ctx.save();
        ctx.globalAlpha = this.life * 0.8;
        ctx.fillStyle = this.color;

        // Add glow for special effects
        if (this.type === 'golden_cascade' || this.type === 'spirit_dance') {
            ctx.shadowBlur = 15;
            ctx.shadowColor = this.color;
        }

        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);

        ctx.beginPath();
        ctx.arc(0, 0, this.size * this.life, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

// 🎮 Game Initialization
function initializeGame() {
    const canvas = document.getElementById('particle-canvas');
    const ctx = canvas.getContext('2d');

    // Setup particle canvas
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Initialize badge system first
    initializeBadgeSystem();

    // Load game configuration
    document.getElementById('game-title').textContent = gameConfig.title;
    document.getElementById('game-description').textContent = gameConfig.gameplay.goal;

    // Start spawning autumn treasures
    for (let i = 0; i < 20; i++) {
        setTimeout(() => spawnAutumnItem(), i * 300);
    }

    // Start game loops
    animateParticles(ctx);
    animateSeasonalEffects();
    
    // Start random wind events
    scheduleWindEvent();

    // Resize handler
    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });

    console.log('🍂 Autumn Grove initialized! Welcome to the enchanted forest! 🍂');
}

// 🏆 Initialize Badge System
function initializeBadgeSystem() {
    // Ensure all dependencies are loaded before initializing
    if (typeof AutumnBadgeHelper === 'undefined' ||
        typeof AutumnBadgeTracker === 'undefined') {
        console.warn('[Autumn Grove] Badge dependencies not loaded yet, retrying...');
        setTimeout(initializeBadgeSystem, 100);
        return;
    }

    try {
        // Initialize badge helper (uses new Wavelength SDK)
        window.autumnBadgeHelper = new AutumnBadgeHelper();

        // Initialize badge tracker
        window.autumnBadgeTracker = new AutumnBadgeTracker(window.autumnBadgeHelper);

        console.log('🏆 Autumn Grove badge system initialized successfully!');

        // Add CSS for badge notifications
        addBadgeNotificationStyles();

    } catch (error) {
        console.error('[Autumn Grove] Failed to initialize badge system:', error);
    }
}

// 🎨 Add Badge Notification Styles
function addBadgeNotificationStyles() {
    if (document.querySelector('#badge-notification-styles')) return;

    const style = document.createElement('style');
    style.id = 'badge-notification-styles';
    style.textContent = `
        .badge-notification {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0, 0, 0, 0.9);
            backdrop-filter: blur(15px);
            border: 2px solid;
            border-radius: 20px;
            color: white;
            padding: 20px;
            text-align: center;
            font-weight: 600;
            min-width: 200px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
            animation: badgeSlideIn 0.6s ease-out, badgeSlideOut 0.5s ease-in 2.5s forwards;
            transform: translateY(20px);
            opacity: 0;
            z-index: 1000;
        }

        .badge-notification.common { border-color: #9ca3af; }
        .badge-notification.uncommon { border-color: #22c55e; }
        .badge-notification.rare { border-color: #3b82f6; }
        .badge-notification.epic { border-color: #a855f7; }
        .badge-notification.legendary { border-color: #f59e0b; }

        @keyframes badgeSlideIn {
            0% { opacity: 0; transform: translate(-50%, -50%) translateY(20px); }
            100% { opacity: 1; transform: translate(-50%, -50%) translateY(0); }
        }

        @keyframes badgeSlideOut {
            0% { opacity: 1; transform: translate(-50%, -50%) translateY(0); }
            100% { opacity: 0; transform: translate(-50%, -50%) translateY(-20px); }
        }
    `;
    document.head.appendChild(style);
}

// 🍃 Enhanced Item Spawning with Autumn Magic
function spawnAutumnItem() {
    const allItems = gameConfig.gameplay.itemsToCollect;

    // Seasonal rarity weighting (more rare items as spirit level increases)
    const baseWeights = {
        common: 40,
        uncommon: 25,
        rare: 15,
        epic: 8,
        legendary: 2
    };

    // Adjust weights based on spirit level
    const spiritBonus = (gameState.spiritLevel - 1) * 0.5;
    const adjustedWeights = {
        common: Math.max(20, baseWeights.common - spiritBonus * 5),
        uncommon: baseWeights.uncommon + spiritBonus * 2,
        rare: baseWeights.rare + spiritBonus * 2,
        epic: baseWeights.epic + spiritBonus * 1,
        legendary: baseWeights.legendary + spiritBonus * 0.5
    };

    // Create weighted selection array
    const weightedItems = [];
    allItems.forEach(item => {
        const weight = Math.floor(adjustedWeights[item.rarity] || 10);
        for (let i = 0; i < weight; i++) {
            weightedItems.push(item);
        }
    });

    const itemData = weightedItems[Math.floor(Math.random() * weightedItems.length)];
    const itemElement = document.createElement('div');
    itemElement.classList.add('collectible-item');

    // Add rarity-based styling
    const rarityClass = `rarity-${itemData.rarity.replace('-', '')}`;
    itemElement.classList.add(rarityClass);

    // Add movement animation based on rarity
    const movementStyles = {
        common: 'drift-gentle',
        uncommon: 'drift-moderate',
        rare: 'drift-fast',
        epic: 'drift-magical',
        legendary: 'drift-magical'
    };

    itemElement.classList.add(movementStyles[itemData.rarity] || 'drift-gentle');
    itemElement.innerHTML = itemData.emoji;

    // Position items naturally around the grove
    const collectionGround = document.getElementById('collection-ground');
    const angle = Math.random() * Math.PI * 2;
    const radius = Math.random() * 35 + 10; // 10-45% from center
    const centerX = 50;
    const centerY = 50;

    const x = centerX + Math.cos(angle) * radius;
    const y = centerY + Math.sin(angle) * radius;

    itemElement.style.left = `${Math.max(3, Math.min(94, x))}%`;
    itemElement.style.top = `${Math.max(3, Math.min(94, y))}%`;

    // Store item data
    itemElement.itemData = itemData;

    // Enhanced hover effects
    itemElement.addEventListener('mouseenter', () => {
        itemElement.style.filter = 'brightness(1.4) drop-shadow(0 0 12px currentColor)';
        createParticleEffect(
            itemElement.offsetLeft + itemElement.offsetWidth / 2,
            itemElement.offsetTop + itemElement.offsetHeight / 2,
            itemData.effect,
            3
        );
    });

    itemElement.addEventListener('mouseleave', () => {
        itemElement.style.filter = '';
    });

    // Collection handler
    itemElement.addEventListener('click', (e) => {
        e.preventDefault();
        collectAutumnTreasure(itemElement, itemData);
    });

    collectionGround.appendChild(itemElement);

    // Entrance animation
    setTimeout(() => {
        itemElement.style.transform = 'scale(1)';
        itemElement.style.opacity = '1';
    }, 100);
}

// 🌬️ Wind Gust Mechanics
function scheduleWindEvent() {
    const delay = 15000 + Math.random() * 30000; // Wind every 15-45 seconds
    setTimeout(triggerWindGust, delay);
}

function triggerWindGust() {
    gameState.windActive = true;
    const windOverlay = document.getElementById('wind-overlay');
    windOverlay.classList.add('wind-active');
    document.getElementById('collection-ground').classList.add('wind-gust');

    showAchievement('🌬️ A magical wind gusts through the grove!');

    // Spawn many items rapidly
    let spawnCount = 0;
    const interval = setInterval(() => {
        spawnAutumnItem();
        spawnCount++;
        if (spawnCount > 10) clearInterval(interval);
    }, 200);

    // End wind after 5 seconds
    setTimeout(() => {
        gameState.windActive = false;
        windOverlay.classList.remove('wind-active');
        document.getElementById('collection-ground').classList.remove('wind-gust');
        scheduleWindEvent();
    }, 5000);
}

// 🍂 Magical Collection System
function collectAutumnTreasure(element, data) {
    const rect = element.getBoundingClientRect();
    const collectionRect = document.getElementById('collection-ground').getBoundingClientRect();
    const x = rect.left - collectionRect.left + rect.width / 2;
    const y = rect.top - collectionRect.top + rect.height / 2;

    // Calculate points with seasonal bonuses
    let earnedPoints = data.value;

    // Cozy streak bonus
    const timeSinceLastCollection = Date.now() - gameState.lastCollectionTime;
    if (timeSinceLastCollection < 5000) { // Within 5 seconds = cozy streak
        gameState.cozyStreak++;
        earnedPoints *= (1 + gameState.cozyStreak * 0.1); // 10% per streak
        showCombo(gameState.cozyStreak);
    } else {
        gameState.cozyStreak = 0;
    }

    // Spirit level bonus
    earnedPoints *= gameState.spiritLevel;

    // Rarity multipliers
    const rarityMultipliers = {
        common: 1,
        uncommon: 1.5,
        rare: 2.5,
        epic: 4,
        legendary: 6
    };

    earnedPoints *= (rarityMultipliers[data.rarity] || 1);
    earnedPoints = Math.floor(earnedPoints);

    // Update game state
    gameState.score += earnedPoints;
    gameState.leavesCollected++;
    gameState.lastCollectionTime = Date.now();

    if (gameState.cozyStreak > gameState.maxStreak) {
        gameState.maxStreak = gameState.cozyStreak;
    }

    // Create magical particle effects
    createParticleEffect(x, y, data.effect, earnedPoints / 5 + 5);

    // Special item effects
    if (data.special) {
        triggerSpecialEffect(data.special);
    }

    // Check for spirit level increase
    // Use triangular number formula for threshold: Level * (Level + 1) / 2 * 500
    // This ensures ~20 clicks per level even as point multiplier increases
    const nextLevelThreshold = 250 * gameState.spiritLevel * (gameState.spiritLevel + 1);
    
    if (gameState.score >= nextLevelThreshold) {
        gameState.spiritLevel++;
        showAchievement(`🌟 Spirit Level ${gameState.spiritLevel} Reached!`);

        // Track spirit level for badges
        if (window.autumnBadgeTracker) {
            window.autumnBadgeTracker.onSpiritLevelUp(gameState.spiritLevel);
        }
    }

    // Track item collection for badge system
    if (window.autumnBadgeTracker) {
        window.autumnBadgeTracker.onItemCollected({
            name: data.name,
            rarity: data.rarity,
            value: earnedPoints
        });
    }

    // Visual feedback
    showPointsPopup(earnedPoints, element);

    // Collection animation
    element.style.transform = 'scale(0) rotate(180deg)';
    element.style.opacity = '0';
    setTimeout(() => element.remove(), 400);

    // Update UI
    updateScoreDisplay();

    // Spawn replacement after delay (faster during wind)
    const respawnDelay = gameState.windActive ? 500 : (1000 + Math.random() * 2000);
    setTimeout(() => spawnAutumnItem(), respawnDelay);

    console.log(`🍂 Collected ${data.name}! Points: +${earnedPoints} | Streak: ${gameState.cozyStreak}`);
}

// ✨ Particle Effect Creation
function createParticleEffect(x, y, effect, count) {
    const particleCount = Math.min(count, 25);

    for (let i = 0; i < particleCount; i++) {
        gameState.particles.push(new AutumnParticle(x, y, effect));
    }

    // Special particle patterns for epic effects
    if (effect === 'spirit_dance') {
        for (let i = 0; i < 15; i++) {
            const angle = (i / 15) * Math.PI * 2;
            const particle = new AutumnParticle(x, y, effect);
            particle.vx = Math.cos(angle) * 2;
            particle.vy = Math.sin(angle) * 2;
            gameState.particles.push(particle);
        }
    }
}

// 🌟 Special Effects System
function triggerSpecialEffect(special) {
    // Track autumn magic usage for badges
    if (window.autumnBadgeTracker) {
        window.autumnBadgeTracker.onAutumnMagic();
    }

    switch (special) {
        case 'spirit_boost':
            gameState.seasonIntensity = Math.min(3.0, gameState.seasonIntensity + 0.2);
            document.body.style.filter = `brightness(${0.9 + gameState.seasonIntensity * 0.1}) saturate(${0.8 + gameState.seasonIntensity * 0.2})`;
            break;

        case 'time_slow':
            // Slow down all animations temporarily
            document.querySelectorAll('.collectible-item').forEach(item => {
                item.style.animationDuration = '40s';
            });
            setTimeout(() => {
                document.querySelectorAll('.collectible-item').forEach(item => {
                    item.style.animationDuration = '';
                });
            }, 10000);
            break;

        case 'season_shift':
            // Dramatic seasonal color shift
            document.body.style.filter = 'hue-rotate(30deg) brightness(1.2) saturate(1.5)';
            setTimeout(() => {
                document.body.style.filter = '';
            }, 8000);
            break;

        case 'grove_blessing':
            // Massive particle burst
            const center = document.getElementById('collection-ground');
            const centerRect = center.getBoundingClientRect();
            const x = centerRect.width / 2;
            const y = centerRect.height / 2;

            for (let i = 0; i < 40; i++) {
                gameState.particles.push(new AutumnParticle(x, y, 'life_pulse'));
            }
            break;
    }
}

// 🎉 UI Update Functions
function showPointsPopup(points, element) {
    const popup = document.createElement('div');
    popup.className = 'points-popup';
    popup.textContent = `+${points}`;
    popup.style.left = element.style.left;
    popup.style.top = element.style.top;

    document.getElementById('collection-ground').appendChild(popup);
    setTimeout(() => popup.remove(), 1500);
}

function showAchievement(message) {
    const achievementEl = document.createElement('div');
    achievementEl.className = 'achievement';
    achievementEl.textContent = message;

    document.getElementById('achievements-area').appendChild(achievementEl);
    setTimeout(() => achievementEl.remove(), 4000);
}

function showCombo(streak) {
    if (streak < 2) return;
    
    const comboEl = document.getElementById('combo-display');
    comboEl.textContent = `${streak}x Combo!`;
    comboEl.classList.add('active');
    
    // Reset animation
    comboEl.style.animation = 'none';
    comboEl.offsetHeight; /* trigger reflow */
    comboEl.style.animation = null; 

    // Clear previous timeout
    if (comboEl.timeout) clearTimeout(comboEl.timeout);
    
    comboEl.timeout = setTimeout(() => {
        comboEl.classList.remove('active');
    }, 1000);
}

function updateScoreDisplay() {
    document.getElementById('leaves-count').textContent = gameState.leavesCollected.toLocaleString();
    document.getElementById('total-score').textContent = gameState.score.toLocaleString();
    document.getElementById('spirit-level').textContent = gameState.spiritLevel;
    document.getElementById('streak-count').textContent = gameState.cozyStreak;
}

// 🎬 Animation Systems
function animateParticles(ctx) {
    // Clear with trail effect
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    // We can't clear with fillStyle/fillRect easily because the canvas is over the DOM.
    // Just clearRect for now, maybe improve later if performance allows
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    // Update and draw particles
    gameState.particles = gameState.particles.filter(particle => {
        const alive = particle.update();
        if (alive) particle.draw(ctx);
        return alive;
    });

    // Add ambient autumn sparkles
    if (Math.random() < 0.1) {
        const x = Math.random() * ctx.canvas.width;
        const y = Math.random() * ctx.canvas.height;
        gameState.particles.push(new AutumnParticle(x, y, 'warm_glow'));
    }

    requestAnimationFrame(() => animateParticles(ctx));
}

function animateSeasonalEffects() {
    // Gentle season progression
    const time = Date.now() * 0.0001;
    const seasonPhase = Math.sin(time) * 0.1 + 1;

    // Update background leaves
    document.querySelectorAll('.leaf').forEach((leaf, index) => {
        const phase = time + index * 0.5;
        const drift = Math.sin(phase) * 10;
        leaf.style.transform = `translateX(${drift}px)`;
    });

    setTimeout(animateSeasonalEffects, 100);
}

// 🎮 Start the autumn adventure
document.addEventListener('DOMContentLoaded', initializeGame);
