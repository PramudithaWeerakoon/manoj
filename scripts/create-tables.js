const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  try {
    console.log('Creating tables directly with SQL...')
    
    // Create tables in the correct order (handling dependencies)
    
    // 1. First create tables without foreign keys
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "Album" (
        "id" SERIAL PRIMARY KEY,
        "title" TEXT NOT NULL,
        "release_date" TIMESTAMP,
        "cover_art" TEXT,
        "description" TEXT,
        "youtube_id" TEXT
      );
    `
    console.log('Album table created.')
    
    // 2. Create Track table with foreign key
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
        CONSTRAINT "Track_album_id_fkey" FOREIGN KEY ("album_id") REFERENCES "Album"("id") ON DELETE RESTRICT ON UPDATE CASCADE
      );
    `
    console.log('Track table created.')
    
    // 3. Create remaining tables
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "AlbumCredit" (
        "id" SERIAL PRIMARY KEY,
        "role" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "album_id" INTEGER NOT NULL,
        CONSTRAINT "AlbumCredit_album_id_fkey" FOREIGN KEY ("album_id") REFERENCES "Album"("id") ON DELETE RESTRICT ON UPDATE CASCADE
      );
    `
    console.log('AlbumCredit table created.')
    
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "TrackCredit" (
        "id" SERIAL PRIMARY KEY,
        "role" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "track_id" INTEGER NOT NULL,
        CONSTRAINT "TrackCredit_track_id_fkey" FOREIGN KEY ("track_id") REFERENCES "Track"("id") ON DELETE RESTRICT ON UPDATE CASCADE
      );
    `
    console.log('TrackCredit table created.')
    
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "Stat" (
        "id" SERIAL PRIMARY KEY,
        "title" TEXT NOT NULL,
        "value" TEXT NOT NULL,
        "change" TEXT NOT NULL,
        "trend" TEXT NOT NULL
      );
    `
    console.log('Stat table created.')
    
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "QuickAction" (
        "id" SERIAL PRIMARY KEY,
        "title" TEXT NOT NULL,
        "label" TEXT NOT NULL,
        "href" TEXT NOT NULL,
        "icon" TEXT NOT NULL
      );
    `
    console.log('QuickAction table created.')
    
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "RecentActivity" (
        "id" SERIAL PRIMARY KEY,
        "action" TEXT NOT NULL,
        "description" TEXT NOT NULL,
        "timestamp" TEXT NOT NULL
      );
    `
    console.log('RecentActivity table created.')
    
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "Member" (
        "id" SERIAL PRIMARY KEY,
        "firstName" TEXT NOT NULL,
        "lastName" TEXT NOT NULL,
        "role" TEXT NOT NULL,
        "imageName" TEXT,
        "imageData" BYTEA,
        "imageMimeType" TEXT,
        "bio" TEXT,
        "joinDate" TIMESTAMP NOT NULL,
        "facebook" TEXT,
        "twitter" TEXT,
        "instagram" TEXT,
        "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP NOT NULL
      );
    `
    console.log('Member table created.')
    
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "Event" (
        "id" SERIAL PRIMARY KEY,
        "title" TEXT NOT NULL,
        "date" TIMESTAMP NOT NULL,
        "venue" TEXT NOT NULL,
        "price" DOUBLE PRECISION NOT NULL,
        "availableSeats" INTEGER NOT NULL,
        "imageUrl" TEXT,
        "description" TEXT,
        "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP NOT NULL
      );
    `
    console.log('Event table created.')
    
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "Blog" (
        "id" SERIAL PRIMARY KEY,
        "title" TEXT NOT NULL,
        "category" TEXT NOT NULL,
        "imageName" TEXT,
        "imageData" BYTEA,
        "imageMimeType" TEXT,
        "excerpt" TEXT,
        "content" TEXT NOT NULL,
        "published" BOOLEAN NOT NULL DEFAULT false,
        "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP NOT NULL
      );
    `
    console.log('Blog table created.')
    
    console.log('All tables created successfully!')
  } catch (error) {
    console.error('Error creating tables:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()
