"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/use-toast";
import { Loader2, Star, ArrowLeft, PenSquare, AlertCircle, CheckCircle2 } from "lucide-react";
import Link from "next/link";

interface Review {
  id: number;
  title: string;
  content: string;
  rating: number;
  approved: boolean;
  createdAt: string;
}

export default function MyReviewsPage() {
  const router = useRouter();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is authenticated and fetch reviews
  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);
        // Check authentication
        const authResponse = await fetch('/api/auth/me');
        
        if (!authResponse.ok) {
          router.push('/auth/login?redirect=/reviews/my-reviews');
          return;
        }
        
        // Fetch user's reviews
        const reviewsResponse = await fetch('/api/reviews/my-reviews');
        
        if (!reviewsResponse.ok) {
          throw new Error('Failed to fetch reviews');
        }
        
        const data = await reviewsResponse.json();
        setReviews(data.reviews || []);
      } catch (error) {
        console.error('Error:', error);
        toast({
          title: "Error",
          description: "Failed to load your reviews",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchData();
  }, [router, toast]);

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="flex flex-col items-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="mt-2">Loading your reviews...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="mb-6">
        <Link href="/reviews" className="flex items-center text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Reviews
        </Link>
      </div>
      
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">My Reviews</h1>
        <Link href="/reviews/write">
          <Button>
            <PenSquare className="h-4 w-4 mr-2" />
            Write a Review
          </Button>
        </Link>
      </div>
      
      {reviews.length === 0 ? (
        <div className="text-center py-16 bg-muted/30 rounded-lg">
          <Star className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">No Reviews Yet</h2>
          <p className="text-muted-foreground mb-6">You haven&apos;t written any reviews yet.</p>
          <Button asChild>
            <Link href="/reviews/write">Write Your First Review</Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-6">
          {reviews.map((review) => (
            <Card key={review.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>{review.title}</CardTitle>
                    <div className="flex items-center mt-2">
                      {renderStars(review.rating)}
                      <span className="ml-2 text-sm text-muted-foreground">
                        {formatDate(review.createdAt)}
                      </span>
                    </div>
                  </div>
                  <Badge className={review.approved ? "bg-green-500" : "bg-amber-500"}>
                    {review.approved ? (
                      <>
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Approved
                      </>
                    ) : (
                      <>
                        <AlertCircle className="h-3 w-3 mr-1" />
                        Pending Approval
                      </>
                    )}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{review.content}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
