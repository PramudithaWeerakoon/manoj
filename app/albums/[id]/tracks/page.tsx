"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft, 
  Play, 
  Pause, 
  Music, 
  Volume2, 
  VolumeX, // Changed from VolumeMute to VolumeX
  SkipBack,
  SkipForward,
  Repeat,
  Shuffle,
  ListMusic,
  FileText
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Slider } from "@/components/ui/slider";
import { YouTubeDialog } from "@/components/youtube-dialog";
import { use } from "react";

interface TrackCredit {
  role: string;
  name: string;
}

interface Track {
  id: number;
  title: string;
  track_number: number;
  duration: string;
  lyrics: string | null;
  youtube_id: string | null;
  has_audio: boolean;
  audio_url: string | null;
  artist: string | null;
  credits: TrackCredit[];
}

interface Album {
  id: number;
  title: string;
  release_date: string;
  description: string | null;
  youtube_id: string | null;
  cover_image_url: string | null;
  tracks: Track[];
  credits: { role: string; name: string }[];
}

export default function AlbumTracksPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  // Unwrap params using the use hook
  const unwrappedParams = use(params);
  const albumId = unwrappedParams.id;
  
  const [album, setAlbum] = useState<Album | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentTrackIndex, setCurrentTrackIndex] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [showLyrics, setShowLyrics] = useState(false);
  const [youtubeVideoId, setYoutubeVideoId] = useState<string | null>(null);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  useEffect(() => {
    async function fetchAlbumTracks() {
      try {
        setLoading(true);
        const response = await fetch(`/api/albums/${albumId}/tracks`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch album tracks');
        }
        
        const data = await response.json();
        setAlbum(data.album);
        
      } catch (err) {
        console.error('Error fetching album tracks:', err);
        setError('Failed to load album tracks');
      } finally {
        setLoading(false);
      }
    }
    
    fetchAlbumTracks();
  }, [albumId]);
  
  // Handle audio player
  useEffect(() => {
    if (currentTrackIndex !== null && album?.tracks[currentTrackIndex].audio_url) {
      if (!audioRef.current) {
        audioRef.current = new Audio();
      }
      
      const audioUrl = album.tracks[currentTrackIndex].audio_url;
      if (audioUrl) {
        audioRef.current.src = audioUrl;
        audioRef.current.volume = volume;
        
        const handleLoadedMetadata = () => {
          if (audioRef.current) {
            setDuration(audioRef.current.duration);
          }
        };
        
        const handleTimeUpdate = () => {
          if (audioRef.current) {
            setCurrentTime(audioRef.current.currentTime);
          }
        };
        
        const handleEnded = () => {
          playNextTrack();
        };
        
        audioRef.current.addEventListener('loadedmetadata', handleLoadedMetadata);
        audioRef.current.addEventListener('timeupdate', handleTimeUpdate);
        audioRef.current.addEventListener('ended', handleEnded);
        
        if (isPlaying) {
          audioRef.current.play();
        }
        
        return () => {
          if (audioRef.current) {
            audioRef.current.removeEventListener('loadedmetadata', handleLoadedMetadata);
            audioRef.current.removeEventListener('timeupdate', handleTimeUpdate);
            audioRef.current.removeEventListener('ended', handleEnded);
          }
        };
      }
    }
  }, [currentTrackIndex, album, isPlaying, volume]);
  
  // Format time display
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };
  
  // Play/pause the current track
  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };
  
  // Play a specific track
  const playTrack = (index: number) => {
    if (currentTrackIndex === index && isPlaying) {
      setIsPlaying(false);
      audioRef.current?.pause();
    } else {
      setCurrentTrackIndex(index);
      setIsPlaying(true);
      setShowLyrics(false);
    }
  };
  
  // Play next track
  const playNextTrack = () => {
    if (album && currentTrackIndex !== null) {
      const nextIndex = (currentTrackIndex + 1) % album.tracks.length;
      setCurrentTrackIndex(nextIndex);
      setIsPlaying(true);
      setShowLyrics(false);
    }
  };
  
  // Play previous track
  const playPreviousTrack = () => {
    if (album && currentTrackIndex !== null) {
      const prevIndex = (currentTrackIndex - 1 + album.tracks.length) % album.tracks.length;
      setCurrentTrackIndex(prevIndex);
      setIsPlaying(true);
      setShowLyrics(false);
    }
  };
  
  // Set audio volume
  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
    if (newVolume > 0 && isMuted) {
      setIsMuted(false);
    }
  };
  
  // Toggle mute
  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };
  
  // Seek to position in track
  const handleSeek = (value: number[]) => {
    if (audioRef.current) {
      audioRef.current.currentTime = value[0];
      setCurrentTime(value[0]);
    }
  };
  
  // Show track lyrics
  const toggleLyrics = () => {
    setShowLyrics(!showLyrics);
  };
  
  // Play YouTube video if available
  const playYouTube = (videoId: string | null) => {
    if (videoId) {
      setYoutubeVideoId(videoId);
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-background py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    );
  }
  
  if (error || !album) {
    return (
      <div className="min-h-screen bg-background py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold">Error</h1>
            <p className="text-muted-foreground">{error || 'Failed to load album tracks'}</p>
            <Button 
              className="mt-4" 
              onClick={() => router.back()}
            >
              Go Back
            </Button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-background py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Link href={`/albums/${albumId}`}>
            <Button variant="ghost" className="mb-8">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Album
            </Button>
          </Link>
          
          {/* Album Header with Cover Image */}
          <div className="mb-8">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <div className="w-full md:w-48 h-48 relative rounded-lg overflow-hidden">
                {album.cover_image_url ? (
                  <Image
                    src={album.cover_image_url}
                    alt={album.title}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <Music className="h-12 w-12 text-gray-400" />
                  </div>
                )}
              </div>
              
              <div className="flex-grow">
                <h1 className="text-3xl font-bold mb-2">{album.title}</h1>
                {album.release_date && (
                  <p className="text-muted-foreground mb-2">
                    {new Date(album.release_date).getFullYear()}
                  </p>
                )}
                {album.description && (
                  <p className="text-muted-foreground mb-4 max-w-3xl">
                    {album.description}
                  </p>
                )}
                {album.youtube_id && (
                  <Button 
                    onClick={() => playYouTube(album.youtube_id)}
                    className="mr-2"
                  >
                    <Play className="mr-2 h-4 w-4" />
                    Play Album on YouTube
                  </Button>
                )}
              </div>
            </div>
          </div>
          
          {/* Current Playing Track (if any) */}
          {currentTrackIndex !== null && (
            <Card className="mb-8">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h2 className="text-xl font-semibold">
                        {album.tracks[currentTrackIndex].title}
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        {album.tracks[currentTrackIndex].artist || album.title}
                      </p>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      {album.tracks[currentTrackIndex].lyrics && (
                        <Button 
                          variant="outline" 
                          size="icon"
                          onClick={toggleLyrics}
                          className={showLyrics ? "bg-muted" : ""}
                        >
                          <FileText className="h-4 w-4" />
                        </Button>
                      )}
                      {album.tracks[currentTrackIndex].youtube_id && (
                        <Button 
                          variant="outline"
                          onClick={() => playYouTube(album.tracks[currentTrackIndex].youtube_id)}
                        >
                          <Play className="mr-2 h-4 w-4" />
                          YouTube
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  {/* Progress bar */}
                  <div className="space-y-2">
                    <Slider
                      value={[currentTime]}
                      min={0}
                      max={duration || 100}
                      step={0.1}
                      onValueChange={handleSeek}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs">
                      <span>{formatTime(currentTime)}</span>
                      <span>{formatTime(duration)}</span>
                    </div>
                  </div>
                  
                  {/* Player controls */}
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="icon" onClick={toggleMute}>
                        {isMuted ? (
                          <VolumeX className="h-4 w-4" />
                        ) : (
                          <Volume2 className="h-4 w-4" />
                        )}
                      </Button>
                      <div className="w-24">
                        <Slider 
                          value={[isMuted ? 0 : volume]} 
                          min={0} 
                          max={1} 
                          step={0.01}
                          onValueChange={handleVolumeChange}
                        />
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <Button variant="ghost" size="icon" onClick={playPreviousTrack}>
                        <SkipBack className="h-5 w-5" />
                      </Button>
                      <Button 
                        className="bg-primary text-white hover:bg-primary/90"
                        size="icon" 
                        onClick={togglePlayPause}
                      >
                        {isPlaying ? (
                          <Pause className="h-5 w-5" />
                        ) : (
                          <Play className="h-5 w-5" />
                        )}
                      </Button>
                      <Button variant="ghost" size="icon" onClick={playNextTrack}>
                        <SkipForward className="h-5 w-5" />
                      </Button>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="icon">
                        <Repeat className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Shuffle className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Lyrics display (if showing) */}
          {showLyrics && currentTrackIndex !== null && album.tracks[currentTrackIndex].lyrics && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="mr-2 h-5 w-5" />
                  Lyrics for &quot;{album.tracks[currentTrackIndex].title}&quot;
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="whitespace-pre-wrap leading-relaxed">
                  {album.tracks[currentTrackIndex].lyrics}
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Tracks list */}
          <Card className="mb-8">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center">
                <ListMusic className="mr-2 h-5 w-5" />
                All Tracks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {album.tracks.map((track, index) => (
                  <motion.div
                    key={track.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`flex items-center justify-between p-3 rounded-lg hover:bg-muted cursor-pointer ${
                      currentTrackIndex === index ? "bg-muted" : ""
                    }`}
                    onClick={() => track.has_audio ? playTrack(index) : playYouTube(track.youtube_id)}
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-8 text-center text-muted-foreground">
                        {currentTrackIndex === index && isPlaying ? (
                          <Pause className="h-4 w-4 mx-auto" />
                        ) : (
                          track.track_number
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{track.title}</p>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <span>{track.artist || "—"}</span>
                          {track.has_audio && (
                            <>
                              <span className="mx-2">•</span>
                              <span className="text-green-600 flex items-center">
                                <Volume2 className="h-3 w-3 mr-1" />
                                Available for Playback
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      {track.youtube_id && (
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="h-8 w-8 rounded-full"
                          onClick={(e) => {
                            e.stopPropagation();
                            playYouTube(track.youtube_id);
                          }}
                        >
                          <Play className="h-4 w-4" />
                        </Button>
                      )}
                      <span>{track.duration || "—"}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          {/* Album Credits */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Album Credits</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {album.credits.map((credit, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-3"
                  >
                    <Music className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{credit.name}</p>
                      <p className="text-sm text-muted-foreground">{credit.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
      
      {/* YouTube Dialog */}
      <YouTubeDialog
        videoId={youtubeVideoId || ""}
        isOpen={!!youtubeVideoId}
        onClose={() => setYoutubeVideoId(null)}
      />
    </div>
  );
}
