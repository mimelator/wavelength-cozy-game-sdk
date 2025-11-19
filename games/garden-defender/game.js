// 🌱 GARDEN DEFENDER - Tower Defense with Cultivation Mechanics
// Inspired by Missile Command timing with nature-based strategy
// Version 1.0.0

// Game Configuration
const GAME_CONFIG = {
    canvas: {
        width: 1200,    /* Increased from 800 */
        height: 900     /* Increased from 600 */
    },
    garden: {
        groundLevel: 675,  /* Increased from 450 (75% of 900) */
        tomatoPositions: [200, 400, 600, 800, 1000],  /* Spread wider for 1200px */
        cannonPositions: [150, 350, 600, 850, 1050], /* Seed dispensers positioned strategically */
        seedTypes: {
            marigold: { cost: 10, growthTime: 3000, range: 120, effect: 'repel', emoji: '🌼', color: '#ffd700' },      /* Increased range from 80 */
            basil: { cost: 15, growthTime: 4000, range: 140, effect: 'slow', emoji: '🌿', color: '#90ee90' },          /* Increased range from 100 */
            lavender: { cost: 20, growthTime: 5000, range: 160, effect: 'confuse', emoji: '💜', color: '#dda0dd' },    /* Increased range from 120 */
            rosemary: { cost: 25, growthTime: 6000, range: 180, effect: 'damage', emoji: '🌾', color: '#8fbc8f' },     /* Increased range from 140 */
            mint: { cost: 30, growthTime: 7000, range: 200, effect: 'freeze', emoji: '🍃', color: '#98fb98' }          /* Increased range from 160 */
        },
        bugTypes: {
            aphid: { health: 1, speed: 1, size: 12, color: '#90ee90', emoji: '🐛', points: 10 },        /* Increased size from 8 */
            caterpillar: { health: 2, speed: 0.8, size: 18, color: '#32cd32', emoji: '🐛', points: 20 }, /* Increased size from 12 */
            beetle: { health: 3, speed: 1.2, size: 15, color: '#006400', emoji: '🪲', points: 30 },      /* Increased size from 10 */
            wasp: { health: 2, speed: 1.5, size: 14, color: '#ffff00', emoji: '🐝', points: 25 },       /* Increased size from 9 */
            spider: { health: 4, speed: 0.6, size: 20, color: '#8b4513', emoji: '🕷️', points: 40 }      /* Increased size from 14 */
        }
    }
};

// Game State
const gameState = {
    // Resources
    seedCurrency: 100,
    tomatoHealth: 5,
    currentWave: 1,
    bugsRemaining: 0,

    // Game objects
    seeds: [],
    plants: [],
    bugs: [],
    particles: [],
    cannons: [],  // Seed dispensers

    // UI state
    selectedSeedType: 'marigold',
    gameRunning: false,
    waveActive: false,
    paused: false,

    // Statistics
    stats: {
        wavesCompleted: 0,
        plantsGrown: 0,
        bugsDefeated: 0,
        tomatoesLost: 0,
        totalScore: 0
    }
};

// Badge system globals
let gardenBadgeHelper = null;
let gardenBadgeTracker = null;

// Canvas and context
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');

// Set canvas size
canvas.width = GAME_CONFIG.canvas.width;
canvas.height = GAME_CONFIG.canvas.height;

// Game Classes
class Cannon {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.angle = 0; // Cannon barrel angle
        this.lastShotTime = 0;
        this.cooldown = 200; // Minimum time between shots
        this.targetX = 0;
        this.targetY = 0;
        this.isActive = false;
    }

    aimAt(targetX, targetY) {
        this.targetX = targetX;
        this.targetY = targetY;

        // Calculate angle to target
        const dx = targetX - this.x;
        const dy = targetY - this.y;
        this.angle = Math.atan2(dy, dx);
        this.isActive = true;
    }

    canFire() {
        return Date.now() - this.lastShotTime > this.cooldown;
    }

    fire(seedType) {
        if (!this.canFire()) return null;

        this.lastShotTime = Date.now();

        // Create muzzle flash effect
        this.createMuzzleFlash();

        // Calculate launch position at barrel tip
        const barrelLength = 35;
        const launchX = this.x + Math.cos(this.angle) * barrelLength;
        const launchY = this.y + Math.sin(this.angle) * barrelLength;

        // Create and return the seed
        const seed = new Seed(launchX, launchY, seedType, this.targetX, this.targetY);
        return seed;
    }

    createMuzzleFlash() {
        const barrelLength = 35;
        const flashX = this.x + Math.cos(this.angle) * barrelLength;
        const flashY = this.y + Math.sin(this.angle) * barrelLength;

        // Create muzzle flash particles
        for (let i = 0; i < 8; i++) {
            const spreadAngle = this.angle + (Math.random() - 0.5) * 0.5;
            const speed = Math.random() * 4 + 3;
            const particle = new Particle(
                flashX,
                flashY,
                Math.cos(spreadAngle) * speed,
                Math.sin(spreadAngle) * speed,
                '#ffa500',
                25
            );
            gameState.particles.push(particle);
        }

        // Create muzzle flash effect
        const muzzleFlash = new Particle(flashX, flashY, 0, 0, '#ffff00', 12);

        muzzleFlash.draw = function(ctx) {
            const alpha = this.life / this.maxLife;
            const size = 25 * alpha;

            ctx.save();
            ctx.globalAlpha = alpha * 0.9;
            ctx.fillStyle = '#ffff00';
            ctx.beginPath();
            ctx.arc(this.x, this.y, size, 0, Math.PI * 2);
            ctx.fill();

            ctx.globalAlpha = alpha * 0.6;
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(this.x, this.y, size * 0.6, 0, Math.PI * 2);
            ctx.fill();

            ctx.restore();
        };

        gameState.particles.push(muzzleFlash);
    }

    update() {
        // Decay activity state
        if (this.isActive) {
            this.isActive = false;
        }
    }

    draw(ctx) {
        ctx.save();

        // Draw cannon base
        ctx.fillStyle = '#4a4a4a';
        ctx.beginPath();
        ctx.arc(this.x, this.y, 20, 0, Math.PI * 2);
        ctx.fill();

        // Draw cannon barrel
        ctx.strokeStyle = '#666666';
        ctx.lineWidth = 8;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(
            this.x + Math.cos(this.angle) * 35,
            this.y + Math.sin(this.angle) * 35
        );
        ctx.stroke();

        // Draw cannon emoji/decoration
        ctx.font = '24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('🌱', this.x, this.y + 8);

        // Draw targeting indicator when active
        if (this.isActive && Date.now() - this.lastShotTime < 100) {
            ctx.strokeStyle = '#00ff00';
            ctx.lineWidth = 2;
            ctx.setLineDash([5, 5]);
            ctx.beginPath();
            ctx.moveTo(this.x, this.y);
            ctx.lineTo(this.targetX, this.targetY);
            ctx.stroke();
            ctx.setLineDash([]);
        }

        ctx.restore();
    }
}

