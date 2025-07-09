const express = require('express');
const axios = require('axios');
const router = express.Router();
require('dotenv').config();

// POST /api/explain
router.post('/explain', async (req, res) => {
  try {
    const { code, language } = req.body;
    if (!code) {
      return res.status(400).json({ error: 'Code is required' });
    }
    if (!process.env.GROQ_API_KEY) {
      return res.status(500).json({ error: 'GROQ_API_KEY is not set in the backend' });
    }
    const prompt = `Explain the following ${language || ''} code in simple terms:\n\n${code}`;
    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'mixtral-8x7b-32768',
        messages: [
          { role: 'user', content: prompt }
        ]
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    const explanation = response.data.choices?.[0]?.message?.content?.trim() || '';
    res.json({ explanation });
  } catch (error) {
    console.error('AI Explain Error:', error);
    res.status(500).json({ error: 'AI explanation failed', details: error.message });
  }
});

module.exports = router;
