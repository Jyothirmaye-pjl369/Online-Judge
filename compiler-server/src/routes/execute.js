const express = require('express');
const router = express.Router();
const runCode = require('../utils/runCode');

router.post('/', async (req, res) => {
  const { language, code, input } = req.body;
  if (!language || !code) {
    return res.status(400).json({ error: 'Missing language or code' });
  }

  const result = await runCode(language, code, input);
  res.json(result);
});

module.exports = router;
