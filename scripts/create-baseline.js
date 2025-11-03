const { execSync } = require('child_process');
const path = require('path');

// Change to project directory if needed
const projectDir = path.resolve(__dirname, '..');
process.chdir(projectDir);

console.log('Creating baseline migration...');

try {
  // Create a baseline migration from the current database state
  execSync('npx prisma migrate dev --name init --create-only', { stdio: 'inherit' });
  console.log('Baseline migration created successfully!');
  
} catch (error) {
  console.error('Migration creation failed:', error.message);
  process.exit(1);
}
