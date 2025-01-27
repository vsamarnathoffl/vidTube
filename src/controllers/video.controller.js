import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { deleteOnCloudinary, uploadOnCloudinary } from "../utils/cloudinary.js";

const getAllVideos = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;
  //TODO: get all videos based on query, sort, pagination

  const parsedPage = parseInt(page, 10);
  const parsedLimit = parseInt(limit, 10);

  const skip = (parsedPage - 1) * parsedLimit;

  let filter = {
    $or: [
      { title: { $regex: query, $options: "i" } },
      { description: { $regex: query, $options: "i" } },
    ],
  };
  if (userId) {
    filter.owner = userId;
  }

  const defaultSortBy = sortBy || "createdAt";
  const defaultSortType = sortType || "desc";

  if (defaultSortType === "desc") defaultSortType = -1;
  else defaultSortType = 1;

  try {
    const videos = await Video.aggregate([
      {
        $match: filter,
      },
      {
        $skip: skip,
      },
      {
        $sort: {
          [defaultSortBy]: defaultSortType,
        },
      },
    ]).exec();

    const totalVideos = await Video.countDocuments(filter);

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { videos, totalVideos },
          "Videos are fetched successfully"
        )
      );
  } catch (error) {
    return res
      .status(500)
      .json(new ApiError(500, "Error while fetching videos", error));
  }
});

const publishAVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body;
  // TODO: get video, upload to cloudinary, create video
  if ([title, description].some((field) => field?.trim() === "")) {
    throw new ApiError(400, "All fields are required");
  }

  const videoFileLocalPath = req.files?.videoFile[0]?.path;

  if (!videoFileLocalPath) {
    throw new ApiError(400, "Video file is required");
  }

  const thumbnailLocalPath = req.files?.thumbnail[0]?.path;

  if (!thumbnailLocalPath) {
    throw new ApiError(400, "Thumbnail File is required");
  }

  let video, thumbnail;
  try {
    video = await uploadOnCloudinary(videoFileLocalPath);
    thumbnail = await uploadOnCloudinary(thumbnailLocalPath);
  } catch (error) {
    throw new ApiError(500, "Error uploading to Cloudinary");
  }
  const duration = video.duration || 0;

  try {
    const videoToUpload = await Video.create({
      videoFile: video.url,
      thumbnail,
      owner: req.user._id,
      title,
      description,
      duration,
      views: 0,
      isPublished: false,
    });
    return res
      .status(201)
      .json(
        new ApiResponse(200, videoToUpload, "Video is uploaded successfully")
      );
  } catch (error) {
    if (video) {
      await deleteOnCloudinary(video.public_id);
    }
    if (thumbnail) {
      await deleteOnCloudinary(thumbnail.public_id);
    }

    throw new ApiError(
      500,
      "Something went wrong, so video and thumbnail are deleting from cloudinary"
    );
  }
});

const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: get video by id
  const video = await Video.aggregate([
    {
      $match: {
        _id: mongoose.Types.ObjectId(videoId),
      },
    },
  ]).exec();

  if (video.length === 0) {
    return res.status(404).json(new ApiResponse(404, null, "video not found"));
  }

  return res
    .status(200)
    .json(new ApiResponse(200, video[0], "Video is fetched successfully"));
});

const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: update video details like title, description, thumbnail
  const { title, description } = req.body;

  const video = await Video.findById(mongoose.Types.ObjectId(videoId));

  if (!video) {
    return res.status(404).json(new ApiError(404, "Video not found"));
  }

  if (title) {
    video.title = title;
  }
  if (description) {
    video.description = description;
  }
  let thumbnail;
  const thumbnailLocalPath = req.file?.path;
  if (thumbnailLocalPath) {
    thumbnail = await uploadOnCloudinary(thumbnailLocalPath);
    video.thumbnail = thumbnail.url;
  }

  await video.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, video, "Successfully updated the video"));
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: delete video

  const videoToDelete = await Video.findByIdAndDelete(
    mongoose.Types.ObjectId(videoId)
  );

  if (!videoToDelete) {
    throw new ApiError(404, "Error while deleting the video");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, videoToDelete, "Video is deleted successfully"));
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  const existingVideo = await Video.findById(videoId);

  if (!existingVideo) {
    return res.status(404).json({
      status: 404,
      message: "Video not found",
    });
  }

  existingVideo.isPublished = !existingVideo.isPublished;
  await existingVideo.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, existingVideo, "Published Status Toggled successfully"));
});

export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
};
