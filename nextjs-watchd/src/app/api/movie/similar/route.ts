import { NextResponse } from 'next/server';
import { getSimilarMovies } from "@/lib/tmdb";

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const id = params.id;
        if (!id) {
            return NextResponse.json({ message: "Movie ID is required" }, { status: 400 });
        }
        const similarMovies = await getSimilarMovies(id);
        return NextResponse.json(similarMovies);
    } catch (error) {
        console.error("API Error fetching similar movies:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}