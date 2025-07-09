const express = require('express');
const router = express.Router();
const runTestCases = require('./testRunner');
const languageConfigs = require('./languages');
const protect = require('../middleware/authMiddleware');
const Submission = require('../models/Submission');

// POST /api/submit (protected route)
router.post('/', protect, async (req, res) => {
  const { problemId, code, language, testCases } = req.body;

  if (!problemId || !code || !language || !testCases || !Array.isArray(testCases)) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const langConfig = languageConfigs[language];
  if (!langConfig) {
    return res.status(400).json({ error: 'Unsupported language' });
  }

  try {
    const result = await runTestCases(code, langConfig, testCases);

    let status = 'Passed'; // Default status
    let error = null;

    if (result.results.some(r => !r.passed)) {
      status = 'Wrong Answer';
    }

    if (result.results.some(r => /error|runtime error/i.test(r.output))) {
      status = 'Runtime Error';
      error = result.results.find(r => /error|runtime error/i.test(r.output))?.output || 'Runtime Error';
    }

    // Change 'Passed' to 'Accepted' for consistency
    if (status === 'Passed') status = 'Accepted';

    // ✅ Save the submission
    const newSubmission = await Submission.create({
      user: req.user._id,
      problem: problemId,
      code,
      language,
      status,
      output: result.results.map(r => r.output).join('\n'),
      error,
      results: result.results
    });

    // Leaderboard/user update logic
    if (status === 'Accepted') {
      const User = require('../models/User');
      const user = await User.findById(req.user._id);
      // Fix ObjectId comparison
      if (user && !user.solvedProblems.map(id => id.toString()).includes(problemId.toString())) {
        user.solvedProblems.push(problemId);
        user.problemsSolved = user.solvedProblems.length;
        await user.save();
      }
    }

    res.json({
      verdict: status,
      results: result.results,
      submissionId: newSubmission._id
    });

  } catch (err) {
    console.error('Execution error:', err);
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

// POST /api/submit/run (for Run button)
router.post('/run', async (req, res) => {
  const { code, language, input } = req.body;

  const langConfig = languageConfigs[language];
  if (!langConfig) {
    return res.status(400).json({ error: 'Unsupported language' });
  }

  try {
    const runCode = require('./executor');
    const output = await runCode(langConfig, code, input || '');
    res.json({ output });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Run failed' });
  }
});

module.exports = router;
