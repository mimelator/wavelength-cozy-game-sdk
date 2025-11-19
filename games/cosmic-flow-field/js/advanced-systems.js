// Advanced Performance Optimizations and Features
// Cosmic Flow Field - Additional Systems

class SpatialHashGrid {
    constructor(cellSize = 50) {
        this.cellSize = cellSize;
        this.grid = new Map();
    }

    clear() {
        this.grid.clear();
    }

    insert(particle, id) {
        const cell = this.getCell(particle.position.x, particle.position.y);
        const key = `${cell.x},${cell.y}`;

        if (!this.grid.has(key)) {
            this.grid.set(key, new Set());
        }
        this.grid.get(key).add(id);
    }

    getNearby(x, y, radius = 1) {
        const nearby = new Set();
        const centerCell = this.getCell(x, y);

        for (let dx = -radius; dx <= radius; dx++) {
            for (let dy = -radius; dy <= radius; dy++) {
                const key = `${centerCell.x + dx},${centerCell.y + dy}`;
                if (this.grid.has(key)) {
                    this.grid.get(key).forEach(id => nearby.add(id));
                }
            }
        }
        return nearby;
    }

    getCell(x, y) {
        return {
            x: Math.floor(x / this.cellSize),
            y: Math.floor(y / this.cellSize)
        };
    }
}

class ObjectPool {
    constructor(createFn, resetFn, initialSize = 100) {
        this.createFn = createFn;
        this.resetFn = resetFn;
        this.pool = [];

        // Pre-populate pool
        for (let i = 0; i < initialSize; i++) {
            this.pool.push(createFn());
        }
    }

    get() {
        if (this.pool.length > 0) {
            return this.pool.pop();
        }
        return this.createFn();
    }

    release(obj) {
        this.resetFn(obj);
        this.pool.push(obj);
    }

    getPoolSize() {
        return this.pool.length;
    }
}

class AdvancedParticleSystem {
    constructor() {
        this.spatialGrid = new SpatialHashGrid(100);
        this.particlePool = new ObjectPool(
            () => new Particle(0, 0),
            (particle) => {
                particle.age = 0;
                particle.energy = random(0.5, 1.0);
                particle.trail = [];
            }
        );

        this.activeParticles = new Map();
        this.nextId = 0;
        this.interactionDistance = 50;
        this.maxInteractions = 5;
    }

    addParticle(x, y) {
        const particle = this.particlePool.get();
        particle.position.set(x || random(width), y || random(height));
        particle.velocity.set(0, 0);
        particle.acceleration.set(0, 0);

        const id = this.nextId++;
        this.activeParticles.set(id, particle);
        return id;
    }

    removeParticle(id) {
        const particle = this.activeParticles.get(id);
        if (particle) {
            this.particlePool.release(particle);
            this.activeParticles.delete(id);
        }
    }

    update() {
        // Clear spatial grid
        this.spatialGrid.clear();

        // Insert all particles into spatial grid
        for (const [id, particle] of this.activeParticles) {
            this.spatialGrid.insert(particle, id);
        }

        // Update particles with spatial optimization
        const particlesToRemove = [];

        for (const [id, particle] of this.activeParticles) {
            particle.update();

            // Check for particle interactions (optional, performance intensive)
            if (qualityLevel > 0.8) {
                this.checkParticleInteractions(id, particle);
            }

            if (particle.isDead()) {
                particlesToRemove.push(id);
            }
        }

        // Remove dead particles
        for (const id of particlesToRemove) {
            this.removeParticle(id);
        }
    }

    checkParticleInteractions(id, particle) {
        const nearby = this.spatialGrid.getNearby(
            particle.position.x,
            particle.position.y,
            1
        );

        let interactions = 0;
        for (const nearbyId of nearby) {
            if (nearbyId === id || interactions >= this.maxInteractions) break;

            const otherParticle = this.activeParticles.get(nearbyId);
            if (!otherParticle) continue;

            const distance = p5.Vector.dist(particle.position, otherParticle.position);

            if (distance < this.interactionDistance && distance > 0) {
                // Subtle attraction/repulsion force
                const force = p5.Vector.sub(otherParticle.position, particle.position);
                force.normalize();
                force.mult(0.001 * (1 - distance / this.interactionDistance));

                particle.acceleration.add(force);
                interactions++;
            }
        }
    }

    display() {
        for (const particle of this.activeParticles.values()) {
            particle.display();
        }
    }

    getCount() {
        return this.activeParticles.size;
    }

    clear() {
        for (const id of this.activeParticles.keys()) {
            this.removeParticle(id);
        }
    }
}

class AdvancedFlowField {
    constructor(resolution, noiseScale) {
        this.resolution = resolution;
        this.noiseScale = noiseScale;
        this.timeScale = 0.001;
        this.field = [];
        this.cols = 0;
        this.rows = 0;
        this.octaves = 3;
        this.persistence = 0.5;
        this.lacunarity = 2.0;
    }

