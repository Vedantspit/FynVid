import { Link } from "react-router-dom";
import { GrAlert } from "react-icons/gr";

export const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-6 text-center">
      {/* Icon */}
      <div className="text-6xl text-red-500 mb-6 animate-bounce">
        <GrAlert />
      </div>

      <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 mb-4">404</h1>

      <p className="text-gray-500 text-base sm:text-lg mb-8 max-w-md">
        The page you’re looking for doesn’t exist
      </p>

      <div className="flex gap-4">
        <Link
          to="/"
          replace
          className="px-5 py-2.5 rounded-xl bg-gray-900 text-white 
          text-sm sm:text-base font-medium hover:bg-gray-800 
          active:scale-95 transition-all"
        >
          Go Home
        </Link>

        {/* <Link
          to="/history"
          className="px-5 py-2.5 rounded-xl border border-gray-300 
          text-gray-700 text-sm sm:text-base font-medium 
          hover:bg-gray-100 active:scale-95 transition-all"
        >
          View History
        </Link> */}
      </div>
    </div>
  );
};
