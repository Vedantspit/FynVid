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
  { to: "/notification", label: "Notification" },
  { to: "/settings", label: "Settings" },
];

export default function Sidebar() {
  const { api } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const res = await api.request(endpoints.unreadCount());
        console.log("RES sidebar count", res);

        setUnreadCount(res.count || 0);
      } catch (err) {
        console.error("Error fetching unread count:", err);
      }
    };
    fetchUnread();
  }, [api]);

  return (
    <aside className="hidden md:block w-56 shrink-0 h-[calc(100vh-57px)] sticky top-[57px] border-r border-gray-200 bg-white">
      <nav className="p-3 space-y-1">
        {nav.map((n) => (
          <NavLink
            key={n.to}
            to={n.to}
            className={({ isActive }) =>
              `flex justify-between items-center px-3 py-2 rounded ${
                isActive ? "bg-gray-900 text-white" : "hover:bg-gray-100"
              }`
            }
          >
            <span>{n.label}</span>
            {n.label === "Notification" && unreadCount > 0 && (
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
