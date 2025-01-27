import mongoose from "mongoose";
import { Video } from "../models/video.model.js";
import { Subscription } from "../models/subscription.model.js";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getChannelStats = asyncHandler(async (req, res) => {
  // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.
  const userId = req.user._id;
  const views = await Video.aggregate([
    {
      $match: {
        owner: mongoose.Types.ObjectId(userId),
      },
    },
    {
      $group: {
        _id: null,
        totalViews: {
          $sum: "$views",
        },
      },
    },
  ]).exec();

  const totalViews = views[0]?.totalViews || 0;

  const subscribers = await Subscription.aggregate([
    {
      $match: {
        channel: mongoose.Types.ObjectId(userId),
      },
    },
    {
      $group: {
        _id: null,
        totalSubscribers: {
          $sum: 1,
        },
      },
    },
  ]).exec();

  const totalSubscribers = subscribers[0]?.totalSubscribers || 0;

  const videos = await Video.aggregate([
    {
      $match: {
        owner: mongoose.Types.ObjectId(userId),
      },
    },
    {
      $group: {
        _id: null,
        totalVideos: {
          $sum: 1,
        },
      },
    },
  ]).exec();

  const totalVideos = videos[0]?.totalVideos || 0;

  const likes = await Like.aggregate([
    {
      $lookup: {
        from: "videos",
        localField: "video",
        foreignField: "_id",
        as: "videos",
        pipeline: [
          {
            $project: {
              title: 1,
              owner: 1,
            },
          },
        ],
      },
    },
    {
        $unwind:"$videos"
    },
    {
      $match: {
        "videos.owner": mongoose.Types.ObjectId(userId),
      },
    },
    {
      $group: {
        _id: null,
        totalLikes: {
          $sum: 1,
        },
      },
    },
  ]).exec();

  const totalLikes = likes[0]?.totalLikes || 0;

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { totalViews, totalSubscribers, totalVideos, totalLikes },
        "Channel stats retrieved successfully"
      )
    );
});

const getChannelVideos = asyncHandler(async (req, res) => {
  // TODO: Get all the videos uploaded by the channel
  const userId = req.user._id;

  const videosList = await Video.aggregate([
    {
        $match:{
            owner: mongoose.Types.ObjectId(userId)
        }
    },
  ]).exec();

  return res
  .status(200)
  .json(new ApiResponse(
    200,
    videosList,
    "Videos from channel are fetched successfully"
  )) 
});

export { getChannelStats, getChannelVideos };
