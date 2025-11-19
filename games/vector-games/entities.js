import { Vec2 } from './math.js';

export class Particle {
    constructor(x, y, vel, color, life) {
        this.pos = new Vec2(x, y);
        this.vel = vel;
        this.color = color;
        this.life = life;
        this.maxLife = life;
        this.dead = false;
    }

    update(dt) {
        this.pos = this.pos.add(this.vel.scale(dt));
        this.life -= dt;
        if (this.life <= 0) this.dead = true;
    }

    draw(renderer) {
        // Fade out
        const alpha = this.life / this.maxLife;
        renderer.drawLine(this.pos.x, this.pos.y, this.pos.x + this.vel.x * 0.05, this.pos.y + this.vel.y * 0.05, this.color.r, this.color.g, this.color.b, alpha, 2);
    }
}

export class Entity {
    constructor(x, y, radius) {
        this.pos = new Vec2(x, y);
        this.vel = new Vec2(0, 0);
        this.radius = radius;
        this.dead = false;
        this.color = { r: 1, g: 1, b: 1, a: 1 };
        this.mass = radius * radius; // Default mass
    }

    update(dt) {
        this.pos = this.pos.add(this.vel.scale(dt));
        
        // Drag (Time-based)
        // Very low friction for "drift" feel (0.98 per second)
        this.vel = this.vel.scale(Math.pow(0.98, dt));
    }

    draw(renderer, input) {}
}

export class BlackHole extends Entity {
    constructor(x, y) {
        super(x, y, 1); // Start small
        this.color = { r: 0.5, g: 0, b: 0.8, a: 1 }; // Purple
        this.mass = 1000000; // Huge
        this.angle = 0;
        
        // Lifecycle
        this.life = 0;
        this.maxLife = 15; // 15 seconds total
        this.maxRadius = 60;
        this.growthPhase = 0.1; // % of life spent growing
        this.shrinkPhase = 0.9; // % of life when shrinking starts
        
        // Slow drift
        this.vel = new Vec2(Math.random() - 0.5, Math.random() - 0.5).scale(20);
    }
    
    update(dt) {
        this.angle += dt * 2.0;
        this.life += dt;
        
        // Apply drift velocity
        this.pos = this.pos.add(this.vel.scale(dt));
        
        // Growth / Shrink Logic
        const progress = this.life / this.maxLife;
        
        if (progress < this.growthPhase) {
            // Growing
            const t = progress / this.growthPhase;
            // Ease out elastic or simple ease out
            this.radius = 1 + (this.maxRadius - 1) * (1 - Math.pow(1 - t, 3));
        } else if (progress > this.shrinkPhase) {
            // Shrinking
            const t = (progress - this.shrinkPhase) / (1.0 - this.shrinkPhase);
            this.radius = this.maxRadius * (1 - t);
        } else {
            // Stable
            this.radius = this.maxRadius + Math.sin(this.life * 5) * 2; // Pulse
        }
        
        if (this.life >= this.maxLife) {
            this.dead = true;
        }
    }

    draw(renderer) {
        if (this.radius < 1) return; // Don't draw if invisible
        // Draw Core
        const segments = 16;
        for(let i=0; i<segments; i++) {
            const a1 = (i/segments) * Math.PI * 2;
            const a2 = ((i+1)/segments) * Math.PI * 2;
            const p1 = this.pos.add(new Vec2(Math.cos(a1), Math.sin(a1)).scale(this.radius));
            const p2 = this.pos.add(new Vec2(Math.cos(a2), Math.sin(a2)).scale(this.radius));
            renderer.drawLine(p1.x, p1.y, p2.x, p2.y, 0.2, 0, 0.4, 1, 4);
        }
        
        // Draw Accretion Swirls
        const swirls = 8;
        for(let i=0; i<swirls; i++) {
            const offset = (i / swirls) * Math.PI * 2 + this.angle;
            let curr = this.pos.add(new Vec2(Math.cos(offset), Math.sin(offset)).scale(this.radius));
            
            // Spiral out
            for(let j=0; j<10; j++) {
                 const r = this.radius + j * 10;
                 const a = offset - j * 0.2;
                 const next = this.pos.add(new Vec2(Math.cos(a), Math.sin(a)).scale(r));
                 renderer.drawLine(curr.x, curr.y, next.x, next.y, 0.5, 0.1, 0.8, 1.0 - (j/10), 2);
                 curr = next;
            }
        }
        
        // Draw Pulsar Jets (Visual only, logic is in main)
        const axis = new Vec2(0, 1).rotate(this.angle * 0.5); // Slower rotation for jets
        const top = this.pos.add(axis.scale(200));
        const bottom = this.pos.add(axis.scale(-200));
        renderer.drawLine(this.pos.x, this.pos.y, top.x, top.y, 0.8, 0.8, 1, 0.2, 1);
        renderer.drawLine(this.pos.x, this.pos.y, bottom.x, bottom.y, 0.8, 0.8, 1, 0.2, 1);
    }
}