class Seed {
    constructor(x, y, type, targetX, targetY) {
        this.x = x;
        this.y = y;
        this.targetX = targetX;
        this.targetY = targetY;
        this.type = type;
        this.config = GAME_CONFIG.garden.seedTypes[type];

        // Calculate proper ballistic trajectory to hit target exactly
        const dx = targetX - x;
        const dy = targetY - y;

        // Physics constants
        this.gravity = 0.08;

        // Calculate ballistic trajectory using projectile motion formulas
        // We want the projectile to reach the target, so we solve for initial velocity
        const timeOfFlight = this.calculateTimeOfFlight(dx, dy);

        // Calculate initial velocity components
        this.vx = dx / timeOfFlight;
        this.vy = (dy / timeOfFlight) - (0.5 * this.gravity * timeOfFlight);

        this.arrived = false;

        // Add trail for visibility
        this.trail = [];
        this.maxTrailLength = 10;
    }

    calculateTimeOfFlight(dx, dy) {
        // For a good arc, we want the time of flight to be reasonable
        // We'll aim for a moderate arc height
        const horizontalDistance = Math.abs(dx);
        const baseTime = Math.sqrt(horizontalDistance / 5); // Base scaling

        // Adjust time based on vertical distance
        const verticalFactor = dy > 0 ? 1.2 : 0.8; // Longer time if shooting upward

        return Math.max(baseTime * verticalFactor, 1.0); // Minimum 1.0 time units
    }

    update() {
        if (!this.arrived) {
            // Store position for trail
            this.trail.push({x: this.x, y: this.y});
            if (this.trail.length > this.maxTrailLength) {
                this.trail.shift();
            }

            // Apply ballistic movement
            this.x += this.vx;
            this.y += this.vy;
            this.vy += this.gravity; // Gravity effect

            // Check if we've reached the target area naturally
            // We'll land when we get close to the target position OR
            // when we've passed the target horizontally and are falling
            const passedTargetX = (this.vx > 0 && this.x >= this.targetX) || (this.vx < 0 && this.x <= this.targetX);
            const closeToTarget = Math.abs(this.x - this.targetX) < 15;
            const atGroundLevel = this.y >= this.targetY - 5;

            if ((passedTargetX && this.vy > 0) || (closeToTarget && atGroundLevel)) {
                this.arrived = true;
                // Land at the actual current position for natural feel, but close to target
                this.x = Math.abs(this.x - this.targetX) < 20 ? this.targetX : this.x;
                this.y = this.targetY;
                this.startGrowing();
            }

            // Safety check - if seed goes way off screen, land at target
            if (this.x < -100 || this.x > canvas.width + 100 || this.y > canvas.height + 100) {
                this.arrived = true;
                this.x = this.targetX;
                this.y = this.targetY;
                this.startGrowing();
            }
        }
    }

    startGrowing() {
        // Create a plant at this location
        const plant = new Plant(this.x, this.y, this.type);
        gameState.plants.push(plant);

        // Remove this seed
        const index = gameState.seeds.indexOf(this);
        if (index > -1) {
            gameState.seeds.splice(index, 1);
        }

        // Create impact particles
        this.createImpactEffect();
    }

    createImpactEffect() {
        // Create bright impact particles
        for (let i = 0; i < 12; i++) {
            const angle = (i / 12) * Math.PI * 2;
            const speed = Math.random() * 4 + 2;
            const particle = new Particle(
                this.x + Math.cos(angle) * 5,
                this.y + Math.sin(angle) * 5,
                Math.cos(angle) * speed,
                Math.sin(angle) * speed,
                this.config.color,
                60
            );
            gameState.particles.push(particle);
        }

        // Add sparkle particles for extra visibility
        for (let i = 0; i < 8; i++) {
            const particle = new Particle(
                this.x + (Math.random() - 0.5) * 10,
                this.y + (Math.random() - 0.5) * 10,
                (Math.random() - 0.5) * 3,
                (Math.random() - 0.5) * 3,
                '#ffffff',
                40
            );
            gameState.particles.push(particle);
        }

        // Create a brief landing flash effect
        this.createLandingFlash();
    }

