import { NextRequest, NextResponse } from "next/server";
import { getPersonDetails } from "@/lib/tmdb";

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
        return NextResponse.json({ error: "Missing person ID" }, { status: 400 });
    }

    try {
        const personData = await getPersonDetails(id);
        return NextResponse.json({
            id: personData.id,
            name: personData.name,
            known_for_department: personData.known_for_department,
        });
    } catch (error) {
        console.error(`Failed to get person details for ID ${id}:`, error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}