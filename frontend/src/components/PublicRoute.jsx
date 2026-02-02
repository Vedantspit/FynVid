import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useEffect, useState } from "react";
const PageSkeleton = () => {
  const [showMessage, setShowMessage] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowMessage(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-white p-6 relative">
      {/* Skeleton content */}
      <div className="animate-pulse">
        <div className="h-6 w-40 bg-gray-200 rounded mb-6" />

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i}>
              <div className="h-40 bg-gray-200 rounded-xl mb-3" />
              <div className="h-4 bg-gray-200 rounded mb-2" />
              <div className="h-4 bg-gray-200 rounded w-2/3" />
            </div>
          ))}
        </div>
      </div>

      {showMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Dark backdrop */}
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

          {/* Message box */}
          <div className="relative bg-gray-900 text-white rounded-xl px-6 py-4 shadow-lg text-center max-w-sm">
            <p className="text-sm">
              Server warm-up may take up to a minute.
              <br />
              Please wait.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
export default function PublicRoute() {
  const { isAuthenticated, loading } = useAuth();
  if (loading) {
    return <PageSkeleton />;
  }
  return !isAuthenticated ? <Outlet /> : <Navigate to="/" replace />;
}
