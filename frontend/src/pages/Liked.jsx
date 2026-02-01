import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { endpoints } from "../api/client";
import VideoGrid from "../components/VideoGrid";
import VideoList from "../components/VideoList";

export default function Liked() {
  const { api } = useAuth();
  const [videos, setVideos] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.request(endpoints.likedVideos());
        setVideos(res?.data || []);
      } catch (err) {
        // console.error("Failed to fetch liked videos:", err);
        setError("Failed to load liked videos");
      } finally {
        setLoading(false);
      }
    })();
  }, [api]);

  return (
    <div className="px-3 sm:px-4 lg:px-6 py-4 sm:py-6">
      <div className="text-lg sm:text-xl lg:text-2xl font-semibold mb-4 text-gray-900">
        Liked videos
      </div>
      {error && (
        <div className="text-red-600 mb-4 p-3 bg-red-50 rounded-lg border border-red-200">
          {error}
        </div>
      )}
      {loading ? (
        <div className="text-gray-500 text-center py-8">Loading...</div>
      ) : videos.length === 0 ? (
        <h2 className="text-gray-600 text-center text-lg sm:text-xl mt-8 sm:mt-12">
          No liked videos yet
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
  );
}
