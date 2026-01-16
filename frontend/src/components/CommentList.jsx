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
    if (loading || !text.trim()) return;

    try {
      setLoading(true);
      await api.request(endpoints.comments(videoId), {
        method: "POST",
        body: { content: text },
      });

      setText("");
      onAdded?.();
    } catch (err) {
      setError(err.message || "Failed to add comment");
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
          className="flex-1 px-3 py-2 border rounded"
        />
        <button
          disabled={loading}
          className="px-4 py-2 bg-gray-900 text-white rounded"
        >
          {loading ? "Posting…" : "Comment"}
        </button>
      </div>
      {error && <p className="text-red-700 text-sm">{error}</p>}
    </form>
  );
}

export default function CommentList({ videoId }) {
  const { api, user } = useAuth();

  const [comments, setComments] = useState([]);
  const [replies, setReplies] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");

  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [replyLoading, setReplyLoading] = useState(false);

  const fetchComments = async () => {
    try {
      const res = await api.request(endpoints.comments(videoId));
      setComments(res?.data?.comments || res?.data || []);
    } catch {}
  };

  const fetchReplies = async (commentId) => {
    try {
      const res = await api.request(endpoints.getCommentReplies(commentId));
      setReplies((prev) => ({
        ...prev,
        [commentId]: res?.data?.replies || [],
      }));
    } catch {}
  };

  useEffect(() => {
    if (videoId) fetchComments();
  }, [videoId]);

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

  const submitReply = async (commentId) => {
    if (!replyText.trim()) return;

    try {
      setReplyLoading(true);
      await api.request(endpoints.comments(videoId), {
        method: "POST",
        body: {
          content: replyText,
          parentCommentId: commentId,
        },
      });

      setReplyText("");
      setReplyingTo(null);
      fetchReplies(commentId);
    } catch (err) {
      console.error(err);
    } finally {
      setReplyLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <CommentForm videoId={videoId} onAdded={fetchComments} />

      <div className="space-y-4">
        {comments.map((c) => (
          <div key={c._id} className="p-4 border rounded bg-gray-50">
            {/* HEADER */}
            <div className="flex justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={c.owner?.avatar}
                  className="w-9 h-9 rounded-full border"
                />
                <span className="text-sm font-medium">{c.owner?.userName}</span>
              </div>

              <div className="flex gap-2">
                <CommentLikeButton commentId={c._id} />

                {user?._id === c.owner?._id && (
                  <>
                    <button
                      onClick={() =>
                        editingId === c._id
                          ? saveEdit(c._id)
                          : setEditingId(c._id)
                      }
                      className="text-xs border px-2 rounded"
                    >
                      {editingId === c._id ? "Save" : "Edit"}
                    </button>

                    <button
                      onClick={async () => {
                        await api.request(endpoints.commentById(c._id), {
                          method: "DELETE",
                        });
                        fetchComments();
                      }}
                      className="text-xs border px-2 rounded"
                    >
                      Delete
                    </button>
                  </>
                )}

                <button
                  onClick={() =>
                    setReplyingTo(replyingTo === c._id ? null : c._id)
                  }
                  className="text-xs border px-2 rounded"
                >
                  Reply
                </button>
              </div>
            </div>

            {/* CONTENT */}
            {editingId === c._id ? (
              <input
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                className="mt-2 w-full border px-2 py-1"
                autoFocus
              />
            ) : (
              <p className="mt-2 text-sm">{c.content}</p>
            )}

            {/* REPLY FORM */}
            {replyingTo === c._id && (
              <div className="mt-3 ml-8 flex gap-2">
                <input
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Write a reply..."
                  className="flex-1 border px-2 py-1"
                />
                <button
                  disabled={replyLoading}
                  onClick={() => submitReply(c._id)}
                  className="bg-gray-900 text-white px-3 rounded text-xs"
                >
                  {replyLoading ? "..." : "Reply"}
                </button>
              </div>
            )}

            {/* REPLIES */}
            <button
              onClick={() => fetchReplies(c._id)}
              className="text-xs text-blue-600 mt-2"
            >
              View Replies
            </button>

            {replies[c._id]?.map((r) => (
              <div
                key={r._id}
                className="ml-8 mt-2 p-2 border rounded bg-white"
              >
                <div className="text-xs font-medium">{r.owner?.userName}</div>
                <div className="text-sm">{r.content}</div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
