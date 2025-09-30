import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest, { params }: { params: Promise<{ username: string }> }) {
    const { username } = await params;

    const user = await prisma.user.findUnique({
        where: { username },
        select: { id: true },
    });

    if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const recent = await prisma.recent.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
        take: 4,
    });

    return NextResponse.json(recent);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ username: string }> }) {
    const { username } = await params;
    const body = await req.json();
    const { tmdbId, mediaType } = body;

    if (!tmdbId || !mediaType) {
        return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
        where: { username },
    });

    if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const entry = await prisma.recent.create({
        data: {
            userId: user.id,
            tmdbId,
            mediaType,
        },
    });

    return NextResponse.json(entry);
}
