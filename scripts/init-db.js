const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Connecting to database...');
    await prisma.$connect();
    
    console.log('Testing database connection...');
    // Try a simple query to test connection
    const result = await prisma.$queryRaw`SELECT NOW()`;
    console.log('Database connection successful:', result);
    
    console.log('Schema synced successfully. Database is ready!');
  } catch (error) {
    console.error('Error connecting to or initializing database:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
