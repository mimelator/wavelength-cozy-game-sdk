/**
 * Frequency - Main Game Engine
 * Coordinates audio, visual waves, harmonics, and user interaction
 */

class FrequencyGame {
    constructor(canvasId) {
        // Get canvas and setup
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');

        // Resize canvas to container
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());

        // Initialize systems
        this.audioManager = new AudioManager();
        this.wavePhysics = new WavePhysics(this.canvas);
        this.harmonicsEngine = null; // Initialize after audio

        // Enhanced systems
        this.particleSystem = new ParticleSystem(this.canvas, this.wavePhysics);
        this.soundVisualizer = new SoundVisualizer(this.canvas, this.audioManager);
        this.interactionFeedback = new InteractionFeedback(this.canvas);
        this.presetCompositions = null; // Initialize after harmonics

        // Game state
        this.isRunning = false;
        this.lastTime = 0;
        this.currentFrequency = 440;
        this.currentVolume = 0.5;
        this.isInitialized = false;

        // Badge tracking with inline configuration (self-contained)
        this.badgeHelper = null;
        this.BADGE_CONFIG = {
            INITIAL_GRACE_PERIOD: 5 * 60 * 1000, // 5 minutes before any badges
            RATE_LIMIT: 60 * 1000, // 60 seconds between badges for contemplative frequency game
        };
        this.gameStats = {
            wavesCreated: 0,
            harmonicsCreated: 0,
            interferencePatterns: 0,
            meditationTime: 0,
            gameStartTime: null,
            lastBadgeCheck: 0,
            lastBadgeAwarded: 0,
            sessionStartTime: Date.now()
        };

        // Input handling
        this.isMouseDown = false;
        this.lastMousePos = { x: 0, y: 0 };
        this.touches = new Map();

        // Game modes
        this.gameMode = 'explore'; // explore, harmonics, ambient, scales
        this.modes = {
            explore: 'Free exploration with frequency creation',
            harmonics: 'Create harmonic series and resonance',
            ambient: 'Ambient soundscapes and textures',
            scales: 'Musical scales and chord progressions'
        };

        // UI elements (will be connected after DOM loads)
        this.ui = {
            frequencySlider: null,
            volumeSlider: null,
            modeButtons: null,
            playButton: null,
            clearButton: null,
            infoDisplay: null
        };

