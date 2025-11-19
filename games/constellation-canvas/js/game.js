/**
 * Constellation Canvas Game - Main initialization and control logic
 */
class ConstellationCanvasGame {
    constructor() {
        this.canvas = null;
        this.constellationCanvas = null;
        this.meteorShower = null;
        this.badgeHelper = null;
        this.badgeTracker = null;
        this.isInitialized = false;

        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            this.init();
        }
    }

    init() {
        try {
            this.canvas = document.getElementById('starCanvas');
            if (!this.canvas) {
                throw new Error('Canvas element not found');
            }

            // Ensure all dependencies are loaded before initializing
            if (typeof ConstellationBadgeHelper === 'undefined' ||
                typeof ConstellationBadgeTracker === 'undefined' ||
                typeof ConstellationCanvas === 'undefined' ||
                typeof MeteorShower === 'undefined') {
                console.warn('[Game] Dependencies not fully loaded yet, waiting...');
                setTimeout(() => this.init(), 100);
                return;
            }

            // Initialize badge system first (uses new Wavelength SDK)
            this.badgeHelper = new ConstellationBadgeHelper();
            this.badgeTracker = new ConstellationBadgeTracker(this.badgeHelper);

            // Initialize game systems
            this.constellationCanvas = new ConstellationCanvas(this.canvas, this.badgeTracker);
            this.meteorShower = new MeteorShower(this.canvas);

            // Setup controls
            this.setupControls();

            // Setup resize handling
            this.setupResize();

            // Start the game loop enhancement (for meteor showers)
            this.startGameLoop();

            this.isInitialized = true;

            console.log('🌟 Constellation Canvas Game initialized successfully with badge system!');

            // Welcome message
            this.showWelcome();

        } catch (error) {
            console.error('Failed to initialize Constellation Canvas:', error);
        }
    }

    setupControls() {
        // Clear Sky button
        const clearBtn = document.getElementById('clearSky');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => this.clearSky());
        }

        // Meteor Shower button
        const meteorBtn = document.getElementById('meteorShower');
        if (meteorBtn) {
            meteorBtn.addEventListener('click', () => this.triggerMeteorShower());
        }

        // Toggle Music button
        const musicBtn = document.getElementById('toggleMusic');
        if (musicBtn) {
            musicBtn.addEventListener('click', () => this.toggleMusic());
        }

        // Fullscreen button
        const fullscreenBtn = document.getElementById('fullscreenBtn');
        if (fullscreenBtn) {
            fullscreenBtn.addEventListener('click', () => this.toggleFullscreen());
        }

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeydown(e));

        // Fullscreen change events
        document.addEventListener('fullscreenchange', () => this.onFullscreenChange());
        document.addEventListener('webkitfullscreenchange', () => this.onFullscreenChange());
        document.addEventListener('mozfullscreenchange', () => this.onFullscreenChange());
    }

    setupResize() {
        const resizeCanvas = () => {
            const container = this.canvas.parentElement;
            const rect = container.getBoundingClientRect();

            // Check if we're in fullscreen
            const isFullscreen = document.fullscreenElement ||
                                document.webkitFullscreenElement ||
                                document.mozFullScreenElement;

            let width, height;

            if (isFullscreen) {
                // In fullscreen, use the full viewport
                width = window.innerWidth;
                height = window.innerHeight;
            } else {
                // Normal mode - constrain to container with max sizes
                const maxWidth = Math.min(1200, rect.width - 40);
                const maxHeight = Math.min(800, rect.height - 40);
                width = maxWidth;
                height = maxHeight;
            }

            // Set canvas resolution with device pixel ratio for crisp rendering
            const dpr = window.devicePixelRatio || 1;
            this.canvas.width = width * dpr;
            this.canvas.height = height * dpr;

            // Scale context to match device pixel ratio
            const ctx = this.canvas.getContext('2d');
            ctx.scale(dpr, dpr);

            // Set CSS size
            this.canvas.style.width = width + 'px';
            this.canvas.style.height = height + 'px';

            console.log(`🖼️ Canvas resized: ${width}x${height} (${this.canvas.width}x${this.canvas.height} resolution, fullscreen: ${!!isFullscreen})`);
        };

        window.addEventListener('resize', resizeCanvas);
        resizeCanvas(); // Initial resize
    }

    startGameLoop() {
        let lastTime = 0;

        const gameLoop = (currentTime) => {
            const deltaTime = currentTime - lastTime;
            lastTime = currentTime;

            // Update meteor shower
            this.meteorShower.update(deltaTime);

            // Update badge tracker play time
            if (this.badgeTracker) {
                this.badgeTracker.updatePlayTime();
                // Update rotation stats display
                this.updateRotationStats();
            }

            requestAnimationFrame(gameLoop);
        };

        requestAnimationFrame(gameLoop);
    }

    updateRotationStats() {
        if (!this.badgeTracker) return;

        const stats = this.badgeTracker.getGameStats();

        // Update fastest rotation display
        const fastestRotationEl = document.getElementById('fastest-rotation');
        if (fastestRotationEl) {
            const rotationSpeed = stats.fastestRotationSpeed || 0;
            fastestRotationEl.textContent = rotationSpeed.toFixed(6);

            // Add visual effect for high rotation speeds
            if (rotationSpeed >= 0.008) {
                fastestRotationEl.style.color = '#ef4444'; // Red for black hole speeds
                fastestRotationEl.style.textShadow = '0 0 10px #ef4444';
            } else if (rotationSpeed >= 0.003) {
                fastestRotationEl.style.color = '#fbbf24'; // Gold for fast rotation
                fastestRotationEl.style.textShadow = '0 0 5px #fbbf24';
            } else {
                fastestRotationEl.style.color = '#10b981'; // Green for normal
                fastestRotationEl.style.textShadow = 'none';
            }
        }

        // Update black hole count display
        const blackHoleCountEl = document.getElementById('black-hole-count');
        if (blackHoleCountEl) {
            const blackHoleCount = stats.blackHoleEventsTriggered || 0;
            blackHoleCountEl.textContent = blackHoleCount.toString();

            // Add visual effect for black hole events
            if (blackHoleCount > 0) {
                blackHoleCountEl.style.color = '#ef4444';
                blackHoleCountEl.style.textShadow = '0 0 10px #ef4444';
            } else {
                blackHoleCountEl.style.color = '#10b981';
                blackHoleCountEl.style.textShadow = 'none';
            }
        }
    }

    handleKeydown(e) {
        switch (e.code) {
            case 'KeyC':
                if (e.ctrlKey || e.metaKey) return; // Don't interfere with copy
                this.clearSky();
                e.preventDefault();
                break;

            case 'KeyM':
                this.triggerMeteorShower();
                e.preventDefault();
                break;

            case 'Space':
                this.triggerMeteorShower();
                e.preventDefault();
                break;

            case 'KeyS':
                this.toggleMusic();
                e.preventDefault();
                break;

            case 'KeyF':
                this.toggleFullscreen();
                e.preventDefault();
                break;

            case 'F11':
                // Let F11 work naturally but also trigger our handler
                setTimeout(() => this.onFullscreenChange(), 100);
                break;

            // Number keys for color selection
            case 'Digit1':
                this.selectColor('white');
                e.preventDefault();
                break;
            case 'Digit2':
                this.selectColor('blue');
                e.preventDefault();
                break;
            case 'Digit3':
                this.selectColor('gold');
                e.preventDefault();
                break;
            case 'Digit4':
                this.selectColor('red');
                e.preventDefault();
                break;
            case 'Digit5':
                this.selectColor('purple');
                e.preventDefault();
                break;
            case 'Digit6':
                this.selectColor('green');
                e.preventDefault();
                break;
        }
    }

    selectColor(color) {
        if (this.constellationCanvas) {
            this.constellationCanvas.selectColor(color);
        }
    }

    clearSky() {
        if (this.constellationCanvas) {
            this.constellationCanvas.clearSky();
            this.meteorShower.stop();

            // Reset badge tracker statistics
            if (this.badgeTracker) {
                this.badgeTracker.resetStats();
                // Reset rotation stats display
                this.updateRotationStats();
            }

            // Visual feedback
            this.showMessage('🌌 Night sky cleared', 2000);
        }
    }

    triggerMeteorShower() {
        if (this.meteorShower) {
            if (this.meteorShower.isActive) {
                // If already active, just add a single meteor
                this.meteorShower.createSingleMeteor();
            } else {
                // Start full shower
                this.meteorShower.start();
                this.showMessage('☄️ Meteor shower incoming!', 3000);
            }

            // Track meteor shower for badges
            if (this.badgeTracker) {
                this.badgeTracker.onMeteorShower();
            }
        }
    }

    toggleMusic() {
        if (window.celestialAudio) {
            const isEnabled = window.celestialAudio.toggle();
            const musicBtn = document.getElementById('toggleMusic');

            if (musicBtn) {
                musicBtn.textContent = isEnabled ? '🎵 Toggle Music' : '🔇 Toggle Music';
                musicBtn.style.opacity = isEnabled ? '1' : '0.6';
            }

            this.showMessage(
                isEnabled ? '🎵 Music enabled' : '🔇 Music disabled',
                2000
            );
        }
    }

    toggleFullscreen() {
        const container = this.canvas.parentElement;

        if (!document.fullscreenElement && !document.webkitFullscreenElement && !document.mozFullScreenElement) {
            // Enter fullscreen
            if (container.requestFullscreen) {
                container.requestFullscreen();
            } else if (container.webkitRequestFullscreen) {
                container.webkitRequestFullscreen();
            } else if (container.mozRequestFullScreen) {
                container.mozRequestFullScreen();
            }
        } else {
            // Exit fullscreen
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            } else if (document.mozCancelFullScreen) {
                document.mozCancelFullScreen();
            }
        }
    }

    onFullscreenChange() {
        const fullscreenBtn = document.getElementById('fullscreenBtn');
        const isFullscreen = document.fullscreenElement ||
                           document.webkitFullscreenElement ||
                           document.mozFullScreenElement;

        if (fullscreenBtn) {
            fullscreenBtn.textContent = isFullscreen ? '🔳 Exit Fullscreen' : '🔲 Fullscreen';
        }

        // Trigger resize to adjust canvas
        setTimeout(() => {
            const resizeEvent = new Event('resize');
            window.dispatchEvent(resizeEvent);
        }, 100);

        this.showMessage(
            isFullscreen ? '🔲 Entered fullscreen - Press F11 or button to exit' : '🔳 Exited fullscreen',
            2000
        );
    }

    showWelcome() {
        this.showMessage('🌙 Welcome to Constellation Canvas! Click to create stars, drag to connect them ✨', 4000);
    }

    showMessage(text, duration = 3000) {
        // Remove existing message
        const existing = document.querySelector('.game-message');
        if (existing) {
            existing.remove();
        }

        // Create new message
        const message = document.createElement('div');
        message.className = 'game-message';
        message.textContent = text;
        message.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0, 0, 0, 0.8);
            backdrop-filter: blur(10px);
            color: white;
            padding: 15px 25px;
            border-radius: 25px;
            border: 1px solid rgba(255, 255, 255, 0.2);
            font-size: 1rem;
            font-weight: 500;
            z-index: 1000;
            pointer-events: none;
            animation: messageSlideIn 0.5s ease-out;
        `;

        // Add CSS animation
        if (!document.querySelector('#message-styles')) {
            const style = document.createElement('style');
            style.id = 'message-styles';
            style.textContent = `
                @keyframes messageSlideIn {
                    0% {
                        opacity: 0;
                        transform: translate(-50%, -50%) translateY(20px);
                    }
                    100% {
                        opacity: 1;
                        transform: translate(-50%, -50%) translateY(0);
                    }
                }

                @keyframes messageSlideOut {
                    0% {
                        opacity: 1;
                        transform: translate(-50%, -50%) translateY(0);
                    }
                    100% {
                        opacity: 0;
                        transform: translate(-50%, -50%) translateY(-20px);
                    }
                }
            `;
            document.head.appendChild(style);
        }

        document.body.appendChild(message);

        // Auto remove after duration
        setTimeout(() => {
            if (message.parentNode) {
                message.style.animation = 'messageSlideOut 0.5s ease-in forwards';
                setTimeout(() => {
                    if (message.parentNode) {
                        message.remove();
                    }
                }, 500);
            }
        }, duration);
    }

    // Enhanced draw method that includes meteor shower rendering
    enhanceCanvasDraw() {
        if (!this.constellationCanvas) return;

        const originalDraw = this.constellationCanvas.draw.bind(this.constellationCanvas);

        this.constellationCanvas.draw = () => {
            // Call original draw method
            originalDraw();

            // Add meteor shower rendering
            if (this.meteorShower) {
                this.meteorShower.draw(this.constellationCanvas.ctx);
            }
        };
    }

    destroy() {
        if (this.constellationCanvas) {
            this.constellationCanvas.destroy();
        }

        if (this.meteorShower) {
            this.meteorShower.stop();
        }

        // Remove event listeners
        document.removeEventListener('keydown', this.handleKeydown);
        window.removeEventListener('resize', this.setupResize);
    }
}

// Initialize the game when script loads
window.addEventListener('load', () => {
    const game = new ConstellationCanvasGame();

    // Enhance the canvas drawing after initialization
    setTimeout(() => {
        if (game.isInitialized) {
            game.enhanceCanvasDraw();
        }
    }, 100);

    // Store reference for debugging
    window.constellationGame = game;
});
