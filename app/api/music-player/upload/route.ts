import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    // Parse the form data
    const formData = await request.formData();
    const audioFile = formData.get('audioFile') as File;
    const title = formData.get('title') as string;
    const artist = formData.get('artist') as string;
    const albumId = parseInt(formData.get('albumId') as string);
    const addToPlayer = formData.get('addToPlayer') === 'true';
    
    if (!audioFile || !title || isNaN(albumId)) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' }, 
        { status: 400 }
      );
    }
    
    // Read file as ArrayBuffer
    const audioBytes = await audioFile.arrayBuffer();
    const buffer = Buffer.from(audioBytes);
    
    // Get track duration - in a real app you'd use a library like music-metadata
    const duration = "3:45"; // Placeholder
    
    // Count existing tracks for this album to determine track_number
    const trackCount = await prisma.track.count({
      where: { album_id: albumId }
    });
    
    // Create the track in the database
    const track = await prisma.track.create({
      data: {
        title,
        artist,
        duration,
        audioData: buffer,
        audioFileName: audioFile.name,
        audioMimeType: audioFile.type,
        album_id: albumId,
        track_number: trackCount + 1, // Simple track number assignment
        isInPlayer: addToPlayer,
        addedToPlayer: addToPlayer ? new Date() : null
      }
    });
    
    return NextResponse.json({ 
      success: true, 
      track: {
        id: track.id,
        title: track.title
      }
    });
  } catch (error) {
    console.error('Error uploading track:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to upload track',
        details: error instanceof Error ? error.message : String(error)
      }, 
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
