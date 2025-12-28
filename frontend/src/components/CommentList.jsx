import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { endpoints } from "../api/client";
import CommentLikeButton from "./CommentLikeButton";

export function CommentForm({ videoId, onAdded }) {
  const { api } = useAuth();
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (loading) return;
    if (!text.trim()) return;

    setError("");

    try {
      setLoading(true);
      await api.request(endpoints.comments(videoId), {
        method: "POST",
        body: { content: text },
      });

      setText("");
      onAdded?.();
    } catch (err) {
      console.error("Error adding comment:", err);

      if (err.message?.toLowerCase().includes("too many")) {
        setError("You are commenting too quickly. Please slow down!");
      } else {
        setError(err.message || "Failed to add comment. Try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-2">
      <div className="flex gap-2">
        <input
          disabled={loading}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Add a comment"
          className="flex-1 px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-gray-300"
        />

        <button
          disabled={loading}
          className="px-4 py-2 rounded bg-gray-900 text-white cursor-pointer hover:bg-gray-800"
        >
          {loading ? (
            <>
              <svg className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
              <span>Posting…</span>
            </>
          ) : (
            <>Comment</>
          )}
        </button>
      </div>

      {error && <p className="text-red-800 text-sm mt-1 font-bold">{error}</p>}
    </form>
  );
}

export default function CommentList({ videoId }) {
  const { api, user } = useAuth();
  const [comments, setComments] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");

  const fetchComments = async () => {
    try {
      const res = await api.request(endpoints.comments(videoId));
      const items = Array.isArray(res?.data)
        ? res.data
        : Array.isArray(res?.data?.comments)
        ? res.data.comments
        : [];
      setComments(items);
    } catch {}
  };

  useEffect(() => {
    if (videoId) fetchComments();
  }, [videoId]);

  const handleEdit = (comment) => {
    setEditingId(comment._id);
    setEditText(comment.content);
  };

  const saveEdit = async (commentId) => {
    if (!editText.trim()) return;
    try {
      await api.request(endpoints.commentById(commentId), {
        method: "PATCH",
        body: { content: editText },
      });
      setEditingId(null);
      setEditText("");
      fetchComments();
    } catch {}
  };

  return (
    <div className="space-y-6">
      {/* Comment input */}
      <CommentForm videoId={videoId} onAdded={fetchComments} />

      {/* Comment list */}
      <div className="space-y-4">
        {(Array.isArray(comments) ? comments : []).map((c) => (
          <div
            key={c._id}
            className="p-4 border rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
          >
            {/* Header: avatar + username + buttons */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={c.owner?.avatar}
                  alt={c?.owner?.userName || "avatar"}
                  className="w-9 h-9 rounded-full object-cover border border-gray-300"
                />
                <span className="text-sm font-medium text-gray-800">
                  {c?.owner?.userName || c?.ownerName}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <CommentLikeButton commentId={c._id} />
                {user?._id &&
                String(user._id) === String(c?.owner?._id || c?.owner) ? (
                  <>
                    <button
                      onClick={() =>
                        editingId === c._id ? saveEdit(c._id) : handleEdit(c)
                      }
                      className="px-2 py-1 rounded border text-xs cursor-pointer hover:bg-gray-200"
                      title={editingId === c._id ? "Save" : "Edit"}
                    >
                      {editingId === c._id ? "💾 Save" : "✏️ Edit"}
                    </button>

                    <button
                      onClick={async () => {
                        try {
                          await api.request(endpoints.commentById(c._id), {
                            method: "DELETE",
                          });
                          fetchComments();
                        } catch {}
                      }}
                      className="px-2 py-1 rounded border text-xs cursor-pointer hover:bg-gray-200"
                      title="Delete"
                    >
                      🗑 Delete
                    </button>
                  </>
                ) : null}
              </div>
            </div>

            {/* Comment content or edit box */}
            {editingId === c._id ? (
              <div className="mt-3 flex gap-2">
                <input
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  className="flex-1 px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-gray-300"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setEditingId(null)}
                  className="px-3 py-2 border rounded text-xs cursor-pointer hover:bg-gray-200"
                >
                  ❌ Cancel
                </button>
              </div>
            ) : (
              <div className="mt-3 text-gray-700 text-sm leading-relaxed">
                {c.content}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
