const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Creating tables using raw SQL...');
    
    // Create Album table
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "Album" (
        "id" SERIAL PRIMARY KEY,
        "title" TEXT NOT NULL,
        "release_date" TIMESTAMP,
        "cover_art" TEXT,
        "description" TEXT,
        "youtube_id" TEXT
      );
    `;
    
    // Create Track table
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "Track" (
        "id" SERIAL PRIMARY KEY,
        "title" TEXT NOT NULL,
        "duration" TEXT,
        "track_number" INTEGER NOT NULL,
        "lyrics" TEXT,
        "album_id" INTEGER NOT NULL,
        "youtube_id" TEXT,
        "audioData" BYTEA,
        "audioFileName" TEXT,
        "audioMimeType" TEXT,
        "artist" TEXT,
        "isInPlayer" BOOLEAN NOT NULL DEFAULT false,
        "addedToPlayer" TIMESTAMP,
        FOREIGN KEY ("album_id") REFERENCES "Album"("id")
      );
    `;
    
    // Create other tables as needed...
    
    console.log('Tables created successfully!');
  } catch (error) {
    console.error('Error creating tables with raw SQL:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
