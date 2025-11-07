/**
 * VIBE Coding Template: Simple Collector Game Engine
 * This file handles the core game mechanics in a beginner-friendly way
 */

class SimpleCollectorGame {
    constructor() {
        this.gameConfig = null;
        this.gameState = {
            score: 0,
            itemsCollected: 0,
            collectionGoal: 50,
            playerPosition: { x: 400, y: 300 },
            items: [],
            collectedItems: []
        };

        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.player = document.getElementById('player');

        this.keys = new Set();
        this.touchDirections = new Set();

        this.lastSpawnTime = 0;
        this.spawnInterval = 3000; // 3 seconds between spawns

        this.init();
    }

    async init() {
        await this.loadGameConfig();
        this.setupCanvas();
        this.setupControls();
        this.setupUI();
        this.startGameLoop();

        console.log('🎮 Simple Collector Game initialized!');
    }

    async loadGameConfig() {
        try {
            const response = await fetch('game.json');
            this.gameConfig = await response.json();

            // Apply theme to CSS variables
            this.applyTheme();

            // Update UI with config
            document.getElementById('gameTitle').textContent = this.gameConfig.title;
            document.getElementById('gameDescription').textContent = this.gameConfig.description;
            this.gameState.collectionGoal = this.gameConfig.gameplay.collectionGoal;

        } catch (error) {
            console.error('Could not load game config:', error);
            // Use defaults if config fails to load
            this.gameConfig = this.getDefaultConfig();
        }
    }

    applyTheme() {
        const theme = this.gameConfig.theme;
        const root = document.documentElement;

        root.style.setProperty('--primary-color', theme.primaryColor);
        root.style.setProperty('--secondary-color', theme.secondaryColor);
        root.style.setProperty('--background-color', theme.backgroundColor);
        root.style.setProperty('--text-color', theme.textColor);
        root.style.setProperty('--accent-color', theme.accentColor);
        root.style.setProperty('--main-font', theme.font);
    }

    setupCanvas() {
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
    }

    resizeCanvas() {
        const container = this.canvas.parentElement;
        this.canvas.width = container.clientWidth;
        this.canvas.height = container.clientHeight;
    }

    setupControls() {
        // Keyboard controls
        document.addEventListener('keydown', (e) => {
            this.keys.add(e.code);
            e.preventDefault();
        });

        document.addEventListener('keyup', (e) => {
            this.keys.delete(e.code);
            e.preventDefault();
        });

        // Mobile touch controls
        this.setupTouchControls();

        // Canvas click for item collection
        this.canvas.addEventListener('click', (e) => {
            this.handleCanvasClick(e);
        });
    }

    setupTouchControls() {
        const dpadButtons = document.querySelectorAll('.dpad-btn');

        dpadButtons.forEach(button => {
            const direction = button.dataset.direction;
            if (!direction) return;

            const startMovement = (e) => {
                e.preventDefault();
                this.touchDirections.add(direction);
                button.style.opacity = '0.7';
            };

            const stopMovement = (e) => {
                e.preventDefault();
                this.touchDirections.delete(direction);
                button.style.opacity = '1';
            };

            button.addEventListener('touchstart', startMovement, { passive: false });
            button.addEventListener('mousedown', startMovement);
            button.addEventListener('touchend', stopMovement, { passive: false });
            button.addEventListener('mouseup', stopMovement);
            button.addEventListener('touchcancel', stopMovement, { passive: false });
            button.addEventListener('mouseleave', stopMovement);
        });
    }

    setupUI() {
        // Collection panel
        document.getElementById('collectionBtn').addEventListener('click', () => {
            this.showCollectionPanel();
        });

        document.getElementById('closePanelBtn').addEventListener('click', () => {
            this.hideCollectionPanel();
        });

        // Settings panel
        document.getElementById('settingsBtn').addEventListener('click', () => {
            this.showSettingsPanel();
        });

        document.getElementById('closeSettingsBtn').addEventListener('click', () => {
            this.hideSettingsPanel();
        });

        // Help panel
        document.getElementById('helpBtn').addEventListener('click', () => {
            this.showHelpPanel();
        });

        document.getElementById('closeHelpBtn').addEventListener('click', () => {
            this.hideHelpPanel();
        });

        // Settings controls
        document.getElementById('musicVolume').addEventListener('input', (e) => {
            this.setMusicVolume(e.target.value / 100);
        });

        document.getElementById('soundVolume').addEventListener('input', (e) => {
            this.setSoundVolume(e.target.value / 100);
        });

        document.getElementById('highContrast').addEventListener('change', (e) => {
            document.body.classList.toggle('high-contrast', e.target.checked);
        });

        document.getElementById('largeText').addEventListener('change', (e) => {
            document.body.classList.toggle('large-text', e.target.checked);
        });
    }

    startGameLoop() {
        const gameLoop = () => {
            this.update();
            this.render();
            requestAnimationFrame(gameLoop);
        };
        gameLoop();
    }

