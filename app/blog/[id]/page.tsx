"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, User } from "lucide-react";
import Link from "next/link";
import { toast } from "@/components/ui/use-toast";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";
import { useParams } from "next/navigation";
import Loading from "../../loading";

// Define interface for Blog post based on the schema
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

export default function BlogPostPage() {
  const params = useParams();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const id = params.id;
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

    if (params.id) {
      fetchPost();
    }
  }, [params.id]);

  if (isLoading) {
    return <Loading />;
  }

  if (!post) {
    return (
      <div className="container max-w-4xl mx-auto py-12 px-4">
        <div className="text-center py-20">
          <h2 className="text-2xl font-bold mb-4">Post Not Found</h2>
          <p className="text-muted-foreground mb-8">
            The blog post you&apos;re looking for doesn&apos;t exist or has been removed.
          </p>
          <Link href="/blog">
            <Button>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Blog
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto py-12 px-4">
      <Link href="/blog">
        <Button variant="ghost" className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Blog
        </Button>
      </Link>

      <article className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
          <div className="flex items-center text-muted-foreground">
            <Calendar className="mr-2 h-4 w-4" />
            <time dateTime={post.createdAt}>
              {format(new Date(post.createdAt), "MMMM d, yyyy")}
            </time>
            <span className="mx-2">•</span>
            <span>{post.category}</span>
          </div>
        </div>

        {post.imageData && (
          <div className="aspect-video w-full overflow-hidden rounded-lg">
            <img 
              src={`/api/blog/image/${post.id}`} 
              alt={post.title}
              className="w-full h-full object-cover" 
            />
          </div>
        )}

        {post.excerpt && (
          <div className="text-lg font-medium text-muted-foreground italic border-l-4 border-primary pl-4">
            {post.excerpt}
          </div>
        )}

        <div className="prose prose-lg max-w-none">
          {/* Render the content with proper formatting */}
          {post.content.split("\n").map((paragraph: string, idx: number) => (
            <p key={idx}>{paragraph}</p>
          ))}
        </div>
      </article>
    </div>
  );
}