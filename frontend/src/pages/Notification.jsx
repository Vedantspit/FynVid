import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { endpoints } from "../api/client";

export default function Notification() {
  const { api } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchNotifications();
  }, [api]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await api.request(endpoints.getNotify());
      const data =
        res?.data?.data || res?.data || (Array.isArray(res) ? res : []);

      if (Array.isArray(data)) {
        setNotifications(data);

        // Mark all unread as read when user opens Notifications page
        const unread = data.filter((n) => !n.isRead);
        if (unread.length > 0) {
          await api.request(endpoints.markAllNotificationsRead(), {
            method: "PATCH",
          });
          setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
        }
      } else {
        setError("Unexpected response format");
      }
    } catch (err) {
      console.error("❌ Error fetching notifications:", err);
      setError("Something went wrong while loading notifications");
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return <div className="p-4 text-gray-500">Loading notifications...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;
  if (!notifications.length)
    return <div className="p-4 text-gray-500">No notifications yet.</div>;

  return (
    <div className="p-4 space-y-3">
      <h2 className="text-xl font-semibold mb-4">Notifications</h2>
      {notifications.map((n) => (
        <div
          key={n._id}
          className={`flex items-start gap-3 p-3 rounded-xl shadow-sm transition ${
            n.isRead ? "bg-gray-100" : "bg-blue-50"
          } hover:bg-gray-100`}
        >
          <img
            src={n.sender?.avatar || "/default-avatar.png"}
            alt="avatar"
            className="w-10 h-10 rounded-full object-cover"
          />
          <div className="flex-1">
            <p className="text-gray-800 text-sm leading-snug">
              <strong>{n.sender?.fullName || "Someone"}</strong>{" "}
              {n.message || "sent you a notification"}
            </p>

            {n.video && (
              <a
                href={`/watch/${n.video._id}`}
                className="flex items-center gap-3 mt-2 border border-gray-200 rounded-lg p-2 hover:bg-gray-50 transition"
              >
                <img
                  src={n.video.thumbnail || "/default-thumb.jpg"}
                  alt={n.video.title}
                  className="w-20 h-12 object-cover rounded-md"
                />
                <div className="flex flex-col">
                  <p className="text-sm font-medium text-gray-700 line-clamp-1">
                    {n.video.title}
                  </p>
                  <p className="text-xs text-gray-500">View video →</p>
                </div>
              </a>
            )}

            <p className="text-xs text-gray-500 mt-1">
              {new Date(n.createdAt).toLocaleString()}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
