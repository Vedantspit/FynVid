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

  const [loading, setLoading] = useState(true);
  const [channel, setChannel] = useState(null);
  const [videos, setVideos] = useState([]);

  useEffect(() => {
    let isMounted = true;

    // Set loading true whenever the username changes
    setLoading(true);

    const fetchChannelData = async () => {
      try {
        const channelRes = await api.request(`/users/channel/${username}`);
        if (!isMounted) return;

        const channelData = channelRes?.data || null;
        // console.log("Data for channel ", channelData);

        setChannel(channelData);

        if (channelData?._id) {
          const vidsRes = await api.request(
            `${endpoints.videos()}?userId=${channelData._id}`,
          );
          if (!isMounted) return;

          const videoArray = Array.isArray(vidsRes?.data?.videos)
            ? vidsRes.data.videos
            : Array.isArray(vidsRes?.data)
              ? vidsRes.data
              : [];
          setVideos(videoArray);
        }
      } catch (err) {
        // console.error("Error fetching channel:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchChannelData();

    return () => {
      isMounted = false;
    };
  }, [username, api]);

  if (!loading && !channel) {
    return (
      <div className="p-6 text-center text-gray-500">Channel not found.</div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      {/* Cover Image Section */}
      <div className="h-40 sm:h-56 md:h-72 lg:h-80 rounded-2xl bg-gray-200 overflow-hidden shadow-sm relative">
        {channel?.coverImage ? (
          <img
            src={channel.coverImage}
            alt="Channel cover"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="h-full flex items-center justify-center text-gray-400 text-lg">
            {loading ? "..." : "No cover image"}
          </div>
        )}
      </div>

      {/* Channel Info Section */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-6">
        {/* Avatar */}
        <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gray-300 overflow-hidden shadow-md flex items-center justify-center mx-auto sm:mx-0 shrink-0">
          {channel?.avatar ? (
            <img
              src={channel.avatar}
              alt="Avatar"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="text-gray-600 text-2xl font-semibold">
              {channel?.fullName?.[0]?.toUpperCase() || "?"}
            </div>
          )}
        </div>

        {/* Details */}
        <div className="flex-1 text-center sm:text-left min-w-0">
          <div className="text-2xl sm:text-3xl font-bold text-gray-900 truncate">
            {channel?.fullName || "Loading..."}
          </div>
          <div className="text-sm sm:text-base text-gray-600 mt-1">
            {channel ? `@${channel.userName}` : "..."} •{" "}
            <span className="font-medium text-gray-800">
              {channel?.subscribersCount || 0}
            </span>{" "}
            subscribers
          </div>
          {channel?.userName === user?.userName && (
            <div className="text-xs sm:text-sm text-gray-500 mt-0.5">
              <span className="font-medium text-gray-700">
                {channel.channelsSubscribedToCount || 0}
              </span>{" "}
              subscriptions
            </div>
          )}
        </div>

        {/* Subscribe Button - Only show if channel data is loaded */}
        {channel && (
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
        )}
      </div>

      {/* Videos Section */}
      <div>
        <div className="text-xl sm:text-2xl font-semibold mb-4 text-gray-900 border-b border-gray-200 pb-2">
          {channel?.userName === user?.userName
            ? "Your"
            : `${channel?.fullName || "Channel"}'s`}{" "}
          uploads
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900"></div>
            <p className="mt-4 text-sm text-gray-500 animate-pulse">
              Loading videos...
            </p>
          </div>
        ) : videos.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-xl text-gray-500 text-sm">
            No videos uploaded yet.
          </div>
        ) : (
          <>
            <div className="block sm:hidden">
              <VideoList videos={videos} />
            </div>
            <div className="hidden sm:block">
              <VideoGrid videos={videos} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
