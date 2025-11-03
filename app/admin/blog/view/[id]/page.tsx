"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit, Clock, Calendar, Tag, Loader2 } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { toast } from "@/components/ui/use-toast";
import { format } from "date-fns";

export default function ViewBlogPost() {
  const { id } = useParams();
  interface BlogPost {
    id: string;
    title: string;
    content: string;
    excerpt?: string;
    createdAt: string;
    category: string;
    published: boolean;
    imageData?: string;
  }
  
  const [post, setPost] = useState<BlogPost | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/blog/${id}`);
        if (!response.ok) {
          throw new Error("Failed to fetch blog post");
        }
        const data = await response.json();
        setPost(data);
      } catch (error) {
        console.error("Error fetching blog post:", error);
        toast({
          title: "Error",
          description: "Failed to load blog post",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchPost();
    }
  }, [id, toast]);

  // Format the date from ISO to readable format
  const formatPostDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMMM d, yyyy");
    } catch {
      return "Unknown date";
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading blog post...</span>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Blog post not found.</p>
        <Link href="/admin/blog" className="mt-4 inline-block">
          <Button variant="outline">Back to Blog List</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/admin/blog">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">View Blog Post</h1>
        </div>
        <Link href={`/admin/blog/edit/${post.id}`}>
          <Button>
            <Edit className="mr-2 h-4 w-4" />
            Edit Post
          </Button>
        </Link>
      </div>

      {post.imageData && (
        <div 
          className="w-full h-64 bg-cover bg-center rounded-lg"
          style={{ backgroundImage: `url(/api/blog/image/${post.id})` }}
        />
      )}

      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
        <div className="flex items-center">
          <Calendar className="mr-1 h-4 w-4" />
          <span>{formatPostDate(post.createdAt)}</span>
        </div>
        <div className="flex items-center">
          <Tag className="mr-1 h-4 w-4" />
          <span>{post.category}</span>
        </div>
        <span className={post.published ? 
          "bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded" : 
          "bg-yellow-100 text-yellow-800 text-xs px-2 py-0.5 rounded"
        }>
          {post.published ? "Published" : "Draft"}
        </span>
      </div>

      <Card>
        <CardContent className="p-6">
          <h2 className="text-2xl font-bold mb-4">{post.title}</h2>
          
          {post.excerpt && (
            <div className="bg-muted p-4 rounded-md italic mb-6">
              {post.excerpt}
            </div>
          )}
          
          <div className="prose max-w-none">
            {/* Render the content with proper formatting */}
            {post.content.split('\n').map((paragraph, i) => (
              <p key={i} className="mb-4">{paragraph}</p>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Link href="/admin/blog">
          <Button variant="outline">Back to Blog List</Button>
        </Link>
        <Link href={`/admin/blog/edit/${post.id}`}>
          <Button>Edit Post</Button>
        </Link>
      </div>
    </div>
  );
}
