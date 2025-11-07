# 🌐 Deployment Guide for hub.wavelength.com

## Overview

The VIBE SDK makes deploying to hub.wavelength.com incredibly simple. This guide covers everything from one-click deployment to troubleshooting.

## Automatic Deployment (Recommended)

### One-Command Deploy
```bash
# From your game directory
../vibe-cli.sh deploy
```

This script automatically:
1. ✅ Validates your game meets Hub requirements
2. 📦 Packages all necessary files
3. 🔍 Checks for common issues
4. 🌐 Opens the Hub upload page
5. 📋 Provides upload instructions

### What Gets Packaged
- `index.html` - Your game interface
- `game.json` - Configuration and metadata
- `css/` - All styling files
- `js/` - Game logic and engine
- `assets/` - Images, sounds (if any)
- `deploy-info.json` - Deployment metadata

## Manual Deployment Process

### Step 1: Validate Your Game
```bash
../vibe-cli.sh validate
```

Checks for:
- Required files (index.html, game.json, css/, js/)
- Valid JSON syntax
- Mobile responsiveness
- Accessibility features
- Content guidelines compliance

### Step 2: Package Your Game
```bash
../vibe-cli.sh package
```

Creates a ZIP file ready for upload.

### Step 3: Upload to Hub
1. Visit **[hub.wavelength.com/upload](https://hub.wavelength.com/upload)**
2. **Drag and drop** your ZIP file
3. **Review** auto-filled information from your game.json
4. **Add tags** and category (if not already set)
5. **Click "Publish Game"**

## Hub Requirements

### Technical Requirements ✅

Your game must:
- **Work offline** - No external API calls or dependencies
- **Be responsive** - Work on desktop, tablet, and mobile
- **Include accessibility** - Screen reader support, keyboard navigation
- **Perform well** - 60fps on mid-range mobile devices
- **Use provided templates** - Ensures compatibility

*Using VIBE SDK templates automatically meets all technical requirements!*

### Content Guidelines ✅

Games must be:
- **Family-friendly** - Appropriate for all ages
- **Peaceful** - No violence, competition, or stress
- **Inclusive** - Welcoming to all players
- **Original** - Your own work or properly attributed

*VIBE Coding philosophy naturally aligns with these guidelines!*

## game.json Deployment Configuration

### Required Fields
```json
{
  "title": "Your Game Title",
  "description": "Brief description for the Hub listing",
  "version": "1.0.0",
  "template": "simple-collector",

  "deploy": {
    "hubUrl": "hub.wavelength.com",
    "category": "collection",
    "tags": ["cozy", "peaceful", "mobile-friendly"],
    "ageRating": "everyone",
    "accessibility": true
  }
}
```

### Category Options
- **collection** - Exploration and gathering games
- **creative** - Drawing, building, artistic games
- **physics** - Interactive physics and movement games
- **puzzle** - Gentle problem-solving games
- **ambient** - Atmospheric, meditative experiences

### Recommended Tags
**Theme tags:** beach, forest, ocean, space, garden, nature, mystical
**Gameplay tags:** peaceful, relaxing, cozy, meditative, exploration
**Technical tags:** mobile-friendly, touch-controls, accessible
**Audience tags:** family-friendly, beginner-friendly, casual

## Deployment Timeline

### Immediate (Automated)
- ✅ File validation
- ✅ Package creation
- ✅ Upload preparation

### 5-15 Minutes (Hub Processing)
- 🔍 Automated content review
- 📱 Mobile compatibility test
- ♿ Accessibility validation
- 🎮 Gameplay verification

### 24-48 Hours (Manual Review)
- 👥 Community manager review
- 🎯 Category and tag verification
- 📝 Description and metadata check
- 🌟 Featured game consideration

### Post-Approval
- 🌐 Game goes live with public URL
- 📧 Confirmation email with game link
- 📊 Analytics dashboard access
- 🎉 Community announcement (if featured)

## After Deployment

### Your Game URL
Format: `https://hub.wavelength.com/games/your-game-title`

### Analytics & Feedback
- **Player count** - How many people are playing
- **Session length** - How long people play
- **Completion rate** - How many finish collecting
- **Device breakdown** - Desktop vs mobile usage
- **Community feedback** - Comments and ratings

### Updates & Iterations
```bash
# Create an updated version
../vibe-cli.sh package

# Upload as version 1.1, 1.2, etc.
# Previous versions remain accessible
```

## Troubleshooting

### Common Deployment Issues

**"Validation Failed"**
- Check that all required files exist
- Validate JSON syntax: `python3 -m json.tool game.json`
- Ensure mobile CSS includes @media queries

**"Upload Rejected"**
- Review content guidelines
- Check for external dependencies
- Verify family-friendly content

**"Game Won't Load"**
- Test locally first: `../vibe-cli.sh test`
- Check browser console for errors
- Verify file paths are relative, not absolute

### Getting Help

**Technical Issues:**
- Email: tech-support@wavelength.com
- Include: game ZIP file, error messages, browser info

**Content Questions:**
- Forum: hub.wavelength.com/forum
- Discord: #deployment-help channel

**Urgent Issues:**
- Discord: @wavelength-support
- Response within 2-4 hours during business hours

## Advanced Deployment

### Custom Domains (Pro Feature)
- Point your domain to hub.wavelength.com
- Configure CNAME: `games.yourdomain.com`
- SSL certificates handled automatically

### Analytics Integration
```json
"deploy": {
  "analytics": {
    "trackCollections": true,
    "trackTimeSpent": true,
    "trackMobileUsage": true
  }
}
```

### A/B Testing
```json
"deploy": {
  "variants": {
    "theme-test": ["ocean", "forest"],
    "difficulty-test": ["easy", "normal"]
  }
}
```

## Success Metrics

### What Makes Games Successful on Hub

**High Engagement:**
- Clear, immediate gameplay understanding
- Mobile-optimized controls and UI
- Balanced progression (not too easy/hard)
- Beautiful, cohesive visual theme

**Community Love:**
- Accessible to all skill levels
- Genuinely peaceful and stress-free
- Creative, unique collection items
- Polished descriptions and atmosphere

**Technical Excellence:**
- Fast loading (under 3 seconds)
- Smooth 60fps performance
- Works perfectly on phones
- No bugs or broken features

### Hub Featuring Criteria
Games may be featured if they:
- Exemplify VIBE Coding principles
- Show creative use of templates
- Have strong community response
- Demonstrate accessibility best practices
- Inspire other creators

---

## 🎉 Ready to Deploy?

Your VIBE Coded game is about to bring joy to players around the world!

```bash
# One final check
../vibe-cli.sh validate

# Deploy to the world!
../vibe-cli.sh deploy
```

**Welcome to the Wavelength Hub creator community!** 🌟