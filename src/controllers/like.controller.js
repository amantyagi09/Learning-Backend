import mongoose, { isValidObjectId } from "mongoose";
import { Like } from "../models/like.model.js";
import { Comment } from "../models/comment.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Video } from "../models/video.model.js";
import { Tweet } from "../models/tweet.model.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: toggle like on video
  if (!videoId) {
    throw new ApiError(400, "video does not exist");
  }
  if (!mongoose.Types.ObjectId.isValid(videoId)) {
    throw new ApiError(400, "Invalid video ID");
  }

  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(404, "video not found");
  }
  const user = req.user?._id;

  const like = await Like.aggregate([
    {
      $match: {
        likedBy: new mongoose.Types.ObjectId(req.user._id),
        video: new mongoose.Types.ObjectId(videoId),
      },
    },
  ]);

  if (like.length) {
    await Like.findByIdAndDelete(like[0]._id.toString());

    return res
      .status(200)
      .json(new ApiResponse(200, {}, "liked removed successfully"));
  }

  const VideoLike = await Like.create({
    video: videoId,
    likedBy: user,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, VideoLike, "Video liked successfully"));
});

const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  //TODO: toggle like on comment
  if (!commentId) {
    throw new ApiError(400, "Comment does not exist");
  }

  if (!mongoose.Types.ObjectId.isValid(commentId)) {
    throw new ApiError(400, "Invalid comment ID");
  }

  const comment = await Comment.findById(commentId);
  if (!comment) {
    throw new ApiError(404, "Comment not found");
  }
  const user = req.user?._id;

  const like = await Like.aggregate([
    {
      $match: {
        likedBy: new mongoose.Types.ObjectId(req.user._id),
        comment: new mongoose.Types.ObjectId(commentId),
      },
    },
  ]);

  if (like.length) {
    await Like.findByIdAndDelete(like[0]._id.toString());

    return res
      .status(200)
      .json(new ApiResponse(200, {}, "liked removed successfully"));
  }

  const CommentLike = await Like.create({
    comment: commentId,
    likedBy: user,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, CommentLike, "Comment liked successfully"));
});

const toggleTweetLike = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  //TODO: toggle like on tweet
  if (!tweetId) {
    throw new ApiError(400, "Tweet does not exist");
  }

  if (!mongoose.Types.ObjectId.isValid(tweetId)) {
    throw new ApiError(400, "Invalid tweet ID");
  }

  const tweet = await Tweet.findById(tweetId);
  if (!tweet) {
    throw new ApiError(404, "Tweet not found");
  }
  const user = req.user?._id;

  const like = await Like.aggregate([
    {
      $match: {
        likedBy: new mongoose.Types.ObjectId(req.user._id),
        tweet: new mongoose.Types.ObjectId(tweetId),
      },
    },
  ]);

  if (like.length) {
    await Like.findByIdAndDelete(like[0]._id.toString());

    return res
      .status(200)
      .json(new ApiResponse(200, {}, "liked removed successfully"));
  }

  const CommentLike = await Like.create({
    tweet: tweetId,
    likedBy: user,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, CommentLike, "Tweet liked successfully"));
});

const getLikedVideos = asyncHandler(async (req, res) => {
  //TODO: get all liked videos
  const user = req.user?._id;

  const likedVideos = await Like.aggregate([
    {
      $match: {
        likedBy: new mongoose.Types.ObjectId(user),
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "video",
        foreignField: "_id",
        as: "videoDetails",
      },
    },
    {
      $unwind: "$videoDetails",
    },
    {
      $project: {
        _id: 0,
        video: "$videoDetails",
      },
    },
  ]);

  return res
    .status(200)
    .json(
      new ApiResponse(200, likedVideos, "Liked videos fetched successfully"),
    );
});

export { toggleCommentLike, toggleTweetLike, toggleVideoLike, getLikedVideos };
