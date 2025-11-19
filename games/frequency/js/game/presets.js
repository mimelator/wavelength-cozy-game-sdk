/**
 * Frequency - Preset Compositions System
 * Beautiful pre-made harmonic combinations for cozy experiences
 */

class PresetCompositions {
    constructor(audioManager, wavePhysics, harmonicsEngine) {
        this.audioManager = audioManager;
        this.wavePhysics = wavePhysics;
        this.harmonicsEngine = harmonicsEngine;

        // Define cozy preset compositions
        this.presets = {
            'Rain Drops': {
                description: 'Gentle droplets creating peaceful resonance',
                duration: 12,
                layers: [
                    { frequency: 174, type: 'sine', volume: 0.3, delay: 0, duration: 12 },
                    { frequency: 220, type: 'sine', volume: 0.2, delay: 2, duration: 8 },
                    { frequency: 293, type: 'sine', volume: 0.15, delay: 4, duration: 6 },
                    { frequency: 349, type: 'sine', volume: 0.1, delay: 6, duration: 4 }
                ],
                visual: 'gentle_drops',
                color: '#4a90e2'
            },

            'Ocean Waves': {
                description: 'Rolling waves with deep harmonic undertones',
                duration: 15,
                layers: [
                    { frequency: 65, type: 'sawtooth', volume: 0.4, delay: 0, duration: 15 },
                    { frequency: 98, type: 'sine', volume: 0.3, delay: 1, duration: 14 },
                    { frequency: 130, type: 'sine', volume: 0.2, delay: 3, duration: 12 },
                    { frequency: 195, type: 'triangle', volume: 0.15, delay: 5, duration: 10 }
                ],
                visual: 'flowing_waves',
                color: '#2c5aa0'
            },

            'Forest Whispers': {
                description: 'Mysterious tones like wind through ancient trees',
                duration: 18,
                layers: [
                    { frequency: 110, type: 'sine', volume: 0.25, delay: 0, duration: 18 },
                    { frequency: 165, type: 'sine', volume: 0.2, delay: 2, duration: 16 },
                    { frequency: 220, type: 'triangle', volume: 0.15, delay: 4, duration: 14 },
                    { frequency: 330, type: 'sine', volume: 0.1, delay: 7, duration: 11 },
                    { frequency: 440, type: 'sine', volume: 0.08, delay: 10, duration: 8 }
                ],
                visual: 'organic_flow',
                color: '#228b22'
            },

            'Crystal Chimes': {
                description: 'Shimmering crystalline harmonics',
                duration: 10,
                layers: [
                    { frequency: 523, type: 'sine', volume: 0.3, delay: 0, duration: 2 },
                    { frequency: 659, type: 'sine', volume: 0.25, delay: 1, duration: 3 },
                    { frequency: 784, type: 'sine', volume: 0.2, delay: 2, duration: 4 },
                    { frequency: 1047, type: 'sine', volume: 0.15, delay: 3, duration: 5 },
                    { frequency: 1319, type: 'sine', volume: 0.1, delay: 4, duration: 6 }
                ],
                visual: 'sparkling_crystals',
                color: '#da70d6'
            },

            'Celestial Harmony': {
                description: 'Ethereal tones from distant stars',
                duration: 20,
                layers: [
                    { frequency: 256, type: 'sine', volume: 0.2, delay: 0, duration: 20 },
                    { frequency: 384, type: 'sine', volume: 0.18, delay: 3, duration: 17 },
                    { frequency: 512, type: 'sine', volume: 0.15, delay: 6, duration: 14 },
                    { frequency: 768, type: 'triangle', volume: 0.12, delay: 9, duration: 11 },
                    { frequency: 1024, type: 'sine', volume: 0.08, delay: 12, duration: 8 }
                ],
                visual: 'cosmic_dance',
                color: '#9370db'
            },

            'Morning Dew': {
                description: 'Fresh, awakening tones like sunrise',
                duration: 8,
                layers: [
                    { frequency: 146, type: 'sine', volume: 0.25, delay: 0, duration: 8 },
                    { frequency: 220, type: 'sine', volume: 0.2, delay: 1, duration: 7 },
                    { frequency: 293, type: 'triangle', volume: 0.18, delay: 2, duration: 6 },
                    { frequency: 440, type: 'sine', volume: 0.15, delay: 3, duration: 5 }
                ],
                visual: 'gentle_dawn',
                color: '#ffd700'
            }
        };

        this.activePreset = null;
        this.presetAudioIds = [];
        this.presetWaveIds = [];

        console.log('🎼 PresetCompositions initialized with', Object.keys(this.presets).length, 'presets');
    }

