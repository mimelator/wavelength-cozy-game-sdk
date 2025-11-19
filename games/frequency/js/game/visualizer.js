/**
 * Frequency - Sound Visualization System
 * Visual effects that dance with the audio frequencies
 */

class SoundVisualizer {
    constructor(canvas, audioManager) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.audioManager = audioManager;

        // Visualization settings
        this.showSpectrum = true;
        this.showWaveform = true;
        this.showAmplitudeBars = true;

        // Visual elements
        this.spectrumBars = [];
        this.waveformPoints = [];
        this.amplitudeBubbles = [];

        // Colors
        this.spectrumColors = [
            '#ff6b9d', '#ffc93c', '#06d6a0', '#118ab2', '#073b4c'
        ];

        console.log('🎨 SoundVisualizer initialized');
    }

    /**
     * Update visualization (called each frame)
     */
    update(deltaTime) {
        if (!this.audioManager.isInitialized) return;

        // Update spectrum bars based on active frequencies
        this.updateSpectrum();

        // Update waveform visualization
        this.updateWaveform();

        // Update amplitude bubbles
        this.updateAmplitudeBubbles(deltaTime);
    }

    /**
     * Update frequency spectrum visualization
     */
    updateSpectrum() {
        const activeOscillators = this.audioManager.oscillators;
        this.spectrumBars = [];

        let index = 0;
        activeOscillators.forEach((oscInfo, oscId) => {
            const frequency = oscInfo.frequency;
            const amplitude = oscInfo.gainNode.gain.value;

            // Map frequency to position (logarithmic scale)
            const minFreq = 20;
            const maxFreq = 2000;
            const normalizedFreq = (Math.log(frequency) - Math.log(minFreq)) /
                                  (Math.log(maxFreq) - Math.log(minFreq));

            const x = normalizedFreq * this.canvas.width;
            const height = amplitude * 100;
            const color = FrequencyUtils.frequencyToColor(frequency);

            this.spectrumBars.push({
                x: x,
                height: height,
                color: color,
                frequency: frequency,
                amplitude: amplitude,
                age: oscInfo.startTime ? Date.now() - (oscInfo.startTime * 1000) : 0
            });

            index++;
        });
    }

    /**
     * Update waveform visualization
     */
    updateWaveform() {
        this.waveformPoints = [];
        const numPoints = 64;
        const time = Date.now() * 0.001;

        // Create composite waveform from all active frequencies
        for (let i = 0; i < numPoints; i++) {
            const x = (i / numPoints) * this.canvas.width;
            let y = this.canvas.height / 2;
            let totalAmplitude = 0;

            // Sum all active frequencies
            this.audioManager.oscillators.forEach((oscInfo) => {
                const frequency = oscInfo.frequency;
                const amplitude = oscInfo.gainNode.gain.value;
                const phase = time * frequency * 0.01;
                const waveValue = Math.sin(phase + (i * 0.1));

                totalAmplitude += amplitude * waveValue * 50;
            });

            y += totalAmplitude;

            this.waveformPoints.push({
                x: x,
                y: y,
                amplitude: Math.abs(totalAmplitude)
            });
        }
    }

    /**
     * Update amplitude bubbles
     */
    updateAmplitudeBubbles(deltaTime) {
        // Update existing bubbles
        for (let i = this.amplitudeBubbles.length - 1; i >= 0; i--) {
            const bubble = this.amplitudeBubbles[i];
            bubble.age += deltaTime;
            bubble.y -= bubble.speed * deltaTime;
            bubble.alpha = Math.max(0, 1 - (bubble.age / bubble.maxAge));
            bubble.size = bubble.baseSize * (1 + bubble.age * 0.5);

            // Remove old bubbles
            if (bubble.alpha <= 0) {
                this.amplitudeBubbles.splice(i, 1);
            }
        }

        // Create new bubbles for active frequencies
        this.audioManager.oscillators.forEach((oscInfo, oscId) => {
            const frequency = oscInfo.frequency;
            const amplitude = oscInfo.gainNode.gain.value;

            // Create bubble occasionally based on amplitude
            if (Math.random() < amplitude * 0.02) { // 2% chance per frame when at full volume
                this.createAmplitudeBubble(frequency, amplitude);
            }
        });
    }

    /**
     * Create amplitude bubble
     */
    createAmplitudeBubble(frequency, amplitude) {
        const bubble = {
            x: Math.random() * this.canvas.width,
            y: this.canvas.height,
            baseSize: 5 + amplitude * 20,
            size: 5 + amplitude * 20,
            speed: 30 + amplitude * 50,
            color: FrequencyUtils.frequencyToColor(frequency),
            alpha: 0.7,
            age: 0,
            maxAge: 3 + Math.random() * 2,
            frequency: frequency
        };

        this.amplitudeBubbles.push(bubble);
    }

    /**
     * Render all visualizations
     */
    render() {
        if (this.showSpectrum) {
            this.renderSpectrum();
        }

        if (this.showWaveform) {
            this.renderWaveform();
        }

        if (this.showAmplitudeBars) {
            this.renderAmplitudeBubbles();
        }
    }

    /**
     * Render frequency spectrum bars
     */
    renderSpectrum() {
        this.spectrumBars.forEach(bar => {
            // Create gradient for each bar
            const gradient = this.ctx.createLinearGradient(0, this.canvas.height, 0, this.canvas.height - bar.height);
            gradient.addColorStop(0, bar.color);
            gradient.addColorStop(1, 'transparent');

            this.ctx.fillStyle = gradient;
            this.ctx.globalAlpha = 0.8;

            // Draw bar
            const barWidth = 8;
            this.ctx.fillRect(bar.x - barWidth/2, this.canvas.height - bar.height, barWidth, bar.height);

            // Add glow effect
            this.ctx.shadowColor = bar.color;
            this.ctx.shadowBlur = 10;
            this.ctx.fillRect(bar.x - barWidth/2, this.canvas.height - bar.height, barWidth, bar.height);
            this.ctx.shadowBlur = 0;
        });

        this.ctx.globalAlpha = 1;
    }

    /**
     * Render composite waveform
     */
    renderWaveform() {
        if (this.waveformPoints.length < 2) return;

        this.ctx.strokeStyle = 'rgba(100, 200, 255, 0.6)';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();

        // Draw smooth curve through points
        this.ctx.moveTo(this.waveformPoints[0].x, this.waveformPoints[0].y);

        for (let i = 1; i < this.waveformPoints.length; i++) {
            const point = this.waveformPoints[i];
            const prevPoint = this.waveformPoints[i - 1];

            // Use quadratic curves for smoothness
            const cpx = (prevPoint.x + point.x) / 2;
            const cpy = (prevPoint.y + point.y) / 2;
            this.ctx.quadraticCurveTo(prevPoint.x, prevPoint.y, cpx, cpy);
        }

        this.ctx.stroke();

        // Add glow effect
        this.ctx.shadowColor = 'rgba(100, 200, 255, 0.8)';
        this.ctx.shadowBlur = 5;
        this.ctx.stroke();
        this.ctx.shadowBlur = 0;
    }

    /**
     * Render amplitude bubbles
     */
    renderAmplitudeBubbles() {
        this.amplitudeBubbles.forEach(bubble => {
            this.ctx.save();
            this.ctx.globalAlpha = bubble.alpha;

            // Create radial gradient
            const gradient = this.ctx.createRadialGradient(
                bubble.x, bubble.y, 0,
                bubble.x, bubble.y, bubble.size
            );
            gradient.addColorStop(0, bubble.color);
            gradient.addColorStop(1, 'transparent');

            this.ctx.fillStyle = gradient;
            this.ctx.beginPath();
            this.ctx.arc(bubble.x, bubble.y, bubble.size, 0, Math.PI * 2);
            this.ctx.fill();

            this.ctx.restore();
        });
    }

    /**
     * Create frequency visualization burst
     */
    createFrequencyBurst(x, y, frequency, intensity = 1.0) {
        const numRays = 8;
        const baseColor = FrequencyUtils.frequencyToColor(frequency);

        for (let i = 0; i < numRays; i++) {
            const angle = (i / numRays) * Math.PI * 2;
            const length = 30 + intensity * 40;

            setTimeout(() => {
                this.drawFrequencyRay(x, y, angle, length, baseColor);
            }, i * 50);
        }
    }

    /**
     * Draw frequency ray
     */
    drawFrequencyRay(x, y, angle, length, color) {
        const endX = x + Math.cos(angle) * length;
        const endY = y + Math.sin(angle) * length;

        // Create gradient ray
        const gradient = this.ctx.createLinearGradient(x, y, endX, endY);
        gradient.addColorStop(0, color);
        gradient.addColorStop(1, 'transparent');

        this.ctx.strokeStyle = gradient;
        this.ctx.lineWidth = 3;
        this.ctx.lineCap = 'round';

        this.ctx.beginPath();
        this.ctx.moveTo(x, y);
        this.ctx.lineTo(endX, endY);
        this.ctx.stroke();
    }

    /**
     * Create harmonic visualization
     */
    visualizeHarmonic(fundamentalFreq, harmonics) {
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const baseRadius = 50;

        harmonics.forEach((harmonic, index) => {
            const radius = baseRadius + (index * 25);
            const color = FrequencyUtils.frequencyToColor(harmonic.frequency);

            // Create harmonic ring
            this.ctx.strokeStyle = color;
            this.ctx.lineWidth = 2;
            this.ctx.globalAlpha = 0.6;

            this.ctx.beginPath();
            this.ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
            this.ctx.stroke();

            // Add rotation effect
            const time = Date.now() * 0.001;
            const rotationSpeed = 0.5 + (index * 0.2);
            const angle = time * rotationSpeed;

            const dotX = centerX + Math.cos(angle) * radius;
            const dotY = centerY + Math.sin(angle) * radius;

            this.ctx.fillStyle = color;
            this.ctx.beginPath();
            this.ctx.arc(dotX, dotY, 4, 0, Math.PI * 2);
            this.ctx.fill();
        });

        this.ctx.globalAlpha = 1;
    }

    /**
     * Toggle visualization components
     */
    toggleSpectrum() {
        this.showSpectrum = !this.showSpectrum;
    }

    toggleWaveform() {
        this.showWaveform = !this.showWaveform;
    }

    toggleAmplitudeBars() {
        this.showAmplitudeBars = !this.showAmplitudeBars;
    }

    /**
     * Clear all visualizations
     */
    clear() {
        this.spectrumBars = [];
        this.waveformPoints = [];
        this.amplitudeBubbles = [];
    }
}

// Export for use in other modules
if (typeof window !== 'undefined') {
    window.SoundVisualizer = SoundVisualizer;
}
