import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Menu } from "lucide-react"; // install lucide-react if not done: npm i lucide-react

export default function Navbar({ onToggleSidebar }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="sticky top-0 z-30 bg-white/80 backdrop-blur border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2.5 sm:py-3 flex items-center gap-2 sm:gap-4">
        {/* Hamburger for mobile */}
        <button
          className="md:hidden p-2 rounded-lg hover:bg-gray-100 active:bg-gray-200 transition-colors"
          onClick={onToggleSidebar}
          aria-label="Toggle menu"
        >
          <Menu size={22} />
        </button>

        <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <img
            src="https://res.cloudinary.com/mycloudved/image/upload/v1762531394/logof_sxjetj.png"
            alt="logo"
            className="w-7 h-7 sm:w-8 sm:h-8"
          />
          <span className="text-lg sm:text-xl font-bold text-gray-900">FynVid</span>
        </Link>

        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          {user ? (
            <>
              <Link
                to="/upload"
                className="px-2.5 sm:px-3 py-1.5 rounded-lg bg-gray-900 text-white text-sm sm:text-base font-medium hover:bg-gray-800 active:scale-95 transition-all whitespace-nowrap"
              >
                <span className="hidden sm:inline">Upload</span>
                <span className="sm:hidden">+</span>
              </Link>
              <button
                onClick={async () => {
                  await logout();
                  navigate("/login");
                }}
                className="px-2.5 sm:px-3 py-1.5 rounded-lg border border-gray-300 text-sm sm:text-base hover:bg-gray-50 active:scale-95 transition-all whitespace-nowrap"
              >
                <span className="hidden sm:inline">Logout</span>
                <span className="sm:hidden">Out</span>
              </button>
              <Link
                to={`/channel/${user?.userName || user?.username || user?._id}`}
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center text-xs sm:text-sm font-medium hover:ring-2 hover:ring-gray-300 transition-all shrink-0"
              >
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt="avatar"
                    className="w-full h-full object-contain"
                  />
                ) : (
                  user?.fullName?.[0] || "U"
                )}
              </Link>
            </>
          ) : (
            <>
              <Link to="/login" className="px-2.5 sm:px-3 py-1.5 rounded-lg border border-gray-300 text-sm sm:text-base hover:bg-gray-50 active:scale-95 transition-all whitespace-nowrap">
                Login
              </Link>
              <Link
                to="/register"
                className="px-2.5 sm:px-3 py-1.5 rounded-lg bg-gray-900 text-white text-sm sm:text-base font-medium hover:bg-gray-800 active:scale-95 transition-all whitespace-nowrap"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
