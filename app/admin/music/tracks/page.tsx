"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, Edit, Trash, Music, Clock, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { toast } from "@/components/ui/use-toast";
import Loading from "../../../loading";

// Define interfaces for our data types
interface Track {
  id: string;
  title: string;
  album: string;
  duration: string;
  trackNumber: number;
}

interface ApiTrack {
  id: string;
  title: string;
  album?: {
    title: string;
  };
  duration?: string;
  track_number: number;
}

export default function TracksPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [tracks, setTracks] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);

  // Fetch tracks function
  const fetchTracks = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/tracks");
      
      if (!response.ok) {
        throw new Error("Failed to fetch tracks");
      }
      
      const data = await response.json();
      if (data.success && data.tracks) {
        // Transform the data to match our component's expected structure
        const formattedTracks = data.tracks.map((track: ApiTrack) => ({
          id: track.id,
          title: track.title,
          album: track.album ? track.album.title : "Unknown Album",
          duration: track.duration || "--:--",
          trackNumber: track.track_number
        }));
        setTracks(formattedTracks);
      } else {
        setTracks([]);
      }
    } catch (error) {
      console.error("Error fetching tracks:", error);
      toast({
        title: "Error",
        description: "Failed to load tracks",
        variant: "destructive"
      });
      setTracks([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTracks();
  }, []);

  // Handle track deletion
  const handleDeleteTrack = async (trackId: string) => {
    if (!confirm("Are you sure you want to delete this track?")) {
      return;
    }
    
    setDeleteLoading(trackId);
    try {
      const response = await fetch(`/api/tracks?id=${trackId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete track");
      }

      // Refresh the tracks list after successful deletion
      toast({
        title: "Success",
        description: "Track deleted successfully"
      });
      await fetchTracks();
    } catch (error) {
      console.error("Error deleting track:", error);
      toast({
        title: "Error",
        description: "Failed to delete track",
        variant: "destructive"
      });
    } finally {
      setDeleteLoading(null);
    }
  };

  const filteredTracks = tracks.filter(track =>
    track.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Link href="/admin">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Tracks</h1>
      </div>

      <div className="flex justify-end">
        <Link href="/admin/music/tracks/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Track
          </Button>
        </Link>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search tracks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {isLoading ? (
        <Loading />
      ) : filteredTracks.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No tracks found.</p>
          {searchQuery && (
            <p className="text-sm text-muted-foreground mt-2">
              Try adjusting your search query.
            </p>
          )}
        </div>
      ) : (
        <div className="grid gap-6">
          {filteredTracks.map((track, index) => (
            <motion.div
              key={track.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card>
                <CardContent className="p-6">
                  <div className="flex justify-between items-center">
                    <div className="space-y-1">
                      <div className="flex items-center">
                        <Music className="h-4 w-4 mr-2 text-muted-foreground" />
                        <h3 className="text-xl font-semibold">{track.title}</h3>
                      </div>
                      <div className="flex items-center text-muted-foreground">
                        <span>Track {track.trackNumber}</span>
                        <span className="mx-2">•</span>
                        <span>{track.album}</span>
                        <span className="mx-2">•</span>
                        <Clock className="h-4 w-4 mx-1" />
                        <span>{track.duration}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Link href={`/admin/music/tracks/edit/${track.id}`}>
                        <Button variant="outline" size="icon">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button 
                        variant="outline" 
                        size="icon" 
                        className="text-destructive"
                        onClick={() => handleDeleteTrack(track.id)}
                        disabled={deleteLoading === track.id}
                      >
                        {deleteLoading === track.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash className="h-4 w-4" />
                        )}
                      </Button>
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