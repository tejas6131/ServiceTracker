/**
 * Simple script to generate placeholder icon files.
 * Run: node scripts/generate-icons.js
 *
 * For production, replace the files in /assets with proper icons.
 * Recommended sizes:
 *  - icon.png: 1024x1024
 *  - adaptive-icon.png: 1024x1024
 *  - splash-icon.png: 200x200
 *  - notification-icon.png: 96x96 (white on transparent)
 */

const fs = require('fs');
const path = require('path');

// Minimal 1x1 transparent PNG
const TRANSPARENT_PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
  'base64'
);

const assetsDir = path.join(__dirname, '..', 'assets');

['icon.png', 'adaptive-icon.png', 'splash-icon.png', 'notification-icon.png', 'favicon.png'].forEach((name) => {
  const filePath = path.join(assetsDir, name);
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, TRANSPARENT_PNG);
    console.log(`Created placeholder: ${name}`);
  }
});

console.log('Done. Replace these with proper icons before building for production.');
