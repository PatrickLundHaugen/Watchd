import Link from "next/link";
import Image from 'next/image'
import { getPopularMovies } from "@/lib/tmdb";
import { Button } from "@/components/ui/button";
import { FaArrowRightLong } from "react-icons/fa6";

export const TrendingMovies = async () => {
    const data = await getPopularMovies();

    const avgRating = 7;
    const minVotes = 300;

    const movies = data.results
        .filter(({ vote_count, vote_average, popularity }) =>
            vote_count >= 50 &&
            vote_average > 0 &&
            popularity >= 200
        )
        .map(item => {
            const { vote_count: v, vote_average: R } = item;
            const score = (v / (v + minVotes)) * R + (minVotes / (v + minVotes)) * avgRating;
            return { ...item, score };
        })
        .sort((a, b) => b.score - a.score)
        .slice(0, 6);

    const getScoreColor = (score: number = 0) => {
        if (score >= 7) return "text-green-500";
        if (score >= 4) return "text-yellow-500";
        return "text-red-500";
    };

    if (!movies) return <div>Loading trending movies...</div>;

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-semibold tracking-tight">Trending Movies</h1>
                <Button variant="ghost" size="icon" className="cursor-pointer" asChild>
                    <Link href="/trending/movies">
                        <FaArrowRightLong />
                    </Link>
                </Button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {movies.map((movie) => (
                    <div key={movie.id} className="flex flex-col bg-card rounded-xl border border-input shadow-sm overflow-hidden">
                        <div>
                            {movie.poster_path ? (
                                <Image
                                    src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                                    width={500}
                                    height={750}
                                    alt={movie.title}
                                    className="rounded"
                                />
                            ) : (
                                <div className="bg-muted h-72 mb-2 rounded"/>
                            )}
                        </div>
                        <div className="flex flex-col justify-between grow gap-2 p-4">
                            <div>
                                <Link href={`/movie/${movie.id}`} className="leading-none font-semibold tracking-tight cursor-pointer hover:underline">{movie.title}</Link>
                                <p className="text-sm text-muted-foreground">{movie.release_date?.slice(0, 4)}</p>
                            </div>
                            <p className={`leading-none font-semibold ${getScoreColor(movie.vote_average)}`}>{movie.vote_average?.toFixed(1)}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
