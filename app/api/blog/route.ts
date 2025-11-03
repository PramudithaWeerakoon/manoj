import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(request: Request) {
  try {
    // Handle multipart form data
    const formData = await request.formData();
    
    // Extract form fields
    const title = formData.get('title') as string;
    const category = formData.get('category') as string;
    const excerpt = formData.get('excerpt') as string;
    const content = formData.get('content') as string;
    const published = formData.get('published') === 'true';
    
    // Validate required fields
    if (!title || !content) {
      return NextResponse.json(
        { error: "Title and content are required fields" },
        { status: 400 }
      );
    }
    
    // Process the uploaded image if present
    const imageFile = formData.get('image') as File | null;
    let imageName = null;
    let imageData = null;
    let imageMimeType = null;
    
    if (imageFile && imageFile instanceof File) {
      imageName = imageFile.name;
      imageMimeType = imageFile.type;
      
      // Convert file to binary data for storage
      const buffer = await imageFile.arrayBuffer();
      imageData = Buffer.from(buffer);
    }
    
    // Create blog post with image data if available
    const blogPost = await prisma.blog.create({
      data: {
        title,
        category: category || "Uncategorized",
        imageName,
        imageData,
        imageMimeType,
        excerpt: excerpt || null,
        content,
        published,
      },
    });
    
    return NextResponse.json(blogPost, { status: 201 });
  } catch (error) {
    console.error('Failed to create blog post:', error);
    return NextResponse.json(
      { error: 'Failed to create blog post' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (id) {
      // Get single blog post
      const blogPost = await prisma.blog.findUnique({
        where: { id: parseInt(id) },
      });
      
      if (!blogPost) {
        return NextResponse.json(
          { error: 'Blog post not found' },
          { status: 404 }
        );
      }
      
      return NextResponse.json(blogPost);
    } else {
      // Get all blog posts
      const blogPosts = await prisma.blog.findMany({
        orderBy: { createdAt: 'desc' },
      });
      
      return NextResponse.json({ posts: blogPosts });
    }
  } catch (error) {
    console.error('Failed to fetch blog posts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch blog posts' },
      { status: 500 }
    );
  }
}
