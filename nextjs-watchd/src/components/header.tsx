"use client";

import React, { useEffect, useState } from "react";
import { client } from "@/sanity/client";
import { Search } from "@/components/search";
import Login from "@/components/login";
import Link from "next/link";

const HOME_QUERY = `*[_type == "home"][0]{ title, placeholder, account, icon }`;

interface SanityImageReference {
    _type: 'image';
    asset: {
        _ref: string;
        _type: 'reference';
    };
}

interface HomeData {
    title: string;
    placeholder: string;
    account: string;
    icon?: SanityImageReference;
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
            }
        };
        fetchHomeData();
    }, []);

    if (!home) {
        return <nav className="flex items-center justify-between gap-4 max-w-6xl mx-auto p-4 md:p-8">Loading...</nav>;
    }

    return (
        <nav className="flex items-center justify-between gap-4 max-w-6xl mx-auto p-4 md:p-8">
            <Link
                href="/"
                className="text-2xl font-bold text-foreground title-link">
                {home.title}
            </Link>

            <Search placeholder={home.placeholder} />

            <Login trigger={home.account} />
        </nav>
    );
};