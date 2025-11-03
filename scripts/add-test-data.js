const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  try {
    // Create a test album
    console.log('Creating test album...')
    const album = await prisma.album.create({
      data: {
        title: 'Test Album',
        release_date: new Date(),
        cover_art: 'https://example.com/cover.jpg',
        description: 'This is a test album',
        youtube_id: 'dQw4w9WgXcQ',
      }
    })
    console.log('Test album created:', album)
    
    // Create test tracks
    console.log('Creating test tracks...')
    const track1 = await prisma.track.create({
      data: {
        title: 'Test Track 1',
        duration: '3:45',
        track_number: 1,
        album_id: album.id,
        artist: 'Test Artist',
        isInPlayer: true,
        addedToPlayer: new Date()
      }
    })
    
    const track2 = await prisma.track.create({
      data: {
        title: 'Test Track 2',
        duration: '4:30',
        track_number: 2,
        album_id: album.id,
        artist: 'Test Artist',
        isInPlayer: true,
        addedToPlayer: new Date()
      }
    })
    
    console.log('Test tracks created:', { track1, track2 })
    
    console.log('Test data added successfully!')
  } catch (error) {
    console.error('Error adding test data:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()
