import { NavLink } from "react-router-dom";

const nav = [
  { to: "/", label: "Home" },
  { to: "/liked", label: "Liked" },
  { to: "/playlists", label: "Playlists" },
  { to: "/subscriptions", label: "Subscriptions" },
  { to: "/history", label: "History" },
  { to: "/dashboard", label: "Dashboard" },
  { to: "/settings", label: "Settings" },
];

export default function Sidebar({ open, onClose }) {
  return (
    <>
      {/* Mobile Sidebar */}
      <aside
        className={`fixed md:hidden top-0 left-0 h-full w-64 bg-white border-r border-gray-200 z-40 transform transition-transform duration-300 ease-in-out ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <nav className="p-4 space-y-1 mt-[57px]">
          {nav.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              onClick={onClose}
              className={({ isActive }) =>
                `block px-4 py-3 rounded-lg text-base ${
                  isActive
                    ? "bg-gray-900 text-white"
                    : "hover:bg-gray-100 text-gray-700"
                } transition-colors`
              }
            >
              {n.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Desktop Sidebar */}
      <aside className="hidden md:block w-56 shrink-0 h-[calc(100vh-57px)] sticky top-[57px] border-r border-gray-200 bg-white">
        <nav className="p-3 space-y-1">
          {nav.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              className={({ isActive }) =>
                `block px-3 py-2 rounded-lg transition-colors ${
                  isActive
                    ? "bg-gray-900 text-white"
                    : "hover:bg-gray-100 text-gray-700"
                }`
              }
            >
              {n.label}
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
}
