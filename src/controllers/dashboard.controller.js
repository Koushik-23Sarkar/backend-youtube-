import mongoose from "mongoose";
import { Video } from "../models/video.model.js";
import { Subscription } from "../models/subscription.model.js";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getChannelStats = asyncHandler(async (req, res) => {
  // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.

  /**                 LOGIC:
   *  user._id (given)
   *  totalVideoViews:
   *          find all videoes using userid
   *  totalSubscribers:
   *      find channel in the Subscriptions
   *  totalLikes:
   *      find all videos using userId
   */

  const userId = req.user._id;
  const videoDetails = await Video.aggregate([
    {
      $match: {
        owner: new mongoose.Types.ObjectId(userId),
      },
    },
    {
      $lookup: {
        from: "likes",
        localField: "_id",
        foreignField: "video",
        as: "likeDetails",
      },
    },
    {
      $addFields: {
        likeCount: { $size: "$likeDetails" },
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "owner",
        foreignField: "channel",
        as: "subscribersDetails",
      },
    },
    {
      $addFields: {
        subscriberCount: { $size: "$subscribersDetails" },
      },
    },
    {
      $group: {
        _id: null,
        numberOfViews: { $sum: "$views" },
        numberOfLikes: { $sum: "$likeCount" },
        numberOfSubscribers: { $sum: "$subscriberCount" },
      },
    },
  ]);

  return res
    .status(200)
    .json(
      new ApiResponse(200, videoDetails, "ChannelStats fetched successfully!")
    );
});
const getChannelVideos = asyncHandler(async (req, res) => {
  // TODO: Get all the videos uploaded by the channel
  /**                 LOGIC:
   *  Output:
   *      --> isPublished, title, thumnails, likes of that video, data uploaded
   *
   *  get owner name from req.body
   *  search owner name in the Video table
   *  also check isPublished, so that only publish video will show
   */

  const userId = req.user._id;
  const videoDetails = await Video.aggregate([
    {
      $match: {
        owner: new mongoose.Types.ObjectId(userId),
      },
    },
    {
      $lookup: {
        from: "likes",
        localField: "_id",
        foreignField: "video",
        as: "likeDetails",
      },
    },
    {
      $addFields: {
        likeCount: { $size: "$likeDetails" },
      },
    },
  ]);

  return res
    .status(200)
    .json(
      new ApiResponse(200, videoDetails, "ChannelVideos fetched successfully!")
    );
});

export { getChannelStats, getChannelVideos };
