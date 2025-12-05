import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { endpoints } from "../api/client";
import VideoGrid from "../components/VideoGrid";
import VideoList from "../components/VideoList"; // ✅ Added for phone view

export default function Dashboard() {
  const { api } = useAuth();
  const [stats, setStats] = useState(null);
  const [videos, setVideos] = useState([]);

  // Helper to convert object key like totalViews → Total Views
  const formatKey = (key) => {
    return key
      .replace(/([A-Z])/g, " $1") // insert space before capital letters
      .replace(/^./, (str) => str.toUpperCase()); // capitalize first letter
  };

  useEffect(() => {
    (async () => {
      try {
        const [s, v] = await Promise.all([
          api.request(endpoints.stats()),
          api.request(endpoints.myVideos()),
        ]);
        setStats(s?.data || null);
        setVideos(v?.data?.videos || v?.data || []);
      } catch {}
    })();
  }, [api]);

  return (
    <div className="p-4 space-y-6">
      {/* Stats section */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats
          ? Object.entries(stats).map(([k, v]) => (
              <div key={k} className="border rounded p-4">
                <div className="text-sm text-gray-500">{formatKey(k)}</div>
                <div className="text-2xl font-semibold">{String(v)}</div>
              </div>
            ))
          : null}
      </div>

      {/* Videos section */}
      <div>
        <div className="text-xl font-semibold mb-3">Your uploads</div>

        {/* ✅ Mobile view - stacked list */}
        <div className="block sm:hidden">
          <VideoList videos={videos} />
        </div>

        {/* ✅ Desktop / Tablet view - grid */}
        <div className="hidden sm:block">
          <VideoGrid videos={videos} />
        </div>
      </div>
    </div>
  );
}
