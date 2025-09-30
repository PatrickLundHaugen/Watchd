import Link from "next/link";
import Image from 'next/image'
import { getPopularTv } from "@/lib/tmdb";
import {FaArrowRightLong} from "react-icons/fa6";
import {Button} from "@/components/ui/button";

export const TrendingTv = async () => {
    const data = await getPopularTv();

    const avgRating = 7;
    const minVotes = 300;

    const series = data.results
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

    if (!series) return <div>Loading trending movies...</div>;

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-semibold tracking-tight">Trending TV series</h1>
                <Button variant="ghost" size="icon" className="cursor-pointer" asChild>
                    <Link href="/trending/tv-series">
                        <FaArrowRightLong />
                    </Link>
                </Button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {series.map((show) => (
                    <div key={show.id} className="flex flex-col bg-card rounded-xl border border-input shadow-sm overflow-hidden">
                        <div>
                            {show.poster_path ? (
                                <Image
                                    src={`https://image.tmdb.org/t/p/w500${show.poster_path}`}
                                    width={500}
                                    height={750}
                                    alt={show.name}
                                    className="rounded"
                                />
                            ) : (
                                <div className="bg-muted h-72 mb-2 rounded"/>
                            )}
                        </div>
                        <div className="flex flex-col justify-between grow gap-2 p-4">
                            <div>
                                <Link href={`/tv/${show.id}`} className="leading-none font-semibold hover:underline cursor-pointer">{show.name}</Link>
                                <p className="text-sm text-muted-foreground">{show.first_air_date?.slice(0, 4)}</p>
                            </div>
                            <p className={`leading-none font-semibold ${getScoreColor(show.vote_average)}`}>{show.vote_average?.toFixed(1)}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