    createLandingFlash() {
        const flashParticle = new Particle(
            this.x,
            this.y,
            0,
            0,
            this.config.color,
            20
        );

        // Override the draw method for this particle to create a flash effect
        flashParticle.draw = function(ctx) {
            const alpha = this.life / this.maxLife;
            const size = 30 * alpha; // Shrinking flash

            ctx.save();
            ctx.globalAlpha = alpha * 0.7;
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, size, 0, Math.PI * 2);
            ctx.fill();

            // Add white center
            ctx.globalAlpha = alpha;
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(this.x, this.y, size * 0.5, 0, Math.PI * 2);
            ctx.fill();

            ctx.restore();
        };

        gameState.particles.push(flashParticle);
    }

    draw(ctx) {
        ctx.save();

        // Draw trail first (behind seed)
        if (this.trail.length > 1) {
            ctx.strokeStyle = this.config.color;
            ctx.lineCap = 'round';

            for (let i = 1; i < this.trail.length; i++) {
                const alpha = i / this.trail.length;
                const width = 6 * alpha;

                ctx.globalAlpha = alpha * 0.6;
                ctx.lineWidth = width;
                ctx.beginPath();
                ctx.moveTo(this.trail[i-1].x, this.trail[i-1].y);
                ctx.lineTo(this.trail[i].x, this.trail[i].y);
                ctx.stroke();
            }
        }

        // Reset for seed drawing
        ctx.globalAlpha = 1;

        // Draw seed glow effect
        ctx.shadowColor = this.config.color;
        ctx.shadowBlur = 15;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;

        // Draw main seed body (larger and more visible)
        ctx.fillStyle = this.config.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, 8, 0, Math.PI * 2);
        ctx.fill();

        // Draw seed emoji for better visibility
        ctx.shadowBlur = 0;
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(this.config.emoji, this.x, this.y + 5);

        ctx.restore();
    }
}

class Plant {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.config = GAME_CONFIG.garden.seedTypes[type];
        this.growthProgress = 0;
        this.maxGrowth = this.config.growthTime;
        this.fullyGrown = false;
        this.effectCooldown = 0;
        this.scale = 0.1;
    }

    update(deltaTime) {
        if (!this.fullyGrown) {
            this.growthProgress += deltaTime;
            this.scale = Math.min(1, this.growthProgress / this.maxGrowth);

            if (this.growthProgress >= this.maxGrowth) {
                this.fullyGrown = true;
                this.onFullyGrown();
            }
        }

        if (this.fullyGrown && this.effectCooldown > 0) {
            this.effectCooldown -= deltaTime;
        }

        // Apply plant effect to nearby bugs
        if (this.fullyGrown && this.effectCooldown <= 0) {
            this.applyEffectToBugs();
        }
    }

    onFullyGrown() {
        gameState.stats.plantsGrown++;

        // Track badge event
        if (gardenBadgeTracker) {
            gardenBadgeTracker.onEvent({
                type: 'plant_grown',
                data: {
                    plantType: this.type,
                    x: this.x,
                    y: this.y,
                    totalPlants: gameState.stats.plantsGrown
                }
            });
        }

        // Create growth particles
        this.createGrowthEffect();
    }

    applyEffectToBugs() {
        const nearbyBugs = gameState.bugs.filter(bug => {
            const dx = bug.x - this.x;
            const dy = bug.y - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            return distance <= this.config.range;
        });

        if (nearbyBugs.length > 0) {
            nearbyBugs.forEach(bug => {
                switch (this.config.effect) {
                    case 'repel':
                        this.repelBug(bug);
                        break;
                    case 'slow':
                        bug.applyEffect('slow', 2000);
                        break;
                    case 'confuse':
                        bug.applyEffect('confuse', 3000);
                        break;
                    case 'damage':
                        bug.takeDamage(1);
                        break;
                    case 'freeze':
                        bug.applyEffect('freeze', 1500);
                        break;
                }
            });

            this.effectCooldown = 1000; // 1 second cooldown
            this.createEffectParticles();
        }
    }

    repelBug(bug) {
        const dx = bug.x - this.x;
        const dy = bug.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance > 0) {
            const force = 2;
            bug.vx += (dx / distance) * force;
            bug.vy += (dy / distance) * force;
        }
    }

    createGrowthEffect() {
        for (let i = 0; i < 12; i++) {
            const angle = (i / 12) * Math.PI * 2;
            const particle = new Particle(
                this.x + Math.cos(angle) * 20,
                this.y + Math.sin(angle) * 20,
                Math.cos(angle) * 2,
                Math.sin(angle) * 2,
                this.config.color,
                60
            );
            gameState.particles.push(particle);
        }
    }

    createEffectParticles() {
        for (let i = 0; i < 6; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 3 + 1;
            const particle = new Particle(
                this.x,
                this.y,
                Math.cos(angle) * speed,
                Math.sin(angle) * speed,
                this.config.color,
                40
            );
            gameState.particles.push(particle);
        }
    }

    draw(ctx) {
        ctx.save();

        // Draw plant range when selected seed type matches
        if (gameState.selectedSeedType === this.type && this.fullyGrown) {
            ctx.globalAlpha = 0.1;
            ctx.fillStyle = this.config.color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.config.range, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.globalAlpha = 1;

        // Draw plant stem
        ctx.strokeStyle = '#228b22';
        ctx.lineWidth = 5 * this.scale;  /* Increased from 3 */
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x, this.y - 35 * this.scale);  /* Increased from 20 */
        ctx.stroke();

        // Draw plant emoji/flower
        ctx.font = `${36 * this.scale}px Arial`;  /* Increased from 24 */
        ctx.textAlign = 'center';
        ctx.fillText(this.config.emoji, this.x, this.y - 15 * this.scale);  /* Adjusted positioning */

        // Draw growth progress
        if (!this.fullyGrown) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.fillRect(this.x - 15, this.y + 10, 30, 4);
            ctx.fillStyle = this.config.color;
            const progressWidth = (this.growthProgress / this.maxGrowth) * 30;
            ctx.fillRect(this.x - 15, this.y + 10, progressWidth, 4);
        }

        ctx.restore();
    }
}

