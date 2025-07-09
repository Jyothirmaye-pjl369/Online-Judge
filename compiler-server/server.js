const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(bodyParser.json());

const TMP_DIR = './temp';
if (!fs.existsSync(TMP_DIR)) fs.mkdirSync(TMP_DIR);

app.post('/execute', async (req, res) => {
  const { code, language, input } = req.body;
  if (!code || !language) {
    return res.status(400).json({ error: 'Missing code or language' });
  }

  const id = Date.now() + Math.random().toString(36).substring(2, 8);
  let codeFile, execCmd, inputFile, outputFile;

  try {
    switch (language) {
      case 'cpp':
        codeFile = path.join(TMP_DIR, `${id}.cpp`);
        outputFile = path.join(TMP_DIR, `${id}_out.txt`);
        fs.writeFileSync(codeFile, code);
        execCmd = `g++ "${codeFile}" -o "${TMP_DIR}/${id}.out" && echo ${JSON.stringify(input || '')} | "${TMP_DIR}/${id}.out" > "${outputFile}"`;
        break;
      case 'python':
        codeFile = path.join(TMP_DIR, `${id}.py`);
        outputFile = path.join(TMP_DIR, `${id}_out.txt`);
        fs.writeFileSync(codeFile, code);
        execCmd = `echo ${JSON.stringify(input || '')} | python3 "${codeFile}" > "${outputFile}"`;
        break;
      case 'c':
        codeFile = path.join(TMP_DIR, `${id}.c`);
        outputFile = path.join(TMP_DIR, `${id}_out.txt`);
        fs.writeFileSync(codeFile, code);
        execCmd = `gcc "${codeFile}" -o "${TMP_DIR}/${id}.out" && echo ${JSON.stringify(input || '')} | "${TMP_DIR}/${id}.out" > "${outputFile}"`;
        break;
      case 'javascript':
        codeFile = path.join(TMP_DIR, `${id}.js`);
        outputFile = path.join(TMP_DIR, `${id}_out.txt`);
        fs.writeFileSync(codeFile, code);
        execCmd = `echo ${JSON.stringify(input || '')} | node "${codeFile}" > "${outputFile}"`;
        break;
      default:
        return res.status(400).json({ error: 'Unsupported language' });
    }

    exec(execCmd, { timeout: 5000 }, (err) => {
      let output = '';
      if (fs.existsSync(outputFile)) {
        output = fs.readFileSync(outputFile, 'utf8');
      }
      // Clean up
      [codeFile, outputFile, `${TMP_DIR}/${id}.out`].forEach(f => {
        if (f && fs.existsSync(f)) fs.unlinkSync(f);
      });
      if (err) {
        return res.status(200).json({ error: err.message, output });
      }
      res.status(200).json({ output });
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.listen(PORT, () => {
  console.log(`Compiler server running on port ${PORT}`);
});