    initialize(w, h) {
        this.cols = Math.floor(w / this.resolution) + 1;
        this.rows = Math.floor(h / this.resolution) + 1;
        this.field = new Array(this.cols * this.rows);
    }

    update(time) {
        let xoff = 0;
        for (let x = 0; x < this.cols; x++) {
            let yoff = 0;
            for (let y = 0; y < this.rows; y++) {
                const index = x + y * this.cols;

                // Multi-octave noise for more complex patterns
                let noiseValue = 0;
                let amplitude = 1;
                let frequency = 1;

                for (let i = 0; i < this.octaves; i++) {
                    noiseValue += noise(
                        xoff * frequency,
                        yoff * frequency,
                        time * this.timeScale * frequency
                    ) * amplitude;

                    amplitude *= this.persistence;
                    frequency *= this.lacunarity;
                }

                const angle = noiseValue * TWO_PI * 2;
                const force = p5.Vector.fromAngle(angle);
                force.mult(CONFIG.flowField.strength);

                this.field[index] = force;
                yoff += this.noiseScale;
            }
            xoff += this.noiseScale;
        }
    }

    getForce(x, y) {
        const col = Math.floor(x / this.resolution);
        const row = Math.floor(y / this.resolution);
        const index = col + row * this.cols;

        if (index >= 0 && index < this.field.length) {
            return this.field[index].copy();
        }
        return createVector(0, 0);
    }

    // Visualize flow field (debug mode)
    display() {
        if (qualityLevel < 0.3) return; // Skip in low quality mode

        stroke(200, 50, 80, 50);
        strokeWeight(1);

        for (let x = 0; x < this.cols; x++) {
            for (let y = 0; y < this.rows; y++) {
                const index = x + y * this.cols;
                if (index >= this.field.length) continue;

                const force = this.field[index];
                const px = x * this.resolution;
                const py = y * this.resolution;

                push();
                translate(px + this.resolution / 2, py + this.resolution / 2);
                rotate(force.heading());
                line(0, 0, this.resolution * 0.3, 0);
                pop();
            }
        }
    }
}

class AudioAnalyzer {
    constructor() {
        this.audioContext = null;
        this.analyzer = null;
        this.dataArray = null;
        this.frequencyData = null;
        this.isInitialized = false;
        this.bassLevel = 0;
        this.midLevel = 0;
        this.trebleLevel = 0;
    }

    async initialize() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.analyzer = this.audioContext.createAnalyser();
            this.analyzer.fftSize = 256;

            const bufferLength = this.analyzer.frequencyBinCount;
            this.dataArray = new Uint8Array(bufferLength);
            this.frequencyData = new Uint8Array(bufferLength);

            // Connect to microphone (optional)
            if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                const source = this.audioContext.createMediaStreamSource(stream);
                source.connect(this.analyzer);
            }

            this.isInitialized = true;
        } catch (error) {
            console.log('Audio analysis not available:', error.message);
        }
    }

    update() {
        if (!this.isInitialized || !this.analyzer) return;

        this.analyzer.getByteFrequencyData(this.frequencyData);

        // Calculate frequency bands
        const bassEnd = Math.floor(this.frequencyData.length * 0.1);
        const midEnd = Math.floor(this.frequencyData.length * 0.4);

        this.bassLevel = this.getAverageLevel(0, bassEnd);
        this.midLevel = this.getAverageLevel(bassEnd, midEnd);
        this.trebleLevel = this.getAverageLevel(midEnd, this.frequencyData.length);
    }

    getAverageLevel(start, end) {
        let sum = 0;
        for (let i = start; i < end; i++) {
            sum += this.frequencyData[i];
        }
        return sum / (end - start) / 255; // Normalize to 0-1
    }

    getBass() { return this.bassLevel; }
    getMid() { return this.midLevel; }
    getTreble() { return this.trebleLevel; }

    getOverallLevel() {
        return (this.bassLevel + this.midLevel + this.trebleLevel) / 3;
    }
}

class EffectsProcessor {
    constructor() {
        this.bloomEnabled = true;
        this.motionBlurEnabled = true;
        this.trailsEnabled = true;
        this.glowEnabled = true;
    }

    applyBloom(graphics) {
        if (!this.bloomEnabled || qualityLevel < 0.6) return graphics;

        // Simple bloom effect using blend modes
        graphics.drawingContext.globalCompositeOperation = 'screen';
        graphics.tint(255, 100);
        graphics.image(graphics, 2, 2);
        graphics.image(graphics, -2, -2);
        graphics.drawingContext.globalCompositeOperation = 'source-over';
        graphics.noTint();

        return graphics;
    }

