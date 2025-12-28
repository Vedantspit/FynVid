import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { endpoints } from "../api/client";
import VideoGrid from "../components/VideoGrid";
import VideoList from "../components/VideoList";
import { FaSearch } from "react-icons/fa";
export default function Home() {
  const { api } = useAuth();
  const [videos, setVideos] = useState([]);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const submitSearch = async (e) => {
    e.preventDefault();
    if (search.trim() === "") return;
    try {
      const params = new URLSearchParams({
        query: search,
        limit: 10,
        sortby: "views",
      });
      const res = await api.request(
        `${endpoints.videos()}?${params.toString()}`
      );
      console.log("VIDEOS ", res);
      setVideos(res?.data?.videos || res?.data || []);
    } catch (error) {
      setError(error.message);
    }
  };
  useEffect(() => {
    (async () => {
      try {
        const res = await api.request(endpoints.videos());
        console.log("VIDEOS ", res);
        setVideos(res?.data?.videos || res?.data || []);
      } catch (e) {
        setError(e.message);
      }
    })();
  }, [api]);

  return (
    <>
      <div className="p-4 flex justify-center">
        <form onSubmit={submitSearch} className="flex items-center gap-2">
          <input
            className="border-2 border-solid px-3 py-1 rounded-md w-72"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-black text-white rounded-md"
          >
            <FaSearch />
          </button>
        </form>
      </div>

      <div className="p-4">
        {error && <div className="text-red-600 mb-4">{error}</div>}
        {videos.length === 0 ? (
          <h2 className="text-gray-600 text-center text-xl mt-8">
            No videos found
          </h2>
        ) : (
          <>
            {/* Mobile layout */}
            <div className="block sm:hidden">
              <VideoList videos={videos} />
            </div>

            {/* Tablet / Desktop layout */}
            <div className="hidden sm:block">
              <VideoGrid videos={videos} />
            </div>
          </>
        )}
      </div>
    </>
  );
}
