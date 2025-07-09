const express = require('express');
const router = express.Router();
const Submission = require('../models/Submission');
const User = require('../models/User');
const Problem = require('../models/problem');
const protect = require('../middleware/authMiddleware');

// GET /api/dashboard
router.get('/', protect, async (req, res) => {
  try {
    const userId = req.user._id;

    // Fetch all submissions by user
    const submissions = await Submission.find({ user: userId })
      .sort({ createdAt: -1 })
      .populate('problem', 'title');

    // Total submissions
    const totalSubmissions = submissions.length;

    // Unique problems attempted
    const attemptedProblems = new Set(submissions.map(s => s.problem?._id?.toString() || s.problem?.toString()));
    const totalAttempted = attemptedProblems.size;

    // Unique problems solved (Accepted)
    const solvedProblems = new Set(
      submissions.filter(s => s.status === 'Accepted').map(s => s.problem?._id?.toString() || s.problem?.toString())
    );
    const totalSolved = solvedProblems.size;

    // Success rate
    const successRate = totalSubmissions > 0 ? ((totalSolved / totalSubmissions) * 100).toFixed(2) : '0.00';

    // Last submission time
    const lastSubmissionTime = submissions[0]?.createdAt || null;

    // Recent submissions (last 10)
    const recentSubmissions = submissions.slice(0, 10).map(s => ({
      problemName: s.problem?.title || 'Unknown',
      language: s.language,
      verdict: s.status,
      timeTaken: s.runtime || null,
      timestamp: s.createdAt
    }));

    // Leaderboard preview (top 5)
    const topUsers = await User.find({})
      .sort({ problemsSolved: -1 })
      .limit(5)
      .select('username problemsSolved');
    const leaderboardPreview = topUsers.map(u => ({
      username: u.username,
      problemsSolved: u.problemsSolved || 0
    }));

    // (Optional) Activity graph: submissions per day for last 7 days
    const today = new Date();
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      return d.toISOString().slice(0, 10);
    }).reverse();
    const activityGraph = last7Days.map(date => ({
      date,
      count: submissions.filter(s => s.createdAt.toISOString().slice(0, 10) === date).length
    }));

    // (Optional) Daily challenge: random unsolved problem
    const unsolvedProblems = await Problem.find({ _id: { $nin: Array.from(solvedProblems) } });
    let dailyChallenge = null;
    if (unsolvedProblems.length > 0) {
      const idx = Math.floor(Math.random() * unsolvedProblems.length);
      dailyChallenge = {
        id: unsolvedProblems[idx]._id,
        title: unsolvedProblems[idx].title
      };
    }

    res.json({
      totalAttempted,
      totalSolved,
      totalSubmissions,
      successRate,
      lastSubmissionTime,
      recentSubmissions,
      leaderboardPreview,
      activityGraph,
      dailyChallenge
    });
  } catch (err) {
    console.error('Dashboard fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});

module.exports = router;
