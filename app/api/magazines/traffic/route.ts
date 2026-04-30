import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, fail } from "@/lib/api-response";
import { requireRole } from "@/lib/rbac";
import { UserRole } from "@prisma/client";

// GET: Fetch magazine traffic statistics
export async function GET(request: NextRequest) {
    const auth = await requireRole([UserRole.ADMIN, UserRole.EDITOR]);
    if (auth.error) return auth.error;
    try {
        const searchParams = request.nextUrl.searchParams;
        const magazineId = searchParams.get("magazineId");
        const startDate = searchParams.get("startDate");
        const endDate = searchParams.get("endDate");

        const where: Record<string, unknown> = {};

        if (magazineId) {
            where.magazineId = parseInt(magazineId, 10);
        }

        if (startDate && endDate) {
            where.date = {
                gte: new Date(startDate),
                lte: new Date(endDate),
            };
        }

        // Get traffic data
        const trafficData = await prisma.magazineTraffic.findMany({
            where,
            orderBy: { date: "desc" },
        });

        // Get aggregate stats
        const stats = await prisma.magazineTraffic.groupBy({
            by: ['magazineId'],
            where,
            _sum: {
                views: true,
                downloads: true,
                shares: true,
            },
        });

        // Get magazine details
        const magazines = await prisma.magazine.findMany();

        // Combine data with magazine info
        const enrichedStats = stats.map((stat) => {
            const magazine = magazines.find((m) => m.id === stat.magazineId);
            return {
                magazineId: stat.magazineId,
                magazineTitle: magazine?.title,
                views: stat._sum.views || 0,
                downloads: stat._sum.downloads || 0,
                shares: stat._sum.shares || 0,
            };
        });

        return ok({
            stats: enrichedStats,
            trafficRecords: trafficData,
        });
    } catch (error) {
        console.error("Error fetching traffic data:", error);
        return fail("Failed to fetch traffic data", 500);
    }
}

// POST: Log a new traffic event
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { magazineId, eventType, userAgent, ipAddress } = body;

        if (!magazineId || !eventType) {
            return fail("magazineId and eventType are required", 400);
        }

        // Check if magazine exists
        const magazine = await prisma.magazine.findUnique({
            where: { id: parseInt(magazineId) },
        });

        if (!magazine) {
            return fail("Magazine not found", 404);
        }

        // Create traffic record
        const trafficRecord = await prisma.magazineTraffic.create({
            data: {
                magazineId: parseInt(magazineId, 10),
                views: eventType === "view" ? 1 : 0,
                downloads: eventType === "download" ? 1 : 0,
                shares: eventType === "share" ? 1 : 0,
                userAgent,
                ipAddress,
            },
        });

        return ok(trafficRecord, { status: 201 });
    } catch (error) {
        console.error("Error logging traffic:", error);
        return fail("Failed to log traffic event", 500);
    }
}
