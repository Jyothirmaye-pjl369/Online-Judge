const express = require('express');
const axios = require('axios');
const router = express.Router();

// POST /api/compile
router.post('/compile', async (req, res) => {
  const { code, language, input } = req.body;
  if (!code || !language) {
    return res.status(400).json({ error: 'Missing code or language' });
  }
  try {
    // Call the compiler-server container
    const response = await axios.post('http://compiler-server:5001/execute', {
      code,
      language,
      input: input || ''
    });
    res.json(response.data);
  } catch (err) {
    if (err.response) {
      res.status(err.response.status).json(err.response.data);
    } else {
      res.status(500).json({ error: err.message || 'Compiler server error' });
    }
  }
});

module.exports = router;
