// Nature Sounds - High-Quality White Noise Generator
// Premium ambient audio experience for relaxation and focus
// Part of Wavelength Cozy Game SDK

// Global variables
let canvas;
let currentSound = 'ocean';
let masterVolume = 0.7;
let audioQuality = 'high';
let isInitialized = false;
let sessionStartTime;
let timerDuration = 0;
let timerStartTime = 0;

// Audio synthesis objects
let soundGenerators = {};
let activeLayers = new Map();
let reverb, filter, compressor;
let masterGainNode; // Add master gain node for audio analysis

// Audio analysis for visualization
let audioAnalyzer;
let audioLevels = {
    current: 0,
    smoothed: 0,
    history: [],
    peaks: [],
    // Add normalization tracking
    runningAverage: 0,
    maxLevel: 0,
    gainAdjustment: 1.0
};

// Visual elements
let particles = [];
let waveforms = [];
let animationSpeed = 1;
let backgroundIntensity = 0;

// Session tracking
let sessionStats = {
    startTime: Date.now(),
    currentEnvironment: 'Ocean Surf',
    activeLayers: 1,
    audioStatus: 'Ready'
};

// Sound definitions with layered synthesis
const soundDefinitions = {
    ocean: {
        name: 'Ocean Surf',
        color: [74, 144, 226],
        layers: {
            waves: { type: 'noise', freq: [40, 200], amp: 0.8, filter: 'lowpass', noiseType: 'brown' },
            foam: { type: 'noise', freq: [800, 4000], amp: 0.3, filter: 'bandpass', noiseType: 'white' },
            deep: { type: 'noise', freq: [30, 80], amp: 0.2, filter: 'lowpass', noiseType: 'brown' },
            ambience: { type: 'noise', freq: [20, 100], amp: 0.5, filter: 'lowpass', noiseType: 'pink' }
        },
        animation: 'waves'
    },
    rain: {
        name: 'Rain',
        color: [142, 142, 147],
        layers: {
            drops: { type: 'noise', freq: [1000, 8000], amp: 0.7, filter: 'highpass', noiseType: 'white' },
            splash: { type: 'noise', freq: [200, 2000], amp: 0.4, filter: 'bandpass', noiseType: 'pink' },
            thunder: { type: 'noise', freq: [30, 150], amp: 0.1, filter: 'lowpass', noiseType: 'brown' },
            ambience: { type: 'noise', freq: [100, 500], amp: 0.3, filter: 'lowpass', noiseType: 'pink' }
        },
        animation: 'raindrops'
    },
    river: {
        name: 'River',
        color: [90, 200, 250],
        layers: {
            flow: { type: 'noise', freq: [200, 1000], amp: 0.8, filter: 'bandpass', noiseType: 'brown' },
            bubbles: { type: 'noise', freq: [500, 3000], amp: 0.3, filter: 'highpass', noiseType: 'white' },
            rocks: { type: 'noise', freq: [100, 400], amp: 0.4, filter: 'lowpass', noiseType: 'brown' },
            birds: { type: 'noise', freq: [1800, 2500], amp: 0.1, filter: 'bandpass', noiseType: 'pink' }
        },
        animation: 'flowing'
    },
    wind: {
        name: 'Wind',
        color: [255, 204, 2],
        layers: {
            gusts: { type: 'noise', freq: [20, 200], amp: 0.9, filter: 'lowpass', noiseType: 'brown' },
            leaves: { type: 'noise', freq: [1000, 5000], amp: 0.3, filter: 'highpass', noiseType: 'pink' },
            howl: { type: 'noise', freq: [100, 300], amp: 0.2, filter: 'bandpass', noiseType: 'brown' },
            distant: { type: 'noise', freq: [50, 300], amp: 0.4, filter: 'lowpass', noiseType: 'pink' }
        },
        animation: 'swirling'
    },
    storm: {
        name: 'Storm',
        color: [88, 86, 214],
        layers: {
            thunder: { type: 'noise', freq: [20, 100], amp: 0.6, filter: 'lowpass', noiseType: 'brown' },
            rain: { type: 'noise', freq: [1000, 6000], amp: 0.8, filter: 'bandpass', noiseType: 'pink' },
            wind: { type: 'noise', freq: [50, 300], amp: 0.7, filter: 'lowpass', noiseType: 'brown' },
            lightning: { type: 'noise', freq: [100, 1000], amp: 0.2, filter: 'bandpass', noiseType: 'white' }
        },
        animation: 'storm'
    }
};

