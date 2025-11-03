// @ts-nocheck - Ignoring type errors during build
"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon, MapPin, DollarSign, Clock, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { YouTubeDialog } from "@/components/youtube-dialog";
import Loading from "@/app/loading";

interface EventImage {
  id: number;
  imageName?: string;
  imageUrl?: string;
}

export default function EventDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [mainImage, setMainImage] = useState<string | null>(null);
  const [showYoutube, setShowYoutube] = useState(false);

  useEffect(() => {
    async function fetchEvent() {
      try {
        setLoading(true);
        const res = await fetch(`/api/events/${id}`);
        if (!res.ok) throw new Error('Failed to fetch event');
        const data = await res.json();
        setEvent(data.event);
        // Set main image: first gallery image, else main imageName, else null
        if (data.event.images && Array.isArray(data.event.images) && data.event.images.length > 0) {
          setMainImage(`/api/events/${data.event.id}/images/${data.event.images[0].id}?t=${Date.now()}`);
        } else if (data.event.imageName) {
          setMainImage(`/api/events/${data.event.id}/image?t=${Date.now()}`);
        } else {
          setMainImage(null);
        }
      } catch (err: any) {
        setError('Failed to load event.');
      } finally {
        setLoading(false);
      }
    }
    if (id) fetchEvent();
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this event? This cannot be undone.")) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      const res = await fetch(`/api/events/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete event");
      router.push("/events");
    } catch (err: any) {
      setDeleteError("Failed to delete event. Please try again.");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return <Loading />;
  if (error) return <div className="py-12 text-center text-red-500">{error}</div>;
  if (!event) return <div className="py-12 text-center">Event not found.</div>;

  // Prepare gallery images (if any)
  const galleryImages = event.images && Array.isArray(event.images) && event.images.length > 0
    ? event.images
    : [];

  // Helper to get image URL for a gallery image
  const getGalleryImageUrl = (img: any) => `/api/events/${event.id}/images/${img.id}?t=${Date.now()}`;

  return (
    <div className="max-w-3xl mx-auto py-12 px-4">
      <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center">
        <Button
          variant="ghost"
          className="mb-4 sm:mb-0 sm:mr-4 self-start bg-white/80 border border-gray-300 hover:bg-white"
          asChild
        >
          <Link href="/events">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Events
          </Link>
        </Button>
        <h2 className="text-xl sm:text-2xl font-bold flex-1">{event.title}</h2>
      </div>
      {deleteError && <div className="text-red-500 mb-4">{deleteError}</div>}
      <Card className="overflow-hidden">
        {/* Main event image (large) */}
        <div
          className="h-64 sm:h-96 w-full bg-cover bg-center relative"
          style={{
            backgroundImage: mainImage
              ? `url(${mainImage})`
              : `url(https://placehold.co/600x400?text=No+Image)`
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
          {/* Play Video Button */}
          {event.youtubeId && (
            <Button
              className="absolute bottom-4 right-4 z-10"
              variant="secondary"
              onClick={() => setShowYoutube(true)}
            >
              Play Video
            </Button>
          )}
        </div>
        {/* Youtube Dialog */}
        {event.youtubeId && (
          <YouTubeDialog
            videoId={event.youtubeId}
            isOpen={showYoutube}
            onClose={() => setShowYoutube(false)}
          />
        )}
        {/* Gallery images as thumbnails if any */}
        {galleryImages.length > 0 && (
          <div className="flex flex-wrap gap-2 p-4 border-b">
            {galleryImages.map((img: any) => {
              const url = getGalleryImageUrl(img);
              return (
                <img
                  key={img.id}
                  src={url}
                  alt={img.imageName || "Event image"}
                  className={`w-24 h-16 object-cover rounded cursor-pointer border-2 ${mainImage === url ? 'border-primary' : 'border-transparent'}`}
                  onClick={() => setMainImage(url)}
                />
              );
            })}
          </div>
        )}
        <CardContent className="p-6">
          <div className="space-y-3 sm:space-y-4">
            <p className="text-sm sm:text-base text-muted-foreground mb-2">{event.description}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground text-sm sm:text-base">
                  <CalendarIcon className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                  <span>{event.date ? format(new Date(event.date), "MMM d, yyyy") : ""}</span>
                </div>
                {event.time && (
                  <div className="flex items-center gap-2 text-muted-foreground text-sm sm:text-base">
                    <Clock className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                    <span>{event.time}</span>
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground text-sm sm:text-base">
                  <MapPin className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                  <span>{event.venue}</span>
                </div>
                
              </div>
            </div>
            <div className="pt-2 text-muted-foreground text-sm">
              Category: {event.category || 'Others'}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}