    update() {
        this.updatePlayerMovement();
        this.updateItems();
        this.spawnItems();
        this.updateUI();
    }

    updatePlayerMovement() {
        const speed = 5; // pixels per frame
        let deltaX = 0;
        let deltaY = 0;
        let moved = false;

        // Keyboard input
        if (this.keys.has('ArrowLeft') || this.keys.has('KeyA')) {
            deltaX = -speed;
            moved = true;
        }
        if (this.keys.has('ArrowRight') || this.keys.has('KeyD')) {
            deltaX = speed;
            moved = true;
        }
        if (this.keys.has('ArrowUp') || this.keys.has('KeyW')) {
            deltaY = -speed;
            moved = true;
        }
        if (this.keys.has('ArrowDown') || this.keys.has('KeyS')) {
            deltaY = speed;
            moved = true;
        }

        // Touch input
        if (this.touchDirections.has('left')) {
            deltaX = -speed;
            moved = true;
        }
        if (this.touchDirections.has('right')) {
            deltaX = speed;
            moved = true;
        }
        if (this.touchDirections.has('up')) {
            deltaY = -speed;
            moved = true;
        }
        if (this.touchDirections.has('down')) {
            deltaY = speed;
            moved = true;
        }

        // Apply movement
        if (moved) {
            this.gameState.playerPosition.x += deltaX;
            this.gameState.playerPosition.y += deltaY;

            // Keep player on screen
            this.gameState.playerPosition.x = Math.max(50, Math.min(this.canvas.width - 50, this.gameState.playerPosition.x));
            this.gameState.playerPosition.y = Math.max(50, Math.min(this.canvas.height - 50, this.gameState.playerPosition.y));

            // Update player element position
            this.player.style.left = this.gameState.playerPosition.x + 'px';
            this.player.style.top = this.gameState.playerPosition.y + 'px';

            // Add moving animation
            this.player.classList.add('moving');
        } else {
            this.player.classList.remove('moving');
        }
    }

    updateItems() {
        // Update item positions and remove old items
        this.gameState.items = this.gameState.items.filter(item => {
            return Date.now() - item.spawnTime < 30000; // Remove after 30 seconds
        });
    }

    spawnItems() {
        const now = Date.now();
        if (now - this.lastSpawnTime > this.spawnInterval) {
            this.spawnRandomItem();
            this.lastSpawnTime = now;
        }
    }

    spawnRandomItem() {
        if (!this.gameConfig || !this.gameConfig.gameplay.itemsToCollect) return;

        const items = this.gameConfig.gameplay.itemsToCollect;

        // Calculate spawn probabilities
        let totalWeight = 0;
        items.forEach(item => {
            totalWeight += item.spawnRate;
        });

        // Pick random item based on spawn rate
        let random = Math.random() * totalWeight;
        let selectedItem = null;

        for (let item of items) {
            random -= item.spawnRate;
            if (random <= 0) {
                selectedItem = item;
                break;
            }
        }

        if (!selectedItem) selectedItem = items[0];

        // Create item at random position
        const item = {
            ...selectedItem,
            id: Date.now() + Math.random(),
            x: Math.random() * (this.canvas.width - 100) + 50,
            y: Math.random() * (this.canvas.height - 100) + 50,
            spawnTime: Date.now()
        };

        this.gameState.items.push(item);
        this.createItemElement(item);
    }

    createItemElement(item) {
        const itemElement = document.createElement('div');
        itemElement.className = 'collectible-item';
        itemElement.style.left = item.x + 'px';
        itemElement.style.top = item.y + 'px';
        itemElement.textContent = item.emoji;
        itemElement.dataset.itemId = item.id;

        // Add click handler
        itemElement.addEventListener('click', () => {
            this.collectItem(item.id);
        });

        document.getElementById('gameItems').appendChild(itemElement);

        // Add entrance animation
        itemElement.classList.add('fade-in');
    }

    collectItem(itemId) {
        const itemIndex = this.gameState.items.findIndex(item => item.id === itemId);
        if (itemIndex === -1) return;

        const item = this.gameState.items[itemIndex];

        // Add to collected items
        this.gameState.collectedItems.push(item);
        this.gameState.itemsCollected++;
        this.gameState.score += item.points;

        // Remove from active items
        this.gameState.items.splice(itemIndex, 1);

        // Remove DOM element with animation
        const itemElement = document.querySelector(`[data-item-id="${itemId}"]`);
        if (itemElement) {
            itemElement.classList.add('collected');
            setTimeout(() => {
                itemElement.remove();
            }, 800);
        }

        // Play sound effect (if available)
        this.playSound(item.soundEffect);

        console.log(`Collected ${item.name}! Score: ${this.gameState.score}`);
    }

    handleCanvasClick(e) {
        const rect = this.canvas.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const clickY = e.clientY - rect.top;

        // Check if click is near any item
        const clickRadius = 50;

        for (let item of this.gameState.items) {
            const distance = Math.sqrt(
                Math.pow(clickX - item.x, 2) + Math.pow(clickY - item.y, 2)
            );

            if (distance <= clickRadius) {
                this.collectItem(item.id);
                break;
            }
        }
    }

