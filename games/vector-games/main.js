import { Renderer, PostProcessor } from './renderer.js';
import { Background } from './background.js';
import { Input } from './input.js';
import { AudioSystem } from './audio.js';
import { Ship, Ball, Particle, BlackHole, WhiteHole, Comet } from './entities.js';
import { Vec2 as MathVec2 } from './math.js';

// ============================================
// WAVELENGTH SDK INTEGRATION
// ============================================

let badgeAwarded = {
  firstPocket: false,
  highScore: false,
  perfectClear: false,
  blackHoleMaster: false,
  cometStorm: false,
  solarFlare: false
};

// Helper to show badge notification
const badgeNotifications = [];

function showBadgeNotification(badgeId) {
    // Only if game started to avoid clutter on init
    if(!isGameStarted) return;
    
    const friendlyName = badgeId.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    
    badgeNotifications.push({
        id: Date.now(),
        text: `🏆 ${friendlyName}`,
        time: 0,
        duration: 3.0,
        alpha: 1.0
    });
}

async function awardBadge(badgeId, metadata = {}) {
  // Badges disabled for testing
  console.log(`🏆 [DISABLED] Badge condition met: ${badgeId}`);
  return;
}

function waitForSDK(callback) {
  if (window.Wavelength) {
    callback();
  } else {
    setTimeout(() => waitForSDK(callback), 100);
  }
}

// Initialize SDK when ready
waitForSDK(() => {
  if (window.Wavelength) {
      console.log('[Vector Pool] Wavelength SDK ready!', {
        gameId: window.Wavelength.game.id,
        sessionId: window.Wavelength.player.sessionId
      });
  }
});

const canvas = document.getElementById('gameCanvas');
const gl = canvas.getContext('webgl', { alpha: false, antialias: true }); // Try antialias

if (!gl) {
    alert("WebGL not supported");
}

const renderer = new Renderer(gl);
const postProcess = new PostProcessor(gl);
const background = new Background(gl);
const input = new Input(canvas);
const audio = new AudioSystem();

let lastTime = 0;
const entities = [];
const particles = [];
let ship;
let pockets = [];
let mechanicTimer = 0;
let currentMechanic = 'NONE'; // NONE, BLACK_HOLE, COMET_STORM, SOLAR_FLARE
let previousMechanic = 'NONE';
let score = 0;
let frames = 0;
let fps = 0;
let lastFpsTime = 0;
let solarFlareTimer = 0;
let solarFlareDuration = 0;
let solarFlarePos = { x: 0, y: 0 };
let solarFlareIntensity = 0;

let shakeTimer = 0;
let shakeIntensity = 0;

function addShake(amount) {
    shakeIntensity = Math.min(shakeIntensity + amount, 20); // Cap at 20
    shakeTimer = 0.5; // Duration
}

// Game settings
const TABLE_FRICTION = 0.99;
const WALL_ELASTICITY = 0.8;
const BALL_ELASTICITY = 0.9;

let isGameStarted = false;

function init() {
    resize();
    window.addEventListener('resize', resize);

    // UI Handlers
    document.getElementById('start-btn').addEventListener('click', () => {
        document.getElementById('welcome-panel').style.display = 'none';
        document.getElementById('telemetry').style.display = 'block';
        isGameStarted = true;
        
        // Initialize Audio (requires user interaction)
        audio.init();
        
        // Re-init game state if needed, or just let loop run
        // Clear existing entities to start fresh
        entities.length = 0;
        particles.length = 0;
        
        ship = new Ship(canvas.width / 2, canvas.height / 2);
        entities.push(ship);
        
        for (let i = 0; i < 5; i++) {
            spawnBall();
        }
    });

    // Audio Controls
    const muteBtn = document.getElementById('mute-btn');
    const volumeSlider = document.getElementById('volume-slider');

    muteBtn.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent game click
        const isMuted = audio.toggleMute();
        muteBtn.innerText = isMuted ? '🔇' : '🔊';
    });

    volumeSlider.addEventListener('input', (e) => {
        e.stopPropagation();
        audio.setMasterVolume(parseFloat(e.target.value));
    });
    
    // Stop propagation on slider click to prevent ship movement
    volumeSlider.addEventListener('mousedown', e => e.stopPropagation());
    volumeSlider.addEventListener('touchstart', e => e.stopPropagation());

    requestAnimationFrame(loop);
}

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    renderer.resize(canvas.width, canvas.height);
    postProcess.resize(canvas.width, canvas.height);
    updatePockets();
}

