"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, Edit, Trash, Users, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { toast } from "@/components/ui/use-toast";
import Loading from "@/app/loading";

// This will only be used as fallback
const fallbackMembers = [
  {
    id: 1,
    name: "Alex Rivers",
    role: "Lead Vocals",
    image: "https://images.unsplash.com/photo-1463453091185-61582044d556?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
    joinDate: "2018",
  },
  {
    id: 2,
    name: "Sarah Chen",
    role: "Lead Guitar",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
    joinDate: "2018",
  },
];

interface Member {
  id: number;
  name: string;
  role: string;
  imageUrl: string;
  joinDate: string;
}

export default function MembersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<number | null>(null);
 

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
          // Add timestamp as cache-busting parameter
          imageUrl: member.imageData ? 
            `/api/members/${member.id}/image?t=${new Date().getTime()}` : 
            '/images/default-profile.jpg',
          joinDate: new Date(member.joinDate).getFullYear().toString(),
        }));
        
        setMembers(formattedMembers);
        setError(null);
      } catch (err) {
        console.error('Error fetching members:', err);
        setError('Failed to load members');
        // Use fallback members in case of error
        setMembers(fallbackMembers.map(member => ({
          ...member,
          imageUrl: '/images/default-profile.jpg'
        })));
      } finally {
        setLoading(false);
      }
    }

    fetchMembers();
  }, []);

  // Fix the deleteMember function to use the correct API endpoint structure
  async function deleteMember(id: number) {
    if (!confirm("Are you sure you want to delete this member? This action cannot be undone.")) {
      return;
    }
    
    setIsDeleting(id);
    
    try {
      // Change from path parameter to query parameter structure
      const response = await fetch(`/api/members?id=${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete member');
      }
      
      // Remove the deleted member from the state
      setMembers(members.filter(member => member.id !== id));
      
      // Show success toast
      toast({
        title: "Success",
        description: "Team member deleted successfully",
      });
    } catch (err) {
      console.error('Error deleting member:', err);
      // Show error toast
      toast({
        title: "Error",
        description: "Failed to delete Team member",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(null);
    }
  }

  const filteredMembers = members.filter(member =>
    member.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Link href="/admin">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Team Members</h1>
      </div>

      <div className="flex justify-end">
        <Link href="/admin/music/members/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Member
          </Button>
        </Link>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search members..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {loading ? (
        <Loading />
      ) : error ? (
        <div className="bg-destructive/10 text-destructive p-4 rounded-md">
          {error}. Using fallback data.
        </div>
      ) : filteredMembers.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          No members found. Add your first Team member!
        </div>
      ) : (
        <div className="grid gap-6">
          {filteredMembers.map((member, index) => (
            <motion.div
              key={member.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card>
                <CardContent className="p-6">
                  <div className="grid md:grid-cols-[150px,1fr] gap-6">
                    <div className="h-40 relative rounded-lg overflow-hidden">
                      <Image 
                        src={member.imageUrl}
                        alt={member.name}
                        fill
                        style={{ objectFit: 'cover' }}
                        unoptimized={true} // Ensure images are not optimized by Next.js to avoid caching issues
                        priority={index < 3} // Load first few images with priority
                      />
                    </div>
                    <div className="space-y-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-xl font-semibold">{member.name}</h3>
                          <div className="flex items-center mt-2 text-muted-foreground">
                            <Users className="h-4 w-4 mr-2" />
                            <span>{member.role}</span>
                            <span className="mx-2">•</span>
                            <span>Since {member.joinDate}</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Link href={`/admin/music/members/edit/${member.id}`}>
                            <Button variant="outline" size="icon">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button 
                            variant="outline" 
                            size="icon" 
                            className="text-destructive"
                            onClick={() => deleteMember(member.id)}
                            disabled={isDeleting === member.id}
                          >
                            {isDeleting === member.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                      <div className="flex justify-end pt-4 border-t">
                        <Link href={`/admin/music/members/edit/${member.id}`}>
                          <Button variant="outline">View Details</Button>
                        </Link>
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
  );
}