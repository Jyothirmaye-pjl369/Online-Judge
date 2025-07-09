const express = require('express');
const router = express.Router();
const axios = require('axios');
require('dotenv').config();

const GROQ_API_KEY = process.env.GROQ_API_KEY;

router.post('/explain', async (req, res) => {
  const { code } = req.body;

  if (!code) {
    return res.status(400).json({ message: 'Code is required in request body' });
  }

  const prompt = `Explain this code simply:\n\n${code}`;

  try {
    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'llama3-70b-8192',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 300,
        temperature: 0.5
      },
      {
        headers: {
          Authorization: `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const aiMessage = response.data.choices?.[0]?.message?.content?.trim();
    res.json({ explanation: aiMessage || 'No explanation returned' });

  } catch (error) {
    console.error('Groq API Error:', error.response?.data || error.message);
    res.status(500).json({
      message: 'AI explanation failed',
      error: error.response?.data || error.message
    });
  }
});

module.exports = router;
