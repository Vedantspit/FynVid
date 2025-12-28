import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { endpoints } from "../api/client";
import { useSearchParams } from "react-router-dom";
import VideoGrid from "../components/VideoGrid";
import VideoList from "../components/VideoList";
import { FaSearch } from "react-icons/fa";
export default function Home() {
  const { api } = useAuth();
  const [loading, setLoading] = useState(false);
  const [videos, setVideos] = useState([]);
  const [error, setError] = useState("");
  const [input, setInput] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();
  const search = searchParams.get("query") || "";
  const submitSearch = async (e) => {
    e.preventDefault();
    if (input.trim() === "") return;
    setSearchParams({
      query: input,
      limit: 10,
      sortBy: "views",
    });
  };
  useEffect(() => {
    (async () => {
      try {
        setError("");
        setLoading(true);
        const params = new URLSearchParams();
        if (search) {
          params.set("query", search);
          params.set("limit", 10);
          params.set("sortBy", "views");
        }
        let res;
        if (params.toString() != "") {
          res = await api.request(`${endpoints.videos()}?${params.toString()}`);
        } else {
          res = await api.request(`${endpoints.videos()}`);
        }
        console.log("VIDEOS ", res);
        setVideos(res?.data?.videos || res?.data || []);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [api, search]);

  return (
    <>
      <div className="p-4 flex justify-center">
        <form onSubmit={submitSearch} className="flex items-center gap-2">
          <input
            className="border-2 border-solid px-3 py-1 rounded-md w-72"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Search"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="px-4 py-2 bg-black text-white rounded-md"
          >
            <FaSearch />
          </button>
        </form>
      </div>

      <div className="p-4">
        {loading && (
          <h2 className="text-gray-600 text-center text-xl mt-8">
            Loading ...
          </h2>
        )}
        {error && <div className="text-red-600 mb-4">{error}</div>}
        {!loading && videos.length === 0 ? (
          <h2 className="text-gray-600 text-center text-xl mt-8">
            No videos found
          </h2>
        ) : (
          !loading &&
          videos.length > 0 && (
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
          )
        )}
      </div>
    </>
  );
}
