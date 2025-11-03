"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Music, MapPin, Clock, CheckCircle, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { toast } from "@/components/ui/use-toast";

export function BookingSection() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  const [eventType, setEventType] = useState("");
  const [venueType, setVenueType] = useState("");
  const [preferredDate, setPreferredDate] = useState<Date | undefined>();
  const [expectedGuests, setExpectedGuests] = useState("");
  const [additionalRequirements, setAdditionalRequirements] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!eventType || !venueType || !preferredDate || !expectedGuests || !contactName || !contactEmail) {
      toast({
        title: "Missing information",
        description: "Please fill all required fields",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventType,
          venueType,
          preferredDate,
          expectedGuests: parseInt(expectedGuests),
          additionalRequirements,
          contactName,
          contactEmail
        })
      });
      
      if (!response.ok) {
        throw new Error('Something went wrong');
      }
      
      setIsSubmitted(true);
      toast({
        title: "Booking request submitted",
        description: "We'll get back to you shortly to confirm your booking.",
      });
      
      // Reset form
      setEventType("");
      setVenueType("");
      setPreferredDate(undefined);
      setExpectedGuests("");
      setAdditionalRequirements("");
      setContactName("");
      setContactEmail("");
      
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit booking request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="py-16 bg-[#014441] text-custom-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold mb-4">Book Us for Your Event</h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            From intimate acoustic sessions to full stadium performances, we&apos;ll make your event unforgettable
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-custom-white/10 border-none text-custom-white">
            <CardContent className="p-6">
              {isSubmitted ? (
                <div className="py-10 text-center space-y-4">
                  <div className="flex justify-center">
                    <CheckCircle className="h-16 w-16 text-green-500" />
                  </div>
                  <h3 className="text-xl font-bold">Booking Request Sent!</h3>
                  <p className="text-gray-400">Thanks for your interest! We&apos;ll respond to you shortly to confirm your booking.</p>
                  <Button 
                    onClick={() => setIsSubmitted(false)} 
                    className="mt-4 bg-custom-white text-black hover:bg-custom-white/90"
                  >
                    Make Another Booking
                  </Button>
                </div>
              ) : (
                <form className="space-y-8" onSubmit={handleSubmit}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-custom-white">Event Type</Label>
                      <Select value={eventType} onValueChange={setEventType}>
                        <SelectTrigger className="bg-custom-white/5 border-custom-white/20 text-custom-white">
                          <SelectValue placeholder="Select event type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="private">Private Party</SelectItem>
                          <SelectItem value="corporate">Corporate Event</SelectItem>
                          <SelectItem value="wedding">Wedding</SelectItem>
                          <SelectItem value="concert">Concert</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-custom-white">Venue Type</Label>
                      <Select value={venueType} onValueChange={setVenueType}>
                        <SelectTrigger className="bg-custom-white/5 border-custom-white/20 text-custom-white">
                          <SelectValue placeholder="Select venue type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="indoor">Indoor Venue</SelectItem>
                          <SelectItem value="outdoor">Outdoor Venue</SelectItem>
                          <SelectItem value="stadium">Stadium</SelectItem>
                          <SelectItem value="club">Club</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-custom-white">Preferred Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full bg-custom-white/5 border-custom-white/20 text-custom-white justify-start"
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {preferredDate ? format(preferredDate, "PPP") : <span>Pick a date</span>}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={preferredDate}
                            onSelect={setPreferredDate}
                            initialFocus
                            disabled={(date) => date < new Date()}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-custom-white">Expected Guests</Label>
                      <Input
                        type="number"
                        placeholder="Number of guests"
                        className="bg-custom-white/5 border-custom-white/20 text-custom-white"
                        value={expectedGuests}
                        onChange={(e) => setExpectedGuests(e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-white">Additional Requirements</Label>
                    <Input
                      placeholder="Any specific requirements or requests"
                      className="bg-white/5 border-white/20 text-white"
                      value={additionalRequirements}
                      onChange={(e) => setAdditionalRequirements(e.target.value)}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-white">Contact Name</Label>
                      <Input
                        placeholder="Your name"
                        className="bg-white/5 border-white/20 text-white"
                        value={contactName}
                        onChange={(e) => setContactName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-white">Contact Email</Label>
                      <Input
                        type="email"
                        placeholder="Your email"
                        className="bg-white/5 border-white/20 text-white"
                        value={contactEmail}
                        onChange={(e) => setContactEmail(e.target.value)}
                      />
                    </div>
                  </div>

                  <Button 
                    className="w-full bg-white text-black hover:bg-white/90"
                    type="submit"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Submitting...
                      </>
                    ) : "Submit Booking Request"}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
          {[{
              icon: Music,
              title: "Versatile Performance",
              description: "From acoustic sets to full Team performances",
            },
            {
              icon: MapPin,
              title: "Any Venue",
              description: "We adapt to your space and requirements",
            },
            {
              icon: Clock,
              title: "Flexible Duration",
              description: "Customizable performance length",
            },
          ].map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="text-center"
            >
              <feature.icon className="h-8 w-8 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-400">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}