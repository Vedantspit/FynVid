import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import VideoGrid from "../components/VideoGrid";
import VideoList from "../components/VideoList"; // ✅ Added for mobile
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
        console.log("History response:", res);
        setVideos(Array.isArray(res?.data) ? res.data : []);
      } catch {
        setVideos([]);
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="p-4">
      <div className="text-xl font-semibold mb-4">Watch history</div>
      {loading ? (
        <div className="text-gray-500">Loading...</div>
      ) : videos.length === 0 ? (
        <div className="text-gray-500">
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
