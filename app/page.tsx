"use client";

import { Button } from "@/components/ui/button";
import { Play, Pause, Calendar, Ticket, ArrowRight, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { MusicPlayer } from "@/components/music-player";
import { EventScroller } from "@/components/event-scroller";
import { HeroSection } from "@/components/hero-section";
import { BookingSection } from "@/components/booking-section";
import { ChatBot } from "@/components/chat-bot";
import Link from "next/link";
import { toast } from "@/components/ui/use-toast";

// Define the Event interface
interface Event {
  id: number;
  title: string;
  date: string;
  venue: string;
  price: number;
  availableSeats: number;
  imageName?: string;
  image?: string;
  imageUrl?: string;
  description?: string;
  time?: string;
}

export default function Home() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [events, setEvents] = useState<Event[]>([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [eventsError, setEventsError] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [isSubscribing, setIsSubscribing] = useState(false);

  useEffect(() => {
    async function fetchLatestEvents() {
      try {
        setEventsLoading(true);
        const response = await fetch('/api/events?limit=3');
        
        if (!response.ok) {
          throw new Error('Failed to fetch events');
        }
        
        const data = await response.json();
        
        // Process events to add proper image URLs with cache busting
        const processedEvents = data.events.map((event: any) => ({
          ...event,
          // Add cache busting to image URLs
          imageUrl: event.imageName ? `/api/events/${event.id}/image?t=${Date.now()}` : null,
          // Ensure image property exists as a fallback
          image: event.image || "https://placehold.co/600x400?text=No+Image"
        }));
        
        setEvents(processedEvents || []);
        setEventsError(null);
      } catch (error) {
        console.error('Error fetching events:', error);
        setEventsError('Failed to load events');
      } finally {
        setEventsLoading(false);
      }
    }

    fetchLatestEvents();
  }, []);

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubscribing(true);
    
    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Subscription failed');
      }
      
      toast({
        title: "Success!",
        description: data.message || "You've been subscribed to our newsletter.",
      });
      
      // Clear the email input
      setEmail('');
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to subscribe. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubscribing(false);
    }
  };

  return (
    <main className="min-h-screen bg-background">
      <HeroSection />
      
      {/* Latest Release Section */}
      <section className="py-24 bg-[#006666] text-custom-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
          >
            <motion.div variants={fadeInUp} className="space-y-6">
              <h2 className="text-4xl font-bold">Latest Release</h2>
              <p className="text-xl text-gray-400">
                &quot;Echoes of Tomorrow&quot; - Our most ambitious album yet, featuring a unique blend of classical rock and electronic elements.
              </p>
              <div className="flex gap-4">
                <Link href="/albums">
                  <Button size="lg" variant="outline" className="text-black border-custom-white hover:bg-custom-white/20">
                    View All Albums
                  </Button>
                </Link>
              </div>
            </motion.div>
            <motion.div variants={fadeInUp}>
              <MusicPlayer />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Latest Events Section */}
      <section className="py-24 bg-[#9BC1BC]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="text-center mb-12"
          >
            <motion.h2 variants={fadeInUp} className="text-4xl font-bold mb-4">
              Latest Events
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-xl text-muted-foreground">
              Join us at our next performance
            </motion.p>
          </motion.div>
          
          {eventsLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
              <p className="text-muted-foreground">Loading events...</p>
            </div>
          ) : eventsError ? (
            <div className="text-center py-12">
              <p className="text-red-500">{eventsError}</p>
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No Latest Events found.</p>
            </div>
          ) : (
            <EventScroller events={events} />
          )}
          
          <motion.div
            variants={fadeInUp}
            className="text-center mt-12"
          >
            <Link href="/events">
              <Button size="lg" className="bg-primary hover:bg-primary/90">
                View All Events
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Featured Content */}
      <section className="py-24 bg-[#9BC1BC]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {[
              {
                title: "Meet the Team",
                description: "Get to know the talented musicians behind Radioo Music",
                image: "https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
                link: "/members"
              },
              {
                title: "Latest News",
                description: "Stay updated with our latest announcements and blog posts",
                image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
                link: "/blog"
              },
              {
                title: "Hire Our Team",
                description: "Book us for your next event and experience live music that will elevate any occasion",
                image: "https://i.postimg.cc/25mVyPwq/Whats-App-Image-2025-04-15-at-21-31-10-2c838c59.jpg",
                link: "/hire"
              }
            ].map((item, index) => (
              <motion.div
                key={item.title}
                variants={fadeInUp}
                className="group relative overflow-hidden rounded-lg"
              >
                <Link href={item.link}>
                  <div className="relative h-96">
                    <div
                      className="absolute inset-0 bg-cover bg-center group-hover:scale-110 transition-transform duration-500"
                      style={{ backgroundImage: `url(${item.image})` }}
                    />
                    <div className="absolute inset-0 bg-black/60 group-hover:bg-black/40 transition-colors duration-500" />
                    <div className="absolute inset-0 p-6 flex flex-col justify-end">
                      <h3 className="text-2xl font-bold text-custom-white mb-2">{item.title}</h3>
                      <p className="text-gray-200">{item.description}</p>
                      <Button
                        variant="outline"
                        className="mt-4 text-black border-black hover:bg-black hover:text-custom-white transition-colors"
                      >
                        Learn More
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-24 bg-[#014441] text-custom-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="text-center"
          >
            <motion.h2 variants={fadeInUp} className="text-4xl font-bold mb-4">
              Stay Connected
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-xl text-gray-400 mb-8">
              Subscribe to our newsletter for exclusive updates and behind-the-scenes content
            </motion.p>
            <motion.form
              variants={fadeInUp}
              className="max-w-md mx-auto flex flex-col gap-4 sm:flex-row"
              onSubmit={handleSubscribe}
            >
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-2 rounded-lg bg-custom-white/10 border border-custom-white/20 text-custom-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-custom-white/50 min-w-0"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Button 
                type="submit" 
                className="bg-custom-white text-black hover:bg-custom-white/90 w-full sm:w-auto"
                disabled={isSubscribing}
              >
                {isSubscribing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Subscribing...
                  </>
                ) : (
                  'Subscribe'
                )}
              </Button>
            </motion.form>
          </motion.div>
        </div>
      </section>

      <BookingSection />
      
      {/* Gemini-powered Chat Bot */}
      <ChatBot />
    </main>
  );
}