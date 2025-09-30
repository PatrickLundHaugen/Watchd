"use client";

import { notFound, useRouter } from "next/navigation";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {use, useEffect, useState} from "react";
import { useUser } from "@/components/context/user-context";
import type {TmdbMovieDetails, TmdbMultiSearchResponse, TmdbSearchResult, TmdbTvDetails} from "@/lib/tmdb";
import Link from "next/link";
import Image from 'next/image'

type TmdbItem = TmdbMovieDetails | TmdbTvDetails;

function isPerson(item: TmdbItem | TmdbSearchResult): item is TmdbSearchResult & { media_type: "person" } {
    return "media_type" in item && item.media_type === "person" && "known_for_department" in item;
}

export default function Page({ params }: { params: Promise<{ username: string }> }) {
    const { username } = use(params);
    const router = useRouter();
    const { user, setUser } = useUser();

    const [favorites, setFavorites] = useState<TmdbItem[]>([]);
    const [recents, setRecents] = useState<TmdbItem[]>([]);

    const [openDialogIndex, setOpenDialogIndex] = useState<number | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<TmdbSearchResult[]>([]);
    const [loadingSearch, setLoadingSearch] = useState(false);

    const [movieCount, setMovieCount] = useState<number | null>(null);
    const [seriesCount, setSeriesCount] = useState<number | null>(null);

    useEffect(() => {
        if (!user || user.username !== username) {
            router.push("/");
        }
    }, [user, username, router]);

    useEffect(() => {
        if (!user || user.username !== username) return;

        const fetchItemsAndCounts = async () => {
            try {
                const favRes = await fetch(`/api/user/${username}/favorite`);

                if (!favRes.ok) {
                    console.error(`Failed to fetch favorites: ${favRes.status} ${favRes.statusText}`);
                    setFavorites([]);
                } else {
                    const favFull = await favRes.json();
                    setFavorites(favFull);
                }

                const countsRes = await fetch(`/api/user/${username}/counts`);
                if (!countsRes.ok) {
                    console.error(`Failed to fetch counts: ${countsRes.status} ${countsRes.statusText}`);
                    setMovieCount(0);
                    setSeriesCount(0);
                } else {
                    const countsData = await countsRes.json();
                    setMovieCount(countsData.movieCount);
                    setSeriesCount(countsData.seriesCount);
                }


                setRecents([]);
            } catch (error) {
                console.error("Error fetching initial user items or counts:", error);
                setFavorites([]);
                setRecents([]);
                setMovieCount(0);
                setSeriesCount(0);
            }
        };

        fetchItemsAndCounts();
    }, [user, username]);

    const handleLogout = async () => {
        setUser(null);
        router.push("/");
    };

    if (!username) return notFound();

    const handleSearch = async (query: string) => {
        if (query.length < 2) {
            setSearchResults([]);
            return;
        }

        setLoadingSearch(true);
        try {
            const res = await fetch(`/api/search/multi?query=${encodeURIComponent(query)}`);
            const data: TmdbMultiSearchResponse = await res.json();

            const filtered = data.results.filter(
                (item: TmdbSearchResult) => item.media_type === "movie" || item.media_type === "tv"
            );
            setSearchResults(filtered);
        } catch (err) {
            console.error("Search failed:", err);
            setSearchResults([]);
        } finally {
            setLoadingSearch(false);
        }
    };

    const displayedResults = searchResults.slice(0, 10);

    const handleAddFavorite = async (item: TmdbSearchResult) => {
        if (openDialogIndex === null) return;

        const res = await fetch(`/api/user/${username}/favorite`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                tmdbId: item.id,
                mediaType: item.media_type,
                label: item.title || item.name,
                slotIndex: openDialogIndex,
            }),
        });

        if (!res.ok) {
            const errorData = await res.json();
            console.error("Failed to add favorite:", errorData.error);
            return;
        }

        const { fullItem } = await res.json();

        const updated = [...favorites];
        updated[openDialogIndex] = fullItem;
        setFavorites(updated);

        setOpenDialogIndex(null);
        setSearchQuery("");
        setSearchResults([]);
    };

    const getScoreColor = (score: number = 0) => {
        if (score >= 7) return "text-green-500";
        if (score >= 4) return "text-yellow-500";
        return "text-red-500";
    };

    return (
        <main className="container flex flex-col gap-8 mx-auto min-h-screen max-w-6xl p-4 md:p-8">
            <div className="flex gap-8 flex-wrap md:flex-nowrap">
                <Card className="w-full lg:w-1/3">
                    <CardHeader>
                        <CardTitle>{username}</CardTitle>
                        {user?.createdAt && (
                            <CardDescription>
                                    Joined: {new Date(user.createdAt).toLocaleDateString()}
                            </CardDescription>
                        )}
                    </CardHeader>
                    <CardContent className="flex flex-col gap-2">
                        <div className="inline-flex items-center justify-between w-full">
                            <span>Movies:</span>
                            <span> {movieCount !== null ? movieCount : 'Loading...'}</span>
                        </div>
                        <div className="inline-flex items-center justify-between w-full">
                            <span>TV Series:</span>
                            <span> {seriesCount !== null ? seriesCount : 'Loading...'}</span>
                        </div>
                        <div className="flex gap-2 *:flex-1">
                            <Button asChild>
                                <Link href={`/user/${username}/movies`}>Movie List</Link>
                            </Button>
                            <Button asChild>
                                <Link href={`/user/${username}/series`}>TV Series List</Link>
                            </Button>
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button
                            variant="secondary"
                            onClick={handleLogout}
                            className="text-red-700 w-full"
                        >
                            Log out
                        </Button>
                    </CardFooter>
                </Card>

                <div className="flex flex-col gap-8 w-full">
                    <section>
                        <div className="flex justify-between items-center mb-2">
                            <h2 className="text-lg font-semibold">Favorites</h2>
                        </div>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            {[0, 1, 2, 3].map((index) => {
                                const item = favorites[index];

                                return (
                                    <Dialog
                                        key={index}
                                        open={openDialogIndex === index}
                                        onOpenChange={(v) => setOpenDialogIndex(v ? index : null)}
                                    >
                                        <div
                                            className={`flex flex-col bg-card rounded-xl border border-input shadow-sm overflow-hidden ${
                                                !item
                                                    ? "border-dashed border-2 border-muted-foreground hover:bg-primary/10 cursor-pointer"
                                                    : "relative group"
                                            }`}
                                        >
                                            {item ? (
                                                <>
                                                    <DialogTrigger asChild>
                                                        <Button
                                                            variant="secondary"
                                                            size="sm"
                                                            className="absolute top-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"
                                                        >
                                                            Change
                                                        </Button>
                                                    </DialogTrigger>

                                                    <div>
                                                        {item.poster_path ? (
                                                            <Image
                                                                src={`https://image.tmdb.org/t/p/w500${item.poster_path}`}
                                                                width={500}
                                                                height={750}
                                                                alt={('title' in item ? item.title : item.name) || "Poster"}
                                                                className="rounded"
                                                            />
                                                        ) : (
                                                            <div className="bg-muted h-72 mb-2 rounded"/>
                                                        )}
                                                    </div>
                                                    <div className="flex flex-col justify-between grow gap-2 p-4">
                                                        <div>
                                                            <Link
                                                                href={`/${'title' in item ? 'movie' : 'tv'}/${item.id}`}
                                                                className="leading-none font-semibold tracking-tight cursor-pointer hover:underline"
                                                            >
                                                                {'title' in item ? item.title : item.name}
                                                            </Link>
                                                            <p className="text-sm text-muted-foreground">
                                                                {('release_date' in item ? item.release_date : item.first_air_date)?.slice(0, 4)}
                                                            </p>
                                                        </div>
                                                        <p className={`leading-none font-semibold ${getScoreColor(item.vote_average)}`}>
                                                            {item.vote_average?.toFixed(1)}
                                                        </p>
                                                    </div>
                                                </>
                                            ) : (
                                                <DialogTrigger asChild>
                                                    <CardContent className="flex items-center justify-center flex-grow flex-col">
                                                        <span className="text-muted-foreground text-sm">Add</span>
                                                    </CardContent>
                                                </DialogTrigger>
                                            )}
                                        </div>

                                        <DialogContent className="max-w-lg">
                                            <DialogHeader>
                                                <DialogTitle>Select a favorite</DialogTitle>
                                                <DialogDescription>Search and select a movie or TV show to add to your favorites.</DialogDescription>
                                            </DialogHeader>
                                            <Input
                                                placeholder="Search for a movie or show..."
                                                value={searchQuery}
                                                onChange={(e) => {
                                                    setSearchQuery(e.target.value);
                                                    handleSearch(e.target.value);
                                                }}
                                                autoComplete="off"
                                            />
                                            <div className="max-h-80 overflow-y-auto mt-2">
                                                <ul className="divide-y divide-border">
                                                    {displayedResults.map((item) => (
                                                        <li key={item.id}>
                                                            <div
                                                                onClick={() => handleAddFavorite(item)}
                                                                className="flex gap-2 p-2 cursor-pointer hover:bg-accent rounded"
                                                                role="button"
                                                                tabIndex={0}
                                                                onKeyDown={(e) => {
                                                                    if (e.key === "Enter") handleAddFavorite(item);
                                                                }}
                                                            >
                                                                {item.poster_path ? (
                                                                    <Image
                                                                        src={`https://image.tmdb.org/t/p/w92${item.poster_path}`}
                                                                        width={500}
                                                                        height={750}
                                                                        alt={item.title || item.name || "Poster"}
                                                                        className="aspect-2/3 w-12 object-cover rounded"
                                                                    />
                                                                ) : (
                                                                    <div className="aspect-2/3 w-12 bg-muted rounded flex items-center justify-center text-xs text-muted-foreground">
                                                                        N/A
                                                                    </div>
                                                                )}
                                                                <div className="flex flex-col justify-between">
                                                                    <div>
                                                                        <p className="leading-none font-bold">{"title" in item && item.title || item.name}</p>
                                                                        <p className="text-muted-foreground text-sm">
                                                                            {(() => {
                                                                                if (isPerson(item)) {
                                                                                    return item.known_for_department || "Person";
                                                                                } else if ("first_air_date" in item) {
                                                                                    return item.first_air_date?.slice(0, 4) || "—";
                                                                                } else if ("release_date" in item) {
                                                                                    return item.release_date?.slice(0, 4) || "—";
                                                                                }
                                                                                return "—";
                                                                            })()}
                                                                        </p>
                                                                    </div>
                                                                    <p className="text-sm">
                                                                        <span className={`font-semibold ${getScoreColor(item.vote_average)}`}>
                                                                            {item.vote_average?.toFixed(1)}
                                                                        </span>{" "}
                                                                        <span className="text-muted-foreground">({item.vote_count})</span>
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </li>
                                                    ))}
                                                    {loadingSearch && (
                                                        <li className="p-4 text-center text-muted-foreground">Searching...</li>
                                                    )}
                                                    {!loadingSearch && searchQuery.length >= 2 && displayedResults.length === 0 && (
                                                        <li className="p-4 text-center text-muted-foreground">
                                                            {`No results found for "${searchQuery}".`}
                                                        </li>
                                                    )}
                                                </ul>
                                            </div>
                                        </DialogContent>
                                    </Dialog>
                                );
                            })}
                        </div>
                    </section>

                    <section>
                        <h2 className="font-bold text-lg mb-2">Recent</h2>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                            {recents.map((item, i) => (
                                <div key={i} className="bg-muted rounded p-2">
                                    <Image
                                        src={`https://image.tmdb.org/t/p/w300${item.poster_path}`}
                                        width={500}
                                        height={750}
                                        alt={"title" in item ? item.title : item.name}
                                        className="w-full rounded mb-2"
                                    />
                                    <p className="font-medium">{'title' in item ? item.title : item.name}</p>
                                    <p className="text-xs text-muted-foreground">
                                        {'release_date' in item ? item.release_date : item.first_air_date}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            </div>
        </main>
    );
}