function updatePockets() {
    const r = 40;
    pockets = [
        { pos: new MathVec2(0, 0), radius: r },
        { pos: new MathVec2(canvas.width, 0), radius: r },
        { pos: new MathVec2(canvas.width, canvas.height), radius: r },
        { pos: new MathVec2(0, canvas.height), radius: r }
    ];
}

function spawnBall() {
    const r = 20 + Math.random() * 15;
    const x = Math.random() * (canvas.width - 200) + 100;
    const y = Math.random() * (canvas.height - 200) + 100;
    const ball = new Ball(x, y, r, Math.floor(Math.random() * 5) + 3); // random sides
    
    // Give random velocity
    ball.vel = new MathVec2(Math.random() - 0.5, Math.random() - 0.5).scale(200);
    
    entities.push(ball);
}

function spawnBlackHole() {
    const bh = new BlackHole(
         Math.random() * (canvas.width - 200) + 100,
         Math.random() * (canvas.height - 200) + 100
    );
    entities.push(bh);
}

function spawnWhiteHole() {
    const wh = new WhiteHole(
         Math.random() * (canvas.width - 200) + 100,
         Math.random() * (canvas.height - 200) + 100
    );
    entities.push(wh);
}

function spawnSolarFlare() {
    currentMechanic = 'SOLAR_FLARE';
    solarFlareDuration = 5.0; // Lasts 5 seconds
    solarFlareTimer = 0;
    // Random position on screen or slightly off screen
    solarFlarePos = {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height
    };
}

function spawnCometStorm() {
    // Spawn 5-8 comets
    const count = 5 + Math.floor(Math.random() * 4);
    for(let i=0; i<count; i++) {
        // Pick a side to spawn from
        // 0: Top, 1: Right, 2: Bottom, 3: Left
        const side = Math.floor(Math.random() * 4);
        let pos, vel;
        const speed = 400 + Math.random() * 200;
        
        if (side === 0) { // Top
            pos = new MathVec2(Math.random() * canvas.width, -50);
            vel = new MathVec2((Math.random()-0.5)*0.5, 1).normalize().scale(speed);
        } else if (side === 1) { // Right
            pos = new MathVec2(canvas.width + 50, Math.random() * canvas.height);
            vel = new MathVec2(-1, (Math.random()-0.5)*0.5).normalize().scale(speed);
        } else if (side === 2) { // Bottom
            pos = new MathVec2(Math.random() * canvas.width, canvas.height + 50);
            vel = new MathVec2((Math.random()-0.5)*0.5, -1).normalize().scale(speed);
        } else { // Left
            pos = new MathVec2(-50, Math.random() * canvas.height);
            vel = new MathVec2(1, (Math.random()-0.5)*0.5).normalize().scale(speed);
        }
        
        entities.push(new Comet(pos.x, pos.y, vel));
    }
}

function loop(timestamp) {
    const dt = Math.min((timestamp - lastTime) / 1000, 0.1); // Cap dt
    lastTime = timestamp;

    // FPS Calc
    frames++;
    if (timestamp - lastFpsTime >= 1000) {
        fps = frames;
        frames = 0;
        lastFpsTime = timestamp;
    }

    if (isGameStarted) {
        update(dt);
        updateBadges();
    } else {
        // Background animation only
        // Maybe slowly spawn particles or something for effect?
    }
    
    draw();
    if (isGameStarted) updateUI();
    
    input.update(); // Reset frame-based input states

    requestAnimationFrame(loop);
}