    applyMotionBlur(alpha = 0.95) {
        if (!this.motionBlurEnabled || qualityLevel < 0.5) return;

        fill(240, 100, 5, 255 * (1 - alpha));
        rect(0, 0, width, height);
    }

    createTrail(particle, trailLength = 10) {
        if (!this.trailsEnabled || qualityLevel < 0.4) return;

        if (particle.trail.length > 1) {
            strokeWeight(particle.size * 0.5);

            for (let i = 1; i < particle.trail.length; i++) {
                const alpha = map(i, 0, particle.trail.length - 1, 0, 255);
                stroke(particle.hue, 80, 70, alpha * 0.3);

                const current = particle.trail[i];
                const previous = particle.trail[i - 1];
                line(previous.x, previous.y, current.x, current.y);
            }
        }
    }

    applyGlow(x, y, size, hue, intensity = 1.0) {
        if (!this.glowEnabled || qualityLevel < 0.7) return;

        push();
        translate(x, y);

        // Multiple glow layers for depth
        for (let r = size * 4; r > 0; r -= size * 0.5) {
            fill(hue, 60, 90, (255 * intensity * 0.1 * (size * 4 - r)) / (size * 4));
            noStroke();
            ellipse(0, 0, r);
        }

        pop();
    }
}

// Export classes for use in main script
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        SpatialHashGrid,
        ObjectPool,
        AdvancedParticleSystem,
        AdvancedFlowField,
        AudioAnalyzer,
        EffectsProcessor
    };
}

// Performance monitoring utilities
class PerformanceProfiler {
    constructor() {
        this.markers = new Map();
        this.measurements = new Map();
        this.enabled = false;
    }

    enable() {
        this.enabled = true;
    }

    disable() {
        this.enabled = false;
    }

    mark(name) {
        if (!this.enabled) return;
        this.markers.set(name, performance.now());
    }

    measure(name, startMark, endMark = null) {
        if (!this.enabled) return;

        const startTime = this.markers.get(startMark);
        const endTime = endMark ? this.markers.get(endMark) : performance.now();

        if (startTime !== undefined) {
            const duration = endTime - startTime;

            if (!this.measurements.has(name)) {
                this.measurements.set(name, []);
            }

            const measurements = this.measurements.get(name);
            measurements.push(duration);

            // Keep only last 100 measurements
            if (measurements.length > 100) {
                measurements.shift();
            }
        }
    }

    getAverageMeasurement(name) {
        const measurements = this.measurements.get(name);
        if (!measurements || measurements.length === 0) return 0;

        const sum = measurements.reduce((a, b) => a + b, 0);
        return sum / measurements.length;
    }

    logProfile() {
        if (!this.enabled) return;

        console.group('Performance Profile');
        for (const [name, measurements] of this.measurements) {
            const avg = this.getAverageMeasurement(name);
            const latest = measurements[measurements.length - 1];
            console.log(`${name}: avg=${avg.toFixed(2)}ms, latest=${latest.toFixed(2)}ms`);
        }
        console.groupEnd();
    }
}

// Memory usage monitor
class MemoryMonitor {
    constructor() {
        this.measurements = [];
        this.maxMeasurements = 100;
    }

    update() {
        if (performance.memory) {
            const measurement = {
                timestamp: Date.now(),
                usedJSHeapSize: performance.memory.usedJSHeapSize,
                totalJSHeapSize: performance.memory.totalJSHeapSize,
                jsHeapSizeLimit: performance.memory.jsHeapSizeLimit
            };

            this.measurements.push(measurement);

            if (this.measurements.length > this.maxMeasurements) {
                this.measurements.shift();
            }
        }
    }

    getLatestMeasurement() {
        return this.measurements[this.measurements.length - 1];
    }

    getMemoryUsagePercentage() {
        const latest = this.getLatestMeasurement();
        if (!latest) return 0;

        return (latest.usedJSHeapSize / latest.jsHeapSizeLimit) * 100;
    }

    isMemoryPressureHigh() {
        return this.getMemoryUsagePercentage() > 80;
    }

    logMemoryUsage() {
        const latest = this.getLatestMeasurement();
        if (latest) {
            const usedMB = (latest.usedJSHeapSize / 1048576).toFixed(2);
            const totalMB = (latest.totalJSHeapSize / 1048576).toFixed(2);
            const limitMB = (latest.jsHeapSizeLimit / 1048576).toFixed(2);

            console.log(`Memory: ${usedMB}MB used / ${totalMB}MB total / ${limitMB}MB limit`);
        }
    }
}

// Initialize global performance tools
const profiler = new PerformanceProfiler();
const memoryMonitor = new MemoryMonitor();

// Enable profiling in development mode
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    profiler.enable();

    // Log performance data every 10 seconds
    setInterval(() => {
        profiler.logProfile();
        memoryMonitor.logMemoryUsage();
    }, 10000);
}
