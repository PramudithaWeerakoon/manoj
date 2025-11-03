const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database with test data...');
  
  // Create some albums
  const album1 = await prisma.album.create({
    data: {
      title: 'Echoes of Tomorrow',
      release_date: new Date('2024-01-01'),
      cover_art: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04',
      description: 'Our latest album featuring a blend of classical rock and modern electronic elements.',
      youtube_id: 'dQw4w9WgXcQ',
    },
  });
  
  const album2 = await prisma.album.create({
    data: {
      title: 'City Lights',
      release_date: new Date('2023-06-15'),
      cover_art: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f',
      description: 'A journey through the urban landscape with powerful guitar riffs and melodic vocals.',
      youtube_id: '9bZkp7q19f0',
    },
  });
  
  // Create tracks for album 1
  await prisma.track.create({
    data: {
      title: 'Digital Dreams',
      duration: '4:32',
      track_number: 1,
      album_id: album1.id,
      artist: 'The Radio Team',
      isInPlayer: true,
      addedToPlayer: new Date(),
    },
  });
  
  await prisma.track.create({
    data: {
      title: 'Electric Sunset',
      duration: '3:45',
      track_number: 2,
      album_id: album1.id,
      artist: 'The Radio Team',
      isInPlayer: true,
      addedToPlayer: new Date(),
    },
  });
  
  // Create tracks for album 2
  await prisma.track.create({
    data: {
      title: 'Downtown',
      duration: '3:56',
      track_number: 1,
      album_id: album2.id,
      artist: 'The Radio Team',
      isInPlayer: false,
    },
  });
  
  await prisma.track.create({
    data: {
      title: 'Night Drive',
      duration: '4:12',
      track_number: 2,
      album_id: album2.id,
      artist: 'The Radio Team',
      isInPlayer: false,
    },
  });
  
  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
