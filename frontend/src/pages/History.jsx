import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import VideoGrid from "../components/VideoGrid";
import VideoList from "../components/VideoList";
import { endpoints } from "../api/client";

export default function History() {
  console.log("History component rendered");

  const { api } = useAuth();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.request("/users/history");
        // console.log("History response:", res);
        setVideos(Array.isArray(res?.data) ? res.data : []);
      } catch {
        setVideos([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="px-3 sm:px-4 lg:px-6 py-4 sm:py-6">
      <div className="text-lg sm:text-xl lg:text-2xl font-semibold mb-4 text-gray-900">
        Watch history
      </div>
      {loading ? (
        <div className="text-gray-500 text-center py-8">Loading...</div>
      ) : videos.length === 0 ? (
        <div className="text-gray-500 text-center py-8">
          No watch history yet. Start watching videos!
        </div>
      ) : (
        <>
          {/* ✅ Mobile view (stacked list) */}
          <div className="block sm:hidden">
            <VideoList videos={videos} />
          </div>

          {/* ✅ Desktop / Tablet view (grid) */}
          <div className="hidden sm:block">
            <VideoGrid videos={videos} />
          </div>
        </>
      )}
    </div>
  );
}
