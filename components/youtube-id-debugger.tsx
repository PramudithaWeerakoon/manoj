"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Play } from "lucide-react";
import { YouTubeDialog } from "@/components/youtube-dialog";

interface YouTubeIdDebuggerProps {
  albumId: number;
}

export function YouTubeIdDebugger({ albumId }: YouTubeIdDebuggerProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [trackData, setTrackData] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`/api/albums/${albumId}/youtube-tracks`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch data: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success && data.tracks) {
          setTrackData(data.tracks);
        } else {
          throw new Error("Invalid data format");
        }
      } catch (err: unknown) {
        console.error("Error:", err);
        setError(
          err instanceof Error ? err.message : "An unknown error occurred"
        );
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [albumId]);
  
  const playVideo = (youtubeId: string) => {
    setActiveVideoId(youtubeId);
    setIsVideoOpen(true);
  };
  
  return (
    <Card className="my-4">
      <CardHeader>
        <CardTitle>YouTube ID Debugger</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p>Loading track data...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : (
          <div className="space-y-4">
            <p>Found {trackData.length} tracks with YouTube data</p>
            <div className="space-y-2">
              {trackData.map(track => (
                <div 
                  key={track.id}
                  className="flex items-center justify-between p-2 bg-muted rounded-md"
                >
                  <div>
                    <p className="font-medium">
                      {track.title} (ID: {track.id})
                    </p>
                    <p className="text-sm text-muted-foreground">
                      YouTube ID: {track.youtube_id || "None"}
                    </p>
                  </div>
                  {track.youtube_id && (
                    <Button 
                      size="sm" 
                      onClick={() => playVideo(track.youtube_id)}
                    >
                      <Play className="h-4 w-4 mr-1" />
                      Test
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
      
      <YouTubeDialog
        videoId={activeVideoId || ""}
        isOpen={isVideoOpen}
        onClose={() => setIsVideoOpen(false)}
      />
    </Card>
  );
}