function updateUI() {
    const fpsEl = document.getElementById('t-fps');
    const scoreEl = document.getElementById('t-score');
    const speedEl = document.getElementById('t-speed');
    const posEl = document.getElementById('t-pos');
    const alertEl = document.getElementById('t-alert');

    if(fpsEl) fpsEl.innerText = fps;
    if(scoreEl) scoreEl.innerText = score.toString().padStart(6, '0');
    if(speedEl && ship) speedEl.innerText = Math.round(ship.vel.length());
    if(posEl && ship) posEl.innerText = `${Math.round(ship.pos.x)},${Math.round(ship.pos.y)}`;
    
    if(alertEl) {
        if (currentMechanic === 'BLACK_HOLE') {
            alertEl.innerText = "⚠ GRAVITY WELL DETECTED ⚠";
            alertEl.style.color = "#a020f0";
        } else if (currentMechanic === 'COMET_STORM') {
            alertEl.innerText = "⚠ COMET STORM INCOMING ⚠";
            alertEl.style.color = "#00ffff";
        } else if (currentMechanic === 'WHITE_HOLE') {
            alertEl.innerText = "⚠ ANOMALY: WHITE HOLE ⚠";
            alertEl.style.color = "#ffffff";
        } else if (currentMechanic === 'SOLAR_FLARE') {
            alertEl.innerText = "⚠ WARNING: SOLAR FLARE ⚠";
            alertEl.style.color = "#ffcc00";
        } else {
            alertEl.innerText = "-- SYSTEM NORMAL --";
            alertEl.style.color = "#00ff00";
        }
    }
}

