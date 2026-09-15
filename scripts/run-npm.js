const { execSync } = require('child_process');
const path = require('path');

const nodeDir = path.join(process.env.LOCALAPPDATA, 'Volta', 'tools', 'image', 'node', '20.20.2');
const npmCli = path.join(nodeDir, 'node_modules', 'npm', 'bin', 'npm-cli.js');

const args = process.argv.slice(2).join(' ');
const cmd = `"${process.execPath}" "${npmCli}" ${args}`;

console.log('Running:', cmd);
try {
  execSync(cmd, { 
    stdio: 'inherit', 
    cwd: path.join(__dirname, '..'),
    env: { ...process.env, PATH: nodeDir + ';' + process.env.PATH }
  });
} catch (e) {
  process.exit(e.status || 1);
}