class Bug {
    constructor(x, y, type, targetIndex) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.config = GAME_CONFIG.garden.bugTypes[type];
        this.targetX = GAME_CONFIG.garden.tomatoPositions[targetIndex];
        this.targetY = GAME_CONFIG.garden.groundLevel;
        this.health = this.config.health;
        this.maxHealth = this.config.health;
        this.vx = 0;
        this.vy = 0;
        this.effects = new Map();
        this.dead = false;

        // Calculate initial velocity toward tomato
        this.updateVelocity();
    }

    updateVelocity() {
        const dx = this.targetX - this.x;
        const dy = this.targetY - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance > 0) {
            let speed = this.config.speed;

            // Apply speed modifications from effects
            if (this.effects.has('slow')) {
                speed *= 0.3;
            } else if (this.effects.has('freeze')) {
                speed = 0;
            }

            this.vx = (dx / distance) * speed;
            this.vy = (dy / distance) * speed;

            // Add confusion effect
            if (this.effects.has('confuse')) {
                this.vx += (Math.random() - 0.5) * 2;
                this.vy += (Math.random() - 0.5) * 2;
            }
        }
    }

    update(deltaTime) {
        // Update effects
        for (const [effect, timeLeft] of this.effects) {
            this.effects.set(effect, timeLeft - deltaTime);
            if (timeLeft <= 0) {
                this.effects.delete(effect);
            }
        }

        this.updateVelocity();

        this.x += this.vx;
        this.y += this.vy;

        // Check if reached tomato
        if (Math.abs(this.x - this.targetX) < 20 && this.y >= this.targetY - 10) {
            this.reachTomato();
        }

        // Remove if off screen
        if (this.x < -50 || this.x > canvas.width + 50 || this.y > canvas.height + 50) {
            this.dead = true;
        }
    }

    applyEffect(effect, duration) {
        this.effects.set(effect, duration);
    }

    takeDamage(amount) {
        this.health -= amount;
        if (this.health <= 0) {
            this.die();
        }
    }

    die() {
        this.dead = true;
        gameState.stats.bugsDefeated++;
        gameState.stats.totalScore += this.config.points;
        gameState.bugsRemaining--;

        // Track badge event
        if (gardenBadgeTracker) {
            gardenBadgeTracker.onEvent({
                type: 'bug_defeated',
                data: {
                    bugType: this.type,
                    totalDefeated: gameState.stats.bugsDefeated,
                    points: this.config.points
                }
            });
        }

        // Create death particles
        this.createDeathEffect();
    }

    reachTomato() {
        gameState.tomatoHealth--;
        gameState.stats.tomatoesLost++;
        this.dead = true;
        gameState.bugsRemaining--;

        // Track badge event
        if (gardenBadgeTracker) {
            gardenBadgeTracker.onEvent({
                type: 'tomato_lost',
                data: {
                    tomatoesRemaining: gameState.tomatoHealth,
                    bugType: this.type
                }
            });
        }

        // Create damage effect
        this.createTomatoDamageEffect();
    }

    createDeathEffect() {
        for (let i = 0; i < 8; i++) {
            const particle = new Particle(
                this.x,
                this.y,
                (Math.random() - 0.5) * 4,
                (Math.random() - 0.5) * 4,
                this.config.color,
                40
            );
            gameState.particles.push(particle);
        }
    }

    createTomatoDamageEffect() {
        for (let i = 0; i < 10; i++) {
            const particle = new Particle(
                this.targetX,
                this.targetY,
                (Math.random() - 0.5) * 6,
                (Math.random() - 0.5) * 6,
                '#ff0000',
                50
            );
            gameState.particles.push(particle);
        }
    }

    draw(ctx) {
        if (this.dead) return;

        ctx.save();

        // Draw bug shadow
        ctx.globalAlpha = 0.3;
        ctx.fillStyle = 'black';
        ctx.beginPath();
        ctx.arc(this.x + 2, this.y + 2, this.config.size, 0, Math.PI * 2);
        ctx.fill();

        ctx.globalAlpha = 1;

        // Apply effect visuals
        if (this.effects.has('freeze')) {
            ctx.fillStyle = 'rgba(173, 216, 230, 0.5)';
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.config.size + 4, 0, Math.PI * 2);
            ctx.fill();
        }

        if (this.effects.has('confuse')) {
            ctx.strokeStyle = 'yellow';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.config.size + 6, 0, Math.PI * 2);
            ctx.stroke();
        }

        // Draw bug body
        ctx.fillStyle = this.config.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.config.size, 0, Math.PI * 2);
        ctx.fill();

        // Draw bug emoji
        ctx.font = `${this.config.size * 2.5}px Arial`;  /* Increased from 2 */
        ctx.textAlign = 'center';
        ctx.fillText(this.config.emoji, this.x, this.y + 6);  /* Adjusted positioning */

        // Draw health bar
        if (this.health < this.maxHealth) {
            const barWidth = 30;     /* Increased from 20 */
            const barHeight = 6;     /* Increased from 4 */
            const x = this.x - barWidth / 2;
            const y = this.y - this.config.size - 15;  /* Increased from 10 */

            ctx.fillStyle = 'red';
            ctx.fillRect(x, y, barWidth, barHeight);
            ctx.fillStyle = 'green';
            ctx.fillRect(x, y, (this.health / this.maxHealth) * barWidth, barHeight);
        }

        ctx.restore();
    }
}

