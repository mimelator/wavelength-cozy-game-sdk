/**
 * Frequency - Audio System
 * Web Audio API for real-time frequency generation and harmonic synthesis
 */

class AudioManager {
    constructor() {
        this.audioContext = null;
        this.masterGain = null;
        this.oscillators = new Map(); // Track active oscillators
        this.isInitialized = false;
        this.volume = 0.5;
        this.maxOscillators = 16; // Limit for performance

        // Audio settings
        this.fadeTime = 0.1; // Seconds for smooth fading
        this.harmonicVolume = 0.3; // Volume for harmonic tones

        console.log('🎵 AudioManager initialized (requires user interaction to start)');
    }

    /**
     * Initialize audio context (must be called after user interaction)
     */
    async initialize() {
        if (this.isInitialized) return true;

        try {
            // Create audio context
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();

            // Create master gain node for volume control
            this.masterGain = this.audioContext.createGain();
            this.masterGain.connect(this.audioContext.destination);
            this.masterGain.gain.setValueAtTime(this.volume, this.audioContext.currentTime);

            // Resume context if suspended (required by some browsers)
            if (this.audioContext.state === 'suspended') {
                await this.audioContext.resume();
            }

            this.isInitialized = true;
            console.log('🎵 Audio context initialized successfully');
            return true;
        } catch (error) {
            console.warn('❌ Failed to initialize audio:', error);
            return false;
        }
    }

    /**
     * Create a new frequency oscillator
     */
    createFrequency(frequency, waveform = 'sine', duration = null) {
        if (!this.isInitialized) return null;

        // Limit number of active oscillators
        if (this.oscillators.size >= this.maxOscillators) {
            this.cleanupOldOscillators();
        }

        try {
            // Create oscillator
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();

            // Set frequency and waveform
            oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
            oscillator.type = waveform;

            // Connect: oscillator -> gain -> master gain -> destination
            oscillator.connect(gainNode);
            gainNode.connect(this.masterGain);

            // Set initial volume (start from 0 for smooth fade-in)
            gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(
                this.harmonicVolume * this.volume,
                this.audioContext.currentTime + this.fadeTime
            );

            // Start the oscillator
            oscillator.start();

            // Create oscillator info object
            const oscInfo = {
                oscillator,
                gainNode,
                frequency,
                startTime: this.audioContext.currentTime,
                duration
            };

            // Store oscillator
            const oscId = `osc_${Date.now()}_${Math.random()}`;
            this.oscillators.set(oscId, oscInfo);

            // Auto-stop after duration if specified
            if (duration) {
                setTimeout(() => {
                    this.stopFrequency(oscId);
                }, duration * 1000);
            }

            // Cleanup when oscillator ends
            oscillator.onended = () => {
                this.oscillators.delete(oscId);
            };

            console.log(`🎵 Created frequency: ${frequency}Hz (${waveform})`);
            return oscId;

        } catch (error) {
            console.warn('❌ Failed to create frequency:', error);
            return null;
        }
    }

    /**
     * Stop a specific frequency
     */
    stopFrequency(oscId) {
        const oscInfo = this.oscillators.get(oscId);
        if (!oscInfo) return;

        try {
            // Fade out smoothly
            const now = this.audioContext.currentTime;
            oscInfo.gainNode.gain.cancelScheduledValues(now);
            oscInfo.gainNode.gain.setValueAtTime(oscInfo.gainNode.gain.value, now);
            oscInfo.gainNode.gain.linearRampToValueAtTime(0, now + this.fadeTime);

            // Stop oscillator after fade
            oscInfo.oscillator.stop(now + this.fadeTime);

            console.log(`🔇 Stopped frequency: ${oscInfo.frequency}Hz`);
        } catch (error) {
            console.warn('❌ Error stopping frequency:', error);
        }

        this.oscillators.delete(oscId);
    }

    /**
     * Create a harmonic series (fundamental + harmonics)
     */
    createHarmonic(fundamentalFreq, harmonicCount = 3, duration = 2.0) {
        const harmonics = [];

        for (let i = 1; i <= harmonicCount; i++) {
            const harmFreq = fundamentalFreq * i;
            const volume = 1.0 / i; // Harmonics get quieter

            // Create oscillator with decreasing volume for higher harmonics
            const oscId = this.createFrequency(harmFreq, 'sine', duration);
            if (oscId) {
                const oscInfo = this.oscillators.get(oscId);
                if (oscInfo) {
                    // Adjust volume for this harmonic
                    const now = this.audioContext.currentTime;
                    oscInfo.gainNode.gain.setValueAtTime(0, now);
                    oscInfo.gainNode.gain.linearRampToValueAtTime(
                        this.harmonicVolume * volume * this.volume,
                        now + this.fadeTime
                    );
                }
                harmonics.push(oscId);
            }
        }

        console.log(`🎼 Created harmonic series: ${fundamentalFreq}Hz with ${harmonics.length} harmonics`);
        return harmonics;
    }

