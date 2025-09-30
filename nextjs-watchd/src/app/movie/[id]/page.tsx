import { getMovieCredits, getMovieDetails, getSimilarMovies } from "@/lib/tmdb";
import Link from "next/link";
import { IoIosArrowBack, IoMdPerson } from "react-icons/io";
import { Badge } from "@/components/ui/badge";
import { TmdbMovieNowPlaying } from "@/lib/tmdb";
import {AddToListButton} from "@/components/addToList";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    const movie = await getMovieDetails(id);
    const credits = await getMovieCredits(id);
    const similarMoviesData = await getSimilarMovies(id);
    const similarMovies: TmdbMovieNowPlaying[] = (similarMoviesData.results || []).slice(0, 6);

    if (!movie) {
        return (
            <main className="p-8">
                <h1 className="text-2xl font-bold">Movie not found</h1>
                <Link href="/" className="hover:underline"><IoIosArrowBack />Back to home</Link>
            </main>
        );
    }

    const renderCrewSection = (label: string, jobs: string[]) => {
        const crewMembers = credits?.crew?.filter((member) => jobs.includes(member.job)) ?? [];
        if (crewMembers.length === 0) return null;
        return (
            <div className="flex flex-wrap items-center">
                <p className="font-medium mr-2">{label}:</p>
                {crewMembers.map((member, index) => (
                    <div key={member.credit_id} className="flex items-center">
                        <p className="text-blue-500 cursor-pointer hover:underline">
                            {member.name}
                        </p>
                        {index < crewMembers.length - 1 && (
                            <span className="mx-1 text-muted-foreground">•</span>
                        )}
                    </div>
                ))}
            </div>
        );
    };

    const getScoreColor = (score: number = 0) => {
        if (score >= 7) return "text-green-500 border-green-500";
        if (score >= 4) return "text-yellow-500 border-yellow-500";
        return "text-red-500 border-red-500";
    };

    const getScoreTextColor = (score: number = 0) => {
        if (score >= 7) return "text-green-500";
        if (score >= 4) return "text-yellow-500";
        return "text-red-500";
    };

    return (
        <main className="container flex flex-col gap-12 mx-auto min-h-screen max-w-6xl p-8">
            <Link href="/" className="inline-flex items-center gap-1 hover:underline"><IoIosArrowBack />Back to home</Link>
            <div className="flex gap-4">
                {movie.poster_path && (
                    <img
                        src={`https://image.tmdb.org/t/p/w342${movie.poster_path}`}
                        alt={movie.title}
                        width={342}
                        height={750}
                        className="rounded-lg aspect-[2/3] md:w-72 shadow-lg"
                    />
                )}
                <div>
                    <div className="flex flex-col gap-8">
                        <div className="flex justify-between items-center">
                            <div>
                                <span className="inline-flex items-center gap-2">
                                    <h1 className="text-4xl font-semibold tracking-tight">{movie.title}</h1>
                                    <AddToListButton movie={movie} />
                                </span>
                                <p className="text-muted-foreground mt-2">{movie.release_date?.slice(0, 4)} • {movie.runtime} min</p>
                            </div>
                            <div className="text-center text-muted-foreground">
                                <p className={`leading-none font-semibold border-4 rounded-full p-4 drop-shadow-sm ${getScoreColor(movie.vote_average)}`}>{movie.vote_average?.toFixed(1)}</p>
                                <div className="inline-flex items-center gap-1 mt-2">
                                    <p className="">{movie.vote_count}</p>
                                    <IoMdPerson />
                                </div>
                            </div>
                        </div>
                        <div>
                            {renderCrewSection("Directors", ["Director"])}
                            {renderCrewSection("Writers", ["Writer", "Story"])}
                        </div>
                        <div>
                            {movie.tagline && <p className="italic text-muted-foreground">"{movie.tagline}"</p>}
                            <p className="mt-2">{movie.overview}</p>
                        </div>
                        <div className="flex flex-col gap-2">
                            <div className="flex gap-1">
                                {movie.genres?.map((g, index) => (
                                    <Badge key={index}>{g.name}</Badge>
                                ))}
                            </div>
                            {movie.homepage && (
                                <p className="text-blue-500 underline"><a href={movie.homepage} target="_blank" rel="noopener noreferrer">Official Website</a></p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <div className="flex flex-col gap-4">
                <h2 className="text-2xl font-bold tracking-tight">Cast</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-y-4">
                    {credits?.cast?.slice(0, 12).map((actor) => (
                        <div key={actor.cast_id} className="flex items-center gap-2">
                            {actor.profile_path ? (
                                <img
                                    src={`https://image.tmdb.org/t/p/w185${actor.profile_path}`}
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
                                <p className="text-sm text-muted-foreground">{actor.character}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {similarMovies.length > 0 && (
                <div className="flex flex-col gap-4">
                    <h2 className="text-2xl font-bold tracking-tight">Similar Movies</h2>
                    <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                        {similarMovies.map((movie) => (
                            <div key={movie.id} className="flex flex-col bg-card rounded-xl border border-input shadow-sm overflow-hidden">
                                {movie.poster_path ? (
                                    <img
                                        src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                                        alt={movie.title}
                                        className="rounded"
                                    />
                                ) : (
                                    <div className="bg-muted h-72 mb-2 rounded" />
                                )}
                                <div className="flex flex-col justify-between grow gap-2 p-4">
                                    <div>
                                        <Link href={`/movie/${movie.id}`} className="leading-none font-semibold hover:underline cursor-pointer">{movie.title}</Link>
                                        <p className="text-sm text-muted-foreground">{movie.release_date?.slice(0, 4)}</p>
                                    </div>
                                    <p className={`leading-none font-semibold ${getScoreTextColor(movie.vote_average)}`}>
                                        {movie.vote_average?.toFixed(1)}
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
