"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "@/components/ui/use-toast";
import Loading from "../../../../../loading";
import { use } from "react";

// Define interfaces for our data types
interface TrackData {
  title: string;
  album_id: string;
  duration: string;
  track_number: string;
  lyrics: string;
  youtube_id: string;
  artist: string;
}

interface Credit {
  id?: string;
  role: string;
  name: string;
}

interface Album {
  id: string;
  title: string;
}

interface PageParams {
  id: string;
}

export default function EditTrackPage({ params }: { params: Promise<PageParams> }) {
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [fetchingAlbums, setFetchingAlbums] = useState(true);
  const [albums, setAlbums] = useState<Album[]>([]);
  
  // Track state
  const [track, setTrack] = useState<TrackData>({
    title: "",
    album_id: "",
    duration: "",
    track_number: "",
    lyrics: "",
    youtube_id: "",
    artist: ""
  });
  
  // Credits state
  const [credits, setCredits] = useState<Credit[]>([]);
  
  // Get track ID from params - unwrap the Promise using the use hook
  const unwrappedParams = use(params) as PageParams;
  const trackId = unwrappedParams.id;

  // Fetch track data when component mounts
  useEffect(() => {
    const fetchTrackData = async () => {
      try {
        setIsFetching(true);
        const response = await fetch(`/api/tracks/${trackId}`);
        
        if (!response.ok) {
          throw new Error("Failed to fetch track data");
        }
        
        const data = await response.json();
        
        if (!data.success || !data.track) {
          throw new Error("Invalid track data received");
        }
        
        // Set track data
        setTrack({
          title: data.track.title || "",
          album_id: data.track.album_id ? data.track.album_id.toString() : "",
          duration: data.track.duration || "",
          track_number: data.track.track_number ? data.track.track_number.toString() : "",
          lyrics: data.track.lyrics || "",
          youtube_id: data.track.youtube_id || "",
          artist: data.track.artist || ""
        });
        
        // Set credits if any
        if (data.track.credits && data.track.credits.length > 0) {
          setCredits(data.track.credits.map((credit: Credit) => ({
            id: credit.id,
            role: credit.role,
            name: credit.name
          })));
        } else {
          // Default empty credits
          setCredits([{ role: "", name: "" }]);
        }
        
      } catch (error) {
        console.error("Error fetching track:", error);
        toast({
          title: "Error",
          description: "Failed to load track data",
          variant: "destructive"
        });
        router.push("/admin/music/tracks");
      } finally {
        setIsFetching(false);
      }
    };
    
    fetchTrackData();
    fetchAlbums();
  }, [trackId, toast, router]);
  
  // Fetch albums for dropdown selection
  const fetchAlbums = async () => {
    try {
      const response = await fetch("/api/albums");

      if (!response.ok) {
        throw new Error("Failed to fetch albums");
      }

      const data = await response.json();
      setAlbums(data.albums || []);
    } catch (error) {
      console.error("Error fetching albums:", error);
      toast({
        title: "Error",
        description: "Failed to load albums",
        variant: "destructive"
      });
    } finally {
      setFetchingAlbums(false);
    }
  };
  
  // Handle track input changes
  const handleTrackChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setTrack(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle album selection
  const handleAlbumChange = async (value: string) => {
    setTrack(prev => ({
      ...prev,
      album_id: value
    }));
  };
  
  // Handle credit input changes
  const handleCreditChange = (index: number, field: keyof Credit, value: string) => {
    setCredits(prev => 
      prev.map((credit, i) => 
        i === index ? { ...credit, [field]: value } : credit
      )
    );
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
      // Validate required fields
      if (!track.title || !track.album_id || !track.track_number) {
        throw new Error("Please fill in all required fields");
      }
      
      // Filter out empty credits
      const validCredits = credits.filter(credit => credit.role.trim() !== "" && credit.name.trim() !== "");
      
      // Clean YouTube ID from any extra spaces
      const cleanedYoutubeId = track.youtube_id ? track.youtube_id.trim() : "";
      
      const requestData = {
        ...track,
        album_id: parseInt(track.album_id),
        track_number: parseInt(track.track_number),
        youtube_id: cleanedYoutubeId,
        credits: validCredits,
      };
      
      const response = await fetch(`/api/tracks/${trackId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to update track");
      }

      toast({
        title: "Success",
        description: "Track updated successfully"
      });
      router.push("/admin/music/tracks");
    } catch (error: unknown) {
      console.error("Submission Error:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update track",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  if (isFetching) {
    return <Loading />;
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Link href="/admin/music/tracks">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Edit Track</h1>
      </div>

      <Card>
        <CardContent className="p-6">
          <form className="space-y-8" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="title">Track Title</Label>
              <Input 
                id="title" 
                name="title" 
                placeholder="Enter track title"
                value={track.title}
                onChange={handleTrackChange}
                required 
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="album_id">Album</Label>
              {fetchingAlbums ? (
                <div className="flex items-center space-x-2 h-10 p-2 border rounded-md">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm text-muted-foreground">Loading albums...</span>
                </div>
              ) : (
                <Select 
                  name="album_id" 
                  value={track.album_id}
                  onValueChange={handleAlbumChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select album" />
                  </SelectTrigger>
                  <SelectContent>
                    {albums.map(album => (
                      <SelectItem key={album.id} value={album.id.toString()}>
                        {album.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="duration">Duration</Label>
                <Input 
                  id="duration"
                  name="duration"
                  placeholder="e.g., 3:45"
                  value={track.duration}
                  onChange={handleTrackChange} 
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="track_number">Track Number</Label>
                <Input 
                  id="track_number"
                  name="track_number"
                  type="number" 
                  placeholder="Track position in album"
                  value={track.track_number}
                  onChange={handleTrackChange}
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="artist">Artist</Label>
              <Input 
                id="artist"
                name="artist"
                placeholder="Track artist (optional)"
                value={track.artist}
                onChange={handleTrackChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lyrics">Lyrics</Label>
              <Textarea
                id="lyrics"
                name="lyrics"
                placeholder="Enter track lyrics"
                className="min-h-[200px]"
                value={track.lyrics}
                onChange={handleTrackChange}
              />
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
              <Label htmlFor="youtube_id">YouTube Video ID</Label>
              <Input 
                id="youtube_id"
                name="youtube_id"
                placeholder="e.g., ea3Ue-LN5B9U"
                value={track.youtube_id}
                onChange={handleTrackChange}
              />
              <p className="text-xs text-muted-foreground">
                Enter only the ID portion from a YouTube URL (e.g., from &quot;https://youtube.com/watch?v=ea3Ue-LN5B9U&quot; enter &quot;ea3Ue-LN5B9U&quot;)
              </p>
            </div>

            <div className="flex justify-end space-x-4">
              <Link href="/admin/music/tracks">
                <Button type="button" variant="outline">Cancel</Button>
              </Link>
              <Button type="submit" disabled={isLoading || fetchingAlbums}>
                {isLoading ? "Updating..." : "Update Track"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
