const runCode = require('./executor');

async function runTestCases(code, languageConfig, testCases) {
  console.log('All test cases received:', testCases);
  let results = [];

  for (let i = 0; i < testCases.length; i++) {
    const test = testCases[i];
    console.log(`Processing test case #${i + 1}:`, test);
    if (!('input' in test) || !('expectedOutput' in test)) {
      console.error('Malformed test case:', test);
      results.push({
        input: test.input,
        expected: test.expectedOutput,
        output: 'Error: Malformed test case',
        passed: false,
      });
      continue;
    }
    // Normalize whitespace for robust comparison
    function normalize(str) {
      return (str || '').replace(/\s+/g, ' ').trim();
    }
    const output = await runCode(languageConfig, code, test.input);
    let finalOutput = output;
    if (!output || !output.trim()) {
      finalOutput = 'Runtime error: No output';
    }
    results.push({
      input: test.input,
      expected: test.expectedOutput,
      output: finalOutput,
      passed: normalize(finalOutput) === normalize(test.expectedOutput),
    });
  }

  const allPassed = results.every((r) => r.passed);
  return { verdict: allPassed ? 'Passed' : 'Wrong Answer', results };
}

module.exports = runTestCases;
