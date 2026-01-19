import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { endpoints } from "../api/client";

export default function LikeButton({
  videoId,
  initialLiked = false,
  initialCount = 0,
}) {
  const { api } = useAuth();
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);

  useEffect(() => {
    // derive liked status from liked videos list
    (async () => {
      try {
        const res = await api.request(endpoints.likedVideos());
        const likedIds = Array.isArray(res?.data)
          ? res.data.map((v) => String(v._id))
          : [];
        if (likedIds.includes(String(videoId))) setLiked(true);
      } catch {}
    })();
  }, [videoId]);

  const toggle = async () => {
    const previousLiked = liked;
    const previousCount = count;
    const beforeToggledLike = !liked;
    setLiked(beforeToggledLike);
    setCount((prev) => (beforeToggledLike ? prev + 1 : Math.max(0, prev - 1)));
    try {
      const res = await api.request(endpoints.toggleVideoLike(videoId), {
        method: "POST",
      });
      const serverCount = res?.data?.likesCount;
      const serverLiked = res?.data?.liked;
      if (typeof serverLiked === "boolean") setLiked(serverLiked);
      if (typeof serverCount === "number") setCount(serverCount);
      else setCount((c) => (liked ? Math.max(0, c - 1) : c + 1));
    } catch (e) {
      setLiked(previousLiked);
      setCount(previousCount);
      alert("Failed to update like. Please check your connection.");
    }
  };

  return (
    <button
      onClick={toggle}
      className={`px-3 py-1.5 rounded border ${
        liked ? "bg-gray-900 text-white" : ""
      }`}
    >
      👍 {count}
    </button>
  );
}
