/**
 * Frequency - Harmonics System
 * Harmonic relationships, resonance, and wave interaction mechanics
 */

class HarmonicsEngine {
    constructor(audioManager, wavePhysics) {
        this.audioManager = audioManager;
        this.wavePhysics = wavePhysics;

        // Harmonic relationships
        this.activeHarmonics = new Map(); // frequency -> harmonic series
        this.resonances = [];
        this.harmonicThreshold = 1.1; // How close frequencies need to be for harmonics

        // Musical scales and intervals
        this.musicalRatios = {
            unison: 1.0,
            octave: 2.0,
            perfectFifth: 1.5,
            perfectFourth: 1.333,
            majorThird: 1.25,
            minorThird: 1.2,
            majorSecond: 1.125,
            minorSecond: 1.067
        };

        // Chord templates
        this.chordTemplates = {
            major: [1.0, 1.25, 1.5], // Root, Major third, Perfect fifth
            minor: [1.0, 1.2, 1.5],  // Root, Minor third, Perfect fifth
            seventh: [1.0, 1.25, 1.5, 1.75],
            suspended: [1.0, 1.333, 1.5],
            diminished: [1.0, 1.2, 1.414]
        };

        console.log('🎼 HarmonicsEngine initialized');
    }

    /**
     * Create harmonic series from fundamental frequency
     */
    createHarmonicSeries(fundamentalFreq, harmonicCount = 4, duration = 3.0) {
        const harmonics = {
            fundamental: fundamentalFreq,
            harmonics: [],
            audioIds: [],
            waveIds: [],
            createdAt: Date.now()
        };

        // Generate harmonics (multiples of fundamental)
        for (let n = 1; n <= harmonicCount; n++) {
            const harmFreq = fundamentalFreq * n;
            const amplitude = 1.0 / n; // Higher harmonics are quieter

            // Create audio harmonic
            const audioId = this.audioManager.createFrequency(
                harmFreq,
                'sine',
                duration
            );

            // Adjust volume for this harmonic
            if (audioId) {
                const oscInfo = this.audioManager.oscillators.get(audioId);
                if (oscInfo) {
                    const now = this.audioManager.audioContext.currentTime;
                    oscInfo.gainNode.gain.setValueAtTime(0, now);
                    oscInfo.gainNode.gain.linearRampToValueAtTime(
                        this.audioManager.harmonicVolume * amplitude * this.audioManager.volume,
                        now + this.audioManager.fadeTime
                    );
                }
                harmonics.audioIds.push(audioId);
            }

            // Create visual wave
            const waveId = this.wavePhysics.createWave({
                frequency: harmFreq,
                amplitude: 40 * amplitude,
                position: {
                    x: Math.random() * this.wavePhysics.canvas.width,
                    y: Math.random() * this.wavePhysics.canvas.height
                },
                color: FrequencyUtils.frequencyToColor(harmFreq),
                lifetime: duration
            });

            if (waveId !== null) {
                harmonics.waveIds.push(waveId);
            }

            harmonics.harmonics.push({
                frequency: harmFreq,
                harmonic: n,
                amplitude: amplitude,
                audioId: audioId,
                waveId: waveId
            });
        }

        this.activeHarmonics.set(fundamentalFreq, harmonics);
        console.log(`🎼 Created harmonic series: ${fundamentalFreq}Hz with ${harmonicCount} harmonics`);
        return harmonics;
    }

    /**
     * Create chord from template
     */
    createChord(rootFreq, chordType = 'major', duration = 4.0) {
        const template = this.chordTemplates[chordType];
        if (!template) {
            console.warn(`❌ Unknown chord type: ${chordType}`);
            return null;
        }

        const chord = {
            root: rootFreq,
            type: chordType,
            frequencies: [],
            audioIds: [],
            waveIds: [],
            createdAt: Date.now()
        };

        // Generate chord tones
        template.forEach((ratio, index) => {
            const freq = rootFreq * ratio;

            // Create audio
            const audioId = this.audioManager.createFrequency(freq, 'sine', duration);
            if (audioId) {
                chord.audioIds.push(audioId);
            }

            // Create visual wave at different positions
            const angle = (index * 2 * Math.PI) / template.length;
            const radius = 100;
            const centerX = this.wavePhysics.canvas.width / 2;
            const centerY = this.wavePhysics.canvas.height / 2;

            const waveId = this.wavePhysics.createWave({
                frequency: freq,
                position: {
                    x: centerX + Math.cos(angle) * radius,
                    y: centerY + Math.sin(angle) * radius
                },
                color: FrequencyUtils.frequencyToColor(freq),
                lifetime: duration,
                amplitude: 50
            });

            if (waveId !== null) {
                chord.waveIds.push(waveId);
            }

            chord.frequencies.push(freq);
        });

        console.log(`🎵 Created ${chordType} chord: ${chord.frequencies.map(f => f.toFixed(1)).join(', ')} Hz`);
        return chord;
    }

