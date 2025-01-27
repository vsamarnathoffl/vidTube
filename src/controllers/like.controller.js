import mongoose, { isValidObjectId } from "mongoose";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: toggle like on video
  const userId = req.user._id;

  const existingLike = await Like.findOne({ video: videoId, likedBy: userId });

  if (existingLike) {
    await Like.findOneAndDelete({ video: videoId, likedBy: userId });

    return res
      .status(200)
      .json(new ApiResponse(200, null, "Like is removed successfully"));
  } else {
    const createLike = await Like.create({
      video: videoId,
      likedBy: userId,
    });

    return res
      .status(201)
      .json(new ApiResponse(201, createLike, "Like added successfully"));
  }
});

const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  //TODO: toggle like on comment
  const userId = req.user._id;

  const existingLike = await Like.findOne({
    comment: commentId,
    likedBy: userId,
  });

  if (existingLike) {
    await Like.findOneAndDelete({
      comment: commentId,
      likedBy: userId,
    });
    return res
      .status(200)
      .json(
        new ApiResponse(200, null, "Like is removed Successfullt from comment")
      );
  } else {
    const createLike = await Like.create({
      comment: commentId,
      likedBy: userId,
    });

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          createLike,
          "Like is created successfully on comment"
        )
      );
  }
});

const toggleTweetLike = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  //TODO: toggle like on tweet
  const userId = req.user._id;

  const existingLike = await Like.findOne({
    tweet: tweetId,
    likedBy: userId,
  });

  if (existingLike) {
    await Like.findOneAndDelete({
      tweet: tweetId,
      likedBy: userId,
    });

    return res
      .status(200)
      .json(new ApiResponse(200, null, "Like removed from tweet successfully"));
  } else {
    const createLike = await Like.create({
      tweet: tweetId,
      likedBy: userId,
    });
    return res
      .status(200)
      .json(
        new ApiResponse(200, createLike, "Like is added on tweet successfully")
      );
  }
});

const getLikedVideos = asyncHandler(async (req, res) => {
  //TODO: get all liked videos
  const userId = req.user._id;
  try {
    const likedVideos = await Like.aggregate([
      {
        $match: {
          likedBy: userId,
        },
      },
      {
        $lookup: {
          from: "videos",
          localField: "video",
          foreignField: "id",
          as: "videos",
          pipeline: [
            {
              $project: {
                videoFile: 1,
                thumbnail: 1,
                owner: 1,
                title: 1,
                description: 1,
                duration: 1,
                views: 1,
                isPublished: 1,
              },
            },
          ],
        },
      },
    ]);
    if (!likedVideos.length) {
      return res
        .status(404)
        .json(new ApiResponse(404, null, "No liked videos found"));
    }

    return res
      .status(200)
      .json(
        new ApiResponse(200, likedVideos, "Liked videos fetched successfully")
      );
  } catch (error) {
    return res.status(500).json(new ApiError(500, error.message));
  }
});

export { toggleCommentLike, toggleTweetLike, toggleVideoLike, getLikedVideos };
