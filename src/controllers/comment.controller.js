import mongoose from "mongoose";
import { Comment } from "../models/comment.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getVideoComments = asyncHandler(async (req, res) => {
  //TODO: get all comments for a video
  const { videoId } = req.params;
  const { page = 1, limit = 10 } = req.query;
});

const addComment = asyncHandler(async (req, res) => {
  // TODO: add a comment to a video
  const { videoId } = req.params;
  const { content } = req.body;
  const user = req.user?._id;

  if (!videoId?.trim()) {
    throw new ApiError(400, "invalid video id");
  }

  if (!content) {
    throw new ApiError(400, "Write something in comment");
  }

  const comment = await Comment.create({
    content,
    video: videoId,
    owner: user,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, comment, "commented successfully"));
});

const updateComment = asyncHandler(async (req, res) => {
  // TODO: update a comment
  const user = req.user?._id;
  const { commentId } = req.params;
  const { content } = req.body;

  const comment = await Comment.findById(commentId);
  console.log(comment);
  console.log(user);
  console.log(comment.owner);

  if (!comment) {
    throw new ApiError(400, "Comment does not exist");
  }

  if (user.toString() !== comment.owner.toString()) {
    throw new ApiError(400, "you cannot edit this comment");
  }

  if (!content) {
    throw new ApiError(400, "Write something in comment");
  }

  const updatedComment = await Comment.findByIdAndUpdate(
    commentId,
    {
      $set: {
        content: content,
      },
    },
    {
      returnDocument: "after",
      runValidators: true,
    },
  );

  return res.status(200).json(new ApiResponse(200, updatedComment, "success"));
});

const deleteComment = asyncHandler(async (req, res) => {
  // TODO: delete a comment
  const user = req.user?._id;
  const { commentId } = req.params;

  const comment = await Comment.findById(commentId);

  if (!comment) {
    throw new ApiError(400, "Comment does not exist");
  }

  if (user.toString() !== comment.owner.toString()) {
    throw new ApiError(400, "you cannot delete this comment");
  }

  await Comment.findByIdAndDelete(commentId);

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "comment deleted successfully"));
});

export { getVideoComments, addComment, updateComment, deleteComment };
