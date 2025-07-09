const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

// Clean up temp directories before connecting to MongoDB
const tempDir = path.join(__dirname, '../mern-auth-backend/temp');
if (fs.existsSync(tempDir)) {
  fs.readdirSync(tempDir).forEach((file) => {
    const curPath = path.join(tempDir, file);
    if (fs.lstatSync(curPath).isDirectory()) {
      fs.rmSync(curPath, { recursive: true, force: true });
      console.log(`🧹 Deleted temp directory: ${curPath}`);
    }
  });
}

require('dotenv').config({ path: path.join(__dirname, '../mern-auth-backend/.env') });

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB Atlas'))
  .catch((err) => console.error('❌ Connection failed:', err));
