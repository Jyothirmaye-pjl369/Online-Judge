const express = require('express');
const router = express.Router();
const User = require('../models/User');

// GET /api/leaderboard/top-users
router.get('/top-users', async (req, res) => {
  try {
    // Sort users by problemsSolved descending and return top 10
    const users = await User.find({})
      .sort({ problemsSolved: -1 })
      .limit(10)
      .select('username email problemsSolved');

    const leaderboard = users.map(user => ({
      userId: user._id,
      username: user.username,
      email: user.email,
      problemsSolved: user.problemsSolved || 0
    }));

    res.json(leaderboard);
  } catch (error) {
    console.error('Leaderboard fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

module.exports = router;