    /**
     * Check for resonance between frequencies
     */
    checkResonance(freq1, freq2) {
        // Calculate frequency ratio
        const ratio = freq2 / freq1;

        // Check against musical intervals
        for (const [intervalName, intervalRatio] of Object.entries(this.musicalRatios)) {
            if (Math.abs(ratio - intervalRatio) < 0.05 ||
                Math.abs(ratio - (1.0 / intervalRatio)) < 0.05) {
                return {
                    interval: intervalName,
                    ratio: ratio,
                    strength: 1.0 - Math.abs(ratio - intervalRatio)
                };
            }
        }

        // Check for harmonic relationships
        const harmonicRatio = Math.round(ratio);
        if (Math.abs(ratio - harmonicRatio) < 0.1 && harmonicRatio <= 8) {
            return {
                interval: `harmonic_${harmonicRatio}`,
                ratio: ratio,
                strength: 1.0 - Math.abs(ratio - harmonicRatio)
            };
        }

        return null;
    }

    /**
     * Create resonance effect between two frequencies
     */
    createResonance(freq1, freq2, duration = 2.0) {
        const resonance = this.checkResonance(freq1, freq2);
        if (!resonance) return null;

        // Create beat frequency if frequencies are close
        const beatFreq = Math.abs(freq1 - freq2);
        if (beatFreq < 10 && beatFreq > 0.5) {
            const beat = this.audioManager.createBeatFrequency(freq1, freq2, duration);

            // Visual representation of beats
            const waveId = this.wavePhysics.createWave({
                frequency: beatFreq,
                position: {
                    x: this.wavePhysics.canvas.width / 2,
                    y: this.wavePhysics.canvas.height / 2
                },
                color: `hsl(${(freq1 + freq2) / 10 % 360}, 70%, 60%)`,
                amplitude: 30,
                type: 'triangle',
                lifetime: duration
            });

            this.resonances.push({
                freq1, freq2, beatFreq, resonance,
                audioIds: [beat.osc1, beat.osc2],
                waveIds: [waveId],
                createdAt: Date.now()
            });

            console.log(`🌊 Created resonance: ${resonance.interval} (${beatFreq.toFixed(2)}Hz beat)`);
            return { beat, resonance, waveId };
        }

        return { resonance };
    }

    /**
     * Generate pleasant frequency combinations
     */
    generateHarmoniousFrequency(baseFreq) {
        const intervals = Object.values(this.musicalRatios);
        const randomInterval = RandomUtils.choice(intervals);
        return baseFreq * randomInterval;
    }

