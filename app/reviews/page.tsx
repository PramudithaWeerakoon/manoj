"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { Star, Loader2, PenSquare, UserCircle } from "lucide-react";
import Link from "next/link";
import { Pagination } from "@/components/ui/pagination";

interface Review {
  id: number;
  title: string;
  content: string;
  rating: number;
  createdAt: string;
  user: {
    name: string;
  };
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const ITEMS_PER_PAGE = 9;

  // Fetch reviews from the API
  useEffect(() => {
    async function fetchReviews() {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/reviews?page=${currentPage}&limit=${ITEMS_PER_PAGE}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch reviews');
        }
        
        const data = await response.json();
        setReviews(data.reviews || []);
        setTotalPages(Math.ceil((data.total || 0) / ITEMS_PER_PAGE));
      } catch (error) {
        console.error('Error fetching reviews:', error);
        toast({
          title: 'Error',
          description: 'Failed to load reviews',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    }

    fetchReviews();
  }, [toast, currentPage]);

  // Check if user is logged in
  useEffect(() => {
    async function checkAuth() {
      try {
        const response = await fetch('/api/auth/me');
        setIsUserLoggedIn(response.ok);
      } catch (error) {
        console.error('Error checking auth:', error);
      }
    }

    checkAuth();
  }, []);

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Render star rating
  const renderStars = (rating: number) => {
    return (
      <div className="flex">
        {[...Array(5)].map((_, i) => (
          <Star 
            key={i} 
            className={`h-4 w-4 ${i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} 
          />
        ))}
      </div>
    );
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  return (
    <div className="mx-auto bg-[#C3E0DB] py-12 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl font-bold mb-4">Fan Reviews</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          See what our fans have to say about Radioo Music
        </p>
      </motion.div>

      <div className="flex justify-end mb-8]">
        <Link href={isUserLoggedIn ? "/reviews/write" : "/auth/login?redirect=/reviews/write"}>
          <Button className="gap-2">
            <PenSquare className="h-4 w-4" />
            Write a Review
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="flex flex-col justify-center items-center py-20">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <span className="text-lg">Loading reviews...</span>
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-20">
          <div className="inline-block p-4 rounded-full bg-muted mb-6">
            <Star className="h-12 w-12 text-muted-foreground" />
          </div>
          <h2 className="text-2xl font-bold mb-2">No Reviews Yet</h2>
          <p className="text-muted-foreground mb-6">Be the first to share your thoughts!</p>
          <Link href={isUserLoggedIn ? "/reviews/write" : "/auth/login?redirect=/reviews/write"}>
            <Button size="lg">Write a Review</Button>
          </Link>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {reviews.map((review, index) => (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full flex flex-col">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <h2 className="text-xl font-bold mb-2">{review.title}</h2>
                        {renderStars(review.rating)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {formatDate(review.createdAt)}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-grow flex flex-col">
                    <p className="text-muted-foreground flex-grow">
                      {review.content.length > 200 
                        ? `${review.content.substring(0, 200)}...` 
                        : review.content}
                    </p>
                    <div className="mt-6 flex items-center">
                      <div className="bg-primary/10 p-2 rounded-full mr-3">
                        <UserCircle className="h-5 w-5 text-primary" />
                      </div>
                      <div className="text-sm font-medium">
                        {review.user.name}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
          
          {totalPages > 1 && (
            <div className="flex justify-center mt-12">
              <nav className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                {Array.from({ length: totalPages }).map((_, index) => (
                  <Button
                    key={index + 1}
                    variant={currentPage === index + 1 ? "default" : "outline"}
                    size="sm"
                    onClick={() => handlePageChange(index + 1)}
                  >
                    {index + 1}
                  </Button>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </nav>
            </div>
          )}
        </>
      )}
    </div>
  );
}
