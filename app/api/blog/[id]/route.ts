import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// Get a specific blog post by ID
export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Await context.params before accessing its properties
    const { id: idParam } = await context.params;
    const id = parseInt(idParam);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid blog ID' },
        { status: 400 }
      );
    }
    
    const blog = await prisma.blog.findUnique({
      where: { id },
    });
    
    if (!blog) {
      return NextResponse.json(
        { error: 'Blog post not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(blog);
  } catch (error) {
    console.error('Error fetching blog post:', error);
    return NextResponse.json(
      { error: 'Failed to fetch blog post' },
      { status: 500 }
    );
  }
}

// Delete a blog post
export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Await context.params before accessing its properties
    const { id: idParam } = await context.params;
    const id = parseInt(idParam);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid blog ID' },
        { status: 400 }
      );
    }
    
    // Check if the blog post exists
    const blogExists = await prisma.blog.findUnique({
      where: { id },
    });
    
    if (!blogExists) {
      return NextResponse.json(
        { error: 'Blog post not found' },
        { status: 404 }
      );
    }
    
    // Delete the blog post
    await prisma.blog.delete({
      where: { id },
    });
    
    return NextResponse.json(
      { success: true, message: 'Blog post deleted successfully' }
    );
  } catch (error) {
    console.error('Error deleting blog post:', error);
    return NextResponse.json(
      { error: 'Failed to delete blog post' },
      { status: 500 }
    );
  }
}

// Update a blog post
export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Await context.params before accessing its properties
    const { id: idParam } = await context.params;
    const id = parseInt(idParam);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid blog ID' },
        { status: 400 }
      );
    }
    
    // Check if the blog post exists
    const blogExists = await prisma.blog.findUnique({
      where: { id },
    });
    
    if (!blogExists) {
      return NextResponse.json(
        { error: 'Blog post not found' },
        { status: 404 }
      );
    }
    
    // Process multipart form data
    const formData = await request.formData();
    
    // Extract form fields
    const title = formData.get('title') as string;
    const category = formData.get('category') as string;
    const excerpt = formData.get('excerpt') as string;
    const content = formData.get('content') as string;
    const published = formData.get('published') === 'true';
    const imageRemoved = formData.get('imageRemoved') === 'true';
    
    // Validate required fields
    if (!title || !content) {
      return NextResponse.json(
        { error: "Title and content are required fields" },
        { status: 400 }
      );
    }
    
    // Prepare update data
    const updateData: any = {
      title,
      category: category || "Uncategorized",
      excerpt: excerpt || null,
      content,
      published,
      updatedAt: new Date(),
    };
    
    // Process the uploaded image if present
    const imageFile = formData.get('image') as File | null;
    
    if (imageFile && imageFile instanceof File && imageFile.size > 0) {
      // Process new image
      updateData.imageName = imageFile.name;
      updateData.imageMimeType = imageFile.type;
      
      // Convert file to binary data for storage
      const buffer = await imageFile.arrayBuffer();
      updateData.imageData = Buffer.from(buffer);
    } else if (imageRemoved) {
      // Remove image if requested
      updateData.imageName = null;
      updateData.imageData = null;
      updateData.imageMimeType = null;
    }
    
    // Update blog post
    const updatedBlog = await prisma.blog.update({
      where: { id },
      data: updateData,
    });
    
    return NextResponse.json({
      success: true,
      message: "Blog post updated successfully",
      blog: {
        id: updatedBlog.id,
        title: updatedBlog.title,
        published: updatedBlog.published,
      }
    });
  } catch (error) {
    console.error('Error updating blog post:', error);
    return NextResponse.json(
      { error: 'Failed to update blog post' },
      { status: 500 }
    );
  }
}
