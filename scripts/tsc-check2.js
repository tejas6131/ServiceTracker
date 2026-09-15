const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const resultFile = path.join(__dirname, '..', 'tsc-result.txt');

try {
  const result = execSync(`"${process.execPath}" "${path.join(__dirname, '..', 'node_modules', 'typescript', 'bin', 'tsc')}" --noEmit`, {
    cwd: path.join(__dirname, '..'),
    encoding: 'utf8',
    stdio: ['pipe', 'pipe', 'pipe'],
    timeout: 120000,
  });
  fs.writeFileSync(resultFile, 'TSC_RESULT: PASS\n' + (result || ''));
} catch (e) {
  const output = (e.stdout || '') + '\n' + (e.stderr || '');
  fs.writeFileSync(resultFile, 'TSC_RESULT: FAIL\n' + output);
}
