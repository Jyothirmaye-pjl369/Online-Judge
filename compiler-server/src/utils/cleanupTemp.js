const fs = require('fs');
const path = require('path');

const tempDir = path.join(__dirname, '..', 'temp');

function cleanTempDir() {
  if (!fs.existsSync(tempDir)) return;

  fs.readdirSync(tempDir).forEach(file => {
    const filePath = path.join(tempDir, file);
    try {
      fs.unlinkSync(filePath);
    } catch (err) {
      console.error(`Error deleting temp file ${file}:`, err.message);
    }
  });

  console.log('✅ Temp directory cleaned at startup.');
}

module.exports = cleanTempDir;
