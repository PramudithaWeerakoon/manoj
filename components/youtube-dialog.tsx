"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useEffect, useState } from "react";

interface YouTubeDialogProps {
  videoId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function YouTubeDialog({ videoId, isOpen, onClose }: YouTubeDialogProps) {
  const [embeddedVideoId, setEmbeddedVideoId] = useState("");
  
  // Only update the embedded video ID when we get a new valid ID
  useEffect(() => {
    if (videoId && videoId.trim() !== '') {
      console.log(`Setting YouTube dialog video ID to: ${videoId}`);
      setEmbeddedVideoId(videoId.trim());
    }
  }, [videoId]);
  
  // Debug logging when opening/closing
  useEffect(() => {
    if (isOpen) {
      console.log(`Opening YouTube dialog with video ID: ${embeddedVideoId}`);
    } else {
      console.log("Closing YouTube dialog");
    }
  }, [isOpen, embeddedVideoId]);
  
  // Track errors
  const [hasError, setHasError] = useState(false);
  
  if (!embeddedVideoId && isOpen) {
    console.warn("Attempted to open YouTube dialog with no video ID");
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] p-0">
        <DialogHeader className="p-4 flex flex-row justify-between items-center">
          <DialogTitle>
            {hasError ? "Error Loading Video" : "YouTube Video"}
          </DialogTitle>
        </DialogHeader>
        <div className="aspect-video bg-black">
          {isOpen && embeddedVideoId && (
            <iframe
              key={embeddedVideoId} // Force iframe refresh when ID changes
              width="100%"
              height="100%"
              src={`https://www.youtube.com/embed/${embeddedVideoId}?autoplay=1`}
              title="YouTube video player"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              onError={() => setHasError(true)}
              onLoad={() => setHasError(false)}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}