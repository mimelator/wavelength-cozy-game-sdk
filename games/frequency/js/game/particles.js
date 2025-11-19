/**
 * Frequency - Particle Effects System
 * Lightweight floating particles that respond to sound waves
 */

class ParticleSystem {
    constructor(canvas, wavePhysics) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.wavePhysics = wavePhysics;

        this.particles = [];
        this.maxParticles = 50; // Keep it light for performance
        this.particleId = 0;

        // Particle types
        this.particleTypes = {
            star: { char: '✦', size: 12, drift: 0.3 },
            sparkle: { char: '✨', size: 16, drift: 0.5 },
            note: { char: '♪', size: 14, drift: 0.4 },
            dot: { char: '•', size: 8, drift: 0.2 },
            diamond: { char: '◆', size: 10, drift: 0.35 }
        };

        // Spawn settings
        this.spawnRate = 0.3; // Particles per second (very gentle)
        this.timeSinceLastSpawn = 0;

        console.log('✨ ParticleSystem initialized');
    }

    /**
     * Update particles (called each frame)
     */
    update(deltaTime) {
        // Update existing particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            this.updateParticle(particle, deltaTime);

            // Remove dead particles
            if (particle.life <= 0 || particle.alpha <= 0.01) {
                this.particles.splice(i, 1);
            }
        }

        // Spawn new particles occasionally
        this.timeSinceLastSpawn += deltaTime;
        if (this.timeSinceLastSpawn >= (1.0 / this.spawnRate) && this.particles.length < this.maxParticles) {
            this.spawnRandomParticle();
            this.timeSinceLastSpawn = 0;
        }
    }

    /**
     * Update individual particle
     */
    updateParticle(particle, deltaTime) {
        // Age the particle
        particle.age += deltaTime;
        particle.life = Math.max(0, particle.maxLife - particle.age);

        // Movement
        particle.x += particle.velocity.x * deltaTime;
        particle.y += particle.velocity.y * deltaTime;

        // Gentle drift
        particle.x += Math.sin(particle.age * particle.driftSpeed) * particle.driftAmount * deltaTime;
        particle.y += Math.cos(particle.age * particle.driftSpeed * 0.7) * particle.driftAmount * 0.5 * deltaTime;

        // React to nearby waves
        this.applyWaveInfluence(particle);

        // Update visual properties
        const lifeRatio = particle.life / particle.maxLife;
        particle.alpha = Math.sin(lifeRatio * Math.PI) * particle.baseAlpha; // Fade in and out
        particle.scale = 0.5 + 0.5 * Math.sin(particle.age * 3); // Gentle pulsing

        // Wrap around screen edges
        if (particle.x < -50) particle.x = this.canvas.width + 50;
        if (particle.x > this.canvas.width + 50) particle.x = -50;
        if (particle.y < -50) particle.y = this.canvas.height + 50;
        if (particle.y > this.canvas.height + 50) particle.y = -50;
    }

    /**
     * Apply wave influence to particles
     */
    applyWaveInfluence(particle) {
        const waveAmplitude = this.wavePhysics.getAmplitudeAt(particle.x, particle.y, Date.now());
        const influence = Math.abs(waveAmplitude) / 100;

        if (influence > 0.1) {
            // Particles get pushed by waves
            const pushStrength = influence * 20;
            particle.velocity.x += (Math.random() - 0.5) * pushStrength;
            particle.velocity.y += (Math.random() - 0.5) * pushStrength;

            // Limit velocity
            const maxVel = 100;
            particle.velocity.x = Math.max(-maxVel, Math.min(maxVel, particle.velocity.x));
            particle.velocity.y = Math.max(-maxVel, Math.min(maxVel, particle.velocity.y));

            // Particles glow more when near waves
            particle.waveGlow = Math.min(1.0, particle.waveGlow + influence);
        } else {
            // Gradually return to normal
            particle.velocity.x *= 0.95;
            particle.velocity.y *= 0.95;
            particle.waveGlow *= 0.95;
        }
    }

    /**
     * Spawn a random particle
     */
    spawnRandomParticle() {
        const types = Object.keys(this.particleTypes);
        const type = RandomUtils.choice(types);
        const config = this.particleTypes[type];

        // Random edge spawn
        let x, y;
        const edge = Math.floor(Math.random() * 4);
        switch (edge) {
            case 0: // Top
                x = Math.random() * this.canvas.width;
                y = -20;
                break;
            case 1: // Right
                x = this.canvas.width + 20;
                y = Math.random() * this.canvas.height;
                break;
            case 2: // Bottom
                x = Math.random() * this.canvas.width;
                y = this.canvas.height + 20;
                break;
            case 3: // Left
                x = -20;
                y = Math.random() * this.canvas.height;
                break;
        }

        this.createParticle({
            x: x,
            y: y,
            type: type,
            color: `hsl(${Math.random() * 360}, 70%, 80%)`
        });
    }

    /**
     * Create particle at specific location
     */
    createParticle(options) {
        const config = this.particleTypes[options.type] || this.particleTypes.star;

        const particle = {
            id: this.particleId++,
            x: options.x || 0,
            y: options.y || 0,
            type: options.type || 'star',
            char: config.char,
            size: config.size + (Math.random() - 0.5) * 4,

            // Movement
            velocity: {
                x: (Math.random() - 0.5) * 20,
                y: (Math.random() - 0.5) * 20
            },
            driftAmount: config.drift * 10,
            driftSpeed: 0.5 + Math.random() * 1.5,

            // Life
            maxLife: 8 + Math.random() * 12, // 8-20 seconds
            life: 0,
            age: 0,

            // Visual
            color: options.color || `hsl(${Math.random() * 360}, 70%, 80%)`,
            baseAlpha: 0.6 + Math.random() * 0.4,
            alpha: 0,
            scale: 1,
            waveGlow: 0
        };

        particle.life = particle.maxLife;
        this.particles.push(particle);

        return particle.id;
    }

    /**
     * Create particle burst at location (for interactions)
     */
    createBurst(x, y, count = 5) {
        const types = Object.keys(this.particleTypes);

        for (let i = 0; i < count; i++) {
            const angle = (i / count) * Math.PI * 2;
            const distance = 20 + Math.random() * 30;

            this.createParticle({
                x: x + Math.cos(angle) * distance,
                y: y + Math.sin(angle) * distance,
                type: RandomUtils.choice(types),
                color: FrequencyUtils.frequencyToColor(200 + Math.random() * 600)
            });
        }
    }

    /**
     * Render all particles
     */
    render() {
        this.particles.forEach(particle => this.renderParticle(particle));
    }

    /**
     * Render individual particle
     */
    renderParticle(particle) {
        if (particle.alpha <= 0.01) return;

        this.ctx.save();

        // Position and scale
        this.ctx.translate(particle.x, particle.y);
        this.ctx.scale(particle.scale, particle.scale);

        // Glow effect when influenced by waves
        if (particle.waveGlow > 0.1) {
            this.ctx.shadowColor = particle.color;
            this.ctx.shadowBlur = 10 * particle.waveGlow;
        }

        // Set alpha
        this.ctx.globalAlpha = particle.alpha;

        // Render based on type
        if (particle.char) {
            // Text-based particles (emoji/symbols)
            this.ctx.fillStyle = particle.color;
            this.ctx.font = `${particle.size}px Arial`;
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(particle.char, 0, 0);
        } else {
            // Shape-based particles
            this.ctx.fillStyle = particle.color;
            this.ctx.beginPath();
            this.ctx.arc(0, 0, particle.size / 2, 0, Math.PI * 2);
            this.ctx.fill();
        }

        this.ctx.restore();
    }

    /**
     * Create musical note particles when frequencies are played
     */
    createMusicalResponse(frequency, x, y) {
        const noteTypes = ['♪', '♫', '♬', '♩', '♭', '♯'];
        const note = RandomUtils.choice(noteTypes);

        // Create temporary particle type for this note
        this.particleTypes.musical = {
            char: note,
            size: 18,
            drift: 0.6
        };

        this.createParticle({
            x: x + (Math.random() - 0.5) * 40,
            y: y + (Math.random() - 0.5) * 40,
            type: 'musical',
            color: FrequencyUtils.frequencyToColor(frequency)
        });
    }

    /**
     * Create ambient sparkles (very subtle)
     */
    createAmbientSparkle() {
        if (this.particles.length < this.maxParticles * 0.3) { // Only if not too many particles
            this.createParticle({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                type: 'sparkle',
                color: `hsl(${Math.random() * 60 + 180}, 50%, 90%)` // Cool, subtle colors
            });
        }
    }

    /**
     * Clear all particles
     */
    clear() {
        this.particles = [];
    }

    /**
     * Get particle count
     */
    getParticleCount() {
        return this.particles.length;
    }

    /**
     * Set maximum particles (for performance tuning)
     */
    setMaxParticles(max) {
        this.maxParticles = Math.max(10, Math.min(200, max));

        // Remove excess particles if needed
        while (this.particles.length > this.maxParticles) {
            this.particles.pop();
        }
    }

    /**
     * Enable/disable particle system
     */
    setEnabled(enabled) {
        this.enabled = enabled;
        if (!enabled) {
            this.clear();
        }
    }
}

// Export for use in other modules
if (typeof window !== 'undefined') {
    window.ParticleSystem = ParticleSystem;
}
