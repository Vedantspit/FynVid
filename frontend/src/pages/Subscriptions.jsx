import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { endpoints } from "../api/client";
import { Link } from "react-router-dom";

export default function Subscriptions() {
  const { api, user } = useAuth();
  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?._id) return;
    (async () => {
      try {
        const res = await api.request(endpoints.subscribedChannels(user._id));
        setChannels(res?.data || []);
      } catch (err) {
        console.error("Failed to fetch subscribed channels:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [user?._id, api]);

  return (
    <div className="px-3 sm:px-4 lg:px-6 py-4 sm:py-6">
      <div className="text-lg sm:text-xl lg:text-2xl font-semibold mb-4 text-gray-900">Subscribed channels</div>

      {loading ? (
        <div className="text-gray-500 text-center py-8">Loading...</div>
      ) : channels.length === 0 ? (
        <div className="text-gray-500 text-center py-8">
          You haven't subscribed to any channels yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {channels.map((c) => {
            const username = c.userName || c.username;
            return (
              <Link
                key={c._id}
                to={`/channel/${username}`}
                className="border border-gray-200 rounded-lg p-4 flex items-center gap-3 hover:bg-gray-50 active:bg-gray-100 transition-colors bg-white shadow-sm"
              >
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center shrink-0">
                  {c.avatar ? (
                    <img
                      src={c.avatar}
                      alt="avatar"
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="text-sm sm:text-base font-medium text-gray-500">
                      {(c.fullName?.[0] || username?.[0] || "U").toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm sm:text-base truncate text-gray-900">
                    {c.fullName || username}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-500 truncate mt-0.5">
                    @{username}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
