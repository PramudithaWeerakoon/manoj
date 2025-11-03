import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    // Get current date and date for a month ago
    const now = new Date();
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    // Get current counts
    const [
      totalAlbums,
      activeEvents,
      bandMembers,
      albumsLastMonth,
      eventsLastMonth,
      membersLastMonth
    ] = await Promise.all([
      // Current counts
      prisma.album.count(),
      prisma.event.count({
        where: {
          date: {
            gte: now
          }
        }
      }),
      prisma.member.count(),
      
      // Counts from last month (albums created before a month ago)
      prisma.album.count({
        where: {
          release_date: {
            lt: oneMonthAgo
          }
        }
      }),
      prisma.event.count({
        where: {
          date: {
            gte: oneMonthAgo,
            lt: now
          }
        }
      }),
      prisma.member.count({
        where: {
          joinDate: {
            lt: oneMonthAgo
          }
        }
      })
    ]);

    // Calculate percentage changes
    const calculateChange = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? '100%' : '0%';
      const change = ((current - previous) / previous) * 100;
      return `${change > 0 ? '+' : ''}${Math.round(change)}%`;
    };

    const albumChange = calculateChange(totalAlbums, albumsLastMonth);
    const eventsChange = calculateChange(activeEvents, eventsLastMonth);
    const membersChange = calculateChange(bandMembers, membersLastMonth);

    // Determine trends
    const getTrend = (current: number, previous: number) => {
      if (current > previous) return 'up';
      if (current < previous) return 'down';
      return 'neutral';
    };

    return NextResponse.json({
      success: true,
      stats: [
        {
          title: "Total Albums",
          value: totalAlbums.toString(),
          change: albumChange,
          trend: getTrend(totalAlbums, albumsLastMonth)
        },
        {
          title: "Active Events",
          value: activeEvents.toString(),
          change: eventsChange,
          trend: getTrend(activeEvents, eventsLastMonth)
        },
        {
          title: "Team Members",
          value: bandMembers.toString(),
          change: membersChange,
          trend: getTrend(bandMembers, membersLastMonth)
        }
      ]
    });
  } catch (error) {
    console.error('Failed to fetch dashboard stats:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch dashboard statistics' },
      { status: 500 }
    );
  }
}
