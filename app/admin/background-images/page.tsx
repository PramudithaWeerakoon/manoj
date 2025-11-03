"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/components/ui/use-toast";
import { 
  ArrowLeft, 
  Plus, 
  Upload, 
  Trash,
  Image as ImageIcon, 
  X, 
  MoveUp,
  MoveDown,
  Loader2
} from "lucide-react";
import Link from "next/link";

interface BackgroundImage {
  id: number;
  title?: string;
  imageUrl: string;
  order: number;
  isActive: boolean;
  createdAt: string;
}

export default function BackgroundImagesPage() {
  // Initialize toast
  const [images, setImages] = useState<BackgroundImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [imageTitle, setImageTitle] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [deleteInProgress, setDeleteInProgress] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  // Fetch all background images
  useEffect(() => {
    async function fetchImages() {
      try {
        setIsLoading(true);
        // Add all=true parameter to include inactive images and cache busting timestamp
        const response = await fetch(`/api/background-images?all=true&t=${Date.now()}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch background images');
        }
        
        const data = await response.json();
        setImages(data.images || []);
      } catch (error) {
        console.error('Error fetching background images:', error);
        toast({
          title: 'Error',
          description: 'Failed to load background images',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    }

    fetchImages();
  }, [toast]);

  // Handle image selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Remove selected image
  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  // Upload new image
  const handleUpload = async () => {
    if (!imageFile) {
      toast({
        title: 'Validation Error',
        description: 'Please select an image to upload',
        variant: 'destructive',
      });
      return;
    }

    setIsUploading(true);
    try {
      // Create FormData object
      const formData = new FormData();
      formData.append('title', imageTitle || 'Hero Background');
      formData.append('image', imageFile);
      formData.append('order', images.length.toString());
      
      const response = await fetch('/api/background-images', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload image');
      }

      const result = await response.json();
      
      toast({
        title: 'Success',
        description: 'Background image uploaded successfully',
      });
      
      // Refresh the image list with cache busting
      const updatedResponse = await fetch(`/api/background-images?all=true&t=${Date.now()}`);
      const updatedData = await updatedResponse.json();
      setImages(updatedData.images || []);
      
      // Update the hero section
      if (window.refreshHeroImages && typeof window.refreshHeroImages === 'function') {
        window.refreshHeroImages();
      }
      
      // Reset form
      handleRemoveImage();
      setImageTitle('');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: 'Error',
        description: 'Failed to upload image',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };
  // Handle image deletion
  const handleDelete = async (imageId: number) => {
    if (!confirm('Are you sure you want to delete this image? This action cannot be undone.')) {
      return;
    }

    setDeleteInProgress(imageId);
    try {
      const response = await fetch(`/api/background-images/${imageId}`, {
        method: 'DELETE',
        headers: {
          'Cache-Control': 'no-cache'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete image');
      }

      // Get the result
      const result = await response.json();
      
      // Remove the deleted image from state
      setImages((prev) => prev.filter((img) => img.id !== imageId));
      
      // Update the hero section by refreshing the window in hero-section.tsx
      // This will force the hero component to refetch images from the API
      if (window.refreshHeroImages && typeof window.refreshHeroImages === 'function') {
        window.refreshHeroImages();
      }
      
      toast({
        title: 'Success',
        description: 'Background image deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting image:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete image',
        variant: 'destructive',
      });
    } finally {
      setDeleteInProgress(null);
    }
  };
  // Toggle image active status
  const handleToggleActive = async (imageId: number, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/background-images/${imageId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
        },
        body: JSON.stringify({
          isActive: !currentStatus,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update image status');
      }

      // Update the image status in state
      setImages((prev) => 
        prev.map((img) => 
          img.id === imageId 
            ? { ...img, isActive: !currentStatus } 
            : img
        )
      );
      
      // Refresh the hero section
      if (window.refreshHeroImages && typeof window.refreshHeroImages === 'function') {
        window.refreshHeroImages();
      }
      
      toast({
        title: 'Success',
        description: `Image ${!currentStatus ? 'activated' : 'deactivated'} successfully`,
      });
    } catch (error) {
      console.error('Error updating image status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update image status',
        variant: 'destructive',
      });
    }
  };
  // Change image order
  const handleChangeOrder = async (imageId: number, direction: 'up' | 'down') => {
    const currentIndex = images.findIndex(img => img.id === imageId);
    if (
      (direction === 'up' && currentIndex === 0) || 
      (direction === 'down' && currentIndex === images.length - 1)
    ) {
      return; // Already at the top/bottom
    }

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    const targetImage = images[newIndex];
    
    try {
      // Update current image order
      await fetch(`/api/background-images/${imageId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
        },
        body: JSON.stringify({
          order: targetImage.order,
        }),
      });
      
      // Update target image order
      await fetch(`/api/background-images/${targetImage.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
        },
        body: JSON.stringify({
          order: images[currentIndex].order,
        }),
      });

      // Update the images in state to reflect the new order
      const updatedImages = [...images];
      [updatedImages[currentIndex], updatedImages[newIndex]] = [updatedImages[newIndex], updatedImages[currentIndex]];
      
      // Update orders to match index
      const reorderedImages = updatedImages.map((img, idx) => ({
        ...img,
        order: idx
      }));
      
      setImages(reorderedImages);
      
      // Refresh the hero section to reflect the new order
      if (window.refreshHeroImages && typeof window.refreshHeroImages === 'function') {
        window.refreshHeroImages();
      }
      
      toast({
        title: 'Success',
        description: 'Image order updated successfully',
      });
    } catch (error) {
      console.error('Error updating image order:', error);
      toast({
        title: 'Error',
        description: 'Failed to update image order',
        variant: 'destructive',
      });
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
        <h1 className="text-3xl font-bold">Hero Background Images</h1>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Upload New Background Image</h2>
            <div className="space-y-2">
              <Label htmlFor="imageTitle">Image Title (Optional)</Label>
              <Input
                id="imageTitle"
                value={imageTitle}
                onChange={(e) => setImageTitle(e.target.value)}
                placeholder="Enter image title"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="imageUpload">Image</Label>
              <div className="flex items-center space-x-4">
                <Input
                  id="imageUpload"
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  accept="image/*"
                  className="flex-1"
                />
                {imageFile && (
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={handleRemoveImage}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
              {imagePreview && (
                <div className="mt-4 relative">
                  <img
                    src={imagePreview}
                    alt="Image Preview"
                    className="h-40 w-full object-cover rounded-md"
                  />
                </div>
              )}
            </div>
            <div className="flex justify-end">
              <Button onClick={handleUpload} disabled={isUploading || !imageFile}>
                {isUploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Image
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Manage Background Images</h2>
        <p className="text-sm text-muted-foreground">
          Images will be displayed in the hero section as a slideshow. Active images will be included in the rotation.
        </p>

        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Loading background images...</span>
          </div>
        ) : images.length === 0 ? (
          <div className="text-center py-12">
            <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground" />
            <p className="mt-4 text-muted-foreground">No background images found. Upload your first image above.</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {images.map((image, index) => (
              <motion.div
                key={image.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card>
                  <CardContent className="p-6">                    <div className="grid md:grid-cols-[200px,1fr] gap-6">                      <div
                        className="h-40 bg-cover bg-center rounded-lg"
                        style={{ backgroundImage: `url(${image.imageUrl.startsWith('data:') ? image.imageUrl : `${image.imageUrl}${image.imageUrl.includes('?') ? '&' : '?'}t=${Date.now()}`})` }}
                      />
                      <div className="space-y-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-xl font-semibold">{image.title || 'Hero Background'}</h3>
                            <div className="flex items-center mt-2 text-muted-foreground">
                              <span className="text-sm">
                                {new Date(image.createdAt).toLocaleDateString()}
                              </span>
                              <span className="mx-2">•</span>
                              <span className={`text-sm ${image.isActive ? 'text-green-600' : 'text-amber-600'}`}>
                                {image.isActive ? 'Active' : 'Inactive'}
                              </span>
                              <span className="mx-2">•</span>
                              <span className="text-sm">
                                Order: {image.order + 1}
                              </span>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleChangeOrder(image.id, 'up')}
                              disabled={index === 0}
                            >
                              <MoveUp className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleChangeOrder(image.id, 'down')}
                              disabled={index === images.length - 1}
                            >
                              <MoveDown className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              className="text-destructive"
                              onClick={() => handleDelete(image.id)}
                              disabled={deleteInProgress === image.id}
                            >
                              {deleteInProgress === image.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Label htmlFor={`active-${image.id}`}>
                            {image.isActive ? 'Active' : 'Inactive'}:
                          </Label>
                          <Switch
                            id={`active-${image.id}`}
                            checked={image.isActive}
                            onCheckedChange={() => handleToggleActive(image.id, image.isActive)}
                          />
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
    </div>
  );
}
