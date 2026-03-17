import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/Cloudinary.js";
// import {uploadOnCloudinary} from "../utils/cloudinary.js";

const getAllVideos = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;
  //TODO: get all videos based on query, sort, pagination
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
    owner: req.user._id
  });

  console.log(video.owner);

  return res
    .status(200)
    .json(new ApiResponse(200, video, "Video uploaded successfully"));
});

const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: get video by id
  console.log(videoId);
  
//   const video = await Video.findById(videoId)

//   if(!video) {
//     throw new ApiError(400, "Video doesn't exist")
//   }


});

const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: update video details like title, description, thumbnail
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: delete video
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
});

export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
};
