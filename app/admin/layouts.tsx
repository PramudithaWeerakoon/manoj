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
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";

const sidebarItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/admin" },
  { icon: Music, label: "Albums", href: "/admin/albums" },
  { icon: Calendar, label: "Events", href: "/admin/events" },
  { icon: Users, label: "Members", href: "/admin/members" },
  { icon: ShoppingBag, label: "Merchandise", href: "/admin/merchandise" },
  { icon: FileText, label: "Blog Posts", href: "/admin/blog" },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Sidebar Toggle */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        >
          {isSidebarOpen ? (
            <X className="h-4 w-4" />
          ) : (
            <Menu className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Sidebar */}
      <motion.aside
        initial={{ x: -300 }}
        animate={{ x: isSidebarOpen ? 0 : -300 }}
        className={cn(
          "fixed top-0 left-0 z-40 h-screen w-64 bg-card border-r",
          "transition-transform lg:translate-x-0",
          !isSidebarOpen && "lg:w-20"
        )}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-6 border-b">
            <Button
              variant="ghost"
              size="icon"
              className="hidden lg:flex"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
              {isSidebarOpen ? (
                <X className="h-4 w-4" />
              ) : (
                <Menu className="h-4 w-4" />
              )}
            </Button>
          </div>

          <nav className="flex-1 p-4 space-y-2">
            {sidebarItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <div
                  className={cn(
                    "flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors",
                    "hover:bg-accent",
                    pathname === item.href && "bg-accent",
                    !isSidebarOpen && "lg:justify-center lg:px-2"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {(isSidebarOpen || !isSidebarOpen && window.innerWidth < 1024) && (
                    <span>{item.label}</span>
                  )}
                </div>
              </Link>
            ))}
          </nav>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main
        className={cn(
          "transition-all duration-300",
          isSidebarOpen ? "lg:ml-64" : "lg:ml-20",
          "ml-0 p-8"
        )}
      >
        {children}
      </main>
    </div>
  );
}