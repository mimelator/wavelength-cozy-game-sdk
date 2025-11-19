/**
 * Frequency - Interaction Feedback System
 * Gentle haptic-like visual feedback and pleasant micro-interactions
 */

class InteractionFeedback {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');

        this.ripples = [];
        this.clickBursts = [];
        this.hoverEffects = [];

        // Feedback settings
        this.rippleSettings = {
            maxRadius: 100,
            duration: 2000,
            strokeWidth: 2
        };

        console.log('🎯 InteractionFeedback system initialized');
    }

    /**
     * Create ripple effect on click/touch
     */
    createRipple(x, y, color = 'rgba(100, 200, 255, 0.8)', size = 'normal') {
        const ripple = {
            x: x,
            y: y,
            radius: 0,
            maxRadius: size === 'large' ? 150 : size === 'small' ? 50 : 100,
            age: 0,
            duration: size === 'large' ? 3000 : size === 'small' ? 1000 : 2000,
            color: color,
            strokeWidth: size === 'large' ? 3 : size === 'small' ? 1 : 2,
            alpha: 1
        };

        this.ripples.push(ripple);
        return ripple;
    }

    /**
     * Create click burst effect
     */
    createClickBurst(x, y, frequency) {
        const color = FrequencyUtils.frequencyToColor(frequency);
        const numSparks = 8;

        for (let i = 0; i < numSparks; i++) {
            const angle = (i / numSparks) * Math.PI * 2;
            const speed = 50 + Math.random() * 100;
            const size = 3 + Math.random() * 5;

            const spark = {
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size: size,
                color: color,
                age: 0,
                maxAge: 1 + Math.random() * 0.5,
                alpha: 1,
                drag: 0.95
            };

            this.clickBursts.push(spark);
        }
    }

    /**
     * Create hover glow effect
     */
    createHoverGlow(x, y, intensity = 0.5) {
        const existing = this.hoverEffects.find(effect =>
            Math.abs(effect.x - x) < 50 && Math.abs(effect.y - y) < 50
        );

        if (existing) {
            existing.intensity = Math.min(1, existing.intensity + 0.1);
            existing.age = 0; // Reset age
        } else {
            const glow = {
                x: x,
                y: y,
                radius: 30,
                intensity: intensity,
                age: 0,
                maxAge: 2,
                color: `rgba(255, 255, 255, ${intensity * 0.3})`
            };

            this.hoverEffects.push(glow);
        }
    }

    /**
     * Update all feedback effects
     */
    update(deltaTime) {
        this.updateRipples(deltaTime);
        this.updateClickBursts(deltaTime);
        this.updateHoverEffects(deltaTime);
    }

    /**
     * Update ripple effects
     */
    updateRipples(deltaTime) {
        for (let i = this.ripples.length - 1; i >= 0; i--) {
            const ripple = this.ripples[i];
            ripple.age += deltaTime * 1000;

            const progress = ripple.age / ripple.duration;
            ripple.radius = progress * ripple.maxRadius;
            ripple.alpha = 1 - progress;

            // Remove completed ripples
            if (progress >= 1) {
                this.ripples.splice(i, 1);
            }
        }
    }

    /**
     * Update click burst effects
     */
    updateClickBursts(deltaTime) {
        for (let i = this.clickBursts.length - 1; i >= 0; i--) {
            const spark = this.clickBursts[i];
            spark.age += deltaTime;

            // Update position
            spark.x += spark.vx * deltaTime;
            spark.y += spark.vy * deltaTime;

            // Apply drag
            spark.vx *= spark.drag;
            spark.vy *= spark.drag;

            // Gravity effect
            spark.vy += 200 * deltaTime;

            // Fade out
            const progress = spark.age / spark.maxAge;
            spark.alpha = 1 - progress;

            // Remove completed sparks
            if (progress >= 1) {
                this.clickBursts.splice(i, 1);
            }
        }
    }

    /**
     * Update hover effects
     */
    updateHoverEffects(deltaTime) {
        for (let i = this.hoverEffects.length - 1; i >= 0; i--) {
            const glow = this.hoverEffects[i];
            glow.age += deltaTime;

            // Fade out over time
            const progress = glow.age / glow.maxAge;
            glow.intensity *= 0.95; // Gradual fade

            // Gentle pulsing
            glow.radius = 30 + Math.sin(glow.age * 4) * 5;

            // Remove faded glows
            if (glow.intensity < 0.1 || progress >= 1) {
                this.hoverEffects.splice(i, 1);
            }
        }
    }

    /**
     * Render all feedback effects
     */
    render() {
        this.renderRipples();
        this.renderClickBursts();
        this.renderHoverEffects();
    }

    /**
     * Render ripple effects
     */
    renderRipples() {
        this.ripples.forEach(ripple => {
            this.ctx.save();
            this.ctx.globalAlpha = ripple.alpha;
            this.ctx.strokeStyle = ripple.color;
            this.ctx.lineWidth = ripple.strokeWidth;

            // Main ripple
            this.ctx.beginPath();
            this.ctx.arc(ripple.x, ripple.y, ripple.radius, 0, Math.PI * 2);
            this.ctx.stroke();

            // Secondary ripple (slightly smaller, for depth)
            this.ctx.globalAlpha = ripple.alpha * 0.5;
            this.ctx.beginPath();
            this.ctx.arc(ripple.x, ripple.y, ripple.radius * 0.7, 0, Math.PI * 2);
            this.ctx.stroke();

            this.ctx.restore();
        });
    }

    /**
     * Render click burst effects
     */
    renderClickBursts() {
        this.clickBursts.forEach(spark => {
            this.ctx.save();
            this.ctx.globalAlpha = spark.alpha;
            this.ctx.fillStyle = spark.color;

            // Add glow effect
            this.ctx.shadowColor = spark.color;
            this.ctx.shadowBlur = 8;

            this.ctx.beginPath();
            this.ctx.arc(spark.x, spark.y, spark.size, 0, Math.PI * 2);
            this.ctx.fill();

            this.ctx.restore();
        });
    }

    /**
     * Render hover effects
     */
    renderHoverEffects() {
        this.hoverEffects.forEach(glow => {
            this.ctx.save();
            this.ctx.globalAlpha = glow.intensity * 0.3;

            // Create radial gradient
            const gradient = this.ctx.createRadialGradient(
                glow.x, glow.y, 0,
                glow.x, glow.y, glow.radius
            );
            gradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
            gradient.addColorStop(1, 'transparent');

            this.ctx.fillStyle = gradient;
            this.ctx.beginPath();
            this.ctx.arc(glow.x, glow.y, glow.radius, 0, Math.PI * 2);
            this.ctx.fill();

            this.ctx.restore();
        });
    }

    /**
     * Create frequency-specific feedback
     */
    createFrequencyFeedback(x, y, frequency, amplitude = 1.0) {
        const color = FrequencyUtils.frequencyToColor(frequency);

        // Create colored ripple
        this.createRipple(x, y, color, amplitude > 0.5 ? 'large' : 'normal');

        // Create click burst
        this.createClickBurst(x, y, frequency);

        // Add frequency-based visual elements
        this.createFrequencyIndicator(x, y, frequency, amplitude);
    }

    /**
     * Create frequency indicator
     */
    createFrequencyIndicator(x, y, frequency, amplitude) {
        // Create a visual indicator that shows the frequency
        const noteDisplay = this.getFrequencyNote(frequency);

        setTimeout(() => {
            this.drawFloatingText(x, y - 30, noteDisplay, frequency);
        }, 100);
    }

    /**
     * Get musical note from frequency
     */
    getFrequencyNote(frequency) {
        const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
        const A4 = 440;
        const C0 = A4 * Math.pow(2, -4.75);

        const h = Math.round(12 * Math.log2(frequency / C0));
        const octave = Math.floor(h / 12);
        const note = notes[h % 12];

        return `${note}${octave}`;
    }

    /**
     * Draw floating text
     */
    drawFloatingText(x, y, text, frequency) {
        const color = FrequencyUtils.frequencyToColor(frequency);

        this.ctx.save();
        this.ctx.fillStyle = color;
        this.ctx.font = '14px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';

        // Add text shadow
        this.ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        this.ctx.shadowBlur = 4;
        this.ctx.shadowOffsetX = 1;
        this.ctx.shadowOffsetY = 1;

        this.ctx.fillText(text, x, y);
        this.ctx.restore();

        // Animate text floating up
        let currentY = y;
        let alpha = 1;

        const animateText = () => {
            currentY -= 1;
            alpha -= 0.02;

            if (alpha > 0) {
                this.ctx.save();
                this.ctx.globalAlpha = alpha;
                this.ctx.fillStyle = color;
                this.ctx.font = '14px Arial';
                this.ctx.textAlign = 'center';
                this.ctx.textBaseline = 'middle';
                this.ctx.fillText(text, x, currentY);
                this.ctx.restore();

                requestAnimationFrame(animateText);
            }
        };

        requestAnimationFrame(animateText);
    }

    /**
     * Create success feedback (for pleasant interactions)
     */
    createSuccessFeedback(x, y) {
        // Green ripple
        this.createRipple(x, y, 'rgba(6, 214, 160, 0.8)', 'large');

        // Success sparkles
        for (let i = 0; i < 12; i++) {
            const angle = (i / 12) * Math.PI * 2;
            const distance = 40 + Math.random() * 30;
            const sparkX = x + Math.cos(angle) * distance;
            const sparkY = y + Math.sin(angle) * distance;

            this.createClickBurst(sparkX, sparkY, 220 + Math.random() * 440);
        }
    }

    /**
     * Clear all feedback effects
     */
    clear() {
        this.ripples = [];
        this.clickBursts = [];
        this.hoverEffects = [];
    }
}

// Export for use in other modules
if (typeof window !== 'undefined') {
    window.InteractionFeedback = InteractionFeedback;
}