// Preset environments that mix multiple sounds
const presetEnvironments = {
    'peaceful-beach': {
        name: 'Peaceful Beach',
        sounds: [
            { sound: 'ocean', volume: 0.8 },
            { sound: 'wind', volume: 0.3 }
        ]
    },
    'forest-rain': {
        name: 'Forest Rain',
        sounds: [
            { sound: 'rain', volume: 0.7 },
            { sound: 'wind', volume: 0.4 }
        ]
    },
    'mountain-wind': {
        name: 'Mountain Wind',
        sounds: [
            { sound: 'wind', volume: 0.9 },
            { sound: 'river', volume: 0.2 }
        ]
    },
    'thunderstorm': {
        name: 'Thunderstorm',
        sounds: [
            { sound: 'storm', volume: 0.9 },
            { sound: 'rain', volume: 0.6 }
        ]
    },
    'riverside': {
        name: 'Riverside',
        sounds: [
            { sound: 'river', volume: 0.8 },
            { sound: 'wind', volume: 0.3 }
        ]
    }
};

function setup() {
    // Create responsive canvas
    let canvasWidth = min(windowWidth - 40, 1000);
    let canvasHeight = min(windowHeight * 0.5, 400);

    canvasWidth = max(canvasWidth, 300);
    canvasHeight = max(canvasHeight, 200);

    canvas = createCanvas(canvasWidth, canvasHeight);
    canvas.parent('p5-canvas-holder');

    // Initialize audio system
    initializeAudio();

    // Set up UI controls
    setupUIControls();

    // Start with ocean sounds
    switchSound('ocean');

    // Initialize session tracking
    sessionStartTime = Date.now();
    updateSessionInfo();

    // Track session start for badges
    if (window.NatureBadges) {
        window.NatureBadges.trackSessionStart();
    }

    console.log('🌊 Nature Sounds initialized successfully!');
}

function initializeAudio() {
    try {
        // Create master gain node for audio analysis
        masterGainNode = new p5.Gain();
        masterGainNode.connect();

        // Create audio effects
        reverb = new p5.Reverb();
        reverb.set(2, 3, false); // room size, damping, reverse

        filter = new p5.LowPass();
        filter.freq(8000);

        compressor = new p5.Compressor();
        compressor.set(0.003, 0.25, 12, -24, 0.003);

        // Create audio analyzer and connect to master gain
        audioAnalyzer = new p5.Amplitude();
        audioAnalyzer.setInput(masterGainNode);

        // Initialize audio history arrays
        audioLevels.history = new Array(60).fill(0);
        audioLevels.peaks = [];

        // Set master volume
        masterGain(masterVolume);

        isInitialized = true;
        console.log('🔊 High-quality audio engine initialized');
    } catch (error) {
        console.log('⚠️ Audio initialization will happen on first interaction');
    }
}

