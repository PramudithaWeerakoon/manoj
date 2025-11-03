"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Loader2, Upload, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "@/components/ui/use-toast";
import { useParams } from "next/navigation";
import Image from "next/image";
import Loading from "@/app/loading";

export default function EditMemberPage() {
  const router = useRouter();
  const { id } = useParams();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [hasExistingImage, setHasExistingImage] = useState(false);
  
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    role: "",
    bio: "",
    socialLinks: {
      facebook: "",
      twitter: "",
      instagram: "",
    },
    joinDate: "",
  });

  useEffect(() => {
    async function fetchMemberData() {
      try {
        setIsFetching(true);
        console.log("Fetching member with ID:", id);
        
        // Get all members first
        const response = await fetch('/api/members');
        
        if (!response.ok) {
          throw new Error("Failed to fetch members");
        }
        
        const members = await response.json();
        console.log("All members:", members);
        
        // Find the specific member by ID
        const memberData = members.find((m: any) => m.id.toString() === id);
        console.log("Found member:", memberData);
        
        if (!memberData) {
          throw new Error("Member not found");
        }
        
        // Parse social links if it exists as a string
        let socialLinks = { facebook: "", twitter: "", instagram: "" };
        if (memberData.socialLinks) {
          if (typeof memberData.socialLinks === 'string') {
            try {
              socialLinks = JSON.parse(memberData.socialLinks);
            } catch (e) {
              console.error("Error parsing social links JSON:", e);
            }
          } else if (typeof memberData.socialLinks === 'object') {
            socialLinks = memberData.socialLinks;
          }
        }
        
        setFormData({
          firstName: memberData.firstName || "",
          lastName: memberData.lastName || "",
          role: memberData.role || "",
          bio: memberData.bio || "",
          socialLinks: {
            facebook: socialLinks.facebook || "",
            twitter: socialLinks.twitter || "",
            instagram: socialLinks.instagram || "",
          },
          joinDate: memberData.joinDate ? new Date(memberData.joinDate).toISOString().split('T')[0] : "",
        });
        
        // Check if member has an image
        if (memberData.imageData) {
          setHasExistingImage(true);
          // Set image preview with timestamp to prevent caching
          const timestamp = Date.now();
          setImagePreview(`/api/members/${id}/image?t=${timestamp}`);
        }
      } catch (error) {
        console.error("Error fetching member:", error);
        toast({
          title: "Error",
          description: "Failed to load member data",
          variant: "destructive",
        });
        router.push("/admin/music/members");
      } finally {
        setIsFetching(false);
      }
    }

    if (id) {
      fetchMemberData();
    }
  }, [id, toast, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name.startsWith("social.")) {
      const socialNetwork = name.split(".")[1];
      setFormData(prev => ({
        ...prev,
        socialLinks: {
          ...prev.socialLinks,
          [socialNetwork]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      
      // Create preview URL for the selected image
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setSelectedFile(null);
    setImagePreview(null);
    setHasExistingImage(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.firstName || !formData.lastName || !formData.role) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Create FormData object for multipart form submission
      const submitData = new FormData();
      
      // Add all form fields
      submitData.append("firstName", formData.firstName);
      submitData.append("lastName", formData.lastName);
      submitData.append("role", formData.role);
      submitData.append("bio", formData.bio || "");
      submitData.append("joinDate", formData.joinDate);
      
      // Add social links
      submitData.append("socialLinks", JSON.stringify(formData.socialLinks));
      
      // Add image file if selected
      if (selectedFile) {
        submitData.append("image", selectedFile);
      }
      
      // Add flag to indicate if image was removed
      submitData.append("imageRemoved", (!selectedFile && !hasExistingImage).toString());
      
      // Add member ID to the form data for the backend
      submitData.append("id", id as string);
      
      const response = await fetch(`/api/members?id=${id}`, {
        method: "PUT",
        body: submitData,
      });

      if (!response.ok) {
        throw new Error("Failed to update member");
      }

      toast({
        title: "Success",
        description: "Member updated successfully",
      });
      
      // Redirect to members list
      router.push("/admin/music/members");
    } catch (error) {
      console.error("Error updating member:", error);
      toast({
        title: "Error",
        description: (error as Error).message || "Failed to update member",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return <Loading />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Link href="/admin/music/members">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Edit Team Member</h1>
      </div>

      <Card>
        <CardContent className="p-6">
          <form className="space-y-8" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input 
                  id="firstName"
                  name="firstName"
                  placeholder="Enter first name" 
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input 
                  id="lastName"
                  name="lastName"
                  placeholder="Enter last name" 
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Input 
                id="role"
                name="role"
                placeholder="e.g., Lead Vocalist, Drummer"
                value={formData.role}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="joinDate">Join Date</Label>
              <Input 
                id="joinDate"
                name="joinDate"
                type="date"
                value={formData.joinDate}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Biography</Label>
              <Textarea
                id="bio"
                name="bio"
                placeholder="Write a short biography..."
                className="min-h-[120px]"
                value={formData.bio}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-4">
              <Label>Social Media Links</Label>
              <div className="space-y-2">
                <Input
                  id="social.facebook"
                  name="social.facebook"
                  placeholder="Facebook Profile URL"
                  value={formData.socialLinks.facebook}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Input
                  id="social.twitter"
                  name="social.twitter"
                  placeholder="Twitter Profile URL"
                  value={formData.socialLinks.twitter}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Input
                  id="social.instagram"
                  name="social.instagram"
                  placeholder="Instagram Profile URL"
                  value={formData.socialLinks.instagram}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="image">Profile Image</Label>
              <div className="flex flex-col gap-4">
                {imagePreview ? (
                  <div className="relative w-full h-48 border rounded-md overflow-hidden">
                    <Image 
                      src={imagePreview} 
                      alt="Preview" 
                      fill
                      className="object-cover"
                      unoptimized={true}
                      priority
                    />
                    <Button 
                      type="button"
                      variant="destructive" 
                      size="icon" 
                      className="absolute top-2 right-2 h-6 w-6 rounded-full"
                      onClick={handleRemoveImage}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div 
                    className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-md cursor-pointer hover:bg-gray-50"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="h-8 w-8 text-gray-400" />
                    <p className="mt-2 text-sm text-gray-500">Click to upload an image</p>
                  </div>
                )}
                <Input
                  id="image"
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <Button 
                type="button"
                variant="outline"
                onClick={() => router.push("/admin/music/members")}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Update Member"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
