import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/Cloudinary.js";

const getAllVideos = asyncHandler(async (req, res) => {
  let {
    page = 1,
    limit = 10,
    query,
    sortBy = "createdAt",
    sortType = "desc",
    userId,
  } = req.query;

  page = parseInt(page);
  limit = parseInt(limit);

  const skip = (page - 1) * limit;

  let filter = {};

  if (query) {
    filter.$or = [
      { title: { $regex: query, $options: "i" } },
      { description: { $regex: query, $options: "i" } },
    ];
  }

  if (userId) {
    filter.owner = userId;
  }

  const sortOptions = {};
  sortOptions[sortBy] = sortType === "asc" ? 1 : -1;

  const videos = await Video.find(filter)
    .sort(sortOptions)
    .skip(skip)
    .limit(limit);

  const totalVideos = await Video.countDocuments(filter);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        page,
        limit,
        totalVideos,
        totalPages: Math.ceil(totalVideos / limit),
        data: videos,
      },
      "Videos fetched successfully",
    ),
  );
});

const publishAVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body;
  // TODO: get video, upload to cloudinary, create video
  if (!(title && description)) {
    throw new ApiError(400, "PLease add both video title and description");
  }

  const localVideoFilePath = req.files?.videoFile[0]?.path;
  const localThumbnailFilePath = req.files?.thumbnail[0]?.path;

  console.log("uploaded file in local");

  console.log(localVideoFilePath);
  console.log(localThumbnailFilePath);

  const videoFile = await uploadOnCloudinary(localVideoFilePath);
  const thumbnail = await uploadOnCloudinary(localThumbnailFilePath);

  console.log(videoFile.duration);

  if (!videoFile) {
    throw new ApiError(400, "Please upload video file again");
  }

  if (!thumbnail) {
    throw new ApiError(400, "Please upload thumbnail again");
  }

  const video = await Video.create({
    title,
    description,
    videoFile: videoFile?.url || "",
    thumbnail: thumbnail?.url || "",
    duration: videoFile?.duration,
    owner: req.user._id,
  });

  console.log(video.owner);

  return res
    .status(200)
    .json(new ApiResponse(200, video, "Video uploaded successfully"));
});

const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: get video by id
  const video = await Video.findById(videoId?.trim());

  if (!video) {
    throw new ApiError(400, "Video does not exist");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, video, "Video fetched successfully"));
});

const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: update video details like title, description, thumbnail
  let thumbnailUrl;

  if (req.file?.path) {
    const uploaded = await uploadOnCloudinary(req.file.path);

    if (!uploaded) {
      throw new ApiError(400, "please reupload thumbnail");
    }

    thumbnailUrl = uploaded.url;
  }

  const { title, description } = req.body;

  const updateFields = {};

  if (title) updateFields.title = title;
  if (description) updateFields.description = description;
  if (thumbnailUrl) updateFields.thumbnail = thumbnailUrl;

  const video = await Video.findByIdAndUpdate(
    videoId,
    {
      $set: updateFields,
    },
    {
      returnDocument: "after",
      runValidators: true,
    },
  );

  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, video, "Updated successfully!!"));
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: delete video
  if (!videoId) {
    throw new ApiError(400, "Video does not exist");
  }

  await Video.findByIdAndDelete(videoId);

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Video deleted successfully"));
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!videoId) {
    throw new ApiError(400, "Invalid id");
  }

  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(404, "No such video exists");
  }

  const updatedVideo = await Video.findByIdAndUpdate(
    videoId,
    {
      $set: {
        isPublished: !video.isPublished,
      },
    },
    {
      returnDocument: "after",
      runValidators: true,
    },
  );

  return res
    .status(200)
    .json(new ApiResponse(200, updatedVideo, "Toggle updated successfully"));
});

export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
};