    /**
     * Create interference between two frequencies (beat frequency)
     */
    createBeatFrequency(freq1, freq2, duration = 3.0) {
        const beatFreq = Math.abs(freq1 - freq2);

        // Create both frequencies
        const osc1 = this.createFrequency(freq1, 'sine', duration);
        const osc2 = this.createFrequency(freq2, 'sine', duration);

        console.log(`🌊 Created beat frequency: ${freq1}Hz + ${freq2}Hz = ${beatFreq}Hz beat`);
        return { osc1, osc2, beatFreq };
    }

    /**
     * Create a chord from multiple frequencies
     */
    createChord(frequencies, duration = 4.0) {
        const chord = [];

        frequencies.forEach(freq => {
            const oscId = this.createFrequency(freq, 'sine', duration);
            if (oscId) {
                chord.push(oscId);
            }
        });

        console.log(`🎵 Created chord with ${chord.length} notes:`, frequencies);
        return chord;
    }

    /**
     * Set master volume (0.0 to 1.0)
     */
    setVolume(volume) {
        this.volume = Math.max(0, Math.min(1, volume));

        if (this.masterGain) {
            this.masterGain.gain.setValueAtTime(
                this.volume,
                this.audioContext.currentTime
            );
        }

        console.log(`🔊 Volume set to: ${Math.round(this.volume * 100)}%`);
    }

    /**
     * Get current volume
     */
    getVolume() {
        return this.volume;
    }

    /**
     * Stop all active frequencies
     */
    stopAllFrequencies() {
        const oscIds = Array.from(this.oscillators.keys());
        oscIds.forEach(oscId => this.stopFrequency(oscId));
        console.log('🔇 All frequencies stopped');
    }

    /**
     * Clean up old oscillators (remove finished ones)
     */
    cleanupOldOscillators() {
        const now = this.audioContext.currentTime;
        const toRemove = [];

        this.oscillators.forEach((oscInfo, oscId) => {
            // Remove oscillators that have been running for more than 10 seconds
            if (now - oscInfo.startTime > 10) {
                toRemove.push(oscId);
            }
        });

        toRemove.forEach(oscId => this.stopFrequency(oscId));

        if (toRemove.length > 0) {
            console.log(`🧹 Cleaned up ${toRemove.length} old oscillators`);
        }
    }

    /**
     * Get active oscillator count
     */
    getActiveCount() {
        return this.oscillators.size;
    }

    /**
     * Generate random pleasant frequency
     */
    getRandomFrequency() {
        // Use pentatonic scale frequencies for pleasant sounds
        const pentatonicFreqs = [
            130.81, 146.83, 164.81, 196.00, 220.00, // C3 pentatonic
            261.63, 293.66, 329.63, 392.00, 440.00, // C4 pentatonic
            523.25, 587.33, 659.25, 783.99, 880.00  // C5 pentatonic
        ];

        return RandomUtils.choice(pentatonicFreqs);
    }

    /**
     * Create ambient drone (continuous background tone)
     */
    createAmbientDrone(baseFreq = 55, duration = null) {
        // Create a low-frequency drone with subtle harmonics
        const drone = this.createFrequency(baseFreq, 'sawtooth', duration);
        const harmonic1 = this.createFrequency(baseFreq * 1.5, 'sine', duration);
        const harmonic2 = this.createFrequency(baseFreq * 2, 'sine', duration);

        // Make drone quieter
        if (drone) {
            const droneInfo = this.oscillators.get(drone);
            if (droneInfo) {
                const now = this.audioContext.currentTime;
                droneInfo.gainNode.gain.setValueAtTime(0, now);
                droneInfo.gainNode.gain.linearRampToValueAtTime(
                    0.1 * this.volume,
                    now + this.fadeTime
                );
            }
        }

        console.log(`🎵 Created ambient drone at ${baseFreq}Hz`);
        return { drone, harmonic1, harmonic2 };
    }
}

// Export for use in other modules
if (typeof window !== 'undefined') {
    window.AudioManager = AudioManager;
}
