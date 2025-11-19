// Mood Melodies - p5.js Audio Engine
// Interactive music maker that responds to emotions
// Part of Wavelength Cozy Game SDK

// Global variables
let canvas;
let currentMood = 'calm';
let currentInstrument = 'piano';
let particles = [];
let notes = [];
let moodColors = {};
let startTime;
let sessionTime = 0;
let stats = {
    melodiesCreated: 0,
    moodsExplored: new Set(['calm']),
    sessionStart: Date.now(),
    badgesEarned: 0
};

// Audio variables
let oscillators = [];
let reverb;
let masterVolume = 0.7;
let backgroundAmbient;
let isInitialized = false;

// Gesture tracking for melody counting
let currentGesture = {
    isActive: false,
    points: [],
    vectorChanges: 0,
    lastVector: null,
    startTime: 0
};

// Musical scales and moods
const moodSettings = {
    happy: {
        scale: ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5'],
        baseFreq: 261.63, // C4
        color: [255, 215, 0], // Gold
        tempo: 120,
        harmony: [0, 2, 4], // Major triad
        waveform: 'sawtooth'
    },
    calm: {
        scale: ['C4', 'D4', 'F4', 'G4', 'A4', 'C5'],
        baseFreq: 220.00, // A3
        color: [135, 206, 235], // Sky blue
        tempo: 60,
        harmony: [0, 3, 5], // Soft harmonies
        waveform: 'sine'
    },
    dreamy: {
        scale: ['C4', 'Eb4', 'F4', 'G4', 'Bb4', 'C5'],
        baseFreq: 174.61, // F3
        color: [221, 160, 221], // Plum
        tempo: 40,
        harmony: [0, 2, 5], // Suspended chords
        waveform: 'triangle'
    },
    energetic: {
        scale: ['C4', 'D4', 'E4', 'F#4', 'G4', 'A4', 'B4', 'C5'],
        baseFreq: 293.66, // D4
        color: [255, 107, 107], // Coral
        tempo: 140,
        harmony: [0, 2, 4], // Bright major
        waveform: 'square'
    },
    melancholy: {
        scale: ['C4', 'D4', 'Eb4', 'F4', 'G4', 'Ab4', 'Bb4', 'C5'],
        baseFreq: 195.99, // G3
        color: [70, 130, 180], // Steel blue
        tempo: 70,
        harmony: [0, 2, 5], // Minor harmonies
        waveform: 'sine'
    },
    mysterious: {
        scale: ['C4', 'Db4', 'E4', 'F4', 'Gb4', 'A4', 'Bb4', 'C5'],
        baseFreq: 146.83, // D3
        color: [139, 75, 139], // Dark magenta
        tempo: 80,
        harmony: [0, 1, 4], // Diminished
        waveform: 'sawtooth'
    }
};

const instrumentSettings = {
    piano: {
        attack: 0.01,
        decay: 0.3,
        sustain: 0.5,
        release: 0.8,
        harmonics: [1, 0.5, 0.25]
    },
    chimes: {
        attack: 0.1,
        decay: 2.0,
        sustain: 0.1,
        release: 3.0,
        harmonics: [1, 0.3, 0.7, 0.2]
    },
    strings: {
        attack: 0.5,
        decay: 0.2,
        sustain: 0.8,
        release: 1.5,
        harmonics: [1, 0.8, 0.4, 0.2]
    },
    flute: {
        attack: 0.2,
        decay: 0.1,
        sustain: 0.9,
        release: 0.5,
        harmonics: [1, 0.2, 0.1]
    },
    ambient: {
        attack: 1.0,
        decay: 0.5,
        sustain: 0.9,
        release: 2.0,
        harmonics: [1, 0.6, 0.3, 0.15]
    },
    nature: {
        attack: 0.3,
        decay: 1.0,
        sustain: 0.4,
        release: 2.5,
        harmonics: [1, 0.4, 0.8, 0.1, 0.3]
    }
};

function setup() {
    // Create canvas in the designated container
    let canvasContainer = document.getElementById('p5-canvas-holder');

    // Make canvas responsive to container size
    let canvasWidth = min(windowWidth - 40, 800); // Leave some margin, max 800
    let canvasHeight = min(windowHeight * 0.6, 600); // 60% of viewport height, max 600

    // Ensure minimum size for mobile
    canvasWidth = max(canvasWidth, 280);
    canvasHeight = max(canvasHeight, 300);

    canvas = createCanvas(canvasWidth, canvasHeight);
    canvas.parent('p5-canvas-holder');

    // Initialize audio context
    initializeAudio();

    // Set up mood colors
    setupMoodColors();

    // Set up UI event listeners
    setupUIControls();

    // Initialize stats
    updateStats();

    console.log('🎵 Mood Melodies initialized successfully!');
}

