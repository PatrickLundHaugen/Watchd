import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getMovieDetails, getTvDetails } from "@/lib/tmdb";

export async function GET(req: NextRequest, { params }: { params: Promise<{ username: string }> }) {
    const { username } = await params;

    const user = await prisma.user.findUnique({
        where: { username },
        select: { id: true },
    });

    if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const favoriteRecords = await prisma.favorite.findMany({
        where: { userId: user.id },
        orderBy: { position: "asc" },
    });

    const fullFavorites = await Promise.all(
        favoriteRecords.map(async (item: { tmdbId: number; mediaType: string; label: string | null }) => {
            try {
                if (item.mediaType === "movie") {
                    return await getMovieDetails(item.tmdbId.toString());
                } else {
                    return await getTvDetails(item.tmdbId.toString());
                }
            } catch (error) {
                console.error(`Failed to fetch TMDB details for favorite ${item.tmdbId}:`, error);
                return {
                    id: item.tmdbId.toString(),
                    title: item.label || "Unknown Title",
                    name: item.label || "Unknown Title",
                    poster_path: null,
                    release_date: null,
                    first_air_date: null,
                    vote_average: 0,
                };
            }
        })
    );

    return NextResponse.json(fullFavorites);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ username: string }> }) {
    const { username } = await params;
    const body = await req.json();
    const { tmdbId, mediaType, label, slotIndex } = body;

    if (!tmdbId || !mediaType || typeof slotIndex !== "number") {
        return NextResponse.json({ error: "Missing or invalid fields" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
        where: { username },
    });

    if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if a favorite already exists at this position
    const existing = await prisma.favorite.findFirst({
        where: {
            userId: user.id,
            position: slotIndex,
        },
    });

    if (existing) {
        await prisma.favorite.delete({
            where: { id: existing.id },
        });
    }

    const favorite = await prisma.favorite.create({
        data: {
            userId: user.id,
            tmdbId,
            mediaType,
            label,
            position: slotIndex,
        },
    });

    let fullItem;
    try {
        fullItem = mediaType === "movie"
            ? await getMovieDetails(tmdbId)
            : await getTvDetails(tmdbId);
    } catch (error) {
        console.error("TMDB fetch error:", error);
        return NextResponse.json(
            { error: "Favorite added, but TMDB fetch failed", favorite },
            { status: 200 }
        );
    }

    return NextResponse.json({ favorite, fullItem });
}