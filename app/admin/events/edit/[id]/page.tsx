"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar as CalendarIcon, ArrowLeft, Upload, X, Loader2 } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import Link from "next/link";
import { useState, FormEvent, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { use } from "react";

// Use the correct typing for Next.js 15 in deployed environments
interface EditEventPageProps {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default function EditEventPage({ params }: EditEventPageProps) {
  // Unwrap params using the use hook
  const unwrappedParams = use(params);
  const eventId = unwrappedParams.id;
  
  const router = useRouter();  const { toast } = useToast();
  const [date, setDate] = useState<Date | undefined>();
  const [formData, setFormData] = useState({
    title: "",
    venue: "",
    description: "",
  });
  const [category, setCategory] = useState<string>(""); // Track category separately  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null);
  const [galleryImages, setGalleryImages] = useState<Array<{ id: number, url: string }>>([]);
  const [imagesToDelete, setImagesToDelete] = useState<number[]>([]);
  const [newGalleryImages, setNewGalleryImages] = useState<File[]>([]);
  const [newGalleryPreviews, setNewGalleryPreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  // Event category definitions - kept in sync with frontend display
  const eventCategories = [
    { id: "hotel-lounges", title: "Hotel Lounges & Bars" },
    { id: "theme-nights", title: "Weekly Theme Nights" },
    { id: "private-corporate", title: "Private & Corporate Functions" },
    { id: "weddings", title: "Wedding Receptions" },
    { id: "seasonal", title: "Seasonal Festivals" },
    { id: "others", title: "Others" },
  ];

  // Fetch the event data when the page loads
  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setIsFetching(true);
        const response = await fetch(`/api/events/${eventId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch event');
        }
        
        const eventData = await response.json().then(data => data.event);
          // Format the date and time
        const eventDate = new Date(eventData.date);
        setDate(eventDate);
        
        // Set the form data
        setFormData({
          title: eventData.title,
          venue: eventData.venue,
          description: eventData.description || "",
        });
        
        // Set category if available
        setCategory(eventData.category || "others");
          // Check if there's an existing image
        if (eventData.imageName) {
          // Add timestamp to prevent image caching issues
          const timestamp = Date.now();
          // Set the current image URL to display the existing image
          setCurrentImageUrl(`/api/events/${eventId}/image?t=${timestamp}`);
          setImagePreview(`/api/events/${eventId}/image?t=${timestamp}`);
        }
        
        // Check if there are gallery images
        if (eventData.images && eventData.images.length > 0) {
          // Map the gallery images to include URLs
          const galleryImagesWithUrls = eventData.images.map((img: any) => ({
            id: img.id,
            url: `/api/events/${eventId}/images/${img.id}?t=${Date.now()}`
          }));
          setGalleryImages(galleryImagesWithUrls);
        }
      } catch (error) {
        console.error('Error fetching event:', error);
        toast({
          title: "Error",
          description: "Failed to load event details",
          variant: "destructive",
        });
      } finally {
        setIsFetching(false);
      }
    };
    
    fetchEvent();
  }, [eventId, toast]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      
      // Clear the current image URL as we're replacing it
      setCurrentImageUrl(null);
    }
  };

  const handleGalleryFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files);
      setNewGalleryImages((prev) => [...prev, ...filesArray]);
      
      // Create preview URLs for each file
      const newPreviews: string[] = [];
      filesArray.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          newPreviews.push(reader.result as string);
          if (newPreviews.length === filesArray.length) {
            setNewGalleryPreviews((prev) => [...prev, ...newPreviews]);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleRemoveGalleryImage = (index: number) => {
    // For new images being uploaded
    setNewGalleryImages((prev) => prev.filter((_, i) => i !== index));
    setNewGalleryPreviews((prev) => prev.filter((_, i) => i !== index));
  };
  
  const handleRemoveExistingImage = (imageId: number) => {
    // Mark image for deletion
    setImagesToDelete((prev) => [...prev, imageId]);
    // Remove from displayed gallery
    setGalleryImages((prev) => prev.filter(img => img.id !== imageId));
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setCurrentImageUrl(null); 
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!date) {
      toast({
        title: "Error",
        description: "Please select a date for the event",
        variant: "destructive",
      });
      return;
    }
    
    if (!category) {
      toast({
        title: "Error",
        description: "Please select a category for the event",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Create FormData for file upload
      const submitData = new FormData();
      
      // Add all text fields to FormData
      Object.keys(formData).forEach(key => {
        submitData.append(key, formData[key as keyof typeof formData]);
      });
      
      // Add date in the required format
      submitData.append("date", date.toISOString().split('T')[0]);
      
      // Add category
      submitData.append("category", category);
        // Add image file if selected (a new image)
      if (imageFile) {
        submitData.append("image", imageFile);
      }
      
      // Add gallery images if selected
      if (newGalleryImages.length > 0) {
        newGalleryImages.forEach(file => {
          submitData.append("images", file);
        });
      }
      
      // Add IDs of images to delete
      if (imagesToDelete.length > 0) {
        submitData.append("imagesToDelete", JSON.stringify(imagesToDelete));
      }
      
      // Flag to indicate if image was removed
      submitData.append("imageRemoved", (!imageFile && !currentImageUrl).toString());
      
      const response = await fetch(`/api/events/${eventId}`, {
        method: 'PUT',
        body: submitData, // Send as FormData, not JSON
      });
      
      if (!response.ok) {
        throw new Error('Failed to update event');
      }
      
      toast({
        title: "Success",
        description: "Event updated successfully",
      });
      
      router.push('/admin/events');
    } catch (error) {
      console.error('Error updating event:', error);
      toast({
        title: "Error",
        description: "Failed to update event",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading event details...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">      <div className="flex items-center space-x-4">
        <Link href="/admin/events">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>          <h1 className="text-3xl font-bold">Edit Event</h1>
          <p className="text-muted-foreground mt-1">Update your event portfolio entry (past dates are allowed)</p>
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
          <form className="space-y-8" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="title">Event Title</Label>
              <Input 
                id="title"
                name="title"
                placeholder="Enter event title"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </div>            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date && date instanceof Date && !isNaN(date.getTime()) 
                        ? format(date, "PPP") 
                        : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      initialFocus
                      fromYear={2000}
                      toYear={2030}
                      captionLayout="dropdown-buttons"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <select
                  id="category"
                  name="category"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  required
                >
                  <option value="" disabled>Select a category</option>
                  {eventCategories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>            <div className="space-y-2">
              <Label htmlFor="venue">Venue</Label>
              <Input 
                id="venue"
                name="venue"
                placeholder="Enter venue name"
                value={formData.venue}
                onChange={handleChange}
                required
              />
            </div>            <div className="space-y-2">
              <Label htmlFor="image">Main Event Image</Label>
              {imagePreview ? (
                <div className="relative w-full h-48 bg-slate-100 rounded-md overflow-hidden">
                  <img 
                    src={imagePreview} 
                    alt="Event preview" 
                    className="w-full h-full object-cover" 
                  />
                  <Button 
                    variant="destructive" 
                    size="icon" 
                    className="absolute top-2 right-2 h-6 w-6 rounded-full"
                    onClick={handleRemoveImage}
                    type="button"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div 
                  className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-md cursor-pointer hover:bg-gray-50"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-8 w-8 text-gray-400" />
                  <p className="mt-2 text-sm text-gray-500">Click to upload a main image</p>
                </div>
              )}
              <Input
                id="image"
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>

            {/* Gallery Images Section */}
            <div className="space-y-2">
              <Label htmlFor="gallery-images">Gallery Images</Label>
              
              {/* Existing Gallery Images */}
              {galleryImages.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm text-muted-foreground mb-2">Existing Gallery Images:</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {galleryImages.map((img) => (
                      <div key={img.id} className="relative h-32 w-full bg-slate-100 rounded-md overflow-hidden">
                        <img 
                          src={img.url} 
                          alt="Gallery image" 
                          className="w-full h-full object-cover" 
                        />
                        <Button 
                          variant="destructive" 
                          size="icon" 
                          className="absolute top-2 right-2 h-6 w-6 rounded-full"
                          onClick={() => handleRemoveExistingImage(img.id)}
                          type="button"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* New Gallery Image Previews */}
              {newGalleryPreviews.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm text-muted-foreground mb-2">New Images to Upload:</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {newGalleryPreviews.map((preview, index) => (
                      <div key={index} className="relative h-32 w-full bg-slate-100 rounded-md overflow-hidden">
                        <img 
                          src={preview} 
                          alt={`New gallery image ${index}`} 
                          className="w-full h-full object-cover" 
                        />
                        <Button 
                          variant="destructive" 
                          size="icon" 
                          className="absolute top-2 right-2 h-6 w-6 rounded-full"
                          onClick={() => handleRemoveGalleryImage(index)}
                          type="button"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Upload New Gallery Images */}
              <div 
                className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-gray-300 rounded-md cursor-pointer hover:bg-gray-50"
                onClick={() => galleryInputRef.current?.click()}
              >
                <Upload className="h-6 w-6 text-gray-400" />
                <p className="mt-1 text-sm text-gray-500">Click to upload gallery images</p>
              </div>
              <Input
                id="gallery-images"
                ref={galleryInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleGalleryFileChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Enter event description"
                className="min-h-[100px]"
                value={formData.description}
                onChange={handleChange}
              />
            </div>

            <div className="flex justify-end space-x-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => router.push('/admin/events')}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Updating..." : "Update Event"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
