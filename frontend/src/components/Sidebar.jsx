import { NavLink } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { endpoints } from "../api/client";

const nav = [
  { to: "/", label: "Home" },
  { to: "/liked", label: "Liked" },
  { to: "/playlists", label: "Playlists" },
  { to: "/subscriptions", label: "Subscriptions" },
  { to: "/history", label: "History" },
  { to: "/dashboard", label: "Dashboard" },
  { to: "/notification", label: "Notifications" },
  { to: "/settings", label: "Settings" },
];

export default function Sidebar({ open, onClose }) {
  const { api } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch unread count initially and every 5 seconds
  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const res = await api.request(endpoints.unreadCount());
        setUnreadCount(res.count || 0);
      } catch (err) {
        console.error("Error fetching unread count:", err);
      }
    };

    fetchUnread();
    const interval = setInterval(fetchUnread, 5000);
    return () => clearInterval(interval);
  }, [api]);

  return (
    <aside
      className={`fixed md:static top-[57px] left-0 h-[calc(100vh-57px)] w-56 border-r border-gray-200 bg-white transform transition-transform duration-300 ease-in-out z-30
        ${open ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
    >
      <nav className="p-3 space-y-1">
        {nav.map((n) => (
          <NavLink
            key={n.to}
            to={n.to}
            onClick={onClose}
            className={({ isActive }) =>
              `flex justify-between items-center px-3 py-2 rounded ${
                isActive ? "bg-gray-900 text-white" : "hover:bg-gray-100"
              }`
            }
          >
            <span>{n.label}</span>
            {n.label === "Notifications" && unreadCount > 0 && (
              <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {unreadCount}
              </span>
            )}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