class Particle {
    constructor(x, y, vx, vy, color, life) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.color = color;
        this.life = life;
        this.maxLife = life;
    }

    update(deltaTime) {
        this.x += this.vx;
        this.y += this.vy;
        this.life -= deltaTime;

        // Apply gravity
        this.vy += 0.1;

        // Apply friction
        this.vx *= 0.98;
        this.vy *= 0.98;

        return this.life > 0;
    }

    draw(ctx) {
        const alpha = this.life / this.maxLife;
        const size = 4 + (alpha * 2); // Particles start larger and shrink

        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, size, 0, Math.PI * 2);
        ctx.fill();

        // Add a subtle glow effect
        if (alpha > 0.5) {
            ctx.globalAlpha = alpha * 0.3;
            ctx.beginPath();
            ctx.arc(this.x, this.y, size * 2, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();
    }
}

// Game Initialization
function initializeGame() {
    // Initialize cannons first
    initializeCannons();

    // Initialize badge system
    initializeBadgeSystem();

    // Setup event listeners
    setupEventListeners();

    // Start game loop
    gameLoop();

    console.log('🌱 Garden Defender initialized! 🌱');
}

function initializeCannons() {
    gameState.cannons = [];

    // Create cannons at predefined positions
    GAME_CONFIG.garden.cannonPositions.forEach(x => {
        const cannon = new Cannon(x, GAME_CONFIG.garden.groundLevel - 25);
        gameState.cannons.push(cannon);
    });

    console.log(`🚀 Initialized ${gameState.cannons.length} seed cannons`);
}

// Badge System Initialization
function initializeBadgeSystem() {
    try {
        // Ensure all dependencies are loaded before initializing
        if (typeof GardenDefenderBadgeHelper === 'undefined' ||
            typeof GardenDefenderBadgeTracker === 'undefined') {
            console.warn('[Garden Defender] Badge dependencies not fully loaded yet, waiting...');
            setTimeout(initializeBadgeSystem, 100);
            return;
        }

        // Initialize badge system (uses new Wavelength SDK)
        gardenBadgeHelper = new GardenDefenderBadgeHelper();
        gardenBadgeTracker = new GardenDefenderBadgeTracker(gardenBadgeHelper);

        // Expose globally for debug utilities
        window.gardenBadgeHelper = gardenBadgeHelper;
        window.gardenBadgeTracker = gardenBadgeTracker;

        console.log('[Garden Defender] Badge system initialized successfully');

    } catch (error) {
        console.error('[Garden Defender] Failed to initialize badge system:', error);
        // Game should continue to work even if badge system fails
    }
}

// Event Listeners
function setupEventListeners() {
    // Canvas click for throwing seeds or destroying bugs
    canvas.addEventListener('click', handleCanvasClick);

    // Touch support for mobile
    canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    canvas.addEventListener('touchend', handleTouchEnd, { passive: false });

    // Seed selection
    document.querySelectorAll('.seed-slot').forEach((slot, index) => {
        slot.addEventListener('click', () => selectSeed(slot.dataset.seed));
    });

    // Keyboard controls
    document.addEventListener('keydown', handleKeyboard);

    // Control buttons
    document.getElementById('start-wave-btn').addEventListener('click', startWave);
    document.getElementById('pause-btn').addEventListener('click', togglePause);
    document.getElementById('reset-btn').addEventListener('click', resetGame);

    // Mobile panel toggle
    const mobilePanelToggle = document.getElementById('mobile-panel-toggle');
    const gameInterface = document.getElementById('game-interface');

    if (mobilePanelToggle && gameInterface) {
        mobilePanelToggle.addEventListener('click', function() {
            gameInterface.classList.toggle('expanded');

            // Update button text
            if (gameInterface.classList.contains('expanded')) {
                mobilePanelToggle.textContent = '❌ Hide';
            } else {
                mobilePanelToggle.textContent = '🎮 Controls';
            }
        });

        // Auto-collapse panel when canvas is tapped (mobile)
        canvas.addEventListener('touchstart', function() {
            if (gameInterface.classList.contains('expanded') && window.innerWidth <= 768) {
                gameInterface.classList.remove('expanded');
                mobilePanelToggle.textContent = '🎮 Controls';
            }
        });
    }
}

function handleCanvasClick(event) {
    if (!gameState.gameRunning || gameState.paused) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Scale coordinates to canvas size
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const targetX = x * scaleX;
    const targetY = y * scaleY;

    // First check if we clicked on a bug to destroy it
    if (checkBugDestruction(targetX, targetY)) {
        return; // Bug was destroyed, don't throw seed
    }

    // If no bug was clicked, throw a seed
    throwSeed(targetX, targetY);
}

