"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Play, Pause, SkipBack, SkipForward, Volume2, Music2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Track {
  id: number;
  title: string;
  artist?: string;
  duration: string;
  playCount?: number;
  lastPlayed?: string;
}

export function MusicPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(80);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [amplitude, setAmplitude] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  // Create audio element
  useEffect(() => {
    audioRef.current = new Audio();
    audioRef.current.volume = volume / 100;
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);
  
  // Fetch tracks for the player
  useEffect(() => {
    async function fetchTracks() {
      try {
        setIsLoading(true);
        console.log("Fetching tracks for music player...");
        const response = await fetch('/api/player/tracks');
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          console.error("Error response:", errorData);
          throw new Error(`Failed to fetch tracks: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log("Received data structure:", data);
        
        // Handle different response formats - either {tracks: [...]} or just [...] directly
        let playerTracks: Track[] = [];
        
        if (Array.isArray(data)) {
          // API returned tracks directly as an array
          console.log("API returned tracks as an array");
          playerTracks = data;
        } else if (data.tracks && Array.isArray(data.tracks)) {
          // API returned tracks wrapped in a 'tracks' property
          console.log("API returned tracks in a 'tracks' property");
          playerTracks = data.tracks;
        } else {
          console.error("Unexpected data format received:", data);
          throw new Error("Unrecognized data format from API");
        }
        
        console.log("Tracks in player:", playerTracks);
        setTracks(playerTracks);
        
        // If we have tracks, set up the first one
        if (playerTracks.length > 0) {
          setCurrentTrackIndex(0);
          loadTrack(playerTracks[0].id);
        }
      } catch (error) {
        console.error('Error fetching tracks:', error);
        // Display the error in the UI if needed
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchTracks();
  }, []);
  
  // Load a track
  const loadTrack = (trackId: number) => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = `/api/player/audio/${trackId}`;
      
      audioRef.current.onloadedmetadata = () => {
        if (audioRef.current) {
          setDuration(audioRef.current.duration);
        }
      };
      
      audioRef.current.ontimeupdate = () => {
        if (audioRef.current) {
          setCurrentTime(audioRef.current.currentTime);
        }
      };
      
      audioRef.current.onended = handleNext;
    }
  };
  
  // Update volume when it changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
    }
  }, [volume]);
  
  // Handle play/pause
  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play()
          .catch(err => {
            console.error("Error playing audio:", err);
            setIsPlaying(false);
          });
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying]);
  
  // Simulate music visualization
  useEffect(() => {
    if (isPlaying) {
      const interval = setInterval(() => {
        setAmplitude(Array.from({ length: 20 }, () => Math.random() * 40 + 10));
      }, 100);
      return () => clearInterval(interval);
    }
  }, [isPlaying]);
  
  // Format time helper
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Handle track navigation
  const handlePrev = () => {
    if (tracks.length === 0) return;
    
    const newIndex = (currentTrackIndex - 1 + tracks.length) % tracks.length;
    setCurrentTrackIndex(newIndex);
    loadTrack(tracks[newIndex].id);
    
    if (isPlaying) {
      setIsPlaying(false);
      setTimeout(() => setIsPlaying(true), 10);
    }
  };
  
  const handleNext = () => {
    if (tracks.length === 0) return;
    
    const newIndex = (currentTrackIndex + 1) % tracks.length;
    setCurrentTrackIndex(newIndex);
    loadTrack(tracks[newIndex].id);
    
    if (isPlaying) {
      setIsPlaying(false);
      setTimeout(() => setIsPlaying(true), 10);
    }
  };
  
  const handleTimeChange = (value: number[]) => {
    const newTime = value[0];
    setCurrentTime(newTime);
    
    if (audioRef.current) {
      // Remember if audio was playing before changing time
      const wasPlaying = !audioRef.current.paused;
      
      // Set the new position
      audioRef.current.currentTime = newTime;
      
      // If it was playing before, make sure it continues playing
      if (wasPlaying) {
        audioRef.current.play().catch(err => {
          console.error("Error resuming audio after time change:", err);
          setIsPlaying(false);
        });
      }
    }
  };
  
  // Get current track
  const currentTrack = tracks.length > 0 ? tracks[currentTrackIndex] : null;

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
            <h3 className="text-xl font-semibold text-custom-white">
              {currentTrack ? currentTrack.title : "No Track Selected"}
            </h3>
            <p className="text-purple-200">
              {currentTrack ? currentTrack.artist || "Unknown Artist" : "Add tracks in the admin panel"}
            </p>
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
            step={0.1}
            className="w-full"
            onValueChange={handleTimeChange}
            disabled={!currentTrack}
          />
          
          <div className="flex justify-between items-center text-sm text-purple-200">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
          
          <div className="flex justify-center items-center gap-6">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={handlePrev}
              disabled={!currentTrack}
            >
              <SkipBack className={`h-6 w-6 ${currentTrack ? 'text-purple-200' : 'text-purple-200/50'}`} />
            </motion.button>
            
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                size="icon"
                className="h-14 w-14 rounded-full bg-gradient-to-r from-purple-400 to-indigo-400 hover:from-purple-500 hover:to-indigo-500"
                onClick={() => setIsPlaying(!isPlaying)}
                disabled={!currentTrack}
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
              onClick={handleNext}
              disabled={!currentTrack}
            >
              <SkipForward className={`h-6 w-6 ${currentTrack ? 'text-purple-200' : 'text-purple-200/50'}`} />
            </motion.button>
          </div>

          <div className="flex items-center gap-2">
            <Volume2 className="h-4 w-4 text-purple-200" />
            <Slider
              value={[volume]}
              max={100}
              step={1}
              className="w-24"
              onValueChange={(value) => setVolume(value[0])}
            />
          </div>
        </div>
      </div>

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