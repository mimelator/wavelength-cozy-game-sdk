// ✨ ENHANCED COSMIC POOL COLLECTOR - A Wavelength Cozy Game SDK Showcase ✨
// Featuring advanced particle effects, dynamic themes, and magical interactions
// Version 1.0.1

const gameConfig = {
    "title": "✨ Mystical Cosmic Pool Collector ✨",
    "theme": { "name": "Stardust", "background_color": "#000033" },
    "gameplay": {
        "type": "collection",
        "goal": "Collect cosmic treasures and unlock the mysteries of the universe!",
        "itemsToCollect": [
            { "name": "Stardust Cluster", "emoji": "✨", "rarity": "common", "value": 1, "effect": "sparkle" },
            { "name": "Nebula Crystal", "emoji": "💎", "rarity": "rare", "value": 25, "effect": "shockwave" },
            { "name": "Cosmic Wormhole", "emoji": "🌌", "rarity": "ultra-rare", "value": 100, "effect": "wormhole", "action": "cosmic_shift" },
            { "name": "Star Fragment", "emoji": "💫", "rarity": "uncommon", "value": 5, "effect": "shimmer" },
            { "name": "Galaxy Spiral", "emoji": "🌀", "rarity": "rare", "value": 50, "effect": "spiral" },
            { "name": "Aurora Wisp", "emoji": "🌈", "rarity": "uncommon", "value": 15, "effect": "rainbow" },
            { "name": "Void Essence", "emoji": "⚫", "rarity": "legendary", "value": 200, "effect": "void_pulse" }
        ]
    }
};

// Game state management
const gameState = {
    score: 0,
    multiplier: 1,
    particles: [],
    achievements: [],
    backgroundShift: 0,
    itemsCollected: 0,
    rarityBonus: 0,
    combo: 0,
    maxCombo: 0
};

// Badge system globals
let cosmicBadgeHelper = null;
let cosmicBadgeTracker = null;

const table = document.getElementById('cosmic-table');
const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');

// 🎨 Particle System for magical effects
class Particle {
    constructor(x, y, type = 'sparkle') {
        this.x = x;
        this.y = y;
        this.vx = (Math.random() - 0.5) * 4;
        this.vy = (Math.random() - 0.5) * 4;
        this.life = 1.0;
        this.decay = 0.02 + Math.random() * 0.02;
        this.type = type;
        this.size = Math.random() * 3 + 1;
        this.color = this.getParticleColor(type);
    }

    getParticleColor(type) {
        const colors = {
            sparkle: `hsl(${Math.random() * 60 + 40}, 100%, 70%)`, // Gold/yellow
            shockwave: `hsl(${Math.random() * 60 + 180}, 100%, 60%)`, // Cyan/blue
            shimmer: `hsl(${Math.random() * 60 + 280}, 100%, 80%)`, // Purple/magenta
            spiral: `hsl(${Math.random() * 360}, 70%, 60%)`, // Rainbow
            rainbow: `hsl(${Math.random() * 360}, 100%, 70%)`, // Full spectrum
            void_pulse: `hsl(${Math.random() * 60 + 260}, 50%, 30%)`, // Dark purple
            wormhole: `hsl(${Math.random() * 60 + 300}, 80%, 50%)` // Deep purple
        };
        return colors[type] || colors.sparkle;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.life -= this.decay;
        this.vx *= 0.98; // Gentle friction
        this.vy *= 0.98;

        if (this.type === 'spiral') {
            this.vx += Math.sin(this.life * 10) * 0.5;
            this.vy += Math.cos(this.life * 10) * 0.5;
        }

        return this.life > 0;
    }

