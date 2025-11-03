const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Adding test data to database...');
  
  try {
    // Create a test album
    console.log('Creating test album...');
    const album = await prisma.album.create({
      data: {
        title: 'Test Album',
        release_date: new Date(),
        description: 'Test album for music player',
        youtube_id: 'dQw4w9WgXcQ',
        cover_art: 'https://example.com/cover.jpg'
      }
    });
    console.log('Album created:', album);
    
    // Create a test track
    console.log('Creating test track...');
    const track = await prisma.track.create({
      data: {
        title: 'Test Track',
        duration: '3:45',
        track_number: 1,
        album_id: album.id,
        artist: 'Test Artist',
        isInPlayer: true,
        addedToPlayer: new Date()
      }
    });
    console.log('Track created:', track);
    
    console.log('Test data added successfully!');
  } catch (error) {
    console.error('Error adding test data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
