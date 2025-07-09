// Script to recalculate problemsSolved and solvedProblems for all users based on submissions
const mongoose = require('mongoose');
const User = require('../models/User');
const Submission = require('../models/Submission');
require('dotenv').config();

async function recalculateSolvedCounts() {
  await mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  console.log('Connected to MongoDB');

  const users = await User.find({});
  for (const user of users) {
    // Find all accepted submissions for this user
    const acceptedSubs = await Submission.find({ user: user._id, status: 'Accepted' });
    // Get unique problem IDs
    const solvedProblemsSet = new Set(acceptedSubs.map(s => s.problem.toString()));
    user.solvedProblems = Array.from(solvedProblemsSet);
    user.problemsSolved = user.solvedProblems.length;
    await user.save();
    console.log(`Updated user ${user.username}: ${user.problemsSolved} problems solved.`);
  }
  console.log('Recalculation complete.');
  mongoose.disconnect();
}

recalculateSolvedCounts().catch(err => {
  console.error('Error during recalculation:', err);
  mongoose.disconnect();
});
