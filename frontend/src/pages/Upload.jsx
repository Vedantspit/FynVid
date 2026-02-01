import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { endpoints } from "../api/client";

export default function Upload() {
  const navigate = useNavigate();
  const { api } = useAuth();
  const [form, setForm] = useState({
    title: "",
    description: "",
    videoFile: null,
    thumbnail: null,
  });
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const submit = async (e) => {
    e.preventDefault();
    if (loading) return;
    if (!form.videoFile) {
      setError("Please upload a video file");
      window.scrollTo(0, 0);
      return;
    }

    if (!form.thumbnail) {
      setError("Please upload a thumbnail image");
      window.scrollTo(0, 0);
      return;
    }
    setLoading(true);
    const fd = new FormData();
    fd.append("title", form.title);
    fd.append("description", form.description);
    if (form.videoFile) fd.append("videoFile", form.videoFile);
    if (form.thumbnail) fd.append("thumbnail", form.thumbnail);
    try {
      await api.request(endpoints.videos(), {
        method: "POST",
        body: fd,
        isForm: true,
      });
      setMsg("Uploaded successfully");
      setForm({ title: "", description: "", videoFile: null, thumbnail: null });
      setTimeout(() => navigate("/"), 1000);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="px-4 py-6 sm:p-6 max-w-2xl mx-auto">
      <form
        onSubmit={submit}
        className="space-y-5 bg-white border border-gray-200 p-6 sm:p-8 rounded-xl shadow-lg"
      >
        <div className="text-2xl sm:text-3xl font-semibold text-gray-900">
          Upload video
        </div>
        {msg ? (
          <div
            className={`text-sm p-3 rounded-lg border ${msg.includes("success") ? "text-green-700 bg-green-50 border-green-200" : "text-red-600 bg-red-50 border-red-200"}`}
          >
            {msg}
          </div>
        ) : null}
        {error ? (
          <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">
            {error}
          </div>
        ) : null}
        <div className="space-y-4">
          <label className="block text-sm font-medium text-gray-700">
            Title *
          </label>
          <input
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all text-base"
            placeholder="Title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
          />
          <label className="block text-sm font-medium text-gray-700">
            Description *
          </label>
          <textarea
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all text-base resize-y"
            placeholder="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows="4"
            required
          />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Video file *
          </label>
          <label className="flex flex-col items-center justify-center w-full h-36 sm:h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
            <div className="flex flex-col items-center justify-center pt-5 pb-6 px-4">
              <svg
                className="w-8 h-8 mb-2 text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
              <p className="text-sm text-gray-500 text-center break-words max-w-full px-2">
                {form.videoFile ? form.videoFile.name : "Click to upload video"}
              </p>
            </div>
            <input
              type="file"
              accept="video/*"
              className="hidden"
              onChange={(e) =>
                setForm({ ...form, videoFile: e.target.files?.[0] || null })
              }
              // required
            />
          </label>
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Thumbnail *
          </label>
          <label className="flex flex-col items-center justify-center w-full h-36 sm:h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
            <div className="flex flex-col items-center justify-center pt-5 pb-6 px-4">
              <svg
                className="w-8 h-8 mb-2 text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <p className="text-sm text-gray-500 text-center break-words max-w-full px-2">
                {form.thumbnail
                  ? form.thumbnail.name
                  : "Click to upload thumbnail"}
              </p>
              {form.thumbnail && (
                <img
                  src={URL.createObjectURL(form.thumbnail)}
                  alt="Preview"
                  className="mt-3 h-20 sm:h-24 object-cover rounded-lg border border-gray-200"
                />
              )}
            </div>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) =>
                setForm({ ...form, thumbnail: e.target.files?.[0] || null })
              }
              // required
            />
          </label>
        </div>
        <button
          disabled={loading}
          className={`w-full px-4 py-3 rounded-lg text-white flex items-center justify-center gap-2 font-medium text-base transition-all ${loading ? "bg-gray-600 cursor-not-allowed" : "bg-gray-900 hover:bg-gray-800 active:scale-[0.98]"}`}
        >
          {loading ? (
            <>
              <svg className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
              <span>Uploading...</span>
            </>
          ) : (
            "Upload"
          )}
        </button>
      </form>
    </div>
  );
}
