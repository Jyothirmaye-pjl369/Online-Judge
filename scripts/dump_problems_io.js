// Script to fetch all problems from the database and write their inputs and outputs to files
require('dotenv').config({ path: '../mern-auth-backend/.env' });
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const Problem = require('../mern-auth-backend/models/problem');

async function dumpProblemsIO() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/onlinejudge');
  const problems = await Problem.find({});
  let inputData = '';
  let outputData = '';
  for (const problem of problems) {
    for (const test of problem.testCases) {
      inputData += test.input.trim() + '\n';
      outputData += (test.expectedOutput || '').trim() + '\n';
    }
  }
  fs.writeFileSync(path.join(__dirname, '../input.txt'), inputData.trim() + '\n');
  fs.writeFileSync(path.join(__dirname, '../output.txt'), outputData.trim() + '\n');
  console.log('✅ All problem inputs written to input.txt');
  console.log('✅ All problem outputs written to output.txt');
  await mongoose.disconnect();
}

dumpProblemsIO().catch(console.error);
