/**
 * Frequency - Utility Helpers
 * Mathematical and utility functions for wave calculations
 */

/**
 * 2D Vector class for position and wave calculations
 */
class Vector2D {
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }

    // Add another vector
    add(other) {
        return new Vector2D(this.x + other.x, this.y + other.y);
    }

    // Subtract another vector
    subtract(other) {
        return new Vector2D(this.x - other.x, this.y - other.y);
    }

    // Multiply by scalar
    multiply(scalar) {
        return new Vector2D(this.x * scalar, this.y * scalar);
    }

    // Get magnitude (length)
    magnitude() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    // Get distance to another vector
    distanceTo(other) {
        return this.subtract(other).magnitude();
    }

    // Normalize vector (unit length)
    normalize() {
        const mag = this.magnitude();
        return mag === 0 ? new Vector2D(0, 0) : new Vector2D(this.x / mag, this.y / mag);
    }

    // Create random vector
    static random(magnitude = 1) {
        const angle = Math.random() * Math.PI * 2;
        return new Vector2D(
            Math.cos(angle) * magnitude,
            Math.sin(angle) * magnitude
        );
    }
}

/**
 * Audio/Frequency utility functions
 */
class FrequencyUtils {
    // Convert frequency to wavelength (for visual representation)
    static frequencyToWavelength(frequency, speed = 343) { // speed of sound: 343 m/s
        return speed / frequency;
    }

    /**
     * Convert frequency to color (enhanced mapping)
     */
    static frequencyToColor(frequency) {
        // Enhanced color mapping with multiple octaves
        const baseFreq = 55; // A1
        const octave = Math.log2(frequency / baseFreq);
        const noteInOctave = (octave % 1) * 12;

        // Map to hue (0-360) with musical color wheel
        const hue = (noteInOctave * 30) % 360;

        // Vary saturation and lightness based on frequency range
        const saturation = 60 + (frequency % 100);
        const lightness = 50 + Math.sin(octave) * 20;

        return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
    }

    /**
     * Create harmonic color palette from base frequency
     */
    static getHarmonicColors(baseFreq, count = 5) {
        const colors = [];
        for (let i = 1; i <= count; i++) {
            const harmFreq = baseFreq * i;
            colors.push(this.frequencyToColor(harmFreq));
        }
        return colors;
    }

    /**
     * Get complementary color for frequency
     */
    static getComplementaryColor(frequency) {
        const baseColor = this.frequencyToColor(frequency);
        // Extract HSL values and shift hue by 180 degrees
        const hslMatch = baseColor.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
        if (hslMatch) {
            const hue = (parseInt(hslMatch[1]) + 180) % 360;
            return `hsl(${hue}, ${hslMatch[2]}%, ${hslMatch[3]}%)`;
        }
        return baseColor;
    }

    /**
     * Create gradient between two frequencies
     */
    static createFrequencyGradient(ctx, x1, y1, x2, y2, freq1, freq2) {
        const gradient = ctx.createLinearGradient(x1, y1, x2, y2);
        gradient.addColorStop(0, this.frequencyToColor(freq1));
        gradient.addColorStop(1, this.frequencyToColor(freq2));
        return gradient;
    }

    /**
     * Get warm or cool color temperature based on frequency
     */
    static getColorTemperature(frequency) {
        // Lower frequencies = warmer colors, higher = cooler
        const temp = Math.log(frequency / 100) * 60;
        const hue = Math.max(0, Math.min(60, temp)); // 0 (red) to 60 (yellow)
        return `hsl(${hue}, 80%, 65%)`;
    }

    /**
     * Create aurora-like color for ambient mode
     */
    static getAuroraColor(time = Date.now()) {
        const t = time * 0.001;
        const hue1 = (Math.sin(t * 0.3) * 60 + 180) % 360; // Blue-green range
        const hue2 = (Math.sin(t * 0.5) * 40 + 280) % 360; // Purple-pink range
        const blend = (Math.sin(t * 0.4) + 1) * 0.5;

        const finalHue = hue1 * blend + hue2 * (1 - blend);
        const saturation = 70 + Math.sin(t * 0.6) * 20;
        const lightness = 60 + Math.sin(t * 0.8) * 15;

        return `hsl(${finalHue}, ${saturation}%, ${lightness}%)`;
    }

    // Calculate harmonic frequencies
    static getHarmonics(fundamentalFreq, count = 5) {
        const harmonics = [];
        for (let i = 1; i <= count; i++) {
            harmonics.push(fundamentalFreq * i);
        }
        return harmonics;
    }

