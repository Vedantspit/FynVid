import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { endpoints } from "../api/client";
import VideoGrid from "../components/VideoGrid";
import VideoList from "../components/VideoList";

export default function Dashboard() {
  const { api } = useAuth();
  const [stats, setStats] = useState(null);
  const [videos, setVideos] = useState([]);

  // Helper to convert object key like totalViews → Total Views
  const formatKey = (key) => {
    return key
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (str) => str.toUpperCase());
  };

  useEffect(() => {
    (async () => {
      try {
        const [s, v] = await Promise.all([
          api.request(endpoints.stats()),
          api.request(endpoints.myVideos()),
        ]);
        // console.log("Dashboard videos ", videos);

        setStats(s?.data || null);
        // console.log("Video data dashboard ", v?.data);

        setVideos(v?.data?.videos || v?.data || []);
      } catch {}
    })();
  }, [api]);

  return (
    <div className="px-3 sm:px-4 lg:px-6 py-4 sm:py-6 space-y-6">
      {/* Stats section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats
          ? Object.entries(stats).map(([k, v]) => (
              <div
                key={k}
                className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm"
              >
                <div className="text-xs sm:text-sm text-gray-500">
                  {formatKey(k)}
                </div>
                <div className="text-xl sm:text-2xl font-semibold text-gray-900 mt-1">
                  {String(v)}
                </div>
              </div>
            ))
          : null}
      </div>

      {/* Videos section */}
      <div>
        <div className="text-lg sm:text-xl lg:text-2xl font-semibold mb-4 text-gray-900">
          Your uploads
        </div>

        {/* Mobile view - stacked list */}
        <div className="block sm:hidden">
          <VideoList videos={videos} dashboardPage={true} />
        </div>

        {/* Desktop / Tablet view - grid */}
        <div className="hidden sm:block">
          <VideoGrid videos={videos} dashboardPage={true} />
        </div>
      </div>
    </div>
  );
}
