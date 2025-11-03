"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/AuthProvider";
import { 
  Music, 
  Users, 
  Calendar, 
  Star, 
  ShoppingBag, 
  User, 
  LogIn, 
  LogOut, 
  Settings, 
  UserCircle,
  Menu,
  X
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { motion } from "framer-motion";

const routes = [
  {
    href: "/",
    label: "Home",
    icon: Music,
  },
  {
    href: "/albums",
    label: "Albums",
    icon: Music,
  },
  {
    href: "/events",
    label: "Categories",
    icon: Calendar,
  },
  {
    href: "/reviews",
    label: "Fan Reviews",
    icon: Star,
  },
  {
    href: "/contact",
    label: "Contact",
    icon: User,
  },
];

export function MainNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout } = useAuth();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Handle logout using the context method
  const handleLogout = async () => {
    await logout();
    router.push('/');
    router.refresh();
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-[#CEA657] to-[#F7E29C] backdrop-blur-sm border-b shadow-md transition-all duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">          <Link href="/" className="flex items-center space-x-2">            <div className="relative h-20 w-20">
              {/* Try-catch pattern for image with fallback */}
              <div className="flex items-center justify-center h-full w-full">
                <Image 
                  src="/radio.png"
                  alt="" 
                  width={120} 
                  height={80} 
                  className="h-full w-full" 
                  priority 
                  onError={(e) => {
                    // Fallback to a styled text logo if image fails to load
                    e.currentTarget.style.display = 'none';
                    const parent = e.currentTarget.parentElement;
                    if (parent) {
                      const fallback = document.createElement('div');
                      fallback.className = 'bg-primary text-custom-white rounded-full h-12 w-12 flex items-center justify-center text-lg font-bold';
                      fallback.innerText = 'RM';
                      parent.appendChild(fallback);
                    }
                  }}
                />
              </div>
            </div>
           
          </Link>
          <div className="hidden md:flex items-center space-x-4">
            {routes.map((route) => (
              <Button
                key={route.href}
                variant="ghost"
                className={cn(
                  "flex items-center space-x-2 text-black",
                  pathname === route.href && "bg-accent text-accent-foreground"
                )}
                asChild
              >
                <Link href={route.href}>
                  <route.icon className="h-4 w-4 mr-2" />
                  <span>{route.label}</span>
                </Link>
              </Button>
            ))}
            {/* User Account Options */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2 ml-2 text-black">
                    <UserCircle className="h-4 w-4" />
                    {user.name}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => router.push('/account')}>
                    <User className="mr-2 h-4 w-4" />
                    <span>My Account</span>
                  </DropdownMenuItem>
                  {/* Only show My Reviews for non-admin users */}
                  {user.role !== 'admin' && (
                    <DropdownMenuItem onClick={() => router.push('/reviews/my-reviews')}>
                      <Star className="mr-2 h-4 w-4" />
                      <span>My Reviews</span>
                    </DropdownMenuItem>
                  )}
                  {user.role === 'admin' && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => router.push('/admin')}>
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Admin Dashboard</span>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link href="/auth/login">
                <Button variant="outline" className="gap-2 ml-2 text-black">
                  <LogIn className="h-4 w-4" />
                  Login
                </Button>
              </Link>
            )}
          </div>
          {/* Mobile menu button */}
          <div className="flex md:hidden">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleMenu}
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
              className="text-black"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>
      </div>
      {/* Mobile Navigation */}
      {isMenuOpen && (
        <motion.div 
          className="md:hidden"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
        >
          <nav className="flex flex-col p-4 border-t bg-gradient-to-r from-[#CEA657] to-[#F7E29C]">
            {routes.map((route) => (
              <Link 
                key={route.href}
                href={route.href} 
                className={cn(
                  "py-2 flex items-center space-x-2 hover:text-primary transition-colors text-black",
                  pathname === route.href && "text-primary font-medium"
                )}
                onClick={() => setIsMenuOpen(false)}
              >
                <route.icon className="h-4 w-4" />
                <span>{route.label}</span>
              </Link>
            ))}
            {/* User Account Options */}
            {user ? (
              <>
                <div className="border-t my-2"></div>
                <Link 
                  href="/account" 
                  className="py-2 flex items-center space-x-2 hover:text-primary transition-colors text-black" 
                  onClick={() => setIsMenuOpen(false)}
                >
                  <User className="h-4 w-4" />
                  <span>My Account</span>
                </Link>
                {/* Only show My Reviews for non-admin users */}
                {user.role !== 'admin' && (
                  <Link 
                    href="/reviews/my-reviews" 
                    className="py-2 flex items-center space-x-2 hover:text-primary transition-colors text-black" 
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Star className="h-4 w-4" />
                    <span>My Reviews</span>
                  </Link>
                )}
                {user.role === 'admin' && (
                  <Link 
                    href="/admin" 
                    className="py-2 flex items-center space-x-2 hover:text-primary transition-colors text-black" 
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Settings className="h-4 w-4" />
                    <span>Admin Dashboard</span>
                  </Link>
                )}
                <button 
                  className="py-2 flex items-center space-x-2 text-left hover:text-primary transition-colors text-black" 
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }}
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <>
                <div className="border-t my-2"></div>
                <Link 
                  href="/auth/login" 
                  className="py-2 flex items-center space-x-2 hover:text-primary transition-colors text-black" 
                  onClick={() => setIsMenuOpen(false)}
                >
                  <LogIn className="h-4 w-4" />
                  <span>Login</span>
                </Link>
                <Link 
                  href="/auth/signup" 
                  className="py-2 flex items-center space-x-2 hover:text-primary transition-colors text-black" 
                  onClick={() => setIsMenuOpen(false)}
                >
                  <User className="h-4 w-4" />
                  <span>Sign up</span>
                </Link>
              </>
            )}
          </nav>
        </motion.div>
      )}
    </nav>
  );
}