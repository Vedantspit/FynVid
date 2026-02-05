import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { endpoints } from "../api/client";
import CommentLikeButton from "./CommentLikeButton";
import { Link } from "react-router-dom";

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
          className="flex-1 px-3 py-2 border rounded focus:outline-none focus:ring-1 focus:ring-gray-400"
        />
        <button
          disabled={loading}
          className="px-4 py-2 bg-gray-900 text-white rounded hover:bg-black disabled:bg-gray-400"
        >
          {loading ? "Posting…" : "Comment"}
        </button>
      </div>
      {error && <p className="text-red-700 text-sm">{error}</p>}
    </form>
  );
}

export default function CommentList({ videoId, vidOwner }) {
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
    } catch (err) {
      console.error("Fetch comments error:", err);
    }
  };

  const fetchReplies = async (commentId) => {
    try {
      const res = await api.request(endpoints.getCommentReplies(commentId));
      setReplies((prev) => ({
        ...prev,
        [commentId]: res?.data?.replies || [],
      }));
    } catch (err) {
      console.error("Fetch replies error:", err);
    }
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
    } catch (err) {}
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
      fetchReplies(commentId); // Refresh replies for this specific comment
    } catch (err) {
    } finally {
      setReplyLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <CommentForm videoId={videoId} onAdded={fetchComments} />

      <div className="space-y-4">
        {comments.map((c) => (
          <div key={c._id} className="p-4 border-b bg-white rounded-lg">
            <div className="flex gap-3 items-start">
              {/* Profile Link: Avatar */}
              <Link to={`/channel/${c.owner?.userName}`} className="shrink-0">
                <img
                  src={c.owner?.avatar}
                  className="w-10 h-10 rounded-full border hover:opacity-80 transition-opacity"
                  alt={`${c.owner?.userName}'s avatar`}
                />
              </Link>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  {/* Profile Link: Username */}
                  <Link
                    to={`/channel/${c.owner?.userName}`}
                    className="text-sm font-bold text-gray-900 hover:underline truncate"
                  >
                    @{c.owner?.userName}
                  </Link>

                  <div className="flex items-center gap-3">
                    <CommentLikeButton commentId={c._id} />

                    {user?._id === c.owner?._id && (
                      <button
                        onClick={() => {
                          if (editingId === c._id) saveEdit(c._id);
                          else {
                            setEditingId(c._id);
                            setEditText(c.content);
                          }
                        }}
                        className="text-xs text-gray-500 hover:text-blue-600 font-medium"
                      >
                        {editingId === c._id ? "Save" : "Edit"}
                      </button>
                    )}

                    {(user?._id === c.owner?._id ||
                      vidOwner?._id === user?._id) && (
                      <button
                        onClick={async () => {
                          if (window.confirm("Delete this comment?")) {
                            await api.request(endpoints.commentById(c._id), {
                              method: "DELETE",
                            });
                            fetchComments();
                          }
                        }}
                        className="text-xs text-gray-500 hover:text-red-600 font-medium"
                      >
                        Delete
                      </button>
                    )}

                    <button
                      onClick={() =>
                        setReplyingTo(replyingTo === c._id ? null : c._id)
                      }
                      className="text-xs text-gray-500 hover:text-black font-medium"
                    >
                      {replyingTo === c._id ? "Cancel" : "Reply"}
                    </button>
                  </div>
                </div>

                {/* Comment Content */}
                <div className="mt-1">
                  {editingId === c._id ? (
                    <input
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      className="w-full border-b border-blue-500 focus:outline-none py-1 text-sm bg-blue-50 px-2"
                      autoFocus
                    />
                  ) : (
                    <p className="text-sm text-gray-800 leading-relaxed break-words">
                      {c.content}
                    </p>
                  )}
                </div>

                {/* Reply Form */}
                {replyingTo === c._id && (
                  <div className="mt-3 flex gap-2 animate-in fade-in duration-200">
                    <input
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Write a reply..."
                      className="flex-1 border-b text-sm py-1 focus:outline-none focus:border-black"
                    />
                    <button
                      disabled={replyLoading || !replyText.trim()}
                      onClick={() => submitReply(c._id)}
                      className="bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-full text-xs font-semibold"
                    >
                      {replyLoading ? "..." : "Post Reply"}
                    </button>
                  </div>
                )}

                {/* Replies Section */}
                <div className="mt-2">
                  {c.repliesCount > 0 && (
                    <button
                      onClick={() => {
                        if (replies[c._id]) {
                          setReplies((prev) => {
                            const newState = { ...prev };
                            delete newState[c._id];
                            return newState;
                          });
                        } else {
                          fetchReplies(c._id);
                        }
                      }}
                      className="text-xs font-bold text-blue-600 hover:bg-blue-50 px-2 py-1 rounded transition-colors"
                    >
                      {replies[c._id]
                        ? "▼ Hide Replies"
                        : `▶ View ${c.repliesCount} Replies`}
                    </button>
                  )}

                  {replies[c._id] && replies[c._id].length > 0 && (
                    <div className="mt-3 ml-2 border-l-2 border-gray-100 pl-4 space-y-4">
                      {replies[c._id].map((r) => (
                        <div key={r._id} className="flex gap-2 items-start">
                          <Link
                            to={`/channel/${r.owner?.userName}`}
                            className="shrink-0"
                          >
                            <img
                              src={r.owner?.avatar}
                              className="w-7 h-7 rounded-full border"
                              alt="avatar"
                            />
                          </Link>
                          <div className="flex flex-col min-w-0">
                            <Link
                              to={`/channel/${r.owner?.userName}`}
                              className="text-xs font-bold hover:underline"
                            >
                              @{r.owner?.userName}
                            </Link>
                            <p className="text-sm text-gray-700 break-words">
                              {r.content}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
