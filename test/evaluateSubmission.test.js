// test/evaluateSubmission.test.js
// Automated test for the Online Judge evaluation logic

require('dotenv').config();
const mongoose = require('mongoose');
const evaluateSubmission = require('../mern-auth-backend/controllers/evaluateSubmission');
const Submission = require('../mern-auth-backend/models/Submission');
const Problem = require('../mern-auth-backend/models/Problem');

// Correct code templates for sum problems (edit as needed for your problems)
const CORRECT_CODE_CPP = `#include <iostream>\nusing namespace std;\nint main() { int a, b; cin >> a >> b; cout << a + b << endl; return 0; }`;
const CORRECT_CODE_PY = `a, b = map(int, input().split())\nprint(a + b)`;
const CORRECT_CODE_C = `#include <stdio.h>\nint main() { int a, b; scanf("%d %d", &a, &b); printf("%d\\n", a+b); return 0; }`;

const LANGUAGES = [
  { lang: 'cpp', code: CORRECT_CODE_CPP },
  { lang: 'python', code: CORRECT_CODE_PY },
  { lang: 'c', code: CORRECT_CODE_C },
];

async function runTest() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/onlinejudge', {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });

  mongoose.connection.on('error', err => {
    console.error('❌ MongoDB connection error:', err);
  });
  mongoose.connection.once('open', () => {
    console.log('✅ MongoDB connected');
  });

  const problems = await Problem.find();
  if (!problems.length) throw new Error('No problems found in the database');

  for (const problem of problems) {
    console.log(`\n--- Testing Problem: ${problem.title} (${problem._id}) ---`);
    for (const { lang, code } of LANGUAGES) {
      const submission = await Submission.create({
        problem: problem._id,
        code,
        language: lang,
        status: 'Pending',
        results: []
      });
      const result = await evaluateSubmission(submission._id);
      console.log(`[${lang}] Results:`, result.results);
      console.log(`[${lang}] Final Verdict:`, result.status);
      // Optionally, clean up test submissions:
      await Submission.findByIdAndDelete(submission._id);
    }
  }
  await mongoose.disconnect();
}

runTest().catch(console.error);
