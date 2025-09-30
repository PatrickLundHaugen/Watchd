"use client";

import { useSearchParams } from 'next/navigation';
import React, { useEffect, useState, Suspense } from 'react';
import {Separator} from "@/components/ui/separator";
import Link from "next/link";
import Image from 'next/image'

type SearchResult =
    | {
    id: number;
    media_type: "movie";
    title: string;
    release_date?: string;
    poster_path?: string;
    overview?: string;
}
    | {
    id: number;
    media_type: "tv";
    title: string;
    name: string;
    first_air_date?: string;
    poster_path?: string;
    overview?: string;
}
    | {
    id: number;
    media_type: "person";
    name: string;
    profile_path?: string;
    known_for: Array<{
        media_type: "movie" | "tv";
        title?: string;
        name?: string;
    }>;
};

function SearchContent() {
    const searchParams = useSearchParams();
    const query = searchParams.get('query');
    const [results, setResults] = useState<SearchResult[]>([]);

    useEffect(() => {
        if (!query) {
            setResults([]);
            return;
        }

        const fetchResults = async () => {
            try {
                const res = await fetch(`/api/search/multi?query=${encodeURIComponent(query)}`);
                const data = await res.json();
                setResults(data.results || []);
            } catch (error) {
                console.error("Search fetch error:", error);
                setResults([]);
            }
        };

        fetchResults();
    }, [query]);

    if (!query) {
        return <p className="p-4 max-w-6xl mx-auto">No search query provided.</p>;
    }

    return (
        <main className="container p-4 max-w-6xl mx-auto min-h-screen">
            <h1 className="text-3xl font-semibold mb-4">{`Results for "${query}"`}</h1>
            {results.length === 0 ? (
                <p>No results found.</p>
            ) : (
                <>
                    <div className="flex flex-col gap-8">
                        {results.some(item => item.media_type === "movie") && (
                            <>
                                <h2 className="text-2xl font-medium tracking-tight">Movies</h2>
                                <div className="flex flex-col gap-2">
                                    {results
                                        .filter(item => item.media_type === "movie")
                                        .map(movie => (
                                            <div key={movie.id} className="flex gap-2">
                                                <div className="shrink-0">
                                                    {movie.poster_path ? (
                                                        <Image
                                                            src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                                                            width={500}
                                                            height={750}
                                                            alt={movie.title}
                                                            className="aspect-2/3 w-16 object-cover rounded"
                                                        />
                                                    ) : (
                                                        <div className="aspect-2/3 w-16 bg-muted rounded flex items-center justify-center text-xs text-muted-foreground">
                                                            N/A
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="inline-flex items-center gap-1">
                                                        <Link href={`/movie/${movie.id}`} className="text-lg font-medium cursor-pointer hover:underline">{movie.title}</Link>
                                                        <p className="text-lg text-muted-foreground">({movie.release_date?.slice(0, 4)})</p>
                                                    </div>
                                                    <p className="text-sm text-muted-foreground line-clamp-3">{movie.overview}</p>
                                                </div>
                                            </div>
                                        ))}
                                </div>
                            </>
                        )}


                        {results.some(item => item.media_type === "tv") && (
                            <>
                                <Separator />
                                <h2 className="text-xl font-medium tracking-tight">TV Shows</h2>
                                <div className="flex flex-col gap-2">
                                    {results
                                        .filter(item => item.media_type === "tv")
                                        .map(tv => (
                                            <div key={tv.id} className="flex gap-2">
                                                <div className="shrink-0">
                                                    {tv.poster_path ? (
                                                        <Image
                                                            src={`https://image.tmdb.org/t/p/w500${tv.poster_path}`}
                                                            width={500}
                                                            height={750}
                                                            alt={tv.title}
                                                            className="aspect-2/3 w-16 object-cover rounded"
                                                        />
                                                    ) : (
                                                        <div className="aspect-2/3 w-16 bg-muted rounded flex items-center justify-center text-xs text-muted-foreground">
                                                            N/A
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="inline-flex items-center gap-1">
                                                        <Link href={`/tv/${tv.id}`} className="text-lg font-medium cursor-pointer hover:underline">{tv.name}</Link>
                                                        <p className="text-lg text-muted-foreground">({tv.first_air_date?.slice(0, 4)})</p>
                                                    </div>
                                                    <p className="text-sm text-muted-foreground line-clamp-3">{tv.overview}</p>
                                                </div>
                                            </div>
                                        ))}
                                </div>

                            </>
                        )}


                        {results.some(item => item.media_type === "person") && (
                            <>
                                <Separator />
                                <h2 className="text-xl font-medium tracking-tight">People</h2>
                                <div className="flex flex-col gap-2">
                                    {results
                                        .filter(item => item.media_type === "person")
                                        .map(person => {
                                            const knownForMovies = person.known_for
                                                .filter((item: { media_type: string; }) => item.media_type === "movie")
                                                .slice(0, 3)
                                                .map(movie => movie.title ?? "Unknown")
                                                .join(', ');

                                            return (
                                                <div key={person.id} className="flex gap-2">
                                                    <div className="shrink-0">
                                                        {person.profile_path ? (
                                                            <Image
                                                                src={`https://image.tmdb.org/t/p/w500${person.profile_path}`}
                                                                width={500}
                                                                height={750}
                                                                alt={person.name}
                                                                className="aspect-2/3 w-16 object-cover rounded"
                                                            />
                                                        ) : (
                                                            <div className="aspect-2/3 w-16 bg-muted rounded flex items-center justify-center text-xs text-muted-foreground">
                                                                N/A
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <Link href={`/movie/${person.id}`} className="text-lg font-medium cursor-pointer hover:underline">{person.name}</Link>
                                                        <p className="text-sm text-muted-foreground">Known for: {knownForMovies}</p>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                </div>
                            </>
                        )}
                    </div>
                </>
            )}
        </main>
    );
}

export default function Page() {
    return (
        <Suspense fallback={<div className="p-4 max-w-6xl mx-auto">Loading search results...</div>}>
            <SearchContent />
        </Suspense>
    );
}