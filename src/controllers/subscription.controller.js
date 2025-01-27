import mongoose, { isValidObjectId } from "mongoose";
import { User } from "../models/user.model.js";
import { Subscription } from "../models/subscription.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleSubscription = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  // TODO: toggle subscription
  const userId = req.user._id;
  const existingSubscription = await Subscription.findOne({
    channel: channelId,
    subscriber: userId,
  });

  if (existingSubscription) {
    const subscriptionToDelete = await Subscription.deleteOne({
      channel: channelId,
      subscriber: userId,
    });

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          subscriptionToDelete,
          "Subscription is deleted from the channel"
        )
      );
  }

  const createSubscription = await Subscription.create({
    subscriber: userId,
    channel: channelId,
  });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        createSubscription,
        "Subscription is added to channel"
      )
    );
});

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  try {
    const subscribersList = await Subscription.aggregate([
      {
        $match: {
          channel: channelId,
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "subscriber",
          foreignField: "_id",
          as: "subscribers",
          pipeline: [
            {
              $project: {
                username: 1,
                avatar: 1,
              },
            },
          ],
        },
      },
    ]).exec();
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          subscribersList,
          "Subscribers List fetched Successfully"
        )
      );
  } catch (error) {
    return res
      .status(500)
      .json(
        new ApiError(500, "Error while fetching the subscribers list", error)
      );
  }
});

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
  const { subscriberId } = req.params;
  try{
    const channelList = await Subscription.aggregate([
      {
        $match:{
          subscriber:subscriberId
        },
      },
      {
        $lookup:{
          from:"users",
          localField:"channel",
          foreignField:"_id",
          as:"channelList",
          pipeline:[
            {
              $project:{
                username:1,
                avatar:1
              },
            },
          ],
        },
      },
    ]).exec();
    
    if (channelList.length === 0) {
      return res
        .status(204)
        .json(
          new ApiResponse(204, null, "You haven't subscribed to any channel")
        );
    }


    return res
      .status(200)
      .json(new ApiResponse(
        200,
        channelList,
        "Channel List is fetched Successfully"
      ))
  }catch(error){
    return res.
    status(500).
    json(new ApiError(500,"Error while fetching the channel list",error))
  }
});

export { toggleSubscription, getUserChannelSubscribers, getSubscribedChannels };
