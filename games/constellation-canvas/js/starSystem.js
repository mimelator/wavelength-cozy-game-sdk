/**
 * Star System - Manages individual stars, their properties, and visual effects
 */
class Star {
    constructor(x, y, color, canvas) {
        this.id = Date.now() + Math.random();
        this.x = x;
        this.y = y;
        this.originalX = x;
        this.originalY = y;
        this.color = color;
        this.canvas = canvas;

        // Base positions for constellation rotation (set when star joins a constellation)
        this.baseX = null;
        this.baseY = null;

        // Visual properties
        this.size = 3 + Math.random() * 4; // 3-7px radius
        this.brightness = 0.7 + Math.random() * 0.3;
        this.twinklePhase = Math.random() * Math.PI * 2;
        this.twinkleSpeed = 0.02 + Math.random() * 0.03;

        // Animation properties
        this.age = 0;
        this.maxAge = 100 + Math.random() * 50;
        this.pulsePhase = Math.random() * Math.PI * 2;
        this.floatAmplitude = 0.5 + Math.random() * 1.5;

        // Connections
        this.connections = new Set();

        // Calculate color values
        this.colorData = this.getColorData();

        // Audio frequency
        this.frequency = window.celestialAudio.getStarFrequency(
            x, y, canvas.width, canvas.height, color
        );
    }

    getColorData() {
        const colors = {
            white: { r: 255, g: 255, b: 255, glow: 'rgba(255,255,255,' },
            blue: { r: 59, g: 130, b: 246, glow: 'rgba(59,130,246,' },
            gold: { r: 251, g: 191, b: 36, glow: 'rgba(251,191,36,' },
            red: { r: 239, g: 68, b: 68, glow: 'rgba(239,68,68,' },
            purple: { r: 107, g: 70, b: 193, glow: 'rgba(107,70,193,' },
            green: { r: 16, g: 185, b: 129, glow: 'rgba(16,185,129,' }
        };
        return colors[this.color] || colors.white;
    }

    update(deltaTime) {
        this.age += deltaTime;

        // If star is part of a constellation rotation, originalX/Y will be updated by the constellation system
        // We use originalX/Y as the base position and add small individual motion on top

        // Gentle individual floating motion around the base position
        const floatOffsetX = Math.sin(this.age * 0.001) * this.floatAmplitude;
        const floatOffsetY = Math.cos(this.age * 0.0008) * this.floatAmplitude * 0.5;

        // Apply individual motion relative to the base position (originalX/Y)
        this.x = this.originalX + floatOffsetX;
        this.y = this.originalY + floatOffsetY;

        // Twinkling effect
        this.twinklePhase += this.twinkleSpeed;
        if (this.twinklePhase > Math.PI * 2) {
            this.twinklePhase -= Math.PI * 2;
        }

        // Pulse phase for connected stars (faster pulse for more connections)
        const pulseSpeedMultiplier = 1 + (this.connections.size * 0.1);
        this.pulsePhase += 0.02 * pulseSpeedMultiplier;
        if (this.pulsePhase > Math.PI * 2) {
            this.pulsePhase -= Math.PI * 2;
        }
    }

