import { NextResponse } from "next/server";
import { getNowPlayingMovies } from "@/lib/tmdb";

export async function GET() {
    try {
        const nowPlayingData = await getNowPlayingMovies();
        return NextResponse.json(nowPlayingData);
    } catch (error) {
        console.error("Failed to fetch now playing movies:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}