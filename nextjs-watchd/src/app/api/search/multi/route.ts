import { NextRequest, NextResponse } from "next/server";
import { searchMulti, getPersonDetails, TmdbSearchResult } from "@/lib/tmdb";

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("query");

    if (!query) {
        return NextResponse.json({ error: "Missing query" }, { status: 400 });
    }

    try {
        const searchData = await searchMulti(query);

        const enhancedResults = await Promise.all(
            searchData.results.map(async (item: TmdbSearchResult) => {
                if (item.media_type === 'person') {
                    try {
                        const personDetails = await getPersonDetails(item.id);
                        return { ...item, known_for_department: personDetails.known_for_department };
                    } catch (personError) {
                        console.error(`Failed to fetch details for person ID ${item.id}:`, personError);
                        return item;
                    }
                }
                return item;
            })
        );

        return NextResponse.json({ ...searchData, results: enhancedResults });

    } catch (error) {
        console.error(`Multi-search failed for query "${query}":`, error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}