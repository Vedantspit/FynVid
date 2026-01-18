import mongoose, { Mongoose } from "mongoose";
import { Comment } from "../models/comment.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { videoCommentAddEvent } from "../kafka/producers/videoEventsProducer.js";

const isValidObjectId = (id) => mongoose.isValidObjectId(id);

const getVideoComments = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!isValidObjectId(videoId)) throw new ApiError(400, "Invalid video id");

  const comments = await Comment.aggregate([
    {
      $match: {
        video: mongoose.Types.ObjectId.createFromHexString(videoId),
        parentCommentId: null,
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "owner",
      },
    },
    {
      $unwind: "$owner",
    },
    {
      $lookup: {
        from: "comments",
        localField: "_id",
        foreignField: "parentCommentId",
        as: "replies",
      },
    },
    {
      $addFields: {
        repliesCount: { $size: "$replies" },
      },
    },
    {
      $project: {
        replies: 0,
        "owner.password": 0,
        "owner.email": 0,
        "owner.coverImage": 0,
        "owner.watchHistory": 0,
        "owner.refreshToken": 0,
      },
    },
    {
      $sort: { createdAt: -1 },
    },
  ]);
  // const { page = 1, limit = 30 } = req.query;
  // const skip = (Math.max(1, +page) - 1) * Math.max(1, +limit);
  // const [total, comments] = await Promise.all([
  //   Comment.countDocuments({ video: videoId, parentCommentId: null }),
  //   Comment.find({ video: videoId, parentCommentId: null })
  //     .sort({ createdAt: -1 })
  //     .skip(skip)
  //     .limit(Math.max(1, +limit))
  //     .populate({ path: "owner", select: "fullName userName avatar" }),
  // ]);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { comments },
        "Top-level Comments with reply count fetched",
      ),
    );
});

const getCommentReplies = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  if (!isValidObjectId(commentId)) {
    throw new ApiError(400, "CommentId invalid ");
  }
  const replies = await Comment.find({
    parentCommentId: commentId,
  })
    .sort({ createdAt: 1 })
    .populate({ path: "owner", select: "fullName userName avatar" });

  return res
    .status(200)
    .json(new ApiResponse(200, { replies }, "Replies fetched successfully"));
});

const addComment = asyncHandler(async (req, res) => {
  //KAFKA added for comment added to a video, only notification goes to consumer.
  const { videoId } = req.params;
  const { content, parentCommentId } = req.body;
  if (!isValidObjectId(videoId)) throw new ApiError(400, "Invalid video id");
  if (!content || !content.trim())
    throw new ApiError(400, "Content is required");

  if (parentCommentId && !isValidObjectId(parentCommentId)) {
    throw new ApiError(400, "Invalid parent comment id");
  }

  const comment = await Comment.create({
    content: content.trim(),
    video: videoId,
    owner: req.user._id,
    parentCommentId: parentCommentId || null,
  });
  const populated = await Comment.findById(comment._id).populate({
    path: "owner",
    select: "fullName userName avatar",
  });
  await videoCommentAddEvent(videoId, req.user._id, comment._id, content);
  return res.status(201).json(new ApiResponse(201, populated, "Comment added"));
});

const updateComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const { content } = req.body;
  if (!isValidObjectId(commentId))
    throw new ApiError(400, "Invalid comment id");
  if (!content || !content.trim())
    throw new ApiError(400, "Content is required");

  const comment = await Comment.findById(commentId);
  if (!comment) throw new ApiError(404, "Comment not found");
  if (String(comment.owner) !== String(req.user._id))
    throw new ApiError(403, "Not authorized");

  comment.content = content.trim();
  await comment.save();
  const populated = await Comment.findById(comment._id).populate({
    path: "owner",
    select: "fullName userName avatar",
  });
  return res
    .status(200)
    .json(new ApiResponse(200, populated, "Comment updated"));
});

const deleteComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  if (!isValidObjectId(commentId))
    throw new ApiError(400, "Invalid comment id");

  const comment = await Comment.findById(commentId);
  if (!comment) throw new ApiError(404, "Comment not found");
  if (String(comment.owner) !== String(req.user._id))
    throw new ApiError(403, "Not authorized");

  await comment.deleteOne();
  return res.status(200).json(new ApiResponse(200, {}, "Comment deleted"));
});

export {
  getVideoComments,
  addComment,
  updateComment,
  deleteComment,
  getCommentReplies,
};
