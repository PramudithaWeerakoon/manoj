"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Upload, X, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "@/components/ui/use-toast";
import { useParams } from "next/navigation";
import Loading from "../../../../loading";

const categories = ["Studio Updates", "Tour News", "Interviews", "Behind the Scenes"];

export default function EditBlogPostPage() {
  const router = useRouter();
  // Removed unused showToast variable
  const { id } = useParams();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // States
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    excerpt: "",
    content: "",
    published: false,
  });
  
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [hasExistingImage, setHasExistingImage] = useState(false);

  // Fetch blog post details when component mounts
  useEffect(() => {
    const fetchBlogPost = async () => {
      try {
        setIsFetching(true);
        const response = await fetch(`/api/blog/${id}`);
        
        if (!response.ok) {
          throw new Error("Failed to fetch blog post");
        }
        
        const data = await response.json();
        
        setFormData({
          title: data.title || "",
          category: data.category || "Studio Updates",
          excerpt: data.excerpt || "",
          content: data.content || "",
          published: data.published || false,
        });
        
        // Check if post has an image
        if (data.imageName) {
          setHasExistingImage(true);
          // Set image preview with timestamp to prevent caching
          const timestamp = Date.now();
          setImagePreview(`/api/blog/image/${id}?t=${timestamp}`);
        }
      } catch (error) {
        console.error("Error fetching blog post:", error);
        toast({
          title: "Error",
          description: "Failed to load blog post data",
          variant: "destructive",
        });
        router.push("/admin/blog");
      } finally {
        setIsFetching(false);
      }
    };

    if (id) {
      fetchBlogPost();
    }
  }, [id, toast, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCategoryChange = (category: string) => {
    setFormData((prev) => ({
      ...prev,
      category,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      
      // Create preview URL for the selected image
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setHasExistingImage(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (published = false) => {
    if (!formData.title || !formData.category || !formData.content) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Create FormData object for multipart form submission
      const submitData = new FormData();
      
      // Add all form fields
      Object.keys(formData).forEach(key => {
        submitData.append(key, formData[key as keyof typeof formData].toString());
      });
      
      // Override published status if specified
      submitData.set("published", published.toString());
      
      // Add image file if selected
      if (imageFile) {
        submitData.append("image", imageFile);
      }
      
      // Add flag to indicate if image was removed
      submitData.append("imageRemoved", (!imageFile && !hasExistingImage).toString());
      
      const response = await fetch(`/api/blog/${id}`, {
        method: "PUT",
        body: submitData, // Send as FormData, not JSON
      });

      if (!response.ok) {
        throw new Error("Failed to update blog post");
      }

      toast({
        title: "Success",
        description: published 
          ? "Blog post updated and published" 
          : "Blog post updated as draft",
      });
      
      // Redirect to blog list
      router.push("/admin/blog");
    } catch (error) {
      console.error("Error updating blog post:", error);
      toast({
        title: "Error",
        description: (error as Error).message || "Failed to update blog post",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return <Loading />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Link href="/admin/blog">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Edit Blog Post</h1>
      </div>

      <Card>
        <CardContent className="p-6">
          <form className="space-y-8" onSubmit={(e) => { e.preventDefault(); handleSubmit(formData.published); }}>
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input 
                id="title"
                name="title"
                placeholder="Enter post title" 
                value={formData.title}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Category</Label>
              <Select 
                value={formData.category}
                onValueChange={handleCategoryChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="image">Featured Image</Label>
              <div className="flex flex-col gap-4">
                {imagePreview ? (
                  <div className="relative w-full h-48 border rounded-md overflow-hidden">
                    <img 
                      src={imagePreview} 
                      alt="Preview" 
                      className="w-full h-full object-cover" 
                    />
                    <Button 
                      type="button"
                      variant="destructive" 
                      size="icon" 
                      className="absolute top-2 right-2 h-6 w-6 rounded-full"
                      onClick={handleRemoveImage}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div 
                    className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-md cursor-pointer hover:bg-gray-50"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="h-8 w-8 text-gray-400" />
                    <p className="mt-2 text-sm text-gray-500">Click to upload an image</p>
                  </div>
                )}
                <Input
                  id="image"
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="excerpt">Excerpt</Label>
              <Textarea
                id="excerpt"
                name="excerpt"
                placeholder="Enter a brief excerpt"
                className="min-h-[100px]"
                value={formData.excerpt}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Content</Label>
              <Textarea
                id="content"
                name="content"
                placeholder="Write your blog post content..."
                className="min-h-[300px]"
                value={formData.content}
                onChange={handleChange}
                required
              />
            </div>

            <div className="flex justify-end space-x-4">
              <Button 
                type="button"
                variant="outline"
                onClick={() => router.push("/admin/blog")}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button 
                type="button"
                variant="outline"
                onClick={() => handleSubmit(false)}
                disabled={isLoading}
              >
                Save as Draft
              </Button>
              <Button 
                type="button"
                onClick={() => handleSubmit(true)}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Publish"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
