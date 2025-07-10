import Link from "next/link";
import { type SanityDocument } from "next-sanity";

import { client } from "@/sanity/client";
import { TrendingMovies } from "@/components/trending/trendingMovies";
import {TrendingTv} from "@/components/trending/trendingTv";


const POSTS_QUERY = `*[
  _type == "post"
  && defined(slug.current)
]|order(publishedAt desc)[0...12]{_id, title, slug, publishedAt}`;

const options = { next: { revalidate: 30 } };

export default async function IndexPage() {
    const posts = await client.fetch<SanityDocument[]>(POSTS_QUERY, {}, options);

  return (
      <>
          <main className="container flex flex-col gap-8 mx-auto min-h-screen max-w-6xl p-4 md:p-8">
              <TrendingMovies />
              <TrendingTv />
              <h1 className="text-4xl font-bold mb-8">posts</h1>
              <ul className="flex flex-col gap-y-4">
                  {posts.map((post) => (
                      <li className="hover:underline" key={post._id}>
                          <Link href={`/${post.slug.current}`}>
                              <h2 className="text-xl font-semibold">{post.title}</h2>
                              <p>{new Date(post.publishedAt).toLocaleDateString()}</p>
                          </Link>
                      </li>
                  ))}
              </ul>
          </main>
      </>
  );
}