const express = require('express');
const router = express.Router();
const Problem = require('../models/problem');
const protect = require('../middleware/authMiddleware'); // to secure routes
const mongoose = require('mongoose');

// Create a new problem (protected)
router.post('/', protect, async (req, res) => {
  const { title, description, inputFormat, outputFormat, constraints, sampleInput, sampleOutput, difficulty, tags } = req.body;
  try {
    const problem = new Problem({
      title,
      description,
      inputFormat,
      outputFormat,
      constraints,
      sampleInput,
      sampleOutput,
      difficulty,
      tags: tags ? (Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim())) : [],
      createdBy: req.user._id,
    });

    await problem.save();
    res.status(201).json(problem);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all problems (public, with search/filter and pagination)
router.get('/', async (req, res) => {
  try {
    const { title, difficulty, tags, page = 1, limit = 10 } = req.query;
    const filter = {};
    if (title) {
      filter.title = { $regex: title, $options: 'i' }; // case-insensitive partial match
    }
    if (difficulty) {
      filter.difficulty = difficulty;
    }
    if (tags) {
      const tagArr = Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim().toLowerCase());
      filter.tags = { $in: tagArr.map(tag => new RegExp(`^${tag}$`, 'i')) };
    }
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Problem.countDocuments(filter);
    const problems = await Problem.find(filter).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit));
    res.json({ problems, total });
  } catch (error) {
    console.error('Error in GET /api/problems:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get problem by ID (public)
router.get('/:id', async (req, res) => {
  console.log('GET /api/problems/:id called with id:', req.params.id);
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      console.log('Invalid ObjectId:', req.params.id);
      return res.status(400).json({ message: 'Invalid problem ID' });
    }
    const problem = await Problem.findById(req.params.id).lean(); // <-- use .lean()
    console.log('Problem found:', problem);
    if (!problem) {
      console.log('Problem not found for id:', req.params.id);
      return res.status(404).json({ message: 'Problem not found' });
    }
    res.json(problem); // .lean() returns a plain object, safe to send
  } catch (error) {
    console.error('Error in GET /api/problems/:id:', error.stack || error);
    res.status(500).json({ message: 'Server error', error: error.stack || error });
  }
});

// Update problem (protected, optional)
router.put('/:id', protect, async (req, res) => {
  try {
    const problem = await Problem.findById(req.params.id);
    if (!problem) return res.status(404).json({ message: 'Problem not found' });

    // Check if the logged in user is the creator
    if (problem.createdBy.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    Object.assign(problem, req.body); // update fields
    if (req.body.tags) {
      problem.tags = Array.isArray(req.body.tags) ? req.body.tags : req.body.tags.split(',').map(t => t.trim());
    }
    await problem.save();
    res.json(problem);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete problem (protected, optional)
router.delete('/:id', protect, async (req, res) => {
  try {
    const problem = await Problem.findById(req.params.id);
    if (!problem) return res.status(404).json({ message: 'Problem not found' });

    if (problem.createdBy.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    await problem.remove();
    res.json({ message: 'Problem deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});
// Add or update test cases for a problem (protected)
router.put('/:id/testcases', protect, async (req, res) => {
  const { testCases } = req.body;

  if (!Array.isArray(testCases) || testCases.length === 0) {
    return res.status(400).json({ message: 'Test cases are required and should be an array.' });
  }

  try {
    const problem = await Problem.findById(req.params.id);
    if (!problem) return res.status(404).json({ message: 'Problem not found' });

    // Ensure only the creator can update test cases
    if (problem.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    // Replace old test cases with new ones
    problem.testCases = testCases;

    await problem.save();
    res.json({ message: 'Test cases updated successfully', problem });
  } catch (error) {
    console.error('Error updating test cases:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


module.exports = router;
