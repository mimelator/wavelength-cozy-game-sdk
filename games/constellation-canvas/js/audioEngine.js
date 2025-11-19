/**
 * Celestial Audio Engine - Creates ethereal musical tones for stars and constellations
 */
class CelestialAudio {
    constructor() {
        this.audioContext = null;
        this.masterGain = null;
        this.isEnabled = true;
        this.activeTones = new Map();
        this.reverb = null;

        this.init();
    }

    async init() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.masterGain = this.audioContext.createGain();
            this.masterGain.gain.value = 0.3;

            // Create ethereal reverb
            await this.createReverb();

            this.masterGain.connect(this.audioContext.destination);

            console.log('🎵 Celestial Audio Engine initialized');
        } catch (error) {
            console.warn('Audio initialization failed:', error);
            this.isEnabled = false;
        }
    }

    async createReverb() {
        const convolver = this.audioContext.createConvolver();
        const length = this.audioContext.sampleRate * 3; // 3 second reverb
        const impulse = this.audioContext.createBuffer(2, length, this.audioContext.sampleRate);

        for (let channel = 0; channel < 2; channel++) {
            const channelData = impulse.getChannelData(channel);
            for (let i = 0; i < length; i++) {
                const decay = Math.pow(1 - i / length, 2);
                channelData[i] = (Math.random() * 2 - 1) * decay * 0.1;
            }
        }

        convolver.buffer = impulse;
        this.reverb = convolver;
        this.reverb.connect(this.masterGain);
    }

    getStarFrequency(x, y, canvasWidth, canvasHeight, color) {
        // Map position to celestial frequencies
        const baseFrequencies = {
            white: 523.25,  // C5 - Pure and bright
            blue: 349.23,   // F4 - Deep and resonant
            gold: 659.25,   // E5 - Warm and radiant
            red: 220.00,    // A3 - Rich and grounding
            purple: 440.00, // A4 - Mystical and centered
            green: 293.66   // D4 - Natural and harmonious
        };

        const baseFreq = baseFrequencies[color] || baseFrequencies.white;

        // Add positional variation (±20%)
        const xVariation = (x / canvasWidth - 0.5) * 0.4; // -20% to +20%
        const yVariation = (1 - y / canvasHeight) * 0.3;  // Higher stars = higher pitch

        return baseFreq * (1 + xVariation + yVariation);
    }

    playStarTone(starId, frequency, color, volume = 0.3, duration = 2000) {
        if (!this.isEnabled || !this.audioContext) return;

        // Ensure audio context is running
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }

        // Stop existing tone for this star
        this.stopStarTone(starId);

        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        const filter = this.audioContext.createBiquadFilter();

        // Configure oscillator based on star color
        const waveforms = {
            white: 'sine',
            blue: 'triangle',
            gold: 'sine',
            red: 'square',
            purple: 'triangle',
            green: 'sine'
        };

        oscillator.type = waveforms[color] || 'sine';
        oscillator.frequency.value = frequency;

        // Add subtle vibrato for ethereal effect
        const lfo = this.audioContext.createOscillator();
        const lfoGain = this.audioContext.createGain();
        lfo.frequency.value = 3 + Math.random() * 2; // 3-5 Hz vibrato
        lfoGain.gain.value = frequency * 0.01; // 1% vibrato depth

        lfo.connect(lfoGain);
        lfoGain.connect(oscillator.frequency);

        // Configure filter for color-specific timbre
        filter.type = 'lowpass';
        filter.frequency.value = frequency * (2 + Math.random());
        filter.Q.value = 1;

        // Envelope with gentle attack and release
        gainNode.gain.value = 0;
        gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(volume, this.audioContext.currentTime + 0.5);
        gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration / 1000);

        // Connect the chain
        oscillator.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(this.reverb);

        // Start everything
        oscillator.start();
        lfo.start();

        // Schedule cleanup
        oscillator.stop(this.audioContext.currentTime + duration / 1000);

        // Store reference
        this.activeTones.set(starId, {
            oscillator,
            lfo,
            gainNode,
            startTime: Date.now()
        });

        // Auto cleanup
        setTimeout(() => {
            this.activeTones.delete(starId);
        }, duration);
    }

    stopStarTone(starId) {
        const tone = this.activeTones.get(starId);
        if (tone) {
            try {
                tone.gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.1);
                tone.oscillator.stop(this.audioContext.currentTime + 0.1);
                tone.lfo.stop(this.audioContext.currentTime + 0.1);
            } catch (e) {
                // Oscillator might already be stopped
            }
            this.activeTones.delete(starId);
        }
    }

    playConstellationHarmony(stars) {
        if (!this.isEnabled || stars.length < 2) return;

        // Create a gentle chord from connected stars
        const chordId = 'constellation_' + Date.now();
        const fundamentalFreq = 130.81; // C3

        stars.forEach((star, index) => {
            const interval = [1, 1.25, 1.5, 2, 2.5, 3][index % 6]; // Nice intervals
            const frequency = fundamentalFreq * interval;

            this.playStarTone(
                chordId + '_' + index,
                frequency,
                star.color,
                0.15, // Quieter for harmony
                3000  // Longer duration
            );
        });
    }

    playMeteorSound() {
        if (!this.isEnabled || !this.audioContext) return;

        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        const filter = this.audioContext.createBiquadFilter();

        // Meteor whoosh sound
        oscillator.type = 'sawtooth';
        oscillator.frequency.value = 800;
        oscillator.frequency.exponentialRampToValueAtTime(200, this.audioContext.currentTime + 1.5);

        filter.type = 'lowpass';
        filter.frequency.value = 2000;
        filter.frequency.exponentialRampToValueAtTime(400, this.audioContext.currentTime + 1.5);

        gainNode.gain.value = 0;
        gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.2, this.audioContext.currentTime + 0.1);
        gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 1.5);

        oscillator.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(this.reverb);

        oscillator.start();
        oscillator.stop(this.audioContext.currentTime + 1.5);
    }

    setEnabled(enabled) {
        this.isEnabled = enabled;
        if (!enabled) {
            // Stop all active tones
            this.activeTones.forEach((tone, id) => this.stopStarTone(id));
        }
    }

    toggle() {
        this.setEnabled(!this.isEnabled);
        return this.isEnabled;
    }
}

// Create global audio instance
window.celestialAudio = new CelestialAudio();
