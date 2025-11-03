"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Play, Pause, Music, Share2, Heart, ChevronDown, ChevronUp } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { YouTubeDialog } from "@/components/youtube-dialog";
import Image from "next/image";
import { toast } from "@/components/ui/use-toast"; // Import the toast hook

interface TrackCredit {
  id?: number;
  role: string;
  name: string;
}

interface Track {
  id?: number;
  title: string;
  duration: string;
  youtubeId?: string;
  lyrics?: string | null;
  credits?: TrackCredit[];
}

interface Album {
  id: number;
  title: string;
  releaseDate: string;
  coverArt: string;
  description: string;
  tracks: Track[];
  credits: { role: string; name: string }[];
  youtubeId: string;
}

interface AlbumDetailsProps {
  album: Album;
}

// Debug helper function
const debugLog = (message: string, data?: any) => {
  console.log(`[AlbumDetails] ${message}`, data || '');
};

export function AlbumDetails({ album }: AlbumDetailsProps) {
  // State
  const [currentTrack, setCurrentTrack] = useState<number | null>(null);
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const [activeVideoId, setActiveVideoId] = useState<string>("");
  const [trackYoutubeIds, setTrackYoutubeIds] = useState<Map<number | string, string>>(new Map());
  const [debugInfo, setDebugInfo] = useState<string>("");
  const [expandedTrack, setExpandedTrack] = useState<number | null>(null);
  const [trackDetails, setTrackDetails] = useState<Map<number, {
    lyrics?: string | null, 
    credits?: TrackCredit[]
  }>>(new Map());
  const [trackTitleMap, setTrackTitleMap] = useState<Map<string, any>>(new Map());
  
  
  // Add cache busting parameter to cover art URL
  const coverArtUrl = album.coverArt ? `${album.coverArt}?t=${Date.now()}` : '/placeholder-album.jpg';

  // Fetch track-specific YouTube IDs, lyrics, and credits
  useEffect(() => {
    const fetchTrackDetails = async () => {
      if (!album?.id) return;
      
      try {
        debugLog(`Fetching track details for album ${album.id}`);
        const response = await fetch(`/api/albums/${album.id}/youtube-tracks`);
        
        if (!response.ok) {
          debugLog('Failed to fetch track details');
          setDebugInfo("Error fetching track details");
          return;
        }
        
        const data = await response.json();
        debugLog('Received track details', data);
        
        // Debug the full raw data from API
        console.log("[RAW API RESPONSE]", JSON.stringify(data, null, 2));
        
        if (data.success && Array.isArray(data.tracks)) {
          // Create maps for data storage
          const youtubeMap = new Map();
          const detailsMap = new Map();
          const titleMap = new Map(); // For lookup by title
          
          data.tracks.forEach((track: any) => {
            console.log(`[PROCESSING TRACK] ID:${track.id}, Title:${track.title}`);
            
            // Map YouTube IDs
            if (track.id && track.youtube_id) {
              youtubeMap.set(track.id, track.youtube_id);
              console.log(`[MAPPING] Track ${track.id} to YouTube ID ${track.youtube_id}`);
            }
            
            if (track.title && track.youtube_id) {
              youtubeMap.set(track.title.toLowerCase(), track.youtube_id);
              console.log(`[MAPPING] Track title "${track.title}" to YouTube ID ${track.youtube_id}`);
            }
            
            // Map lyrics and credits data
            if (track.id) {
              const trackCredits = Array.isArray(track.credits) ? track.credits : [];
              
              detailsMap.set(track.id, {
                lyrics: track.lyrics,
                credits: trackCredits
              });
              
              console.log(`[DETAILS MAPPED] For track ${track.id}: lyrics=${Boolean(track.lyrics)}, credits=${trackCredits.length}`);
            }
            
            // Also map by title for when we don't have IDs
            if (track.title) {
              titleMap.set(track.title.toLowerCase(), {
                id: track.id,
                lyrics: track.lyrics,
                credits: Array.isArray(track.credits) ? track.credits : []
              });
              console.log(`[TITLE MAPPED] "${track.title}" -> ID:${track.id}, hasLyrics:${Boolean(track.lyrics)}, credits:${track.credits?.length || 0}`);
            }
          });
          
          setTrackYoutubeIds(youtubeMap);
          setTrackDetails(detailsMap);
          setTrackTitleMap(titleMap);
          
          console.log("[FINAL MAPS]");
          console.log("Title Map:", Array.from(titleMap.entries()).map(([title, data]) => ({
            title,
            id: data.id,
            hasLyrics: Boolean(data.lyrics),
            creditsCount: data.credits?.length || 0
          })));
        }
      } catch (err) {
        debugLog('Error fetching track details:', err);
        setDebugInfo("Failed to fetch track details");
      }
    };
    
    fetchTrackDetails();
  }, [album?.id]);
  
  // Get YouTube ID for a specific track
  const getTrackYoutubeId = (track: Track): string | null => {
    // First check if the track has a direct youtubeId property
    if (track.youtubeId) {
      debugLog(`Using direct track YouTube ID: ${track.youtubeId}`);
      return track.youtubeId;
    }
    
    // Then check our API data using the track ID
    if (track.id && trackYoutubeIds.has(track.id)) {
      const youtubeId = trackYoutubeIds.get(track.id);
      debugLog(`Found YouTube ID by track ID ${track.id}: ${youtubeId}`);
      return youtubeId || null;
    }

    // Try to find by title if ID match failed
    if (track.title) {
      // Try exact title match
      const title = track.title.toLowerCase();
      if (trackYoutubeIds.has(title)) {
        const youtubeId = trackYoutubeIds.get(title);
        debugLog(`Found YouTube ID by exact title match "${title}": ${youtubeId}`);
        return youtubeId || null;
      }
      
      // Try case-insensitive title matching against all tracks
      debugLog(`Trying to find YouTube ID by title: "${track.title}"`);
      
      // Check if title contains "robinson" specifically (special case)
      if (title.includes("robinson")) {
        const robinsonEntry = Array.from(trackYoutubeIds.entries())
          .find(([key, val]) => 
            typeof key === "string" && 
            key.toLowerCase().includes("robinson")
          );
        
        if (robinsonEntry) {
          debugLog(`Found special case "robinson" YouTube ID: ${robinsonEntry[1]}`);
          return robinsonEntry[1];
        }
      }
      
      // Try direct numerical ID lookup from the array (not the map)
      // This is to handle cases where we have track numbers in the UI but IDs in the API
      for (let i = 0; i < album.tracks.length; i++) {
        if (album.tracks[i].title === track.title) {
          // Track numbers are typically 1-based, but array indices are 0-based
          const trackNum = i + 4; // Adding offset for ID (if track IDs start from 4)
          if (trackYoutubeIds.has(trackNum)) {
            const youtubeId = trackYoutubeIds.get(trackNum);
            debugLog(`Found YouTube ID by calculated ID ${trackNum}: ${youtubeId}`);
            return youtubeId || null;
          }
        }
      }
    }
    
    debugLog(`No YouTube ID found for track "${track.title}" (ID: ${track.id || 'unknown'})`);
    return null;
  };

  // Play YouTube video for a track
  const playTrackVideo = (index: number) => {
    const track = album.tracks[index];
    debugLog(`Attempting to play track ${index}: "${track.title}" (ID: ${track.id || 'unknown'})`);
    
    // Toggle if already playing this track
    if (currentTrack === index && isVideoOpen) {
      setIsVideoOpen(false);
      return;
    }
    
    setCurrentTrack(index);
    
    // Get the YouTube ID for this track
    const trackYoutubeId = getTrackYoutubeId(track);
    
    if (trackYoutubeId) {
      // Use track-specific YouTube ID
      debugLog(`Playing YouTube ID: ${trackYoutubeId} for track "${track.title}"`);
      setActiveVideoId(trackYoutubeId);
    } else {
      // Fall back to album's YouTube ID
      debugLog(`No track-specific YouTube ID found for "${track.title}", falling back to album ID: ${album.youtubeId}`);
      setActiveVideoId(album.youtubeId || '');
    }
    
    setIsVideoOpen(true);
  };

  // Check if a track has its own YouTube ID
  const hasOwnYoutubeId = (track: Track): boolean => {
    if (track.youtubeId) return true;
    if (track.id && trackYoutubeIds.has(track.id)) return true;
    return false;
  };

  // Get track details (lyrics and credits)
  const getTrackDetails = (track: Track) => {
    console.log(`[GET TRACK DETAILS] Called for track: ${track.title} (ID: ${track.id})`);
    
    // First check by ID if available
    if (track.id && trackDetails.has(track.id)) {
      const details = trackDetails.get(track.id);
      console.log(`[GET TRACK DETAILS] Found details by ID for track ${track.id}`);
      return {
        lyrics: details?.lyrics || null,
        credits: details?.credits || []
      };
    }
    
    // If no ID or no match by ID, try to find by title
    const cleanTitle = track.title.toLowerCase().trim();
    if (trackTitleMap.has(cleanTitle)) {
      const details = trackTitleMap.get(cleanTitle);
      console.log(`[GET TRACK DETAILS] Found details by title for "${track.title}"`);
      return {
        lyrics: details?.lyrics || null,
        credits: details?.credits || []
      };
    }
    
    // Try inexact title matching if exact match fails
    const titleEntries = Array.from(trackTitleMap.entries());
    for (const [mappedTitle, details] of titleEntries) {
      // Check if titles are similar (case insensitive and trimmed)
      if (cleanTitle.includes(mappedTitle) || mappedTitle.includes(cleanTitle)) {
        console.log(`[GET TRACK DETAILS] Found details by partial title match: "${track.title}" ~ "${mappedTitle}"`);
        return {
          lyrics: details?.lyrics || null,
          credits: details?.credits || []
        };
      }
    }
    
    // For the specific track "Ape Rata Heta Ekama Eka Sura Purayak", try to find it by partial match
    if (cleanTitle.includes("ape rata") || cleanTitle.includes("sura purayak")) {
      const matches = titleEntries.filter(([title, _]) => 
        title.includes("ape") || title.includes("rata") || title.includes("sura"));
      
      if (matches.length > 0) {
        console.log(`[GET TRACK DETAILS] Found special case match for "${track.title}"`, matches[0][0]);
        return {
          lyrics: matches[0][1].lyrics || null,
          credits: matches[0][1].credits || []
        };
      }
    }
    
    // Track number fallback - if we have the same number of tracks in both arrays
    // Then use the track index to match
    if (album.tracks.length === trackDetails.size) {
      const trackIndex = album.tracks.findIndex(t => t.title === track.title);
      if (trackIndex !== -1) {
        // Get the ID from the corresponding position in our API data
        const allApiTracks = Array.from(trackDetails.keys());
        if (allApiTracks[trackIndex]) {
          const matchedId = allApiTracks[trackIndex];
          const details = trackDetails.get(matchedId);
          console.log(`[GET TRACK DETAILS] Found details by position for "${track.title}" -> ID:${matchedId}`);
          return {
            lyrics: details?.lyrics || null,
            credits: details?.credits || []
          };
        }
      }
    }
    
    console.log(`[GET TRACK DETAILS] No details found for track "${track.title}"`);
    return { lyrics: null, credits: [] };
  };

  // Toggle track details dropdown
  const toggleTrackDetails = (index: number, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering the track click event
    
    const track = album.tracks[index];
    console.log(`[TOGGLE DETAILS] Track ${index+1}: "${track.title}" (ID: ${track.id})`);
    
    // If expanding, fetch the details
    if (expandedTrack !== index) {
      const details = getTrackDetails(track);
      console.log(`[TOGGLE DETAILS] Expanded details:`, {
        lyrics: details.lyrics ? "Available" : "None",
        creditsCount: details.credits?.length || 0,
        credits: details.credits
      });
    }
    
    setExpandedTrack(expandedTrack === index ? null : index);
  };

  // Play all button handler
  const handlePlayAll = () => {
    // Find first track with YouTube ID
    const firstTrackWithVideo = album.tracks.findIndex(track => hasOwnYoutubeId(track));
    
    if (firstTrackWithVideo !== -1) {
      playTrackVideo(firstTrackWithVideo);
    } else if (album.tracks.length > 0) {
      // Play first track with album YouTube ID
      setCurrentTrack(0);
      setActiveVideoId(album.youtubeId);
      setIsVideoOpen(true);
    }
  };

  const handleShareAlbum = () => {
    if (navigator.share) {
      // For devices that support Web Share API
      navigator.share({
        title: `${album.title} - Radioo Music`,
        text: `Check out "${album.title}" album by Radioo Music!`,
        url: window.location.href,
      })
      .catch((error) => console.error('Error sharing:', error));
    } else {
      // Fallback for devices that don't support Web Share API
      const shareUrl = window.location.href;
      
      // Copy to clipboard
      navigator.clipboard.writeText(shareUrl)
        .then(() => {
          toast({
            title: "Link copied to clipboard",
            description: "Share the link with your friends!",
          });
        })
        .catch(() => {
          // If clipboard API fails, prompt user to copy manually
          window.prompt("Copy this link to share:", shareUrl);
        });
    }
  };

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Link href="/albums">
            <Button variant="ghost" className="mb-8">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Albums
            </Button>
          </Link>
          
         

          <div className="grid grid-cols-1 lg:grid-cols-[400px,1fr] gap-12">
            {/* Album cover and info */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="overflow-hidden">
                <div className="aspect-square relative">
                  <Image
                    src={coverArtUrl}
                    alt={album.title}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div>
                      <h1 className="text-2xl font-bold">{album.title}</h1>
                      <p className="text-muted-foreground">{album.releaseDate}</p>
                    </div>
                    <p className="text-muted-foreground">{album.description}</p>
                    <div className="flex space-x-4">
                      <Button 
                        className="flex-1"
                        onClick={handlePlayAll}
                      >
                        <Play className="mr-2 h-4 w-4" />
                        Play All
                      </Button>
                      <Button variant="outline" size="icon">
                        <Heart className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="icon" onClick={handleShareAlbum}>
                        <Share2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Tracks */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="space-y-8"
            >
              <Card>
                <CardHeader>
                  <CardTitle>Tracks</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {Array.isArray(album.tracks) && album.tracks.length > 0 ? (
                      album.tracks.map((track, index) => {
                        // Check if this track has its own YouTube ID
                        const hasYouTube = hasOwnYoutubeId(track);
                        // Get the actual YouTube ID for this track (for debugging display)
                        const trackYtId = getTrackYoutubeId(track);
                        // Get track details (lyrics and credits)
                        const details = getTrackDetails(track);
                        
                        // Log what details we've got for this track in the render
                        console.log(`[RENDER TRACK] #${index + 1}: ${track.title} (ID: ${track.id}):`, {
                          hasLyrics: !!details.lyrics,
                          creditsCount: details.credits?.length || 0
                        });
                        
                        return (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="rounded-lg border border-border hover:bg-muted/50"
                          >
                            <div 
                              className={`flex items-center justify-between p-3 cursor-pointer ${
                                currentTrack === index && isVideoOpen ? "bg-muted" : ""
                              }`}
                              onClick={() => playTrackVideo(index)}
                            >
                              <div className="flex items-center space-x-4">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                >
                                  {currentTrack === index && isVideoOpen ? (
                                    <Pause className="h-4 w-4" />
                                  ) : (
                                    <Play className="h-4 w-4" />
                                  )}
                                </Button>
                                <div>
                                  <p className="font-medium">{track.title}</p>
                                  <p className="text-sm text-muted-foreground">
                                    Track {index + 1}
                                    {hasYouTube && (
                                      <span className="ml-1 text-green-500">• YouTube</span>
                                    )}
                                    {debugInfo && track.id && (
                                      <span className="ml-1 text-xs text-muted-foreground">
                                        ID: {track.id} 
                                        {trackYtId && ` (YT: ${trackYtId.substring(0, 6)}...)`}
                                      </span>
                                    )}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <span className="text-muted-foreground">{track.duration}</span>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={(e) => toggleTrackDetails(index, e)}
                                >
                                  {expandedTrack === index ? (
                                    <ChevronUp className="h-4 w-4" />
                                  ) : (
                                    <ChevronDown className="h-4 w-4" />
                                  )}
                                </Button>
                              </div>
                            </div>
                            
                            {/* Expanded track details (lyrics and credits) */}
                            {expandedTrack === index && (
                              <div className="p-3 pt-0 border-t border-border bg-muted/30">
                                <div className="grid md:grid-cols-2 gap-4">
                                  {/* Lyrics section */}
                                  <div className="space-y-2">
                                    <h4 className="font-medium text-sm">Lyrics</h4>
                                    {details?.lyrics ? (
                                      <div className="text-sm text-muted-foreground whitespace-pre-wrap">
                                        {details.lyrics}
                                      </div>
                                    ) : (
                                      <p className="text-sm text-muted-foreground italic">No lyrics available</p>
                                    )}
                                  </div>
                                  
                                  {/* Credits section */}
                                  <div className="space-y-2">
                                    <h4 className="font-medium text-sm">Credits</h4>
                                    {details?.credits && details.credits.length > 0 ? (
                                      <div className="grid gap-2">
                                        {details.credits.map((credit: TrackCredit, credIndex: number) => (
                                          <div key={credIndex} className="flex items-center space-x-2">
                                            <Music className="h-3 w-3 text-muted-foreground" />
                                            <div>
                                              <p className="text-sm font-medium">{credit.name}</p>
                                              <p className="text-xs text-muted-foreground">{credit.role}</p>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    ) : (
                                      <p className="text-sm text-muted-foreground italic">No credits available</p>
                                    )}
                                  </div>
                                </div>
                              </div>
                            )}
                          </motion.div>
                        );
                      })
                    ) : (
                      <p className="text-center py-4 text-muted-foreground">No tracks available for this album</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Credits */}
              <Card>
                <CardHeader>
                  <CardTitle>Credits</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Array.isArray(album.credits) && album.credits.length > 0 ? (
                      album.credits.map((credit, index) => (
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
                      ))
                    ) : (
                      <p className="text-center col-span-2 py-4 text-muted-foreground">No credits information available</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* YouTube dialog */}
      <YouTubeDialog
        videoId={activeVideoId}
        isOpen={isVideoOpen}
        onClose={() => setIsVideoOpen(false)}
      />
    </div>
  );
}