// Touch event handlers for mobile support
function handleTouchStart(event) {
    event.preventDefault();
    if (event.touches.length === 1) {
        const touch = event.touches[0];
        const rect = canvas.getBoundingClientRect();
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;

        // Scale coordinates to canvas size
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        const targetX = x * scaleX;
        const targetY = y * scaleY;

        // Check for bug destruction on touch
        if (checkBugDestruction(targetX, targetY)) {
            return; // Bug was destroyed
        }

        // If no bug was touched, throw a seed
        throwSeed(targetX, targetY);
    }
}

function handleTouchMove(event) {
    event.preventDefault();
    // Prevent scrolling while touching the game canvas
}

function handleTouchEnd(event) {
    event.preventDefault();
}

// New function to check if a bug was clicked/touched and destroy it
function checkBugDestruction(x, y) {
    for (let i = gameState.bugs.length - 1; i >= 0; i--) {
        const bug = gameState.bugs[i];
        const dx = bug.x - x;
        const dy = bug.y - y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Check if click/touch is within bug's hitbox (slightly larger than visual size)
        if (distance <= bug.config.size + 10) {
            // Destroy the bug instantly
            destroyBugDirectly(bug, x, y);
            return true; // Bug was destroyed
        }
    }
    return false; // No bug was hit
}

// New function to directly destroy a bug with click/touch
function destroyBugDirectly(bug, clickX, clickY) {
    // Award points and update stats
    gameState.stats.bugsDefeated++;
    gameState.stats.totalScore += bug.config.points;
    gameState.bugsRemaining--;

    // Award extra seed currency for direct destruction
    gameState.seedCurrency += Math.floor(bug.config.points / 2);

    // Track badge event for direct destruction
    if (gardenBadgeTracker) {
        gardenBadgeTracker.onEvent({
            type: 'bug_destroyed_directly',
            data: {
                bugType: bug.type,
                totalDefeated: gameState.stats.bugsDefeated,
                points: bug.config.points,
                clickX: clickX,
                clickY: clickY
            }
        });
    }

    // Create enhanced destruction effect
    createDirectDestructionEffect(bug.x, bug.y, bug.config.color);

    // Remove the bug
    const index = gameState.bugs.indexOf(bug);
    if (index > -1) {
        gameState.bugs.splice(index, 1);
    }

    // Update UI
    updateUI();

    // Show floating score text
    showFloatingScore(clickX, clickY, bug.config.points);
}

// Enhanced destruction effect for direct clicks
function createDirectDestructionEffect(x, y, color) {
    // Create explosion particles
    for (let i = 0; i < 15; i++) {
        const angle = (i / 15) * Math.PI * 2;
        const speed = Math.random() * 5 + 3;
        const particle = new Particle(
            x + Math.cos(angle) * 10,
            y + Math.sin(angle) * 10,
            Math.cos(angle) * speed,
            Math.sin(angle) * speed,
            color,
            60
        );
        gameState.particles.push(particle);
    }

    // Create sparkle effect
    for (let i = 0; i < 8; i++) {
        const particle = new Particle(
            x + (Math.random() - 0.5) * 20,
            y + (Math.random() - 0.5) * 20,
            (Math.random() - 0.5) * 2,
            (Math.random() - 0.5) * 2,
            '#ffd700',
            40
        );
        gameState.particles.push(particle);
    }
}

