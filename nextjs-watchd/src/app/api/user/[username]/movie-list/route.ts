import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest, { params }: { params: Promise<{ username: string }> }) {
    const { username } = await params;

    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const movies = await prisma.userMovie.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(movies);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ username: string }> }) {
    const { username } = await params;
    const { tmdbId, label } = await req.json();

    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const existing = await prisma.userMovie.findFirst({
        where: { userId: user.id, tmdbId },
    });

    if (existing) {
        return NextResponse.json({ success: false, error: "Movie already in your list" }, { status: 400 });
    }

    try {
        const added = await prisma.userMovie.create({
            data: {
                userId: user.id,
                tmdbId,
                label,
            },
        });

        return NextResponse.json({ success: true, item: added });
    } catch (error) {
        console.error("Error adding movie to list:", error);
        return NextResponse.json({ success: false, error: "Failed to add movie to list." }, { status: 500 });
    }
}