function setupUIControls() {
    // Sound selection buttons
    document.querySelectorAll('.sound-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            if (!isInitialized && getAudioContext().state !== 'running') {
                userStartAudio();
                isInitialized = true;
            }

            // Update UI
            document.querySelectorAll('.sound-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // Switch sound
            const soundType = btn.dataset.sound;
            switchSound(soundType);
        });
    });

    // Preset environment buttons
    document.querySelectorAll('.preset-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            if (!isInitialized && getAudioContext().state !== 'running') {
                userStartAudio();
                isInitialized = true;
            }

            const presetId = btn.dataset.preset;
            loadPresetEnvironment(presetId);
        });
    });

    // Master volume control
    const masterVolumeSlider = document.getElementById('master-volume');
    const volumeValue = document.getElementById('volume-value');

    masterVolumeSlider.addEventListener('input', (e) => {
        masterVolume = e.target.value / 100;
        volumeValue.textContent = e.target.value + '%';
        masterGain(masterVolume);
        updateAllLayerVolumes();
    });

    // Quality selector
    const qualitySelect = document.getElementById('quality-select');
    qualitySelect.addEventListener('change', (e) => {
        audioQuality = e.target.value;
        updateAudioQuality();
    });

    // Timer controls
    const timerSlider = document.getElementById('timer-slider');
    const timerValue = document.getElementById('timer-value');
    const timerBtn = document.getElementById('timer-btn');

    timerSlider.addEventListener('input', (e) => {
        const minutes = parseInt(e.target.value);
        timerValue.textContent = minutes === 0 ? 'Off' : minutes + ' min';
    });

    timerBtn.addEventListener('click', () => {
        const minutes = parseInt(timerSlider.value);
        if (minutes > 0) {
            startTimer(minutes);
        } else {
            stopTimer();
        }
    });
}

function switchSound(soundType) {
    // Stop all current sounds
    stopAllSounds();

    // Update current sound
    currentSound = soundType;
    const soundData = soundDefinitions[soundType];

    // Reset audio analysis for new sound type
    audioLevels.runningAverage = 0;
    audioLevels.maxLevel = 0;
    audioLevels.gainAdjustment = 1.0;
    audioLevels.smoothed = 0;
    audioLevels.current = 0;
    audioLevels.peaks = [];

    // Update session info
    sessionStats.currentEnvironment = soundData.name;
    updateSessionInfo();

    // Track environment exploration for badges
    if (window.NatureBadges) {
        window.NatureBadges.trackEnvironmentExplored(soundType);
    }

    // Start new sound layers
    startSoundLayers(soundType);

    // Update layer controls UI
    updateLayerControls(soundType);

    // Clear and restart particles for new animation
    particles = [];
    initializeParticles(soundData.animation);

    console.log(`🎵 Switched to: ${soundData.name}`);
}

function startSoundLayers(soundType) {
    const soundData = soundDefinitions[soundType];

    Object.entries(soundData.layers).forEach(([layerName, layerData]) => {
        const layerKey = `${soundType}_${layerName}`;

        if (layerData.type === 'noise') {
            // Create sophisticated noise generator with specific type
            const noiseType = layerData.noiseType || getNoiseType();
            const noise = new p5.Noise(noiseType);
            noise.start();

            // Apply filtering based on frequency range
            if (layerData.filter) {
                const filter = createLayerFilter(layerData.filter, layerData.freq);
                noise.disconnect();
                noise.connect(filter);
                filter.connect(masterGainNode); // Connect filter to master gain
            } else {
                noise.connect(masterGainNode); // Connect directly to master gain
            }

            // Set amplitude with envelope for natural feel
            const env = new p5.Envelope();
            env.setADSR(2, 0.5, 0.8, 3); // Slow attack, gentle release
            noise.amp(env);
            env.play(noise, 0, layerData.amp * masterVolume);

            activeLayers.set(layerKey, {
                source: noise,
                envelope: env,
                volume: layerData.amp,
                type: 'noise'
            });

        } else if (layerData.type === 'oscillator') {
            // Create tonal elements
            const osc = new p5.Oscillator(layerData.wave || 'sine');
            osc.freq(layerData.freq);
            osc.start();
            osc.connect(masterGainNode); // Connect to master gain

            const env = new p5.Envelope();
            env.setADSR(3, 1, 0.6, 4);
            osc.amp(env);
            env.play(osc, 0, layerData.amp * masterVolume);

            activeLayers.set(layerKey, {
                source: osc,
                envelope: env,
                volume: layerData.amp,
                type: 'oscillator'
            });
        }
    });

    // Update active layers count
    sessionStats.activeLayers = activeLayers.size;
    updateSessionInfo();
}

