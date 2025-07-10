import { NextRequest, NextResponse } from "next/server";
import { getMovieCredits } from "@/lib/tmdb";

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const movieId = searchParams.get("id");

        if (!movieId) {
            return NextResponse.json({ error: "Missing movie ID" }, { status: 400 });
        }

        const creditsData = await getMovieCredits(movieId);
        return NextResponse.json(creditsData);
    } catch (error) {
        console.error("Failed to fetch movie credits:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
