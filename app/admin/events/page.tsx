"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar, MapPin, DollarSign, Search, Plus, Edit, Trash, ArrowLeft, Loader2, Image as ImageIcon } from "lucide-react";
import Link from "next/link";
import { toast } from "@/components/ui/use-toast";
import { format } from "date-fns";

export default function AdminEventsPage() {
  const [searchQuery, setSearchQuery] = useState("");  interface Event {
    id: string;
    title: string;
    date: string;
    venue: string;
    price: number;
    availableSeats: number;
    imageName?: string;
    imageData?: string;
    imageUrl?: string | null;
    hasImage?: boolean;
    category?: string;
    images?: Array<{ id: number; imageName?: string }>;
  }

  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteInProgress, setDeleteInProgress] = useState<string | null>(null);

  // Fetch events from database
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/events");
        
        if (!response.ok) {
          throw new Error("Failed to fetch events");
        }
        
        const data = await response.json();
          // Process events to add image URLs for those with database images
        const eventsWithImages = data.events.map((event: Event) => {
          // Check if the event has gallery images
          const hasGalleryImages = event.images && Array.isArray(event.images) && event.images.length > 0;
          
          let imageUrl = null;
          // First try to use a gallery image if available
          if (hasGalleryImages && event.images && event.images[0] && event.images[0].id) {
            imageUrl = `/api/events/${event.id}/images/${event.images[0].id}?t=${Date.now()}`;
          } 
          // Fall back to the main event image if available
          else if (event.imageName) {
            imageUrl = `/api/events/${event.id}/image?t=${Date.now()}`;
          }
          
          return {
            ...event,
            // If the event has any kind of image data
            hasImage: !!event.imageName || !!event.imageData || hasGalleryImages,
            imageUrl
          };
        });
        
        setEvents(eventsWithImages || []);
      } catch (error) {
        console.error("Error fetching events:", error);
        toast({
          title: "Error",
          description: "Failed to load events",
          variant: "destructive",
        });
        setEvents([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, [toast]);

  // Handle event deletion
  const handleDelete = async (eventId: string) => {
    if (!confirm("Are you sure you want to delete this event? This cannot be undone.")) {
      return;
    }
    
    setDeleteInProgress(eventId);
    try {
      const response = await fetch(`/api/events/${eventId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete event");
      }

      // Remove the deleted event from the state
      setEvents((prev) => prev.filter((event) => event.id !== eventId));
      
      toast({
        title: "Success",
        description: "Event deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting event:", error);
      toast({
        title: "Error",
        description: "Failed to delete event",
        variant: "destructive",
      });
    } finally {
      setDeleteInProgress(null);
    }
  };

  // Format date and time
  const formatEventDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "PPP");
    } catch {
      return "Unknown date";
    }
  };

  // Extract time from date
  const extractTimeFromDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "p");
    } catch {
      return "";
    }
  };

  // Format category name
  const formatCategory = (categoryId: string) => {
    const categories = {
      "hotel-lounges": "Hotel Lounges & Bars",
      "theme-nights": "Weekly Theme Nights",
      "private-corporate": "Private & Corporate Functions",
      "weddings": "Wedding Receptions",
      "seasonal": "Seasonal Festivals",
      "others": "Other Events"
    };
    return categories[categoryId as keyof typeof categories] || "Other Events";
  };

  const filteredEvents = events.filter(event =>
    event.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">        <Link href="/admin">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Event Portfolio</h1>
          <p className="text-muted-foreground mt-1">Past events and performances</p>
        </div>
      </div>

      <div className="flex justify-end">        <Link href="/admin/events/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Document Event
          </Button>
        </Link>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search events..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Loading events...</span>
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No events found.</p>
          {searchQuery && (
            <p className="text-sm text-muted-foreground mt-2">
              Try adjusting your search query.
            </p>
          )}
        </div>
      ) : (
        <div className="grid gap-6">
          {filteredEvents.map((event, index) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card>
                <CardContent className="p-6">
                  <div className="grid md:grid-cols-[200px,1fr] gap-6">                    <div
                      className="h-40 bg-cover bg-center rounded-lg relative"
                      style={{ 
                        backgroundImage: event.imageUrl 
                          ? `url(${event.imageUrl})` 
                          : "url(https://placehold.co/600x400?text=No+Image)" 
                      }}
                    >
                      {event.hasImage && !event.imageUrl?.startsWith('http') && (
                        <div className="absolute bottom-2 right-2 bg-black bg-opacity-50 rounded-full p-1">
                          <ImageIcon className="h-4 w-4 text-white" />
                        </div>
                      )}
                    </div>
                    <div className="space-y-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-xl font-semibold">{event.title}</h3>                          <div className="grid grid-cols-2 gap-4 mt-2">                            <div className="flex items-center text-muted-foreground">
                              <Calendar className="mr-2 h-4 w-4" />
                              {formatEventDate(event.date)}
                            </div>
                            <div className="flex items-center text-muted-foreground">
                              <MapPin className="mr-2 h-4 w-4" />
                              {event.venue}
                            </div>
                            {event.category && (
                              <div className="flex items-center text-muted-foreground">
                                <span className="inline-block h-3 w-3 rounded-full bg-primary mr-2"></span>
                                {formatCategory(event.category)}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Link href={`/admin/events/edit/${event.id}`}>
                            <Button variant="outline" size="icon">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button 
                            variant="outline" 
                            size="icon" 
                            className="text-destructive"
                            onClick={() => handleDelete(event.id)}
                            disabled={deleteInProgress === event.id}
                          >
                            {deleteInProgress === event.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>                      <div className="flex justify-between items-center pt-4 border-t">
                        <span className="text-sm text-muted-foreground">
                          {formatCategory(event.category || 'others')}
                        </span>
                        <Link href={`/events/${event.id}`}>
                          <Button variant="outline">View Details</Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}