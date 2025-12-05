import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { endpoints } from "../api/client";
import SubscribeButton from "../components/SubscribeButton";
import VideoGrid from "../components/VideoGrid";
import VideoList from "../components/VideoList";

export default function Channel() {
  const { username } = useParams();
  const { user, api } = useAuth();
  const [channel, setChannel] = useState(null);
  const [videos, setVideos] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const me = await api.request(`/users/channel/${username}`);
        const ch = me?.data || null;
        setChannel(ch);

        if (ch?._id) {
          const vids = await api.request(
            `${endpoints.videos()}?userId=${ch._id}`
          );
          const data = Array.isArray(vids?.data?.videos)
            ? vids.data.videos
            : Array.isArray(vids?.data)
            ? vids.data
            : [];
          setVideos(data);
        } else {
          setVideos([]);
        }
      } catch (err) {
        console.error("Error fetching channel:", err);
      }
    })();
  }, [username]);

  if (!channel)
    return <div className="p-6 text-gray-500 text-center">Loading...</div>;

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      {/* Cover Image */}
      <div className="h-40 sm:h-56 md:h-72 lg:h-80 rounded-2xl bg-gray-200 overflow-hidden shadow-sm">
        {channel.coverImage ? (
          <img
            src={channel.coverImage}
            alt="Channel cover"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="h-full flex items-center justify-center text-gray-400 text-lg">
            No cover image
          </div>
        )}
      </div>

      {/* Channel Info */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-6">
        {/* Avatar */}
        <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gray-300 overflow-hidden shadow-md flex items-center justify-center mx-auto sm:mx-0">
          {channel.avatar ? (
            <img
              src={channel.avatar}
              alt="Channel avatar"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="text-gray-600 text-2xl font-semibold">
              {channel.fullName?.[0]?.toUpperCase() || "U"}
            </div>
          )}
        </div>

        {/* Channel Details */}
        <div className="flex-1 text-center sm:text-left min-w-0">
          <div className="text-2xl sm:text-3xl font-bold text-gray-900 truncate">
            {channel.fullName}
          </div>

          {/* Username + subscribers */}
          <div className="text-sm sm:text-base text-gray-600 mt-1">
            @{channel.userName} •{" "}
            <span className="font-medium text-gray-800">
              {channel.subscribersCount || 0}
            </span>{" "}
            subscribers
          </div>

          {/* Show only on your own channel */}
          {channel.userName === user.userName && (
            <div className="text-xs sm:text-sm text-gray-500 mt-0.5">
              <span className="font-medium text-gray-700">
                {channel.channelsSubscribedToCount || 0}
              </span>{" "}
              subscriptions
            </div>
          )}
        </div>

        {/* Subscribe Button */}
        <div className="flex justify-center sm:justify-end shrink-0">
          <SubscribeButton
            channelId={channel._id}
            initialSubscribed={channel.isSubscribed}
            initialCount={channel.subscribersCount}
            onCountChange={(newCount) =>
              setChannel((prev) => ({ ...prev, subscribersCount: newCount }))
            }
          />
        </div>
      </div>

      {/* Videos Section */}

      <div>
        <div className="text-xl sm:text-2xl font-semibold mb-4 text-gray-900 border-b border-gray-200 pb-2">
          {channel.userName == user.userName ? "Your" : channel.fullName + "'s"}{" "}
          uploads
        </div>

        {/* Mobile layout */}
        <div className="block sm:hidden">
          <VideoList videos={videos} />
        </div>

        {/* Tablet/Desktop layout */}
        <div className="hidden sm:block">
          <VideoGrid videos={videos} />
        </div>
      </div>
    </div>
  );
}