function initializeAudio() {
    try {
        // Create reverb effect
        reverb = new p5.Reverb();
        reverb.process(masterVolume);
        reverb.set(3, 2); // room size, damping

        // Set master volume
        masterGain(masterVolume);

        isInitialized = true;
        console.log('🔊 Audio engine initialized');
    } catch (error) {
        console.log('⚠️ Audio initialization will happen on first interaction');
    }
}

function setupMoodColors() {
    // Extract colors for easy access
    for (let mood in moodSettings) {
        moodColors[mood] = color(moodSettings[mood].color);
    }
}

function setupUIControls() {
    // Mood button listeners
    document.querySelectorAll('.mood-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            changeMood(e.target.dataset.mood);

            // Update active mood button
            document.querySelectorAll('.mood-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
        });
    });

    // Instrument button listeners
    document.querySelectorAll('.instrument-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            changeInstrument(e.target.dataset.instrument);

            // Update active instrument button
            document.querySelectorAll('.instrument-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
        });
    });

    // Volume slider
    document.getElementById('volume-slider').addEventListener('input', (e) => {
        masterVolume = e.target.value / 100;
        masterGain(masterVolume);
    });
}

function draw() {
    // Create mood-based background gradient
    let bgColor = moodColors[currentMood];

    for (let i = 0; i <= height; i++) {
        let inter = map(i, 0, height, 0, 1);
        let c = lerpColor(color(0, 0, 20), bgColor, inter * 0.2);
        stroke(c);
        line(0, i, width, i);
    }

    // Update and draw particles
    updateParticles();

    // Update session time
    updateSessionTimer();

    // Draw current playing notes
    drawActiveNotes();

    // Draw mood indicator
    drawMoodIndicator();

    // Draw gesture feedback
    drawGestureFeedback();
}

function mousePressed() {
    // Ensure audio context is started on first interaction
    if (!isInitialized && getAudioContext().state !== 'running') {
        userStartAudio();
        isInitialized = true;
    }

    if (mouseX >= 0 && mouseX <= width && mouseY >= 0 && mouseY <= height) {
        // Start a new gesture
        startNewGesture(mouseX, mouseY);
        createNote(mouseX, mouseY);
        return false; // Prevent default behavior
    }
}function mouseDragged() {
    if (mouseX >= 0 && mouseX <= width && mouseY >= 0 && mouseY <= height) {
        // Continue the current gesture
        updateGesture(mouseX, mouseY);
        createNote(mouseX, mouseY);
        return false;
    }
}

function mouseReleased() {
    // End the current gesture
    endGesture();
}

// Touch support for mobile devices
function touchStarted() {
    // Ensure audio context is started on first interaction
    if (!isInitialized && getAudioContext().state !== 'running') {
        userStartAudio();
        isInitialized = true;
    }

    // Use touches array for better compatibility
    let currentTouch = touches[0] || { x: touchX, y: touchY };
    let x = currentTouch.x || touchX || 0;
    let y = currentTouch.y || touchY || 0;

    // Check if touch is within canvas bounds
    if (x >= 0 && x <= width && y >= 0 && y <= height) {
        // Start a new gesture
        startNewGesture(x, y);
        createNote(x, y);
        return false; // Prevent default behavior (scrolling, zooming, etc.)
    }
}

function touchMoved() {
    // Use touches array for better compatibility
    let currentTouch = touches[0] || { x: touchX, y: touchY };
    let x = currentTouch.x || touchX || 0;
    let y = currentTouch.y || touchY || 0;

    // Check if touch is within canvas bounds
    if (x >= 0 && x <= width && y >= 0 && y <= height) {
        // Continue the current gesture
        updateGesture(x, y);
        createNote(x, y);
        return false; // Prevent default scrolling
    }
}

function touchEnded() {
    // End the current gesture
    endGesture();
    return false; // Prevent default behavior
}