function createLayerFilter(filterType, freqRange) {
    let filter;

    switch (filterType) {
        case 'lowpass':
            filter = new p5.LowPass();
            filter.freq(Array.isArray(freqRange) ? freqRange[1] : freqRange);
            break;
        case 'highpass':
            filter = new p5.HighPass();
            filter.freq(Array.isArray(freqRange) ? freqRange[0] : freqRange);
            break;
        case 'bandpass':
            filter = new p5.BandPass();
            filter.freq(Array.isArray(freqRange) ?
                (freqRange[0] + freqRange[1]) / 2 : freqRange);
            filter.res(5); // Resonance for character
            break;
        default:
            return null;
    }

    return filter;
}

function getNoiseType() {
    switch (audioQuality) {
        case 'high': return 'pink'; // More natural than white noise
        case 'medium': return 'brown'; // Warmer, less harsh
        case 'low': return 'white'; // Standard white noise
        default: return 'pink';
    }
}

function stopAllSounds() {
    activeLayers.forEach((layer, key) => {
        if (layer.envelope) {
            layer.envelope.triggerRelease();
        }
        if (layer.source && layer.source.stop) {
            setTimeout(() => layer.source.stop(), 3000); // Fade out time
        }
    });
    activeLayers.clear();
}

function updateLayerControls(soundType) {
    const layerControlsContainer = document.getElementById('layer-controls');
    layerControlsContainer.innerHTML = '';

    const soundData = soundDefinitions[soundType];

    Object.entries(soundData.layers).forEach(([layerName, layerData]) => {
        const controlDiv = document.createElement('div');
        controlDiv.className = 'layer-control';

        const label = document.createElement('label');
        label.textContent = `${layerName.charAt(0).toUpperCase() + layerName.slice(1)}:`;

        const slider = document.createElement('input');
        slider.type = 'range';
        slider.min = '0';
        slider.max = '100';
        slider.value = Math.round(layerData.amp * 100);
        slider.className = 'layer-slider';

        const valueSpan = document.createElement('span');
        valueSpan.textContent = Math.round(layerData.amp * 100) + '%';
        valueSpan.className = 'layer-value';

        slider.addEventListener('input', (e) => {
            const newVolume = e.target.value / 100;
            valueSpan.textContent = e.target.value + '%';
            updateLayerVolume(soundType, layerName, newVolume);

            // Track custom mixing for badges
            if (window.NatureBadges) {
                window.NatureBadges.trackCustomMix();
            }
        });

        controlDiv.appendChild(label);
        controlDiv.appendChild(slider);
        controlDiv.appendChild(valueSpan);
        layerControlsContainer.appendChild(controlDiv);
    });
}

function updateLayerVolume(soundType, layerName, volume) {
    const layerKey = `${soundType}_${layerName}`;
    const layer = activeLayers.get(layerKey);

    if (layer && layer.envelope) {
        layer.volume = volume;
        layer.envelope.triggerAttack();

        // Update the amplitude smoothly
        if (layer.source && layer.source.amp) {
            layer.source.amp(volume * masterVolume, 0.5); // 0.5 second transition
        }
    }
}

function updateAllLayerVolumes() {
    activeLayers.forEach((layer, key) => {
        if (layer.source && layer.source.amp) {
            layer.source.amp(layer.volume * masterVolume, 0.3);
        }
    });
}

function loadPresetEnvironment(presetId) {
    const preset = presetEnvironments[presetId];
    if (!preset) return;

    // Stop current sounds
    stopAllSounds();

    // Start preset sounds
    preset.sounds.forEach(({ sound, volume }) => {
        setTimeout(() => {
            startSoundLayers(sound);
            // Adjust volumes for mixing
            Object.keys(soundDefinitions[sound].layers).forEach(layerName => {
                updateLayerVolume(sound, layerName, volume);
            });
        }, 100); // Small delay for smooth transition
    });

    // Update UI
    sessionStats.currentEnvironment = preset.name;
    updateSessionInfo();

    // Track preset usage for badges
    if (window.NatureBadges) {
        window.NatureBadges.trackPresetTried(presetId);
        window.NatureBadges.trackCustomMix(); // Presets count as custom mixes
    }

    console.log(`🏞️ Loaded preset environment: ${preset.name}`);
}

