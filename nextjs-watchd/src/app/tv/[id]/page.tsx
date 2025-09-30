import {
    getSimilarTvShows,
    getTvAggregateCredits,
    getTvDetails,
    TmdbTvAggregateCredits,
    TmdbTvDetails
} from '@/lib/tmdb';
import Link from "next/link";
import Image from 'next/image'
import { IoMdPerson } from "react-icons/io";
import { IoIosArrowBack } from "react-icons/io";
import { Badge } from "@/components/ui/badge";
import { JSX } from 'react';

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    const tv = await getTvDetails(id);
    const credits = await getTvAggregateCredits(id)
    const similarTvResponse = await getSimilarTvShows(id);
    const similarShows = similarTvResponse.results?.slice(0, 6) ?? [];

    if (!tv) {
        return (
            <main className="p-8">
                <h1 className="text-2xl font-bold">Tv show not found</h1>
                <Link href="/" className="hover:underline"><IoIosArrowBack />Back to home</Link>
            </main>
        );
    }

    const renderNameListSection = (
        label: string,
        names: string[],
        maxCount = 3,
        priorityName?: string
    ): JSX.Element | null => {
        if (!names.length) return null;

        const uniqueNames = Array.from(new Set(names));

        const sorted = priorityName && uniqueNames.includes(priorityName)
            ? [priorityName, ...uniqueNames.filter((n) => n !== priorityName)]
            : uniqueNames;

        const limited = sorted.slice(0, maxCount);
        const hasMore = sorted.length > maxCount;

        return (
            <div className="flex flex-wrap items-center">
                <p className="font-medium mr-2">{label}:</p>
                {limited.map((name, index) => (
                    <div key={name} className="flex items-center">
                        <p className="text-blue-500 cursor-pointer hover:underline">{name}</p>
                        {index < limited.length - 1 && (
                            <span className="mx-1 text-muted-foreground">•</span>
                        )}
                    </div>
                ))}
                {hasMore && <span className="text-muted-foreground">...</span>}
            </div>
        );
    };

    const renderCrewSection = (
        credits: TmdbTvAggregateCredits,
        label: string,
        jobs: string[],
        maxCount = 3,
        priorityName = "Vince Gilligan"
    ): JSX.Element | null => {
        if (!credits?.crew?.length) return null;

        const names = credits.crew
            .filter((member) => member.jobs.some((job) => jobs.includes(job.job)))
            .map((member) => member.name);

        return renderNameListSection(label, names, maxCount, priorityName);
    };

    const renderCreatorSection = (
        createdBy: TmdbTvDetails["created_by"]
    ): JSX.Element | null => {
        if (!createdBy?.length) return null;

        const names = createdBy.map((c) => c.name);
        return renderNameListSection(
            `Creator${createdBy.length > 1 ? "s" : ""}`,
            names
        );
    };

    const getScoreColor = (score: number = 0) => {
        if (score >= 7) return "text-green-500 border-green-500";
        if (score >= 4) return "text-yellow-500 border-yellow-500";
        return "text-red-500 border-red-500";
    };

    return (
        <main className="container flex flex-col gap-12 mx-auto min-h-screen max-w-6xl p-8">
            <Link href="/" className="inline-flex items-center gap-1 hover:underline"><IoIosArrowBack />Back to home</Link>
            <div className="flex gap-4">
                {tv.poster_path && (
                    <Image
                        src={`https://image.tmdb.org/t/p/w342${tv.poster_path}`}
                        alt={tv.name}
                        width={500}
                        height={750}
                        className="rounded-lg aspect-[2/3] md:w-72 shadow-lg"
                    />
                )}
                <div>
                    <div className="flex flex-col gap-8">
                        <div className="flex justify-between items-center">
                            <div>
                                <h1 className="text-4xl font-semibold tracking-tight">{tv.name}</h1>
                                <p className="text-muted-foreground mt-2">{tv.first_air_date?.slice(0, 4)} • {tv.number_of_episodes} ep</p>
                            </div>
                            <div className="text-center text-muted-foreground">
                                <p className={`leading-none font-semibold border-4 rounded-full p-4 drop-shadow-sm ${getScoreColor(tv.vote_average)}`}>{tv.vote_average?.toFixed(1)}</p>
                                <div className="inline-flex items-center gap-1 mt-2">
                                    <p>{tv.vote_count}</p>
                                    <IoMdPerson />
                                </div>
                            </div>
                        </div>
                        <div>
                            {renderCreatorSection(tv.created_by)}
                            {renderCrewSection(credits, "Writers", ["Writer", "Story"])}
                        </div>
                        <div>
                            {tv.tagline && <p className="italic text-muted-foreground">{`"${tv.tagline}"`}</p>}
                            <p className="mt-2">{tv.overview}</p>
                        </div>
                        <div className="flex flex-col gap-2">
                            <div className="flex gap-1">
                                {tv.genres?.map((g, index) => (
                                    <Badge key={index}>{g.name}</Badge>
                                ))}
                            </div>
                            {tv.homepage && (
                                <p className="text-blue-500 underline"><a href={tv.homepage} target="_blank" rel="noopener noreferrer">Official Website</a></p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <div className="flex flex-col gap-4">
                <h2 className="text-2xl font-bold tracking-tight">Cast</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-y-4">
                    {credits?.cast?.slice(0, 12).map((actor) => {
                        const character = actor.roles?.[0]?.character || "Unknown";

                        return (
                            <div key={actor.id} className="flex items-center gap-2">
                                {actor.profile_path ? (
                                    <Image
                                        src={`https://image.tmdb.org/t/p/w185${actor.profile_path}`}
                                        width={500}
                                        height={750}
                                        alt={actor.name}
                                        className="size-16 rounded-lg object-cover shadow-lg"
                                    />
                                ) : (
                                    <div className="flex items-center justify-center size-16 rounded-lg bg-muted text-xs text-muted-foreground shadow-lg">
                                        N/A
                                    </div>
                                )}
                                <div>
                                    <p>{actor.name}</p>
                                    <p className="text-sm text-muted-foreground">{character}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
            {similarShows.length > 0 && (
                <div className="flex flex-col gap-4">
                    <h2 className="text-2xl font-bold tracking-tight">Similar Shows</h2>
                    <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                        {similarShows.map((show) => (
                            <div key={show.id} className="flex flex-col bg-card rounded-xl border border-input shadow-sm overflow-hidden">
                                {show.poster_path ? (
                                    <Image
                                        src={`https://image.tmdb.org/t/p/w500${show.poster_path}`}
                                        width={500}
                                        height={750}
                                        alt={show.name}
                                        className="rounded"
                                    />
                                ) : (
                                    <div className="bg-muted h-72 mb-2 rounded" />
                                )}
                                <div className="flex flex-col justify-between grow gap-2 p-4">
                                    <div>
                                        <Link href={`/tv/${show.id}`} className="leading-none font-semibold hover:underline cursor-pointer">
                                            {show.name}
                                        </Link>
                                        <p className="text-sm text-muted-foreground">{show.first_air_date?.slice(0, 4)}</p>
                                    </div>
                                    <p className={`leading-none font-semibold ${getScoreColor(show.vote_average)}`}>
                                        {show.vote_average?.toFixed(1)}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </main>
    );
}