export class WhiteHole extends BlackHole {
    constructor(x, y) {
        super(x, y);
        this.color = { r: 1, g: 1, b: 1, a: 1 }; // Pure White
        this.spawnTimer = 0;
    }

    update(dt, addParticle, spawnCallback) {
        super.update(dt);
        
        // Spin faster than black hole
        this.angle += dt * 3.0;
        
        // Spawn Asteroids
        this.spawnTimer += dt;
        if (this.spawnTimer > 2.0 && this.radius > 20) { // Spew every 2.0s (reduced by 75%)
            this.spawnTimer = 0;
            if (spawnCallback) spawnCallback(this.pos, this.radius);
        }
        
        // White hole pushes things away slightly (Anti-gravity)
        // Logic handled in main loop collision checks if we want physics
        
        // Visual particles (Reverse accretion disk)
        if (addParticle && Math.random() < 0.3) {
             const angle = Math.random() * Math.PI * 2;
             const pPos = this.pos.add(new Vec2(Math.cos(angle), Math.sin(angle)).scale(10));
             const pVel = new Vec2(Math.cos(angle), Math.sin(angle)).scale(100);
             addParticle(pPos.x, pPos.y, pVel, {r:1, g:1, b:1, a:0.8}, 1.0);
        }
    }

    draw(renderer) {
        if (this.radius < 1) return;
        
        // Render as a glowing gas cloud using the new drawCircle method
        // Layered circles with varying opacity for "cloud" effect
        
        // Core (Bright White/Blue)
        renderer.drawCircle(this.pos.x, this.pos.y, this.radius * 0.6, 1, 1, 1, 0.9);
        
        // Inner Glow (Cyan/Blue)
        renderer.drawCircle(this.pos.x, this.pos.y, this.radius * 0.8, 0.5, 0.8, 1, 0.6);
        
        // Outer Gas (Deep Blue/Purple)
        renderer.drawCircle(this.pos.x, this.pos.y, this.radius * 1.2, 0.2, 0.4, 1, 0.3);
        
        // Outward Rays (Keep these for "Radiance")
        const rays = 12;
        for(let i=0; i<rays; i++) {
            const offset = (i / rays) * Math.PI * 2 + this.angle;
            const p1 = this.pos.add(new Vec2(Math.cos(offset), Math.sin(offset)).scale(this.radius * 0.5));
            const p2 = this.pos.add(new Vec2(Math.cos(offset), Math.sin(offset)).scale(this.radius + 40));
            
            renderer.drawLine(p1.x, p1.y, p2.x, p2.y, 1, 1, 1, 0.3, 2);
        }
    }
}

export class Comet extends Entity {
    constructor(x, y, vel) {
        super(x, y, 15);
        this.vel = vel;
        this.color = { r: 1, g: 0.4, b: 0, a: 1 }; // Orange/Fire
        this.mass = 5000; 
        this.trailTimer = 0;
        this.angle = Math.atan2(vel.y, vel.x);
        this.spin = (Math.random() - 0.5) * 10;
    }

    update(dt, input, addParticle) { 
        this.pos = this.pos.add(this.vel.scale(dt));
        this.angle += this.spin * dt;
        
        this.trailTimer += dt;
        if (this.trailTimer > 0.02 && addParticle) { 
            this.trailTimer = 0;
            const backDir = this.vel.normalize().scale(-1);
            
            // Main Fire Tail
            const pVel = backDir.scale(150).add(new Vec2(Math.random()-0.5, Math.random()-0.5).scale(50));
            // Orange/Red Fire
            addParticle(this.pos.x, this.pos.y, pVel, {r:1, g:Math.random()*0.5, b:0, a:0.8}, 0.6);
            
            // Sparks
            for(let i=0; i<2; i++) {
                 const side = new Vec2(backDir.y, -backDir.x).scale((Math.random()-0.5) * 20);
                 const sparkVel = backDir.scale(50 + Math.random()*50).add(side);
                 addParticle(this.pos.x, this.pos.y, sparkVel, {r:1, g:0.8, b:0.2, a:0.8}, 0.4);
            }
        }

        if (this.pos.x < -500 || this.pos.x > 3000 || this.pos.y < -500 || this.pos.y > 3000) {
            this.dead = true;
        }
    }

