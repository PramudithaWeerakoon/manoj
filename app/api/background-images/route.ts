import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { optimizeImage, generateBlurPlaceholder } from '@/lib/image-utils';

// Get all background images
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const showAll = searchParams.get('all') === 'true'; // Get 'all' query parameter
    
    const backgroundImages = await prisma.backgroundImage.findMany({
      where: {
        isActive: showAll ? undefined : true // Only filter by isActive if we're not showing all
      },
      orderBy: {
        order: 'asc'
      }
    });

    // Transform and optimize images before sending to client
    const formattedImages = await Promise.all(backgroundImages.map(async (image) => {
      try {
        // Optimize image to WebP format
        const optimizedImageBuffer = await optimizeImage(Buffer.from(image.imageData), {
          width: 1920,
          format: 'webp',
          quality: 80
        });
        
        // Generate blur placeholder for progressive loading
        const blurPlaceholder = await generateBlurPlaceholder(Buffer.from(image.imageData));
        
        return {
          id: image.id,
          title: image.title,
          imageUrl: `data:image/webp;base64,${optimizedImageBuffer.toString('base64')}`,
          blurDataUrl: blurPlaceholder,
          order: image.order,
          isActive: image.isActive,
          createdAt: image.createdAt
        };
      } catch (err) {
        console.error('Error optimizing image:', err);
        // Fallback to original image if optimization fails
        return {
          id: image.id,
          title: image.title,
          imageUrl: `data:${image.imageMimeType};base64,${Buffer.from(image.imageData).toString('base64')}`,
          order: image.order,
          isActive: image.isActive,
          createdAt: image.createdAt
        };
      }
    }));
    
    return NextResponse.json({ 
      success: true, 
      images: formattedImages,
      count: formattedImages.length,
      timestamp: new Date().toISOString() 
    }, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  } catch (error) {
    console.error('Failed to fetch background images:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch background images' },
      { status: 500 }
    );
  }
}

// Upload a new background image
export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const title = formData.get('title') as string;
    const image = formData.get('image') as File;
    const order = parseInt(formData.get('order') as string) || 0;
    
    if (!image) {
      return NextResponse.json(
        { success: false, error: 'No image provided' },
        { status: 400 }
      );
    }

    // Process the uploaded image
    const imageBuffer = Buffer.from(await image.arrayBuffer());
      // Optimize image before saving to database
    const optimizedImageBuffer = await optimizeImage(imageBuffer, {
      width: 1920,
      format: 'jpeg',
      quality: 85
    });

    // Generate blur placeholder for progressive loading
    const blurPlaceholder = await generateBlurPlaceholder(imageBuffer);

    const backgroundImage = await prisma.backgroundImage.create({
      data: {
        title: title || 'Hero Background',
        imageData: new Uint8Array(optimizedImageBuffer), // Convert Buffer to Uint8Array for Prisma
        imageMimeType: 'image/jpeg',
        order,
        isActive: true
      }
    });
    
    // Create a data URL to return to the client for immediate display
    const imageUrl = `data:image/jpeg;base64,${optimizedImageBuffer.toString('base64')}`;
    
    return NextResponse.json({ 
      success: true, 
      message: 'Background image uploaded successfully',
      image: {
        id: backgroundImage.id,
        title: backgroundImage.title,
        order: backgroundImage.order,
        isActive: backgroundImage.isActive,
        createdAt: backgroundImage.createdAt,
        imageUrl, // Return the data URL for immediate use
        blurDataUrl: blurPlaceholder
      }
    }, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  } catch (error) {
    console.error('Failed to upload background image:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to upload background image' },
      { status: 500 }
    );
  }
}
