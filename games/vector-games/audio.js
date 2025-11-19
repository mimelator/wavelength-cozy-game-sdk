export class AudioSystem {
    constructor() {
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.value = 0.5;
        this.masterGain.connect(this.ctx.destination);
        
        this.engineOsc = null;
        this.engineGain = null;
        this.engineFilter = null;
        
        this.isMuted = false;
        this.currentVolume = 0.5;
        this.initialized = false;
    }

    setMasterVolume(value) {
        this.currentVolume = Math.max(0, Math.min(1, value));
        if (!this.isMuted) {
            this.masterGain.gain.setTargetAtTime(this.currentVolume, this.ctx.currentTime, 0.1);
        }
    }

    toggleMute() {
        this.isMuted = !this.isMuted;
        if (this.isMuted) {
            this.masterGain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.1);
        } else {
            this.masterGain.gain.setTargetAtTime(this.currentVolume, this.ctx.currentTime, 0.1);
        }
        return this.isMuted;
    }

    async init() {
        if (this.ctx.state === 'suspended') {
            await this.ctx.resume();
        }
        this.initialized = true;
        this.startEngineHum();
    }

    startEngineHum() {
        // Drone oscillator
        this.engineOsc = this.ctx.createOscillator();
        this.engineOsc.type = 'sawtooth';
        this.engineOsc.frequency.value = 50;

        // Filter to dull the harsh saw wave
        this.engineFilter = this.ctx.createBiquadFilter();
        this.engineFilter.type = 'lowpass';
        this.engineFilter.frequency.value = 200;

        this.engineGain = this.ctx.createGain();
        this.engineGain.gain.value = 0;

        this.engineOsc.connect(this.engineFilter);
        this.engineFilter.connect(this.engineGain);
        this.engineGain.connect(this.masterGain);
        
        this.engineOsc.start();
    }

    updateEngine(speed) {
        if (!this.initialized || !this.engineOsc) return;

        // Speed is roughly 0 to 800+
        // Map speed to frequency (pitch)
        // Base 60Hz -> up to 200Hz
        const targetFreq = 60 + (speed * 0.2);
        this.engineOsc.frequency.setTargetAtTime(targetFreq, this.ctx.currentTime, 0.1);

        // Map speed to filter cutoff (brightness)
        const targetCutoff = 200 + (speed * 2);
        this.engineFilter.frequency.setTargetAtTime(targetCutoff, this.ctx.currentTime, 0.1);

        // Map speed to volume
        const targetVol = Math.min(speed / 1000, 0.3); 
        this.engineGain.gain.setTargetAtTime(targetVol, this.ctx.currentTime, 0.1);
    }

    playImpact(velocity, pan) {
        if (!this.initialized) return;

        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const panner = this.ctx.createStereoPanner();

        // Frequency depends on velocity impact
        // Harder hit = sharper sound (higher start pitch, faster decay)
        const intensity = Math.min(velocity / 1000, 1.0);
        
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(200 + intensity * 400, t);
        osc.frequency.exponentialRampToValueAtTime(50, t + 0.1 + intensity * 0.1);

        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(intensity * 0.5, t + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);

        panner.pan.value = pan;

        osc.connect(gain);
        gain.connect(panner);
        panner.connect(this.masterGain);

        osc.start(t);
        osc.stop(t + 0.3);
    }

    playExplosion(size, pan) {
        if (!this.initialized) return;

        const t = this.ctx.currentTime;
        const duration = 0.3 + size * 0.01; // Larger objects = longer crumble
        
        // Create Noise Buffer
        const bufferSize = this.ctx.sampleRate * duration;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;

        // Filter the noise (Lowpass sweep down)
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1000, t);
        filter.frequency.exponentialRampToValueAtTime(100, t + duration);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.5, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + duration);

        const panner = this.ctx.createStereoPanner();
        panner.pan.value = pan;

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(panner);
        panner.connect(this.masterGain);

        noise.start(t);
    }
    
    playMechanicStart(type) {
        if (!this.initialized) return;
        const t = this.ctx.currentTime;
        
        // Global alert sound
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        if (type === 'BLACK_HOLE') {
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(100, t);
            osc.frequency.linearRampToValueAtTime(50, t + 1.0);
            gain.gain.setValueAtTime(0.3, t);
            gain.gain.linearRampToValueAtTime(0, t + 1.0);
        } else if (type === 'SOLAR_FLARE') {
            osc.type = 'sine';
            osc.frequency.setValueAtTime(800, t);
            osc.frequency.exponentialRampToValueAtTime(100, t + 2.0);
             // Add tremolo?
        } else {
            osc.type = 'square';
            osc.frequency.setValueAtTime(440, t);
            osc.frequency.setValueAtTime(880, t + 0.2);
        }
        
        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(t);
        osc.stop(t + 2.0);
    }
}