function startTimer(minutes) {
    timerDuration = minutes * 60; // Convert to seconds
    timerStartTime = Date.now();

    document.getElementById('timer-btn').textContent = '⏹️ Stop Timer';
    sessionStats.audioStatus = `Timer: ${minutes}min`;
    updateSessionInfo();

    // Track timer usage for badges
    if (window.NatureBadges) {
        window.NatureBadges.trackTimerUsed();
    }

    console.log(`⏰ Timer started: ${minutes} minutes`);
}

function stopTimer() {
    timerDuration = 0;
    timerStartTime = 0;

    document.getElementById('timer-btn').textContent = '⏰ Set Timer';
    document.getElementById('timer-slider').value = 0;
    document.getElementById('timer-value').textContent = 'Off';
    sessionStats.audioStatus = 'Playing';
    updateSessionInfo();

    console.log('⏰ Timer stopped');
}

function updateAudioQuality() {
    // Restart current sounds with new quality
    const prevSound = currentSound;
    stopAllSounds();
    setTimeout(() => {
        switchSound(prevSound);
    }, 500);

    console.log(`🎚️ Audio quality changed to: ${audioQuality}`);
}

function updateSessionInfo() {
    document.getElementById('current-environment').textContent = sessionStats.currentEnvironment;
    document.getElementById('active-layers').textContent = sessionStats.activeLayers;
    document.getElementById('audio-status').textContent = sessionStats.audioStatus;
}

function initializeParticles(animationType) {
    particles = [];

    // Create particles based on animation type
    const particleCount = animationType === 'storm' ? 200 : 100;

    for (let i = 0; i < particleCount; i++) {
        particles.push({
            x: random(width),
            y: random(height),
            size: random(2, 8),
            speed: random(0.5, 3),
            alpha: random(50, 150),
            angle: random(TWO_PI),
            type: animationType
        });
    }
}

function updateAudioLevels() {
    if (!audioAnalyzer) return;

    // Get raw audio level
    let rawLevel = audioAnalyzer.getLevel();

    // Update running statistics for auto-normalization
    audioLevels.runningAverage = lerp(audioLevels.runningAverage, rawLevel, 0.01);
    audioLevels.maxLevel = max(audioLevels.maxLevel * 0.999, rawLevel); // Slowly decay max

    // Auto gain adjustment - target a consistent level range
    let targetLevel = 0.05; // Target average level
    if (audioLevels.runningAverage > 0.001) {
        let idealGain = targetLevel / audioLevels.runningAverage;
        audioLevels.gainAdjustment = lerp(audioLevels.gainAdjustment, idealGain, 0.02);
        // Constrain gain to reasonable bounds
        audioLevels.gainAdjustment = constrain(audioLevels.gainAdjustment, 0.5, 10.0);
    }

    // Apply gain adjustment and normalize
    let adjustedLevel = rawLevel * audioLevels.gainAdjustment;

    // Additional normalization based on current sound type
    let soundTypeMultiplier = getSoundTypeMultiplier(currentSound);
    let normalizedLevel = adjustedLevel * soundTypeMultiplier;

    // Final constraining to ensure consistency
    audioLevels.current = constrain(normalizedLevel, 0, 0.2);

    // Debug: log levels occasionally with more info
    if (frameCount % 60 === 0) {
        console.log('Raw:', rawLevel.toFixed(4), 'Gain:', audioLevels.gainAdjustment.toFixed(2),
                   'Final:', audioLevels.current.toFixed(4), 'Type:', currentSound);
    }

    // Smooth the level for gentle transitions
    audioLevels.smoothed = lerp(audioLevels.smoothed, audioLevels.current, 0.1);

    // Update history for trailing effects
    audioLevels.history.push(audioLevels.smoothed);
    if (audioLevels.history.length > 60) {
        audioLevels.history.shift();
    }

    // Detect peaks for gentle pulses
    if (audioLevels.current > audioLevels.smoothed * 1.3) {
        audioLevels.peaks.push({
            intensity: audioLevels.current,
            age: 0
        });
    }

    // Age and clean up peaks
    audioLevels.peaks = audioLevels.peaks.filter(peak => {
        peak.age++;
        return peak.age < 60; // 1 second at 60fps
    });

    // Update background intensity
    backgroundIntensity = lerp(backgroundIntensity, audioLevels.smoothed * 100, 0.05);
}

