"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, Send } from "lucide-react";

// Define interfaces for proper type checking
interface Review {
  id: number;
  user: string;
  avatar: string;
  review: string;
  rating: number;
  timestamp: string;
}

interface StarRatingProps {
  value: number;
  onSelect: (rating: number) => void;
  onHover: (rating: number) => void;
  size?: number;
}

const reviews: Review[] = [
  {
    id: 1,
    user: "Alex Thompson",
    avatar: "https://images.unsplash.com/photo-1463453091185-61582044d556?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
    review: "Absolutely incredible performance! The energy was electric and the new songs sound amazing live.",
    rating: 5,
    timestamp: "2 days ago",
  },
  {
    id: 2,
    user: "Sarah Chen",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
    review: "The acoustic set was particularly moving. Such a talented group of musicians!",
    rating: 4,
    timestamp: "1 week ago",
  },
  {
    id: 3,
    user: "Marcus Rodriguez",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
    review: "Been following the Team for years and they keep getting better. The new album is a masterpiece!",
    rating: 5,
    timestamp: "2 weeks ago",
  },
];

export default function ReviewsPage() {
  const [newReview, setNewReview] = useState("");
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);

  const handleSubmitReview = () => {
    if (newReview.trim() && rating > 0) {
      // Here you would typically send the review to your backend
      console.log("Submitting review:", { review: newReview, rating });
      setNewReview("");
      setRating(0);
    }
  };

  const StarRating = ({ value, onSelect, onHover, size = 5 }: StarRatingProps) => {
    return (
      <div className="flex space-x-1">
        {[...Array(size)].map((_, index) => (
          <button
            key={index}
            className="focus:outline-none"
            onClick={() => onSelect(index + 1)}
            onMouseEnter={() => onHover(index + 1)}
            onMouseLeave={() => onHover(0)}
          >
            <Star
              className={`h-6 w-6 ${
                (hoverRating || value) > index
                  ? "text-yellow-400 fill-current"
                  : "text-gray-300"
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#C3E0DB] py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold tracking-tight text-primary sm:text-5xl mb-4">
            Fan Reviews
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Share your experience and read what other fans have to say
          </p>
        </motion.div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Write a Review</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Your Rating</label>
                <StarRating
                  value={rating}
                  onSelect={setRating}
                  onHover={setHoverRating}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Your Review</label>
                <Textarea
                  placeholder="Share your thoughts..."
                  value={newReview}
                  onChange={(e) => setNewReview(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>
              <Button
                onClick={handleSubmitReview}
                disabled={!newReview.trim() || rating === 0}
              >
                <Send className="mr-2 h-4 w-4" />
                Submit Review
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          {reviews.map((review, index) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <Avatar>
                      <AvatarImage src={review.avatar} />
                      <AvatarFallback>{review.user[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{review.user}</p>
                          <div className="flex items-center space-x-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < review.rating
                                    ? "text-yellow-400 fill-current"
                                    : "text-gray-300"
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {review.timestamp}
                        </span>
                      </div>
                      <p className="text-muted-foreground">{review.review}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}