const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const executeRoute = require('./routes/execute');
const cleanTempDir = require('./utils/cleanupTemp');

const app = express();
const PORT = 6000;

cleanTempDir(); // 🔥 Clean old temp files at boot

app.use(cors());
app.use(bodyParser.json());
app.use('/execute', executeRoute);

app.listen(PORT, () => {
  console.log(`Compiler server running on port ${PORT}`);
});
