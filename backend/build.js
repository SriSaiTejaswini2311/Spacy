const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Starting manual build...');

// Create dist directory
if (!fs.existsSync('dist')) {
  fs.mkdirSync('dist');
}

// Compile TypeScript
try {
  execSync('npx tsc --project tsconfig.json', { stdio: 'inherit' });
  console.log('TypeScript compilation completed');
} catch (error) {
  console.error('TypeScript compilation failed:', error.message);
  process.exit(1);
}

console.log('Build completed successfully');