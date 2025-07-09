const express = require('express');
const router = express.Router();
const protect = require('../middleware/authMiddleware');
const Submission = require('../models/Submission');

// ✅ GET all submissions by user ID (protected)
router.get('/user/:id', protect, async (req, res) => {
  try {
    // Check if the logged-in user is requesting their own data
    if (req.user._id.toString() !== req.params.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const submissions = await Submission.find({ user: req.params.id }).populate('problem');
    res.json(submissions);
  } catch (error) {
    console.error('Error fetching submissions:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
