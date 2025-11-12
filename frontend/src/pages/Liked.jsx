import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { endpoints } from "../api/client";
import VideoGrid from "../components/VideoGrid";
import VideoList from "../components/VideoList"; // ← Add this import

export default function Liked() {
  const { api } = useAuth();
  const [videos, setVideos] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await api.request(endpoints.likedVideos());
        setVideos(res?.data || []);
      } catch (err) {
        console.error("Failed to fetch liked videos:", err);
        setError("Failed to load liked videos");
      }
    })();
  }, [api]);

  return (
    <div className="p-4">
      <div className="text-xl font-semibold mb-4">Liked videos</div>
      {error && <div className="text-red-600 mb-4">{error}</div>}

      {videos.length === 0 ? (
        <h2 className="text-gray-600 text-center text-lg mt-8">
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
