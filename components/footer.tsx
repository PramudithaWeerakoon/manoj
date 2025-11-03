"use client";

import { Facebook, Twitter, Instagram, Youtube, Mail, Phone, MapPin } from "lucide-react";
import { Button } from "./ui/button";
import Link from "next/link";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";

interface BlogPost {
  id: number;
  title: string;
  createdAt: string;
}

export function Footer() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isLoadingPosts, setIsLoadingPosts] = useState(true);

  useEffect(() => {
    async function fetchLatestPosts() {
      try {
        const response = await fetch('/api/blog?published=true');
        
        if (response.ok) {
          const data = await response.json();
          // Get the 2 most recent posts
          const recentPosts = (data.posts || []).slice(0, 2);
          setPosts(recentPosts);
        }
      } catch (error) {
        console.error('Error fetching blog posts for footer:', error);
      } finally {
        setIsLoadingPosts(false);
      }
    }

    fetchLatestPosts();
  }, []);

  function formatDate(dateString: string): string {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'long', 
        day: 'numeric', 
        year: 'numeric'
      });
    } catch {
      return 'Unknown date';
    }
  }

  return (
    <footer className="bg-[#014441] text-custom-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-4"
          >
            <h3 className="text-xl font-bold">About Radioo Music</h3>
            <p className="text-gray-400">
              Experience the fusion of classical rock and modern elements in a journey through sound and emotion.
            </p>
            <div className="flex space-x-4">
              <Button variant="ghost" size="icon" asChild>
                <a href="#" target="_blank" rel="noopener noreferrer">
                  <Facebook className="h-5 w-5" />
                </a>
              </Button>
              <Button variant="ghost" size="icon" asChild>
                <a href="#" target="_blank" rel="noopener noreferrer">
                  <Twitter className="h-5 w-5" />
                </a>
              </Button>
              <Button variant="ghost" size="icon" asChild>
                <a href="#" target="_blank" rel="noopener noreferrer">
                  <Instagram className="h-5 w-5" />
                </a>
              </Button>
              <Button variant="ghost" size="icon" asChild>
                <a href="#" target="_blank" rel="noopener noreferrer">
                  <Youtube className="h-5 w-5" />
                </a>
              </Button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="space-y-4"
          >
            <h3 className="text-xl font-bold">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="text-gray-400 hover:text-custom-white transition">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/events" className="text-gray-400 hover:text-custom-white transition">
                  Categories
                </Link>
              </li>
              <li>
                <Link href="/albums" className="text-gray-400 hover:text-custom-white transition">
                  Albums
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-gray-400 hover:text-custom-white transition">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-400 hover:text-custom-white transition">
                  Contact
                </Link>
              </li>
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="space-y-4"
          >
            <h3 className="text-xl font-bold">Latest Posts</h3>
            <ul className="space-y-4">
              {isLoadingPosts ? (
                <li className="text-sm text-gray-400">Loading posts...</li>
              ) : posts.length > 0 ? (
                posts.map(post => (
                  <li key={post.id}>
                    <Link href={`/blog/${post.id}`} className="group">
                      <p className="text-sm text-gray-400 group-hover:text-custom-white transition">
                        {post.title}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatDate(post.createdAt)}
                      </p>
                    </Link>
                  </li>
                ))
              ) : (
                <li className="text-sm text-gray-400">No posts available</li>
              )}
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6 }}
            className="space-y-4"
          >
            <h3 className="text-xl font-bold">Contact Info</h3>
            <ul className="space-y-4">
              <li className="flex items-center space-x-3 text-gray-400">
                <Mail className="h-5 w-5" />
                <span>radioomusicevent@gmail.com</span>
              </li>
              <li className="flex items-center space-x-3 text-gray-400">
                <Phone className="h-5 w-5" />
                <span>070 289 1206</span>
              </li>
              <li className="flex items-center space-x-3 text-gray-400">
                <MapPin className="h-5 w-5" />
                <span>Sajith Tharaka - Coordinator, Radio Entertainment</span>
              </li>
            </ul>
          </motion.div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2024 Radioo Music. All rights reserved.
            </p>
            <div className="flex space-x-4 mt-4 md:mt-0">
              <Link href="/privacy" className="text-gray-400 hover:text-custom-white text-sm transition">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-gray-400 hover:text-custom-white text-sm transition">
                Terms of Service
              </Link>
              <Link href="/licenses" className="text-gray-400 hover:text-custom-white text-sm transition">
                Licenses
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}