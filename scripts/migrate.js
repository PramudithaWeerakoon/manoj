const { execSync } = require('child_process');
const path = require('path');

// Change to project directory if needed
const projectDir = path.resolve(__dirname, '..');
process.chdir(projectDir);

console.log('Creating migration for updated schema...');

try {
  // Create the migration with a descriptive name
  execSync('npx prisma migrate dev --name add_user_and_review_models', { stdio: 'inherit' });
  console.log('Migration created and applied successfully!');
  
  // Generate updated Prisma client
  console.log('Generating updated Prisma client...');
  execSync('npx prisma generate', { stdio: 'inherit' });
  console.log('Prisma client generated successfully!');
} catch (error) {
  console.error('Migration failed:', error.message);
  process.exit(1);
}
