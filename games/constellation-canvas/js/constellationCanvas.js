/**
 * Constellation Canvas - Main game logic and interaction handling
 */
class ConstellationCanvas {
    constructor(canvas, badgeTracker = null) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.stars = new Map();
        this.connections = new Map();
        this.stardust = [];
        this.badgeTracker = badgeTracker;

        // Constellation groups for rotational energy
        this.constellationGroups = new Map(); // groupId -> { stars: Set, centroid: {x, y}, rotationSpeed: number, rotationAngle: number }
        this.starToGroup = new Map(); // starId -> groupId
        this.groupIdCounter = 0;

        // Rotation tracking for badges
        this.fastestRotationSpeed = 0;
        this.blackHoleEventTriggered = false;
        this.blackHoleThreshold = 0.008; // Speed threshold for black hole badge

        // Interaction state
        this.selectedColor = 'white';
        this.isDragging = false;
        this.dragStart = null;
        this.dragEnd = null;
        this.hoveredStar = null;

        // Animation
        this.lastTime = 0;
        this.animationId = null;

        // Temporary connection line
        this.tempConnection = null;

        this.setupEventListeners();
        this.startAnimation();

        console.log('🌌 Constellation Canvas initialized with rotational energy system');
    }

    // Constellation group management for rotational energy
    findConnectedStars(startStarId, visited = new Set()) {
        if (visited.has(startStarId)) return visited;
        visited.add(startStarId);

        const star = this.stars.get(startStarId);
        if (!star) return visited;

        // Find all connections from this star
        star.connections.forEach(connectedStarId => {
            if (!visited.has(connectedStarId)) {
                this.findConnectedStars(connectedStarId, visited);
            }
        });

        return visited;
    }

    calculateCentroid(starIds) {
        let totalX = 0, totalY = 0;
        let count = 0;

        starIds.forEach(starId => {
            const star = this.stars.get(starId);
            if (star) {
                // Use base position if available (for rotating constellations), otherwise use original position
                const baseX = star.baseX || star.originalX;
                const baseY = star.baseY || star.originalY;
                totalX += baseX;
                totalY += baseY;
                count++;
            }
        });

        return count > 0 ? { x: totalX / count, y: totalY / count } : { x: 0, y: 0 };
    }

    calculateRotationSpeed(groupSize) {
        // More connected stars = faster rotation, but need more stars for significant speed
        // Base speed starts at 3 stars, scales more gradually
        if (groupSize < 3) return 0;

        const baseSpeed = 0.0002; // Reduced base rotation speed
        const scaleFactor = Math.pow(groupSize - 2, 1.8); // More exponential scaling, starts at 3 stars
        const maxSpeed = 0.015; // Slightly higher cap for black hole speeds

        return Math.min(baseSpeed * scaleFactor, maxSpeed);
    }

    updateConstellationGroups() {
        // Clear existing groups
        this.constellationGroups.clear();
        this.starToGroup.clear();

        const processedStars = new Set();

        this.stars.forEach((star, starId) => {
            if (processedStars.has(starId)) return;

            // Find all connected stars forming a constellation
            const connectedStars = this.findConnectedStars(starId);

            if (connectedStars.size >= 2) {
                // Create constellation group
                const groupId = this.groupIdCounter++;
                const centroid = this.calculateCentroid(connectedStars);
                const rotationSpeed = this.calculateRotationSpeed(connectedStars.size);

                this.constellationGroups.set(groupId, {
                    stars: new Set(connectedStars),
                    centroid: centroid,
                    rotationSpeed: rotationSpeed,
                    rotationAngle: 0
                });

                // Track fastest rotation speed
                if (rotationSpeed > this.fastestRotationSpeed) {
                    this.fastestRotationSpeed = rotationSpeed;

                    // Award badges for rotation achievements
                    if (this.badgeTracker) {
                        this.badgeTracker.onFastestRotation(rotationSpeed, connectedStars.size);

                        // Check for Black Hole Event Horizon
                        if (rotationSpeed >= this.blackHoleThreshold && !this.blackHoleEventTriggered) {
                            this.blackHoleEventTriggered = true;
                            this.badgeTracker.onBlackHoleEvent(rotationSpeed, connectedStars.size);
                            console.log(`🕳️ BLACK HOLE EVENT HORIZON REACHED! Rotation speed: ${rotationSpeed.toFixed(6)} with ${connectedStars.size} stars`);
                        }
                    }
                }

                // Map each star to its group
                connectedStars.forEach(starId => {
                    this.starToGroup.set(starId, groupId);
                    processedStars.add(starId);
                });

                console.log(`🌟 Constellation group ${groupId} created with ${connectedStars.size} stars, rotation speed: ${rotationSpeed.toFixed(6)}`);
            } else {
                processedStars.add(starId);
            }
        });
    }

    setupEventListeners() {
        // Mouse events
        this.canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.canvas.addEventListener('mouseup', (e) => this.handleMouseUp(e));
        this.canvas.addEventListener('mouseleave', () => this.handleMouseLeave());

        // Touch events for mobile
        this.canvas.addEventListener('touchstart', (e) => this.handleTouchStart(e));
        this.canvas.addEventListener('touchmove', (e) => this.handleTouchMove(e));
        this.canvas.addEventListener('touchend', (e) => this.handleTouchEnd(e));

        // Prevent context menu
        this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());

        // Color palette
        document.querySelectorAll('.star-color').forEach(btn => {
            btn.addEventListener('click', (e) => this.selectColor(e.target.dataset.color));
        });
    }

    getMousePos(e) {
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.canvas.width / (rect.width * (window.devicePixelRatio || 1));
        const scaleY = this.canvas.height / (rect.height * (window.devicePixelRatio || 1));

        return {
            x: (e.clientX - rect.left) * scaleX,
            y: (e.clientY - rect.top) * scaleY
        };
    }

    getTouchPos(e) {
        const rect = this.canvas.getBoundingClientRect();
        const touch = e.touches[0] || e.changedTouches[0];
        const scaleX = this.canvas.width / (rect.width * (window.devicePixelRatio || 1));
        const scaleY = this.canvas.height / (rect.height * (window.devicePixelRatio || 1));

        return {
            x: (touch.clientX - rect.left) * scaleX,
            y: (touch.clientY - rect.top) * scaleY
        };
    }

    handleMouseDown(e) {
        const pos = this.getMousePos(e);
        const clickedStar = this.findStarAt(pos.x, pos.y);

        if (clickedStar) {
            // Start dragging from existing star
            this.isDragging = true;
            this.dragStart = clickedStar;
            this.tempConnection = { start: clickedStar, end: pos };
            clickedStar.playTone(500); // Short tone
        }
    }

    handleMouseMove(e) {
        const pos = this.getMousePos(e);

        // Update hover state
        const hoveredStar = this.findStarAt(pos.x, pos.y);
        if (hoveredStar !== this.hoveredStar) {
            this.hoveredStar = hoveredStar;
            this.canvas.style.cursor = hoveredStar ? 'pointer' : 'crosshair';
        }

        // Update dragging
        if (this.isDragging && this.tempConnection) {
            this.tempConnection.end = pos;
        }
    }

    handleMouseUp(e) {
        const pos = this.getMousePos(e);

        if (this.isDragging) {
            const endStar = this.findStarAt(pos.x, pos.y);

            if (endStar && endStar !== this.dragStart) {
                // Create connection between stars
                this.createConnection(this.dragStart, endStar);
            }

            this.isDragging = false;
            this.dragStart = null;
            this.tempConnection = null;
        } else {
            // Create new star
            this.createStar(pos.x, pos.y);
        }
    }

    handleMouseLeave() {
        this.isDragging = false;
        this.dragStart = null;
        this.tempConnection = null;
        this.hoveredStar = null;
        this.canvas.style.cursor = 'crosshair';
    }

    // Touch event handlers
    handleTouchStart(e) {
        e.preventDefault();
        this.handleMouseDown({ ...e, ...this.getTouchPos(e) });
    }

    handleTouchMove(e) {
        e.preventDefault();
        this.handleMouseMove({ ...e, ...this.getTouchPos(e) });
    }

    handleTouchEnd(e) {
        e.preventDefault();
        this.handleMouseUp({ ...e, ...this.getTouchPos(e) });
    }

    selectColor(color) {
        this.selectedColor = color;

        // Update UI
        document.querySelectorAll('.star-color').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.color === color);
        });
    }

    findStarAt(x, y) {
        for (const star of this.stars.values()) {
            if (star.containsPoint(x, y)) {
                return star;
            }
        }
        return null;
    }

    createStar(x, y) {
        // Create stardust effect
        this.createStardust(x, y, this.selectedColor, 8);

        // Create the star
        const star = new Star(x, y, this.selectedColor, this.canvas);
        this.stars.set(star.id, star);

        // Play creation tone
        star.playTone(2000);

        // Track for badges
        if (this.badgeTracker) {
            this.badgeTracker.onStarCreated(star);
        }

        console.log(`⭐ Created ${this.selectedColor} star at (${x}, ${y})`);
    }

    createConnection(star1, star2) {
        const connectionId = `${Math.min(star1.id, star2.id)}-${Math.max(star1.id, star2.id)}`;

        // Check if connection already exists
        if (this.connections.has(connectionId)) {
            return;
        }

        // Create the connection
        this.connections.set(connectionId, {
            id: connectionId,
            star1: star1,
            star2: star2,
            opacity: 0,
            targetOpacity: 0.8,
            pulsePhase: Math.random() * Math.PI * 2
        });

        // Update star connections
        star1.addConnection(star2.id);
        star2.addConnection(star1.id);

        // Update constellation groups for rotational energy
        this.updateConstellationGroups();

        // Play harmony
        window.celestialAudio.playConstellationHarmony([star1, star2]);

        // Create connection stardust
        const midX = (star1.x + star2.x) / 2;
        const midY = (star1.y + star2.y) / 2;
        this.createStardust(midX, midY, 'white', 6);

        // Track for badges
        if (this.badgeTracker) {
            this.badgeTracker.onConnectionCreated(star1, star2);
        }

        console.log(`🔗 Connected stars ${star1.id} and ${star2.id}`);
    }

    createStardust(x, y, color, count = 5) {
        for (let i = 0; i < count; i++) {
            const particle = new StardustParticle(
                x + (Math.random() - 0.5) * 20,
                y + (Math.random() - 0.5) * 20,
                color
            );
            this.stardust.push(particle);
        }
    }

    clearSky() {
        // Stop all audio
        this.stars.forEach(star => star.stopTone());

        // Clear everything
        this.stars.clear();
        this.connections.clear();
        this.stardust = [];
        this.constellationGroups.clear();
        this.starToGroup.clear();
        this.isDragging = false;
        this.dragStart = null;
        this.tempConnection = null;

        // Reset rotation tracking
        this.fastestRotationSpeed = 0;
        this.blackHoleEventTriggered = false;

        console.log('🌌 Sky cleared - all constellation groups and rotation tracking reset');
    }

    update(currentTime) {
        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;

        // Update constellation group rotations first
        this.updateConstellationRotations(deltaTime);

        // Apply gravitational interactions between rotating groups and other stars/groups
        this.updateGravitationalInteractions(deltaTime);

        // Update stars
        this.stars.forEach(star => star.update(deltaTime));

        // Update connections (pulsing effect)
        this.connections.forEach(connection => {
            connection.pulsePhase += 0.02;
            if (connection.opacity < connection.targetOpacity) {
                connection.opacity = Math.min(
                    connection.opacity + 0.02,
                    connection.targetOpacity
                );
            }
        });

        // Update stardust
        this.stardust = this.stardust.filter(particle => particle.update(deltaTime));
    }

    updateConstellationRotations(deltaTime) {
        // Update rotation angles for each constellation group
        this.constellationGroups.forEach((group, groupId) => {
            if (group.rotationSpeed > 0) {
                group.rotationAngle += group.rotationSpeed * deltaTime;

                // Apply rotation to each star in the group
                group.stars.forEach(starId => {
                    const star = this.stars.get(starId);
                    if (star) {
                        // If this is the first rotation, store the original position as the base for rotation
                        if (!star.baseX) {
                            star.baseX = star.originalX;
                            star.baseY = star.originalY;
                        }

                        // Calculate position relative to group centroid using the stored base position
                        const dx = star.baseX - group.centroid.x;
                        const dy = star.baseY - group.centroid.y;
                        const distance = Math.sqrt(dx * dx + dy * dy);
                        const originalAngle = Math.atan2(dy, dx);

                        // Apply rotation
                        const newAngle = originalAngle + group.rotationAngle;
                        const newX = group.centroid.x + Math.cos(newAngle) * distance;
                        const newY = group.centroid.y + Math.sin(newAngle) * distance;

                        // Update star's rotated position
                        star.originalX = newX;
                        star.originalY = newY;
                    }
                });
            }
        });
    }

    updateGravitationalInteractions(deltaTime) {
        // Skip if no constellation groups exist
        if (this.constellationGroups.size === 0) return;

        const interactionRadius = 150; // Distance at which interactions occur
        const displacementForce = 0.5; // Base displacement force
        const minDisplacement = 2; // Minimum displacement distance

        // Get all constellation groups sorted by rotational energy (highest first)
        const sortedGroups = Array.from(this.constellationGroups.entries())
            .sort(([, groupA], [, groupB]) => {
                const energyA = this.calculateRotationalEnergy(groupA);
                const energyB = this.calculateRotationalEnergy(groupB);
                return energyB - energyA;
            });

        // Debug: Log active groups
        if (sortedGroups.length > 1) {
            console.log(`🌌 Gravitational Check: ${sortedGroups.length} constellation groups active`);
        }

        // Check interactions between rotating groups and individual stars
        for (const [groupId, group] of sortedGroups) {
            if (group.rotationSpeed <= 0) continue;

            const groupEnergy = this.calculateRotationalEnergy(group);

            // Check against all stars not in this group (and not in any other group)
            this.stars.forEach((targetStar, targetStarId) => {
                if (group.stars.has(targetStarId)) return; // Skip stars in this group
                if (this.starToGroup.has(targetStarId)) return; // Skip stars that belong to any constellation group

                const distance = this.calculateDistance(group.centroid, targetStar);
                if (distance > interactionRadius) return; // Too far for interaction

                const targetEnergy = this.calculateStarEnergy(targetStar);

                // Only displace if this group has more energy (which should always be true now)
                if (groupEnergy > targetEnergy) {
                    this.applyDisplacement(group, targetStar, distance, groupEnergy, targetEnergy, deltaTime);
                }
            });
        }

        // Check constellation group to constellation group interactions
        for (let i = 0; i < sortedGroups.length; i++) {
            const [groupId, group] = sortedGroups[i];
            if (group.rotationSpeed <= 0) continue; // Only rotating groups can displace others

            const groupEnergy = this.calculateRotationalEnergy(group);

            // Check against ALL other groups (not just lower energy ones)
            for (let j = 0; j < sortedGroups.length; j++) {
                if (i === j) continue; // Skip self

                const [otherGroupId, otherGroup] = sortedGroups[j];

                const distance = this.calculateDistance(group.centroid, otherGroup.centroid);
                if (distance > interactionRadius * 1.5) continue; // Larger radius for group-group interactions

                const otherGroupEnergy = this.calculateRotationalEnergy(otherGroup);

                // The higher energy group displaces the lower energy group
                if (groupEnergy > otherGroupEnergy) {
                    this.applyGroupDisplacement(group, otherGroup, distance, groupEnergy, otherGroupEnergy, deltaTime);
                    console.log(`🌌 Constellation interaction: Group ${groupId} (energy: ${groupEnergy.toFixed(3)}) displacing Group ${otherGroupId} (energy: ${otherGroupEnergy.toFixed(3)}) at distance ${distance.toFixed(1)}`);
                }
            }
        }
    }

    calculateRotationalEnergy(group) {
        // Energy = rotation speed * group size * radius of rotation
        const groupRadius = this.calculateGroupRadius(group);
        const rotationalEnergy = group.rotationSpeed * group.stars.size * groupRadius * 1000; // Massive multiplier for rotation

        // Even non-rotating groups have significant mass energy from their connections
        // Mass increases exponentially with group size to represent gravitational binding
        const massEnergy = Math.pow(group.stars.size, 2) * 50; // Exponential mass scaling

        // Additional energy from total connections within the group
        let totalConnections = 0;
        group.stars.forEach(starId => {
            const star = this.stars.get(starId);
            if (star) {
                totalConnections += star.connections.size;
            }
        });
        const connectionEnergy = totalConnections * 25; // Strong connection energy

        return rotationalEnergy + massEnergy + connectionEnergy;
    }

    calculateStarEnergy(star) {
        // Individual stars have minimal energy - they should be easily displaced by constellations
        return Math.max(star.connections.size * 2, 1); // Minimal energy, max 1 for isolated stars
    }    calculateGroupRadius(group) {
        // Calculate average distance of stars from centroid
        let totalDistance = 0;
        let count = 0;

        group.stars.forEach(starId => {
            const star = this.stars.get(starId);
            if (star) {
                const distance = this.calculateDistance(group.centroid, star);
                totalDistance += distance;
                count++;
            }
        });

        return count > 0 ? totalDistance / count : 50;
    }

    calculateDistance(pos1, pos2) {
        const dx = pos1.x - pos2.x;
        const dy = pos1.y - pos2.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    applyDisplacement(sourceGroup, targetStar, distance, sourceEnergy, targetEnergy, deltaTime) {
        // Calculate displacement vector from source to target
        const dx = targetStar.originalX - sourceGroup.centroid.x;
        const dy = targetStar.originalY - sourceGroup.centroid.y;
        const normalizedDistance = Math.max(distance, 1); // Prevent division by zero

        // Normalize the displacement vector
        const forceX = dx / normalizedDistance;
        const forceY = dy / normalizedDistance;

        // Calculate displacement magnitude based on energy difference and distance
        const energyRatio = sourceEnergy / (targetEnergy + 1);
        const distanceEffect = Math.max(0, 1 - (distance / 150)); // Stronger effect when closer

        // Cap the energy ratio to prevent extreme displacements but ensure constellation dominance
        const cappedEnergyRatio = Math.min(energyRatio, 100); // Allow strong but not infinite displacement
        const displacementMagnitude = cappedEnergyRatio * distanceEffect * 0.01 * deltaTime; // Reduced scaling due to higher energies

        // Apply displacement with momentum based on source rotation
        const rotationalMomentum = sourceGroup.rotationSpeed * 1000 + 10; // Base momentum even for non-rotating groups
        const finalDisplacement = Math.max(displacementMagnitude * rotationalMomentum, 3 * deltaTime);

        console.log(`⭐ Star displacement: Constellation energy: ${sourceEnergy.toFixed(1)}, Star energy: ${targetEnergy.toFixed(1)}, Ratio: ${energyRatio.toFixed(1)}, Final displacement: ${finalDisplacement.toFixed(2)}`);

        // Update star position
        targetStar.originalX += forceX * finalDisplacement;
        targetStar.originalY += forceY * finalDisplacement;

        // Keep stars within canvas bounds
        this.constrainStarToBounds(targetStar);

        // Track displacement event for badges
        if (this.badgeTracker && finalDisplacement > 5 * deltaTime) { // Only track significant displacements
            this.badgeTracker.onDisplacementEvent(sourceEnergy, targetEnergy, finalDisplacement);
        }

        // Visual effect for displacement
        this.createStardust(targetStar.originalX, targetStar.originalY, targetStar.color, 3);
    }

    applyGroupDisplacement(sourceGroup, targetGroup, distance, sourceEnergy, targetEnergy, deltaTime) {
        // Calculate displacement vector from source to target group
        const dx = targetGroup.centroid.x - sourceGroup.centroid.x;
        const dy = targetGroup.centroid.y - sourceGroup.centroid.y;
        const normalizedDistance = Math.max(distance, 1);

        // Normalize the displacement vector
        const forceX = dx / normalizedDistance;
        const forceY = dy / normalizedDistance;

        // Calculate displacement magnitude
        const energyRatio = sourceEnergy / (targetEnergy + 1);
        const distanceEffect = Math.max(0, 1 - (distance / 225)); // Weaker for group interactions
        const displacementMagnitude = energyRatio * distanceEffect * 0.4 * deltaTime; // Increased from 0.2

        // Apply displacement to all stars in the target group
        const rotationalMomentum = sourceGroup.rotationSpeed * 120; // Increased from 80
        const finalDisplacement = Math.max(displacementMagnitude * rotationalMomentum, 3 * deltaTime); // Increased minimum

        targetGroup.stars.forEach(starId => {
            const star = this.stars.get(starId);
            if (star) {
                // Update both base position and current position
                if (star.baseX) {
                    star.baseX += forceX * finalDisplacement;
                    star.baseY += forceY * finalDisplacement;
                }
                star.originalX += forceX * finalDisplacement;
                star.originalY += forceY * finalDisplacement;

                // Keep stars within canvas bounds
                this.constrainStarToBounds(star);
            }
        });

        // Update target group centroid after displacement
        const newCentroid = this.calculateCentroid(targetGroup.stars);
        targetGroup.centroid = newCentroid;

        // Ensure group rotation continues after displacement by updating base positions
        targetGroup.stars.forEach(starId => {
            const star = this.stars.get(starId);
            if (star && star.baseX) {
                // Recalculate base positions relative to new centroid to maintain group cohesion
                const dx = star.originalX - newCentroid.x;
                const dy = star.originalY - newCentroid.y;
                star.baseX = newCentroid.x + dx;
                star.baseY = newCentroid.y + dy;
            }
        });

        // Track group displacement event for badges
        if (this.badgeTracker && finalDisplacement > 3 * deltaTime) { // Only track significant group displacements
            this.badgeTracker.onDisplacementEvent(sourceEnergy, targetEnergy, finalDisplacement * targetGroup.stars.size);
        }

        // Visual effect for group displacement
        this.createStardust(targetGroup.centroid.x, targetGroup.centroid.y, 'white', 8);

        // Additional visual effects for strong interactions
        if (finalDisplacement > 5 * deltaTime) {
            // Create stardust at multiple points along the displacement vector
            for (let i = 1; i <= 3; i++) {
                const trailX = targetGroup.centroid.x - (forceX * finalDisplacement * i * 0.3);
                const trailY = targetGroup.centroid.y - (forceY * finalDisplacement * i * 0.3);
                this.createStardust(trailX, trailY, 'gold', 4);
            }
        }
    }

    constrainStarToBounds(star) {
        const margin = 20;
        star.originalX = Math.max(margin, Math.min(this.canvas.width - margin, star.originalX));
        star.originalY = Math.max(margin, Math.min(this.canvas.height - margin, star.originalY));

        // Also update base position if it exists
        if (star.baseX) {
            star.baseX = star.originalX;
            star.baseY = star.originalY;
        }
    }

    draw() {
        // Clear canvas with subtle gradient
        const gradient = this.ctx.createRadialGradient(
            this.canvas.width / 2, this.canvas.height / 2, 0,
            this.canvas.width / 2, this.canvas.height / 2, Math.max(this.canvas.width, this.canvas.height) / 2
        );
        gradient.addColorStop(0, 'rgba(10, 10, 26, 0.95)');
        gradient.addColorStop(1, 'rgba(5, 5, 16, 0.98)');

        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw connections
        this.drawConnections();

        // Draw temporary connection line
        if (this.tempConnection) {
            this.drawTempConnection();
        }

        // Draw stars
        this.stars.forEach(star => star.draw(this.ctx));

        // Draw stardust
        this.stardust.forEach(particle => particle.draw(this.ctx));

        // Draw hover highlight
        if (this.hoveredStar) {
            this.drawHoverHighlight(this.hoveredStar);
        }
    }

    drawConnections() {
        this.ctx.save();

        this.connections.forEach(connection => {
            const { star1, star2, opacity, pulsePhase } = connection;

            if (opacity <= 0) return;

            const pulseIntensity = 0.3 + 0.7 * (0.5 + 0.5 * Math.sin(pulsePhase));
            const currentOpacity = opacity * pulseIntensity;

            // Create gradient line
            const gradient = this.ctx.createLinearGradient(
                star1.x, star1.y, star2.x, star2.y
            );
            gradient.addColorStop(0, `rgba(255, 255, 255, ${currentOpacity * 0.1})`);
            gradient.addColorStop(0.5, `rgba(255, 255, 255, ${currentOpacity})`);
            gradient.addColorStop(1, `rgba(255, 255, 255, ${currentOpacity * 0.1})`);

            this.ctx.strokeStyle = gradient;
            this.ctx.lineWidth = 1 + pulseIntensity;
            this.ctx.lineCap = 'round';

            this.ctx.beginPath();
            this.ctx.moveTo(star1.x, star1.y);
            this.ctx.lineTo(star2.x, star2.y);
            this.ctx.stroke();
        });

        this.ctx.restore();
    }

    drawTempConnection() {
        const { start, end } = this.tempConnection;

        this.ctx.save();
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        this.ctx.lineWidth = 1;
        this.ctx.setLineDash([5, 5]);

        this.ctx.beginPath();
        this.ctx.moveTo(start.x, start.y);
        this.ctx.lineTo(end.x, end.y);
        this.ctx.stroke();

        this.ctx.restore();
    }

    drawHoverHighlight(star) {
        this.ctx.save();

        const pulseSize = star.size * (2 + 0.5 * Math.sin(Date.now() * 0.01));

        this.ctx.strokeStyle = `rgba(255, 255, 255, 0.3)`;
        this.ctx.lineWidth = 2;
        this.ctx.setLineDash([]);

        this.ctx.beginPath();
        this.ctx.arc(star.x, star.y, pulseSize, 0, Math.PI * 2);
        this.ctx.stroke();

        this.ctx.restore();
    }

    startAnimation() {
        const animate = (currentTime) => {
            this.update(currentTime);
            this.draw();
            this.animationId = requestAnimationFrame(animate);
        };

        this.animationId = requestAnimationFrame(animate);
    }

    stopAnimation() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }

    destroy() {
        this.stopAnimation();
        this.clearSky();
    }
}
