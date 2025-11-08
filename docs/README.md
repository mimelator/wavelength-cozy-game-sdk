# 📚 Wavelength Cozy Game SDK Documentation


## 🚀 Quick Start

- **[README](../README.md)** - Main project overview and quick start
- **[Quick Start Guide](guides/QUICK-START.md)** - Get up and running in 5 minutes

## 📖 User Guides

### Getting Started
- **[Quick Start](guides/QUICK-START.md)** - Essential first steps
- **[Universal Usage Guide](guides/UNIVERSAL-USAGE-GUIDE.md)** - Complete usage reference

### Development
- **[Badge Integration Guide](guides/BADGE-INTEGRATION-GUIDE.md)** - ⚠️ **REQUIRED** Badge system compliance  
- **[Badge Validation Checklist](BADGE-VALIDATION-CHECKLIST.md)** - 🔍 Pre-submission validation
- **[Contributing Guide](guides/CONTRIBUTING.md)** - How to contribute to the project
- **[Deployment Guide](guides/DEPLOYMENT-GUIDE.md)** - Deploy games to production

## 🔧 Technical Documentation

### Testing
- **[Testing Overview](testing/README.md)** - Testing framework and guidelines
- **[User Testing Guide](testing/user-testing-guide.md)** - User experience testing
- **[Non-Technical Quick Start](testing/quick-start-non-technical.md)** - Testing for non-developers

## 🎮 Templates & Examples

### Game Templates
- **[Simple Collector](../templates/simple-collector/README.md)** - Basic collection game template

## 🛠️ Tools & CLI

### Command Line Interface
- **[wavelength-cli.sh](../wavelength-cli.sh)** - Main CLI tool for development
- **[Deployment Tools](../tools/deploy-to-hub.sh)** - Production deployment utilities

### Development Kit
- **[Badge Development Kit](../dev-kit/README.md)** - Tools for testing badge systems


### Badge System & Validation Requirements ⚠️ **CRITICAL**

**ALL GAMES MUST IMPLEMENT COMPLIANT BADGE SYSTEMS** to pass Wavelength Hub validation.

#### Required Implementation:
- ✅ **Badge Helper Class**: `WavelengthBadgeHelper` or `badgeHelper` 
- ✅ **Badge Helper Script**: File named `badge-helper.js` included in HTML
- ✅ **API Endpoint Calls**: `/api/games/{gameId}/badges/award` or `badges/award`
- ✅ **Method Calls**: Use `awardBadge()` or `.awardBadge(` methods
- ✅ **Helper Files**: Files with "badge" and "helper" in filename

- **Badge API Integration** - Seamless integration with Wavelength Hub  
- **Merchandise Generation** - Automatic product creation from badge designs

#### Quick Implementation:
1. Create `js/badge-helper.js` with `WavelengthBadgeHelper` class
2. Include `<script src="./js/badge-helper.js"></script>` in your HTML
3. Use `await badgeHelper.awardBadge(badgeId, null, metadata)` in your game
4. **See [Badge Integration Guide](guides/BADGE-INTEGRATION-GUIDE.md) for complete instructions**

1. Players earn badges through gameplay achievements
2. Badges appear in player's personal gallery  
3. Players can create merchandise featuring their earned badges

## 🌐 Community & Support

### Getting Help
- **GitHub Issues** - Report bugs and request features
- **Community Forum** - Connect with other developers
- **Documentation** - Comprehensive guides and references

### Contributing
- **[Contributing Guidelines](guides/CONTRIBUTING.md)** - How to contribute
- **Code Standards** - Development best practices
- **Testing Requirements** - Quality assurance guidelines

## 📝 Reference

### File Structure
```
wavelength-cozy-game-sdk/
├── README.md                    # Main project documentation
├── wavelength-cli.sh           # Primary CLI tool
├── docs/                       # Documentation
│   ├── guides/                 # User guides and tutorials
│   ├── api/                    # API documentation
│   └── testing/               # Testing documentation
├── templates/                  # Game templates
│   └── simple-collector/      # Basic template
├── tools/                     # Development tools
│   └── deploy-to-hub.sh       # Deployment
├── dev-kit/                   # Development utilities
```

### Version Information
- **Current Version**: 1.0.0
- **License**: MIT
- **Repository**: [wavelength-cozy-game-sdk](https://github.com/mimelator/wavelength-cozy-game-sdk)

---

*This documentation is continuously updated. For the latest information, visit our [GitHub repository](https://github.com/mimelator/wavelength-cozy-game-sdk).*