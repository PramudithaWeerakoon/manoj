"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, Edit, Trash, Album as AlbumIcon, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { toast } from "@/components/ui/use-toast";

// Define album interface
interface Album {
  id: string;
  title: string;
  release_date: string;
  tracks?: {
    id: string;
    title: string;
    duration?: string;
  }[];
}

export default function AlbumsPage() {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  
  // Fetch albums when the component mounts
  useEffect(() => {
    async function fetchAlbums() {
      try {
        setIsLoading(true);
        const response = await fetch('/api/albums');
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          console.error('API Error Response:', errorData);
          throw new Error(errorData?.details || 'Failed to fetch albums');
        }
        
        const data = await response.json();
        
        if (!data.albums || !Array.isArray(data.albums)) {
          console.error('Invalid data format received:', data);
          throw new Error('Invalid album data received from server');
        }
        
        setAlbums(data.albums);
      } catch (error: unknown) {
        console.error('Error fetching albums:', error);
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to load albums",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchAlbums();
  }, []);

  const filteredAlbums = albums.filter(album =>
    album.title.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Handle album deletion
  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this album?")) {
      try {
        const response = await fetch(`/api/albums/${id}`, {
          method: 'DELETE'
        });
        
        if (!response.ok) {
          throw new Error('Failed to delete album');
        }
        
        // Remove from state
        setAlbums(albums.filter(album => album.id !== id));
        
        toast({
          title: "Success",
          description: "Album deleted successfully"
        });
      } catch (error: unknown) {
        console.error('Error deleting album:', error);
        toast({
          title: "Error",
          description: "Failed to delete album",
          variant: "destructive"
        });
      }
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
        <h1 className="text-3xl font-bold">Albums</h1>
      </div>

      <div className="flex justify-end">
        <Link href="/admin/music/albums/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Album
          </Button>
        </Link>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search albums..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filteredAlbums.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          {searchQuery ? "No albums match your search" : "No albums found. Add your first album!"}
        </div>
      ) : (
        <div className="grid gap-6">
          {filteredAlbums.map((album, index) => (
            <motion.div
              key={album.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card>
                <CardContent className="p-6">
                  <div className="grid md:grid-cols-[200px,1fr] gap-6">
                    <div
                      className="h-40 bg-cover bg-center rounded-lg"
                      style={{ 
                        backgroundImage: `url(/api/albums/${album.id}/cover?t=${Date.now()})` 
                      }}
                    />
                    <div className="space-y-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-xl font-semibold">{album.title}</h3>
                          <div className="flex items-center mt-2 text-muted-foreground">
                            <AlbumIcon className="h-4 w-4 mr-2" />
                            <span>{album.tracks?.length || 0} tracks</span>
                            <span className="mx-2">•</span>
                            <span>{new Date(album.release_date).getFullYear()}</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Link href={`/admin/music/albums/edit/${album.id}`}>
                            <Button variant="outline" size="icon">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button 
                            variant="outline" 
                            size="icon" 
                            className="text-destructive"
                            onClick={() => handleDelete(album.id)}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="flex justify-end pt-4 border-t">
                        <Link href={`/albums/${album.id}`}>
                          <Button variant="outline">View Details</Button>
                        </Link>
                      </div>
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