function createNote(x, y) {
    // Always allow note creation once audio is initialized

    // Map mouse position to musical parameters
    let moodData = moodSettings[currentMood];
    let instrumentData = instrumentSettings[currentInstrument];

    // Calculate frequency based on Y position and mood scale
    let scaleIndex = Math.floor(map(y, 0, height, moodData.scale.length - 1, 0));
    let frequency = moodData.baseFreq * Math.pow(2, scaleIndex / 12);

    // Calculate volume based on X position
    let volume = map(x, 0, width, 0.1, 0.8) * masterVolume;    // Create oscillator
    let osc = new p5.Oscillator(moodData.waveform);
    osc.freq(frequency);
    osc.amp(0);

    // Create envelope for natural sound
    let env = new p5.Envelope();
    env.setADSR(
        instrumentData.attack,
        instrumentData.decay,
        instrumentData.sustain,
        instrumentData.release
    );

    // Connect to reverb and play
    osc.disconnect();
    osc.connect(reverb);
    osc.start();
    env.play(osc, 0, volume);

    // Create visual particle
    let particle = {
        x: x,
        y: y,
        vx: random(-2, 2),
        vy: random(-3, -1),
        life: 255,
        maxLife: 255,
        color: moodColors[currentMood],
        frequency: frequency,
        size: map(volume, 0.1, 0.8, 5, 20)
    };

    particles.push(particle);

    // Add to notes for visualization
    notes.push({
        x: x,
        y: y,
        time: millis(),
        frequency: frequency,
        volume: volume,
        oscillator: osc,
        envelope: env
    });

    // Clean up oscillator after note ends
    setTimeout(() => {
        if (osc) {
            osc.stop();
            osc.dispose();
        }
    }, (instrumentData.attack + instrumentData.decay + instrumentData.release) * 1000);

    // Note: Melody counting now happens in gesture system, not per note

    // Record note creation in badge system (but not melody count)
    if (window.moodMelodiesBadges) {
        window.moodMelodiesBadges.recordNoteCreation(currentMood, currentInstrument);
    }
}function updateParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
        let p = particles[i];

        // Update position
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.1; // gravity

        // Update life
        p.life -= 2;

        // Draw particle
        push();
        translate(p.x, p.y);

        // Color based on frequency and mood
        let alpha = map(p.life, 0, p.maxLife, 0, 255);
        fill(red(p.color), green(p.color), blue(p.color), alpha);
        noStroke();

        // Size based on frequency
        let size = map(p.life, 0, p.maxLife, 0, p.size);
        ellipse(0, 0, size);

        // Trail effect
        stroke(red(p.color), green(p.color), blue(p.color), alpha * 0.3);
        strokeWeight(2);
        line(0, 0, -p.vx * 3, -p.vy * 3);

        pop();

        // Remove dead particles
        if (p.life <= 0) {
            particles.splice(i, 1);
        }
    }
}

function drawActiveNotes() {
    // Visual representation of currently playing notes
    let currentTime = millis();

    for (let i = notes.length - 1; i >= 0; i--) {
        let note = notes[i];
        let age = currentTime - note.time;

        if (age < 2000) { // Show notes for 2 seconds
            let alpha = map(age, 0, 2000, 100, 0);

            push();
            stroke(red(moodColors[currentMood]), green(moodColors[currentMood]), blue(moodColors[currentMood]), alpha);
            strokeWeight(3);
            noFill();

            let radius = map(age, 0, 2000, 5, 30);
            circle(note.x, note.y, radius);
            pop();
        } else {
            notes.splice(i, 1);
        }
    }
}

function drawMoodIndicator() {
    // Draw current mood indicator in corner
    push();
    translate(width - 100, 30);

    fill(moodColors[currentMood]);
    noStroke();
    ellipse(0, 0, 40);

    fill(255);
    textAlign(CENTER, CENTER);
    textSize(12);
    text(currentMood.toUpperCase(), 0, 50);

    pop();
}

function changeMood(newMood) {
    currentMood = newMood;
    stats.moodsExplored.add(newMood);
    console.log(`🎭 Mood changed to: ${newMood}`);

    // Create mood transition effect
    for (let i = 0; i < 10; i++) {
        let particle = {
            x: width / 2 + random(-50, 50),
            y: height / 2 + random(-50, 50),
            vx: random(-5, 5),
            vy: random(-5, 5),
            life: 255,
            maxLife: 255,
            color: moodColors[newMood],
            size: random(10, 30)
        };
        particles.push(particle);
    }

    checkBadges();
}

