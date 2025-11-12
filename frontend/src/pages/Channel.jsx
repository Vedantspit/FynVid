import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { endpoints } from "../api/client";
import SubscribeButton from "../components/SubscribeButton";
import VideoGrid from "../components/VideoGrid";
import VideoList from "../components/VideoList"; // ✅ added for phone layout

export default function Channel() {
  const { username } = useParams();
  const { api } = useAuth();
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
      } catch {}
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [username]);

  if (!channel) return <div className="p-4">Loading...</div>;

  return (
    <div className="p-4 space-y-6">
      {/* Cover Image */}
      <div className="h-48 sm:h-60 md:h-72 rounded-lg bg-gray-200 overflow-hidden">
        {channel.coverImage && (
          <img
            src={channel.coverImage}
            alt="cover"
            className="w-full h-full object-cover"
          />
        )}
      </div>

      {/* Channel Info */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
        {/* Avatar */}
        <div className="w-20 h-20 rounded-full bg-gray-300 overflow-hidden flex items-center justify-center mx-auto sm:mx-0">
          {channel.avatar ? (
            <img
              src={channel.avatar}
              alt="avatar"
              className="w-full h-full object-contain"
            />
          ) : (
            <div className="text-gray-600 text-2xl font-semibold">
              {channel.fullName?.[0]?.toUpperCase() || "U"}
            </div>
          )}
        </div>

        {/* Channel Details */}
        <div className="flex-1 text-center sm:text-left">
          <div className="text-2xl font-semibold">{channel.fullName}</div>
          <div className="text-sm text-gray-500 mt-1">
            @{channel.userName} • {channel.subscribersCount || 0} subscribers
          </div>
        </div>

        {/* Subscribe Button */}
        <div className="flex justify-center sm:justify-end">
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
        <div className="text-xl font-semibold mb-3">
          {channel.fullName}'s uploads
        </div>

        {/* ✅ Mobile layout (stacked list) */}
        <div className="block sm:hidden">
          <VideoList videos={videos} />
        </div>

        {/* ✅ Tablet/Desktop layout (grid) */}
        <div className="hidden sm:block">
          <VideoGrid videos={videos} />
        </div>
      </div>
    </div>
  );
}