function update(dt) {
    previousMechanic = currentMechanic;

    // ===========================
    // Badge Logic
    // ===========================
    
    // Badge: First Pocket
    const ballCount = entities.filter(e => e instanceof Ball).length;
    if (!badgeAwarded.firstPocket && ballCount < 5 && score > 0) {
        awardBadge('first-pocket', { ballsSunk: 5 - ballCount });
        badgeAwarded.firstPocket = true;
    }

    // Badge: Perfect Clear
    if (!badgeAwarded.perfectClear && ballCount === 0 && entities.length > 0) {
        awardBadge('perfect-clear', { score });
        badgeAwarded.perfectClear = true;
    }

    // Badge: High Score
    if (!badgeAwarded.highScore && score >= 10000) {
        awardBadge('high-score', { score });
        badgeAwarded.highScore = true;
    }
    
    // Badge: Black Hole Master (Check if it just finished)
    if (!badgeAwarded.blackHoleMaster && previousMechanic === 'BLACK_HOLE' && currentMechanic === 'NONE') {
         // Survived!
         awardBadge('black-hole-master', { score });
         badgeAwarded.blackHoleMaster = true;
    }
    
    // Badge: Comet Storm
    const cometCount = entities.filter(e => e instanceof Comet).length;
    if (!badgeAwarded.cometStorm && cometCount >= 5) {
        awardBadge('comet-storm', { cometCount, score });
        badgeAwarded.cometStorm = true;
    }

    // Badge: Solar Flare Survivor
    if (!badgeAwarded.solarFlare && currentMechanic === 'SOLAR_FLARE' && solarFlareTimer > 4.0) {
        awardBadge('solar-flare-survivor', { score });
        badgeAwarded.solarFlare = true;
    }


    // Mechanic Spawner (Random Cycle)
    mechanicTimer += dt;
    
    // Check if mechanics are active
    const hasBlackHole = entities.some(e => e instanceof BlackHole);
    const hasWhiteHole = entities.some(e => e instanceof WhiteHole);
    const hasComets = entities.some(e => e instanceof Comet);

    if (hasBlackHole) {
        currentMechanic = 'BLACK_HOLE';
        mechanicTimer = 0; // Reset timer while active
    } else if (hasWhiteHole) {
        currentMechanic = 'WHITE_HOLE';
        mechanicTimer = 0;
    } else if (hasComets) {
        currentMechanic = 'COMET_STORM';
        mechanicTimer = 0;
    } else if (currentMechanic === 'SOLAR_FLARE') {
        // Solar Flare Logic
        solarFlareTimer += dt;
        if (solarFlareTimer < 1.0) {
            // Fade in
            solarFlareIntensity = solarFlareTimer;
        } else if (solarFlareTimer > solarFlareDuration - 1.0) {
            // Fade out
            solarFlareIntensity = solarFlareDuration - solarFlareTimer;
        } else {
            // Full intensity with flicker
            solarFlareIntensity = 1.0 + (Math.random() - 0.5) * 0.2;
        }
        
        if (solarFlareTimer >= solarFlareDuration) {
            currentMechanic = 'NONE';
            solarFlareIntensity = 0;
            mechanicTimer = 0;
        }
    } else {
        currentMechanic = 'NONE';
    }

    if (currentMechanic === 'NONE' && mechanicTimer > 10) {
        // Auto spawn (Keep existing logic)
        mechanicTimer = 0;
        const rand = Math.random();
        if (rand < 0.25) {
             spawnBlackHole();
             audio.playMechanicStart('BLACK_HOLE');
        } else if (rand < 0.50) {
             spawnWhiteHole();
             audio.playMechanicStart('WHITE_HOLE');
        } else if (rand < 0.75) {
            spawnCometStorm();
            audio.playMechanicStart('COMET_STORM');
        } else {
            spawnSolarFlare();
            audio.playMechanicStart('SOLAR_FLARE');
        }
    }
    
    // Manual Trigger (Debug/User)
    if (input.isJustPressed('KeyB')) {
        if (!entities.some(e => e instanceof BlackHole)) {
            spawnBlackHole();
            audio.playMechanicStart('BLACK_HOLE');
            mechanicTimer = 0;
        }
    }
    if (input.isJustPressed('KeyC')) {
        spawnCometStorm();
        audio.playMechanicStart('COMET_STORM');
        mechanicTimer = 0;
    }
    if (input.isJustPressed('KeyW')) { 
        spawnWhiteHole();
        audio.playMechanicStart('WHITE_HOLE');
        mechanicTimer = 0;
    }
    if (input.isJustPressed('KeyS')) { 
        spawnSolarFlare();
        audio.playMechanicStart('SOLAR_FLARE');
        mechanicTimer = 0;
    }

    // Update shake
    if (shakeTimer > 0) {
        shakeTimer -= dt;
        shakeIntensity *= Math.pow(0.1, dt); // Decay
        if (shakeTimer <= 0) shakeIntensity = 0;
    }

    // Helper to add particles
    const addParticle = (x, y, vel, color, life) => {
        particles.push(new Particle(x, y, vel, color, life));
    };
    
    // Helper to spawn asteroid from White Hole
    const spawnAsteroid = (pos, radius) => {
        const angle = Math.random() * Math.PI * 2;
        // Calculate size first
        const ballRadius = 30 + Math.random() * 20;
        // Spawn safely outside white hole radius + ball radius + buffer
        const spawnDist = radius + ballRadius + 20;
        const spawnPos = pos.add(new MathVec2(Math.cos(angle), Math.sin(angle)).scale(spawnDist));
        
        const ball = new Ball(spawnPos.x, spawnPos.y, ballRadius, Math.floor(Math.random() * 5) + 5);
        
        // Velocity outward
        const speed = 800 + Math.random() * 400; 
        ball.vel = new MathVec2(Math.cos(angle), Math.sin(angle)).scale(speed);
        
        entities.push(ball);
    };

    // Update entities
    for (let i = entities.length - 1; i >= 0; i--) {
        const e = entities[i];
        if (e instanceof Ship) {
            e.update(dt, input, addParticle);
            audio.updateEngine(e.vel.length());
        } else if (e instanceof Comet) {
            e.update(dt, input, addParticle);
        } else if (e instanceof WhiteHole) {
             e.update(dt, addParticle, spawnAsteroid);
        } else {
            e.update(dt);
        }

        // Black Hole / White Hole Physics
        if (!(e instanceof BlackHole) && !(e instanceof Comet)) {
             for (const bh of entities) {
                 if (bh instanceof WhiteHole) {
                     // WHITE HOLE: Repulsion
                     const diff = bh.pos.sub(e.pos);
                     const dist = diff.length();
                     
                     if (dist < 800) { // Influence range
                         const dir = diff.normalize(); // Points from e to bh
                         const force = 800000 / (dist * dist + 1000); 
                         
                         // Push AWAY from bh (opposite to dir)
                         e.vel = e.vel.sub(dir.scale(force * dt * 60));
                         
                         // Stronger push if very close to prevent entry
                         if (dist < bh.radius + 50) {
                             e.vel = e.vel.sub(dir.scale(2000 * dt));
                         }
                     }
                 } else if (bh instanceof BlackHole) {
                     // BLACK HOLE: Attraction
                     const diff = bh.pos.sub(e.pos);
                     const dist = diff.length();
                     
                     // Gravity (G * M / r^2) - Tuned for gameplay
                     if (dist > 10) { // Avoid singularity
                         const dir = diff.normalize();
                         const force = 500000 / (dist * dist + 1000); // Softened gravity
                         e.vel = e.vel.add(dir.scale(force * dt * 60)); // Stronger
                     }

                     // Accretion Swirl (Tangential Force)
                     if (dist < 300) {
                         const dir = diff.normalize();
                         const tangent = new MathVec2(-dir.y, dir.x);
                         e.vel = e.vel.add(tangent.scale(200 * dt));
                     }
                     
                     // Pulsar Ejection (Event Horizon)
                     if (dist < bh.radius) {
                         // Capture and Eject
                         const axisAngle = bh.angle * 0.5; // Match visual rotation
                         const axis = new MathVec2(Math.cos(axisAngle + Math.PI/2), Math.sin(axisAngle + Math.PI/2)); // Perpendicular to 0? No, let's align with drawn jets
                         // Drawn jets are roughly Up/Down relative to rotation
                         
                         // Randomly pick a pole
                         const poleDir = Math.random() > 0.5 ? 1 : -1;
                         const ejectDir = axis.scale(poleDir);
                         
                         // Snap to ejection point
                         e.pos = bh.pos.add(ejectDir.scale(bh.radius + 20));
                         e.vel = ejectDir.scale(1500); // Massive speed
                         
                         // Damage?
                         if (e instanceof Ball) {
                             // Maybe splitting it?
                             // For now just launch it
                         }
                         
                         // Effects
                         for(let k=0; k<10; k++) {
                              addParticle(e.pos.x, e.pos.y, ejectDir.scale(Math.random() * 500), {r:0.5, g:0, b:1, a:1}, 0.5);
                         }
                     }
                 }
             }
        }

        // Wall Collisions (Skip for Comets)
        let collided = false;
        let normal = new MathVec2(0, 0);

        if (!(e instanceof Comet)) {
            if (e.pos.x - e.radius < 0) {
                e.pos.x = e.radius;
                e.vel.x *= -WALL_ELASTICITY;
                collided = true;
                normal = new MathVec2(1, 0);
                if (e instanceof Ship || e.radius > 30) {
                    addShake(e.vel.length() * 0.02);
                    audio.playImpact(e.vel.length(), -1);
                }
            } else if (e.pos.x + e.radius > canvas.width) {
                e.pos.x = canvas.width - e.radius;
                e.vel.x *= -WALL_ELASTICITY;
                collided = true;
                normal = new MathVec2(-1, 0);
                if (e instanceof Ship || e.radius > 30) {
                    addShake(e.vel.length() * 0.02);
                    audio.playImpact(e.vel.length(), 1);
                }
            }
            
            if (e.pos.y - e.radius < 0) {
                e.pos.y = e.radius;
                e.vel.y *= -WALL_ELASTICITY;
                collided = true;
                normal = new MathVec2(0, 1);
                if (e instanceof Ship || e.radius > 30) {
                    addShake(e.vel.length() * 0.02);
                    audio.playImpact(e.vel.length(), 0); // Center-ish
                }
            } else if (e.pos.y + e.radius > canvas.height) {
                e.pos.y = canvas.height - e.radius;
                e.vel.y *= -WALL_ELASTICITY;
                collided = true;
                normal = new MathVec2(0, -1);
                if (e instanceof Ship || e.radius > 30) {
                    addShake(e.vel.length() * 0.02);
                    audio.playImpact(e.vel.length(), 0);
                }
            }
        }

        // Wall Collision Sparks (Only for Ship for now, or anything fast?)
        if (collided && e instanceof Ship) {
             const speed = e.vel.length();
             if (speed > 50) {
                 const count = Math.floor(speed / 20);
                 for(let k=0; k<count; k++) {
                     const angle = Math.atan2(normal.y, normal.x) + (Math.random() - 0.5) * 1.5; // Spread away from wall
                     const pSpeed = Math.random() * speed * 0.5 + 50;
                     const pVel = new MathVec2(Math.cos(angle), Math.sin(angle)).scale(pSpeed);
                     addParticle(e.pos.x, e.pos.y, pVel, {r: 1, g: 0.8, b: 0.2, a: 1}, Math.random() * 0.3 + 0.1);
                 }
             }
        }

        // Pocket detection for balls
        if (e instanceof Ball) {
            for (const p of pockets) {
                if (e.pos.sub(p.pos).length() < p.radius) {
                    e.dead = true;
                }
            }
        }
    }

    // Remove dead entities
    for (let i = entities.length - 1; i >= 0; i--) {
        if (entities[i].dead) {
            entities.splice(i, 1);
        }
    }
    
    // Entity-Entity Collisions
    const newEntities = [];
    for (let i = 0; i < entities.length; i++) {
        for (let j = i + 1; j < entities.length; j++) {
            const a = entities[i];
            const b = entities[j];
            resolveCollision(a, b, newEntities);
        }
    }
    entities.push(...newEntities);
    
    // Respawn balls if low
    if (entities.filter(e => e instanceof Ball).length < 3) {
        spawnBall();
    }
    
    // Update Particles
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.update(dt);
        if (p.dead) {
            particles.splice(i, 1);
        }
    }

    // Update previous mechanic state for next frame
    previousMechanic = currentMechanic;
}

