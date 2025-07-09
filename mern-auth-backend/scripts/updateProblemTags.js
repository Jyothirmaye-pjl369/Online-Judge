// scripts/updateProblemTags.js
// Script to update tags for all problems in the database

const mongoose = require('mongoose');
const Problem = require('../models/problem');
const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Define your tag logic here based on problem title or description
const tagMap = [
  {
    match: /longest increasing subsequence/i,
    tags: ['DP', 'Binary Search', 'Array']
  },
  {
    match: /minimum number of jumps/i,
    tags: ['Greedy', 'Array', 'DP']
  },
  {
    match: /fibonacci/i,
    tags: ['DP', 'Recursion', 'Math']
  },
  {
    match: /sum of array/i,
    tags: ['Array', 'Math']
  },
  {
    match: /find maximum number/i,
    tags: ['Array', 'Math']
  },
  {
    match: /reverse a string/i,
    tags: ['String', 'Two Pointers']
  },
  {
    match: /factorial/i,
    tags: ['Recursion', 'Math']
  },
  {
    match: /palindrome/i,
    tags: ['String', 'Two Pointers']
  },
  {
    match: /multiply two numbers/i,
    tags: ['Math']
  },
  {
    match: /add two numbers/i,
    tags: ['Math']
  },
  {
    match: /even|odd/i,
    tags: ['Math']
  },
];

async function updateTags() {
  if (!process.env.MONGO_URI) {
    console.error('MONGO_URI not set in .env');
    process.exit(1);
  }
  await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  const problems = await Problem.find();
  for (const problem of problems) {
    let newTags = [];
    for (const rule of tagMap) {
      if (rule.match.test(problem.title) || rule.match.test(problem.description)) {
        newTags = rule.tags;
        break;
      }
    }
    if (newTags.length > 0) {
      problem.tags = newTags;
      await problem.save();
      console.log(`Updated tags for: ${problem.title}`);
    }
  }
  mongoose.disconnect();
  console.log('Tag update complete.');
}

updateTags();
