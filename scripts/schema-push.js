const { execSync } = require('child_process');
const path = require('path');

// Change to project directory if needed
const projectDir = path.resolve(__dirname, '..');
process.chdir(projectDir);

console.log('Pushing schema changes directly to the database...');

try {
  // Force push schema changes to the database
  execSync('npx prisma db push --force-reset', { stdio: 'inherit' });
  console.log('Schema pushed successfully!');
  
  // Generate updated Prisma client
  console.log('Generating updated Prisma client...');
  execSync('npx prisma generate', { stdio: 'inherit' });
  console.log('Prisma client generated successfully!');
} catch (error) {
  console.error('Schema push failed:', error.message);
  process.exit(1);
}
