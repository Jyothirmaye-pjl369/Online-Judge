const fs = require('fs');
const path = require('path');
const { v4: uuid } = require('uuid');
const { execFile, spawn } = require('child_process');

function runCode(langConfig, code, input) {
  return new Promise((resolve, reject) => {
    const id = uuid();
    const tempDir = path.join(__dirname, '../temp', id);
    fs.mkdirSync(tempDir, { recursive: true });

    const codePath = path.join(tempDir, langConfig.fileName);
    const inputPath = path.join(tempDir, 'input.txt');
    fs.writeFileSync(codePath, code);
    fs.writeFileSync(inputPath, (input || '') + '\n');

    // Special handling for C and C++
    if (langConfig.language === 'c' || langConfig.language === 'cpp') {
      // Use .exe for Windows, a.out for others
      const isWin = process.platform === 'win32';
      const exeName = isWin ? 'a.exe' : 'a.out';
      const compiler = langConfig.language === 'c' ? (isWin ? 'gcc.exe' : 'gcc') : (isWin ? 'g++.exe' : 'g++');
      const compileArgs = [codePath, '-o', path.join(tempDir, exeName)];
      const executable = path.join(tempDir, exeName);
      // Compile first
      const compile = spawn(compiler, compileArgs, { cwd: tempDir });
      let compileErr = '';
      compile.stderr.on('data', data => { compileErr += data; });
      compile.on('close', codeVal => {
        if (codeVal !== 0) {
          fs.rmSync(tempDir, { recursive: true, force: true });
          return resolve(compileErr || 'Runtime error');
        }
        // Run the executable
        const child = spawn(executable, [], { cwd: tempDir, stdio: ['pipe', 'pipe', 'pipe'], windowsHide: true });
        let stdout = '';
        let stderr = '';
        child.stdin.write(fs.readFileSync(inputPath, 'utf8'));
        child.stdin.end();
        child.stdout.on('data', data => { stdout += data; });
        child.stderr.on('data', data => { stderr += data; });
        child.on('close', code2 => {
          fs.rmSync(tempDir, { recursive: true, force: true });
          if (code2 !== 0) return resolve(stderr || 'Runtime error');
          resolve(stdout);
        });
        child.on('error', err => {
          fs.rmSync(tempDir, { recursive: true, force: true });
          resolve('Runtime error');
        });
      });
      compile.on('error', err => {
        fs.rmSync(tempDir, { recursive: true, force: true });
        resolve('Runtime error');
      });
      return;
    }

    // All other languages (Python, JS, etc.)
    const runArgs = langConfig.runCmd(langConfig.fileName, 'input.txt');
    const cmd = runArgs.shift();
    const options = { cwd: tempDir, timeout: 5000 };
    const inputData = fs.readFileSync(inputPath, 'utf8');
    const child = execFile(cmd, runArgs, options, (err, stdout, stderr) => {
      fs.rmSync(tempDir, { recursive: true, force: true });
      if (err) {
        return resolve(stderr || 'Runtime error');
      }
      return resolve(stdout);
    });
    child.stdin.write(inputData);
    child.stdin.end();
  });
}

module.exports = runCode;
