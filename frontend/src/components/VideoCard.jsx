import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useEffect, useState } from "react";

// Helper function to capitalize the first letter of each word
const capitalizeWords = (str) => {
  if (!str) return "";
  return str
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

export default function VideoCard({ video }) {
  const thumb = video?.thumbnail || video?.thumbnailUrl || "";
  const title = video?.title || "Untitled";
  const id = video?._id || video?.id;
  const { api, user } = useAuth();

  const ownerUsername =
    video?.owner?.userName || video?.owner?.username || video?.ownerName || "";
  const views = typeof video?.views === "number" ? video.views : 0;
  const getTimeDiff = (dateString) => {
    const uploadedSec = new Date(dateString);
    const currentSec = new Date();

    const diffInSecs = (currentSec - uploadedSec) / 1000;

    const mapTime = [
      { label: "year", seconds: 365 * 24 * 60 * 60 },
      { label: "month", seconds: 30 * 24 * 60 * 60 },
      { label: "week", seconds: 7 * 24 * 60 * 60 },
      { label: "day", seconds: 24 * 60 * 60 },
      { label: "hour", seconds: 60 * 60 },
      { label: "minute", seconds: 60 },
      { label: "second", seconds: 1 },
    ];

    for (let interval of mapTime) {
      const count = Math.floor(diffInSecs / interval.seconds);
      if (count >= 1) {
        return `${count} ${interval.label}${count > 1 ? "s" : ""} ago`;
      }
    }
    return "just now";
  };

  return (
    <div className="group block">
      {/* Thumbnail */}
      <Link to={`/watch/${id}`} className="block">
        <div className="aspect-video w-full overflow-hidden rounded-lg bg-gray-200 flex items-center justify-center transition-transform group-hover:scale-[1.02]">
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
      </Link>

      {/* Video Info */}
      <div className="flex mt-3 items-start gap-2 sm:gap-3">
        {/* Avatar */}
        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center shrink-0">
          {video?.owner?.avatar ? (
            <img
              src={video?.owner?.avatar}
              alt="avatar"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="text-sm sm:text-sm font-medium text-gray-500">
              {(
                video?.owner?.fullName?.[0] ||
                ownerUsername?.[0] ||
                "U"
              ).toUpperCase()}
            </div>
          )}
        </div>

        {/* Title + Meta */}
        <div className="flex-1 min-w-0">
          <Link to={`/watch/${id}`}>
            <h3 className="font-semibold text-sm sm:text-base text-gray-900 line-clamp-2 group-hover:underline leading-snug">
              {title}
            </h3>
          </Link>

          <div className="mt-1">
            {ownerUsername && (
              <Link
                to={`/channel/${ownerUsername}`}
                className="text-xs sm:text-sm text-gray-600 hover:text-gray-900 block truncate"
              >
                {capitalizeWords(ownerUsername)}
              </Link>
            )}

            <div className="flex items-center gap-1.5 text-[11px] sm:text-xs text-gray-500 mt-0.5">
              <span>{views} views</span>
              <span>•</span>
              <span>{getTimeDiff(video.createdAt)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
