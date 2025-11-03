"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, Edit, Trash, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { toast } from "@/components/ui/use-toast";
import { format } from "date-fns";
import Loading from "../../loading";

export default function AdminBlogPage() {
  // Initialize toast
  const [searchQuery, setSearchQuery] = useState("");
  const [posts, setPosts] = useState<{ id: string; title: string; category: string; createdAt: string; published: boolean; excerpt?: string; imageData?: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteInProgress, setDeleteInProgress] = useState<string | null>(null);

  // Fetch blog posts from the API
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/blog");
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
  }, [toast]);

  // Delete blog post
  const handleDelete = async (id: string) => {
    // Confirm before deletion
    if (!confirm("Are you sure you want to delete this post? This cannot be undone.")) {
      return;
    }

    setDeleteInProgress(id);
    try {
      const response = await fetch(`/api/blog/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete blog post");
      }

      // Remove the deleted post from the state
      setPosts((prev) => prev.filter((post) => post.id !== id));
      
      toast({
        title: "Success",
        description: "Blog post deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting blog post:", error);
      toast({
        title: "Error",
        description: "Failed to delete blog post",
        variant: "destructive",
      });
    } finally {
      setDeleteInProgress(null);
    }
  };

  const filteredPosts = posts.filter(post =>
    post.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Format the date from ISO to readable format
  const formatPostDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMMM d, yyyy");
    } catch {
      return "Unknown date";
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
        <h1 className="text-3xl font-bold">Blog Posts</h1>
      </div>

      <div className="flex justify-end">
        <Link href="/admin/blog/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Post
          </Button>
        </Link>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search posts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {isLoading ? (
        <Loading />
      ) : filteredPosts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No blog posts found.</p>
          {searchQuery && (
            <p className="text-sm text-muted-foreground mt-2">
              Try adjusting your search query.
            </p>
          )}
        </div>
      ) : (
        <div className="grid gap-6">
          {filteredPosts.map((post, index) => (
            <motion.div
              key={post.id}
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
                        backgroundImage: post.imageData 
                          ? `url(/api/blog/image/${post.id})` 
                          : "url(https://placehold.co/600x400?text=No+Image)" 
                      }}
                    />
                    <div className="space-y-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="text-sm text-muted-foreground">{post.category}</span>
                            <span className="text-sm text-muted-foreground">•</span>
                            <span className="text-sm text-muted-foreground">{formatPostDate(post.createdAt)}</span>
                            {post.published ? (
                              <span className="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded">Published</span>
                            ) : (
                              <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-0.5 rounded">Draft</span>
                            )}
                          </div>
                          <h3 className="text-xl font-semibold">{post.title}</h3>
                          <p className="text-muted-foreground mt-2">{post.excerpt || "No excerpt available"}</p>
                        </div>
                        <div className="flex gap-2">
                          <Link href={`/admin/blog/edit/${post.id}`}>
                            <Button variant="outline" size="icon">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button 
                            variant="outline" 
                            size="icon" 
                            className="text-destructive"
                            onClick={() => handleDelete(post.id)}
                            disabled={deleteInProgress === post.id}
                          >
                            {deleteInProgress === post.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                      <div className="flex justify-end pt-4 border-t">
                        <Link href={`/admin/blog/view/${post.id}`}>
                          <Button variant="outline">View Post</Button>
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