    // Calculate beat frequency (when two frequencies interfere)
    static calculateBeatFrequency(freq1, freq2) {
        return Math.abs(freq1 - freq2);
    }

    // Generate musical note from frequency
    static frequencyToNote(frequency) {
        const A4 = 440;
        const C0 = A4 * Math.pow(2, -4.75);
        const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

        if (frequency <= 0) return 'N/A';

        const h = Math.round(12 * Math.log2(frequency / C0));
        const octave = Math.floor(h / 12);
        const n = h % 12;

        return noteNames[n] + octave;
    }
}

/**
 * Canvas utility functions
 */
class CanvasUtils {
    // Set up high DPI canvas
    static setupHighDPICanvas(canvas, ctx, width, height) {
        const devicePixelRatio = window.devicePixelRatio || 1;

        canvas.width = width * devicePixelRatio;
        canvas.height = height * devicePixelRatio;
        canvas.style.width = width + 'px';
        canvas.style.height = height + 'px';

        ctx.scale(devicePixelRatio, devicePixelRatio);

        return devicePixelRatio;
    }

    // Draw sine wave
    static drawSineWave(ctx, x, y, width, amplitude, frequency, phase, color) {
        ctx.save();
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.beginPath();

        const resolution = 2; // pixels per point
        for (let i = 0; i <= width; i += resolution) {
            const waveX = x + i;
            const waveY = y + Math.sin((i / width * frequency * Math.PI * 2) + phase) * amplitude;

            if (i === 0) {
                ctx.moveTo(waveX, waveY);
            } else {
                ctx.lineTo(waveX, waveY);
            }
        }

        ctx.stroke();
        ctx.restore();
    }

    // Draw radial wave (like ripples in water)
    static drawRadialWave(ctx, centerX, centerY, radius, amplitude, frequency, phase, color) {
        ctx.save();
        ctx.strokeStyle = color;
        ctx.lineWidth = 1.5;
        ctx.beginPath();

        const points = 64; // Number of points around the circle
        for (let i = 0; i <= points; i++) {
            const angle = (i / points) * Math.PI * 2;
            const waveRadius = radius + Math.sin(angle * frequency + phase) * amplitude;
            const x = centerX + Math.cos(angle) * waveRadius;
            const y = centerY + Math.sin(angle) * waveRadius;

            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }

        ctx.closePath();
        ctx.stroke();
        ctx.restore();
    }

    // Create gradient based on frequency
    static createFrequencyGradient(ctx, x1, y1, x2, y2, frequency) {
        const gradient = ctx.createLinearGradient(x1, y1, x2, y2);
        const color1 = FrequencyUtils.frequencyToColor(frequency, 0.8);
        const color2 = FrequencyUtils.frequencyToColor(frequency * 1.5, 0.4);
        const color3 = FrequencyUtils.frequencyToColor(frequency * 0.5, 0.6);

        gradient.addColorStop(0, color1);
        gradient.addColorStop(0.5, color2);
        gradient.addColorStop(1, color3);

        return gradient;
    }
}

/**
 * Animation and easing functions
 */
class AnimationUtils {
    // Smooth step function (0 to 1)
    static smoothStep(t) {
        return t * t * (3 - 2 * t);
    }

    // Ease in/out cubic
    static easeInOutCubic(t) {
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    // Oscillate between 0 and 1
    static oscillate(time, period) {
        return (Math.sin(time * Math.PI * 2 / period) + 1) * 0.5;
    }

    // Linear interpolation
    static lerp(a, b, t) {
        return a + (b - a) * t;
    }

    // Map value from one range to another
    static mapRange(value, fromMin, fromMax, toMin, toMax) {
        const normalized = (value - fromMin) / (fromMax - fromMin);
        return toMin + normalized * (toMax - toMin);
    }
}

/**
 * Random utility functions
 */
class RandomUtils {
    // Random float between min and max
    static between(min, max) {
        return min + Math.random() * (max - min);
    }

    // Random integer between min and max (inclusive)
    static intBetween(min, max) {
        return Math.floor(min + Math.random() * (max - min + 1));
    }

    // Random choice from array
    static choice(array) {
        return array[Math.floor(Math.random() * array.length)];
    }

    // Random boolean with probability
    static chance(probability = 0.5) {
        return Math.random() < probability;
    }
}

// Export utilities for use in other modules
if (typeof window !== 'undefined') {
    window.Vector2D = Vector2D;
    window.FrequencyUtils = FrequencyUtils;
    window.CanvasUtils = CanvasUtils;
    window.AnimationUtils = AnimationUtils;
    window.RandomUtils = RandomUtils;
}
