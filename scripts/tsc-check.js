const { execSync } = require('child_process');
const path = require('path');

const nodeDir = path.join(process.env.LOCALAPPDATA, 'Volta', 'tools', 'image', 'node', '20.20.2');
const tsc = path.join(__dirname, '..', 'node_modules', '.bin', 'tsc');

try {
  const result = execSync(`"${process.execPath}" "${path.join(__dirname, '..', 'node_modules', 'typescript', 'bin', 'tsc')}" --noEmit`, {
    cwd: path.join(__dirname, '..'),
    encoding: 'utf8',
    stdio: ['pipe', 'pipe', 'pipe'],
    timeout: 120000,
  });
  console.log('TSC_RESULT: PASS');
  if (result) console.log(result);
} catch (e) {
  console.log('TSC_RESULT: FAIL');
  if (e.stdout) console.log(e.stdout);
  if (e.stderr) console.log(e.stderr);
  process.exit(1);
}
