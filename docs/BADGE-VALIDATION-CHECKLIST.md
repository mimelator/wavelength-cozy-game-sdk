# 🔍 Badge Validation Checklist

Quick reference for ensuring your game passes Wavelength Hub validation.

## ✅ Pre-Submission Checklist

Before uploading your game, verify **ALL** of these requirements are met:

### 1. Badge Helper File ✅
- [ ] File named `badge-helper.js` exists in your project
- [ ] File contains both "badge" and "helper" in the filename
- [ ] File is located in accessible path (e.g., `js/badge-helper.js`)

### 2. Badge Helper Class ✅
- [ ] `WavelengthBadgeHelper` class is defined
- [ ] `window.badgeHelper` instance exists
- [ ] Class includes `awardBadge()` method

### 3. HTML Integration ✅
- [ ] Badge helper script included in HTML: `<script src="./js/badge-helper.js"></script>`
- [ ] Script loads before game initialization code
- [ ] No JavaScript errors in browser console

### 4. API Integration ✅
- [ ] Badge helper makes calls to `/api/games/{gameId}/badges/award` endpoint
- [ ] OR calls to alternative `badges/award` endpoint
- [ ] Proper HTTP POST method with JSON body
- [ ] Includes required headers (Content-Type, X-Game-Tenant, X-Game-Session)

### 5. Method Usage ✅
- [ ] Game code calls `badgeHelper.awardBadge()` method
- [ ] OR calls `window.badgeHelper.awardBadge()` method
- [ ] Uses proper async/await or Promise handling
- [ ] Does NOT use custom badge API calls

### 6. Error Handling ✅
- [ ] Badge operations wrapped in try/catch blocks
- [ ] Graceful fallback if badge helper unavailable
- [ ] Console logging for debugging
- [ ] No unhandled Promise rejections

## 🚫 Common Validation Failures

### ❌ Missing Badge Helper
**Issue**: No `badge-helper.js` file found
**Fix**: Create file with exact name containing WavelengthBadgeHelper class

### ❌ Wrong Method Calls
**Issue**: Using custom badge functions instead of `awardBadge()`
**Fix**: Replace custom methods with `badgeHelper.awardBadge(badgeId)`

### ❌ Missing Script Include
**Issue**: Badge helper not included in HTML
**Fix**: Add `<script src="./js/badge-helper.js"></script>`

### ❌ Class Not Defined
**Issue**: WavelengthBadgeHelper class missing
**Fix**: Define class in badge-helper.js file

### ❌ Wrong API Endpoint
**Issue**: Using custom API URLs
**Fix**: Use WavelengthBadgeHelper which calls correct endpoints

## 🛠️ Quick Validation Test

Run this in your browser console after loading your game:

```javascript
// Check if badge helper is properly loaded
console.log('Badge Helper Class:', typeof WavelengthBadgeHelper);
console.log('Badge Helper Instance:', typeof window.badgeHelper);
console.log('Award Badge Method:', typeof window.badgeHelper?.awardBadge);

// Test badge awarding (should work without errors)
if (window.badgeHelper) {
    window.badgeHelper.awardBadge('test-badge-validation')
        .then(result => console.log('✅ Badge test passed:', result))
        .catch(error => console.log('❌ Badge test failed:', error));
}
```

**Expected Output:**
```
Badge Helper Class: function
Badge Helper Instance: object  
Award Badge Method: function
✅ Badge test passed: {success: true, badgeId: 'test-badge-validation', mode: 'local'}
```

## 📋 File Structure Validation

Your game should have this structure:
```
your-game/
├── index.html              ← Contains <script src="./js/badge-helper.js">
├── js/
│   └── badge-helper.js     ← Contains WavelengthBadgeHelper class
├── game.json
└── [other game files]
```

## 🎯 Minimal Compliant Implementation

If you're in a hurry, here's the **bare minimum** for compliance:

**1. Create `js/badge-helper.js`:**
```javascript
if (typeof WavelengthBadgeHelper === 'undefined') {
  window.WavelengthBadgeHelper = class WavelengthBadgeHelper {
    constructor() { this.awardedBadges = new Set(); }
    async awardBadge(badgeId) {
      if (this.awardedBadges.has(badgeId)) return { duplicate: true };
      this.awardedBadges.add(badgeId);
      console.log('Badge awarded:', badgeId);
      return { success: true, badgeId };
    }
  }
  window.badgeHelper = new WavelengthBadgeHelper();
}
```

**2. Add to `index.html`:**
```html
<script src="./js/badge-helper.js"></script>
```

**3. Use in game code:**
```javascript
// Award a badge somewhere in your game
await window.badgeHelper.awardBadge('game-completed');
```

## 🔄 Validation Process

1. **Upload game** to Wavelength Hub
2. **Automated scan** checks for all required elements  
3. **Validation report** shows pass/fail status
4. **Fix any issues** and re-upload
5. **Approval** once all requirements met

## 📞 Support

If validation fails after following this checklist:

- **[Badge Integration Guide](../docs/guides/BADGE-INTEGRATION-GUIDE.md)** - Complete implementation guide
- **[GitHub Issues](https://github.com/mimelator/wavelength-cozy-game-sdk/issues)** - Report bugs
- **Community Discord** - Get help from other developers

---

> **💡 Pro Tip**: Copy the badge helper from a working template to ensure 100% compliance, then customize the badge definitions for your game.