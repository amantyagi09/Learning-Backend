import mongoose, { isValidObjectId } from "mongoose";
import { Tweet } from "../models/tweet.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createTweet = asyncHandler(async (req, res) => {
  //TODO: create tweet
  const { content } = req.body;
  const user = req.user?._id;

  if (!content) {
    throw new ApiError(400, "tweet cannot be empty");
  }

  const newTweet = await Tweet.create({
    content,
    owner: user,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, newTweet, "Tweet created successfully"));
});

const getUserTweets = asyncHandler(async (req, res) => {
  // TODO: get user tweets
  const user = req.user?._id;
  if (!mongoose.Types.ObjectId.isValid(user)) {
    throw new ApiError(400, "Invalid user ID");
  }
  const AllTweets = await Tweet.aggregate([
    {
      $match: {
        owner: new mongoose.Types.ObjectId(user),
      },
    },
    {
      $sort: { createdAt: -1 },
    },
    {
      $project: {
        _id: 1,
        content: 1,
      },
    },
  ]);

  return res
    .status(200)
    .json(new ApiResponse(200, AllTweets, "All tweets fetched successfully"));
});

const updateTweet = asyncHandler(async (req, res) => {
  //TODO: update tweet
  const { tweetId } = req.params;

  const { content } = req.body;

  if (!content) {
    throw new ApiError(400, "tweet cannot be empty");
  }

  if (!tweetId) {
    throw new ApiError(400, "provide tweet id");
  }
  if (!mongoose.Types.ObjectId.isValid(tweetId)) {
    throw new ApiError(400, "Invalid tweet ID");
  }

  const tweet = await Tweet.findById(tweetId);
  if (!tweet) {
    throw new ApiError(404, "Tweet not found");
  }

  if (req.user?._id.toString() !== tweet.owner.toString()) {
    throw new ApiError(403, "You cannot update tweet");
  }

  const updatedTweet = await Tweet.findByIdAndUpdate(
    tweetId,
    {
      content,
    },
    {
      returnDocument: "after",
      runValidators: true,
    },
  );

  return res
    .status(200)
    .json(new ApiResponse(200, updatedTweet, "tweet updated successfully"));
});

const deleteTweet = asyncHandler(async (req, res) => {
  //TODO: delete tweet
  const { tweetId } = req.params;

  if (!tweetId) {
    throw new ApiError(400, "provide tweet id");
  }
  if (!mongoose.Types.ObjectId.isValid(tweetId)) {
    throw new ApiError(400, "Invalid tweet ID");
  }

  const tweet = await Tweet.findById(tweetId);
  if (!tweet) {
    throw new ApiError(404, "Tweet not found");
  }

  if (req.user?._id.toString() !== tweet.owner.toString()) {
    throw new ApiError(403, "You cannot delete tweet");
  }

  await Tweet.findByIdAndDelete(tweetId);

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Tweet deleted successfully"));
});

export { createTweet, getUserTweets, updateTweet, deleteTweet };
