import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the Gemini API with the API key from environment variables
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || '');

// Function to get database information that matches the actual schema
async function getWebsiteData() {
  try {
    // Fetching relevant data from your database
    const [
      albums,
      events,
      members,
      blogs,
      tracks
    ] = await Promise.all([
      // Get recent albums (limited to 5)
      prisma.album.findMany({ 
        take: 5,
        orderBy: { release_date: 'desc' },
        select: { 
          id: true,
          title: true,
          release_date: true,
          description: true
        }
      }),
      
      // Get Latest Events (limited to 5)
      prisma.event.findMany({
        where: { date: { gte: new Date() } },
        take: 5,
        orderBy: { date: 'asc' },
        select: {
          id: true,
          title: true,
          date: true,
          venue: true,
          description: true,
          price: true
        }
      }),
      
      // Get Team members - using correct model name and fields
      prisma.member.findMany({
        take: 10,
        select: {
          id: true,
          firstName: true,
          lastName: true,
          role: true,
          bio: true
        }
      }),
      
      // Get recent blog posts - using correct model name and fields
      prisma.blog.findMany({
        take: 3,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          title: true,
          excerpt: true,
          category: true
        }
      }),
      
      // Get featured tracks
      prisma.track.findMany({
        where: { isInPlayer: true },
        take: 5,
        select: {
          id: true,
          title: true,
          artist: true,
          album: {
            select: {
              title: true
            }
          }
        }
      })
    ]);
    
    // Return formatted data
    return {
      albums,
      events,
      bandMembers: members.map(member => ({
        id: member.id,
        name: `${member.firstName} ${member.lastName}`,
        role: member.role,
        bio: member.bio
      })),
      blogPosts: blogs,
      tracks
    };
  } catch (error) {
    console.error("Error fetching website data:", error);
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json();
    
    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }
    
    try {
      // Get website data from database
      const websiteData = await getWebsiteData();
      
      if (!websiteData) {
        return NextResponse.json(
          { error: "Failed to fetch website data" },
          { status: 500 }
        );
      }
      
      try {
        // Use the gemini-2.0-flash model for improved responses
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
        
        // Define the prompt with database context
        const prompt = `
        You are a helpful assistant for a radioo website. Answer only questions related to:
        - Music and albums
        - Events and bookings
        - Blog posts and reviews
        - Team members
        - Merchandise
        - Contact information
        
        If asked about other topics, politely explain you can only help with radioo website information.
        
        Website database information:
        ${JSON.stringify(websiteData, null, 2)}
        
        User question: ${message}
        `;
        
        // Simple content generation without chat mode
        const result = await model.generateContent(prompt);
        const responseText = result.response.text();
        
        return NextResponse.json({ response: responseText });
      } catch (error: any) {
        console.error('Gemini model error:', error);
        
        // Handle specific error types
        if (error.message?.includes('not found for API version')) {
          // Fall back to gemini-pro if the 2.0-flash model is not available
          try {
            const fallbackModel = genAI.getGenerativeModel({ model: "gemini-pro" });
            
            const prompt = `
            You are a helpful assistant for a radioo website. Answer only questions related to:
            - Music and albums
            - Events and bookings
            - Blog posts and reviews
            - Team members
            - Merchandise
            - Contact information
            
            If asked about other topics, politely explain you can only help with radioo website information.
            
            Website database information:
            ${JSON.stringify(websiteData, null, 2)}
            
            User question: ${message}
            `;
            
            const fallbackResult = await fallbackModel.generateContent(prompt);
            const fallbackResponseText = fallbackResult.response.text();
            
            return NextResponse.json({ response: fallbackResponseText });
          } catch (fallbackError) {
            console.error('Fallback model error:', fallbackError);
            return NextResponse.json({ 
              response: "I'm sorry, there's a configuration issue with our assistant. Our team has been notified and is working to fix it." 
            });
          }
        }
        
        return NextResponse.json({ 
          response: "I'm sorry, I'm having trouble accessing the model. Please try again later." 
        });
      }
    } catch (error) {
      console.error('Error with data processing:', error);
      return NextResponse.json({ 
        response: "I'm sorry, I'm having trouble processing the website information. Please try again later."
      });
    }
  } catch (error) {
    console.error('Error with chatbot API request:', error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}