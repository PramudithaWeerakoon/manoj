const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  try {
    // Create a test album
    console.log('Creating test album...')
    const album = await prisma.album.create({
      data: {
        title: 'Echoes of Tomorrow',
        release_date: new Date(),
        cover_art: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
        description: 'Our latest album featuring a blend of classical rock and modern electronic elements.',
        youtube_id: 'dQw4w9WgXcQ',
      }
    })
    console.log('Test album created:', album)
    
    // Create test tracks
    console.log('Creating test tracks...')
    const track1 = await prisma.track.create({
      data: {
        title: 'Midnight Dreams',
        duration: '4:32',
        track_number: 1,
        album_id: album.id,
        artist: 'The Radio Team',
        isInPlayer: true,
        addedToPlayer: new Date()
      }
    })
    
    const track2 = await prisma.track.create({
      data: {
        title: 'Electric Sunset',
        duration: '3:45',
        track_number: 2,
        album_id: album.id,
        artist: 'The Radio Team',
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
