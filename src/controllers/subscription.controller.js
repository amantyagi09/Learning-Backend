import mongoose, { isValidObjectId } from "mongoose";
import { User } from "../models/user.model.js";
import { Subscription } from "../models/subscription.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleSubscription = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  const subscriber = req.user?._id;

  // TODO: toggle subscription
  if (!channelId) {
    throw new ApiError(400, "please provide channel ");
  }

  if (!isValidObjectId(channelId)) {
    throw new ApiError(400, "invalid channel Id");
  }

  const Channel = await User.findById(channelId);
  if (!Channel) {
    throw new ApiError(404, "channel does not exist");
  }

  if (channelId.toString() === subscriber.toString()) {
    throw new ApiError(400, "You cannot subscribe to your own channel");
  }

  const isSubscribed = await Subscription.aggregate([
    {
      $match: {
        channel: new mongoose.Types.ObjectId(channelId),
        subscriber: new mongoose.Types.ObjectId(subscriber),
      },
    },
  ]);
  console.log(isSubscribed);

  if (isSubscribed.length) {
    await Subscription.findByIdAndDelete(isSubscribed[0]._id);

    return res
      .status(200)
      .json(new ApiResponse(200, {}, "channel unsubscribed"));
  }

  const subscribe = await Subscription.create({
    subscriber,
    channel: channelId,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, subscribe, "channel subscribed"));
});

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
  const { channelId } = req.params;

  if (!channelId) {
    throw new ApiError(400, "please provide channel id");
  }

  if (!isValidObjectId(channelId)) {
    throw new ApiError(400, "invalid channel id");
  }
  const userChannel = await User.findById(channelId);
  if (!userChannel) {
    throw new ApiError(403, "channel does not exist");
  }

  const channelSubscribers = await Subscription.aggregate([
    {
      $match: {
        channel: new mongoose.Types.ObjectId(channelId),
      },
    },
    {
      $lookup: {
        from: "users",
        foreignField: "_id",
        localField: "subscriber",
        as: "SubscriberDetails",
      },
    },
    {
      $unwind: "$SubscriberDetails",
    },
    {
      $project: {
        _id: 0,
        username: "$SubscriberDetails.username",
        fullname: "$SubscriberDetails.fullname",
      },
    },
  ]);

  console.log(`Total subscribers: ${channelSubscribers.length}`);
  

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        channelSubscribers,
        "subscribers fetched successfully",
      ),
    );
});

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
  const { subscriberId } = req.params;
  if (!subscriberId) {
    throw new ApiError(400, "please provide user id");
  }

  if (!isValidObjectId(subscriberId)) {
    throw new ApiError(400, "invalid user id");
  }
  const subscriberDetails = await User.findById(subscriberId);
  if (!subscriberDetails) {
    throw new ApiError(403, "user does not exist");
  }

  const subscribedChannel = await Subscription.aggregate([
    {
      $match: {
        subscriber: new mongoose.Types.ObjectId(subscriberId),
      },
    },
    {
      $lookup: {
        from: "users",
        foreignField: "_id",
        localField: "channel",
        as: "subscribedChannelDetails",
      },
    },
    {
      $unwind: "$subscribedChannelDetails",
    },
    {
      $project: {
        _id: 0,
        username: "$subscribedChannelDetails.username",
        fullname: "$subscribedChannelDetails.fullname",
      },
    },
  ]);

  console.log(`Total subscribered channels: ${subscribedChannel.length}`);
  

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        subscribedChannel,
        "subscribered channels fetched successfully",
      ),
    );
});

export { toggleSubscription, getUserChannelSubscribers, getSubscribedChannels };