    updateUI() {
        document.getElementById('itemCount').textContent = this.gameState.itemsCollected;
        document.getElementById('scoreValue').textContent = this.gameState.score;

        const progress = (this.gameState.itemsCollected / this.gameState.collectionGoal) * 100;
        document.getElementById('progressFill').style.width = Math.min(progress, 100) + '%';
    }

    render() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw background (if needed)
        this.drawBackground();

        // Draw game world elements
        this.drawWorldElements();
    }

    drawBackground() {
        // Create a simple gradient background
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, '#87CEEB');
        gradient.addColorStop(0.4, '#98FB98');
        gradient.addColorStop(1, '#90EE90');

        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    drawWorldElements() {
        // Draw decorative elements (trees, grass, etc.)
        this.drawTrees();
        this.drawGrass();
    }

    drawTrees() {
        const treeCount = 8;
        for (let i = 0; i < treeCount; i++) {
            const x = (i * this.canvas.width / treeCount) + Math.sin(Date.now() * 0.001 + i) * 20;
            const y = this.canvas.height - 150 + Math.sin(Date.now() * 0.002 + i) * 30;

            // Tree trunk
            this.ctx.fillStyle = '#8B4513';
            this.ctx.fillRect(x - 10, y, 20, 60);

            // Tree crown
            this.ctx.fillStyle = '#228B22';
            this.ctx.beginPath();
            this.ctx.arc(x, y - 10, 30, 0, Math.PI * 2);
            this.ctx.fill();
        }
    }

    drawGrass() {
        const grassCount = 20;
        for (let i = 0; i < grassCount; i++) {
            const x = Math.random() * this.canvas.width;
            const y = this.canvas.height - 20;

            this.ctx.strokeStyle = '#90EE90';
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            this.ctx.moveTo(x, y);
            this.ctx.lineTo(x + Math.random() * 10 - 5, y - 10);
            this.ctx.stroke();
        }
    }

    // Panel management
    showCollectionPanel() {
        this.updateCollectionPanel();
        document.getElementById('collectionPanel').classList.remove('hidden');
    }

    hideCollectionPanel() {
        document.getElementById('collectionPanel').classList.add('hidden');
    }

    showSettingsPanel() {
        document.getElementById('settingsPanel').classList.remove('hidden');
    }

    hideSettingsPanel() {
        document.getElementById('settingsPanel').classList.add('hidden');
    }

    showHelpPanel() {
        document.getElementById('helpPanel').classList.remove('hidden');
    }

    hideHelpPanel() {
        document.getElementById('helpPanel').classList.add('hidden');
    }

    updateCollectionPanel() {
        const container = document.getElementById('collectedItems');
        container.innerHTML = '';

        // Group items by type
        const itemCounts = {};
        this.gameState.collectedItems.forEach(item => {
            if (!itemCounts[item.id]) {
                itemCounts[item.id] = { ...item, count: 0 };
            }
            itemCounts[item.id].count++;
        });

        // Display unique items
        Object.values(itemCounts).forEach(item => {
            const itemElement = document.createElement('div');
            itemElement.className = 'collected-item';

            itemElement.innerHTML = `
                <div class="item-emoji">${item.emoji}</div>
                <div class="item-name">${item.name}</div>
                <div class="item-description">${item.description}</div>
                <div class="item-count">Collected: ${item.count}</div>
            `;

            container.appendChild(itemElement);
        });

        if (Object.keys(itemCounts).length === 0) {
            container.innerHTML = '<p style="text-align: center; color: #666;">No items collected yet. Go explore!</p>';
        }
    }

    // Audio methods (placeholder)
    playSound(soundName) {
        // Placeholder for sound effects
        console.log(`Playing sound: ${soundName}`);
    }

    setMusicVolume(volume) {
        // Placeholder for music volume
        console.log(`Music volume set to: ${volume}`);
    }

    setSoundVolume(volume) {
        // Placeholder for sound volume
        console.log(`Sound volume set to: ${volume}`);
    }

    getDefaultConfig() {
        return {
            title: "My Cozy Collection Game",
            description: "A peaceful adventure",
            theme: {
                primaryColor: "#4a7c59",
                secondaryColor: "#8fbc8f",
                backgroundColor: "#f0f8ea",
                textColor: "#2d5016",
                accentColor: "#ff6b6b",
                font: "Georgia, serif"
            },
            gameplay: {
                collectionGoal: 50,
                itemsToCollect: [
                    {
                        id: "flower",
                        name: "Flower",
                        emoji: "🌸",
                        description: "A beautiful flower",
                        rarity: "common",
                        points: 10,
                        spawnRate: 0.5,
                        soundEffect: "chime"
                    }
                ]
            }
        };
    }
}

// Export for other files
window.SimpleCollectorGame = SimpleCollectorGame;