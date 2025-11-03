"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Music,
  Calendar,
  Users,
  ShoppingBag,
  FileText,
  Settings,
  Menu,
  X,
  Album,
  Mic2,
  Image as ImageIcon, // Import Image as ImageIcon to avoid conflict with Next.js Image
  Mail
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [dummyState, setDummyState] = useState(false); // You can remove this if not needed

  // Update the sidebarItems array to include Messages
  const sidebarItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/admin" },
    {
      icon: Music,
      label: "Music",
      href: "/admin/music",
      subItems: [
        { icon: Album, label: "Albums", href: "/admin/music/albums" },
        { icon: Music, label: "Tracks", href: "/admin/music/tracks" },
        { icon: Users, label: "Members", href: "/admin/music/members" },
      ]
    },
    { icon: Calendar, label: "Events", href: "/admin/events" },
    { icon: ImageIcon, label: "Hero Backgrounds", href: "/admin/background-images" },
    { icon: ShoppingBag, label: "Merchandise", href: "/admin/merchandise" },
    { icon: FileText, label: "Blog Posts", href: "/admin/blog" },
    { icon: Mail, label: "Messages", href: "/admin/messages" },
    { icon: Settings, label: "Settings", href: "/admin/settings" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Main Content */}
      <main className="p-8">
        {children}
      </main>
    </div>
  );
}