    draw(renderer) {
        const segments = 7; // Irregular rock shape
        for(let i=0; i<segments; i++) {
            const a1 = (i/segments) * Math.PI * 2 + this.angle;
            const a2 = ((i+1)/segments) * Math.PI * 2 + this.angle;
            // Jagged radius
            const r1 = this.radius * (0.8 + Math.sin(i*234)*0.2);
            const r2 = this.radius * (0.8 + Math.sin((i+1)*234)*0.2);
            
            const p1 = this.pos.add(new Vec2(Math.cos(a1), Math.sin(a1)).scale(r1));
            const p2 = this.pos.add(new Vec2(Math.cos(a2), Math.sin(a2)).scale(r2));
            
            renderer.drawLine(p1.x, p1.y, p2.x, p2.y, 1, 0.5, 0, 1, 3); // Orange Outline
            renderer.drawLine(p1.x, p1.y, p2.x, p2.y, 1, 1, 0, 0.5, 1); // Yellow Inner
        }
    }
}

export class Ship extends Entity {
    constructor(x, y) {
        super(x, y, 20); // Slightly larger radius
        this.angle = 0;
        this.color = { r: 0, g: 1, b: 1, a: 1 }; // Cyan
        this.isDragging = false;
        this.targetPos = null; // For double click movement
        this.trail = []; // For motion trail
        // Increase mass significantly for impact
        this.mass = this.radius * this.radius * 5; 
    }

    update(dt, input, addParticle) { // Accept addParticle callback
        const mousePos = new Vec2(input.pointer.x, input.pointer.y);

        // Update Trail
        this.trail.push({ pos: this.pos, angle: this.angle, alpha: 0.5 });
        if (this.trail.length > 10) this.trail.shift(); // Keep last 10 frames

        // Handle Double Click Move
        if (input.doubleClick.active) {
            this.targetPos = new Vec2(input.doubleClick.x, input.doubleClick.y);
            // Visual effect for target? (Could add a particle there)
            if (addParticle) {
                // Ping effect at target
                for(let k=0; k<10; k++) {
                     const a = Math.random() * Math.PI * 2;
                     const v = new Vec2(Math.cos(a), Math.sin(a)).scale(100);
                     addParticle(this.targetPos.x, this.targetPos.y, v, {r:0, g:1, b:0, a:1}, 0.5);
                }
            }
        }

        // Apply force towards target
        if (this.targetPos) {
            const diff = this.targetPos.sub(this.pos);
            const dist = diff.length();
            
            if (dist < 10) {
                this.targetPos = null; // Arrived
            } else {
                const dir = diff.normalize();
                // Accelerate towards target
                const acceleration = 1500; // Adjust for snappiness
                this.vel = this.vel.add(dir.scale(acceleration * dt));
            }
        }

        // Start Drag
        if (input.pointer.justPressed) {
             const dist = this.pos.sub(mousePos).length();
             if (dist < this.radius * 3.0) { // Generous touch hit area
                 this.isDragging = true;
                 this.targetPos = null; // Cancel auto-move if user grabs ship
             }
        }

        // End Drag / Launch
        if (this.isDragging && !input.pointer.isDown) {
            this.isDragging = false;
            const pull = this.pos.sub(mousePos);
            const len = pull.length();
            
            if (len > 10) { // Deadzone
                const power = Math.min(len, 200); // Cap power distance
                const speed = power * 8; // Multiplier: Increased speed (was 5)
                const dir = pull.normalize();
                this.vel = this.vel.add(dir.scale(speed));
                
                // Burst particles on launch
                if (addParticle) {
                    for(let i=0; i<20; i++) {
                         const pAngle = Math.atan2(-dir.y, -dir.x) + (Math.random() - 0.5);
                         const pSpeed = Math.random() * 200 + 50;
                         const pVel = new Vec2(Math.cos(pAngle), Math.sin(pAngle)).scale(pSpeed).add(this.vel.scale(0.2));
                         const color = { r: 1, g: Math.random(), b: 0, a: 1 }; // Orange-Yellow
                         addParticle(this.pos.x, this.pos.y, pVel, color, Math.random() * 0.5 + 0.2);
                    }
                }
            }
        }
        
        // Visual rotation
        if (this.vel.length() > 5) {
            this.angle = Math.atan2(this.vel.y, this.vel.x);
            
            // Exhaust Trail
            if (addParticle && Math.random() < 0.5) {
                 const backDir = this.vel.normalize().scale(-1);
                 // Offset to back of ship
                 const exhaustPos = this.pos.add(backDir.scale(this.radius));
                 const spread = (Math.random() - 0.5) * 1.0;
                 const pVel = new Vec2(backDir.x + spread, backDir.y + spread).scale(Math.random() * 50);
                 
                 // Rainbow / Colorful sparks
                 const hue = (Date.now() * 0.005) % 1;
                 // Simple HSL to RGB approximation or just random RGB
                 const r = Math.sin(hue * 6.28) * 0.5 + 0.5;
                 const g = Math.sin(hue * 6.28 + 2.09) * 0.5 + 0.5;
                 const b = Math.sin(hue * 6.28 + 4.18) * 0.5 + 0.5;
                 
                 addParticle(exhaustPos.x, exhaustPos.y, pVel, {r, g, b, a: 1}, Math.random() * 0.3 + 0.1);
            }
        }

        super.update(dt);
    }