// ===========================
// Badge Logic (Post-Update)
// ===========================
function updateBadges() {
    // Badge: First Pocket
    const ballCount = entities.filter(e => e instanceof Ball).length;
    if (!badgeAwarded.firstPocket && ballCount < 5 && score > 0) {
        awardBadge('first-pocket', { ballsSunk: 5 - ballCount });
        badgeAwarded.firstPocket = true;
    }

    // Badge: Perfect Clear
    if (!badgeAwarded.perfectClear && ballCount === 0 && entities.length > 0) {
        awardBadge('perfect-clear', { score });
        badgeAwarded.perfectClear = true;
    }

    // Badge: High Score
    if (!badgeAwarded.highScore && score >= 10000) {
        awardBadge('high-score', { score });
        badgeAwarded.highScore = true;
    }
    
    // Badge: Black Hole Master
    // Check transition: Was BLACK_HOLE, now NONE
    if (!badgeAwarded.blackHoleMaster && previousMechanic === 'BLACK_HOLE' && currentMechanic === 'NONE') {
         awardBadge('black-hole-master', { score });
         badgeAwarded.blackHoleMaster = true;
    }
    
    // Badge: Comet Storm
    const cometCount = entities.filter(e => e instanceof Comet).length;
    if (!badgeAwarded.cometStorm && cometCount >= 5) {
        awardBadge('comet-storm', { cometCount, score });
        badgeAwarded.cometStorm = true;
    }

    // Badge: Solar Flare Survivor
    if (!badgeAwarded.solarFlare && currentMechanic === 'SOLAR_FLARE' && solarFlareTimer > 4.0) {
        awardBadge('solar-flare-survivor', { score });
        badgeAwarded.solarFlare = true;
    }
}

