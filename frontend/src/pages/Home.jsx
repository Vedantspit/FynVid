import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { endpoints } from "../api/client";
import VideoGrid from "../components/VideoGrid";
import VideoList from "../components/VideoList";

export default function Home() {
  const { api } = useAuth();
  const [videos, setVideos] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await api.request(endpoints.videos());
        console.log("VIDEOS ", res);

        setVideos(res?.data?.videos || res?.data || []);
      } catch (e) {
        setError(e.message);
      }
    })();
  }, [api]);

  return (
    <div className="p-4">
      {error && <div className="text-red-600 mb-4">{error}</div>}
      {videos.length === 0 ? (
        <h2 className="text-gray-600 text-center text-xl mt-8">
          No videos found
        </h2>
      ) : (
        <>
          {/* Mobile layout */}
          <div className="block sm:hidden">
            <VideoList videos={videos} />
          </div>

          {/* Tablet / Desktop layout */}
          <div className="hidden sm:block">
            <VideoGrid videos={videos} />
          </div>
        </>
      )}
    </div>
  );
}
