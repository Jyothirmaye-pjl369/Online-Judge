// scripts/addHardProblems.js
// Script to add two hard problems with test cases directly to the database

const mongoose = require('mongoose');
const Problem = require('../models/problem');
const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const problems = [
  {
    title: 'Longest Increasing Subsequence',
    description: `Given an integer array nums, return the length of the longest strictly increasing subsequence.

A subsequence is a sequence that can be derived from an array by deleting some or no elements without changing the order of the remaining elements.`,
    inputFormat: 'The first line contains an integer n (1 ≤ n ≤ 2500), the length of the array. The second line contains n integers nums[i] (−10^4 ≤ nums[i] ≤ 10^4).',
    outputFormat: 'Print a single integer, the length of the longest strictly increasing subsequence.',
    constraints: '1 ≤ n ≤ 2500\n−10^4 ≤ nums[i] ≤ 10^4',
    sampleInput: '6\n10 9 2 5 3 7 101 18',
    sampleOutput: '4',
    difficulty: 'Hard',
    tags: ['DP', 'Binary Search', 'Array'],
    testCases: [
      { input: '6\n10 9 2 5 3 7 101 18', expectedOutput: '4' },
      { input: '8\n0 1 0 3 2 3', expectedOutput: '4' },
      { input: '1\n1', expectedOutput: '1' },
      { input: '5\n5 4 3 2 1', expectedOutput: '1' },
      { input: '5\n1 2 3 4 5', expectedOutput: '5' },
      { input: '10\n10 22 9 33 21 50 41 60 80 1', expectedOutput: '6' }
    ]
  },
  {
    title: 'Minimum Number of Jumps',
    description: `Given an array of integers arr where each element represents the maximum number of steps that can be jumped going forward from that element. Write a function to return the minimum number of jumps to reach the end of the array (starting from the first element). If it is not possible to reach the end, return -1.`,
    inputFormat: 'The first line contains an integer n (1 ≤ n ≤ 10^4), the length of the array. The second line contains n integers arr[i] (0 ≤ arr[i] ≤ 10^5).',
    outputFormat: 'Print a single integer, the minimum number of jumps to reach the end, or -1 if not possible.',
    constraints: '1 ≤ n ≤ 10^4\n0 ≤ arr[i] ≤ 10^5',
    sampleInput: '6\n1 4 3 2 6 7',
    sampleOutput: '2',
    difficulty: 'Hard',
    tags: ['Greedy', 'Array', 'DP'],
    testCases: [
      { input: '6\n1 4 3 2 6 7', expectedOutput: '2' },
      { input: '6\n1 0 3 2 6 7', expectedOutput: '-1' },
      { input: '1\n0', expectedOutput: '0' },
      { input: '5\n2 3 1 1 4', expectedOutput: '2' },
      { input: '5\n1 1 1 1 1', expectedOutput: '4' },
      { input: '5\n0 1 2 3 4', expectedOutput: '-1' }
    ]
  }
];

async function addProblems() {
  if (!process.env.MONGO_URI) {
    console.error('MONGO_URI not set in .env');
    process.exit(1);
  }
  await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  for (const p of problems) {
    const exists = await Problem.findOne({ title: p.title });
    if (!exists) {
      await Problem.create(p);
      console.log(`Added: ${p.title}`);
    } else {
      console.log(`Already exists: ${p.title}`);
    }
  }
  await mongoose.disconnect();
  console.log('Done.');
}

addProblems().catch(e => { console.error(e); process.exit(1); });