function getSoundTypeMultiplier(soundType) {
    // Compensation multipliers for different sound types to ensure consistent visualization
    const multipliers = {
        'ocean': 1.8,      // Brown noise tends to be quieter
        'rain': 1.2,       // White noise is naturally louder
        'river': 1.5,      // Mixed brown/white, needs moderate boost
        'wind': 2.0,       // Brown noise low frequencies need more boost
        'storm': 1.3       // Mixed types, slight boost needed
    };

    return multipliers[soundType] || 1.0;
}

function draw() {
    // Update audio levels for visualization
    updateAudioLevels();

    // Get current sound data for colors
    const soundData = soundDefinitions[currentSound];
    const [r, g, b] = soundData.color;

    // Create audio-reactive gradient background with waves
    for (let y = 0; y < height; y++) {
        // Base alpha plus audio intensity
        const baseAlpha = map(y, 0, height, 0.1, 0.8);

        // Audio-reactive horizontal waves in the background
        let audioWaveOffset = sin(y * 0.02 + frameCount * 0.03) * audioLevels.smoothed * 50;
        let adjustedAlpha = baseAlpha + (audioLevels.smoothed * 1.2) + (audioWaveOffset * 0.01);

        const alpha = constrain(adjustedAlpha, 0.05, 0.95);

        stroke(r, g, b, alpha * 255);
        line(0, y, width, y);
    }

    // Soft audio-reactive overlay layers
    drawAudioReactiveLayers(r, g, b);

    // Draw animated particles based on sound type
    drawParticles();

    // Draw waveform visualization
    drawWaveform();

    // Draw spectacular audio bursts for peaks
    drawAudioBursts();

    // Debug: Draw audio level indicator
    drawAudioDebugInfo();

    // Update session timer
    updateSessionTimer();

    // Check timer completion
    checkTimerCompletion();
}

function drawAudioReactiveLayers(r, g, b) {
    // Soft pulsing circles that respond to audio intensity
    let intensity = audioLevels.smoothed * 500; // Increase multiplier for visibility

    // Draw multiple soft layers
    for (let i = 0; i < 3; i++) {
        let layerAlpha = map(intensity, 0, 50, 10, 60) * (1 - i * 0.2); // More visible
        let size = width * 0.3 + intensity * 5 + i * 50;

        fill(r, g, b, layerAlpha);
        noStroke();

        // Gentle pulsing position
        let offsetY = sin(frameCount * 0.02 + i) * 10;

        ellipse(width/2, height/2 + offsetY, size);
    }

    // Audio peaks create gentle ripples
    audioLevels.peaks.forEach(peak => {
        let age = peak.age;
        let alpha = map(age, 0, 60, 30, 0); // More visible ripples
        let rippleSize = map(age, 0, 60, 50, 300);

        stroke(r, g, b, alpha);
        strokeWeight(2);
        noFill();

        ellipse(width/2, height/2, rippleSize);
    });
}

