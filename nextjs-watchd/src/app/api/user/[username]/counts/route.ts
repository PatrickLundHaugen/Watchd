import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest, { params }: { params: Promise<{ username: string }> }) {
    const { username } = await params;

    try {
        const user = await prisma.user.findUnique({ where: { username } });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Count movies associated with this user
        const movieCount = await prisma.userMovie.count({
            where: { userId: user.id },
        });

        // You can add counts for series and favorites later if needed
        const seriesCount = await prisma.userSeries.count({
            where: { userId: user.id },
        });
        const favoriteCount = await prisma.favorite.count({
            where: { userId: user.id },
        });

        return NextResponse.json({
            movieCount,
            seriesCount,
            favoriteCount,
        });
    } catch (error) {
        console.error("Error fetching user counts:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}