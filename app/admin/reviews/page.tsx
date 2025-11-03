"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowLeft, 
  Search, 
  Check, 
  X, 
  Loader2,
  Star,
  User as UserIcon,
  Calendar,
  ThumbsUp,
  ThumbsDown 
} from "lucide-react";
import Link from "next/link";
import { toast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";

interface Review {
  id: number;
  title: string;
  content: string;
  rating: number;
  approved: boolean;
  createdAt: string;
  user: {
    name: string;
    email: string;
  };
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [filteredReviews, setFilteredReviews] = useState<Review[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedReviews, setSelectedReviews] = useState<number[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState("all");

  // Fetch reviews from the API
  useEffect(() => {
    async function fetchReviews() {
      try {
        setIsLoading(true);
        const response = await fetch('/api/admin/reviews');
        
        if (!response.ok) {
          throw new Error('Failed to fetch reviews');
        }
        
        const data = await response.json();
        setReviews(data.reviews || []);
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
  }, [toast]);

  // Filter reviews based on search and tab
  useEffect(() => {
    let result = [...reviews];
    
    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(review => 
        review.title.toLowerCase().includes(query) ||
        review.content.toLowerCase().includes(query) ||
        review.user.name.toLowerCase().includes(query)
      );
    }
    
    // Filter by tab
    if (activeTab === 'pending') {
      result = result.filter(review => !review.approved);
    } else if (activeTab === 'approved') {
      result = result.filter(review => review.approved);
    }
    
    setFilteredReviews(result);
  }, [reviews, searchQuery, activeTab]);

  // Handle review selection
  const toggleReviewSelection = (id: number) => {
    setSelectedReviews(prev => 
      prev.includes(id) 
        ? prev.filter(reviewId => reviewId !== id) 
        : [...prev, id]
    );
  };

  // Select all reviews
  const selectAllReviews = () => {
    const allIds = filteredReviews.map(review => review.id);
    setSelectedReviews(allIds);
  };

  // Clear selection
  const clearSelection = () => {
    setSelectedReviews([]);
  };

  // Get only pending reviews
  const getPendingReviews = () => {
    return reviews.filter(review => !review.approved);
  };

  // Handle bulk approve/reject
  const handleBulkAction = async (approved: boolean) => {
    if (selectedReviews.length === 0) {
      return;
    }

    setIsProcessing(true);
    try {
      const response = await fetch('/api/admin/reviews', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ids: selectedReviews,
          approved,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to ${approved ? 'approve' : 'reject'} reviews`);
      }

      // Update local state
      const updatedReviews = reviews.map(review => {
        if (selectedReviews.includes(review.id)) {
          return { ...review, approved };
        }
        return review;
      });

      setReviews(updatedReviews);
      setSelectedReviews([]);
      
      toast({
        title: 'Success',
        description: `${selectedReviews.length} reviews ${approved ? 'approved' : 'rejected'} successfully`,
      });
    } catch (error) {
      console.error('Error processing reviews:', error);
      toast({
        title: 'Error',
        description: `Failed to ${approved ? 'approve' : 'reject'} reviews`,
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

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

  const pendingCount = getPendingReviews().length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/admin">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">Reviews Management</h1>
        </div>
        
        {pendingCount > 0 && (
          <Badge className="bg-amber-500">
            {pendingCount} pending review{pendingCount !== 1 ? 's' : ''}
          </Badge>
        )}
      </div>

      <Tabs defaultValue="all" className="space-y-4" onValueChange={setActiveTab} value={activeTab}>
        <div className="flex justify-between items-center">
          <TabsList>
            <TabsTrigger value="all">All Reviews</TabsTrigger>
            <TabsTrigger value="pending">
              Pending
              {pendingCount > 0 && ` (${pendingCount})`}
            </TabsTrigger>
            <TabsTrigger value="approved">Approved</TabsTrigger>
          </TabsList>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search reviews..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-[250px]"
            />
          </div>
        </div>
        
        <TabsContent value="all" className="space-y-4">
          {renderReviewsContent()}
        </TabsContent>
        
        <TabsContent value="pending" className="space-y-4">
          {renderReviewsContent()}
        </TabsContent>
        
        <TabsContent value="approved" className="space-y-4">
          {renderReviewsContent()}
        </TabsContent>
      </Tabs>

      {selectedReviews.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-0 left-0 right-0 bg-background border-t p-4 flex justify-between items-center z-10"
        >
          <div>
            <span className="font-medium">{selectedReviews.length} review{selectedReviews.length !== 1 ? 's' : ''} selected</span>
            <Button variant="link" onClick={clearSelection} className="ml-2 p-0 h-auto">
              Clear
            </Button>
          </div>
          <div className="flex space-x-4">
            <Button
              onClick={() => handleBulkAction(false)}
              variant="destructive"
              disabled={isProcessing}
            >
              {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ThumbsDown className="mr-2 h-4 w-4" />}
              Reject Selected
            </Button>
            <Button
              onClick={() => handleBulkAction(true)}
              disabled={isProcessing}
            >
              {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ThumbsUp className="mr-2 h-4 w-4" />}
              Approve Selected
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  );

  function renderReviewsContent() {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Loading reviews...</span>
        </div>
      );
    }

    if (filteredReviews.length === 0) {
      return (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No reviews found.</p>
          {searchQuery && (
            <p className="text-sm text-muted-foreground mt-2">
              Try adjusting your search query.
            </p>
          )}
        </div>
      );
    }

    return (
      <>
        <div className="flex justify-between mb-4">
          <Button
            variant="outline"
            size="sm"
            onClick={selectAllReviews}
          >
            Select All ({filteredReviews.length})
          </Button>
        </div>
        
        <div className="grid gap-6">
          {filteredReviews.map((review) => (
            <Card 
              key={review.id} 
              className={`cursor-pointer border-2 ${selectedReviews.includes(review.id) ? 'border-primary' : 'border-transparent'}`}
              onClick={() => toggleReviewSelection(review.id)}
            >
              <CardHeader className="p-4 pb-0">
                <div className="flex justify-between">
                  <div>
                    <CardTitle className="text-xl flex items-center gap-2">
                      {review.title}
                      {!review.approved && (
                        <Badge variant="outline" className="text-xs bg-amber-100 border-amber-300 text-amber-800">
                          Pending
                        </Badge>
                      )}
                    </CardTitle>
                    {renderStars(review.rating)}
                  </div>
                  <div className="text-xs text-muted-foreground text-right">
                    <div className="flex items-center justify-end mb-1">
                      <Calendar className="h-3 w-3 mr-1" />
                      {formatDate(review.createdAt)}
                    </div>
                    <div className="flex items-center justify-end">
                      <UserIcon className="h-3 w-3 mr-1" />
                      {review.user.name}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4">
                <p className="text-muted-foreground">{review.content}</p>
                <div className="flex justify-end space-x-2 mt-4">
                  {!review.approved ? (
                    <>
                      <Button 
                        size="sm" 
                        variant="destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleBulkAction(false);
                        }}
                      >
                        <X className="mr-1 h-4 w-4" />
                        Reject
                      </Button>
                      <Button
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleBulkAction(true);
                        }}
                      >
                        <Check className="mr-1 h-4 w-4" />
                        Approve
                      </Button>
                    </>
                  ) : (
                    <Badge className="bg-green-600">Approved</Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </>
    );
  }
}
