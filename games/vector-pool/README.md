# Vector Pool Asteroids

A retro-style vector graphics game that combines the zero-gravity drift of *Asteroids* with the precision physics of billiards.

![Vector Style](screenshot.png)

## 🎮 How to Play

The goal is to clear the table by knocking the geometric shapes into the four corner pockets.

- **Aim & Shoot:** Click/Touch the ship and drag back (slingshot style) to launch.
- **Targeting:** Double-click anywhere on the field to auto-pilot the ship towards that location.
- **Physics:**
  - Objects drift with very low friction.
  - High-speed collisions **shatter** larger shapes into smaller pieces.
  - Clear the board to respawn more targets.

### Special Mechanics
The cosmos is unpredictable. Watch out for anomalies:
- **⚫ Black Hole (Press B):** A massive gravity well that sucks in nearby objects and ejects them at high speed.
- **⚪ White Hole (Press W):** An unstable anomaly that spews asteroids and repels everything with a strong force field.
- **☄️ Comet Storm (Press C):** Fast-moving comets streak across the table, smashing everything in their path.
- **☀️ Solar Flare (Press S):** Intense radiation that distorts vision and interferes with sensors.

## 🛠️ Technologies

Built from scratch with vanilla JavaScript and WebGL to achieve a performant, authentic vector monitor aesthetic.

- **Custom WebGL Engine:** Hand-written batch renderer for glowing vector lines.
- **Post-Processing:** Custom shaders for CRT curvature, chromatic aberration, and scanlines.
- **Physics Engine:** Custom impulse-based 2D physics with elastic collisions and sub-stepping.
- **Procedural Audio:** Real-time sound synthesis using the Web Audio API (no assets required).
- **Input:** Unified pointer events for seamless Mouse and Touch support.

## 🚀 Running Locally

Because this project uses ES Modules (`import`/`export`), you cannot simply open `index.html` directly from your file system due to browser security restrictions (CORS).

### Python 3
```bash
python3 -m http.server
# Open http://localhost:8000
```

### Node.js (http-server)
```bash
npx http-server
# Open the URL shown in terminal
```

## 📦 Deployment

This game is configured for deployment on the **Wavelength Hub**.

- **Manifest:** `game.json` defines metadata, controls, and badge definitions.
- **SDK Integration:** Includes hooks for the Wavelength Badge API (currently in test mode).
- **Self-Contained:** Zero external dependencies.

## 📜 Status

**Current Version:** `v1.0.0 (Beta)`
- [x] Drag-to-shoot & Click-to-move
- [x] Dynamic physics (Gravity, Repulsion, Collision)
- [x] Visual Polish (Screen Shake, Trails, CRT Shader)
- [x] Procedural Audio System (Spatial 3D Sound)
- [x] Score & Telemetry UI
- [x] Hub Integration Ready
