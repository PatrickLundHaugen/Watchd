"use client"; // <-- ADD THIS LINE to make it a Client Component

import React, { useEffect, useState } from "react"; // <-- IMPORT THESE HOOKS
import { client } from "@/sanity/client";
import { Search } from "@/components/search";
import Login from "@/components/login";

const HOME_QUERY = `*[_type == "home"][0]{ title, placeholder, account, icon }`;

// Define an interface for the data fetched from Sanity
interface HomeData {
    title: string;
    placeholder: string;
    account: string;
    icon?: any;
}

export const Header = () => {
    const [home, setHome] = useState<HomeData | null>(null);

    useEffect(() => {
        const fetchHomeData = async () => {
            try {
                const data = await client.fetch<HomeData>(HOME_QUERY);
                setHome(data);
            } catch (error) {
                console.error("Failed to fetch home data:", error);
                // Handle error state if necessary
            }
        };
        fetchHomeData();
    }, []);

    if (!home) {
        return <nav className="flex items-center justify-between gap-4 max-w-6xl mx-auto p-4 md:p-8">Loading...</nav>;
    }

    return (
        <nav className="flex items-center justify-between gap-4 max-w-6xl mx-auto p-4 md:p-8">
            <a
                href="/"
                className="text-2xl font-bold text-foreground title-link">
                {home.title}
            </a>

            <Search placeholder={home.placeholder} />

            <Login trigger={home.account} />
        </nav>
    );
};