function resolveCollision(a, b, newEntities) {
    const diff = a.pos.sub(b.pos);
    const dist = diff.length();
    const minDist = a.radius + b.radius;

    if (dist < minDist) {
        const normal = diff.normalize();
        const penetration = minDist - dist;
        
        const massA = a.mass || (a.radius * a.radius);
        const massB = b.mass || (b.radius * b.radius);
        
        const BREAK_THRESHOLD = 150000;

        // Helper to split a ball
        const trySplit = (ball, impactForce) => {
             if (ball instanceof Ball && !ball.dead) {
                 if (impactForce > BREAK_THRESHOLD || (a instanceof Comet) || (b instanceof Comet)) {
                     if (ball.radius > 10) {
                         ball.dead = true;
                         score += 100; 
                         addShake(5.0); // Big shake on break
                         audio.playExplosion(ball.radius, (ball.pos.x / canvas.width) * 2 - 1);
                         const newRadius = ball.radius * 0.7;
                         const splitDir = new MathVec2(-normal.y, normal.x); 
                         
                         for(let k = -1; k <= 1; k+=2) {
                             const nb = new Ball(ball.pos.x, ball.pos.y, newRadius, Math.max(3, ball.sides - 1));
                             nb.vel = ball.vel.add(splitDir.scale(k * 50));
                             nb.pos = nb.pos.add(splitDir.scale(k * newRadius));
                             newEntities.push(nb);
                         }
                     } else {
                         if (impactForce > BREAK_THRESHOLD * 2 || (a instanceof Comet) || (b instanceof Comet)) {
                             ball.dead = true;
                             score += 50; 
                             addShake(2.0); // Small shake on destroy
                             audio.playExplosion(ball.radius, (ball.pos.x / canvas.width) * 2 - 1);
                         }
                     }
                 }
             }
        };

        // Comet Logic (Plow through)
        if ((a instanceof Comet && b instanceof Ball) || (b instanceof Comet && a instanceof Ball)) {
             const ball = a instanceof Comet ? b : a;
             trySplit(ball, 1000000); 
             return; 
        }
        
        const invMassA = 1 / massA;
        const invMassB = 1 / massB;
        const totalInvMass = invMassA + invMassB;

        const moveA = normal.scale(penetration * (invMassA / totalInvMass));
        const moveB = normal.scale(-penetration * (invMassB / totalInvMass));

        a.pos = a.pos.add(moveA);
        b.pos = b.pos.add(moveB);

        const relVel = a.vel.sub(b.vel);
        const velAlongNormal = relVel.dot(normal);

        if (velAlongNormal > 0) return; 

        const e = Math.min(BALL_ELASTICITY, 1.0); 
        const j = -(1 + e) * velAlongNormal / totalInvMass;

        const impulse = normal.scale(j);
        a.vel = a.vel.add(impulse.scale(invMassA));
        b.vel = b.vel.sub(impulse.scale(invMassB));
        
        const impactForce = Math.abs(j);

        // Audio: Impact sound (bounce)
        // Use average position for panning
        const midX = (a.pos.x + b.pos.x) * 0.5;
        const pan = (midX / canvas.width) * 2 - 1;
        if (impactForce > 10000) { // Minimum force to hear
             audio.playImpact(impactForce / 1000, pan);
        }

        trySplit(a, impactForce);
        trySplit(b, impactForce);
    }
}

