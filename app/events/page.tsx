"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Calendar as CalendarIcon, MapPin, DollarSign, Clock, Image as ImageIcon, ArrowLeft } from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";
import Loading from "../loading";

// Define an interface for the Event type
interface Event {
  id: number;
  title: string;
  date: string;
  venue: string;
  price: number;
  availableSeats: number;
  imageUrl?: string;
  image?: string;
  imageName?: string;
  description?: string;
  time?: string;
  category?: string;
}

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Create a ref for the top of the page
  const topRef = useRef<HTMLDivElement>(null);

  // Event categories
  const eventCategories = [
    {
      id: "hotel-lounges",
      title: "Hotel Lounges & Bars",
      description: "Live music experiences in elegant hotel settings",
      image: "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
    },
    {
      id: "theme-nights",
      title: "Weekly Theme Nights",
      description: "Exciting themed music events every week",
      image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
    },
    {
      id: "private-corporate",
      title: "Private & Corporate Functions",
      description: "Exclusive music experiences for your special events",
      image: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
    },
    {
      id: "weddings",
      title: "Wedding Receptions",
      description: "Make your special day unforgettable with live music",
      image: "https://images.unsplash.com/photo-1519741497674-611481863552?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
    },
    {
      id: "seasonal",
      title: "Seasonal Festivals",
      description: "Christmas, New Year, and other seasonal celebrations",
      image: "https://images.unsplash.com/photo-1513151233558-d860c5398176?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
    },
    {
      id: "others",
      title: "Others",
      description: "Discover more unique and special music events",
      image: "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
    }
  ];

  // Fetch events from the database
  useEffect(() => {
    async function fetchData() {      try {
        setIsLoading(true);
        
        // Fetch events
        const eventsResponse = await fetch('/api/events');
        if (!eventsResponse.ok) {
          throw new Error('Failed to load events');
        }
        const eventsData = await eventsResponse.json();
        
        // Process events to include image URLs
        const processedEvents = eventsData.events.map((event: any) => {
          // Check if the event has images collection
          const hasGalleryImages = event.images && event.images.length > 0;
          
          return {
            ...event,
            // For the main image URL, prioritize the first gallery image if available
            imageUrl: hasGalleryImages 
              ? `/api/events/${event.id}/images/${event.images[0].id}?t=${Date.now()}`
              : event.imageName 
                ? `/api/events/${event.id}/image?t=${Date.now()}` 
                : null,
            image: event.image || "https://placehold.co/600x400?text=No+Image",
            // Assign default categories based on title/description if not present
            category: event.category || assignDefaultCategory(event)
          };
        });
        setEvents(processedEvents || []);
        
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchData();
  }, []);

  // Add effect to scroll to top when a category is selected
  useEffect(() => {
    if (selectedCategory && topRef.current) {
      // Scroll to the top of the page
      topRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [selectedCategory]);

  // Helper function to assign a default category based on event details
  const assignDefaultCategory = (event: any): string => {
    const title = event.title?.toLowerCase() || '';
    const description = event.description?.toLowerCase() || '';
    
    if (title.includes('hotel') || title.includes('lounge') || title.includes('bar') || 
        description.includes('hotel') || description.includes('lounge'))
      return 'hotel-lounges';
    
    if (title.includes('theme') || title.includes('night') || 
        description.includes('theme night') || description.includes('weekly'))
      return 'theme-nights';
    
    if (title.includes('corporate') || title.includes('private') || 
        description.includes('corporate') || description.includes('private'))
      return 'private-corporate';
    
    if (title.includes('wedding') || title.includes('reception') || 
        description.includes('wedding') || description.includes('reception'))
      return 'weddings';
    
    if (title.includes('christmas') || title.includes('new year') || title.includes('festival') || 
        description.includes('christmas') || description.includes('new year') || description.includes('seasonal'))
      return 'seasonal';
    
    // Default category if no match
    return 'others';
  };

  const filteredEvents = selectedCategory 
    ? events.filter(event => event.category === selectedCategory)
    : [];

  return (
    <div className="min-h-screen bg-[#C3E0DB] py-12" ref={topRef}>
      {isLoading ? (
        <Loading />
      ) : (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8 sm:mb-12"
          >
            <h1 className="text-3xl font-bold tracking-tight text-primary sm:text-4xl md:text-5xl mb-2 sm:mb-4">
              Our Event Categories
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto px-4 sm:px-0">
              Join us at our next performance
            </p>
          </motion.div>

          {!selectedCategory ? (
            // Show category boxes when no category is selected
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {eventCategories.map((category, index) => (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="h-full" // Make sure the motion div takes full height
                >
                  <Card 
                    className="cursor-pointer hover:shadow-lg transition-all hover:scale-[1.02] h-full flex flex-col"
                    onClick={() => setSelectedCategory(category.id)}
                  >
                    <div className="h-36 sm:h-48 w-full bg-cover bg-center relative rounded-t-lg" style={{ backgroundImage: `url(${category.image})` }}>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent rounded-t-lg"></div>
                      <div className="absolute bottom-4 left-4 right-4">
                        <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-white">{category.title}</h3>
                      </div>
                    </div>
                    <CardContent className="p-3 sm:p-4 flex-grow flex flex-col justify-between">
                      <p className="text-sm sm:text-base text-muted-foreground">{category.description}</p>
                      <Button variant="ghost" className="mt-3 sm:mt-4 w-full text-sm sm:text-base">
                        View Events
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          ) : (
            // Show category details and filtered events
            <div>
              <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center">
                <Button 
                  variant="ghost" 
                  className="mb-4 sm:mb-0 sm:mr-4 self-start"
                  onClick={() => setSelectedCategory(null)}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Categories
                </Button>
                <h2 className="text-xl sm:text-2xl font-bold">
                  {eventCategories.find(c => c.id === selectedCategory)?.title}
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {error ? (
                  <div className="col-span-full text-center py-8 sm:py-12">
                    <p className="text-red-500">{error}</p>
                  </div>
                ) : filteredEvents.length === 0 ? (
                  <div className="col-span-full text-center py-8 sm:py-12">
                    <p className="text-muted-foreground">No events found in this category.</p>
                  </div>
                ) : (
                  filteredEvents.map((event) => (
                    <Dialog key={event.id}>
                      <DialogTrigger asChild>
                        <Card className="cursor-pointer hover:shadow-lg transition-shadow h-full flex flex-col">
                          <div className="h-36 sm:h-48 w-full bg-cover bg-center relative rounded-t-lg" 
                            style={{ 
                              backgroundImage: event.imageUrl 
                                ? `url(${event.imageUrl})` 
                                : `url(${event.image})`
                            }}
                          >
                            {event.imageUrl && (
                              <div className="absolute bottom-2 right-2 bg-black bg-opacity-50 rounded-full p-1">
                                <ImageIcon className="h-4 w-4 text-white" />
                              </div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent rounded-t-lg"></div>
                            <div className="absolute bottom-4 left-4 right-4">
                              <h3 className="text-base sm:text-lg md:text-xl font-bold text-white">{event.title}</h3>
                            </div>
                          </div>
                          <CardContent className="p-3 sm:p-4 flex-grow">
                            <div className="space-y-1 sm:space-y-2 text-muted-foreground text-sm sm:text-base">
                              <div className="flex items-center gap-2">
                                <CalendarIcon className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                                <span className="truncate">
                                  {format(new Date(event.date), "MMM d, yyyy")}
                                  {event.time && ` at ${event.time}`}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <MapPin className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                                <span className="truncate">{event.venue}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                                <span>${event.price.toString()}</span>
                              </div>
                            </div>
                            <div className="mt-3 sm:mt-4">
                              <Button variant="ghost" className="w-full text-sm sm:text-base" asChild>
                                <Link href={`/events/${event.id}`}>View Details</Link>
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      </DialogTrigger>
                      <DialogContent className="w-[95vw] max-w-none sm:max-w-2xl mx-auto p-4 sm:p-6">
                        <DialogHeader>
                          <DialogTitle className="text-xl sm:text-2xl">{event.title}</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 sm:gap-6">
                          <div
                            className="h-48 sm:h-64 w-full bg-cover bg-center rounded-lg"
                            style={{ 
                              backgroundImage: event.imageUrl 
                                ? `url(${event.imageUrl})` 
                                : `url(${event.image})`
                            }}
                          />
                          <div className="space-y-3 sm:space-y-4">
                            <p className="text-sm sm:text-base text-muted-foreground">{event.description}</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                              <div className="space-y-2">
                                <div className="flex items-center gap-2 text-muted-foreground text-sm sm:text-base">
                                  <CalendarIcon className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                                  <span>{format(new Date(event.date), "MMM d, yyyy")}</span>
                                </div>
                                <div className="flex items-center gap-2 text-muted-foreground text-sm sm:text-base">
                                  <Clock className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                                  <span>{event.time}</span>
                                </div>
                              </div>
                              <div className="space-y-2">
                                <div className="flex items-center gap-2 text-muted-foreground text-sm sm:text-base">
                                  <MapPin className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                                  <span>{event.venue}</span>
                                </div>
                                <div className="flex items-center gap-2 text-muted-foreground text-sm sm:text-base">
                                  <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                                  <span>${event.price.toString()}</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-0 pt-2">
                           
                            </div>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}