    draw(renderer, input) {
        // Draw Motion Trail
        for(let i=0; i<this.trail.length; i++) {
            const t = this.trail[i];
            const alpha = (i / this.trail.length) * 0.3; // Fade out
            
            const tip = new Vec2(Math.cos(t.angle), Math.sin(t.angle)).scale(this.radius);
            const backLeft = new Vec2(Math.cos(t.angle + 2.5), Math.sin(t.angle + 2.5)).scale(this.radius);
            const backRight = new Vec2(Math.cos(t.angle - 2.5), Math.sin(t.angle - 2.5)).scale(this.radius);
            
            const p1 = t.pos.add(tip);
            const p2 = t.pos.add(backLeft);
            const p3 = t.pos.add(backRight);
            
            renderer.drawLine(p1.x, p1.y, p2.x, p2.y, this.color.r, this.color.g, this.color.b, alpha, 1);
            renderer.drawLine(p2.x, p2.y, p3.x, p3.y, this.color.r, this.color.g, this.color.b, alpha, 1);
            renderer.drawLine(p3.x, p3.y, p1.x, p1.y, this.color.r, this.color.g, this.color.b, alpha, 1);
        }

        // Draw Drag Visuals
        if (this.isDragging && input) {
             const mousePos = new Vec2(input.pointer.x, input.pointer.y);
             
             // Draw elastic string
             renderer.drawLine(this.pos.x, this.pos.y, mousePos.x, mousePos.y, 0.5, 0.5, 0.5, 0.5, 1);
             
             // Draw Trajectory (opposite)
             const pull = this.pos.sub(mousePos);
             const len = pull.length();
             if (len > 10) {
                 const power = Math.min(len, 200);
                 const dir = pull.normalize();
                 const end = this.pos.add(dir.scale(power * 2)); // Show path
                 renderer.drawLine(this.pos.x, this.pos.y, end.x, end.y, 1, 1, 0, 0.8, 2);
             }
        }

        // Draw Ship (Triangle)
        const tip = new Vec2(Math.cos(this.angle), Math.sin(this.angle)).scale(this.radius);
        const backLeft = new Vec2(Math.cos(this.angle + 2.5), Math.sin(this.angle + 2.5)).scale(this.radius);
        const backRight = new Vec2(Math.cos(this.angle - 2.5), Math.sin(this.angle - 2.5)).scale(this.radius);

        const p1 = this.pos.add(tip);
        const p2 = this.pos.add(backLeft);
        const p3 = this.pos.add(backRight);

        renderer.drawLine(p1.x, p1.y, p2.x, p2.y, this.color.r, this.color.g, this.color.b, 1, 2);
        renderer.drawLine(p2.x, p2.y, p3.x, p3.y, this.color.r, this.color.g, this.color.b, 1, 2);
        renderer.drawLine(p3.x, p3.y, p1.x, p1.y, this.color.r, this.color.g, this.color.b, 1, 2);
    }
}

export class Ball extends Entity {
    constructor(x, y, radius = 20, sides = 8) {
        super(x, y, radius);
        this.sides = sides;
        this.color = { r: 1, g: 0, b: 1, a: 1 }; // Magenta
        this.angle = Math.random() * Math.PI * 2;
        this.spin = (Math.random() - 0.5) * 2; // Slow spin
    }
    
    update(dt) {
        super.update(dt);
        this.angle += this.spin * dt;
    }

    draw(renderer) {
        const step = (Math.PI * 2) / this.sides;
        for (let i = 0; i < this.sides; i++) {
            const a1 = i * step + this.angle;
            const a2 = (i + 1) * step + this.angle;
            
            const p1 = this.pos.add(new Vec2(Math.cos(a1), Math.sin(a1)).scale(this.radius));
            const p2 = this.pos.add(new Vec2(Math.cos(a2), Math.sin(a2)).scale(this.radius));

            renderer.drawLine(p1.x, p1.y, p2.x, p2.y, this.color.r, this.color.g, this.color.b, 1, 2);
        }
    }
}
