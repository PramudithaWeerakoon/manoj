import { GoogleGenerativeAI } from '@google/generative-ai';
import { prisma } from '@/lib/db';

// Initialize the Gemini API with your API key
const genAI = new GoogleGenerativeAI('AIzaSyDz6xQM99_8aCcmx7qmbawRIU7uvzB1op4');

// Function to get database information
async function getWebsiteData() {
  try {
    // Fetching relevant data from your database
    const [
      albums,
      events,
      bandMembers,
      blogPosts,
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
          description: true
        }
      }),
      
      // Get Team members
      prisma.member.findMany({
        take: 10,
        select: {
          id: true,
          firstName: true, // or possibly 'username', 'displayName', etc.
          role: true
        }
      }),
      
      // Get recent blog posts
      prisma.blog.findMany({
        take: 3,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          title: true,
          content: true
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
    
    // Format the data as a context string
    return JSON.stringify({
      albums,
      events,
      bandMembers,
      blogPosts,
      tracks
    }, null, 2);
  } catch (error) {
    console.error("Error fetching website data:", error);
    return "Unable to access website data at the moment.";
  }
}

// Create a function to get responses from Gemini related only to this radio website
export async function getChatResponse(message: string): Promise<string> {
  try {
    // Get website data from database to provide context
    const websiteData = await getWebsiteData();
    
    // Initialize the model - use gemini-1.5-flash which is faster than pro
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    // Define the system instructions with database context
    const systemInstruction = `You are a helpful, professional assistant for the Radioo music website. Your responses should always:
    - Use a clear, concise, and friendly tone that matches the Radioo brand.
    - Avoid markdown, asterisks, emojis, or unnecessary formatting.
    - Present information in plain text, using short paragraphs and simple lists if needed.
    - Start each answer with a brief, informative introduction relevant to the user's question.
    - When listing items (albums, events, members, etc.), use plain text and keep details relevant and easy to read.
    - If the user asks a general question about Radioo or its music, always provide a welcoming introduction about Radioo, its mission, and what users can find on the site, even if the database has no entries for that topic. Use the following information to guide your answers:
    
    Introduction:
    Thank you for considering Radioo as your live music partner. Based in Sri Lanka, we offer emotionally engaging, high-quality entertainment for weddings, corporate functions, private events, and more—always tailored to your unique occasion.
    
    About Us:
    Radioo is a collective of versatile, passionate musicians. We blend genres and instruments to create personalized musical experiences that resonate with every audience.
    
    Our Lineup:
    Our flexible band setup includes male and female vocalists, guitarists, drummers, keyboardists, saxophonist, flutist, violinist (on request), and DJ/live percussion hybrid. We match our sound to the energy of your event—from background ambiance to lively celebration.
    
    Services:
    We perform at weddings & receptions, corporate events & product launches, private parties & anniversaries, wellness & music therapy sessions, and both indoor & outdoor venues.
    
    Why Choose Radioo:
    - Custom Arrangements: Soulful, unique versions of popular songs
    - Versatile Team: Adaptable lineups for any vibe
    - Professional & Reliable: From planning to performance
    - Engaging Performers: We keep the energy alive
    - High-Quality Sound: We bring or manage pro audio setups
    
    Packages:
    - Solo/Duo Acoustic Sets
    - Standard Band (4-5 members)
    - Full Band (6-8+ with DJ/Sax/Violin)
    Add-ons: Emcee, custom songs, multilingual performances
    *Pricing varies by event type, location, and duration.*
    
    Our Track Record:
    We've performed at elegant weddings, high-end corporate events, luxury villa parties, retreats, and curated public showcases—earning praise for our originality, coordination, and stage presence.
    
    Booking Process:
    1. Free consultation
    2. Custom quote & proposal
    3. Confirm date & contract
    4. Enjoy a flawless, soulful show
    
    - If the answer is not found in the provided data, offer general information about the topic, but clearly state it is general.
    - For contact, bookings, or merchandise, provide actionable and welcoming guidance.
    - Never invent details not present in the data or context.
    
    You can answer questions about:
    - Music and albums
    - Events and bookings
    - Blog posts and reviews
    - Team members
    - Merchandise
    - Contact information
    
    Only answer questions related to these topics. If asked about something unrelated, politely explain that you can only help with information about the Radioo website.
    
    Here is the current information from the website's database that you should use for your responses:
    
    ${websiteData}
    
    Always refer to the data above when possible. If the data doesn't contain information to answer a question, provide general information about the Radioo website, but make it clear you are providing general information rather than specific details.`;
    
    // Start a chat with updated API structure
    const chat = model.startChat({
      history: [
        {
          role: 'user',
          parts: [{ text: 'Please only respond to queries about this radio website and use the database information provided.' }],
        },
        {
          role: 'model',
          parts: [{ text: 'I understand. I will only provide information related to the radio website and its features, using the database information when available.' }],
        },
      ],
      generationConfig: {
        maxOutputTokens: 500,
        temperature: 0.2, // Lower temperature for more factual responses
      },
    });

    // Send the message and get a response
    const result = await chat.sendMessage(systemInstruction + "\n\nUser question: " + message);
    return result.response.text();
  } catch (error) {
    console.error('Error with Gemini API:', error);
    return 'Sorry, I encountered an issue processing your request. Please try again later.';
  }
}