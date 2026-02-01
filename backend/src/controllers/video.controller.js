import mongoose from "mongoose";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { getPrivateVideoUrl, uploadToS3 } from "../utils/s3.js";
const isValidObjectId = (id) => mongoose.isValidObjectId(id);
const getAllVideos = asyncHandler(async (req, res) => {
  const {
    cursor,
    limit = 5,
    query = "",
    sortBy = "createdAt",
    sortType = "desc",
    userId,
  } = req.query;
  const limitNum = Math.max(1, +limit);
  const filter = { isPublished: true };
  if (cursor) {
    const operator = sortType == "desc" ? "$lt" : "$gt";
    filter.createdAt = { [operator]: new Date(cursor) };
  }
  if (query) {
    const q = query.trim();
    filter.$or = [
      { title: { $regex: q, $options: "i" } },
      { description: { $regex: q, $options: "i" } },
    ];
  }
  if (userId && isValidObjectId(userId)) filter.owner = userId;
  const [total, videos] = await Promise.all([
    Video.countDocuments(filter),
    Video.find(filter)
      .sort({ [sortBy]: sortType === "asc" ? 1 : -1 })
      .limit(limitNum)
      .populate({
        path: "owner",
        select: "fullName userName avatar createdAt",
      }),
  ]);

  const nextCursor =
    videos.length > 0 ? videos[videos.length - 1].createdAt : null;
  const hasNextPage = videos.length === limitNum;
  return res.status(200).json(
    new ApiResponse(
      200,
      {
        videos,
        nextCursor,
        hasNextPage,
      },
      "Videos fetched",
    ),
  );
});

const publishAVideo = asyncHandler(async (req, res) => {
  const { title, description, duration } = req.body;
  if (!title || !description)
    throw new ApiError(400, "Title and description are required");
  if (!req.files?.videoFile?.[0])
    throw new ApiError(400, "Video file is required");
  if (!req.files?.thumbnail?.[0])
    throw new ApiError(400, "Thumbnail is required");

  const videoLocal = req.files.videoFile[0].path;
  const thumbLocal = req.files.thumbnail[0].path;

  // upload video and thumbnail (resource_type 'video' will be handled by upload util with resource_type: 'auto')
  const uploadedVideo = await uploadToS3(videoLocal, "videos");
  const uploadedThumb = await uploadToS3(thumbLocal, "thumbnails");
  console.log("Got video response from s3 after upload ", uploadedVideo);
  console.log("Got thumbnail response from s3 after upload ", uploadedThumb);

  if (!uploadedVideo?.url || !uploadedThumb?.url) {
    throw new ApiError(500, "Error uploading files");
  }

  const video = await Video.create({
    videoFile: uploadedVideo.key,
    thumbnail: uploadedThumb.url,
    title,
    description,
    duration: duration ? +duration : 0,
    owner: req.user._id,
    isPublished: true,
  });

  const created = await Video.findById(video._id)
    .select("-__v")
    .populate({ path: "owner", select: "fullName userName avatar" });

  return res
    .status(201)
    .json(new ApiResponse(201, created, "Video published successfully"));
});

const getVideoById = asyncHandler(async (req, res) => {
  console.log("you clicked a video");

  const { videoId } = req.params;
  if (!isValidObjectId(videoId)) throw new ApiError(400, "Invalid video id");

  const video = await Video.findById(videoId).populate({
    path: "owner",
    select: "fullName userName avatar",
  });
  if (!video) throw new ApiError(404, "Video not found");

  const signedVideoUrl = await getPrivateVideoUrl(video.videoFile);
  console.log("Signed video url ", signedVideoUrl);

  const videoData = video.toObject();
  videoData.videoFile = signedVideoUrl;
  // increment views (simple approach)
  video.views = (video.views || 0) + 1;
  await video.save();

  // record watch history for the authenticated user - move to end if exists, add if new
  if (req.user?._id) {
    try {
      const user = await User.findById(req.user._id);
      if (user) {
        // Remove if exists
        user.watchHistory = user.watchHistory.filter(
          (id) => String(id) !== String(video._id),
        );
        // Add to end (most recent)
        user.watchHistory.push(video._id);
        await user.save();
      }
    } catch (err) {
      console.error("Error updating watch history:", err);
    }
  }

  return res
    .status(200)
    .json(new ApiResponse(200, videoData, "Video fetched successfully"));
});

// const updateVideo = asyncHandler(async (req, res) => {
//   const { videoId } = req.params;
//   if (!isValidObjectId(videoId)) throw new ApiError(400, "Invalid video id");

//   const video = await Video.findById(videoId);
//   if (!video) throw new ApiError(404, "Video not found");
//   if (String(video.owner) !== String(req.user._id))
//     throw new ApiError(403, "Not authorized to update this video");

//   const updates = {};
//   const { title, description, duration } = req.body;
//   if (title) updates.title = title;
//   if (description) updates.description = description;
//   if (duration) updates.duration = +duration;

//   // optional thumbnail update
//   if (req.file?.path) {
//     const uploadedThumb = await uploadOnCloudinary(req.file.path);
//     if (!uploadedThumb?.url)
//       throw new ApiError(500, "Error uploading thumbnail");
//     updates.thumbnail = uploadedThumb.url;
//   }

//   const updated = await Video.findByIdAndUpdate(
//     videoId,
//     { $set: updates },
//     { new: true },
//   ).populate({ path: "owner", select: "fullName userName avatar" });

//   return res
//     .status(200)
//     .json(new ApiResponse(200, updated, "Video updated successfully"));
// });

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!isValidObjectId(videoId)) throw new ApiError(400, "Invalid video id");

  const video = await Video.findById(videoId);
  if (!video) throw new ApiError(404, "Video not found");
  if (String(video.owner) !== String(req.user._id))
    throw new ApiError(403, "Not authorized to delete this video");

  await Video.findByIdAndDelete(videoId);
  // optional: delete remote assets (Cloudinary) later

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Video deleted successfully"));
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!isValidObjectId(videoId)) throw new ApiError(400, "Invalid video id");

  const video = await Video.findById(videoId);
  if (!video) throw new ApiError(404, "Video not found");
  if (String(video.owner) !== String(req.user._id))
    throw new ApiError(403, "Not authorized");

  video.isPublished = !video.isPublished;
  await video.save();

  return res
    .status(200)
    .json(new ApiResponse(200, video, "Publish status toggled"));
});

export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  // updateVideo,
  deleteVideo,
  togglePublishStatus,
};
