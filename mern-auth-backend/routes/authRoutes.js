const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const passwordResetController = require('../controllers/passwordResetController');
const protect = require('../middleware/authMiddleware');

// Register new user (allow admin to set role)
router.post('/register', async (req, res) => {
  const { username, email, password, bio, role } = req.body;
  try {
    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }
    let userRole = 'user';
    if (role === 'admin' && req.user && req.user.role === 'admin') userRole = 'admin';
    const user = new User({ username, email, password, bio, role: userRole });
    await user.save();
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.status(201).json({
      token,
      user: { id: user._id, username: user.username, email: user.email, bio: user.bio, role: user.role }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Login user
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await user.matchPassword(password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });

    res.json({
      token,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        bio: user.bio || '',
        role: user.role || 'user',
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});


// Request password reset (send email)
router.post('/request-reset', passwordResetController.requestReset);
// Reset password (set new password)
router.post('/reset-password', passwordResetController.resetPassword);

// Get user profile
router.get('/submissions/user/:id', protect, async (req, res) => {
  const user = await User.findById(req.user._id).select('-password');
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json(user);
});

// Update user profile
router.put('/submissions/user/:id', protect, async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  user.username = req.body.username || user.username;
  user.bio = req.body.bio || user.bio;
  await user.save();
  res.json({ message: 'Profile updated', user: { id: user._id, username: user.username, email: user.email, bio: user.bio, role: user.role } });
});

// Get user by ID (for context refresh)
router.get('/user/:id', protect, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
