import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { endpoints } from "../api/client";
import Toast from "./Toast";

export default function PlaylistManager({ videoId }) {
  const { api, user } = useAuth();
  const [lists, setLists] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selected, setSelected] = useState("");
  const [toast, setToast] = useState({ message: "", type: "info" });

  //  helper to show toast
  const showToast = (message, type = "info") => setToast({ message, type });

  const load = async () => {
    try {
      if (!user?._id) return;
      const res = await api.request(endpoints.playlistsByUser(user._id));
      const arr = Array.isArray(res?.data)
        ? res.data
        : res?.data?.playlists || [];
      setLists(arr);
    } catch {
      showToast("Failed to load playlists", "error");
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?._id]);

  const create = async () => {
    if (!name.trim() || !description.trim()) {
      showToast("Both name and description are required", "error");
      return;
    }
    try {
      await api.request("/playlist", {
        method: "POST",
        body: { name: name.trim(), description: description.trim() },
      });
      setName("");
      setDescription("");
      showToast("Playlist created successfully", "success");
      await load();
    } catch (e) {
      showToast(e.message || "Failed to create playlist", "error");
    }
  };

  const add = async () => {
    if (!selected) return;
    try {
      await api.request(endpoints.addToPlaylist(videoId, selected), {
        method: "PATCH",
      });
      showToast("Added to playlist", "success");
    } catch (e) {
      showToast(e.message || "Failed to add to playlist", "error");
    }
  };

  return (
    <>
      {/* ✅ Toast visible below navbar */}
      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: "", type: "info" })}
      />

      <div className="border rounded p-4 space-y-4">
        {/* Create playlist */}
        <div>
          <div className="font-medium mb-2">Create playlist</div>
          <div className="grid sm:grid-cols-2 gap-2">
            <input
              className="px-3 py-2 border rounded"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <input
              className="px-3 py-2 border rounded"
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <button
            onClick={create}
            className="mt-2 px-3 py-2 rounded border hover:bg-gray-100 transition"
          >
            Create
          </button>
        </div>

        {/* Add to playlist */}
        <div>
          <div className="font-medium mb-2">Add to playlist</div>
          <div className="flex gap-2 items-center">
            <select
              className="px-3 py-2 border rounded w-full sm:w-auto"
              value={selected}
              onChange={(e) => setSelected(e.target.value)}
            >
              <option value="">Select a playlist</option>
              {lists.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.name}
                </option>
              ))}
            </select>
            <button
              onClick={add}
              className="px-3 py-2 rounded bg-gray-900 text-white hover:bg-gray-800 transition"
            >
              Add
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
