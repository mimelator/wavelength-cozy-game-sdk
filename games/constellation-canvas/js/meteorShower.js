/**
 * Meteor Shower System - Creates magical shooting stars across the canvas
 */
class Meteor {
    constructor(canvasWidth, canvasHeight) {
        // Random starting position (usually from edges)
        const side = Math.floor(Math.random() * 4);
        switch (side) {
            case 0: // Top
                this.x = Math.random() * canvasWidth;
                this.y = -50;
                this.vx = (Math.random() - 0.5) * 4;
                this.vy = 2 + Math.random() * 4;
                break;
            case 1: // Right
                this.x = canvasWidth + 50;
                this.y = Math.random() * canvasHeight;
                this.vx = -(2 + Math.random() * 4);
                this.vy = (Math.random() - 0.5) * 4;
                break;
            case 2: // Bottom
                this.x = Math.random() * canvasWidth;
                this.y = canvasHeight + 50;
                this.vx = (Math.random() - 0.5) * 4;
                this.vy = -(2 + Math.random() * 4);
                break;
            case 3: // Left
                this.x = -50;
                this.y = Math.random() * canvasHeight;
                this.vx = 2 + Math.random() * 4;
                this.vy = (Math.random() - 0.5) * 4;
                break;
        }

        this.size = 2 + Math.random() * 3;
        this.brightness = 0.8 + Math.random() * 0.2;
        this.life = 1.0;
        this.decay = 0.008 + Math.random() * 0.012;

        // Trail properties
        this.trail = [];
        this.maxTrailLength = 15 + Math.random() * 10;

        // Color (most meteors are white/blue, some are colorful)
        const colors = ['white', 'blue', 'gold', 'purple'];
        this.color = Math.random() < 0.8 ? 'white' : colors[Math.floor(Math.random() * colors.length)];
        this.colorData = this.getColorData();

        // Sparkle trail particles
        this.sparkles = [];
    }

    getColorData() {
        const colors = {
            white: { r: 255, g: 255, b: 255 },
            blue: { r: 59, g: 130, b: 246 },
            gold: { r: 251, g: 191, b: 36 },
            purple: { r: 107, g: 70, b: 193 }
        };
        return colors[this.color] || colors.white;
    }

    update(deltaTime) {
        // Store current position in trail
        this.trail.push({ x: this.x, y: this.y, life: this.life });
        if (this.trail.length > this.maxTrailLength) {
            this.trail.shift();
        }

        // Update position
        this.x += this.vx;
        this.y += this.vy;

        // Add slight acceleration due to gravity
        this.vy += 0.05;

        // Decrease life
        this.life -= this.decay;

        // Create sparkle particles occasionally
        if (Math.random() < 0.3) {
            this.sparkles.push({
                x: this.x + (Math.random() - 0.5) * 10,
                y: this.y + (Math.random() - 0.5) * 10,
                vx: (Math.random() - 0.5) * 2,
                vy: (Math.random() - 0.5) * 2,
                size: 0.5 + Math.random() * 1.5,
                life: 1.0,
                decay: 0.02 + Math.random() * 0.03
            });
        }

        // Update sparkles
        this.sparkles = this.sparkles.filter(sparkle => {
            sparkle.x += sparkle.vx;
            sparkle.y += sparkle.vy;
            sparkle.vx *= 0.95;
            sparkle.vy *= 0.95;
            sparkle.life -= sparkle.decay;
            return sparkle.life > 0;
        });

        return this.life > 0;
    }

    draw(ctx) {
        ctx.save();

        // Draw trail
        this.drawTrail(ctx);

        // Draw main meteor
        this.drawMeteor(ctx);

        // Draw sparkles
        this.drawSparkles(ctx);

        ctx.restore();
    }

