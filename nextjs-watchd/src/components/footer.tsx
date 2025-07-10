import { Separator } from "@/components/ui/separator";
import Link from "next/link";

export const Footer = () => {
    return (
        <footer className="container flex flex-col gap-4 max-w-6xl mx-auto p-8 text-sm text-muted-foreground">
            <Separator />
            <div className="grid grid-cols-2 md:grid-cols-3 gap-y-4">
                <div>
                    <p>Made by Pat</p>
                    <p>All data fetched from <a href="https://www.themoviedb.org/" target="_blank" className="underline">TMDB</a></p>
                </div>
                <div>
                    <h1 className="font-semibold">Movies</h1>
                    <Link href={`/trending/movies`} className="hover:underline">Trending</Link>
                </div>
                <div>
                    <div>
                        <h1 className="font-semibold">Tv series</h1>
                        <Link href={`/trending/tv-series`} className="hover:underline">Trending</Link>
                    </div>
                </div>
            </div>
        </footer>
    )
}