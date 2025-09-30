import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest, { params }: { params: { username: string } }) {
    const { username } = params;

    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const series = await prisma.userSeries.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(series);
}

export async function POST(req: NextRequest, { params }: { params: { username: string } }) {
    const { username } = params;
    const { tmdbId, label } = await req.json();

    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const existing = await prisma.userSeries.findFirst({
        where: { userId: user.id, tmdbId },
    });

    if (existing) {
        return NextResponse.json({ error: "Already in series list" }, { status: 400 });
    }

    const added = await prisma.userSeries.create({
        data: {
            userId: user.id,
            tmdbId,
            label,
        },
    });

    return NextResponse.json({ success: true, item: added });
}
