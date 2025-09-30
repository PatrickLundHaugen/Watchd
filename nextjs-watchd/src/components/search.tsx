"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useDebounce } from "@/components/hooks/use-debounce";
import Link from "next/link";
import Image from 'next/image'
import { IoIosSearch } from "react-icons/io";
import { TmdbSearchResult } from "@/lib/tmdb";

export const Search = ({ placeholder }: { placeholder: string }) => {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<TmdbSearchResult[]>([]);
    const [isFocused, setIsFocused] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);

    const debouncedQuery = useDebounce(query, 300);
    const abortControllerRef = useRef<AbortController | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const router = useRouter();
    const pathname = usePathname();

    const fetchResults = useCallback(async (searchQuery: string) => {
        abortControllerRef.current?.abort();
        const controller = new AbortController();
        abortControllerRef.current = controller;

        try {
            const res = await fetch(`/api/search/multi?query=${encodeURIComponent(searchQuery)}`, { signal: controller.signal });
            if (!res.ok) {
                setResults([]);
                return;
            }
            const data = await res.json();
            setResults(data.results || []);
        } catch (error) {
            if (!(error instanceof Error && error.name === "AbortError")) {
                console.error("Search failed:", error);
                setResults([]);
            }
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        setQuery('');
    }, [pathname]);

    useEffect(() => {
        if (debouncedQuery) {
            setIsLoading(true);
            setHasSearched(true);
            fetchResults(debouncedQuery);
        } else {
            setResults([]);
            setIsLoading(false);
            setHasSearched(false);
        }
        return () => {
            abortControllerRef.current?.abort();
        };
    }, [debouncedQuery, fetchResults]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsFocused(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleSearchSubmit = () => {
        if (query.trim()) {
            router.push(`/search?query=${encodeURIComponent(query.trim())}`);
            setIsFocused(false);
        }
    };

    const getScoreColor = (score: number = 0) => {
        if (score >= 7) return "text-green-500";
        if (score >= 4) return "text-yellow-500";
        return "text-red-500";
    };

    const shouldShowResults = isFocused && query.length > 0;
    const shouldShowViewMore = results.length > 5;
    const displayedResults = shouldShowViewMore ? results.slice(0, 5) : results;

    return (
        <div ref={containerRef} className="relative w-full max-w-md">
            <div className="flex items-center gap-2">
                <div className="relative grow">
                    <Input
                        placeholder={placeholder}
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onFocus={() => setIsFocused(true)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                e.preventDefault();
                                handleSearchSubmit();
                            }
                        }}
                        autoComplete="off"
                    />
                    {shouldShowResults && (
                        <div className="absolute left-0 right-0 z-50 mt-2 bg-card border border-input shadow-sm rounded-md">
                            {isLoading && <p className="p-4 text-center text-muted-foreground">Searching...</p>}
                            {!isLoading && results.length > 0 && (
                                <ul className="divide-y divide-border">
                                    {displayedResults.map((item) => {
                                        let href = "#";
                                        if (item.media_type === "movie") href = `/movie/${item.id}`;
                                        else if (item.media_type === "tv") href = `/tv/${item.id}`;
                                        else if (item.media_type === "person") href = `/person/${item.id}`;

                                        return (
                                            <li key={item.id}>
                                                <Link href={href} className="flex gap-2 p-2 cursor-pointer hover:bg-accent">
                                                    {item.poster_path ? (
                                                        <Image
                                                            src={`https://image.tmdb.org/t/p/w92${item.poster_path}`}
                                                            width={500}
                                                            height={750}
                                                            alt={item.title || item.name || "Unknown"}
                                                            className="aspect-2/3 w-12 object-cover rounded"
                                                        />
                                                    ) : (
                                                        <div className="aspect-2/3 w-12 bg-muted rounded flex items-center justify-center text-xs text-muted-foreground">
                                                            N/A
                                                        </div>
                                                    )}
                                                    <div className="flex flex-col justify-between">
                                                        <div>
                                                            <p className="leading-none font-bold">{item.title || item.name}</p>
                                                            <p className="text-muted-foreground text-sm">
                                                                {item.media_type === "person"
                                                                    ? item.known_for_department || "Person"
                                                                    : (item.first_air_date || item.release_date)?.slice(0, 4) || "—"}
                                                            </p>
                                                        </div>
                                                        <p className="text-sm">
                                                            <span className={`font-semibold ${getScoreColor(item.vote_average)}`}>
                                                              {item.vote_average?.toFixed(1)}
                                                            </span>{" "}
                                                            <span className="text-muted-foreground">({item.vote_count})</span>
                                                        </p>
                                                    </div>
                                                </Link>
                                            </li>
                                        );
                                    })}
                                    {shouldShowViewMore && (
                                        <li
                                            className="text-center text-sm text-blue-600 p-2 cursor-pointer hover:underline"
                                            onClick={() => {
                                                router.push(`/search?query=${encodeURIComponent(query.trim())}`);
                                                setIsFocused(false);
                                            }}
                                        >
                                            View all {results.length} results
                                        </li>
                                    )}
                                </ul>
                            )}
                            {!isLoading && hasSearched && results.length === 0 && (
                                <p className="p-4 text-center text-muted-foreground">{`No results found for "${query}".`}</p>
                            )}
                        </div>
                    )}
                </div>
                <Button onClick={handleSearchSubmit} size="icon" className="size-8">
                    <IoIosSearch />
                </Button>
            </div>
        </div>
    );
}