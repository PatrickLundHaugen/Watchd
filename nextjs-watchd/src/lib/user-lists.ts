import prisma from "@/lib/prisma";
import {getTvDetails} from "@/lib/tmdb";

export async function getUserSeries(username: string) {
    const user = await prisma.user.findUnique({
        where: { username },
        select: { id: true },
    });

    if (!user) return null;

    const recents = await prisma.recent.findMany({
        where: {
            userId: user.id,
            mediaType: "tv",
        },
        orderBy: { createdAt: "desc" },
    });

    return await Promise.all(
        recents.map((item: { tmdbId: number }) => getTvDetails(item.tmdbId.toString()))
    );
}