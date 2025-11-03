const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  // Create sample album
  const album = await prisma.album.create({
    data: {
      title: 'Sample Album',
      release_date: new Date(),
      cover_art: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80',
      description: 'This is a sample album for testing the music player',
      youtube_id: 'dQw4w9WgXcQ',
    },
  })

  console.log('Created album:', album)

  // Create sample tracks
  const track1 = await prisma.track.create({
    data: {
      title: 'First Track',
      duration: '3:45',
      track_number: 1,
      album_id: album.id,
      artist: 'Sample Artist',
      isInPlayer: true,
      addedToPlayer: new Date(),
    },
  })

  const track2 = await prisma.track.create({
    data: {
      title: 'Second Track',
      duration: '4:20',
      track_number: 2,
      album_id: album.id,
      artist: 'Sample Artist',
      isInPlayer: true,
      addedToPlayer: new Date(),
    },
  })

  console.log('Created tracks:', track1, track2)
  
  console.log('Database has been seeded!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