    draw(ctx) {
        ctx.save();
        ctx.globalAlpha = this.life;
        ctx.fillStyle = this.color;

        if (this.type === 'void_pulse') {
            ctx.shadowBlur = 20;
            ctx.shadowColor = this.color;
        }

        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * this.life, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

// 🎮 Enhanced Game Initialization with Badge System
function initializeGame() {
    // Initialize badge system first
    initializeBadgeSystem();

    // Setup particle canvas
    canvas.width = table.offsetWidth;
    canvas.height = table.offsetHeight;
    canvas.style.position = 'absolute';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '10';
    table.appendChild(canvas);

    // Load enhanced configuration
    document.getElementById('game-title').textContent = gameConfig.title;
    document.getElementById('game-goal').textContent = gameConfig.gameplay.goal;

    // Create score display
    createScoreDisplay();

    // Spawn initial magical items
    for (let i = 0; i < 25; i++) {
        setTimeout(() => spawnCollectible(), i * 200);
    }

    // Start particle animation loop
    animateParticles();

    // Start background animation
    animateBackground();

    console.log('✨ Mystical Cosmic Pool Collector initialized with badge system! ✨');
}

// 🏆 Badge System Initialization with Dependency Checking
function initializeBadgeSystem() {
    try {
        // Ensure all dependencies are loaded before initializing
        if (typeof CosmicPoolBadgeHelper === 'undefined' ||
            typeof CosmicPoolBadgeTracker === 'undefined') {
            console.warn('[Cosmic Pool] Badge dependencies not fully loaded yet, waiting...');
            setTimeout(initializeBadgeSystem, 100);
            return;
        }

        // Initialize badge system (uses new Wavelength SDK)
        cosmicBadgeHelper = new CosmicPoolBadgeHelper();
        cosmicBadgeTracker = new CosmicPoolBadgeTracker(cosmicBadgeHelper);

        console.log('[Cosmic Pool] Badge system initialized successfully');

    } catch (error) {
        console.error('[Cosmic Pool] Failed to initialize badge system:', error);
        // Game should continue to work even if badge system fails
    }
}

// 📊 Enhanced Score Display
function createScoreDisplay() {
    const scorePanel = document.createElement('div');
    scorePanel.id = 'score-panel';
    scorePanel.innerHTML = `
        <div class="score-item">Score: <span id="score">0</span></div>
        <div class="score-item">Combo: <span id="combo">0</span></div>
        <div class="score-item">Items: <span id="items">0</span></div>
        <div class="score-item">Multiplier: <span id="multiplier">1x</span></div>
    `;
    document.querySelector('header').appendChild(scorePanel);
}

// ✨ Enhanced Collectible Spawning with Rarity System
function spawnCollectible() {
    const allItems = gameConfig.gameplay.itemsToCollect;

    // Advanced rarity weighting system
    const rarityWeights = {
        common: 50,
        uncommon: 25,
        rare: 15,
        'ultra-rare': 8,
        legendary: 2
    };

    // Create weighted array based on rarity
    const weightedItems = [];
    allItems.forEach(item => {
        const weight = rarityWeights[item.rarity] || 10;
        for (let i = 0; i < weight; i++) {
            weightedItems.push(item);
        }
    });

    const itemData = weightedItems[Math.floor(Math.random() * weightedItems.length)];
    const itemElement = document.createElement('div');
    itemElement.classList.add('collectible-item');

    // Enhanced visual effects based on rarity
    const rarityClass = `rarity-${itemData.rarity.replace('-', '')}`;
    itemElement.classList.add(rarityClass);

    // Dynamic drift speed based on rarity and type
    const driftSpeeds = {
        common: 'drift-slow',
        uncommon: 'drift-medium',
        rare: 'drift-fast',
        'ultra-rare': 'drift-cosmic',
        legendary: 'drift-legendary'
    };

    itemElement.classList.add(driftSpeeds[itemData.rarity] || 'drift-slow');
    itemElement.innerHTML = itemData.emoji;

    // Enhanced positioning with cosmic spread
    const angle = Math.random() * Math.PI * 2;
    const radius = Math.random() * 40 + 5; // 5-45% from center
    const centerX = 50;
    const centerY = 50;

    const x = centerX + Math.cos(angle) * radius;
    const y = centerY + Math.sin(angle) * radius;

    itemElement.style.left = `${Math.max(2, Math.min(95, x))}%`;
    itemElement.style.top = `${Math.max(2, Math.min(95, y))}%`;

    // Store item data for collection
    itemElement.itemData = itemData;

    // Enhanced interaction with hover effects
    itemElement.addEventListener('mouseenter', () => {
        itemElement.style.filter = 'brightness(1.5) drop-shadow(0 0 10px currentColor)';
    });

    itemElement.addEventListener('mouseleave', () => {
        itemElement.style.filter = 'none';
    });

    // Main collection handler
    itemElement.addEventListener('click', (e) => {
        e.preventDefault();
        collectItem(itemElement, itemData);
    });

    table.appendChild(itemElement);

    // Add entrance effect
    setTimeout(() => {
        itemElement.style.transform = 'scale(1) rotate(0deg)';
        itemElement.style.opacity = '1';
    }, 50);
}

// 🎆 Magical Collection System with Effects and Badge Integration
function collectItem(element, data) {
    const rect = element.getBoundingClientRect();
    const tableRect = table.getBoundingClientRect();
    const x = rect.left - tableRect.left + rect.width / 2;
    const y = rect.top - tableRect.top + rect.height / 2;

    // Calculate score with multipliers
    let earnedPoints = data.value * gameState.multiplier;

    // Combo system
    gameState.combo++;
    if (gameState.combo > 5) {
        earnedPoints *= 1.5; // Combo bonus
    }

    // Rarity bonus
    const rarityMultipliers = {
        common: 1,
        uncommon: 2,
        rare: 3,
        'ultra-rare': 5,
        legendary: 10
    };

    earnedPoints *= (rarityMultipliers[data.rarity] || 1);
    gameState.score += Math.floor(earnedPoints);
    gameState.itemsCollected++;

    // Update max combo
    if (gameState.combo > gameState.maxCombo) {
        gameState.maxCombo = gameState.combo;
    }

    // 🏆 Badge System Integration - Track collection events
    if (cosmicBadgeTracker) {
        cosmicBadgeTracker.onEvent({
            type: 'item_collected',
            data: {
                name: data.name,
                rarity: data.rarity,
                value: data.value,
                earnedPoints: earnedPoints,
                totalItems: gameState.itemsCollected
            }
        });

        // Track score updates
        cosmicBadgeTracker.onEvent({
            type: 'score_updated',
            data: {
                score: gameState.score,
                previousScore: gameState.score - earnedPoints
            }
        });

        // Track combo achievements
        if (gameState.combo > gameState.maxCombo - 1) {
            cosmicBadgeTracker.onEvent({
                type: 'combo_achieved',
                data: {
                    combo: gameState.combo,
                    maxCombo: gameState.maxCombo
                }
            });
        }

        // Track legendary collections
        if (data.rarity === 'legendary') {
            cosmicBadgeTracker.onEvent({
                type: 'legendary_collected',
                data: {
                    name: data.name,
                    score: gameState.score,
                    itemsCollected: gameState.itemsCollected
                }
            });
        }
    }

    // Create magical particle effects
    createParticleEffect(x, y, data.effect, earnedPoints);

    // Special item effects
    if (data.action === 'cosmic_shift') {
        triggerCosmicShift();
    }

    // Achievement checks (legacy system - now handled by badge tracker)
    checkAchievements(data);

    // Visual collection feedback
    const pointsDisplay = document.createElement('div');
    pointsDisplay.className = 'points-popup';
    pointsDisplay.textContent = `+${earnedPoints}`;
    pointsDisplay.style.left = element.style.left;
    pointsDisplay.style.top = element.style.top;
    table.appendChild(pointsDisplay);

    setTimeout(() => pointsDisplay.remove(), 1000);

    // Remove collected item with style
    element.style.transform = 'scale(0) rotate(360deg)';
    element.style.opacity = '0';
    setTimeout(() => element.remove(), 300);

    // Update UI
    updateScoreDisplay();

    // Spawn replacement after delay
    setTimeout(() => spawnCollectible(), 500 + Math.random() * 1000);

    console.log(`✨ Collected ${data.name}! Points: +${earnedPoints} | Total: ${gameState.score}`);
}

// 🎨 Particle Effect Creation
function createParticleEffect(x, y, effect, points) {
    const particleCount = Math.min(points / 5 + 5, 30); // More particles for higher value items

    for (let i = 0; i < particleCount; i++) {
        gameState.particles.push(new Particle(x, y, effect));
    }

    // Special effects for rare items
    if (effect === 'void_pulse') {
        // Create expanding ring effect
        for (let i = 0; i < 12; i++) {
            const angle = (i / 12) * Math.PI * 2;
            const particle = new Particle(x, y, effect);
            particle.vx = Math.cos(angle) * 3;
            particle.vy = Math.sin(angle) * 3;
            gameState.particles.push(particle);
        }
    }
}

// 🌌 Cosmic Shift Special Effect with Badge Integration
function triggerCosmicShift() {
    // Flash effect
    table.style.background = 'radial-gradient(circle, #ff00ff 0%, #000033 100%)';
    setTimeout(() => {
        table.style.background = '';
    }, 500);

    // Increase multiplier temporarily
    gameState.multiplier += 0.5;
    setTimeout(() => {
        gameState.multiplier = Math.max(1, gameState.multiplier - 0.5);
    }, 10000);

    // Create massive particle burst
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    for (let i = 0; i < 50; i++) {
        gameState.particles.push(new Particle(centerX, centerY, 'wormhole'));
    }

    // 🏆 Trigger badge event for cosmic shift
    if (cosmicBadgeTracker) {
        cosmicBadgeTracker.onEvent({
            type: 'cosmic_shift',
            data: {
                multiplier: gameState.multiplier,
                score: gameState.score,
                itemsCollected: gameState.itemsCollected,
                timestamp: Date.now()
            }
        });
    }

    console.log('🌌 COSMIC SHIFT ACTIVATED! Multiplier increased!');
}

// 🏆 Achievement System
function checkAchievements(data) {
    const achievements = [
        { id: 'first_collection', name: 'First Contact', condition: () => gameState.itemsCollected === 1 },
        { id: 'score_100', name: 'Cosmic Novice', condition: () => gameState.score >= 100 },
        { id: 'score_1000', name: 'Stardust Master', condition: () => gameState.score >= 1000 },
        { id: 'combo_10', name: 'Combo Champion', condition: () => gameState.combo >= 10 },
        { id: 'legendary_find', name: 'Void Walker', condition: () => data.rarity === 'legendary' }
    ];

    achievements.forEach(achievement => {
        if (!gameState.achievements.includes(achievement.id) && achievement.condition()) {
            gameState.achievements.push(achievement.id);
            showAchievement(achievement.name);
        }
    });
}

// 🎉 Achievement Display
function showAchievement(name) {
    const achievementEl = document.createElement('div');
    achievementEl.className = 'achievement';
    achievementEl.innerHTML = `🏆 Achievement Unlocked: ${name}`;
    document.body.appendChild(achievementEl);

    setTimeout(() => achievementEl.remove(), 3000);
}

// 📊 Score Display Updates
function updateScoreDisplay() {
    document.getElementById('score').textContent = gameState.score.toLocaleString();
    document.getElementById('combo').textContent = gameState.combo;
    document.getElementById('items').textContent = gameState.itemsCollected;
    document.getElementById('multiplier').textContent = `${gameState.multiplier.toFixed(1)}x`;
}

// 🎬 Animation Systems
function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Update and draw particles
    gameState.particles = gameState.particles.filter(particle => {
        const alive = particle.update();
        if (alive) particle.draw(ctx);
        return alive;
    });

    // Add ambient sparkles
    if (Math.random() < 0.3) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        gameState.particles.push(new Particle(x, y, 'sparkle'));
    }

    requestAnimationFrame(animateParticles);
}

// 🌈 Dynamic Background Animation
function animateBackground() {
    gameState.backgroundShift += 0.5;
    const hue = (gameState.backgroundShift * 0.1) % 360;

    // Subtle background color shifting
    document.body.style.background = `linear-gradient(45deg,
        hsl(${hue}, 30%, 5%) 0%,
        hsl(${(hue + 60) % 360}, 40%, 8%) 50%,
        hsl(${(hue + 120) % 360}, 30%, 5%) 100%)`;

    // Combo decay over time
    if (gameState.combo > 0 && Math.random() < 0.1) {
        gameState.combo = Math.max(0, gameState.combo - 1);
        updateScoreDisplay();
    }

    setTimeout(animateBackground, 100);
}

// 🎮 Game Initialization Call
initializeGame();
