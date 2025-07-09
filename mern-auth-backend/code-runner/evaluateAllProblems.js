const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const Problem = require('../models/problem');

/**
 * Evaluates a single user C++ code against all problems in the system.
 * @param {string} userCode - The C++ code to test.
 * @returns {Promise<Array>} - Array of results for each problem and test case.
 */
async function evaluateAllProblems(userCode) {
  const workingDir = path.join(__dirname, '../temp/evalAll');
  if (!fs.existsSync(workingDir)) fs.mkdirSync(workingDir, { recursive: true });

  const problems = await Problem.find({});
  const results = [];

  for (const problem of problems) {
    const problemResult = { problemId: problem._id, title: problem.title, testResults: [] };
    for (const test of problem.testCases) {
      // Write user code and input
      const codePath = path.join(workingDir, 'main.cpp');
      const inputPath = path.join(workingDir, 'input.txt');
      const outputPath = path.join(workingDir, 'output.txt');
      fs.writeFileSync(codePath, userCode);
      fs.writeFileSync(inputPath, test.input);
      let actualOutput = '', error = null;
      try {
        execSync(`docker run --rm -v "${workingDir}:/app" -w /app gcc:latest bash -c "g++ main.cpp -o main && ./main < input.txt > output.txt"`, { stdio: 'ignore' });
        actualOutput = fs.readFileSync(outputPath, 'utf8').trim();
      } catch (err) {
        error = err.message;
        actualOutput = error || 'Runtime Error';
      }
      const expectedOutput = (test.expectedOutput || '').trim();
      const passed = actualOutput === expectedOutput;
      problemResult.testResults.push({
        input: test.input,
        expectedOutput,
        actualOutput,
        passed
      });
    }
    results.push(problemResult);
  }
  return results;
}

module.exports = evaluateAllProblems;
