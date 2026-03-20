import mongoose, { isValidObjectId } from "mongoose";
import { Playlist } from "../models/playlist.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";

const createPlaylist = asyncHandler(async (req, res) => {
  const { name, description } = req.body;
  const user = req.user?._id;

  //TODO: create playlist
  if (!(name && description)) {
    throw new ApiError(400, "Name and Description, both are required");
  }

  const playList = await Playlist.create({
    name,
    description,
    owner: user,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, playList, "PLaylist created successfully"));
});

const getUserPlaylists = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  //TODO: get user playlists
  if (!userId) {
    throw new ApiError(400, "please provide user id");
  }
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(400, "User does not exist");
  }

  if (!isValidObjectId(userId)) {
    throw new ApiError(400, "invalid user Id");
  }

  const userPlaylist = await Playlist.aggregate([
    {
      $match: {
        owner: new mongoose.Types.ObjectId(userId),
      },
    },
  ]);

  if (!userPlaylist.length) {
    return res.status(200).json("No playlist available");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, userPlaylist, "Playlist fetched successfully"));
});

const getPlaylistById = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  //TODO: get playlist by id
  if (!playlistId) {
    throw new ApiError(400, "please provide playlist id");
  }

  if (!isValidObjectId(playlistId)) {
    throw new ApiError(400, "invalid playlist id");
  }

  const playlistData = await Playlist.findById(playlistId);
  if (!playlistData) {
    throw new ApiError(404, "No playlist available");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, playlistData, "PlayList fetched successfully"));
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;
  if (!playlistId || !videoId) {
    throw new ApiError(400, "Please provide both playlist and video Id");
  }

  if (!isValidObjectId(playlistId)) {
    throw new ApiError(400, "invalid playlist Id");
  }
  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "invalid video Id");
  }
  const playlist = await Playlist.findById(playlistId);
  if (playlist.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You cannot modify this playlist");
  }

  const updatedPlaylist = await Playlist.findByIdAndUpdate(
    playlistId,
    {
      $addToSet: { videos: videoId },
    },
    {
      returnDocument: "after",
      runValidators: true,
    },
  );

  if (!updatedPlaylist) {
    throw new ApiError(500, "Error in adding video to playlist");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        updatedPlaylist,
        "video added to playlist successfully",
      ),
    );
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;
  // TODO: remove video from playlist
  if (!playlistId || !videoId) {
    throw new ApiError(400, "Please provide both playlist and video Id");
  }

  if (!isValidObjectId(playlistId)) {
    throw new ApiError(400, "invalid playlist Id");
  }
  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "invalid video Id");
  }
  const playlist = await Playlist.findById(playlistId);
  if (playlist.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You cannot modify this playlist");
  }

  const updatedPlaylist = await Playlist.findByIdAndUpdate(
    playlistId,
    {
      $pull: { videos: videoId },
    },
    {
      returnDocument: "after",
      runValidators: true,
    },
  );

  if (!updatedPlaylist) {
    throw new ApiError(500, "Error in removing video from playlist");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        updatedPlaylist,
        "video removed from playlist successfully",
      ),
    );
});

const deletePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  // TODO: delete playlist
  if (!playlistId) {
    throw new ApiError(400, "please provide playlist id");
  }

  if (!isValidObjectId(playlistId)) {
    throw new ApiError(400, "invalid playlist id");
  }

  const playlist = await Playlist.findById(playlistId);
  if (!playlist) {
    throw new ApiError(404, "Playlist doesnot exist");
  }

  if (playlist.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You cannot delete this Playlist");
  }

  await Playlist.findByIdAndDelete(playlistId);

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "playlist deleted successfully"));
});

const updatePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  const { name, description } = req.body;
  //TODO: update playlist
  if (!playlistId) {
    throw new ApiError(400, "please provide playlist id");
  }

  if (!name || !description) {
    throw new ApiError(
      400,
      "please provide both name and description for the playlist",
    );
  }

  if (!isValidObjectId(playlistId)) {
    throw new ApiError(400, "invalid playlist id");
  }

  const playlist = await Playlist.findById(playlistId);
  if (!playlist) {
    throw new ApiError(404, "Playlist doesnot exist");
  }

  if (playlist.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You cannot update this Playlist");
  }

  const updatedPlaylist = await Playlist.findByIdAndUpdate(
    playlistId,
    {
        name,
        description,
    },
    {
      returnDocument: "after",
      runValidators: true,
    },
  );

  if (!updatedPlaylist) {
    throw new ApiError(
      500,
      "error while updating name and description of the playlist",
    );
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, updatedPlaylist, "playlist updated successfullly"),
    );
});

export {
  createPlaylist,
  getUserPlaylists,
  getPlaylistById,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  deletePlaylist,
  updatePlaylist,
};