    /**
     * Create ambient harmonic texture
     */
    createAmbientTexture(baseFreq = 110, complexity = 3, duration = 8.0) {
        const texture = {
            base: baseFreq,
            layers: [],
            audioIds: [],
            waveIds: []
        };

        // Create base drone
        const droneId = this.audioManager.createAmbientDrone(baseFreq, duration);
        if (droneId.drone) {
            texture.audioIds.push(droneId.drone, droneId.harmonic1, droneId.harmonic2);
        }

        // Add harmonic layers
        for (let i = 0; i < complexity; i++) {
            const interval = RandomUtils.choice(Object.values(this.musicalRatios));
            const layerFreq = baseFreq * interval * (0.5 + Math.random() * 0.5);

            // Subtle harmonic layer
            const audioId = this.audioManager.createFrequency(layerFreq, 'sine', duration);
            if (audioId) {
                const oscInfo = this.audioManager.oscillators.get(audioId);
                if (oscInfo) {
                    // Very quiet harmonic layers
                    const now = this.audioManager.audioContext.currentTime;
                    oscInfo.gainNode.gain.setValueAtTime(0, now);
                    oscInfo.gainNode.gain.linearRampToValueAtTime(
                        0.05 * this.audioManager.volume,
                        now + 2.0 // Slow fade in
                    );
                }
                texture.audioIds.push(audioId);
            }

            // Floating visual waves
            const waveId = this.wavePhysics.createWave({
                frequency: layerFreq,
                position: {
                    x: Math.random() * this.wavePhysics.canvas.width,
                    y: Math.random() * this.wavePhysics.canvas.height
                },
                direction: {
                    x: (Math.random() - 0.5) * 0.2,
                    y: (Math.random() - 0.5) * 0.2
                },
                amplitude: 20 + Math.random() * 20,
                speed: 0.5 + Math.random() * 0.5,
                color: FrequencyUtils.frequencyToColor(layerFreq),
                lifetime: duration
            });

            if (waveId !== null) {
                texture.waveIds.push(waveId);
            }

            texture.layers.push({ frequency: layerFreq, interval, audioId, waveId });
        }

        console.log(`🎵 Created ambient texture: ${baseFreq}Hz with ${complexity} harmonic layers`);
        return texture;
    }

    /**
     * Clean up expired harmonics and resonances
     */
    cleanup() {
        const now = Date.now();
        const maxAge = 10000; // 10 seconds

        // Clean up active harmonics
        for (const [freq, harmonic] of this.activeHarmonics.entries()) {
            if (now - harmonic.createdAt > maxAge) {
                this.activeHarmonics.delete(freq);
            }
        }

        // Clean up resonances
        this.resonances = this.resonances.filter(resonance => {
            return now - resonance.createdAt < maxAge;
        });
    }

    /**
     * Get current harmonic activity
     */
    getHarmonicActivity() {
        return {
            activeHarmonics: this.activeHarmonics.size,
            resonances: this.resonances.length,
            totalWaves: this.wavePhysics.getWaveCount(),
            totalAudio: this.audioManager.getActiveCount()
        };
    }

    /**
     * Create frequency from musical note
     */
    noteToFrequency(note, octave = 4) {
        // Note frequencies (C4 = 261.63Hz)
        const noteFreqs = {
            'C': 261.63, 'C#': 277.18, 'Db': 277.18,
            'D': 293.66, 'D#': 311.13, 'Eb': 311.13,
            'E': 329.63,
            'F': 349.23, 'F#': 369.99, 'Gb': 369.99,
            'G': 392.00, 'G#': 415.30, 'Ab': 415.30,
            'A': 440.00, 'A#': 466.16, 'Bb': 466.16,
            'B': 493.88
        };

        const baseFreq = noteFreqs[note.toUpperCase()];
        if (!baseFreq) return null;

        // Adjust for octave (each octave doubles/halves frequency)
        return baseFreq * Math.pow(2, octave - 4);
    }

    /**
     * Create scale progression
     */
    createScale(root = 'C', octave = 4, scaleType = 'major', duration = 1.0) {
        const scaleIntervals = {
            major: [0, 2, 4, 5, 7, 9, 11],
            minor: [0, 2, 3, 5, 7, 8, 10],
            pentatonic: [0, 2, 4, 7, 9],
            blues: [0, 3, 5, 6, 7, 10]
        };

        const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
        const rootIndex = notes.indexOf(root.toUpperCase());
        const intervals = scaleIntervals[scaleType] || scaleIntervals.major;

        const scale = [];

        intervals.forEach((interval, index) => {
            const noteIndex = (rootIndex + interval) % 12;
            const note = notes[noteIndex];
            const freq = this.noteToFrequency(note, octave);

            if (freq) {
                // Stagger the timing
                setTimeout(() => {
                    const audioId = this.audioManager.createFrequency(freq, 'sine', duration);
                    const waveId = this.wavePhysics.createWaveFromInput(
                        100 + index * 80,
                        this.wavePhysics.canvas.height / 2,
                        freq
                    );
                }, index * 300);

                scale.push({ note, frequency: freq, interval });
            }
        });

        console.log(`🎵 Playing ${scaleType} scale in ${root}${octave}`);
        return scale;
    }
}

// Export for use in other modules
if (typeof window !== 'undefined') {
    window.HarmonicsEngine = HarmonicsEngine;
}
