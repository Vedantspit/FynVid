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

export default function CommentList({ videoId, vidOwner }) {
  console.log("Got vidId - ", videoId, "Vid owner - ", vidOwner);

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
      console.log("Top Level Comments for this video -> ", res.data.comments);
      setComments(res?.data?.comments || res?.data || []);
    } catch {}
  };

  const fetchReplies = async (commentId) => {
    try {
      const res = await api.request(endpoints.getCommentReplies(commentId));
      console.log("YOO ", res?.data?.replies);

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
          <div key={c._id} className="p-4 border-b bg-white">
            {" "}
            <div className="flex gap-3 items-start">
              <img
                src={c.owner?.avatar}
                className="w-10 h-10 rounded-full border shrink-0"
                alt="avatar"
              />

              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-gray-900">
                    @{c.owner?.userName}
                  </span>

                  <div className="flex gap-2">
                    <CommentLikeButton commentId={c._id} />
                    {user?._id === c.owner?._id && (
                      <>
                        <button
                          onClick={() => {
                            if (editingId === c._id) saveEdit(c._id);
                            else {
                              setEditingId(c._id);
                              setEditText(c.content); // Pre-fill edit text
                            }
                          }}
                          className="text-xs text-gray-500 hover:text-black"
                        >
                          {editingId === c._id ? "Save" : "Edit"}
                        </button>
                      </>
                    )}
                    {(user?._id === c.owner?._id ||
                      vidOwner?._id === user?._id) && (
                      <>
                        <button
                          onClick={async () => {
                            if (
                              window.confirm(
                                "Are you sure you want to delete this comment ?",
                              )
                            ) {
                              await api.request(endpoints.commentById(c._id), {
                                method: "DELETE",
                              });
                              fetchComments();
                            }
                          }}
                          className="text-xs text-gray-500 hover:text-red-600"
                        >
                          Delete
                        </button>
                      </>
                    )}
                    <button
                      onClick={() =>
                        setReplyingTo(replyingTo === c._id ? null : c._id)
                      }
                      className="text-xs text-gray-500 hover:text-black"
                    >
                      Reply
                    </button>
                  </div>
                </div>

                {/* COMMENT CONTENT */}
                <div className="mt-1">
                  {editingId === c._id ? (
                    <input
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      className="w-full border-b border-gray-900 focus:outline-none py-1 text-sm"
                      autoFocus
                    />
                  ) : (
                    <p className="text-sm text-gray-800 leading-relaxed">
                      {c.content}
                    </p>
                  )}
                </div>

                {/* REPLY FORM */}
                {replyingTo === c._id && (
                  <div className="mt-3 flex gap-2">
                    <input
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Add a reply..."
                      className="flex-1 border-b text-sm py-1 focus:outline-none focus:border-black"
                    />
                    <button
                      disabled={replyLoading}
                      onClick={() => submitReply(c._id)}
                      className="bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-full text-xs font-medium"
                    >
                      {replyLoading ? "..." : "Reply"}
                    </button>
                  </div>
                )}
                {/* REPLIES SECTION */}
                <div className="mt-2">
                  {c.repliesCount > 0 && (
                    <button
                      onClick={() => {
                        if (replies[c._id]) {
                          // Toggle off: clear replies for this comment
                          setReplies((prev) => {
                            const newState = { ...prev };
                            delete newState[c._id];
                            return newState;
                          });
                        } else {
                          fetchReplies(c._id);
                        }
                      }}
                      className="text-xs font-bold text-blue-600 hover:bg-blue-50 px-2 py-1 rounded"
                    >
                      {replies[c._id]
                        ? "▼ Hide Replies"
                        : `▶ View ${c.repliesCount} Replies`}
                    </button>
                  )}

                  {/* Only show this container if we actually have replies in state */}
                  {replies[c._id] && replies[c._id].length > 0 && (
                    <div className="mt-4 ml-2 border-l-2 pl-4">
                      {replies[c._id].map((r) => (
                        <div
                          key={r._id}
                          className="flex gap-3 items-start mb-3"
                        >
                          <img
                            src={r.owner?.avatar}
                            className="w-7 h-7 rounded-full border shrink-0"
                            alt="avatar"
                          />
                          <div className="flex flex-col">
                            <span className="text-xs font-bold">
                              @{r.owner?.userName}
                            </span>
                            <p className="text-sm text-gray-700">{r.content}</p>
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
