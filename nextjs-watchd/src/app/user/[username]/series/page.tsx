import { notFound } from "next/navigation";
import { getUserSeries } from "@/lib/user-lists";
import { IoIosArrowBack } from "react-icons/io";
import Link from "next/link";
import React from "react";

export default async function SeriesListPage({ params }: { params: Promise<{ username: string }> }) {
    const { username } = await params;
    const series = await getUserSeries(username);

    if (!series) return notFound();

    return (
        <main className="container flex flex-col gap-8 mx-auto min-h-screen max-w-6xl p-4 md:p-8">
            <Link href="/" className="inline-flex items-center gap-1 hover:underline"><IoIosArrowBack />Back to {username}</Link>
            <h1 className="text-2xl font-bold mb-4">{`${username}'s Tv Series List`}</h1>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {series.map((series) => (
                    <div
                        key={series.id}
                        className="border rounded p-4 shadow hover:shadow-md transition"
                    >
                        <h2 className="font-semibold text-lg">{series.name}</h2>
                        <p className="text-sm text-gray-500">{series.first_air_date}</p>
                    </div>
                ))}
            </div>
        </main>
    );
}
