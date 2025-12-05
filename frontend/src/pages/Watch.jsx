import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { Globe, Lock, Trash2 } from "lucide-react";

import { useAuth } from "../context/AuthContext";
import { endpoints } from "../api/client";
import LikeButton from "../components/LikeButton";
import CommentList from "../components/CommentList";
import PlaylistManager from "../components/PlaylistManager";
import SubscribeButton from "../components/SubscribeButton";

// Helper function to capitalize first letter of each word
const capitalizeWords = (str) => {
  if (!str) return "";
  return str
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

export default function Watch() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { api, user } = useAuth();
  const [video, setVideo] = useState(null);
  const [error, setError] = useState("");
  const fetchedRef = useRef(false);
  const [channel, setChannel] = useState(null);
  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true; // prevent double fetch in React StrictMode

    (async () => {
      try {
        // Fetch video details and like info in parallel
        const [videoRes, likeRes] = await Promise.all([
          api.request(endpoints.videoById(id)),
          api.request(endpoints.videoLikeInfo(id)).catch(() => null),
        ]);

        const v = videoRes?.data || null;

        if (v && likeRes?.data) {
          v.likesCount =
            typeof likeRes.data.likesCount === "number"
              ? likeRes.data.likesCount
              : 0;
          v.liked = !!likeRes.data.liked;
        }

        setVideo(v);

        const me = await api.request(`/users/channel/${v.owner.userName}`);
        console.log("Fetched channel ", me);

        const ch = me?.data || null;
        setChannel(ch);
      } catch (e) {
        setError(e.message);
        setVideo(null);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (!video) return <div className="p-4">{error || "Loading..."}</div>;

  return (
    <div className="px-3 sm:px-4 lg:px-6 py-4 sm:py-6 max-w-5xl mx-auto">
      {/* Video player */}
      <div className="aspect-video w-full bg-black rounded-lg overflow-hidden mb-4 sm:mb-6">
        {video.videoFile ? (
          <video
            src={video.videoFile}
            controls
            className="w-full h-full object-contain"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white text-sm sm:text-base">
            No video source
          </div>
        )}
      </div>

      {/* Title + Delete button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-gray-900 wrap-break-word">
          {video.title || "Untitled"}
        </h1>

        {user?._id &&
        String(user._id) === String(video?.owner?._id || video?.owner) ? (
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={async () => {
                const confirmDelete = window.confirm(
                  "Are you sure you want to delete this video? This action cannot be undone."
                );
                if (!confirmDelete) return;

                try {
                  await api.request(endpoints.videoById(video._id), {
                    method: "DELETE",
                  });
                  navigate("/");
                } catch (e) {
                  setError("Failed to delete video.");
                }
              }}
              className="px-3 py-2 rounded-lg border border-red-400 text-red-600 text-sm sm:text-base hover:bg-red-50 active:scale-95 transition-all cursor-pointer flex items-center gap-1"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>

            <button
              onClick={async () => {
                try {
                  await api.request(endpoints.togglePublish(video._id), {
                    method: "PATCH",
                  });
                  navigate("/");
                } catch (error) {
                  setError(
                    "Something went wrong while toggling the publish status."
                  );
                }
              }}
              className={`px-3 py-2 rounded-lg border text-sm sm:text-base active:scale-95 transition-all cursor-pointer flex items-center gap-1
        ${
          video.isPublished
            ? "border-yellow-400 text-yellow-600 hover:bg-yellow-50"
            : "border-green-400 text-green-600 hover:bg-green-50"
        }`}
            >
              {video.isPublished ? (
                <>
                  <Lock className="w-4 h-4" />
                  Make Private
                </>
              ) : (
                <>
                  <Globe className="w-4 h-4" />
                  Make Public
                </>
              )}
            </button>
          </div>
        ) : null}
      </div>

      <div className="mt-3 sm:mt-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center shrink-0">
            {video?.owner?.avatar ? (
              <img
                src={video.owner.avatar}
                alt="avatar"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-sm sm:text-base font-medium text-gray-500">
                {(
                  video?.owner?.fullName?.[0] ||
                  video?.owner?.userName?.[0] ||
                  "U"
                ).toUpperCase()}
              </div>
            )}
          </div>

          <div>
            {video?.owner?.userName ? (
              <Link
                to={`/channel/${video.owner.userName}`}
                className="hover:underline font-medium text-base sm:text-lg text-gray-900"
              >
                {capitalizeWords(video.owner.userName)}
              </Link>
            ) : (
              <span className="font-medium text-base sm:text-lg text-gray-900">
                Unknown
              </span>
            )}

            {channel && (
              <div className="text-xs sm:text-sm text-gray-500">
                {channel.subscribersCount || 0} subscribers
              </div>
            )}
          </div>
        </div>

        {channel && (
          <SubscribeButton
            channelId={channel._id}
            initialSubscribed={channel.isSubscribed}
            initialCount={channel.subscribersCount}
            onCountChange={(newCount) =>
              setChannel((prev) => ({ ...prev, subscribersCount: newCount }))
            }
          />
        )}
      </div>
      {video?.description ? (
        <div className="mt-4 sm:mt-5 text-sm sm:text-base text-gray-600 whitespace-pre-line break-words bg-gray-50 p-4 rounded-lg">
          {video.description}
        </div>
      ) : null}

      {/* Like Button BELOW description */}
      <div className="mt-4 sm:mt-5">
        <LikeButton
          videoId={video._id}
          initialLiked={video.liked ?? false}
          initialCount={
            typeof video.likesCount === "number" ? video.likesCount : 0
          }
        />
      </div>

      {/* Comments */}
      <div className="mt-6 sm:mt-8">
        <CommentList videoId={video._id} />
      </div>

      {/* Playlist manager */}
      <div className="mt-6 sm:mt-8">
        <PlaylistManager videoId={video._id} />
      </div>
    </div>
  );
}
