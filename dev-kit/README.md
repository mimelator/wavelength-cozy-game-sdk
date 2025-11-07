# Badge Development Kit

Local testing environment for badge awarding - no sandbox required!

## ⚠️ **CRITICAL: Validation Requirements**

**ALL GAMES** must implement a compliant badge system to pass Wavelength Hub validation:

### Required Elements:
- ✅ **Badge Helper Class**: `WavelengthBadgeHelper` or `badgeHelper`
- ✅ **Badge Helper Script**: File named `badge-helper.js` 
- ✅ **API Endpoints**: Calls to `/api/games/{gameId}/badges/award` or `badges/award`
- ✅ **Method Calls**: Use `awardBadge()` or `.awardBadge(` methods
- ✅ **Helper Files**: Files containing both "badge" and "helper" in filename

**See [Badge Integration Guide](../docs/guides/BADGE-INTEGRATION-GUIDE.md) for complete implementation details.**

## Quick Start

1. **Copy the dev kit files** to your project:
   ```bash
   cp dev-kit/badge-dev-kit.html your-game-folder/
   cp dev-kit/badge-helper.js your-game-folder/
   ```

2. **Start a local server** (required for CORS):
   ```bash
   # Option 1: Python
   python -m http.server 8000
   
   # Option 2: Node.js (npx)
   npx serve .
   
   # Option 3: VS Code Live Server extension
   # Right-click badge-dev-kit.html > "Open with Live Server"
   ```

3. **Open in browser**:
   ```
   http://localhost:8000/badge-dev-kit.html
   ```

4. **Configure**:
   - **API Base URL**: `http://localhost:3000/api` (your Wavelength Hub dev server)
   - **Game ID**: Your game identifier (e.g., `constellation-canvas-1.0.0`)
   - **Tenant ID**: Your tenant identifier (e.g., `conans-world`)
   - **Player ID**: Leave empty for anonymous testing, or enter user ID for authenticated testing

5. **Click "Initialize Badge Helper"**

6. **Test badge awarding** with the test buttons

## Using in Your Game

### Option 1: Include Badge Helper in Your Game

Add this to your game's `index.html`:

```html
<!-- Load badge helper -->
<script src="badge-helper.js"></script>

<!-- Initialize with your game context -->
<script>
  // This will be auto-initialized by GamePlayer in production
  // For local testing, initialize manually:
  if (typeof WavelengthBadgeHelper !== 'undefined' && !window.WavelengthBadge) {
    window.WavelengthBadge = new WavelengthBadgeHelper({
      gameId: 'your-game-id',
      tenantId: 'your-tenant-id',
      playerId: null, // or user ID if authenticated
      apiBase: 'http://localhost:3000/api' // Change to production URL when deployed
    });
  }
</script>
```

### Option 2: Use the Dev Kit Page

1. Open `badge-dev-kit.html` in browser
2. Configure your game details
3. Use the test buttons to verify badge awarding works
4. Copy the integration code and use it in your game

## Testing Scenarios

### Anonymous Player Testing
1. Leave **Player ID** empty
2. Award badges - they'll be saved with session ID
3. Badges expire in 30 days if not claimed
4. See `sessionId` in console logs

### Authenticated Player Testing
1. Set **Player ID** to a test user ID
2. Award badges - they'll be saved immediately
3. Badges are permanent (no expiration)
4. Check badge gallery: `GET /api/games/badges/gallery`

### Custom Badge Images
1. Click "Award Badge with Custom Image"
2. Game generates SVG/PNG badge
3. Converts to base64
4. Sends to API
5. Badge image saved to blob storage

## API Endpoints

All endpoints accessible at `{apiBase}/games/{gameId}/badges/...`:

- `POST /award` - Award a badge
- `GET /` - Get available badges
- `POST /claim` - Claim anonymous badges (when player logs in)
- `GET /gallery` - Get player's badge gallery

## Troubleshooting

### "Badge helper script not loaded"
- Make sure `badge-helper.js` is in the same directory as your HTML
- Check browser console for script loading errors

### "Failed to fetch" errors
- Make sure your Wavelength Hub dev server is running (`npm run dev`)
- Check API Base URL is correct
- Verify CORS is configured (should be automatic in dev mode)

### "Game ID not available"
- Make sure you've initialized the badge helper with correct gameId
- Check browser console for initialization errors

### CORS Errors
- Make sure you're using a local server (not `file://` protocol)
- Check that `X-Game-Tenant` header is being sent (should be automatic)

## Production Deployment

When deploying to production:

1. **Remove manual initialization** - GamePlayer will inject it automatically
2. **Remove apiBase override** - It will use the correct origin
3. **Test in sandbox** before publishing

## Example Game Code

```javascript
// In your game's achievement handler
function onLevelComplete(score, level) {
  // Award badge if helper is available
  if (window.WavelengthBadge) {
    window.WavelengthBadge.awardBadge({
      badgeId: 'level-complete',
      metadata: {
        score: score,
        level: level,
        timestamp: Date.now()
      }
    }).then(result => {
      // Show badge notification
      showBadgeNotification(result.badge);
      console.log('Badge awarded!', result);
    }).catch(error => {
      console.error('Failed to award badge:', error);
    });
  } else {
    console.warn('Badge helper not available');
  }
}

// Optional: Generate custom badge image
function createCustomBadge(playerName, score) {
  const canvas = document.createElement('canvas');
  canvas.width = 200;
  canvas.height = 200;
  const ctx = canvas.getContext('2d');
  
  // Draw badge design
  ctx.fillStyle = '#667eea';
  ctx.fillRect(0, 0, 200, 200);
  ctx.fillStyle = 'white';
  ctx.font = 'bold 24px Arial';
  ctx.textAlign = 'center';
  ctx.fillText(playerName, 100, 100);
  ctx.font = '16px Arial';
  ctx.fillText(`Score: ${score}`, 100, 130);
  
  // Convert to base64
  return canvas.toDataURL('image/png');
}
```

## Next Steps

1. ✅ Test badge awarding locally
2. ✅ Verify badges appear in gallery (if authenticated)
3. ✅ Test anonymous badge flow
4. ✅ Upload to sandbox for full integration testing
5. ✅ Deploy to production