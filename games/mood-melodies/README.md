# 🎵 Mood Melodies

Create beautiful music that reflects your emotions. A cozy interactive music maker powered by p5.js.

## Features
- **Emotion-Driven Music**: Choose your mood and the music adapts
- **Interactive Sound Creation**: Click and drag to paint with sound
- **Multiple Instruments**: Piano, chimes, strings, flute, ambient, and nature sounds
- **Real-time Visual Effects**: Particle system responds to your music
- **Badge System**: Earn achievements through musical exploration

## How to Play
1. 🎭 **Choose your mood** - Select how you're feeling from 6 emotions
2. 🖱️ **Click & drag** on the canvas to create music instantly
3. 🎼 **Switch instruments** to find your perfect sound
4. 🎵 **Let emotions flow** - music starts immediately when you interact
5. 🏆 **Earn badges** - First badge after 5 minutes of play

## Technical Details
- Built with p5.js and the p5.sound library
- No external CDN dependencies - all resources are local
- Responsive design works on desktop, tablet, and mobile
- Wavelength Badge System integration for achievements

## Local Development
```bash
# Start a local server
python3 -m http.server 8080

# Open in browser
open http://localhost:8080
```

## Files Structure
```
mood-melodies/
├── index.html           # Main game interface
├── game.json           # Game metadata and badge definitions
├── README.md           # This file
├── css/
│   └── style.css       # Game styling
├── js/
│   ├── game.js         # Main p5.js game logic
│   ├── badge-helper.js # Wavelength badge system
│   └── badge-tracker.js # Badge tracking and timing
├── lib/
│   ├── p5.min.js       # p5.js library (local)
│   └── p5.sound.min.js # p5.js sound library (local)
└── assets/
    └── (placeholder for future audio/image assets)
```

## Badge System
The game includes a professional badge system with:
- 5-minute grace period before first badge
- Maximum one badge every 5 minutes
- 17 total badges for various achievements
- Emotion tracking, melody creation, and time-based achievements

Powered by **Wavelength Cozy Game SDK** - Emotion-Driven Music Engine
