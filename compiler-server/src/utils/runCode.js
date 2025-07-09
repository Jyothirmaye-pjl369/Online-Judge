const fs = require('fs');
const { execSync, spawnSync } = require('child_process');
const path = require('path');
const { v4: uuid } = require('uuid');

const tempDir = path.join(__dirname, '..', 'temp');
if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);

const runCode = async (language, code, input = '') => {
  const jobId = uuid();
  let filePath, exePath, command;

  try {
    if (language === 'cpp') {
      filePath = path.join(tempDir, `${jobId}.cpp`);
      exePath = path.join(tempDir, `${jobId}.exe`);
      fs.writeFileSync(filePath, code);
      execSync(`g++ "${filePath}" -o "${exePath}"`);
      const result = spawnSync(exePath, [], {
        input,
        encoding: 'utf-8'
      });
      return { output: result.stdout || '', error: result.stderr || '' };

    } else if (language === 'c') {
      filePath = path.join(tempDir, `${jobId}.c`);
      exePath = path.join(tempDir, `${jobId}.exe`);
      fs.writeFileSync(filePath, code);
      execSync(`gcc "${filePath}" -o "${exePath}"`);
      const result = spawnSync(exePath, [], {
        input,
        encoding: 'utf-8'
      });
      return { output: result.stdout || '', error: result.stderr || '' };

    } else if (language === 'python') {
      filePath = path.join(tempDir, `${jobId}.py`);
      fs.writeFileSync(filePath, code);
      const result = spawnSync('python', [filePath], {
        input,
        encoding: 'utf-8'
      });
      return { output: result.stdout || '', error: result.stderr || '' };

    } else {
      throw new Error('Unsupported language');
    }

  } catch (err) {
    return { error: true, output: err.message };
  } finally {
    // Clean up files
    try {
      if (filePath) fs.unlinkSync(filePath);
      if (exePath) fs.unlinkSync(exePath);
    } catch (e) {
      console.error('Cleanup failed:', e.message);
    }
  }
};

module.exports = runCode;