function drawBadgeNotifications() {
    if (badgeNotifications.length === 0) return;

    // Simple 2D text overlay on top of WebGL?
    // We can use a separate 2D canvas or just HTML DOM
    // Since we are in a "web ui" request, DOM is actually cleaner for text than writing a font renderer for WebGL
    // But if we want it in the canvas...
    
    // Let's use DOM elements for notifications as it's cleaner for this style
    // We'll update the DOM in updateUI or here
    
    const notifContainer = document.getElementById('notifications');
    if (!notifContainer) {
        const div = document.createElement('div');
        div.id = 'notifications';
        div.style.position = 'absolute';
        div.style.top = '20px';
        div.style.left = '50%';
        div.style.transform = 'translateX(-50%)';
        div.style.textAlign = 'center';
        div.style.pointerEvents = 'none';
        document.body.appendChild(div);
    }
    
    // Rebuild notifications
    const container = document.getElementById('notifications');
    container.innerHTML = '';
    
    badgeNotifications.forEach((n, i) => {
        // Update time
        n.time += 0.016; // approx
        if (n.time < n.duration) {
             const el = document.createElement('div');
             el.innerText = n.text;
             el.style.color = '#ffd700';
             el.style.fontSize = '24px';
             el.style.fontFamily = "'Courier New', monospace";
             el.style.textShadow = '0 0 10px #ff0000';
             el.style.marginBottom = '10px';
             el.style.opacity = Math.max(0, 1.0 - (n.time / n.duration));
             el.style.transition = 'opacity 0.1s';
             container.appendChild(el);
        }
    });
    
    // Cleanup
    for(let i=badgeNotifications.length-1; i>=0; i--) {
        if (badgeNotifications[i].time >= badgeNotifications[i].duration) {
            badgeNotifications.splice(i, 1);
        }
    }
}

