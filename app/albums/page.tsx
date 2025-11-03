"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Calendar, Clock, Music } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { YouTubeDialog } from "@/components/youtube-dialog";
import Image from "next/image";
import Loading from "@/app/loading"; // Import the main Loading component

// Updated Album interface to match the API response
interface Track {
  title: string;
  duration: string;
}

interface Album {
  id: number;
  title: string;
  releaseDate: string;
  coverImageUrl: string; // Changed to match database image URL pattern
  description: string;
  tracks: Track[];
  youtubeId: string;
}

// Add interface for API response data
interface ApiAlbum {
  id: number;
  title: string;
  release_date?: string;
  description?: string;
  youtube_id?: string;
  tracks: ApiTrack[];
}

interface ApiTrack {
  title: string;
  duration?: string;
}

export default function AlbumsPage() {
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch albums from the API
  useEffect(() => {
    async function fetchAlbums() {
      try {
        setLoading(true);
        const response = await fetch('/api/albums');

        if (!response.ok) {
          throw new Error('Failed to fetch albums');
        }

        const data = await response.json();

        // Format the albums data for the frontend
        const formattedAlbums = data.albums.map((album: ApiAlbum) => ({
          id: album.id,
          title: album.title,
          releaseDate: album.release_date ? new Date(album.release_date).getFullYear().toString() : 'Unknown',
          coverImageUrl: `/api/albums/${album.id}/cover?t=${Date.now()}`,
          description: album.description || '',
          tracks: album.tracks.map((track: ApiTrack) => ({
            title: track.title,
            duration: track.duration || ''
          })),
          youtubeId: album.youtube_id || ''
        }));

        setAlbums(formattedAlbums);
      } catch (err) {
        console.error('Error fetching albums:', err);
        setError('Failed to load albums');
      } finally {
        setLoading(false);
      }
    }

    fetchAlbums();
  }, []);

  return (
    <div className="min-h-screen bg-[#C3E0DB] py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold tracking-tight text-primary sm:text-5xl mb-4">
            Our Albums
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Explore our discography and musical journey
          </p>
          {error && (
            <p className="mt-4 text-red-500">{error}</p>
          )}
        </motion.div>

        {loading ? (
          <Loading /> // Use the main Loading component
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {albums.map((album, index) => (
              <motion.div
                key={album.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="h-64 w-full relative">
                    <Image
                      src={album.coverImageUrl || '/placeholder-album.jpg'}
                      alt={album.title}
                      fill
                      loading={index < 3 ? "eager" : "lazy"} 
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover"
                      quality={75}
                      placeholder="blur"
                      blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+P+/HgAEUQJKXeKhBQAAAABJRU5ErkJggg=="
                    />
                  </div>
                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      <CardTitle>{album.title}</CardTitle>
                      <span className="text-sm text-muted-foreground">{album.releaseDate}</span>
                    </div>
                    <p className="text-muted-foreground">{album.description}</p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        {album.tracks.slice(0, 2).map((track, i) => (
                          <div
                            key={i}
                            className="flex items-center justify-between p-2 rounded-lg hover:bg-muted"
                          >
                            <div className="flex items-center space-x-3">
                              <Music className="h-4 w-4 text-muted-foreground" />
                              <span>{track.title}</span>
                            </div>
                            <span className="text-sm text-muted-foreground">{track.duration}</span>
                          </div>
                        ))}
                        {album.tracks.length > 2 && (
                          <p className="text-sm text-muted-foreground text-center">
                            +{album.tracks.length - 2} more tracks
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          className="flex-1"
                          onClick={() => setSelectedVideo(album.youtubeId)}
                          disabled={!album.youtubeId}
                        >
                          <Play className="mr-2 h-4 w-4" />
                          Listen Now
                        </Button>
                        <Link href={`/albums/${album.id}`} className="flex-1">
                          <Button variant="outline" className="w-full">
                            View Details
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <YouTubeDialog
        videoId={selectedVideo || ""}
        isOpen={!!selectedVideo}
        onClose={() => setSelectedVideo(null)}
      />
    </div>
  );
}