    /**
     * Play a preset composition
     */
    async playPreset(presetName) {
        if (!this.presets[presetName]) {
            console.warn(`❌ Preset "${presetName}" not found`);
            return false;
        }

        // Stop any currently playing preset
        this.stopPreset();

        const preset = this.presets[presetName];
        this.activePreset = presetName;

        console.log(`🎵 Playing preset: "${presetName}" - ${preset.description}`);

        // Create visual environment
        this.createPresetVisuals(preset);

        // Schedule all audio layers
        preset.layers.forEach((layer, index) => {
            setTimeout(() => {
                if (this.activePreset === presetName) { // Check if still active
                    this.playPresetLayer(layer, preset, index);
                }
            }, layer.delay * 1000);
        });

        // Auto-stop after duration
        setTimeout(() => {
            if (this.activePreset === presetName) {
                this.stopPreset();
            }
        }, preset.duration * 1000);

        return true;
    }

    /**
     * Play individual preset layer
     */
    playPresetLayer(layer, preset, layerIndex) {
        // Create audio
        const audioId = this.audioManager.createFrequency(
            layer.frequency,
            layer.type,
            layer.duration
        );

        if (audioId) {
            // Adjust volume for this layer
            const oscInfo = this.audioManager.oscillators.get(audioId);
            if (oscInfo) {
                const now = this.audioManager.audioContext.currentTime;
                oscInfo.gainNode.gain.setValueAtTime(0, now);
                oscInfo.gainNode.gain.linearRampToValueAtTime(
                    layer.volume * this.audioManager.volume,
                    now + 1.0 // 1 second fade in
                );

                // Fade out before ending
                const fadeOutTime = now + layer.duration - 1.0;
                oscInfo.gainNode.gain.linearRampToValueAtTime(
                    layer.volume * this.audioManager.volume,
                    fadeOutTime
                );
                oscInfo.gainNode.gain.linearRampToValueAtTime(
                    0,
                    fadeOutTime + 1.0
                );
            }

            this.presetAudioIds.push(audioId);
        }

        // Create visual wave
        const position = this.getLayerPosition(layerIndex, preset.layers.length);
        const waveId = this.wavePhysics.createWave({
            frequency: layer.frequency,
            position: position,
            color: FrequencyUtils.frequencyToColor(layer.frequency),
            amplitude: 30 + layer.volume * 40,
            lifetime: layer.duration,
            type: layer.type === 'sine' ? 'sine' : 'triangle'
        });

        if (waveId !== null) {
            this.presetWaveIds.push(waveId);
        }
    }

    /**
     * Get position for layer (spread them around the canvas)
     */
    getLayerPosition(layerIndex, totalLayers) {
        const canvas = this.wavePhysics.canvas;
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;

        if (totalLayers === 1) {
            return { x: centerX, y: centerY };
        }

        // Arrange in a circle or pattern
        const angle = (layerIndex / totalLayers) * Math.PI * 2;
        const radius = Math.min(canvas.width, canvas.height) * 0.2;

        return {
            x: centerX + Math.cos(angle) * radius,
            y: centerY + Math.sin(angle) * radius
        };
    }

    /**
     * Create preset-specific visual effects
     */
    createPresetVisuals(preset) {
        const canvas = this.wavePhysics.canvas;
        const ctx = this.wavePhysics.ctx;

        switch (preset.visual) {
            case 'gentle_drops':
                this.createRainDrops(preset.color);
                break;
            case 'flowing_waves':
                this.createOceanEffect(preset.color);
                break;
            case 'organic_flow':
                this.createForestEffect(preset.color);
                break;
            case 'sparkling_crystals':
                this.createCrystalEffect(preset.color);
                break;
            case 'cosmic_dance':
                this.createCosmicEffect(preset.color);
                break;
            case 'gentle_dawn':
                this.createDawnEffect(preset.color);
                break;
        }
    }

    /**
     * Create rain drop visual effect
     */
    createRainDrops(color) {
        const canvas = this.wavePhysics.canvas;

        for (let i = 0; i < 8; i++) {
            setTimeout(() => {
                const x = Math.random() * canvas.width;
                const y = Math.random() * canvas.height * 0.3; // Upper area

                const waveId = this.wavePhysics.createWave({
                    frequency: 200 + Math.random() * 200,
                    position: { x, y },
                    color: color,
                    amplitude: 20 + Math.random() * 15,
                    lifetime: 3 + Math.random() * 2,
                    speed: 1.5
                });

                if (waveId !== null) {
                    this.presetWaveIds.push(waveId);
                }
            }, i * 500 + Math.random() * 1000);
        }
    }

    /**
     * Create ocean wave effect
     */
    createOceanEffect(color) {
        const canvas = this.wavePhysics.canvas;

        // Create larger, slower waves
        for (let i = 0; i < 3; i++) {
            const x = (i / 2) * canvas.width;
            const y = canvas.height * 0.7; // Lower area

            const waveId = this.wavePhysics.createWave({
                frequency: 80 + i * 20,
                position: { x, y },
                color: color,
                amplitude: 60 + i * 20,
                wavelength: 150,
                speed: 0.8,
                lifetime: 15
            });

            if (waveId !== null) {
                this.presetWaveIds.push(waveId);
            }
        }
    }