        console.log('🎮 FrequencyGame engine initialized');
    }

    /**
     * Initialize the game (must be called after user interaction)
     */
    async initialize() {
        if (this.isInitialized) return true;

        try {
            // Initialize audio (requires user gesture)
            const audioInitialized = await this.audioManager.initialize();
            if (!audioInitialized) {
                console.warn('❌ Audio initialization failed');
                return false;
            }

            // Initialize harmonics engine
            this.harmonicsEngine = new HarmonicsEngine(this.audioManager, this.wavePhysics);

            // Initialize preset compositions
            this.presetCompositions = new PresetCompositions(this.audioManager, this.wavePhysics, this.harmonicsEngine);

            // Initialize badge helper if available
            if (typeof FrequencyBadgeHelper !== 'undefined') {
                this.badgeHelper = new FrequencyBadgeHelper();
                console.log('Badge system initialized');
            }

            // Setup input handlers
            this.setupInputHandlers();            // Connect UI elements
            this.connectUI();

            // Start game loop
            this.isRunning = true;
            this.gameLoop();

            this.isInitialized = true;
            console.log('🎮 Game fully initialized and running');

            // Start badge tracking
            this.gameStats.gameStartTime = Date.now();

            // Welcome sequence
            this.playWelcomeSequence();

            return true;
        } catch (error) {
            console.error('❌ Game initialization failed:', error);
            return false;
        }
    }

    /**
     * Main game loop
     */
    gameLoop(currentTime = 0) {
        if (!this.isRunning) return;

        const deltaTime = (currentTime - this.lastTime) / 1000;
        this.lastTime = currentTime;

        // Update systems
        this.update(deltaTime);

        // Render everything
        this.render();

        // Update UI
        this.updateUI();

        // Continue loop
        requestAnimationFrame(time => this.gameLoop(time));
    }

    /**
     * Update game systems
     */
    update(deltaTime) {
        // Update wave physics
        this.wavePhysics.update(deltaTime);

        // Update enhanced systems
        this.particleSystem.update(deltaTime);
        this.soundVisualizer.update(deltaTime);
        this.interactionFeedback.update(deltaTime);

        // Update badge tracking
        this.updateBadgeTracking(deltaTime);

        // Cleanup expired harmonics
        if (this.harmonicsEngine) {
            this.harmonicsEngine.cleanup();
        }
    }    /**
     * Render game visuals
     */
    render() {
        // Wave physics handles background rendering
        this.wavePhysics.render();

        // Render enhanced visual systems
        this.soundVisualizer.render();
        this.interactionFeedback.render();
        this.particleSystem.render();

        // Add mode-specific overlays
        this.renderModeOverlay();
    }    /**
     * Setup input event handlers
     */
    setupInputHandlers() {
        // Mouse events
        this.canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.canvas.addEventListener('mouseup', (e) => this.handleMouseUp(e));

        // Touch events
        this.canvas.addEventListener('touchstart', (e) => this.handleTouchStart(e));
        this.canvas.addEventListener('touchmove', (e) => this.handleTouchMove(e));
        this.canvas.addEventListener('touchend', (e) => this.handleTouchEnd(e));

        // Prevent context menu on canvas
        this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
    }

    /**
     * Connect UI elements
     */
    connectUI() {
        // Get UI elements
        this.ui.frequencySlider = document.getElementById('frequency-slider');
        this.ui.volumeSlider = document.getElementById('volume-slider');
        this.ui.playButton = document.getElementById('random-harmony-btn');
        this.ui.clearButton = document.getElementById('clear-waves-btn');
        this.ui.infoDisplay = document.getElementById('stats');

        // Connect frequency slider
        if (this.ui.frequencySlider) {
            this.ui.frequencySlider.addEventListener('input', (e) => {
                this.currentFrequency = parseFloat(e.target.value);
                this.updateFrequencyDisplay();
            });
        }

        // Connect volume slider
        if (this.ui.volumeSlider) {
            this.ui.volumeSlider.addEventListener('input', (e) => {
                this.currentVolume = parseFloat(e.target.value);
                this.audioManager.setVolume(this.currentVolume);
            });
        }

        // Connect play button
        if (this.ui.playButton) {
            this.ui.playButton.addEventListener('click', () => {
                this.playCurrentFrequency();
            });
        }

        // Connect clear button
        if (this.ui.clearButton) {
            this.ui.clearButton.addEventListener('click', () => {
                this.clearAll();
            });
        }

        // Mode buttons
        document.querySelectorAll('[data-mode]').forEach(button => {
            button.addEventListener('click', (e) => {
                this.setGameMode(e.target.dataset.mode);
            });
        });

        // Preset buttons
        document.querySelectorAll('.preset-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const presetName = e.target.dataset.preset;
                if (this.presetCompositions) {
                    if (this.presetCompositions.getCurrentPreset() === presetName) {
                        // Stop if already playing
                        this.presetCompositions.stopPreset();
                        button.classList.remove('playing');
                    } else {
                        // Stop any other preset and play this one
                        this.presetCompositions.stopPreset();
                        document.querySelectorAll('.preset-btn').forEach(btn => btn.classList.remove('playing'));

                        this.presetCompositions.playPreset(presetName);
                        button.classList.add('playing');
                    }
                }
            });
        });

        console.log('🔗 UI elements connected');
    }

    /**
     * Handle mouse down
     */
    handleMouseDown(e) {
        if (!this.isInitialized) {
            this.initialize();
            return;
        }

        this.isMouseDown = true;
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        this.createWaveAtPosition(x, y);
        this.lastMousePos = { x, y };
    }

    /**
     * Handle mouse move
     */
    handleMouseMove(e) {
        if (!this.isMouseDown || !this.isInitialized) return;

        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Create waves along mouse path for continuous interaction
        const distance = Math.sqrt((x - this.lastMousePos.x) ** 2 + (y - this.lastMousePos.y) ** 2);
        if (distance > 30) { // Throttle wave creation
            this.createWaveAtPosition(x, y);
            this.lastMousePos = { x, y };
        }
    }

    /**
     * Handle mouse up
     */
    handleMouseUp(e) {
        this.isMouseDown = false;
    }

    /**
     * Handle touch events
     */
    handleTouchStart(e) {
        e.preventDefault();
        if (!this.isInitialized) {
            this.initialize();
            return;
        }

        Array.from(e.changedTouches).forEach(touch => {
            const rect = this.canvas.getBoundingClientRect();
            const x = touch.clientX - rect.left;
            const y = touch.clientY - rect.top;

            this.touches.set(touch.identifier, { x, y });
            this.createWaveAtPosition(x, y);
        });
    }

    /**
     * Handle touch move
     */
    handleTouchMove(e) {
        e.preventDefault();
        if (!this.isInitialized) return;

        Array.from(e.changedTouches).forEach(touch => {
            const rect = this.canvas.getBoundingClientRect();
            const x = touch.clientX - rect.left;
            const y = touch.clientY - rect.top;

            const lastPos = this.touches.get(touch.identifier);
            if (lastPos) {
                const distance = Math.sqrt((x - lastPos.x) ** 2 + (y - lastPos.y) ** 2);
                if (distance > 30) {
                    this.createWaveAtPosition(x, y);
                    this.touches.set(touch.identifier, { x, y });
                }
            }
        });
    }

    /**
     * Handle touch end
     */
    handleTouchEnd(e) {
        e.preventDefault();
        Array.from(e.changedTouches).forEach(touch => {
            this.touches.delete(touch.identifier);
        });
    }

    /**
     * Handle keyboard shortcuts
     */
    handleKeyDown(e) {
        if (!this.isInitialized) return;

        switch (e.code) {
            case 'Space':
                e.preventDefault();
                this.playCurrentFrequency();
                break;
            case 'KeyC':
                if (e.ctrlKey || e.metaKey) return; // Don't interfere with copy
                this.clearAll();
                break;
            case 'Digit1': this.setGameMode('explore'); break;
            case 'Digit2': this.setGameMode('harmonics'); break;
            case 'Digit3': this.setGameMode('ambient'); break;
            case 'Digit4': this.setGameMode('scales'); break;
        }
    }

    /**
     * Create wave at specific position based on current game mode
     */
    createWaveAtPosition(x, y) {
        const frequency = this.getFrequencyFromPosition(x, y);

        // Create interaction feedback
        this.interactionFeedback.createFrequencyFeedback(x, y, frequency, 0.8);

        // Create particle burst
        this.particleSystem.createBurst(x, y, 3);

        // Create musical note particles
        this.particleSystem.createMusicalResponse(frequency, x, y);

        switch (this.gameMode) {
            case 'explore':
                this.audioManager.createFrequency(frequency, 'sine', 2.0);
                this.wavePhysics.createWaveFromInput(x, y, frequency);
                this.trackWaveCreated();
                break;

            case 'harmonics':
                this.harmonicsEngine.createHarmonicSeries(frequency, 4, 3.0);
                this.soundVisualizer.visualizeHarmonic(frequency, [
                    { frequency: frequency },
                    { frequency: frequency * 2 },
                    { frequency: frequency * 3 },
                    { frequency: frequency * 4 }
                ]);
                this.trackHarmonicCreated();
                break;

            case 'ambient':
                this.harmonicsEngine.createAmbientTexture(frequency, 3, 6.0);
                this.trackHarmonicCreated();
                break;

            case 'scales':
                // Create note based on position
                const notes = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
                const noteIndex = Math.floor((x / this.canvas.width) * notes.length);
                const note = notes[noteIndex];
                const octave = 3 + Math.floor((1 - y / this.canvas.height) * 3);
                const noteFreq = this.harmonicsEngine.noteToFrequency(note, octave);
                if (noteFreq) {
                    this.audioManager.createFrequency(noteFreq, 'sine', 1.5);
                    this.wavePhysics.createWaveFromInput(x, y, noteFreq);
                    this.trackWaveCreated();
                }
                break;
        }
    }    /**
     * Convert position to frequency
     */
    getFrequencyFromPosition(x, y) {
        // Map X position to frequency (20Hz to 2000Hz)
        const minFreq = 80;
        const maxFreq = 880;
        const xRatio = x / this.canvas.width;
        const frequency = minFreq + (maxFreq - minFreq) * xRatio;

        // Y position can modify by octave
        const yRatio = 1 - (y / this.canvas.height);
        const octaveMultiplier = 0.5 + yRatio * 1.5; // 0.5x to 2x

        return frequency * octaveMultiplier;
    }

    /**
     * Play current frequency setting
     */
    playCurrentFrequency() {
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        this.createWaveAtPosition(centerX, centerY);
    }

    /**
     * Set game mode
     */
    setGameMode(mode) {
        if (this.modes[mode]) {
            this.gameMode = mode;
            console.log(`🎮 Game mode: ${mode} - ${this.modes[mode]}`);

            // Update UI to show current mode
            document.querySelectorAll('[data-mode]').forEach(btn => {
                btn.classList.toggle('active', btn.dataset.mode === mode);
            });
        }
    }

    /**
     * Clear all waves and sounds
     */
    clearAll() {
        this.audioManager.stopAllFrequencies();
        this.wavePhysics.clearAllWaves();

        // Clear enhanced systems
        this.particleSystem.clear();
        this.soundVisualizer.clear();
        this.interactionFeedback.clear();

        // Stop any preset
        if (this.presetCompositions) {
            this.presetCompositions.stopPreset();
            document.querySelectorAll('.preset-btn').forEach(btn => btn.classList.remove('playing'));
        }

        console.log('🧹 Cleared all waves, sounds, and effects');
    }

    /**
     * Update UI display
     */
    updateUI() {
        // Update wave count
        const waveCountDisplay = document.querySelector('#wave-count span');
        if (waveCountDisplay) {
            waveCountDisplay.textContent = this.wavePhysics.getWaveCount();
        }

        // Update harmonic count
        const harmonicCountDisplay = document.querySelector('#frequency-count span');
        if (harmonicCountDisplay) {
            harmonicCountDisplay.textContent = this.audioManager.getActiveCount();
        }

        // Update volume display
        const volumeDisplay = document.getElementById('volume-display');
        if (volumeDisplay) {
            volumeDisplay.textContent = `${Math.round(this.currentVolume * 100)}%`;
        }

        // Update frequency display
        this.updateFrequencyDisplay();

        // Update meditation time
        const meditationDisplay = document.querySelector('#meditation-time span');
        if (meditationDisplay && this.gameStats.gameStartTime) {
            const minutes = Math.floor(this.gameStats.meditationTime / 60);
            const seconds = Math.floor(this.gameStats.meditationTime % 60);
            meditationDisplay.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        }
    }

    /**
     * Update badge tracking and check for achievements
     */
    updateBadgeTracking(deltaTime) {
        if (!this.gameStats.gameStartTime) return;

        // Update meditation time
        this.gameStats.meditationTime = (Date.now() - this.gameStats.gameStartTime) / 1000;

        // Check for interference patterns
        if (this.wavePhysics.getWaveCount() > 1) {
            this.gameStats.interferencePatterns++;
        }

        // Check badges periodically (every 5 seconds)
        const now = Date.now();
        if (now - this.gameStats.lastBadgeCheck > 5000) {
            this.checkBadgeAchievements();
            this.gameStats.lastBadgeCheck = now;
        }
    }

    /**
     * Track wave creation for badges
     */
    trackWaveCreated() {
        this.gameStats.wavesCreated++;
        console.log(`🌊 Total waves created: ${this.gameStats.wavesCreated}`);
    }

    /**
     * Track harmonic creation for badges
     */
    trackHarmonicCreated() {
        this.gameStats.harmonicsCreated++;
        console.log(`🎵 Total harmonics created: ${this.gameStats.harmonicsCreated}`);
    }

    /**
     * Check for badge achievements with rate limiting (max 1 badge per 5 minutes)
     */
    /**
     * Validate badge timing (inline logic, no external dependencies)
     */
    validateBadgeTiming() {
        const now = Date.now();
        const timeSinceStart = now - this.gameStats.sessionStartTime;

        // Check grace period
        if (timeSinceStart < this.BADGE_CONFIG.INITIAL_GRACE_PERIOD) {
            const remainingTime = Math.ceil((this.BADGE_CONFIG.INITIAL_GRACE_PERIOD - timeSinceStart) / 1000);
            return {
                canAward: false,
                reason: 'grace_period',
                remainingTime: remainingTime,
                message: `Badges available in ${Math.floor(remainingTime / 60)}m ${remainingTime % 60}s`
            };
        }

        // Check rate limiting
        if (this.gameStats.lastBadgeAwarded > 0 && (now - this.gameStats.lastBadgeAwarded) < this.BADGE_CONFIG.RATE_LIMIT) {
            const remainingTime = Math.ceil((this.BADGE_CONFIG.RATE_LIMIT - (now - this.gameStats.lastBadgeAwarded)) / 1000);
            return {
                canAward: false,
                reason: 'rate_limit',
                remainingTime: remainingTime,
                message: `Next badge available in ${remainingTime}s`
            };
        }

        return {
            canAward: true,
            reason: 'ready',
            remainingTime: 0,
            message: 'Ready for badge award'
        };
    }

    /**
     * Generate badge metadata (inline logic)
     */
    generateBadgeMetadata(badgeId) {
        return {
            gameType: 'frequency',
            awardedAt: Date.now(),
            sessionStats: { ...this.gameStats },
            version: '1.0.1'
        };
    }

    checkBadgeAchievements() {
        if (!this.badgeHelper) return;

        // Use inline badge timing validation
        const timingCheck = this.validateBadgeTiming();

        if (!timingCheck.canAward) {
            if (timingCheck.reason === 'grace_period' && timingCheck.remainingTime % 30 === 0) {
                console.log(`[Frequency Badge] ${timingCheck.message}`);
            }
            return;
        }

        // Check badges in priority order (earliest achievements first)
        const badges = [
            {
                id: 'first_wave',
                condition: () => this.gameStats.wavesCreated >= 1,
                metadata: () => ({
                    waves: this.gameStats.wavesCreated,
                    timestamp: Date.now()
                })
            },
            {
                id: 'harmonic_explorer',
                condition: () => this.gameStats.harmonicsCreated >= 5,
                metadata: () => ({
                    harmonics: this.gameStats.harmonicsCreated,
                    timestamp: Date.now()
                })
            },
            {
                id: 'zen_composer',
                condition: () => this.gameStats.meditationTime >= 600,
                metadata: () => ({
                    meditationTime: this.gameStats.meditationTime,
                    waves: this.gameStats.wavesCreated,
                    timestamp: Date.now()
                })
            },
            {
                id: 'frequency_artist',
                condition: () => this.gameStats.wavesCreated >= 50,
                metadata: () => ({
                    waves: this.gameStats.wavesCreated,
                    harmonics: this.gameStats.harmonicsCreated,
                    timestamp: Date.now()
                })
            },
            {
                id: 'interference_master',
                condition: () => this.gameStats.interferencePatterns >= 20,
                metadata: () => ({
                    interferencePatterns: this.gameStats.interferencePatterns,
                    waves: this.gameStats.wavesCreated,
                    timestamp: Date.now()
                })
            },
            {
                id: 'sonic_architect',
                condition: () => this.gameStats.wavesCreated >= 100 &&
                              this.gameStats.harmonicsCreated >= 20 &&
                              this.gameStats.meditationTime >= 300,
                metadata: () => ({
                    waves: this.gameStats.wavesCreated,
                    harmonics: this.gameStats.harmonicsCreated,
                    meditationTime: this.gameStats.meditationTime,
                    interferencePatterns: this.gameStats.interferencePatterns,
                    timestamp: Date.now()
                })
            }
        ];

        // Try to award the first eligible badge (respecting rate limit)
        for (const badge of badges) {
            if (badge.condition()) {
                // Generate metadata using inline logic
                const metadata = this.generateBadgeMetadata(badge.id);

                this.badgeHelper.awardBadge({
                    badgeId: badge.id,
                    metadata: { ...badge.metadata(), ...metadata }
                }).then(result => {
                    if (result && !result.duplicate) {
                        // Badge was successfully awarded (not a duplicate)
                        this.gameStats.lastBadgeAwarded = Date.now();
                        console.log(`🏆 Frequency badge awarded: ${badge.id}`);
                        return; // Stop checking other badges
                    }
                }).catch(err => {
                    console.log('Badge already awarded or error:', err.message);
                });

                // Important: Only try to award one badge per check
                // Even if awarding fails, we don't want to spam attempts
                return;
            }
        }
    }    /**
     * Update frequency display
     */
    updateFrequencyDisplay() {
        const freqDisplay = document.getElementById('frequency-display');
        if (freqDisplay) {
            freqDisplay.textContent = `${this.currentFrequency.toFixed(1)}Hz`;
        }
    }

    /**
     * Resize canvas to fit container
     */
    resizeCanvas() {
        const container = this.canvas.parentElement;
        const rect = container.getBoundingClientRect();

        this.canvas.width = rect.width;
        this.canvas.height = rect.height;

        console.log(`📐 Canvas resized to ${this.canvas.width}x${this.canvas.height}`);
    }

    /**
     * Play welcome sequence
     */
    playWelcomeSequence() {
        // Create a gentle harmonic welcome
        setTimeout(() => {
            this.harmonicsEngine.createChord(220, 'major', 3.0);
        }, 500);
    }

    /**
     * Render mode-specific overlay
     */
    renderModeOverlay() {
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        this.ctx.font = '16px Arial';
        this.ctx.fillText(`Mode: ${this.gameMode}`, 10, 30);
        this.ctx.fillText(this.modes[this.gameMode], 10, 50);
    }

    /**
     * Destroy game and cleanup resources
     */
    destroy() {
        this.isRunning = false;
        this.clearAll();
        console.log('🎮 Game destroyed');
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Create game instance
    window.frequencyGame = new FrequencyGame('frequency-canvas');

    // Show welcome message
    const welcomeScreen = document.getElementById('welcome-screen');
    const startButton = document.getElementById('start-game-btn');

    if (startButton) {
        startButton.addEventListener('click', async () => {
            const initialized = await window.frequencyGame.initialize();
            if (initialized && welcomeScreen) {
                welcomeScreen.style.display = 'none';
            }
        });
    }

    console.log('🎮 Frequency game ready! Click to start.');
});
