import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useEffect, useState } from "react";

export default function VideoCard({ video }) {
  const thumb = video?.thumbnail || video?.thumbnailUrl || "";
  const title = video?.title || "Untitled";
  const id = video?._id || video?.id;
  const { api } = useAuth();
  const [channel, setChannel] = useState(null);

  const ownerUsername =
    video?.owner?.userName || video?.owner?.username || video?.ownerName || "";

  useEffect(() => {
    if (!ownerUsername) return;
    const fetchChannel = async () => {
      try {
        const res = await api.request(`/users/channel/${ownerUsername}`);
        setChannel(res?.data || null);
      } catch (err) {
        console.error("Failed to fetch channel:", err);
      }
    };
    fetchChannel();
  }, [ownerUsername, api]);

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
        <div className="aspect-video w-full overflow-hidden rounded-lg bg-gray-200 flex items-center justify-center">
          {thumb ? (
            <img
              src={thumb}
              alt={title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-500">
              No Thumbnail
            </div>
          )}
        </div>
      </Link>

      {/* Video Info */}
      <div className="flex mt-3 items-start gap-3">
        {/* Avatar */}
        <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center shrink-0">
          {channel?.avatar ? (
            <img
              src={channel.avatar}
              alt="avatar"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="text-sm font-medium text-gray-500">
              {(
                channel?.fullName?.[0] ||
                ownerUsername?.[0] ||
                "U"
              ).toUpperCase()}
            </div>
          )}
        </div>

        {/* Title + Meta */}
        <div className="flex-1 min-w-0">
          <Link to={`/watch/${id}`}>
            <h3 className="font-medium text-gray-900 line-clamp-2 group-hover:underline">
              {title}
            </h3>
          </Link>
          <div className="text-sm text-gray-500 mt-1">
            {ownerUsername && (
              <Link
                to={`/channel/${ownerUsername}`}
                className="hover:underline"
              >
                {ownerUsername}
              </Link>
            )}
             
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <div>{getTimeDiff(video.createdAt)} ago</div>
              <div>•</div>
              <div>{views} views</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
