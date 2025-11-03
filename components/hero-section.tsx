"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

// Extend the Window interface to include refreshHeroImages
declare global {
  interface Window {
    refreshHeroImages?: () => void;
  }
}

interface BackgroundImage {
  id: number;
  title?: string;
  imageUrl: string;
  blurDataUrl?: string; // New property for blur placeholder
  order: number;
}

export function HeroSection() {
  const [backgroundImages, setBackgroundImages] = useState<BackgroundImage[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [timestamp, setTimestamp] = useState(Date.now());

  // Function to fetch background images with cache busting
  const fetchBackgroundImages = useCallback(async () => {
    try {
      setIsLoading(true);
      // Add cache busting timestamp to the query
      const response = await fetch(`/api/background-images?t=${Date.now()}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Fetched background images:', data.images?.length || 0);
        
        if (data.images && data.images.length > 0) {
          // Ensure we don't modify the data URLs in any way
          const processedImages = data.images.map((img: BackgroundImage) => ({
            ...img,
            // Remove any timestamp parameters that might have been appended to data URLs
            imageUrl: img.imageUrl.startsWith('data:') && img.imageUrl.includes('?') 
              ? img.imageUrl.split('?')[0] 
              : img.imageUrl
          }));
          setBackgroundImages(processedImages);
          setTimestamp(Date.now()); // Update timestamp for cache busting
        } else {
          console.warn('No background images returned from API');
        }
      } else {
        console.error('Failed to fetch background images:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error fetching background images:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Expose the refresh function to the window for cross-component access
  useEffect(() => {
    // Make the function available globally
    window.refreshHeroImages = fetchBackgroundImages;
    
    return () => {
      window.refreshHeroImages = undefined;
    };
  }, [fetchBackgroundImages]);

  // Fetch background images on component mount and set up auto-refresh
  useEffect(() => {
    fetchBackgroundImages();
    
    // Set up an auto-refresh interval to check for new images every 30 seconds
    const refreshInterval = setInterval(() => {
      fetchBackgroundImages();
    }, 30000);
    
    return () => clearInterval(refreshInterval);
  }, [fetchBackgroundImages]);

  // Slideshow effect for multiple images
  useEffect(() => {
    if (backgroundImages.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentImageIndex(current => (current + 1) % backgroundImages.length);
    }, 7000); // Change image every 7 seconds
    
    return () => clearInterval(interval);
  }, [backgroundImages.length]);

  // Default background image if none from database
  const defaultBackgroundImage = "https://images.unsplash.com/photo-1501612780327-45045538702b?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=75";
    // Current background image with cache-busting timestamp - properly handle data URLs
  const currentBackground = backgroundImages.length > 0 
    ? backgroundImages[currentImageIndex].imageUrl.startsWith('data:') 
      ? backgroundImages[currentImageIndex].imageUrl  // Don't add timestamp to data URLs
      : `${backgroundImages[currentImageIndex].imageUrl}${backgroundImages[currentImageIndex].imageUrl.includes('?') ? '&' : '?'}t=${timestamp}`
    : defaultBackgroundImage;

  // Current blur placeholder
  const currentBlurPlaceholder = backgroundImages.length > 0 
    ? backgroundImages[currentImageIndex].blurDataUrl
    : undefined;

  return (
    <section className="relative h-[90vh] w-full flex items-center justify-center overflow-hidden">
      {/* Background image with Next.js Image for optimization */}
      <div className="absolute inset-0 w-full h-full">
        <motion.div
          key={`${currentImageIndex}-${timestamp}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.5 }}
          className="relative w-full h-full"
        >
          {currentBackground && (
            <Image
              src={currentBackground}
              alt="Background image"
              fill
              priority={true}
              sizes="100vw"
              quality={80}
              placeholder={currentBlurPlaceholder ? "blur" : "empty"}
              blurDataURL={currentBlurPlaceholder}
              style={{
                objectFit: "cover",
                objectPosition: "center",
              }}
            />
          )}
          {/* Dark overlay */}
          <div className="absolute inset-0 bg-black/50" />
        </motion.div>
      </div>

      {/* Content wrapper with proper z-index */}
      <div className="relative z-10 text-center px-4 sm:px-6 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-custom-white mb-6">
            Experience the Sound of Tomorrow
          </h1>
          <p className="text-xl text-gray-200 mb-8 max-w-2xl mx-auto">
            Join us on a musical journey that transcends boundaries and connects souls.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">  
            
            <Link href="/events">
              <Button size="lg" variant="outline" className="text-black border-black hover:bg-custom-white/20 w-full sm:w-auto">
                Explore Our Music
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}