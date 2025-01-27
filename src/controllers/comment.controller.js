import mongoose from "mongoose";
import { Comment } from "../models/comment.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getVideoComments = asyncHandler(async (req, res) => {
  //TODO: get all comments for a video
  const { videoId } = req.params;
  const { page = 1, limit = 10 } = req.query;

  const parsedPage = parseInt(page,10);
  const parsedLimit = parseInt(limit,10);

  const skip = (parsedPage-1)*parsedLimit;

  const comments = await Comment.aggregate([
    {
      $match: {
        video: videoId,
      },
    },
    {
        $skip: skip
    },
    {
      $limit: parsedLimit,
    },
    {
      $lookup:{
        from:"users",
        localField:"owner",
        foreignField:"_id",
        as:"user",
        pipeline:[
          {
            $project:
            {
              username:1,
              avatar:1
            },
          },
        ],
      },
    },
  ]);

  return res
  .status(200)
  .json(
    new ApiResponse(200,
      comments,
      "Comments are fetched successfully"
    )
  )
  
});

const addComment = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { content } = req.body;
  
  if(!content || content.trim()===""){
    throw new ApiError(400, "Content cannot be empty")
  }
  try{
    const comment = await Comment.create({
      content,
      video:videoId,
      owner: req.user._id
    });

    return res
      .status(201)
      .json(new ApiResponse(200, comment,
        "Comment created successfully"
      ))
  }catch(error){
    throw new ApiError(
      500,
      "Something went wrong, so comment is not created"
    )
  }
});

const updateComment = asyncHandler(async (req, res) => {
  const {commentId} = req.params
  const {content}=req.body

  if (!content || content.trim() === "") {
    throw new ApiError(400, "Content cannot be empty");
  }

  commentUpdate = await Comment.findByIdAndUpdate(commentId,
    {
      $set:{
        content:content
      }
    },
    {new:true}
  )
  
  if(!commentUpdate){
    throw new ApiError(404, "Comment not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200,commentUpdate, "Comment is updated successfully"));
});

const deleteComment = asyncHandler(async (req, res) => {
  // TODO: delete a comment
  const { commentId } = req.params;
  deleteComment = await Comment.findByIdAndDelete(commentId)

  if(!deleteComment){
    throw new ApiError(404, "Comment not found");
  }
  return res
    .status(200)
    .json(
      new ApiResponse(200,
        "Comment is deleted successfully"
      )
    )
});

export { getVideoComments, addComment, updateComment, deleteComment };
