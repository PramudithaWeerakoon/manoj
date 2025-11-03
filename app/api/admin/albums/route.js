import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { writeFile } from 'fs/promises';
import path from 'path';

const prisma = new PrismaClient();

export async function POST(request) {
  try {
    // Parse the multipart form data
    const formData = await request.formData();
    
    // Extract text data
    const title = formData.get('title');
    const releaseDate = formData.get('releaseDate');
    const description = formData.get('description');
    const youtubeId = formData.get('youtubeId');
    const tracksJson = formData.get('tracks');
    const creditsJson = formData.get('credits');
    
    // Parse JSON strings
    const tracks = tracksJson ? JSON.parse(tracksJson) : [];
    const credits = creditsJson ? JSON.parse(creditsJson) : [];
    
    // Extract file
    const coverImage = formData.get('coverImage');
    
    // Create album data object
    const albumData = {
      title,
      release_date: releaseDate ? new Date(releaseDate) : null,
      description: description || null,
      youtube_id: youtubeId || null,
    };
    
    // Process cover image if it exists
    if (coverImage && coverImage.size > 0) {
      const buffer = Buffer.from(await coverImage.arrayBuffer());
      
      albumData.coverImageName = coverImage.name;
      albumData.coverImageData = buffer;
      albumData.coverImageMimeType = coverImage.type;
    }
    
    // Create album in database
    const album = await prisma.album.create({
      data: albumData
    });
    
    // Create album credits if any
    if (credits.length > 0) {
      await Promise.all(
        credits.map(credit => 
          prisma.albumCredit.create({
            data: {
              role: credit.role,
              name: credit.name,
              album_id: album.id
            }
          })
        )
      );
    }
    
    // Create tracks if any
    if (tracks.length > 0) {
      await Promise.all(
        tracks.map((track, index) => 
          prisma.track.create({
            data: {
              title: track.title,
              duration: track.duration || null,
              track_number: index + 1,
              album_id: album.id
            }
          })
        )
      );
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Album created successfully',
      albumId: album.id
    }, { status: 201 });
    
  } catch (error) {
    console.error('Error creating album:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to create album',
      error: error.message
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