function draw() {
    // 1. Bind Post-Process FBO
    postProcess.bind();

    // ... (rest of draw) ...

    // Background (overwrites clearColor)
    // We pass canvas dimensions and total time
    background.draw(canvas.width, canvas.height, performance.now() / 1000, solarFlareIntensity, solarFlarePos);

    // Enable blending for glow effects
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE); // Additive blending for vector glow feel

    let shakeX = 0;
    let shakeY = 0;
    if (shakeIntensity > 0) {
        shakeX = (Math.random() - 0.5) * shakeIntensity;
        shakeY = (Math.random() - 0.5) * shakeIntensity;
    }

    renderer.begin(shakeX, shakeY);

    // Draw Grid/Table
    drawTable();

    // Draw Entities
    for (const e of entities) {
        e.draw(renderer, input);
    }
    
    // Draw Particles
    for (const p of particles) {
        p.draw(renderer);
    }
    
    // Draw Pockets
    for (const p of pockets) {
        renderer.drawLine(p.pos.x - 20, p.pos.y - 20, p.pos.x + 20, p.pos.y + 20, 1, 0, 0, 0.5, 2);
        renderer.drawLine(p.pos.x + 20, p.pos.y - 20, p.pos.x - 20, p.pos.y + 20, 1, 0, 0, 0.5, 2);
        // Maybe a circle approximation?
        const steps = 12;
        for(let i=0; i<steps; i++) {
            const a1 = (i / steps) * Math.PI * 2;
            const a2 = ((i+1) / steps) * Math.PI * 2;
            const p1 = p.pos.add(new MathVec2(Math.cos(a1), Math.sin(a1)).scale(p.radius));
            const p2 = p.pos.add(new MathVec2(Math.cos(a2), Math.sin(a2)).scale(p.radius));
            renderer.drawLine(p1.x, p1.y, p2.x, p2.y, 0.8, 0.2, 0.2, 0.5, 2);
        }
    }

    renderer.end();

    // 2. Unbind and Render to Screen with CRT Shader
    postProcess.unbind();
    postProcess.render(performance.now() / 1000);
    
    // 3. Draw Badge Notifications (Overlay)
    drawBadgeNotifications();
}

function drawTable() {
    // Simple grid
    const spacing = 100;
    const cols = Math.ceil(canvas.width / spacing);
    const rows = Math.ceil(canvas.height / spacing);

    for (let x = 0; x <= cols; x++) {
        renderer.drawLine(x * spacing, 0, x * spacing, canvas.height, 0.1, 0.1, 0.2, 0.3, 1);
    }
    for (let y = 0; y <= rows; y++) {
        renderer.drawLine(0, y * spacing, canvas.width, y * spacing, 0.1, 0.1, 0.2, 0.3, 1);
    }
    
    // Border
    const w = canvas.width;
    const h = canvas.height;
    renderer.drawLine(0, 0, w, 0, 0.3, 0.3, 0.8, 1, 4);
    renderer.drawLine(w, 0, w, h, 0.3, 0.3, 0.8, 1, 4);
    renderer.drawLine(w, h, 0, h, 0.3, 0.3, 0.8, 1, 4);
    renderer.drawLine(0, h, 0, 0, 0.3, 0.3, 0.8, 1, 4);
}

init();
