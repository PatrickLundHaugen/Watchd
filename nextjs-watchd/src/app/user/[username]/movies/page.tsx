"use client";

import { notFound, useRouter } from "next/navigation";
import {IoIosArrowBack} from "react-icons/io";
import Link from "next/link";
import React, { useEffect, useState, use } from "react";
import { getMovieDetails, TmdbMovieDetails } from "@/lib/tmdb";

interface Props {
    params: Promise<{ username: string }>;
}

interface PrismaUserMovie {
    id: number; // Prisma's internal ID for the UserMovie record
    userId: number;
    tmdbId: number; // The TMDB movie ID
    label: string; // The movie title (as stored in your DB)
    createdAt: string;
}

interface DisplayMovie extends PrismaUserMovie, Partial<TmdbMovieDetails> {}

export default function Page({ params }: Props) {
    const { username } = use(params);
    const router = useRouter();

    const [movieList, setMovieList] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        const fetchAndHydrateMovieList = async () => {
            setLoading(true); // Start loading
            try {
                const res = await fetch(`/api/user/${username}/movie-list`);
                if (!res.ok) throw new Error("Failed to fetch user movie list");
                const prismaMovies: PrismaUserMovie[] = await res.json();

                if (prismaMovies.length === 0) {
                    setMovieList([]);
                    setLoading(false);
                    return;
                }

                const tmdbDetailsPromises = prismaMovies.map(async (movie) => {
                    try {
                        const tmdbMovie = await getMovieDetails(movie.tmdbId);
                        return { ...movie, ...tmdbMovie };
                    } catch (tmdbError) {
                        console.error(`Failed to fetch TMDB details for movie ID ${movie.tmdbId}:`, tmdbError);
                        // If TMDB fetch fails, still return the Prisma data and indicate missing TMDB fields
                        return { ...movie, poster_path: null, release_date: null, vote_average: null };
                    }
                });

                const fullMovieList = await Promise.all(tmdbDetailsPromises);
                setMovieList(fullMovieList);

            } catch (err) {
                console.error("Error fetching movie list:", err);
                setError(true);
            } finally {
                setLoading(false); // End loading
            }
        };

        fetchAndHydrateMovieList();
    }, [username]);

    if (error) return notFound();

    const getScoreColor = (score: number = 0) => {
        if (score >= 7) return "text-green-500";
        if (score >= 4) return "text-yellow-500";
        return "text-red-500";
    };

    return (
        <main className="container flex flex-col gap-8 mx-auto min-h-screen max-w-6xl p-4 md:p-8">
            <Link href={`/user/${username}`} className="inline-flex items-center gap-1 hover:underline">
                <IoIosArrowBack />
                Back to {username}
            </Link>

            <h1 className="text-2xl font-bold mb-4">{username}'s Movie List</h1>

            {loading ? (
                <div className="text-center text-muted-foreground py-8">Loading movies...</div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    {movieList.length > 0 ? (
                        movieList.map((movie) => (
                            <Link
                                // Use movie.id (from Prisma) as the key, as it's unique for each UserMovie record
                                key={movie.id}
                                // Link to the detailed movie page using its TMDB ID
                                href={`/movie/${movie.tmdbId}`}
                                className="flex flex-col bg-card rounded-xl border border-input shadow-sm overflow-hidden hover:shadow-md transition"
                            >
                                {/* Display Poster */}
                                {movie.poster_path ? (
                                    <img
                                        src={`https://image.tmdb.org/t/p/w342${movie.poster_path}`}
                                        alt={movie.label} // Use the label from your database as alt text
                                        width={342}
                                        height={513} // TMDB poster aspect ratio is typically 2:3, so height = width * 1.5
                                        className="w-full rounded-t-xl object-cover aspect-[2/3]"
                                    />
                                ) : (
                                    // Placeholder if no poster is available
                                    <div className="bg-muted h-64 w-full flex items-center justify-center text-muted-foreground rounded-t-xl text-sm">
                                        No Poster
                                    </div>
                                )}
                                <div className="flex flex-col justify-between grow gap-2 p-4">
                                    <div>
                                        {/* Display Title (using label from your DB, which should match TMDB title) */}
                                        <h2 className="leading-none font-semibold text-lg line-clamp-2" title={movie.label}>{movie.label}</h2>
                                        {/* Display Release Date (from TMDB) */}
                                        {movie.release_date && (
                                            <p className="text-sm text-muted-foreground">
                                                {movie.release_date.slice(0, 4)} {/* Display year only */}
                                            </p>
                                        )}
                                    </div>
                                    {/* Display Rating (from TMDB) */}
                                    {movie.vote_average !== null && movie.vote_average !== undefined && (
                                        <p className={`leading-none font-semibold ${getScoreColor(movie.vote_average)}`}>
                                            {movie.vote_average.toFixed(1)}
                                        </p>
                                    )}
                                </div>
                            </Link>
                        ))
                    ) : (
                        // Message if the list is empty
                        <p className="col-span-full text-center text-muted-foreground py-8">
                            No movies added to your list yet.
                        </p>
                    )}
                </div>
            )}
        </main>
    );
}
