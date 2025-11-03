import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Helper function to handle BigInt serialization
const serializeData = (data: any): any => {
  return JSON.parse(
    JSON.stringify(data, (key, value) => {
      // Convert BigInt to String to avoid serialization errors
      if (typeof value === 'bigint') {
        return value.toString();
      }
      return value;
    })
  );
};

// GET a single album by ID
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Await params before accessing its properties
    const { id: paramId } = await params;
    const id = parseInt(paramId);
    
    if (isNaN(id)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid album ID'
      }, { status: 400 });
    }
    
    const album = await prisma.album.findUnique({
      where: { id },
      include: {
        tracks: { orderBy: { track_number: 'asc' } },
        album_credits: true
      }
    });
    
    if (!album) {
      return NextResponse.json({
        success: false,
        error: 'Album not found'
      }, { status: 404 });
    }
    
    // Serialize album data to handle BigInt values
    const serializedAlbum = serializeData(album);
    
    // Add coverImageUrl for frontend display
    const albumWithImageUrl = {
      ...serializedAlbum,
      coverImageUrl: album.coverImageData ? `/api/albums/${id}/cover` : null
    };
    
    return NextResponse.json({
      success: true,
      album: albumWithImageUrl
    });
    
  } catch (error) {
    console.error('Error fetching album:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch album',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}

// UPDATE an album by ID
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Await params before accessing its properties
    const { id: paramId } = await params;
    const id = parseInt(paramId);
    
    if (isNaN(id)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid album ID'
      }, { status: 400 });
    }
    
    // Check if album exists
    const existingAlbum = await prisma.album.findUnique({
      where: { id }
    });
    
    if (!existingAlbum) {
      return NextResponse.json({
        success: false,
        error: 'Album not found'
      }, { status: 404 });
    }
    
    // Get form data
    const formData = await request.formData();
    const title = formData.get('title')?.toString() || null;
    const releaseDate = formData.get('releaseDate')?.toString() || null;
    const description = formData.get('description')?.toString() || null;
    const youtubeId = formData.get('youtubeId')?.toString() || null;
    
    // Handle cover image upload if present
    const coverImage = formData.get('coverImage');
    let coverImageData: Buffer | undefined = undefined;
    let coverImageName: string | undefined = undefined;
    let coverImageMimeType: string | undefined = undefined;
    
    if (coverImage && coverImage instanceof File && coverImage.size > 0) {
      // Process the image data
      coverImageData = Buffer.from(await coverImage.arrayBuffer());
      coverImageName = coverImage.name;
      coverImageMimeType = coverImage.type;
    }
    
    // Parse tracks and credits from form data
    const tracksJson = formData.get('tracks')?.toString();
    const creditsJson = formData.get('credits')?.toString();
    
    let tracks: any[] = [];
    let credits: any[] = [];
    
    try {
      if (tracksJson) tracks = JSON.parse(tracksJson);
      if (creditsJson) credits = JSON.parse(creditsJson);
    } catch (e) {
      return NextResponse.json({
        success: false,
        error: 'Failed to parse tracks or credits data'
      }, { status: 400 });
    }
    
    // Update the album in a transaction
    const updatedAlbum = await prisma.$transaction(async (prisma) => {
      // 1. Update album basic information
      const albumUpdate: any = {
        title,
        release_date: releaseDate ? new Date(releaseDate) : undefined,
        description,
        youtube_id: youtubeId,
      };
      
      // Only update image data if a new image was provided
      if (coverImageData) {
        albumUpdate.coverImageData = coverImageData;
        albumUpdate.coverImageName = coverImageName;
        albumUpdate.coverImageMimeType = coverImageMimeType;
      }
      
      const album = await prisma.album.update({
        where: { id },
        data: albumUpdate
      });
      
      // 2. Handle tracks: delete existing tracks for this album
      await prisma.track.deleteMany({
        where: { album_id: id }
      });
      
      // 3. Create new tracks
      if (tracks.length > 0) {
        await prisma.track.createMany({
          data: tracks.map((track: any, index: number) => ({
            title: track.title,
            duration: track.duration || null,
            track_number: index + 1,
            album_id: id
          }))
        });
      }
      
      // 4. Handle credits: delete existing credits for this album
      await prisma.albumCredit.deleteMany({
        where: { album_id: id }
      });
      
      // 5. Create new credits
      if (credits.length > 0) {
        await prisma.albumCredit.createMany({
          data: credits.map((credit: any) => ({
            role: credit.role,
            name: credit.name,
            album_id: id
          }))
        });
      }
      
      // Get the updated album with related records
      return await prisma.album.findUnique({
        where: { id },
        include: {
          tracks: { orderBy: { track_number: 'asc' } },
          album_credits: true
        }
      });
    });
    
    // Serialize album data to handle BigInt values
    const serializedAlbum = serializeData(updatedAlbum);
    
    // Add image URL for frontend display and handle potentially null updatedAlbum
    const albumWithImageUrl = updatedAlbum ? {
      ...serializedAlbum,
      coverImageUrl: updatedAlbum.coverImageData ? `/api/albums/${id}/cover` : null
    } : null;
    
    return NextResponse.json({
      success: true,
      message: 'Album updated successfully',
      album: albumWithImageUrl
    });
    
  } catch (error) {
    console.error('Error updating album:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to update album',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}

// DELETE an album by ID
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Await params before accessing its properties
    const { id: paramId } = await params;
    const id = parseInt(paramId);
    
    if (isNaN(id)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid album ID'
      }, { status: 400 });
    }
    
    // Check if album exists
    const album = await prisma.album.findUnique({
      where: { id }
    });
    
    if (!album) {
      return NextResponse.json({
        success: false,
        error: 'Album not found'
      }, { status: 404 });
    }
    
    // Delete album and related records in a transaction
    await prisma.$transaction(async (prisma) => {
      // 1. Delete tracks related to this album
      await prisma.track.deleteMany({
        where: { album_id: id }
      });
      
      // 2. Delete credits related to this album
      await prisma.albumCredit.deleteMany({
        where: { album_id: id }
      });
      
      // 3. Delete the album itself
      await prisma.album.delete({
        where: { id }
      });
    });
    
    return NextResponse.json({
      success: true,
      message: 'Album deleted successfully'
    });
    
  } catch (error) {
    console.error('Error deleting album:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to delete album',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
