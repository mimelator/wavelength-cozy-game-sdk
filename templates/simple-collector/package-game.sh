#!/bin/bash

# VIBE Coding Game Packager
# Makes it easy to package your game for sharing!

echo "🎮 VIBE Coding Game Packager"
echo "============================"
echo ""

# Get game name from user
if [ -z "$1" ]; then
    echo "📦 What's your game called?"
    read -p "Game name (no spaces): " GAME_NAME
else
    GAME_NAME="$1"
fi

# Clean game name (remove spaces, special characters)
CLEAN_NAME=$(echo "$GAME_NAME" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9]/-/g' | sed 's/--*/-/g' | sed 's/^-\|-$//g')

echo ""
echo "📋 Packaging: $GAME_NAME"
echo "📁 Folder name: $CLEAN_NAME"
echo ""

# Create output directory
OUTPUT_DIR="packaged-games"
mkdir -p "$OUTPUT_DIR"

# Create game package
PACKAGE_DIR="$OUTPUT_DIR/$CLEAN_NAME"

if [ -d "$PACKAGE_DIR" ]; then
    echo "⚠️  Package already exists. Overwrite? (y/n)"
    read -p "Choice: " OVERWRITE
    if [ "$OVERWRITE" != "y" ]; then
        echo "❌ Packaging cancelled."
        exit 1
    fi
    rm -rf "$PACKAGE_DIR"
fi

# Copy template files
echo "📂 Copying game files..."
cp -r . "$PACKAGE_DIR"

# Clean up package (remove unwanted files)
cd "$PACKAGE_DIR"
rm -f package-game.sh
rm -rf .git
rm -f .gitignore
rm -f .DS_Store

# Update package info
echo "✏️  Updating package information..."

# Create package.json for the game
cat > package.json << EOF
{
  "name": "$CLEAN_NAME",
  "title": "$GAME_NAME",
  "version": "1.0.0",
  "description": "A cozy game created with VIBE Coding",
  "template": "simple-collector",
  "created": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "vibeVersion": "1.0",
  "files": [
    "index.html",
    "game.json",
    "css/styles.css",
    "js/gameEngine.js",
    "js/gameLogic.js",
    "js/main.js",
    "README.md"
  ]
}
EOF

# Create deployment instructions
cat > DEPLOY.md << EOF
# 🚀 Deployment Instructions

## Quick Deploy to Wavelength Hub
1. Zip this entire folder
2. Upload to wavelengthhub.com/upload
3. Add description and tags
4. Publish!

## Deploy to Your Own Website
1. Upload all files to your web server
2. Make sure index.html is in the root or a subfolder
3. Test by visiting the URL in a browser

## Testing Locally
1. Open index.html in any modern web browser
2. Or use a local server: python3 -m http.server 8000
3. Visit: http://localhost:8000

## File Structure
- index.html - Main game page
- game.json - Game configuration (easy to edit!)
- css/styles.css - Visual styling
- js/ - Game code (works automatically)
- README.md - Documentation

## Support
- Discord: Wavelength VIBE Community
- Email: vibe@wavelengthhub.com
- Forum: wavelengthhub.com/forum

Happy gaming! 🎮✨
EOF

cd ..

# Create zip file for easy sharing
echo "📦 Creating zip file..."
ZIP_NAME="$CLEAN_NAME-$(date +%Y%m%d).zip"
cd "$OUTPUT_DIR"
zip -r "$ZIP_NAME" "$CLEAN_NAME" > /dev/null 2>&1

echo ""
echo "✅ Package created successfully!"
echo ""
echo "📁 Game folder: $OUTPUT_DIR/$CLEAN_NAME"
echo "📦 Zip file: $OUTPUT_DIR/$ZIP_NAME"
echo ""
echo "🎯 Next steps:"
echo "   1. Test your game by opening the index.html file"
echo "   2. Upload the zip file to Wavelength Hub"
echo "   3. Share your creation with the world!"
echo ""
echo "🌟 Thank you for using VIBE Coding! 🌟"