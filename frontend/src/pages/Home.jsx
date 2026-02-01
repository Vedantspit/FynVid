import { useEffect, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { endpoints } from "../api/client";
import { useSearchParams } from "react-router-dom";
import VideoGrid from "../components/VideoGrid";
import VideoList from "../components/VideoList";
import { FaSearch, FaRegFolderOpen } from "react-icons/fa"; // Added an icon for empty state

export default function Home() {
  const { api } = useAuth();
  const [loading, setLoading] = useState(false);
  const [videos, setVideos] = useState([]);
  const [error, setError] = useState("");
  const [input, setInput] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();
  const [nextCursor, setNextCursor] = useState(null);
  const [hasNextPage, setHasNextPage] = useState(true);
  const divRef = useRef(null);

  const search = searchParams.get("query") || "";

  const submitSearch = async (e) => {
    e.preventDefault();
    if (input.trim() === "") return;
    setSearchParams({
      query: input,
      limit: 10,
      sortBy: "createdAt",
    });
  };

  const fetchMoreVids = async (isFirstLoad = false) => {
    if (loading || (!isFirstLoad && !hasNextPage)) return;
    try {
      setError("");
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.set("query", search);
      params.set("limit", 5);
      if (!isFirstLoad && nextCursor) params.set("cursor", nextCursor);

      const res = await api.request(
        `${endpoints.videos()}?${params.toString()}`,
      );
      const newVideos = res.data?.videos || [];

      if (isFirstLoad) {
        setVideos(newVideos);
      } else {
        setVideos((prev) => [...prev, ...newVideos]);
      }

      setNextCursor(res.data?.nextCursor);
      setHasNextPage(res.data?.hasNextPage);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0].isIntersecting &&
          !loading &&
          hasNextPage &&
          videos.length > 0
        ) {
          fetchMoreVids(false);
        }
      },
      { threshold: 0.1 },
    );
    if (divRef.current) observer.observe(divRef.current);
    return () => observer.disconnect();
  }, [nextCursor, hasNextPage, loading, videos.length]);

  useEffect(() => {
    setNextCursor(null);
    setHasNextPage(true);
    fetchMoreVids(true);
  }, [api, search]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Search Header */}
      <div className="py-6 flex justify-center sticky top-0 bg-white z-10 shadow-sm -mx-4 px-4 sm:shadow-none sm:relative">
        <form
          onSubmit={submitSearch}
          className="flex items-center w-full max-w-lg gap-0 group"
        >
          <input
            className="flex-1 border border-gray-300 px-4 py-2 rounded-l-full focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all bg-gray-50/50"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Search videos..."
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="px-6 py-[11px] bg-zinc-900 border border-zinc-900 rounded-r-full hover:bg-black transition-all disabled:opacity-50 disabled:cursor-not-allowed group-focus-within:ring-1 group-focus-within:ring-black"
          >
            <FaSearch className="text-white text-sm" />
          </button>
        </form>
      </div>

      {/* Content Area */}
      <div className="min-h-[60vh]">
        {error && (
          <div className="p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50 text-center">
            {error}
          </div>
        )}

        {/* First Load Spinner */}
        {loading && videos.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            <p className="mt-4 text-gray-500 animate-pulse">
              Finding the best videos...
            </p>
          </div>
        )}

        {/* Empty State */}
        {!loading && videos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <FaRegFolderOpen size={48} className="mb-4 opacity-20" />
            <h2 className="text-xl font-medium">No videos found</h2>
            <p className="text-sm">Try searching for something else</p>
          </div>
        ) : (
          <div className="pb-8">
            <div className="block sm:hidden">
              <VideoList videos={videos} />
            </div>
            <div className="hidden sm:block">
              <VideoGrid videos={videos} />
            </div>
          </div>
        )}

        {/* Sentinel & Bottom States */}
        <div ref={divRef} className="py-8 border-t border-gray-100">
          {loading && videos.length > 0 && (
            <div className="flex justify-center items-center gap-3 py-4">
              <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
              <span className="text-gray-500 text-sm">Loading more...</span>
            </div>
          )}

          {!hasNextPage && videos.length > 0 && (
            <div className="text-center py-10">
              <p className="text-gray-400 text-sm font-medium uppercase tracking-widest">
                - End of Content -
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
