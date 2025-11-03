"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Loading from "../loading";
import Link from "next/link";
import { toast } from "@/components/ui/use-toast";
import { format } from "date-fns";

// Define the interface for Blog posts based on your schema
interface BlogPost {
  id: number;
  title: string;
  category: string;
  imageName?: string;
  imageData?: Uint8Array;
  imageMimeType?: string;
  excerpt?: string;
  content: string;
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/blog?published=true");
        
        if (!response.ok) {
          throw new Error("Failed to fetch blog posts");
        }
        
        const data = await response.json();
        setPosts(data.posts || []);
      } catch (error) {
        console.error("Error fetching blog posts:", error);
        toast({
          title: "Error",
          description: "Failed to load blog posts",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchPosts();
  }, []);

  if (isLoading) {
    return <Loading />;
  }

  if (posts.length === 0) {
    return (
      <div className="container mx-auto py-12 px-4">
        <h1 className="text-4xl font-bold mb-12">Blog</h1>
        <div className="text-center py-12">
          <p className="text-muted-foreground">No blog posts available.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-12 px-4">
      <h1 className="text-4xl font-bold mb-12">Blog</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {posts.map(post => (
          <Card key={post.id} className="overflow-hidden flex flex-col">
            <div 
              className="h-48 bg-cover bg-center" 
              style={{ 
                backgroundImage: post.imageData 
                  ? `url(/api/blog/image/${post.id})` 
                  : "url(https://placehold.co/600x400?text=No+Image)" 
              }}
            />
            <CardContent className="pt-6 flex-grow">
              <div className="text-sm text-muted-foreground mb-2 flex items-center justify-between">
                <span>{post.category}</span>
                <span>{format(new Date(post.createdAt), "MMM d, yyyy")}</span>
              </div>
              <h2 className="text-xl font-bold mb-2">{post.title}</h2>
              <p className="text-muted-foreground line-clamp-3">
                {post.excerpt || post.content.substring(0, 150) + "..."}
              </p>
            </CardContent>
            <CardFooter className="border-t pt-4">
              <Link href={`/blog/${post.id}`} className="w-full">
                <Button variant="outline" className="w-full">Read More</Button>
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}