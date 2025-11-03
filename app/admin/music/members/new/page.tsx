"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card"; // Verify these exports
import { Button } from "@/components/ui/button"; // Verify this export
import { Input } from "@/components/ui/input"; // Verify this export
import { Label } from "@/components/ui/label"; // Verify this export
import { Textarea } from "@/components/ui/textarea"; // Verify this export
import { ArrowLeft } from "lucide-react"; // Ensure this is correctly imported
import Link from "next/link"; // This should be correct
import { useRouter } from "next/navigation"; // Add this import
import { toast } from "@/components/ui/use-toast"; // Add this import for consistent notifications
import Image from "next/image"; // Add this for image preview

export default function NewMemberPage() {
  const router = useRouter(); // Initialize the router
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
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
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      
      // Create an image preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSocialLinkChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      socialLinks: {
        ...prev.socialLinks,
        [name]: value,
      },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // Create FormData for file upload
      const formDataToSend = new FormData();
      
      // Add all text fields to FormData
      formDataToSend.append('firstName', formData.firstName);
      formDataToSend.append('lastName', formData.lastName);
      formDataToSend.append('role', formData.role);
      formDataToSend.append('bio', formData.bio);
      formDataToSend.append('joinDate', formData.joinDate);
      formDataToSend.append('socialLinks', JSON.stringify(formData.socialLinks));
      
      // Add the profile image file if it exists
      if (selectedFile) {
        formDataToSend.append('profileImage', selectedFile);
      }
      
      const response = await fetch("/api/members", {
        method: "POST",
        body: formDataToSend, // Send FormData instead of JSON
        // No Content-Type header needed as it's automatically set with boundary
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Member added successfully"
        });
        router.push("/admin/music/members");
      } else {
        toast({
          title: "Error",
          description: "Failed to add member",
          variant: "destructive"
        });
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error("Error adding member:", error);
      toast({
        title: "Error",
        description: "An error occurred. Please try again.",
        variant: "destructive"
      });
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Link href="/admin/music/members">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Add New Team Member</h1>
      </div>

      <Card>
        <CardContent className="p-6">
          <form className="space-y-8" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>First Name</Label>
                <Input
                  name="firstName"
                  placeholder="Enter first name"
                  value={formData.firstName}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2">
                <Label>Last Name</Label>
                <Input
                  name="lastName"
                  placeholder="Enter last name"
                  value={formData.lastName}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Role</Label>
              <Input
                name="role"
                placeholder="Enter Team member role (e.g. Lead Vocals, Drummer)"
                value={formData.role}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-2">
              <Label>Profile Image</Label>
              <Input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
              />
              {imagePreview && (
                <div className="mt-2">
                  <img
                    src={imagePreview}
                    alt="Profile preview"
                    className="h-40 w-40 object-cover rounded-md border"
                  />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>Bio</Label>
              <Textarea
                name="bio"
                placeholder="Enter member biography"
                className="min-h-[150px]"
                value={formData.bio}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-4">
              <Label>Social Media Links</Label>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Facebook</Label>
                  <Input
                    name="facebook"
                    placeholder="Enter Facebook profile URL"
                    value={formData.socialLinks.facebook}
                    onChange={handleSocialLinkChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Twitter</Label>
                  <Input
                    name="twitter"
                    placeholder="Enter Twitter profile URL"
                    value={formData.socialLinks.twitter}
                    onChange={handleSocialLinkChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Instagram</Label>
                  <Input
                    name="instagram"
                    placeholder="Enter Instagram profile URL"
                    value={formData.socialLinks.instagram}
                    onChange={handleSocialLinkChange}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Join Date</Label>
              <Input
                type="date"
                name="joinDate"
                value={formData.joinDate}
                onChange={handleChange}
              />
            </div>

            <div className="flex justify-end space-x-4">
              <Button variant="outline" type="button">
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Adding..." : "Add Member"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}