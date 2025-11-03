"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

// Define the Event type
interface Event {
  id: number;
  title: string;
  date: string;
  venue: string;
  image?: string;
  imageUrl?: string;
  images?: Array<{ id: number; imageName?: string }>;
}

// Update the component to accept events as props
export function EventScroller({ events = [] }: { events?: Event[] }) {
  // If no events are provided, use sample events as fallback
  const displayEvents = events.length > 0 ? events : [
    {
      id: 1,
      title: "Summer Stadium Tour",
      date: "2024-07-15",
      venue: "Madison Square Garden",
      image: "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
    },
    {
      id: 2,
      title: "Acoustic Night",
      date: "2024-08-02",
      venue: "Blue Note Jazz Club",
      image: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
    },
    {
      id: 3,
      title: "Summer Festival",
      date: "2024-08-15",
      venue: "Central Park",
      image: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
    },
  ];

  // Use state to force re-render with timestamp for images
  const [imageTimestamp, setImageTimestamp] = useState(Date.now());

  // Add a timestamp to ensure fresh images are loaded
  useEffect(() => {
    setImageTimestamp(Date.now());
  }, [events]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">      {displayEvents.map((event) => {
        // Determine the best image URL to use:
        // 1. First, try to use the first image from the images collection
        // 2. If not available, try the main event imageUrl 
        // 3. Fall back to the generic image or placeholder
        const hasGalleryImages = event.images && Array.isArray(event.images) && event.images.length > 0;
        
        let imageUrl;
        if (hasGalleryImages && event.images && event.images[0] && event.images[0].id) {
          // Use the first gallery image
          imageUrl = `/api/events/${event.id}/images/${event.images[0].id}?t=${imageTimestamp}`;
        } else if (event.imageUrl) {
          // Use the main event image
          imageUrl = `${event.imageUrl}${event.imageUrl.includes('?') ? '&' : '?'}t=${imageTimestamp}`;
        } else {
          // Fall back to generic image or placeholder
          imageUrl = event.image || "https://placehold.co/600x400?text=No+Image";
        }
          
        return (
          <Card key={event.id} className="overflow-hidden">
            <div
              className="h-48 w-full bg-cover bg-center"
              style={{ backgroundImage: `url(${imageUrl})` }}
            />
            <CardHeader>
              <CardTitle>{event.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>{new Date(event.date).toLocaleDateString()}</span>
                </div>                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>{event.venue}</span>
                </div>
                <Button asChild className="w-full">
                  <Link href={`/events/${event.id}`}>View</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}