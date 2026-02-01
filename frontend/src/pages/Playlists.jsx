import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { endpoints } from "../api/client";
import VideoCard from "../components/VideoCard";

export default function Playlists() {
  const { api, user } = useAuth();
  const [lists, setLists] = useState([]);
  const [openId, setOpenId] = useState("");

  useEffect(() => {
    if (!user?._id) return;
    (async () => {
      try {
        const res = await api.request(endpoints.playlistsByUser(user._id));
        setLists(
          Array.isArray(res?.data) ? res.data : res?.data?.playlists || [],
        );
      } catch (e) {
        // console.error(e);
      }
    })();
  }, [user?._id]);

  const deletePlaylist = async (playlistId) => {
    if (!window.confirm("Are you sure you want to delete this playlist?"))
      return;
    try {
      await api.request(endpoints.deletePlaylist(playlistId), {
        method: "DELETE",
      });
      setLists((prev) => prev.filter((p) => p._id !== playlistId));
    } catch (error) {
      // console.error("Failed to delete playlist:", error);
    }
  };

  return (
    <div className="px-3 sm:px-4 lg:px-6 py-4 sm:py-6 max-w-7xl mx-auto">
      <div className="text-lg sm:text-xl lg:text-2xl font-semibold mb-6 text-gray-900">
        Your playlists
      </div>

      {lists.length === 0 ? (
        <div className="flex justify-center mt-12">
          <h2 className="text-gray-600 text-lg sm:text-xl text-center">
            No playlists found
          </h2>
        </div>
      ) : (
        <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
          {lists.map((p) => (
            <div
              key={p._id}
              className="relative border rounded-xl p-5 bg-white shadow-sm hover:shadow-md transition-all group"
            >
              {/* Delete Playlist Button */}
              <button
                onClick={() => deletePlaylist(p._id)}
                className="absolute top-3 right-3 bg-white border rounded-full px-2 py-1 text-sm opacity-0 group-hover:opacity-100 hover:bg-red-100 hover:text-red-600 transition"
              >
                🗑️
              </button>

              {/* Playlist Header */}
              <button
                className="w-full text-left pr-8"
                onClick={() => setOpenId((cur) => (cur === p._id ? "" : p._id))}
              >
                <div className="flex flex-col text-gray-800">
                  <span className="font-medium">{p.name || "Untitled"}</span>
                  {p.description && (
                    <span className="text-xs text-gray-500 mt-1 line-clamp-2">
                      {p.description}
                    </span>
                  )}
                  <span className="text-sm text-gray-500 mt-1">
                    {p?.videos?.length || 0} videos
                  </span>
                </div>
              </button>

              {/* Playlist Videos */}
              {openId === p._id && (
                <div className="mt-4">
                  {(p?.videos || []).length === 0 ? (
                    <div className="text-sm text-gray-500 py-2">
                      No videos in this playlist
                    </div>
                  ) : (
                    <>
                      {/* Mobile: horizontal scroll */}
                      <div className="block sm:hidden overflow-x-auto -mx-1 pb-2">
                        <div className="flex gap-4 px-1">
                          {p.videos.map((v) => (
                            <div
                              key={v._id || v.id}
                              className="relative min-w-60 group/video"
                            >
                              <VideoCard video={v} />
                              <button
                                onClick={async () => {
                                  try {
                                    await api.request(
                                      endpoints.removeFromPlaylist(
                                        v._id,
                                        p._id,
                                      ),
                                      { method: "PATCH" },
                                    );
                                    setLists((prevLists) => {
                                      const updated = [...prevLists];
                                      const idx = updated.findIndex(
                                        (pl) => pl._id === p._id,
                                      );
                                      if (idx === -1) return prevLists;
                                      const oldPlaylist = updated[idx];
                                      const newVideos =
                                        oldPlaylist.videos.filter(
                                          (vid) => vid._id !== v._id,
                                        );
                                      updated[idx] = {
                                        ...oldPlaylist,
                                        videos: newVideos,
                                      };
                                      return updated;
                                    });
                                  } catch (error) {
                                    // console.error(
                                    //   "Failed to remove video:",
                                    //   error,
                                    // );
                                  }
                                }}
                                className="absolute top-2 right-2 bg-white border rounded-full px-2 py-1 text-sm opacity-0 group-hover/video:opacity-100 hover:bg-red-100 hover:text-red-600 transition"
                              >
                                🗑️
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Desktop: neat grid with spacing */}
                      <div className="hidden sm:flex flex-wrap gap-5 mt-2">
                        {p.videos.map((v) => (
                          <div
                            key={v._id || v.id}
                            className="relative group/video w-[calc(50%-0.625rem)] lg:w-[calc(33.333%-0.833rem)] min-w-[250px]"
                          >
                            <VideoCard video={v} />

                            <button
                              onClick={async () => {
                                try {
                                  await api.request(
                                    endpoints.removeFromPlaylist(v._id, p._id),
                                    { method: "PATCH" },
                                  );
                                  setLists((prevLists) => {
                                    const updated = [...prevLists];
                                    const idx = updated.findIndex(
                                      (pl) => pl._id === p._id,
                                    );
                                    if (idx === -1) return prevLists;
                                    const oldPlaylist = updated[idx];
                                    const newVideos = oldPlaylist.videos.filter(
                                      (vid) => vid._id !== v._id,
                                    );
                                    updated[idx] = {
                                      ...oldPlaylist,
                                      videos: newVideos,
                                    };
                                    return updated;
                                  });
                                } catch (error) {
                                  // console.error(
                                  //   "Failed to remove video:",
                                  //   error
                                  // );
                                }
                              }}
                              className="absolute top-2 right-2 bg-white border rounded-full px-2 py-1 text-sm opacity-0 group-hover/video:opacity-100 hover:bg-red-100 hover:text-red-600 transition"
                            >
                              🗑️
                            </button>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