function changeInstrument(newInstrument) {
    currentInstrument = newInstrument;
    console.log(`🎼 Instrument changed to: ${newInstrument}`);
}

function updateStats() {
    document.getElementById('melodies-count').textContent = stats.melodiesCreated;
    document.getElementById('moods-count').textContent = stats.moodsExplored.size;
    document.getElementById('badges-count').textContent = stats.badgesEarned;

    // Show grace period status if applicable
    if (window.moodMelodiesBadges && !window.moodMelodiesBadges.debugMode) {
        const currentTime = Date.now();
        const timeSinceStart = currentTime - window.moodMelodiesBadges.gameStartTime;
        const gracePeriod = window.moodMelodiesBadges.gracePeriod;

        if (timeSinceStart < gracePeriod) {
            const remainingSeconds = Math.ceil((gracePeriod - timeSinceStart) / 1000);
            const remainingMinutes = Math.floor(remainingSeconds / 60);
            const displaySeconds = remainingSeconds % 60;

            const badgeElement = document.getElementById('badges-count');
            badgeElement.title = `Grace period: ${remainingMinutes}:${displaySeconds.toString().padStart(2, '0')} until badges available`;
            badgeElement.style.color = '#ffc107';
        } else {
            const badgeElement = document.getElementById('badges-count');
            badgeElement.title = 'Badges available!';
            badgeElement.style.color = '#e94560';
        }
    }
}