function drawParticles() {
    // Audio influence factor - much stronger response
    const audioInfluence = 1 + (audioLevels.smoothed * 8); // Increase from 2 to 8 for more dramatic effect

    particles.forEach((particle, index) => {
        const soundData = soundDefinitions[currentSound];
        const [r, g, b] = soundData.color;

        // More dramatically vary alpha based on audio
        const baseAlpha = particle.alpha;
        const audioAlpha = constrain(baseAlpha * audioInfluence * 0.5, 15, 150);

        // Add some audio-reactive glow effect
        let glowSize = particle.size * audioInfluence * 1.5;

        // Draw glow effect first
        fill(r, g, b, audioAlpha * 0.3);
        noStroke();
        ellipse(particle.x, particle.y, glowSize);

        // Draw main particle
        fill(r, g, b, audioAlpha);
        noStroke();

        switch (particle.type) {
            case 'waves':
                // Ocean wave particles
                ellipse(particle.x, particle.y, particle.size * audioInfluence);
                particle.x += sin(particle.angle) * particle.speed * audioInfluence;
                particle.y += cos(particle.angle * 0.5) * 0.5;
                particle.angle += 0.02;
                break;

            case 'raindrops':
                // Rain particles
                ellipse(particle.x, particle.y, particle.size * 0.5, particle.size * 2);
                particle.y += particle.speed * 2 * audioInfluence;
                particle.x += sin(particle.angle) * 0.5;
                if (particle.y > height) {
                    particle.y = -10;
                    particle.x = random(width);
                }
                break;

            case 'flowing':
                // River flow particles
                ellipse(particle.x, particle.y, particle.size * audioInfluence);
                particle.x += particle.speed * audioInfluence;
                particle.y += sin(particle.angle) * 0.3;
                particle.angle += 0.05;
                if (particle.x > width) particle.x = 0;
                break;

            case 'swirling':
                // Wind particles
                ellipse(particle.x, particle.y, particle.size * audioInfluence);
                particle.x += cos(particle.angle) * particle.speed * audioInfluence;
                particle.y += sin(particle.angle) * particle.speed * 0.5;
                particle.angle += 0.03;
                break;

            case 'storm':
                // Storm particles (chaotic)
                ellipse(particle.x, particle.y, particle.size * audioInfluence);
                particle.x += cos(particle.angle) * particle.speed * 2 * audioInfluence;
                particle.y += sin(particle.angle * 1.5) * particle.speed;
                particle.angle += random(-0.1, 0.1);
                break;
        }

        // Wrap particles around screen
        if (particle.x < 0) particle.x = width;
        if (particle.x > width) particle.x = 0;
        if (particle.y < 0) particle.y = height;
        if (particle.y > height) particle.y = 0;
    });
}

function drawWaveform() {
    // Audio-reactive waveform visualization
    const soundData = soundDefinitions[currentSound];
    const [r, g, b] = soundData.color;

    // Make waveform respond to actual audio levels
    stroke(255, 255, 255, 150);
    strokeWeight(3);
    noFill();

    // Create multiple waveform layers that respond to audio
    for (let layer = 0; layer < 3; layer++) {
        beginShape();
        for (let x = 0; x < width; x += 8) {
            // Base wave pattern
            let baseWave = sin(x * 0.008 + frameCount * 0.015 + layer * 0.5) * 15;

            // Audio reactive amplitude - much stronger response
            let audioWave = audioLevels.smoothed * 200 * sin(x * 0.01 + frameCount * 0.02 + layer);

            // Combine base wave with audio reactive wave
            let amplitude = baseWave + audioWave;

            // Add some variation based on layer
            let y = height / 2 + amplitude + (layer - 1) * 20;

            vertex(x, y);
        }
        endShape();

        // Make each layer slightly more transparent
        stroke(255, 255, 255, 150 - layer * 30);
    }
}

