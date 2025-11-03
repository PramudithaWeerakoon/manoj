"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Facebook, Twitter, Instagram, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";

// Define interface for Member type
interface Member {
  id: number;
  name: string;
  role: string;
  bio: string;
  image: string;
  social: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
  };
}

// Animation variants
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

// Fallback data in case API fails
const fallbackMembers: Member[] = [
  {
    id: 1,
    name: "Alex Rivers",
    role: "Lead Vocals / Guitar",
    bio: "With over a decade of experience in the music industry, Alex brings powerful vocals and electrifying guitar riffs to the Team. His songwriting has been instrumental in shaping the Team's signature sound.",
    image: "https://images.unsplash.com/photo-1463453091185-61582044d556?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
    social: {
      facebook: "https://facebook.com",
      twitter: "https://twitter.com",
      instagram: "https://instagram.com",
    },
  },
  {
    id: 2,
    name: "Sarah Chen",
    role: "Lead Guitar",
    bio: "A classically trained musician turned rock virtuoso, Sarah's innovative guitar techniques and melodic solos have become a cornerstone of the Team's musical identity.",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
    social: {
      facebook: "https://facebook.com",
      twitter: "https://twitter.com",
      instagram: "https://instagram.com",
    },
  },
  {
    id: 3,
    name: "Marcus Thompson",
    role: "Drums",
    bio: "The rhythmic foundation of Radioo Music, Marcus brings both power and precision to the drums. His dynamic playing style drives the Team's high-energy performances.",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
    social: {
      facebook: "https://facebook.com",
      twitter: "https://twitter.com",
      instagram: "https://instagram.com",
    },
  },
];

export default function MembersPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMembers() {
      try {
        setLoading(true);
        const response = await fetch('/api/members');
        
        if (!response.ok) {
          throw new Error('Failed to fetch members');
        }
        
        const data = await response.json();
        
        // Transform API data to match our component format
        const formattedMembers = data.map((member: any) => ({
          id: member.id,
          name: `${member.firstName} ${member.lastName}`,
          role: member.role,
          bio: member.bio || "Team member of Radioo Music",
          // Add timestamp to prevent caching
          image: `/api/members/${member.id}/image?t=${Date.now()}`,
          social: {
            facebook: member.facebook || "https://facebook.com",
            twitter: member.twitter || "https://twitter.com",
            instagram: member.instagram || "https://instagram.com",
          }
        }));
        
        setMembers(formattedMembers);
        setError(null);
      } catch (err) {
        console.error('Error fetching members:', err);
        setError('Failed to load members');
        // Use fallback members if fetch fails
        setMembers(fallbackMembers);
      } finally {
        setLoading(false);
      }
    }
    fetchMembers();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background py-12 flex justify-center items-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-xl">Loading Team members...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold tracking-tight text-primary sm:text-5xl mb-4">
            Meet the Team
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            The talented musicians behind Radioo Music&apos;s unique sound
          </p>
          {error && (
            <div className="mt-4 p-3 bg-destructive/10 text-destructive rounded-md inline-block">
              {error}
            </div>
          )}
        </motion.div>
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {members.map((member, index) => (
            <motion.div key={member.id} variants={item}>
              <Dialog>
                <DialogTrigger asChild>
                  <Card className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow">
                    <div className="h-64 w-full relative">
                      <Image
                        src={member.image}
                        alt={member.name}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        style={{ objectFit: "cover" }}
                        unoptimized={true}
                        priority={index < 3} // Add priority loading for first few images
                      />
                    </div>
                    <CardHeader>
                      <h3 className="text-2xl font-semibold">{member.name}</h3>
                      <p className="text-muted-foreground">{member.role}</p>
                    </CardHeader>
                  </Card>
                </DialogTrigger>
                <DialogContent className="sm:max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>{member.name}</DialogTitle>
                  </DialogHeader>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="h-64 w-full relative rounded-lg overflow-hidden">
                      <Image
                        src={member.image}
                        alt={member.name}
                        fill
                        style={{ objectFit: "cover" }}
                        unoptimized={true}
                      />
                    </div>
                    <div>
                      <h4 className="font-semibold text-lg mb-2">{member.role}</h4>
                      <p className="text-muted-foreground mb-4">{member.bio}</p>
                      <div className="flex space-x-4">
                        {member.social.facebook && (
                          <Button variant="ghost" size="icon" asChild>
                            <a href={member.social.facebook} target="_blank" rel="noopener noreferrer">
                              <Facebook className="h-5 w-5" />
                            </a>
                          </Button>
                        )}
                        {member.social.twitter && (
                          <Button variant="ghost" size="icon" asChild>
                            <a href={member.social.twitter} target="_blank" rel="noopener noreferrer">
                              <Twitter className="h-5 w-5" />
                            </a>
                          </Button>
                        )}
                        {member.social.instagram && (
                          <Button variant="ghost" size="icon" asChild>
                            <a href={member.social.instagram} target="_blank" rel="noopener noreferrer">
                              <Instagram className="h-5 w-5" />
                            </a>
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}