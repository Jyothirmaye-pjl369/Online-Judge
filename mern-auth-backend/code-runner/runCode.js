const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

function runCode(langConfig, code, input) {
  return new Promise((resolve, reject) => {
    // Use a unique temp directory for each run
    const runId = Date.now() + '-' + Math.random().toString(36).slice(2);
    const workingDir = path.resolve(__dirname, 'temp', runId);
    fs.mkdirSync(workingDir, { recursive: true });

    const codePath = path.join(workingDir, langConfig.fileName);
    const inputPath = path.join(workingDir, 'input.txt');
    fs.writeFileSync(codePath, code);
    fs.writeFileSync(inputPath, (input !== undefined ? input : '') + '\n');

    let compileCmd, compileArgs, runCmd, runArgs;
    let executable = '';
    // Use .exe for Windows, a.out for others
    const isWin = process.platform === 'win32';
    const exeName = isWin ? 'a.exe' : 'a.out';
    const gccCmd = isWin ? 'gcc.exe' : 'gcc';
    const gppCmd = isWin ? 'g++.exe' : 'g++';
    const nodeCmd = isWin ? 'node.exe' : 'node';

    if (langConfig.language === 'python') {
      runCmd = 'python';
      runArgs = [codePath];
    } else if (langConfig.language === 'cpp') {
      compileCmd = gppCmd;
      compileArgs = [codePath, '-o', path.join(workingDir, exeName)];
      executable = path.join(workingDir, exeName);
      runCmd = executable;
      runArgs = [];
    } else if (langConfig.language === 'c') {
      compileCmd = gccCmd;
      compileArgs = [codePath, '-o', path.join(workingDir, exeName)];
      executable = path.join(workingDir, exeName);
      runCmd = executable;
      runArgs = [];
    } else if (langConfig.language === 'javascript') {
      runCmd = nodeCmd;
      runArgs = [codePath];
    } else {
      fs.rmSync(workingDir, { recursive: true, force: true });
      return reject(new Error('Unsupported language'));
    }

    // Helper to run the code with input piping
    function execute() {
      const child = spawn(runCmd, runArgs, { cwd: workingDir });
      let stdout = '';
      let stderr = '';
      child.stdin.write(fs.readFileSync(inputPath, 'utf8'));
      child.stdin.end();
      child.stdout.on('data', data => { stdout += data; });
      child.stderr.on('data', data => { stderr += data; });
      child.on('close', code => {
        fs.rmSync(workingDir, { recursive: true, force: true });
        if (code !== 0) return resolve('Runtime error');
        resolve(stdout);
      });
      child.on('error', err => {
        fs.rmSync(workingDir, { recursive: true, force: true });
        resolve('Runtime error');
      });
    }

    // For C/C++, compile first
    if (compileCmd) {
      const compile = spawn(compileCmd, compileArgs, { cwd: workingDir });
      let compileErr = '';
      compile.stderr.on('data', data => { compileErr += data; });
      compile.on('close', code => {
        if (code !== 0) {
          fs.rmSync(workingDir, { recursive: true, force: true });
          return resolve('Runtime error');
        }
        execute();
      });
      compile.on('error', err => {
        fs.rmSync(workingDir, { recursive: true, force: true });
        resolve('Runtime error');
      });
    } else {
      execute();
    }
  });
}

module.exports = runCode;
