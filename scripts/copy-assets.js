const fs = require('fs');
const path = require('path');

// Ensure lowercase public directory exists
const publicDir = path.join(__dirname, '../public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
  console.log('Created public directory');
}

// Copy radioo.png from Public to public
const sourcePath = path.join(__dirname, '../Public/radioo.png');
const destPath = path.join(__dirname, '../public/radioo.png');

try {
  if (fs.existsSync(sourcePath)) {
    fs.copyFileSync(sourcePath, destPath);
    console.log('Successfully copied radioo.png to public folder');
  } else {
    console.log('Source file not found:', sourcePath);
  }
} catch (error) {
  console.error('Error copying file:', error);
}
