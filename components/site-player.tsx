"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Volume2, 
  Music2,
  VolumeX 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Define a formatTime function since it's not exported from @/lib/utils
const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

// Define track interface
interface Track {
  id: number | string;
  title: string;
  artist?: string;
  duration?: string;
}

export function SitePlayer() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(80);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [amplitude, setAmplitude] = useState(Array(20).fill(0));
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Fetch player tracks
  useEffect(() => {
    const fetchTracks = async () => {
      try {
        const response = await fetch('/api/player/tracks');
        if (!response.ok) throw new Error('Failed to fetch player tracks');
        const data = await response.json();
        setTracks(data);
      } catch (error) {
        console.error('Error fetching tracks:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTracks();
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);
  
  // Load current track
  useEffect(() => {
    if (tracks.length > 0 && currentTrackIndex < tracks.length) {
      const currentTrack = tracks[currentTrackIndex];
      if (audioRef.current) {
        audioRef.current.src = `/api/player/audio/${currentTrack.id}`;
        audioRef.current.load();
        
        if (isPlaying) {
          audioRef.current.play();
        }
      }
    }
  }, [tracks, currentTrackIndex]);
  
  // Handle audio events
  useEffect(() => {
    if (!audioRef.current) return;
    
    const handleTimeUpdate = () => {
      if (audioRef.current) {
        setCurrentTime(audioRef.current.currentTime);
      
        // Simulate visualization
        if (isPlaying) {
          setAmplitude(prev => 
            prev.map(() => Math.random() * 40 + (isPlaying ? 10 : 0))
          );
        }
      }
    };
    
    const handleLoadedMetadata = () => {
      if (audioRef.current) {
        setDuration(audioRef.current.duration);
      }
    };
    
    const handleEnded = () => {
      if (currentTrackIndex < tracks.length - 1) {
        setCurrentTrackIndex(currentTrackIndex + 1);
      } else {
        setCurrentTrackIndex(0);
        setIsPlaying(false);
      }
    };
    
    audioRef.current.addEventListener('timeupdate', handleTimeUpdate);
    audioRef.current.addEventListener('loadedmetadata', handleLoadedMetadata);
    audioRef.current.addEventListener('ended', handleEnded);
    
    return () => {
      if (audioRef.current) {
        audioRef.current.removeEventListener('timeupdate', handleTimeUpdate);
        audioRef.current.removeEventListener('loadedmetadata', handleLoadedMetadata);
        audioRef.current.removeEventListener('ended', handleEnded);
      }
    };
  }, [currentTrackIndex, tracks.length, isPlaying]);
  
  // Handle play/pause
  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch((error: Error) => {
          console.error("Error playing audio:", error);
          setIsPlaying(false);
        });
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying]);
  
  // Handle volume change
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume / 100;
    }
  }, [volume, isMuted]);
  
  // Handle play/pause toggle
  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };
  
  // Skip to previous track
  const skipPrevious = () => {
    if (currentTime > 3) {
      // If more than 3 seconds have passed, restart the current track
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
      }
    } else {
      // Otherwise go to previous track
      setCurrentTrackIndex(prev => 
        prev === 0 ? tracks.length - 1 : prev - 1
      );
    }
  };
  
  // Skip to next track
  const skipNext = () => {
    setCurrentTrackIndex(prev => 
      prev === tracks.length - 1 ? 0 : prev + 1
    );
  };
  
  // Handle seeking
  const handleSeek = (value: number[]) => {
    if (audioRef.current) {
      audioRef.current.currentTime = value[0];
      setCurrentTime(value[0]);
    }
  };
  
  // Toggle mute
  const toggleMute = () => {
    setIsMuted(!isMuted);
  };
  
  const currentTrack = tracks[currentTrackIndex] || { title: "", artist: "" };
  
  if (isLoading) {
    return (
      <div className="relative bg-gradient-to-br from-indigo-900 via-purple-900 to-violet-900 rounded-lg shadow-xl p-8 flex items-center justify-center">
        <p className="text-custom-white">Loading player...</p>
      </div>
    );
  }
  
  if (tracks.length === 0) {
    return (
      <div className="relative bg-gradient-to-br from-indigo-900 via-purple-900 to-violet-900 rounded-lg shadow-xl p-8 flex flex-col items-center justify-center">
        <Music2 className="h-12 w-12 text-custom-white/70 mb-3" />
        <p className="text-custom-white text-center">No tracks available</p>
      </div>
    );
  }
  
  return (
    <div className="relative bg-gradient-to-br from-indigo-900 via-purple-900 to-violet-900 rounded-lg shadow-xl p-8 overflow-hidden">
      {/* Animated background circles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-custom-white/5"
            initial={{ scale: 0, x: "50%", y: "50%" }}
            animate={{
              scale: [1, 2, 1],
              x: ["50%", "60%", "50%"],
              y: ["50%", "40%", "50%"],
            }}
            transition={{
              duration: 8,
              delay: i * 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            style={{
              width: "300px",
              height: "300px",
              left: `-${i * 10}%`,
              top: `-${i * 10}%`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-xl font-semibold text-custom-white">{currentTrack?.title || "No track selected"}</h3>
            <p className="text-purple-200">{currentTrack?.artist || "Unknown artist"}</p>
          </div>
          <motion.div
            animate={isPlaying ? { scale: [1, 1.2, 1] } : {}}
            transition={{ duration: 1, repeat: Infinity }}
          >
            <Music2 className="h-8 w-8 text-purple-200" />
          </motion.div>
        </div>

        {/* Music Visualization */}
        <div className="flex items-center justify-center h-20 mb-8 gap-1">
          <AnimatePresence>
            {isPlaying && amplitude.map((height, index) => (
              <motion.div
                key={index}
                initial={{ height: 0 }}
                animate={{ height }}
                exit={{ height: 0 }}
                transition={{ duration: 0.2 }}
                className="w-1 bg-gradient-to-t from-purple-500 to-indigo-300 rounded-full"
              />
            ))}
          </AnimatePresence>
        </div>

        <div className="space-y-6">
          <Slider
            value={[currentTime]}
            max={duration || 100}
            step={1}
            className="w-full"
            onValueChange={handleSeek}
          />
          
          <div className="flex justify-between items-center text-sm text-purple-200">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
          
          <div className="flex justify-center items-center gap-6">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={skipPrevious}
            >
              <SkipBack className="h-6 w-6 text-purple-200" />
            </motion.button>
            
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                size="icon"
                className="h-14 w-14 rounded-full bg-gradient-to-r from-purple-400 to-indigo-400 hover:from-purple-500 hover:to-indigo-500"
                onClick={togglePlayPause}
              >
                {isPlaying ? (
                  <Pause className="h-6 w-6 text-custom-white" />
                ) : (
                  <Play className="h-6 w-6 text-custom-white ml-1" />
                )}
              </Button>
            </motion.div>
            
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={skipNext}
            >
              <SkipForward className="h-6 w-6 text-purple-200" />
            </motion.button>
          </div>

          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-purple-200"
              onClick={toggleMute}
            >
              {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </Button>
            <Slider
              value={[isMuted ? 0 : volume]}
              max={100}
              step={1}
              className="w-24"
              onValueChange={(value) => setVolume(value[0])}
            />
          </div>
        </div>
      </div>

      {/* Hidden audio element */}
      <audio ref={audioRef} />

      {/* Floating music notes */}
      <div className="absolute inset-0 pointer-events-none">
        {isPlaying && [...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute"
            initial={{ 
              opacity: 0,
              scale: 0,
              x: Math.random() * 100 + "%",
              y: "100%" 
            }}
            animate={{ 
              opacity: [0, 1, 0],
              scale: [0, 1, 0],
              y: "0%",
              x: `${Math.random() * 100}%`
            }}
            transition={{
              duration: 4,
              delay: i * 0.8,
              repeat: Infinity,
              ease: "easeOut"
            }}
          >
            <Music2 className="h-4 w-4 text-purple-200/30" />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
