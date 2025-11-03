"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  Plus, 
  Trash, 
  Music, 
  Play, 
  Pause, 
  ArrowUp, 
  ArrowDown,
  ArrowLeft, 
  Upload 
} from "lucide-react";
import Link from "next/link";
import { toast } from "@/components/ui/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

// Define interfaces
interface Track {
  id: string;
  title: string;
  artist: string;
  duration: string;
  addedAt: string;
  playCount: number;
}

interface UploadTrackData {
  title: string;
  artist: string;
  duration: string;
}

export default function PlayerManagerPage() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  
  // Track upload state
  const [uploadTrack, setUploadTrack] = useState<UploadTrackData>({
    title: "",
    artist: "",
    duration: ""
  });
  const [audioFile, setAudioFile] = useState<File | null>(null);
  
  // Fetch player tracks
  useEffect(() => {
    const fetchTracks = async () => {
      try {
        const response = await fetch('/api/admin/player-tracks');
        if (!response.ok) throw new Error('Failed to fetch player tracks');
        const data = await response.json();
        setTracks(data);
      } catch (error: unknown) {
        console.error('Error fetching tracks:', error);
        toast({
          title: "Error",
          description: "Failed to load player tracks",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTracks();
  }, []);
  
  // Filter tracks based on search
  const filteredTracks = tracks.filter(track => 
    track.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    track.artist.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Handle track input changes for upload
  const handleTrackChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUploadTrack(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle audio file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAudioFile(file);
      
      // Try to extract duration if possible
      const audio = new Audio();
      audio.onloadedmetadata = () => {
        const minutes = Math.floor(audio.duration / 60);
        const seconds = Math.floor(audio.duration % 60);
        setUploadTrack(prev => ({
          ...prev,
          duration: `${minutes}:${seconds.toString().padStart(2, '0')}`
        }));
      };
      audio.src = URL.createObjectURL(file);
    }
  };
  
  // Handle track upload
  const handleUploadTrack = async () => {
    if (!audioFile) {
      toast({
        title: "Error",
        description: "Please select an audio file to upload",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const formData = new FormData();
      formData.append('title', uploadTrack.title);
      formData.append('artist', uploadTrack.artist);
      formData.append('duration', uploadTrack.duration);
      formData.append('audioFile', audioFile);
      
      const response = await fetch('/api/admin/player-tracks', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to upload track');
      }
      
      const newTrack = await response.json();
      
      setTracks(prev => [...prev, newTrack]);
      setIsUploadDialogOpen(false);
      
      // Reset form
      setUploadTrack({
        title: "",
        artist: "",
        duration: ""
      });
      setAudioFile(null);
      
      toast({
        title: "Success",
        description: "Track uploaded successfully",
      });
    } catch (error: unknown) {
      console.error('Error uploading track:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to upload track",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle play/pause
  const handlePlayPause = (trackId: string) => {
    if (currentlyPlaying === trackId) {
      setIsPlaying(!isPlaying);
    } else {
      setCurrentlyPlaying(trackId);
      setIsPlaying(true);
    }
  };
  
  // Handle reordering tracks
  const moveTrack = async (trackId: string, direction: 'up' | 'down') => {
    try {
      const response = await fetch(`/api/admin/player-tracks/reorder`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          trackId,
          direction
        }),
      });
      
      if (!response.ok) throw new Error('Failed to reorder track');
      
      const updatedTracks = await response.json();
      setTracks(updatedTracks);
    } catch (error: unknown) {
      console.error('Error reordering track:', error);
      toast({
        title: "Error",
        description: "Failed to reorder track",
        variant: "destructive",
      });
    }
  };
  
  // Handle delete track
  const deleteTrack = async (trackId: string) => {
    if (!confirm('Are you sure you want to remove this track from the player?')) return;
    
    try {
      const response = await fetch(`/api/admin/player-tracks/${trackId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) throw new Error('Failed to delete track');
      
      setTracks(tracks.filter(track => track.id !== trackId));
      
      toast({
        title: "Success",
        description: "Track removed from player",
      });
    } catch (error: unknown) {
      console.error('Error deleting track:', error);
      toast({
        title: "Error",
        description: "Failed to remove track",
        variant: "destructive",
      });
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Link href="/admin">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Music Player Manager</h1>
      </div>
      
      <div className="flex justify-between items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search tracks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Track to Player
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Upload Track to Player</DialogTitle>
              <DialogDescription>
                Add a new track to the music player. This track will be stored separately from album tracks.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">Track Title</Label>
                <Input
                  id="title"
                  name="title"
                  value={uploadTrack.title}
                  onChange={handleTrackChange}
                  placeholder="Enter track title"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="artist">Artist</Label>
                <Input
                  id="artist"
                  name="artist"
                  value={uploadTrack.artist}
                  onChange={handleTrackChange}
                  placeholder="Enter artist name"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="duration">Duration</Label>
                <Input
                  id="duration"
                  name="duration"
                  value={uploadTrack.duration}
                  onChange={handleTrackChange}
                  placeholder="e.g., 3:45"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="audioFile">Audio File (MP3)</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    id="audioFile"
                    type="file"
                    accept="audio/mpeg,audio/mp3"
                    onChange={handleFileChange}
                  />
                </div>
                {audioFile && (
                  <p className="text-sm text-muted-foreground">{audioFile.name}</p>
                )}
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsUploadDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleUploadTrack} disabled={isLoading}>
                {isLoading ? "Uploading..." : "Upload Track"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Player Tracks</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center p-6">
              <p>Loading tracks...</p>
            </div>
          ) : filteredTracks.length === 0 ? (
            <div className="text-center p-6">
              <Music className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
              <p className="text-muted-foreground">No tracks in the player yet.</p>
              <p className="text-sm text-muted-foreground">Click &quot;Add Track to Player&quot; to upload your first track.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">Order</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Artist</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Added</TableHead>
                  <TableHead>Plays</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTracks.map((track) => (
                  <TableRow key={track.id}>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => moveTrack(track.id, 'up')}
                        >
                          <ArrowUp className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => moveTrack(track.id, 'down')}
                        >
                          <ArrowDown className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{track.title}</TableCell>
                    <TableCell>{track.artist}</TableCell>
                    <TableCell>{track.duration}</TableCell>
                    <TableCell>{new Date(track.addedAt).toLocaleDateString()}</TableCell>
                    <TableCell>{track.playCount}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handlePlayPause(track.id)}
                        >
                          {currentlyPlaying === track.id && isPlaying ? (
                            <Pause className="h-4 w-4" />
                          ) : (
                            <Play className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="text-destructive"
                          onClick={() => deleteTrack(track.id)}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
