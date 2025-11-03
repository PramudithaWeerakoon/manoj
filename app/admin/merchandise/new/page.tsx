"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

const categories = ["Apparel", "Music", "Accessories", "Collectibles"];

export default function NewProductPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Link href="/admin/merchandise">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Add New Product</h1>
      </div>

      <Card>
        <CardContent className="p-6">
          <form className="space-y-8">
            <div className="space-y-2">
              <Label>Product Name</Label>
              <Input placeholder="Enter product name" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Price</Label>
                <Input type="number" placeholder="Enter price" />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Image URL</Label>
              <Input placeholder="Enter image URL" />
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                placeholder="Enter product description"
                className="min-h-[100px]"
              />
            </div>

            <div className="space-y-2">
              <Label>Details</Label>
              <Textarea
                placeholder="Enter product details (materials, dimensions, etc.)"
                className="min-h-[100px]"
              />
            </div>

            <div className="space-y-4">
              <Label>Available Sizes</Label>
              <div className="flex flex-wrap gap-2">
                {["S", "M", "L", "XL"].map((size) => (
                  <Button
                    key={size}
                    variant="outline"
                    className="w-12 h-12"
                  >
                    {size}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <Label>Available Colors</Label>
              <div className="flex flex-wrap gap-2">
                {["Black", "White", "Navy"].map((color) => (
                  <Button
                    key={color}
                    variant="outline"
                  >
                    {color}
                  </Button>
                ))}
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <Button variant="outline">Cancel</Button>
              <Button>Create Product</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}