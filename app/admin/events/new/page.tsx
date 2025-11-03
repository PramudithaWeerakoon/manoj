"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar as CalendarIcon, ArrowLeft, Upload, X } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import Link from "next/link";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "@/components/ui/use-toast";

export default function NewEventPage() {
  console.log("Event form version: May 14, 2025 - No time/price/seats fields");
  const router = useRouter();
  const [date, setDate] = useState<Date | undefined>();
  const [formData, setFormData] = useState({
    title: "",
    venue: "",
    description: "",
  });
  const [category, setCategory] = useState<string>(""); // Track category separately
  const [isLoading, setIsLoading] = useState(false);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [youtubeId, setYoutubeId] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Event category definitions - kept in sync with frontend display
  const eventCategories = [
    { id: "hotel-lounges", title: "Hotel Lounges & Bars" },
    { id: "theme-nights", title: "Weekly Theme Nights" },
    { id: "private-corporate", title: "Private & Corporate Functions" },
    { id: "weddings", title: "Wedding Receptions" },
    { id: "seasonal", title: "Seasonal Festivals" },
    { id: "others", title: "Others" },
  ];

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setImageFiles(files);

      // Create previews for all images
      const readers = files.map((file) => {
        return new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });
      });
      Promise.all(readers).then(setImagePreviews);
    }
  };

  const handleRemoveImage = (index: number) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
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
      (Object.keys(formData) as Array<keyof typeof formData>).forEach((key) => {
        submitData.append(key, formData[key]);
      });
      // Add date in the required format
      submitData.append("date", date.toISOString().split("T")[0]);

      // Add category
      submitData.append("category", category);

      // Add YouTube ID
      submitData.append("youtubeId", youtubeId);

      // Add all image files
      imageFiles.forEach((file, idx) => {
        submitData.append("images", file, file.name);
      });

      const response = await fetch("/api/events", {
        method: "POST",
        body: submitData, // Send as FormData, not JSON
      });

      if (!response.ok) {
        throw new Error("Failed to create event");
      }
      toast({
        title: "Success",
        description: "Event documented successfully",
      });

      router.push("/admin/events");
    } catch (error) {
      console.error("Error creating event:", error);
      toast({
        title: "Error",
        description: "Failed to create event",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Link href="/admin/events">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />{" "}
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Document Event</h1>
          <p className="text-muted-foreground mt-1">
            Add a past event to your portfolio (you can select past dates)
          </p>
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
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Event Category</Label>
              <Select value={category} onValueChange={setCategory} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {eventCategories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>{" "}
            <div className="space-y-2">
              <Label>Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
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
            </div>{" "}
            <div className="space-y-2">
              <Label htmlFor="venue">Venue</Label>
              <Input
                id="venue"
                name="venue"
                placeholder="Enter venue name"
                value={formData.venue}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="images">Event Images</Label>
              <div className="flex flex-wrap gap-2">
                {imagePreviews.map((src, idx) => (
                  <div
                    key={idx}
                    className="relative w-32 h-20 bg-slate-100 rounded-md overflow-hidden"
                  >
                    <img
                      src={src}
                      alt={`Event preview ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-1 right-1 h-5 w-5 rounded-full"
                      onClick={() => handleRemoveImage(idx)}
                      type="button"
                    >
                      <span className="sr-only">Remove</span>
                      X
                    </Button>
                  </div>
                ))}
              </div>
              <Input
                id="images"
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleFileChange}
              />
              <Button type="button" onClick={() => fileInputRef.current?.click()}>
                Select Images
              </Button>
            </div>
            <div className="space-y-2">
              <Label htmlFor="youtubeId">YouTube Video ID</Label>
              <Input
                id="youtubeId"
                name="youtubeId"
                placeholder="e.g. mruBJuLSRvQ"
                value={youtubeId}
                onChange={(e) => setYoutubeId(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Event Details</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Describe the event: what happened, who attended, highlight moments, etc."
                className="min-h-[150px]"
                value={formData.description}
                onChange={handleChange}
              />
            </div>
            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/admin/events")}
              >
                Cancel
              </Button>{" "}
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Saving..." : "Save Event"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