// Show floating score text when bugs are destroyed
function showFloatingScore(x, y, points) {
    const scoreElement = document.createElement('div');
    scoreElement.style.cssText = `
        position: absolute;
        left: ${x}px;
        top: ${y}px;
        color: #ffd700;
        font-weight: bold;
        font-size: 18px;
        pointer-events: none;
        z-index: 1000;
        text-shadow: 2px 2px 4px rgba(0,0,0,0.8);
        animation: floatUp 2s ease-out forwards;
    `;
    scoreElement.textContent = `+${points}`;

    // Add floating animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes floatUp {
            0% { transform: translateY(0); opacity: 1; }
            100% { transform: translateY(-50px); opacity: 0; }
        }
    `;
    document.head.appendChild(style);

    canvas.parentElement.style.position = 'relative';
    canvas.parentElement.appendChild(scoreElement);

    // Remove after animation
    setTimeout(() => {
        scoreElement.remove();
        if (document.querySelectorAll('div[style*="floatUp"]').length === 0) {
            style.remove();
        }
    }, 2000);
}

function throwSeed(targetX, targetY) {
    const seedConfig = GAME_CONFIG.garden.seedTypes[gameState.selectedSeedType];

    if (gameState.seedCurrency >= seedConfig.cost) {
        // Find the best cannon to fire from (closest to target with clear shot)
        const bestCannon = findBestCannon(targetX, targetY);

        if (bestCannon && bestCannon.canFire()) {
            // Deduct cost
            gameState.seedCurrency -= seedConfig.cost;

            // Aim cannon at target
            bestCannon.aimAt(targetX, targetY);

            // Fire seed from cannon
            const seed = bestCannon.fire(gameState.selectedSeedType);
            if (seed) {
                gameState.seeds.push(seed);
            }

            updateUI();
        }
    }
}

function findBestCannon(targetX, targetY) {
    let bestCannon = null;
    let shortestDistance = Infinity;

    for (const cannon of gameState.cannons) {
        if (!cannon.canFire()) continue;

        const dx = targetX - cannon.x;
        const dy = targetY - cannon.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Prefer cannons that are closer and have reasonable firing angle
        if (distance < shortestDistance && dy < 0) { // dy < 0 means firing upward
            shortestDistance = distance;
            bestCannon = cannon;
        }
    }

    return bestCannon;
}

// createLaunchEffect function removed - now handled by Cannon class muzzle flash

function selectSeed(seedType) {
    gameState.selectedSeedType = seedType;

    // Update UI
    document.querySelectorAll('.seed-slot').forEach(slot => {
        slot.classList.remove('active');
        if (slot.dataset.seed === seedType) {
            slot.classList.add('active');
        }
    });
}

function handleKeyboard(event) {
    const key = event.key;

    // Number keys for seed selection
    if (key >= '1' && key <= '5') {
        const seedTypes = Object.keys(GAME_CONFIG.garden.seedTypes);
        const index = parseInt(key) - 1;
        if (index < seedTypes.length) {
            selectSeed(seedTypes[index]);
        }
    }

    // Space for pause
    if (key === ' ') {
        event.preventDefault();
        togglePause();
    }
}

function startWave() {
    if (gameState.waveActive) return;

    gameState.waveActive = true;
    gameState.gameRunning = true;

    // Generate bugs for this wave
    spawnWave(gameState.currentWave);

    // Update UI
    document.getElementById('start-wave-btn').disabled = true;
    updateUI();
}

function spawnWave(waveNumber) {
    const bugCount = Math.min(5 + waveNumber * 2, 20);
    const bugTypes = Object.keys(GAME_CONFIG.garden.bugTypes);

    gameState.bugsRemaining = bugCount;

    for (let i = 0; i < bugCount; i++) {
        setTimeout(() => {
            const bugType = bugTypes[Math.floor(Math.random() * bugTypes.length)];
            const targetIndex = Math.floor(Math.random() * GAME_CONFIG.garden.tomatoPositions.length);
            const startX = Math.random() * 100 - 50; // Start from left side
            const startY = Math.random() * 200 + 100;

            const bug = new Bug(startX, startY, bugType, targetIndex);
            gameState.bugs.push(bug);
        }, i * 1000); // Spawn every second
    }
}

function togglePause() {
    gameState.paused = !gameState.paused;
    const btn = document.getElementById('pause-btn');
    btn.textContent = gameState.paused ? '▶️ Resume' : '⏸️ Pause';
}

function resetGame() {
    // Reset all game state
    gameState.seedCurrency = 100;
    gameState.tomatoHealth = 5;
    gameState.currentWave = 1;
    gameState.bugsRemaining = 0;
    gameState.seeds = [];
    gameState.plants = [];
    gameState.bugs = [];
    gameState.particles = [];
    gameState.gameRunning = false;
    gameState.waveActive = false;
    gameState.paused = false;

    // Reset cannons (reinitialize them)
    initializeCannons();

    // Reset stats (but keep for badge tracking)
    gameState.stats = {
        wavesCompleted: 0,
        plantsGrown: 0,
        bugsDefeated: 0,
        tomatoesLost: 0,
        totalScore: 0
    };

    // Reset UI
    document.getElementById('start-wave-btn').disabled = false;
    document.getElementById('pause-btn').textContent = '⏸️ Pause';
    updateUI();

    console.log('🔄 Garden reset');
}

function updateUI() {
    document.getElementById('seed-currency').textContent = gameState.seedCurrency;
    document.getElementById('tomato-health').textContent = gameState.tomatoHealth;
    document.getElementById('current-wave').textContent = gameState.currentWave;
    document.getElementById('bugs-remaining').textContent = gameState.bugsRemaining;

    // Update seed slot availability
    document.querySelectorAll('.seed-slot').forEach(slot => {
        const seedType = slot.dataset.seed;
        const cost = GAME_CONFIG.garden.seedTypes[seedType].cost;

        if (gameState.seedCurrency < cost) {
            slot.classList.add('disabled');
        } else {
            slot.classList.remove('disabled');
        }
    });
}

function checkWaveComplete() {
    if (gameState.waveActive && gameState.bugsRemaining <= 0 && gameState.bugs.length === 0) {
        gameState.waveActive = false;
        gameState.currentWave++;
        gameState.stats.wavesCompleted++;

        // Award currency for completing wave
        gameState.seedCurrency += 25 + (gameState.currentWave * 5);

        // Check for perfect wave (no tomatoes lost this wave)
        const tomatoesLostThisWave = gameState.stats.tomatoesLost;

        // Track badge event
        if (gardenBadgeTracker) {
            gardenBadgeTracker.onEvent({
                type: 'wave_completed',
                data: {
                    waveNumber: gameState.stats.wavesCompleted,
                    tomatoesLost: tomatoesLostThisWave,
                    plantsGrown: gameState.stats.plantsGrown,
                    bugsDefeated: gameState.stats.bugsDefeated
                }
            });

            if (tomatoesLostThisWave === 0) {
                gardenBadgeTracker.onEvent({
                    type: 'perfect_wave',
                    data: {
                        waveNumber: gameState.stats.wavesCompleted,
                        consecutivePerfect: true
                    }
                });
            }
        }

        // Enable next wave button
        document.getElementById('start-wave-btn').disabled = false;
        updateUI();

        // Show wave completion message
        showStatusMessage(`🌊 Wave ${gameState.stats.wavesCompleted} Complete!`, 'wave-complete');

        console.log(`🌊 Wave ${gameState.stats.wavesCompleted} completed!`);
    }
}

function checkGameOver() {
    if (gameState.tomatoHealth <= 0) {
        gameState.gameRunning = false;
        gameState.waveActive = false;
        showStatusMessage('💀 Game Over! All tomatoes lost!', 'game-over');

        // Re-enable reset button
        document.getElementById('start-wave-btn').disabled = true;
    }
}

function showStatusMessage(text, type = '') {
    const message = document.createElement('div');
    message.className = `status-message ${type}`;
    message.textContent = text;
    document.body.appendChild(message);

    setTimeout(() => {
        message.remove();
    }, 3000);
}

// Game Loop
let lastTime = 0;
function gameLoop(currentTime = 0) {
    const deltaTime = currentTime - lastTime;
    lastTime = currentTime;

    if (!gameState.paused) {
        // Update game objects
        updateGameObjects(deltaTime);

        // Check game state
        checkWaveComplete();
        checkGameOver();
    }

    // Render
    render();

    requestAnimationFrame(gameLoop);
}

function updateGameObjects(deltaTime) {
    // Update cannons
    gameState.cannons.forEach(cannon => cannon.update());

    // Update seeds
    gameState.seeds.forEach(seed => seed.update());

    // Update plants
    gameState.plants.forEach(plant => plant.update(deltaTime));

    // Update bugs
    gameState.bugs.forEach(bug => bug.update(deltaTime));

    // Update particles
    gameState.particles = gameState.particles.filter(particle => particle.update(deltaTime));

    // Remove dead bugs
    gameState.bugs = gameState.bugs.filter(bug => !bug.dead);
}

function render() {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw background elements
    drawBackground();
    drawTomatoes();

    // Draw cannons (on ground level)
    gameState.cannons.forEach(cannon => cannon.draw(ctx));

    // Draw game objects
    gameState.plants.forEach(plant => plant.draw(ctx));
    gameState.seeds.forEach(seed => seed.draw(ctx));
    gameState.bugs.forEach(bug => bug.draw(ctx));
    gameState.particles.forEach(particle => particle.draw(ctx));

    // Draw UI overlays
    drawTrajectoryPreview();
    drawScoreOverlay();
}

function drawBackground() {
    // Sky gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, GAME_CONFIG.garden.groundLevel);
    gradient.addColorStop(0, '#87ceeb');
    gradient.addColorStop(1, '#98fb98');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, GAME_CONFIG.garden.groundLevel);

    // Ground
    ctx.fillStyle = '#8b4513';
    ctx.fillRect(0, GAME_CONFIG.garden.groundLevel, canvas.width, canvas.height - GAME_CONFIG.garden.groundLevel);
}

function drawTomatoes() {
    GAME_CONFIG.garden.tomatoPositions.forEach((x, index) => {
        // Draw tomato plant
        ctx.fillStyle = '#228b22';
        ctx.fillRect(x - 3, GAME_CONFIG.garden.groundLevel - 60, 6, 60);  /* Larger plant stem */

        // Draw tomato
        ctx.font = '45px Arial';  /* Increased from 30px */
        ctx.textAlign = 'center';
        ctx.fillText('🍅', x, GAME_CONFIG.garden.groundLevel - 15);  /* Adjusted positioning */
    });
}

function drawTrajectoryPreview() {
    // This could show seed trajectory preview when hovering
    // Implementation left for future enhancement
}

function drawScoreOverlay() {
    ctx.save();

    // Set up overlay background
    const overlayX = 20;
    const overlayY = 20;
    const overlayWidth = 220;
    const overlayHeight = 100;

    // Draw semi-transparent background
    ctx.fillStyle = 'rgba(45, 80, 22, 0.9)';
    ctx.strokeStyle = 'rgba(80, 200, 120, 0.6)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(overlayX, overlayY, overlayWidth, overlayHeight, 12);
    ctx.fill();
    ctx.stroke();

    // Set text properties
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 18px Arial';
    ctx.textAlign = 'left';

    // Draw score
    ctx.fillStyle = '#ffd700'; // Gold color for score
    ctx.fillText('Score:', overlayX + 15, overlayY + 30);
    ctx.fillStyle = '#ffffff';
    ctx.fillText(gameState.stats.totalScore.toLocaleString(), overlayX + 80, overlayY + 30);

    // Draw seed currency
    ctx.fillStyle = '#90ee90'; // Light green for seed currency
    ctx.fillText('Seeds:', overlayX + 15, overlayY + 55);
    ctx.fillStyle = '#ffffff';
    ctx.fillText(gameState.seedCurrency.toString(), overlayX + 80, overlayY + 55);

    // Draw wave info
    ctx.fillStyle = '#87ceeb'; // Sky blue for wave
    ctx.fillText('Wave:', overlayX + 15, overlayY + 80);
    ctx.fillStyle = '#ffffff';
    ctx.fillText(gameState.currentWave.toString(), overlayX + 80, overlayY + 80);

    // Add small icons/emojis for visual appeal
    ctx.font = '16px Arial';
    ctx.fillText('⭐', overlayX + 180, overlayY + 30);
    ctx.fillText('🌱', overlayX + 180, overlayY + 55);
    ctx.fillText('🌊', overlayX + 180, overlayY + 80);

    ctx.restore();
}

// Initialize game when page loads
document.addEventListener('DOMContentLoaded', initializeGame);
