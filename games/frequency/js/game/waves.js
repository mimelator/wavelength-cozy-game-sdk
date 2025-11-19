/**
 * Frequency - Wave Physics System
 * Wave mechanics, interference, and visual representation
 */

class WavePhysics {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.waves = [];
        this.waveId = 0;

        // Physics settings
        this.amplitude = 50;
        this.wavelength = 100;
        this.speed = 2.0;
        this.damping = 0.995; // Wave decay over time

        // Visual settings
        this.showGrid = true;
        this.showInterference = true;
        this.lineWidth = 2;

        console.log('🌊 WavePhysics system initialized');
    }

    /**
     * Create a new wave
     */
    createWave(options = {}) {
        const wave = {
            id: this.waveId++,
            frequency: options.frequency || 440,
            amplitude: options.amplitude || this.amplitude,
            wavelength: options.wavelength || this.wavelength,
            phase: options.phase || 0,
            speed: options.speed || this.speed,
            position: options.position || { x: this.canvas.width / 2, y: this.canvas.height / 2 },
            direction: options.direction || { x: 1, y: 0 },
            color: options.color || FrequencyUtils.frequencyToColor(options.frequency || 440),
            type: options.type || 'sine', // sine, square, triangle, sawtooth
            lifetime: options.lifetime || Infinity,
            age: 0,
            isActive: true
        };

        this.waves.push(wave);
        console.log(`🌊 Created wave: ${wave.frequency}Hz at (${wave.position.x}, ${wave.position.y})`);
        return wave.id;
    }

    /**
     * Remove a wave by ID
     */
    removeWave(waveId) {
        const index = this.waves.findIndex(w => w.id === waveId);
        if (index !== -1) {
            this.waves.splice(index, 1);
            console.log(`🗑️ Removed wave: ${waveId}`);
            return true;
        }
        return false;
    }

    /**
     * Update all waves (called each frame)
     */
    update(deltaTime) {
        // Update each wave
        for (let i = this.waves.length - 1; i >= 0; i--) {
            const wave = this.waves[i];

            // Age the wave
            wave.age += deltaTime;

            // Update phase (creates wave motion)
            wave.phase += wave.speed * deltaTime * 0.1;

            // Apply damping
            wave.amplitude *= this.damping;

            // Remove dead or expired waves
            if (wave.amplitude < 0.1 || wave.age > wave.lifetime) {
                this.waves.splice(i, 1);
                continue;
            }

            // Update position if moving
            if (wave.direction.x !== 0 || wave.direction.y !== 0) {
                wave.position.x += wave.direction.x * wave.speed * deltaTime;
                wave.position.y += wave.direction.y * wave.speed * deltaTime;

                // Wrap around canvas edges
                if (wave.position.x < 0) wave.position.x = this.canvas.width;
                if (wave.position.x > this.canvas.width) wave.position.x = 0;
                if (wave.position.y < 0) wave.position.y = this.canvas.height;
                if (wave.position.y > this.canvas.height) wave.position.y = 0;
            }
        }
    }

    /**
     * Calculate wave amplitude at a specific point
     */
    getAmplitudeAt(x, y, time) {
        let totalAmplitude = 0;

        for (const wave of this.waves) {
            const distance = Math.sqrt(
                (x - wave.position.x) ** 2 +
                (y - wave.position.y) ** 2
            );

            // Calculate wave function based on type
            let waveValue = 0;
            const argument = (2 * Math.PI * distance / wave.wavelength) - wave.phase;

            switch (wave.type) {
                case 'sine':
                    waveValue = Math.sin(argument);
                    break;
                case 'square':
                    waveValue = Math.sign(Math.sin(argument));
                    break;
                case 'triangle':
                    waveValue = (2 / Math.PI) * Math.asin(Math.sin(argument));
                    break;
                case 'sawtooth':
                    waveValue = 2 * (argument / (2 * Math.PI) - Math.floor(argument / (2 * Math.PI) + 0.5));
                    break;
            }

            // Apply amplitude and distance falloff
            const falloff = Math.max(0, 1 - distance / 300); // Waves fade over distance
            totalAmplitude += wave.amplitude * waveValue * falloff;
        }

        return totalAmplitude;
    }

    /**
     * Calculate wave interference patterns
     */
    calculateInterference() {
        const interference = [];
        const gridSize = 10;

        for (let x = 0; x < this.canvas.width; x += gridSize) {
            for (let y = 0; y < this.canvas.height; y += gridSize) {
                const amplitude = this.getAmplitudeAt(x, y, Date.now());
                interference.push({ x, y, amplitude });
            }
        }

        return interference;
    }

    /**
     * Render all waves and interference patterns
     */
    render() {
        // Clear canvas with subtle background
        this.ctx.fillStyle = 'rgba(10, 15, 35, 0.1)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw grid if enabled
        if (this.showGrid) {
            this.drawGrid();
        }

        // Draw interference pattern if enabled
        if (this.showInterference && this.waves.length > 1) {
            this.drawInterference();
        }

        // Draw individual waves
        this.waves.forEach(wave => this.drawWave(wave));

        // Draw wave sources
        this.waves.forEach(wave => this.drawWaveSource(wave));
    }

    /**
     * Draw a single wave as concentric circles
     */
    drawWave(wave) {
        const maxRadius = 200;
        const numRings = 8;

        this.ctx.strokeStyle = wave.color;
        this.ctx.lineWidth = this.lineWidth;
        this.ctx.globalAlpha = Math.max(0.1, wave.amplitude / 100);

        for (let ring = 1; ring <= numRings; ring++) {
            const radius = (ring * maxRadius / numRings) + (wave.phase * 10) % (maxRadius / numRings);

            if (radius > 0 && radius < maxRadius) {
                // Calculate wave intensity at this ring
                const waveIntensity = Math.abs(this.getWaveValueAtDistance(wave, radius));

                this.ctx.globalAlpha = Math.max(0.1, (wave.amplitude / 100) * waveIntensity);

                this.ctx.beginPath();
                this.ctx.arc(wave.position.x, wave.position.y, radius, 0, 2 * Math.PI);
                this.ctx.stroke();
            }
        }

        this.ctx.globalAlpha = 1.0;
    }

    /**
     * Get wave value at specific distance from source
     */
    getWaveValueAtDistance(wave, distance) {
        const argument = (2 * Math.PI * distance / wave.wavelength) - wave.phase;

        switch (wave.type) {
            case 'sine':
                return Math.sin(argument);
            case 'square':
                return Math.sign(Math.sin(argument));
            case 'triangle':
                return (2 / Math.PI) * Math.asin(Math.sin(argument));
            case 'sawtooth':
                return 2 * (argument / (2 * Math.PI) - Math.floor(argument / (2 * Math.PI) + 0.5));
            default:
                return Math.sin(argument);
        }
    }

    /**
     * Draw wave source point
     */
    drawWaveSource(wave) {
        const pulseRadius = 5 + Math.sin(wave.phase * 2) * 3;

        // Outer glow
        const gradient = this.ctx.createRadialGradient(
            wave.position.x, wave.position.y, 0,
            wave.position.x, wave.position.y, pulseRadius * 2
        );
        gradient.addColorStop(0, wave.color);
        gradient.addColorStop(1, 'transparent');

        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.arc(wave.position.x, wave.position.y, pulseRadius * 2, 0, 2 * Math.PI);
        this.ctx.fill();

        // Inner core
        this.ctx.fillStyle = wave.color;
        this.ctx.beginPath();
        this.ctx.arc(wave.position.x, wave.position.y, pulseRadius, 0, 2 * Math.PI);
        this.ctx.fill();
    }

    /**
     * Draw interference pattern as a grid of intensity points
     */
    drawInterference() {
        const gridSize = 20;

        for (let x = gridSize; x < this.canvas.width; x += gridSize) {
            for (let y = gridSize; y < this.canvas.height; y += gridSize) {
                const amplitude = this.getAmplitudeAt(x, y, Date.now());
                const intensity = Math.abs(amplitude) / 100;

                if (intensity > 0.1) {
                    // Color based on constructive (positive) vs destructive (negative) interference
                    const hue = amplitude > 0 ? 60 : 240; // Yellow for constructive, blue for destructive
                    this.ctx.fillStyle = `hsla(${hue}, 80%, 60%, ${intensity})`;

                    const radius = intensity * 8;
                    this.ctx.beginPath();
                    this.ctx.arc(x, y, radius, 0, 2 * Math.PI);
                    this.ctx.fill();
                }
            }
        }
    }

    /**
     * Draw background grid
     */
    drawGrid() {
        const gridSize = 40;
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        this.ctx.lineWidth = 1;

        // Vertical lines
        for (let x = 0; x <= this.canvas.width; x += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.canvas.height);
            this.ctx.stroke();
        }

        // Horizontal lines
        for (let y = 0; y <= this.canvas.height; y += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.canvas.width, y);
            this.ctx.stroke();
        }
    }

    /**
     * Create wave from mouse/touch interaction
     */
    createWaveFromInput(x, y, frequency) {
        return this.createWave({
            position: { x, y },
            frequency: frequency,
            amplitude: this.amplitude,
            color: FrequencyUtils.frequencyToColor(frequency),
            lifetime: 8.0 // Waves last 8 seconds
        });
    }

    /**
     * Get waves near a point (for interaction detection)
     */
    getWavesNear(x, y, radius = 50) {
        return this.waves.filter(wave => {
            const distance = Math.sqrt(
                (x - wave.position.x) ** 2 +
                (y - wave.position.y) ** 2
            );
            return distance <= radius;
        });
    }

    /**
     * Clear all waves
     */
    clearAllWaves() {
        this.waves = [];
        console.log('🗑️ All waves cleared');
    }

    /**
     * Get wave count
     */
    getWaveCount() {
        return this.waves.length;
    }

    /**
     * Set visual settings
     */
    setSettings(settings) {
        if (settings.showGrid !== undefined) this.showGrid = settings.showGrid;
        if (settings.showInterference !== undefined) this.showInterference = settings.showInterference;
        if (settings.lineWidth !== undefined) this.lineWidth = settings.lineWidth;
        if (settings.amplitude !== undefined) this.amplitude = settings.amplitude;
        if (settings.wavelength !== undefined) this.wavelength = settings.wavelength;
        if (settings.speed !== undefined) this.speed = settings.speed;

        console.log('🎛️ Wave physics settings updated');
    }
}

// Export for use in other modules
if (typeof window !== 'undefined') {
    window.WavePhysics = WavePhysics;
}