    drawTrail(ctx) {
        if (this.trail.length < 2) return;

        for (let i = 1; i < this.trail.length; i++) {
            const segment = this.trail[i];
            const prevSegment = this.trail[i - 1];

            const trailAlpha = (i / this.trail.length) * segment.life * this.brightness * 0.6;
            const trailWidth = (i / this.trail.length) * this.size * 0.8;

            // Create gradient for trail segment
            const gradient = ctx.createLinearGradient(
                prevSegment.x, prevSegment.y,
                segment.x, segment.y
            );
            gradient.addColorStop(0, `rgba(${this.colorData.r}, ${this.colorData.g}, ${this.colorData.b}, 0)`);
            gradient.addColorStop(1, `rgba(${this.colorData.r}, ${this.colorData.g}, ${this.colorData.b}, ${trailAlpha})`);

            ctx.strokeStyle = gradient;
            ctx.lineWidth = trailWidth;
            ctx.lineCap = 'round';

            ctx.beginPath();
            ctx.moveTo(prevSegment.x, prevSegment.y);
            ctx.lineTo(segment.x, segment.y);
            ctx.stroke();
        }
    }

    drawMeteor(ctx) {
        const alpha = this.life * this.brightness;

        // Outer glow
        const glowGradient = ctx.createRadialGradient(
            this.x, this.y, 0,
            this.x, this.y, this.size * 4
        );
        glowGradient.addColorStop(0, `rgba(${this.colorData.r}, ${this.colorData.g}, ${this.colorData.b}, ${alpha})`);
        glowGradient.addColorStop(0.3, `rgba(${this.colorData.r}, ${this.colorData.g}, ${this.colorData.b}, ${alpha * 0.5})`);
        glowGradient.addColorStop(1, `rgba(${this.colorData.r}, ${this.colorData.g}, ${this.colorData.b}, 0)`);

        ctx.fillStyle = glowGradient;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * 4, 0, Math.PI * 2);
        ctx.fill();

        // Core meteor
        ctx.fillStyle = `rgba(${this.colorData.r}, ${this.colorData.g}, ${this.colorData.b}, ${alpha})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();

        // Bright center
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.8})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * 0.5, 0, Math.PI * 2);
        ctx.fill();
    }

    drawSparkles(ctx) {
        this.sparkles.forEach(sparkle => {
            const alpha = sparkle.life * 0.8;
            ctx.fillStyle = `rgba(${this.colorData.r}, ${this.colorData.g}, ${this.colorData.b}, ${alpha})`;
            ctx.beginPath();
            ctx.arc(sparkle.x, sparkle.y, sparkle.size * sparkle.life, 0, Math.PI * 2);
            ctx.fill();
        });
    }
}

/**
 * Meteor Shower Manager
 */
class MeteorShower {
    constructor(canvas) {
        this.canvas = canvas;
        this.meteors = [];
        this.isActive = false;
        this.meteorSpawnTimer = 0;
        this.meteorSpawnInterval = 200 + Math.random() * 400; // 200-600ms between meteors
        this.showerDuration = 0;
        this.maxShowerDuration = 8000; // 8 seconds
        this.maxMeteors = 12;
    }

    start() {
        if (this.isActive) return;

        this.isActive = true;
        this.showerDuration = 0;
        this.meteorSpawnTimer = 0;
        this.meteors = [];

        // Play meteor sound
        window.celestialAudio.playMeteorSound();

        console.log('☄️ Meteor shower started!');
    }

    stop() {
        this.isActive = false;
        this.meteors = [];
        console.log('☄️ Meteor shower ended');
    }

    update(deltaTime) {
        if (!this.isActive) return;

        // Update shower duration
        this.showerDuration += deltaTime;
        if (this.showerDuration >= this.maxShowerDuration) {
            this.isActive = false;
            return;
        }

        // Spawn new meteors
        this.meteorSpawnTimer += deltaTime;
        if (this.meteorSpawnTimer >= this.meteorSpawnInterval && this.meteors.length < this.maxMeteors) {
            this.meteors.push(new Meteor(this.canvas.width, this.canvas.height));
            this.meteorSpawnTimer = 0;
            this.meteorSpawnInterval = 100 + Math.random() * 300; // Vary spawn rate
        }

        // Update existing meteors
        this.meteors = this.meteors.filter(meteor => meteor.update(deltaTime));
    }

    draw(ctx) {
        this.meteors.forEach(meteor => meteor.draw(ctx));
    }

    createSingleMeteor() {
        if (this.meteors.length < this.maxMeteors) {
            this.meteors.push(new Meteor(this.canvas.width, this.canvas.height));
            window.celestialAudio.playMeteorSound();
        }
    }
}
