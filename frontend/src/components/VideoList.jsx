import { Link } from "react-router-dom";
import { FaLock } from "react-icons/fa";
import { getTimeDiff } from "../utils/time";
import { useAuth } from "../context/AuthContext";

// Helper function to capitalize first letter of each word
const capitalizeWords = (str) => {
  if (!str) return "";
  return str
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

export default function VideoList({ videos, dashboardPage = false }) {
  const { api, user } = useAuth();

  const items = Array.isArray(videos)
    ? videos
    : Array.isArray(videos?.data)
      ? videos.data
      : Array.isArray(videos?.docs)
        ? videos.docs
        : [];

  return (
    <div className="flex flex-col divide-y divide-gray-200">
      {items.map((video) => {
        const id = video?._id || video?.id;
        const thumb = video?.thumbnail || video?.thumbnailUrl;
        const title = video?.title || "Untitled";
        const ownerUsername =
          video?.owner?.userName ||
          video?.owner?.username ||
          video?.ownerName ||
          "";
        const views = video?.views || 0;
        const isOwner = user.userName === video?.owner?.userName;
        const isPrivate = video?.isPublished === false;

        return (
          <Link
            key={id}
            to={`/watch/${id}`}
            className="flex gap-3 p-3 hover:bg-gray-50 active:bg-gray-100 transition-colors"
          >
            {/* Thumbnail */}
            <div className="w-36 sm:w-40 h-24 rounded-lg overflow-hidden bg-gray-200 shrink-0">
              {thumb ? (
                <img
                  src={thumb}
                  alt={title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-500 text-sm">
                  No Thumbnail
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex flex-col justify-center flex-1 min-w-0">
              <h3 className="font-semibold text-sm sm:text-base text-gray-900 line-clamp-2 leading-snug">
                {title}
              </h3>

              <p className="text-xs sm:text-sm text-gray-600 mt-0.5 truncate">
                {capitalizeWords(ownerUsername)}
              </p>
              <div className="flex items-center gap-1.5 text-[11px] sm:text-xs text-gray-500 mt-0.5">
                <span>{views} views</span>
                <span>•</span>
                <span>{getTimeDiff(video.createdAt)}</span>
                <div className=" text-red-500 mt-0.5">
                  {" "}
                  {dashboardPage && isOwner && isPrivate && (
                    <FaLock
                      title="This video is private"
                      aria-label="Private video"
                    />
                  )}
                </div>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
