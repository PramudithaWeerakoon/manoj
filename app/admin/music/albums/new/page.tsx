"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Upload } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "@/components/ui/use-toast";

// Define interfaces for our data types
interface AlbumData {
  title: string;
  releaseDate: string;
  description: string;
  youtubeId: string;
}

interface TrackData {
  title: string;
  duration: string;
}

interface CreditData {
  role: string;
  name: string;
}

export default function NewAlbumPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  
  // Album state
  const [album, setAlbum] = useState<AlbumData>({
    title: "",
    releaseDate: "",
    description: "",
    youtubeId: ""
  });
  
  // Cover image state
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [coverImagePreview, setCoverImagePreview] = useState<string>("");
  
  // Tracks state
  const [tracks, setTracks] = useState<TrackData[]>([
    { title: "", duration: "" },
    { title: "", duration: "" },
    { title: "", duration: "" }
  ]);
  
  // Credits state
  const [credits, setCredits] = useState<CreditData[]>([
    { role: "", name: "" },
    { role: "", name: "" }
  ]);
  
  // Handle album input changes
  const handleAlbumChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setAlbum(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle cover image selection
  const handleCoverImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Handle track input changes
  const handleTrackChange = (index: number, field: keyof TrackData, value: string) => {
    setTracks(prev => 
      prev.map((track, i) => 
        i === index ? { ...track, [field]: value } : track
      )
    );
  };
  
  // Handle credit input changes
  const handleCreditChange = (index: number, field: keyof CreditData, value: string) => {
    setCredits(prev => 
      prev.map((credit, i) => 
        i === index ? { ...credit, [field]: value } : credit
      )
    );
  };
  
  // Add new track
  const addTrack = () => {
    setTracks(prev => [...prev, { title: "", duration: "" }]);
  };
  
  // Remove track
  const removeTrack = (index: number) => {
    setTracks(prev => prev.filter((_, i) => i !== index));
  };
  
  // Add new credit
  const addCredit = () => {
    setCredits(prev => [...prev, { role: "", name: "" }]);
  };
  
  // Remove credit
  const removeCredit = (index: number) => {
    setCredits(prev => prev.filter((_, i) => i !== index));
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Filter out empty tracks and credits
      const validTracks = tracks.filter(track => track.title.trim() !== "");
      const validCredits = credits.filter(credit => credit.role.trim() !== "" || credit.name.trim() !== "");
      
      // Create form data for multipart/form-data submission
      const formData = new FormData();
      
      // Add album data
      formData.append('title', album.title);
      formData.append('releaseDate', album.releaseDate);
      formData.append('description', album.description || '');
      formData.append('youtubeId', album.youtubeId || '');
      
      // Add cover image if selected
      if (coverImage) {
        formData.append('coverImage', coverImage);
      }
      
      // Add tracks and credits as JSON strings
      formData.append('tracks', JSON.stringify(validTracks));
      formData.append('credits', JSON.stringify(validCredits));
      
      const response = await fetch("/api/admin/albums", {
        method: "POST",
        body: formData,
        // Note: Don't set Content-Type header when using FormData
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create album");
      }
      
      toast({
        title: "Success",
        description: "Album created successfully",
      });
      
      router.push("/admin/music/albums");
    } catch (error: unknown) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create album",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Link href="/admin/music/albums">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Add New Album</h1>
      </div>

      <Card>
        <CardContent className="p-6">
          <form className="space-y-8" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="title">Album Title</Label>
              <Input 
                id="title" 
                name="title" 
                placeholder="Enter album title" 
                value={album.title}
                onChange={handleAlbumChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="releaseDate">Release Date</Label>
              <Input 
                id="releaseDate" 
                name="releaseDate" 
                type="date" 
                value={album.releaseDate}
                onChange={handleAlbumChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="coverImage">Cover Image</Label>
              <div className="flex items-center space-x-4">
                <Input
                  id="coverImage"
                  type="file"
                  accept="image/*"
                  onChange={handleCoverImageChange}
                  className="w-full"
                />
              </div>
              {coverImagePreview && (
                <div className="mt-4">
                  <p className="text-sm mb-2">Preview:</p>
                  <div className="relative w-32 h-32 bg-slate-100 rounded-md overflow-hidden">
                    <img 
                      src={coverImagePreview} 
                      alt="Cover preview" 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Enter album description"
                className="min-h-[100px]"
                value={album.description}
                onChange={handleAlbumChange}
              />
            </div>

            <div className="space-y-2">
              <Label>Tracks</Label>
              <div className="space-y-4">
                {tracks.map((track, index) => (
                  <div key={index} className="grid grid-cols-12 gap-4">
                    <div className="col-span-1">
                      <Input value={index + 1} disabled />
                    </div>
                    <div className="col-span-7">
                      <Input 
                        placeholder={`Track ${index + 1} title`}
                        value={track.title}
                        onChange={(e) => handleTrackChange(index, "title", e.target.value)}
                      />
                    </div>
                    <div className="col-span-2">
                      <Input 
                        placeholder="Duration" 
                        value={track.duration}
                        onChange={(e) => handleTrackChange(index, "duration", e.target.value)}
                      />
                    </div>
                    <div className="col-span-2">
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full"
                        onClick={() => removeTrack(index)}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                ))}
                <Button 
                  type="button" 
                  variant="outline" 
                  className="w-full"
                  onClick={addTrack}
                >
                  Add Track
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Credits</Label>
              <div className="space-y-4">
                {credits.map((credit, index) => (
                  <div key={index} className="grid grid-cols-12 gap-4">
                    <div className="col-span-5">
                      <Input 
                        placeholder="Role" 
                        value={credit.role}
                        onChange={(e) => handleCreditChange(index, "role", e.target.value)}
                      />
                    </div>
                    <div className="col-span-5">
                      <Input 
                        placeholder="Name" 
                        value={credit.name}
                        onChange={(e) => handleCreditChange(index, "name", e.target.value)}
                      />
                    </div>
                    <div className="col-span-2">
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full"
                        onClick={() => removeCredit(index)}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                ))}
                <Button 
                  type="button" 
                  variant="outline" 
                  className="w-full"
                  onClick={addCredit}
                >
                  Add Credit
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="youtubeId">YouTube Video ID</Label>
              <Input 
                id="youtubeId"
                name="youtubeId"
                placeholder="Enter YouTube video ID for album preview" 
                value={album.youtubeId}
                onChange={handleAlbumChange}
              />
            </div>

            <div className="flex justify-end space-x-4">
              <Link href="/admin/music/albums">
                <Button type="button" variant="outline">Cancel</Button>
              </Link>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Creating..." : "Create Album"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}