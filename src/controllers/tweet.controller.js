import mongoose, { isValidObjectId } from "mongoose";
import { Tweet } from "../models/tweet.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createTweet =  asyncHandler(async (req, res) => {
  //TODO: create tweet
  const userId = req.user._id;
  const { content } = req.body;

  const tweetToCreate = await Tweet.create({
    owner: userId,
    content,
  });

  if (!tweetToCreate) {
    return res
      .status(500)
      .json(new ApiError(500, "Error while creating tweet"));
  }

  return res
    .status(200)
    .json(new ApiResponse(200, tweetToCreate, "Successfully tweet is created"));
});

const getUserTweets = asyncHandler(async (req, res) => {
  // TODO: get user tweets
  const { userId } = req.params;

  const tweetsList = await Tweet.aggregate([
    {
      $match: {
        owner: userId,
      },
    },
    {
      $project: {
        owner: 1,
        content: 1,
      },
    },
  ]).exec();

  if (tweetsList.length === 0) {
    return res.status(404).json(new ApiError(404, "No tweets found"));
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, tweetsList, "Successfully all Tweets are fetched")
    );
});

const updateTweet = asyncHandler(async (req, res) => {
  //TODO: update tweet
  const {tweetId} = req.params;
  const {content} = req.body;
  if (!content || content.trim() === "") {
    return res.status(400).json(new ApiError(400, "Content cannot be empty"));
  }

  const tweetToUpdate = await Tweet.
  findByIdAndUpdate(
    tweetId,
    {
      $set: {
        content,
      },
    },
    { new: true }
  );

  if (!tweetToUpdate) {
    return res
      .status(500)
      .json(new ApiError(500, "Error while updating tweet"));
  }

  return res
    .status(200)
    .json(new ApiResponse(200, tweetToUpdate, "Tweet is updated Successfully"));
});

const deleteTweet = asyncHandler(async (req, res) => {
  //TODO: delete tweet
  const { tweetId } = req.params;
  
  const tweetToDelete = await Tweet.findByIdAndDelete(tweetId);

  if(!tweetToDelete){
    return res
    .status(404)
    .json(new ApiResponse(
        404,
        "Tweet not found"
    ))
  }
  return res
  .status(200)
  .json(new ApiResponse(
    200,
    tweetToDelete,
    "Tweet is deleted Successfully"
  ))
});

export { createTweet, getUserTweets, updateTweet, deleteTweet };
