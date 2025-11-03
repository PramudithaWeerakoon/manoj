import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// Get a specific background image
export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const id = parseInt((await context.params).id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid image ID' },
        { status: 400 }
      );
    }
    
    const backgroundImage = await prisma.backgroundImage.findUnique({
      where: { id }
    });
    
    if (!backgroundImage) {
      return NextResponse.json(
        { error: 'Image not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      id: backgroundImage.id,
      title: backgroundImage.title,
      imageUrl: `data:${backgroundImage.imageMimeType};base64,${Buffer.from(backgroundImage.imageData).toString('base64')}`,
      order: backgroundImage.order,
      isActive: backgroundImage.isActive,
      createdAt: backgroundImage.createdAt
    });
  } catch (error) {
    console.error('Failed to fetch background image:', error);
    return NextResponse.json(
      { error: 'Failed to fetch background image' },
      { status: 500 }
    );
  }
}

// Update background image status or order
export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const unwrappedParams = await context.params;
    const id = parseInt(unwrappedParams.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid image ID' },
        { status: 400 }
      );
    }
    
    const data = await request.json();
    
    const updatedImage = await prisma.backgroundImage.update({
      where: { id },
      data: {
        isActive: data.isActive !== undefined ? data.isActive : undefined,
        order: data.order !== undefined ? data.order : undefined,
        title: data.title || undefined
      }
    });
    
    return NextResponse.json({ 
      success: true, 
      message: 'Background image updated successfully',
      image: {
        id: updatedImage.id,
        title: updatedImage.title,
        order: updatedImage.order,
        isActive: updatedImage.isActive
      }
    });
  } catch (error) {
    console.error('Failed to update background image:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update background image' },
      { status: 500 }
    );
  }
}

// Delete a background image
export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const id = parseInt((await context.params).id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid image ID' },
        { status: 400 }
      );
    }
    
    // First check if the image exists
    const existingImage = await prisma.backgroundImage.findUnique({
      where: { id }
    });
    
    if (!existingImage) {
      return NextResponse.json(
        { success: false, error: 'Image not found' },
        { status: 404 }
      );
    }
      // Then try to delete it
    await prisma.backgroundImage.delete({
      where: { id }
    });
    
    return NextResponse.json({ 
      success: true, 
      message: 'Background image deleted successfully',
      deletedImageId: id 
    }, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  } catch (error) {
    console.error('Failed to delete background image:', error);
    // Include more detailed error information
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to delete background image', 
        details: errorMessage 
      },
      { status: 500 }
    );
  }
}
