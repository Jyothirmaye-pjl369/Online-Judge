const runCode = require('../code-runner/runCode');
const Submission = require('../models/Submission');
const Problem = require('../models/problem');
const User = require('../models/User');
const languageConfigs = require('../code-runner/languages');

async function evaluateSubmission(submissionId) {
  try {
    const submission = await Submission.findById(submissionId);
    if (!submission) throw new Error('Submission not found');
    const problem = await Problem.findById(submission.problem);
    if (!problem) throw new Error('Problem not found');

    const config = languageConfigs[submission.language];
    if (!config) {
      submission.status = 'Failed';
      submission.results = [{
        input: '',
        expected: '',
        output: '',
        passed: false,
        error: `Unsupported language: ${submission.language}`
      }];
      await submission.save();
      return submission;
    }

    const results = [];
    let verdict = 'Accepted';

    for (const test of problem.testCases) {
      try {
        const output = await runCode(config, submission.code, test.input);
        // Normalize output and expected for fair comparison
        const normalizedOutput = (output || '').trim().replace(/\r\n/g, '\n');
        const normalizedExpected = (test.expectedOutput || '').trim().replace(/\r\n/g, '\n');
        const passed = normalizedOutput === normalizedExpected;
        results.push({
          input: test.input,
          expected: test.expectedOutput,
          output,
          passed
        });
        if (!passed && verdict === 'Accepted') verdict = 'Wrong Answer';
      } catch (err) {
        results.push({
          input: test.input,
          expected: test.expectedOutput,
          output: '',
          passed: false,
          error: err.message || 'Execution error'
        });
        verdict = 'Runtime Error';
        break;
      }
    }

    submission.status = verdict;

    submission.results = results;
    await submission.save();

    // Update user's problemsSolved and solvedProblems if Accepted
    if (verdict === 'Accepted') {
      const user = await User.findById(submission.user);
      if (user && !user.solvedProblems.includes(submission.problem)) {
        user.solvedProblems.push(submission.problem);
        user.problemsSolved = user.solvedProblems.length;
        await user.save();
      }
    }
    return submission;
  } catch (error) {
    console.error('Evaluation error:', error);
    throw error;
  }
}

module.exports = evaluateSubmission;
