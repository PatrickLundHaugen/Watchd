export interface TmdbMovieNowPlaying {
    id: number;
    title: string;
    name: string;
    overview: string;
    release_date: string;
    first_air_date?: string;
    poster_path: string | null;
    backdrop_path: string | null;
    vote_average: number;
    vote_count: number;
    popularity: number;
    genre_ids: number[];
    original_language: string;
    original_title: string;
    adult: boolean;
    video: boolean;
}

export interface TmdbMovieDetails extends TmdbMovieNowPlaying {
    genres: { id: number; name: string }[];
    runtime: number;
    tagline: string;
    homepage: string | null;
    status: string;
    production_companies: { id: number; name: string }[];
}

export interface TmdbNowPlayingResponse {
    page: number;
    results: TmdbMovieNowPlaying[];
    total_pages: number;
    total_results: number;
}

export interface TmdbPersonDetails {
    id: number;
    name: string;
    known_for_department?: string;
}

export interface TmdbCastMember {
    adult: boolean;
    gender: number;
    id: number;
    known_for_department: string;
    name: string;
    original_name: string;
    popularity: number;
    profile_path: string | null;
    cast_id: number;
    character: string;
    credit_id: string;
    order: number;
}

export interface TmdbCrewMember {
    adult: boolean;
    gender: number;
    id: number;
    known_for_department: string;
    name: string;
    original_name: string;
    popularity: number;
    profile_path: string | null;
    credit_id: string;
    department: string;
    job: string;
}

export interface TmdbPersonCredits {
    id: number;
    cast: TmdbCastMember[];
    crew: TmdbCrewMember[];
}

export interface TmdbSearchResult {
    id: number;
    media_type: "movie" | "tv" | "person";
    title?: string;
    name?: string;
    first_air_date?: string;
    release_date?: string;
    known_for_department?: string;
    poster_path?: string;
    vote_average?: number;
    vote_count?: number;
}

export interface TmdbMultiSearchResponse {
    page: number;
    results: TmdbSearchResult[];
    total_pages: number;
    total_results: number;
}

export interface TmdbTvCreatedBy {
    id: number;
    credit_id: string;
    name: string;
    original_name: string;
    gender: number;
    profile_path: string | null;
}

export interface TmdbTvDetails {
    id: number;
    name: string;
    overview: string;
    first_air_date: string;
    number_of_episodes: number;
    poster_path: string | null;
    backdrop_path: string | null;
    created_by: TmdbTvCreatedBy[];
    vote_average: number;
    vote_count: number;
    popularity: number;
    genres: { id: number; name: string }[];
    number_of_seasons: number;
    episode_run_time: number;
    tagline: string;
    homepage: string | null;
    status: string;
    original_language: string;
    original_name: string;
    production_companies: { id: number; name: string }[];
}

export interface TmdbTvCastRole {
    credit_id: string;
    character: string;
    episode_count: number;
    total_episode_count: number;
    order: number;
}

export interface TmdbTvCastMember {
    adult: boolean;
    gender: number;
    id: number;
    known_for_department: string;
    name: string;
    original_name: string;
    popularity: number;
    profile_path: string | null;
    roles: TmdbTvCastRole[];
}

export interface TmdbTvCrewJob {
    credit_id: string;
    job: string;
    episode_count: number;
    department: string;
    total_episode_count: number;
}

export interface TmdbTvCrewMember {
    adult: boolean;
    gender: number;
    id: number;
    known_for_department: string;
    name: string;
    original_name: string;
    popularity: number;
    profile_path: string | null;
    jobs: TmdbTvCrewJob[];
}

export interface TmdbTvAggregateCredits {
    cast: TmdbTvCastMember[];
    crew: TmdbTvCrewMember[];
    id: number;
}

export interface TmdbTvShowSummary {
    adult: boolean;
    backdrop_path: string | null;
    genre_ids: number[];
    id: number;
    origin_country: string[];
    original_language: string;
    original_name: string;
    overview: string;
    popularity: number;
    poster_path: string | null;
    first_air_date: string;
    name: string;
    vote_average: number;
    vote_count: number;
}

export interface TmdbSimilarTvResponse {
    page: number;
    results: TmdbTvShowSummary[];
    total_pages: number;
    total_results: number;
}

async function fetchFromTmdb<T>(path: string): Promise<T> {
    const url = `https://api.themoviedb.org/3/${path}`;
    const options = {
        method: "GET",
        headers: {
            accept: "application/json",
            Authorization: `Bearer ${process.env.TMDB_API_READ_ACCESS_TOKEN}`,
        },
        next: { revalidate: 3600 },
    };

    const res = await fetch(url, options);

    if (!res.ok) {
        console.error(`TMDB API Error: ${res.status} on path ${path}`);
        throw new Error(`Failed to fetch data from TMDB. Status: ${res.status}`);
    }

    return await res.json();
}

export async function getPersonDetails(personId: string | number): Promise<TmdbPersonDetails> {
    return fetchFromTmdb<TmdbPersonDetails>(`person/${personId}`);
}

export async function searchMulti(query: string): Promise<TmdbMultiSearchResponse> {
    const path = `search/multi?query=${encodeURIComponent(query)}&include_adult=false&language=en-US&page=1`;
    return fetchFromTmdb<TmdbMultiSearchResponse>(path);
}

export async function getNowPlayingMovies(): Promise<TmdbNowPlayingResponse> {
    return fetchFromTmdb<TmdbNowPlayingResponse>("movie/now_playing?language=en-US&page=1");
}

export async function getMovieDetails(movieId: string | number): Promise<TmdbMovieDetails> {
    return fetchFromTmdb<TmdbMovieDetails>(`movie/${movieId}?language=en-US`);
}

export async function getMovieCredits(movieId: string | number): Promise<TmdbPersonCredits> {
    return fetchFromTmdb<TmdbPersonCredits>(`movie/${movieId}/credits?language=en-US`);
}

export async function getSimilarMovies(movieId: string | number): Promise<TmdbNowPlayingResponse> {
    return fetchFromTmdb<TmdbNowPlayingResponse>(`movie/${movieId}/similar?language=en-US&page=1`);
}

export async function getTvDetails(tvId: string | number): Promise<TmdbTvDetails> {
    return fetchFromTmdb<TmdbTvDetails>(`tv/${tvId}?language=en-US`);
}

export async function getTvAggregateCredits(tvId: string | number): Promise<TmdbTvAggregateCredits> {
    return fetchFromTmdb<TmdbTvAggregateCredits>(`tv/${tvId}/aggregate_credits`);
}

export async function getSimilarTvShows(tvId: string | number): Promise<TmdbSimilarTvResponse> {
    return fetchFromTmdb<TmdbSimilarTvResponse>(`tv/${tvId}/similar?language=en-US&page=1`);
}

export async function getPopularMovies(): Promise<TmdbNowPlayingResponse> {
    return fetchFromTmdb<TmdbNowPlayingResponse>("movie/popular?language=en-US");
}

export async function getPopularTv(): Promise<TmdbNowPlayingResponse> {
    return fetchFromTmdb<TmdbNowPlayingResponse>("tv/popular?language=en-US");
}
