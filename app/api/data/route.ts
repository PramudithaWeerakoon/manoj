import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  const stats = await prisma.stat.findMany();
  const quickActions = await prisma.quickAction.findMany();
  const recentActivity = await prisma.recentActivity.findMany();

  return NextResponse.json({ stats, quickActions, recentActivity });
}