function updateSessionTimer() {
    let elapsed = Math.floor((Date.now() - stats.sessionStart) / 1000);
    let minutes = Math.floor(elapsed / 60);
    let seconds = elapsed % 60;
    document.getElementById('session-time').textContent =
        `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

    // Update badge system with session time
    if (window.moodMelodiesBadges) {
        window.moodMelodiesBadges.updateSessionTime(Date.now() - stats.sessionStart);
    }
}function checkBadges() {
    // Badge checking logic will be implemented with badge system integration
    // For now, just update the counter
    updateStats();

    // Example badge triggers (will be connected to actual badge system):
    if (stats.melodiesCreated >= 5) {
        console.log('🏆 Badge earned: Music Maker!');
    }

    if (stats.moodsExplored.size >= 3) {
        console.log('🏆 Badge earned: Emotional Explorer!');
    }

    if (stats.melodiesCreated >= 20) {
        console.log('🏆 Badge earned: Virtuoso!');
    }
}

// Gesture tracking functions
function startNewGesture(x, y) {
    currentGesture = {
        isActive: true,
        points: [{x: x, y: y, time: millis()}],
        vectorChanges: 0,
        lastVector: null,
        startTime: millis()
    };
}

function updateGesture(x, y) {
    if (!currentGesture.isActive) return;

    // Add new point
    currentGesture.points.push({x: x, y: y, time: millis()});

    // Calculate vector change if we have at least 2 points
    if (currentGesture.points.length >= 2) {
        let prevPoint = currentGesture.points[currentGesture.points.length - 2];
        let currentPoint = currentGesture.points[currentGesture.points.length - 1];

        // Calculate current movement vector
        let currentVector = {
            x: currentPoint.x - prevPoint.x,
            y: currentPoint.y - prevPoint.y
        };

        // Normalize vector magnitude for comparison
        let magnitude = Math.sqrt(currentVector.x * currentVector.x + currentVector.y * currentVector.y);

        // Only analyze if movement is significant enough
        if (magnitude > 3) { // Reduced from 5 to 3 for easier detection
            currentVector.x /= magnitude;
            currentVector.y /= magnitude;

            // Compare with last vector to detect direction change
            if (currentGesture.lastVector) {
                let dotProduct = currentVector.x * currentGesture.lastVector.x + currentVector.y * currentGesture.lastVector.y;

                // More forgiving threshold: 0.8 instead of 0.7
                if (dotProduct < 0.8) {
                    currentGesture.vectorChanges++;
                    console.log(`🎵 Vector change detected! Total: ${currentGesture.vectorChanges}, dot product: ${dotProduct.toFixed(3)}`);
                }
            }

            currentGesture.lastVector = currentVector;
        }
    }
}function endGesture() {
    if (!currentGesture.isActive) return;

    let gestureDuration = millis() - currentGesture.startTime;

    console.log(`🎵 Gesture Analysis:
        Vector Changes: ${currentGesture.vectorChanges}
        Duration: ${gestureDuration}ms
        Points: ${currentGesture.points.length}
        Required: 2+ changes AND 800ms+ duration OR 3+ changes AND 300ms+ duration
        Result: ${((currentGesture.vectorChanges >= 2 && gestureDuration >= 800) || (currentGesture.vectorChanges >= 3 && gestureDuration >= 300)) ? 'MELODY!' : 'Not a melody'}`);

    // More lenient requirements: 2+ vector changes OR 3+ with shorter duration
    if ((currentGesture.vectorChanges >= 2 && gestureDuration >= 800) ||
        (currentGesture.vectorChanges >= 3 && gestureDuration >= 300)) {
        stats.melodiesCreated++;
        console.log(`🎵 ✅ MELODY CREATED! Vector changes: ${currentGesture.vectorChanges}, Duration: ${gestureDuration}ms`);

        // Record melody creation in badge system
        if (window.moodMelodiesBadges) {
            window.moodMelodiesBadges.recordMelodyCreation(currentMood, currentInstrument);
        }

        checkBadges();

        // Visual feedback for completed melody
        createMelodyFeedback();
    } else {
        console.log(`🎵 ❌ Not a melody - Vector changes: ${currentGesture.vectorChanges}, Duration: ${gestureDuration}ms`);
    }

    // Reset gesture
    currentGesture.isActive = false;
}

function createMelodyFeedback() {
    // Create celebratory particles when a melody is completed
    for (let i = 0; i < 15; i++) {
        let particle = {
            x: width / 2 + random(-100, 100),
            y: height / 2 + random(-100, 100),
            vx: random(-8, 8),
            vy: random(-8, 8),
            life: 255,
            maxLife: 255,
            color: moodColors[currentMood],
            size: random(15, 25)
        };
        particles.push(particle);
    }
}

function drawGestureFeedback() {
    if (currentGesture.isActive && currentGesture.points.length > 1) {
        // Draw the current gesture path
        push();
        stroke(255, 255, 255, 150);
        strokeWeight(3);
        noFill();

        beginShape();
        for (let point of currentGesture.points) {
            vertex(point.x, point.y);
        }
        endShape();

        // Show gesture info near the last point
        if (currentGesture.points.length > 0) {
            let lastPoint = currentGesture.points[currentGesture.points.length - 1];
            let duration = millis() - currentGesture.startTime;

            // Background for text
            fill(0, 0, 0, 150);
            rect(lastPoint.x + 10, lastPoint.y - 25, 160, 50);

            // Vector changes text
            fill(255, 255, 0);
            textAlign(LEFT, CENTER);
            textSize(12);
            text(`Changes: ${currentGesture.vectorChanges}`, lastPoint.x + 15, lastPoint.y - 10);
            text(`Duration: ${Math.floor(duration)}ms`, lastPoint.x + 15, lastPoint.y + 5);

            // Progress indicator
            let progress = 0;
            if (currentGesture.vectorChanges >= 2 && duration >= 800) progress = 100;
            else if (currentGesture.vectorChanges >= 3 && duration >= 300) progress = 100;
            else {
                // Show progress toward melody
                let changeProgress = Math.min(100, (currentGesture.vectorChanges / 2) * 50);
                let timeProgress = Math.min(50, (duration / 800) * 50);
                progress = changeProgress + timeProgress;
            }

            if (progress >= 100) {
                fill(0, 255, 0);
                text('MELODY READY!', lastPoint.x + 15, lastPoint.y + 20);
            } else {
                fill(255, 255, 255);
                text(`Progress: ${Math.floor(progress)}%`, lastPoint.x + 15, lastPoint.y + 20);
            }
        }

        pop();
    }
}// Handle window resize
function windowResized() {
    // Calculate responsive canvas size
    let canvasWidth = min(windowWidth - 40, 800); // Leave some margin, max 800
    let canvasHeight = min(windowHeight * 0.6, 600); // 60% of viewport height, max 600

    // Ensure minimum size for mobile
    canvasWidth = max(canvasWidth, 280);
    canvasHeight = max(canvasHeight, 300);

    resizeCanvas(canvasWidth, canvasHeight);
}

// Initialize global badge system and set game start time
window.gameStartTime = Date.now();

console.log('🎵 Mood Melodies Audio Engine Loaded!');
