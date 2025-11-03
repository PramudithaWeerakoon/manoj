"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, ArrowLeft, Calendar, Users, MapPin, Check, X, Mail } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/use-toast";
import Loading from "@/app/loading";

type Booking = {
  id: number;
  eventType: string;
  venueType: string;
  preferredDate: string;
  expectedGuests: number;
  additionalRequirements: string | null;
  contactName: string;
  contactEmail: string;
  status: string;
  createdAt: string;
}

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  
  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/bookings');
      
      if (!response.ok) {
        throw new Error('Failed to fetch bookings');
      }
      
      const data = await response.json();
      setBookings(data.bookings);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast({
        title: "Error",
        description: "Failed to load bookings",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateBookingStatus = async (id: number, status: string) => {
    try {
      const response = await fetch(`/api/bookings/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        throw new Error('Failed to update booking');
      }

      // Update the local state
      setBookings(prev => 
        prev.map(booking => booking.id === id ? { ...booking, status } : booking)
      );

      toast({
        title: "Success",
        description: `Booking ${status}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update booking",
        variant: "destructive",
      });
    }
  };

  const filteredBookings = bookings.filter(booking =>
    booking.eventType.toLowerCase().includes(searchQuery.toLowerCase()) ||
    booking.contactName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    booking.contactEmail.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Badge className="bg-green-500">Confirmed</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-500">Cancelled</Badge>;
      default:
        return <Badge className="bg-yellow-500">Pending</Badge>;
    }
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Link href="/admin">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">Event Bookings</h1>
          <p className="text-muted-foreground">
            Manage booking requests from clients
          </p>
        </div>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search bookings..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {filteredBookings.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          {searchQuery ? "No bookings match your search" : "No bookings yet"}
        </div>
      ) : (
        <div className="grid gap-6">
          {filteredBookings.map((booking, index) => (
            <motion.div
              key={booking.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="text-xl font-semibold">{booking.eventType} Event</h3>
                          {getStatusBadge(booking.status)}
                        </div>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4 mr-1" />
                          <span className="font-medium">
                            {format(new Date(booking.preferredDate), "MMM d, yyyy")}
                          </span>
                          <span className="mx-2">•</span>
                          <MapPin className="h-4 w-4 mr-1" />
                          <span>{booking.venueType}</span>
                          <span className="mx-2">•</span>
                          <Users className="h-4 w-4 mr-1" />
                          <span>{booking.expectedGuests} guests</span>
                        </div>
                      </div>
                      {booking.status === 'pending' && (
                        <div className="flex space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="border-green-500 hover:bg-green-50 text-green-600"
                            onClick={() => updateBookingStatus(booking.id, 'confirmed')}
                          >
                            <Check className="h-4 w-4 mr-2" />
                            Confirm
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="border-red-500 hover:bg-red-50 text-red-600"
                            onClick={() => updateBookingStatus(booking.id, 'cancelled')}
                          >
                            <X className="h-4 w-4 mr-2" />
                            Cancel
                          </Button>
                        </div>
                      )}
                    </div>

                    {booking.additionalRequirements && (
                      <div className="bg-muted/50 p-4 rounded-md">
                        <p className="whitespace-pre-wrap">{booking.additionalRequirements}</p>
                      </div>
                    )}

                    <div className="border-t pt-4">
                      <div className="flex items-center text-sm">
                        <span className="font-medium">Contact:</span>
                        <span className="ml-2">{booking.contactName}</span>
                        <span className="mx-2">•</span>
                        <Mail className="h-4 w-4 mr-1" />
                        <a 
                          href={`mailto:${booking.contactEmail}`}
                          className="text-blue-600 hover:underline"
                        >
                          {booking.contactEmail}
                        </a>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Submitted on {format(new Date(booking.createdAt), "MMM d, yyyy 'at' h:mm a")}
                      </p>
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