    /**
     * Create forest effect
     */
    createForestEffect(color) {
        const canvas = this.wavePhysics.canvas;

        // Create organic, flowing patterns
        for (let i = 0; i < 5; i++) {
            setTimeout(() => {
                const x = Math.random() * canvas.width;
                const y = Math.random() * canvas.height;

                const waveId = this.wavePhysics.createWave({
                    frequency: 100 + Math.random() * 150,
                    position: { x, y },
                    direction: {
                        x: (Math.random() - 0.5) * 0.3,
                        y: (Math.random() - 0.5) * 0.3
                    },
                    color: color,
                    amplitude: 25 + Math.random() * 20,
                    speed: 0.5 + Math.random() * 0.5,
                    lifetime: 8 + Math.random() * 4
                });

                if (waveId !== null) {
                    this.presetWaveIds.push(waveId);
                }
            }, i * 2000 + Math.random() * 1000);
        }
    }

    /**
     * Create crystal effect
     */
    createCrystalEffect(color) {
        const canvas = this.wavePhysics.canvas;
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;

        // Create crystalline pattern
        for (let i = 0; i < 6; i++) {
            const angle = (i / 6) * Math.PI * 2;
            const radius = 80;
            const x = centerX + Math.cos(angle) * radius;
            const y = centerY + Math.sin(angle) * radius;

            setTimeout(() => {
                const waveId = this.wavePhysics.createWave({
                    frequency: 500 + i * 100,
                    position: { x, y },
                    color: color,
                    amplitude: 35,
                    lifetime: 6,
                    type: 'triangle'
                });

                if (waveId !== null) {
                    this.presetWaveIds.push(waveId);
                }
            }, i * 300);
        }
    }

    /**
     * Create cosmic effect
     */
    createCosmicEffect(color) {
        const canvas = this.wavePhysics.canvas;

        // Create slowly moving cosmic waves
        for (let i = 0; i < 4; i++) {
            setTimeout(() => {
                const x = Math.random() * canvas.width;
                const y = Math.random() * canvas.height;

                const waveId = this.wavePhysics.createWave({
                    frequency: 250 + i * 100,
                    position: { x, y },
                    direction: {
                        x: Math.cos(i * Math.PI / 2) * 0.2,
                        y: Math.sin(i * Math.PI / 2) * 0.2
                    },
                    color: FrequencyUtils.getAuroraColor(Date.now() + i * 1000),
                    amplitude: 40 + Math.random() * 20,
                    speed: 0.3,
                    lifetime: 15
                });

                if (waveId !== null) {
                    this.presetWaveIds.push(waveId);
                }
            }, i * 3000);
        }
    }

    /**
     * Create dawn effect
     */
    createDawnEffect(color) {
        const canvas = this.wavePhysics.canvas;

        // Create gentle awakening pattern
        for (let i = 0; i < 4; i++) {
            setTimeout(() => {
                const x = (canvas.width / 5) * (i + 1);
                const y = canvas.height / 2;

                const waveId = this.wavePhysics.createWave({
                    frequency: 150 + i * 50,
                    position: { x, y },
                    color: FrequencyUtils.getColorTemperature(150 + i * 50),
                    amplitude: 30 + i * 5,
                    lifetime: 6,
                    speed: 1.2
                });

                if (waveId !== null) {
                    this.presetWaveIds.push(waveId);
                }
            }, i * 1000);
        }
    }

    /**
     * Stop current preset
     */
    stopPreset() {
        if (!this.activePreset) return;

        console.log(`🔇 Stopping preset: "${this.activePreset}"`);

        // Stop all preset audio
        this.presetAudioIds.forEach(audioId => {
            this.audioManager.stopFrequency(audioId);
        });

        // Clear preset waves
        this.presetWaveIds.forEach(waveId => {
            this.wavePhysics.removeWave(waveId);
        });

        // Clear arrays
        this.presetAudioIds = [];
        this.presetWaveIds = [];
        this.activePreset = null;
    }

    /**
     * Get list of available presets
     */
    getPresetList() {
        return Object.keys(this.presets).map(name => ({
            name: name,
            description: this.presets[name].description,
            duration: this.presets[name].duration
        }));
    }

    /**
     * Check if a preset is currently playing
     */
    isPlaying() {
        return this.activePreset !== null;
    }

    /**
     * Get currently playing preset name
     */
    getCurrentPreset() {
        return this.activePreset;
    }
}

// Export for use in other modules
if (typeof window !== 'undefined') {
    window.PresetCompositions = PresetCompositions;
}
