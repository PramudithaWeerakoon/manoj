"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Music,
  Users,
  Calendar,
  ShoppingBag,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  FileText,
  Album,
  Radio,
  Loader2,
  Image as ImageIcon,
  MessageSquare,
  Mail,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "@/components/ui/use-toast"; 

// Define the activity type
type Activity = {
  id: number;
  action: string;
  description: string;
  timestamp: string;
};

// Define the stat type
type Stat = {
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down' | 'neutral';
  icon: any;
};

// Default stats with icons (will be updated with real data)
const defaultStats = [
  {
    title: "Total Albums",
    value: "0",
    change: "0%",
    trend: "neutral" as const,
    icon: Album,
  },
  {
    title: "Active Events",
    value: "0",
    change: "0%",
    trend: "neutral" as const,
    icon: Calendar,
  },
  {
    title: "Team Members",
    value: "0",
    change: "0%",
    trend: "neutral" as const,
    icon: Users,
  },
  {
    title: "Merchandise Sales",
    value: "$0",
    change: "0%",
    trend: "neutral" as const,
    icon: ShoppingBag,
  },
];

const quickActions = [
  {
    title: "Music",
    items: [
      { label: "Add Album", href: "/admin/music/albums/new", icon: Album },
      { label: "Add Track", href: "/admin/music/tracks/new", icon: Music },
      { label: "View Albums", href: "/admin/music/albums", icon: Album },
      { label: "View Tracks", href: "/admin/music/tracks", icon: Music },
      { label: "Add Member", href: "/admin/music/members/new", icon: Users },
      { label: "Music Player", href: "/admin/music/player", icon: Radio },
    ],
  },
  {
    title: "Content",
    items: [
      { label: "Categories", href: "/admin/events/new", icon: Calendar },
      
      { label: "New Post", href: "/admin/blog/new", icon: FileText },
      { label: "View Messages", href: "/admin/messages", icon: Mail },
      { label: "Add Product", href: "/admin/merchandise/new", icon: ShoppingBag },
      { label: "Hero Backgrounds", href: "/admin/background-images", icon: ImageIcon },
      { label: "Manage Reviews", href: "/admin/reviews", icon: MessageSquare },
      { label: "Newsletter", href: "/admin/newsletter", icon: Mail },
      { label: "Hire", href: "/admin/hire", icon: MessageSquare },
    ],
  },
];

export default function AdminDashboard() {
  
  // Add state for statistics
  const [stats, setStats] = useState<Stat[]>(defaultStats);
  const [statsLoading, setStatsLoading] = useState(true);
  
  // Add state for activities
  const [recentActivity, setRecentActivity] = useState<Activity[]>([]);
  const [activitiesLoading, setActivitiesLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch statistics from the API
  useEffect(() => {
    async function fetchStats() {
      try {
        setStatsLoading(true);
        const response = await fetch('/api/admin/stats');
        
        if (!response.ok) {
          throw new Error('Failed to fetch statistics');
        }
        
        const data = await response.json();
        
        if (data.success && data.stats) {
          // Merge the fetched data with our default stats (keeping the icons)
          const updatedStats = defaultStats.map(defaultStat => {
            const matchingStat = data.stats.find(
              (stat: any) => stat.title === defaultStat.title
            );
            return matchingStat 
              ? { ...matchingStat, icon: defaultStat.icon } 
              : defaultStat;
          });
          setStats(updatedStats);
        }
      } catch (err) {
        console.error('Error fetching statistics:', err);
        toast({
          title: 'Error',
          description: 'Failed to fetch statistics',
          variant: 'destructive',
        });
      } finally {
        setStatsLoading(false);
      }
    }

    fetchStats();
  }, [toast]);

  // Fetch activities from the API
  useEffect(() => {
    async function fetchActivities() {
      try {
        setActivitiesLoading(true);
        const response = await fetch('/api/recent-music-activities');
        
        if (!response.ok) {
          throw new Error('Failed to fetch activities');
        }
        
        const data = await response.json();
        setRecentActivity(data);
        setError(null);
      } catch (err) {
        setError('Could not load recent activities');
        console.error(err);
      } finally {
        setActivitiesLoading(false);
      }
    }

    fetchActivities();
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back, Admin</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {statsLoading ? (
                  <div className="flex justify-center">
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </div>
                ) : (
                  <>
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <div className="flex items-center text-sm">
                      {stat.trend === "up" ? (
                        <ArrowUpRight className="h-4 w-4 text-green-500" />
                      ) : stat.trend === "down" ? (
                        <ArrowDownRight className="h-4 w-4 text-red-500" />
                      ) : (
                        <TrendingUp className="h-4 w-4 text-yellow-500" />
                      )}
                      <span
                        className={
                          stat.trend === "up"
                            ? "text-green-500"
                            : stat.trend === "down"
                            ? "text-red-500"
                            : "text-yellow-500"
                        }
                      >
                        {stat.change}
                      </span>
                      <span className="text-muted-foreground ml-1">vs last month</span>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {quickActions.map((section, sectionIndex) => (
          <motion.div
            key={section.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 + sectionIndex * 0.1 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>{section.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {section.items.map((item) => (
                    <Link key={item.label} href={item.href}>
                      <Button className="w-full h-24 flex flex-col items-center justify-center gap-2">
                        <item.icon className="h-6 w-6" />
                        {item.label}
                      </Button>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Recent Music Updates</CardTitle>
          </CardHeader>
          <CardContent>
            {activitiesLoading ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : error ? (
              <div className="text-center py-8 text-muted-foreground">{error}</div>
            ) : recentActivity.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No recent music updates found</div>
            ) : (
              <div className="space-y-6">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-4">
                    <div className="w-2 h-2 mt-2 rounded-full bg-primary" />
                    <div className="flex-1 space-y-1">
                      <p className="font-medium">{activity.action}</p>
                      <p className="text-sm text-muted-foreground">
                        {activity.description}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {activity.timestamp}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}