    draw(ctx) {
        ctx.save();

        const twinkleBrightness = this.brightness * (0.7 + 0.3 * Math.sin(this.twinklePhase));
        const connectionCount = this.connections.size;
        const pulseMultiplier = connectionCount > 0 ?
            1 + 0.3 * Math.sin(this.pulsePhase) : 1;

        // Enhanced size based on connection count (rotational energy)
        const energyMultiplier = 1 + (connectionCount * 0.1);
        const currentSize = this.size * pulseMultiplier * energyMultiplier;
        const alpha = Math.min(this.age / 30, 1) * twinkleBrightness;

        // Draw rotation energy trails for connected stars
        if (connectionCount >= 2) {
            const trailCount = Math.min(connectionCount, 8);
            const trailRadius = currentSize * (2 + connectionCount * 0.5);

            for (let i = 0; i < trailCount; i++) {
                const angle = (this.age * 0.001 + (i / trailCount) * Math.PI * 2);
                const trailX = this.x + Math.cos(angle) * trailRadius;
                const trailY = this.y + Math.sin(angle) * trailRadius;

                const trailGradient = ctx.createRadialGradient(
                    trailX, trailY, 0,
                    trailX, trailY, 3
                );
                trailGradient.addColorStop(0, this.colorData.glow + (alpha * 0.3) + ')');
                trailGradient.addColorStop(1, this.colorData.glow + '0)');

                ctx.fillStyle = trailGradient;
                ctx.beginPath();
                ctx.arc(trailX, trailY, 3, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        // Draw outer glow (enhanced for connected stars)
        const glowMultiplier = 1 + (connectionCount * 0.3);
        const gradient = ctx.createRadialGradient(
            this.x, this.y, 0,
            this.x, this.y, currentSize * 3 * glowMultiplier
        );
        gradient.addColorStop(0, this.colorData.glow + (alpha * 0.8) + ')');
        gradient.addColorStop(0.3, this.colorData.glow + (alpha * 0.4) + ')');
        gradient.addColorStop(1, this.colorData.glow + '0)');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.x, this.y, currentSize * 3 * glowMultiplier, 0, Math.PI * 2);
        ctx.fill();

        // Draw inner glow
        const innerGradient = ctx.createRadialGradient(
            this.x, this.y, 0,
            this.x, this.y, currentSize * 1.5
        );
        innerGradient.addColorStop(0, this.colorData.glow + alpha + ')');
        innerGradient.addColorStop(0.5, this.colorData.glow + (alpha * 0.6) + ')');
        innerGradient.addColorStop(1, this.colorData.glow + '0)');

        ctx.fillStyle = innerGradient;
        ctx.beginPath();
        ctx.arc(this.x, this.y, currentSize * 1.5, 0, Math.PI * 2);
        ctx.fill();

        // Draw core star
        ctx.fillStyle = `rgba(${this.colorData.r}, ${this.colorData.g}, ${this.colorData.b}, ${alpha})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, currentSize, 0, Math.PI * 2);
        ctx.fill();

        // Draw star points for larger stars
        if (currentSize > 4) {
            this.drawStarPoints(ctx, alpha, currentSize);
        }

        ctx.restore();
    }

    drawStarPoints(ctx, alpha, size) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.age * 0.0005); // Slow rotation

        ctx.strokeStyle = `rgba(${this.colorData.r}, ${this.colorData.g}, ${this.colorData.b}, ${alpha * 0.8})`;
        ctx.lineWidth = 0.5;

        // Draw four-pointed star
        const pointLength = size * 1.5;

        ctx.beginPath();
        // Vertical line
        ctx.moveTo(0, -pointLength);
        ctx.lineTo(0, pointLength);
        // Horizontal line
        ctx.moveTo(-pointLength, 0);
        ctx.lineTo(pointLength, 0);
        ctx.stroke();

        ctx.restore();
    }

    containsPoint(x, y) {
        const dx = x - this.x;
        const dy = y - this.y;
        return Math.sqrt(dx * dx + dy * dy) <= this.size * 2;
    }

    addConnection(otherId) {
        this.connections.add(otherId);
    }

    removeConnection(otherId) {
        this.connections.delete(otherId);
    }

    playTone(duration = 2000) {
        window.celestialAudio.playStarTone(
            this.id,
            this.frequency,
            this.color,
            0.3,
            duration
        );
    }

    stopTone() {
        window.celestialAudio.stopStarTone(this.id);
    }
}

/**
 * Stardust Particle - For magical trail effects
 */
class StardustParticle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.originalX = x;
        this.originalY = y;
        this.color = color;

        this.vx = (Math.random() - 0.5) * 2;
        this.vy = (Math.random() - 0.5) * 2;
        this.size = 1 + Math.random() * 2;
        this.life = 1.0;
        this.decay = 0.02 + Math.random() * 0.02;
        this.twinkle = Math.random() * Math.PI * 2;
    }

    update(deltaTime) {
        this.x += this.vx;
        this.y += this.vy;
        this.vx *= 0.98; // Gentle drag
        this.vy *= 0.98;

        this.life -= this.decay;
        this.twinkle += 0.1;

        return this.life > 0;
    }

    draw(ctx) {
        const alpha = this.life * (0.5 + 0.5 * Math.sin(this.twinkle));
        const starColor = {
            white: 'rgba(255,255,255,',
            blue: 'rgba(59,130,246,',
            gold: 'rgba(251,191,36,',
            red: 'rgba(239,68,68,',
            purple: 'rgba(107,70,193,',
            green: 'rgba(16,185,129,'
        };

        ctx.fillStyle = (starColor[this.color] || starColor.white) + alpha + ')';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * this.life, 0, Math.PI * 2);
        ctx.fill();
    }
}
