import mongoose, { isValidObjectId } from "mongoose";
import { Playlist } from "../models/playlist.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createPlaylist = asyncHandler(async (req, res) => {
  const { name, description } = req.body;
  const userId = req.user._id;

  //TODO: create playlist
  try {
    const createPlaylist = await Playlist.create({
      name,
      description,
      owner: userId,
    });

    return res
      .status(200)
      .json(
        new ApiResponse(200, createPlaylist, "Playlist is created successfully")
      );
  } catch (error) {
    return res
      .status(404)
      .json(new ApiError(500, "Something went wrong while creating playlist"));
  }
});

const getUserPlaylists = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  //TODO: get user playlists
  try {
    const existingPlaylist = await Playlist.aggregate([
      {
        $match: {
          owner: userId,
        },
      },
      {
        $lookup: {
          from: "videos",
          localField: "videos",
          foreignField: "_id",
          as: "videosList",
        },
      },
    ]);

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          existingPlaylist,
          "Existing Playlist is fetched successfully"
        )
      );
  } catch (error) {
    throw new ApiError(500, "Error while fetching playlist");
  }
});

const getPlaylistById = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  //TODO: get playlist by id
  const playlist = await Playlist.findById(playlistId);

  if (!playlist) {
    throw new ApiError(404, "Playlist not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, playlist, "Playlist fetched successfully"));
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;

  const addVideoToPlaylist = await Playlist.findByIdAndUpdate(
    playlistId,
    {
      $push: {
        videos: videoId,
      },
    },
    { new: true }
  );

  if (!addVideoToPlaylist) {
    throw new ApiError(404, "Error while adding video to playlist");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        addVideoToPlaylist,
        "Video is added successfully in playlist"
      )
    );
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;
  // TODO: remove video from playlist
  const deleteVideoFromPlaylist = await Playlist.findOneAndUpdate(
    { _id: playlistId },
    { $pull: { videos: videoId } },
    { new: true }
  );
  if (!deleteVideoFromPlaylist) {
    throw new ApiError(
      404,
      "Video not found in playlist or playlist doesn't exist"
    );
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        deleteVideoFromPlaylist,
        "Video removed from playlist successfully"
      )
    );
});

const deletePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  // TODO: delete playlist
  const playlistToDelete = await Playlist.findByIdAndDelete(playlistId);

  if (!playlistToDelete) {
    throw new ApiError(404, "Playlist is not found");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, playlistToDelete, "Playlist is deleted successfully")
    );
});

const updatePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  const { name, description } = req.body;
  //TODO: update playlist
  const playlistToUpdate = await Playlist.findByIdAndUpdate(
    playlistId,
    {
      $set: {
        name,
        description,
      },
    },
    { new: true }
  );

  if (!playlistToUpdate) {
    throw new ApiError(404, "PlayList is not found");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, playlistToUpdate, "Playlist is updated successfully")
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
