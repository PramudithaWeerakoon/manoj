const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  try {
    // Check for Album table
    console.log('Checking Album table...')
    const albums = await prisma.album.findMany({ take: 1 })
    console.log('Album table exists!', albums.length >= 0 ? 'Success!' : 'No data')
    
    // Check for Track table
    console.log('Checking Track table...')
    const tracks = await prisma.track.findMany({ take: 1 })
    console.log('Track table exists!', tracks.length >= 0 ? 'Success!' : 'No data')
    
    // List all tables
    console.log('\nListing all database tables:')
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `
    console.log(tables)
    
    console.log('\nDatabase verification complete!')
  } catch (error) {
    console.error('Error verifying database:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()
