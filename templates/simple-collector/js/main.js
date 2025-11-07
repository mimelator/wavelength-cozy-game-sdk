/**
 * VIBE Coding Template: Main Game Initialization
 * This is where everything comes together!
 */

// Wait for the page to load completely
document.addEventListener('DOMContentLoaded', () => {
    console.log('🌟 Starting VIBE Coded Game...');

    // Initialize the game
    const game = new SimpleCollectorGame();

    // Add game logic extensions
    setTimeout(() => {
        const gameLogic = new GameLogicExtensions(game);

        // Enable special effects
        gameLogic.addSpecialEffects();
        gameLogic.addCustomItemBehaviors();
        gameLogic.addSeasonalEvents();

        console.log('✨ Game fully loaded and ready to play!');
        showWelcomeMessage();
    }, 1000);

    // Make game globally accessible for debugging
    window.game = game;
});

function showWelcomeMessage() {
    // Show a friendly welcome message
    const welcome = document.createElement('div');
    welcome.className = 'welcome-message';
    welcome.innerHTML = `
        <div class="welcome-content">
            <h2>🌟 Welcome to Your Cozy Game! 🌟</h2>
            <p>Move around with WASD or arrow keys</p>
            <p>Click on items to collect them</p>
            <p>Check your collection with the 📖 button</p>
            <button onclick="this.parentElement.parentElement.remove()" class="welcome-btn">
                Let's Play! 🎮
            </button>
        </div>
    `;

    welcome.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.7);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 2000;
        backdrop-filter: blur(5px);
    `;

    const content = welcome.querySelector('.welcome-content');
    content.style.cssText = `
        background: white;
        padding: 2rem;
        border-radius: 20px;
        text-align: center;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        max-width: 400px;
        margin: 1rem;
    `;

    const button = welcome.querySelector('.welcome-btn');
    button.style.cssText = `
        background: #4a7c59;
        color: white;
        border: none;
        padding: 1rem 2rem;
        border-radius: 25px;
        font-size: 1.1rem;
        cursor: pointer;
        margin-top: 1rem;
        transition: all 0.3s ease;
    `;

    document.body.appendChild(welcome);

    // Auto-remove after 10 seconds if user doesn't click
    setTimeout(() => {
        if (welcome.parentElement) {
            welcome.remove();
        }
    }, 10000);
}

// Add helpful debugging functions
window.debugGame = {
    addScore: (points) => {
        if (window.game) {
            window.game.gameState.score += points;
            console.log(`Added ${points} points! New score: ${window.game.gameState.score}`);
        }
    },

    spawnItem: (itemType) => {
        if (window.game) {
            window.game.spawnRandomItem();
            console.log('Spawned random item!');
        }
    },

    showAllPanels: () => {
        document.querySelectorAll('.hidden').forEach(panel => {
            panel.classList.remove('hidden');
        });
    },

    resetGame: () => {
        if (window.game) {
            window.game.gameState.score = 0;
            window.game.gameState.itemsCollected = 0;
            window.game.gameState.collectedItems = [];
            window.game.gameState.items = [];

            // Clear visual items
            document.getElementById('gameItems').innerHTML = '';

            console.log('Game reset!');
        }
    }
};

// Add keyboard shortcuts for testing
document.addEventListener('keydown', (e) => {
    // Press 'T' to spawn test item
    if (e.code === 'KeyT' && e.ctrlKey) {
        if (window.game) {
            window.game.spawnRandomItem();
            console.log('Test item spawned!');
        }
        e.preventDefault();
    }

    // Press 'R' to reset game
    if (e.code === 'KeyR' && e.ctrlKey) {
        window.debugGame.resetGame();
        e.preventDefault();
    }

    // Press 'C' to open collection
    if (e.code === 'KeyC') {
        document.getElementById('collectionBtn').click();
        e.preventDefault();
    }
});

// Add error handling
window.addEventListener('error', (e) => {
    console.error('Game Error:', e.error);

    // Show user-friendly error message
    const errorMsg = document.createElement('div');
    errorMsg.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: #ff6b6b;
        color: white;
        padding: 1rem;
        border-radius: 10px;
        z-index: 1000;
        font-family: Arial, sans-serif;
    `;
    errorMsg.textContent = 'Oops! Something went wrong. The game is still playable!';

    document.body.appendChild(errorMsg);

    setTimeout(() => errorMsg.remove(), 5000);
});

// Save game progress to localStorage
function saveGameProgress() {
    if (window.game) {
        const saveData = {
            score: window.game.gameState.score,
            itemsCollected: window.game.gameState.itemsCollected,
            collectedItems: window.game.gameState.collectedItems,
            timestamp: Date.now()
        };

        localStorage.setItem('vibeGameProgress', JSON.stringify(saveData));
        console.log('Game progress saved!');
    }
}

// Load game progress from localStorage
function loadGameProgress() {
    try {
        const saveData = localStorage.getItem('vibeGameProgress');
        if (saveData && window.game) {
            const data = JSON.parse(saveData);

            // Only load if save is less than 24 hours old
            if (Date.now() - data.timestamp < 24 * 60 * 60 * 1000) {
                window.game.gameState.score = data.score;
                window.game.gameState.itemsCollected = data.itemsCollected;
                window.game.gameState.collectedItems = data.collectedItems || [];

                console.log('Game progress loaded!');
                return true;
            }
        }
    } catch (error) {
        console.log('No previous game progress found');
    }
    return false;
}

// Auto-save every 30 seconds
setInterval(saveGameProgress, 30000);

// Save when page is about to close
window.addEventListener('beforeunload', saveGameProgress);

console.log('🎮 VIBE Coding Template loaded successfully!');
console.log('💡 Tip: Press Ctrl+T to spawn test items, Ctrl+R to reset');
console.log('💡 Tip: Type debugGame.addScore(100) in console for quick testing');