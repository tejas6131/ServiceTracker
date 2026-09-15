/**
 * Quick validation: reads all .ts/.tsx source files and checks
 * that all import paths resolve to real files or installed packages.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const SRC_DIRS = ['app', 'src'];
const NODE_MODULES = path.join(ROOT, 'node_modules');

let errors = 0;
let checked = 0;

function getAllFiles(dir, ext) {
  const results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory() && entry.name !== 'node_modules') {
      results.push(...getAllFiles(full, ext));
    } else if (ext.some(e => entry.name.endsWith(e))) {
      results.push(full);
    }
  }
  return results;
}

function resolveImport(importPath, fromFile) {
  // Skip non-relative imports that are packages
  if (!importPath.startsWith('.') && !importPath.startsWith('/')) {
    // Check if it's an installed package
    const pkgName = importPath.startsWith('@')
      ? importPath.split('/').slice(0, 2).join('/')
      : importPath.split('/')[0];
    const pkgDir = path.join(NODE_MODULES, pkgName);
    if (!fs.existsSync(pkgDir)) {
      return `Package not found: ${pkgName}`;
    }
    return null; // Package exists
  }

  // Relative import
  const fromDir = path.dirname(fromFile);
  const target = path.resolve(fromDir, importPath);

  // Try exact, .ts, .tsx, /index.ts, /index.tsx
  const candidates = [
    target,
    target + '.ts',
    target + '.tsx',
    path.join(target, 'index.ts'),
    path.join(target, 'index.tsx'),
  ];

  for (const c of candidates) {
    if (fs.existsSync(c)) return null;
  }

  return `Cannot resolve: ${importPath}`;
}

for (const dir of SRC_DIRS) {
  const fullDir = path.join(ROOT, dir);
  if (!fs.existsSync(fullDir)) continue;

  const files = getAllFiles(fullDir, ['.ts', '.tsx']);

  for (const file of files) {
    const content = fs.readFileSync(file, 'utf8');
    const relFile = path.relative(ROOT, file);

    // Match import/from and require statements
    const importRegex = /(?:import|from)\s+['"]([^'"]+)['"]/g;
    let match;
    while ((match = importRegex.exec(content)) !== null) {
      checked++;
      const err = resolveImport(match[1], file);
      if (err) {
        console.log(`ERROR in ${relFile}: ${err}`);
        errors++;
      }
    }
  }
}

console.log(`\nChecked ${checked} imports across source files.`);
if (errors === 0) {
  console.log('VALIDATION: PASS - All imports resolve correctly.');
} else {
  console.log(`VALIDATION: FAIL - ${errors} import(s) could not be resolved.`);
  process.exit(1);
}