function drawAudioBursts() {
    // Create spectacular bursts when audio levels are high
    if (audioLevels.smoothed > 0.02) { // Only when there's significant audio
        let burstIntensity = audioLevels.smoothed * 300;

        // Multiple burst layers
        for (let i = 0; i < 5; i++) {
            let burstSize = burstIntensity + i * 30;
            let burstAlpha = map(burstIntensity, 0, 50, 0, 40) * (1 - i * 0.15);

            const soundData = soundDefinitions[currentSound];
            const [r, g, b] = soundData.color;

            // Pulsating burst circles
            fill(r, g, b, burstAlpha);
            noStroke();

            let pulseSize = burstSize + sin(frameCount * 0.1 + i) * 20;
            ellipse(width/2, height/2, pulseSize);

            // Radiating lines for dramatic effect
            if (i === 0 && audioLevels.smoothed > 0.03) {
                stroke(r, g, b, burstAlpha * 0.8);
                strokeWeight(2);

                for (let angle = 0; angle < TWO_PI; angle += PI / 8) {
                    let lineLength = burstIntensity * 0.8;
                    let startX = width/2 + cos(angle) * 30;
                    let startY = height/2 + sin(angle) * 30;
                    let endX = width/2 + cos(angle) * lineLength;
                    let endY = height/2 + sin(angle) * lineLength;

                    line(startX, startY, endX, endY);
                }
            }
        }
    }
}

function drawAudioDebugInfo() {
    // Draw audio level bars for debugging
    if (!audioAnalyzer) return;

    // Background for debug info
    fill(0, 0, 0, 120);
    rect(10, 10, 250, 80);

    // Raw level bar
    fill(255, 100, 100);
    rect(15, 15, audioLevels.current * 1000, 8);

    // Smoothed level bar
    fill(100, 255, 100);
    rect(15, 28, audioLevels.smoothed * 1000, 8);

    // Running average bar
    fill(100, 100, 255);
    rect(15, 41, audioLevels.runningAverage * 1000, 8);

    // Gain adjustment indicator
    fill(255, 255, 100);
    rect(15, 54, (audioLevels.gainAdjustment / 10) * 150, 8);

    // Text labels
    fill(255);
    textSize(9);
    text(`Current: ${(audioLevels.current * 100).toFixed(1)}%`, 15, 75);
    text(`Smooth: ${(audioLevels.smoothed * 100).toFixed(1)}%`, 85, 75);
    text(`Gain: ${audioLevels.gainAdjustment.toFixed(1)}x`, 155, 75);
    text(`Avg: ${(audioLevels.runningAverage * 1000).toFixed(1)}`, 205, 75);
}

function updateSessionTimer() {
    const sessionTime = Math.floor((Date.now() - sessionStartTime) / 1000);
    const minutes = Math.floor(sessionTime / 60);
    const seconds = sessionTime % 60;

    document.getElementById('session-time').textContent =
        `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

    // Track session duration for badges (every minute)
    if (window.NatureBadges && sessionTime % 60 === 0 && sessionTime > 0) {
        const isHighQuality = audioQuality === 'high';
        window.NatureBadges.trackSessionDuration(60, isHighQuality);
    }
}

function checkTimerCompletion() {
    if (timerDuration > 0 && timerStartTime > 0) {
        const elapsed = (Date.now() - timerStartTime) / 1000;
        const remaining = timerDuration - elapsed;

        if (remaining <= 0) {
            // Timer completed - fade out audio
            fadeOutAllSounds();
            stopTimer();
            console.log('⏰ Timer completed - fading out audio');
        }
    }
}

function fadeOutAllSounds() {
    activeLayers.forEach((layer) => {
        if (layer.source && layer.source.amp) {
            layer.source.amp(0, 3); // 3 second fade out
        }
    });

    setTimeout(() => {
        stopAllSounds();
    }, 3000);
}

function windowResized() {
    let canvasWidth = min(windowWidth - 40, 1000);
    let canvasHeight = min(windowHeight * 0.5, 400);

    canvasWidth = max(canvasWidth, 300);
    canvasHeight = max(canvasHeight, 200);

    resizeCanvas(canvasWidth, canvasHeight);

    // Reinitialize particles for new canvas size
    if (particles.length > 0) {
        initializeParticles(soundDefinitions[currentSound].animation);
    }
}

// Initialize global badge system and set game start time
window.gameStartTime = Date.now();

console.log('🌊 Nature Sounds Audio Engine Loaded!');
