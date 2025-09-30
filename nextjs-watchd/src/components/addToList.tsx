"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { useUser } from "@/components/context/user-context";
import type { TmdbMovieDetails } from "@/lib/tmdb";

interface AddToListButtonProps {
    movie: TmdbMovieDetails;
}

export function AddToListButton({ movie }: AddToListButtonProps) {
    const [loading, setLoading] = useState(false);
    const { user } = useUser();

    const handleAddToMovieList = async () => {
        if (!user || !user.username) {
            alert("Please log in to add movies to your list.");
            return;
        }

        setLoading(true);
        try {
            const res = await fetch(`/api/user/${user.username}/movie-list`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    tmdbId: movie.id,
                    label: movie.title || movie.name,
                    posterPath: movie.poster_path,
                    releaseDate: movie.release_date,
                    voteAverage: movie.vote_average,
                }),
            });

            const data = await res.json();
            if (!res.ok) {
                alert(data.error || "Failed to add movie");
                return;
            }

            alert("Movie added!");
        } catch (error) {
            console.error("Error adding movie to list:", error);
            alert("An error occurred. Check console for details.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Button onClick={handleAddToMovieList} disabled={loading} size="icon" className="text-2xl">
            +
        </Button>
    );
}