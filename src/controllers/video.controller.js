import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const getAllVideos = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;

  //TODO: get all videos based on query, sort, pagination
  console.log("Enter in the getAllVideos");

  const option = {
    page: parseInt(page, 10),
    limit: parseInt(limit, 10),
    sort: { createdAt: -1 },
    // populate: { path: "owner", select: "username email avatar" },
  };
  const aggregate = [
    {
      $match: {
        isPublished: true,
      },
    },
  ];

  //  search by title or description
  if (query) {
    aggregate.push({
      $match: {
        $or: [
          { title: { $regex: query, $options: "i" } }, // "i" --> case-insensitive
          { description: { $regex: query, $options: "i" } },
        ],
      },
    });
  }

  // filter by userId
  if (userId) {
    aggregate.push({
      $match: {
        owner: new mongoose.Types.ObjectId(userId),
      },
    });
  }

  // lookup owner info
  aggregate.push(
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "owner",
        pipeline: [
          {
            $project: {
              username: 1,
              avatar: 1,
              email: 1,
            },
          },
        ],
      },
    },
    {
      $addFields: {
        owner: {
          $first: "$owner",
        },
      },
    }
  );

  // multi - field sorting
  if (sortBy && sortType) {
    const fields = sortBy.split(",");
    const orders = sortType.split(",");

    option.sort = {};
    fields.forEach((field, index) => {
      option.sort[field.trim()] =
        orders[index].toLowerCase() === "asc" ? 1 : -1;
    });
  }

  console.log("getAllVideos: aggregate");
  console.log(aggregate);
  console.log("getAllVideos: option");
  console.log(option);

  const result = await Video.aggregatePaginate(
    Video.aggregate(aggregate),
    option
  );

  return res
    .status(200)
    .json(new ApiResponse(200, result, "Video fetched Successfully"));
});

const publishAVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body;
  // TODO: get video, upload to cloudinary, create video
  // User is already verified using middlewares
  /*required fields for video: 
         videoFile:
         thumbnail:
         title:
         description:
         duration:  //get from cloudinary
    */
  /**             LOGIC:
   *  check Title Description
   *  check video and thumbnail comes to the server or not.
   *  check video and thumbnail are uploaded to the cloudinary or not
   *  create video
   */
  if ([title, description].some((field) => field?.trim() === "")) {
    throw new ApiError(400, "All fields are required");
  }

  const videoLocalPath = req.files?.videoFile[0]?.path;
  if (!videoLocalPath) {
    throw new ApiError(400, "video file is required");
  }
  const thumbnailLocalPath = req.files.thumbnail[0]?.path;
  if (!thumbnailLocalPath) {
    throw new ApiError(400, "thumbnail is required");
  }

  const video = await uploadOnCloudinary(videoLocalPath);
  console.log(video);
  const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);

  if (!video || !thumbnail) {
    throw new ApiError(400, "video and thumbnail is required");
  }

  const creatingVideo = await Video.create({
    videoFile: video.url,
    thumbnail: thumbnail.url,
    title: title,
    description: description,
    duration: video.duration, //temporary value
    owner: req.user?._id,
  });

  const createdVideo = await Video.findById(creatingVideo._id);

  if (!createdVideo)
    throw new ApiError(500, "Somthing went wrong while uploading the video");

  return res
    .status(200)
    .json(new ApiResponse(200, createdVideo, "Video Uploaded Successfully"));
});

const getVideoById = asyncHandler(async (req, res) => {
  //Watching the Video
  const { videoId } = req.params;
  //TODO: get video by id
  /**                 LOGIC:
   *  check the videoId empty or not
   *  need to find:
   *          number of likes
   *          number of subscriber
   *          comments (pagination)
   *  find in the database
   */
  console.log("getVideoById controller");
  if (!videoId) throw new ApiError(400, "videoId field is missing!");

  const findedVideo = await Video.aggregate([
    {
      //Find that video
      $match: {
        _id: new mongoose.Types.ObjectId(videoId),
      },
    },
    {
      //find the Owner of that Video    //number of subscribers?
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "owner",
        // pipeline: [
        //     {   // we only need owner's username and avater
        //         $project:{
        //             username:1,
        //             avatar:1,
        //         }
        //     },
        //     {
        //         $addFields:{
        //             owner:{     //override will happen
        //                 $first: "$owner"
        //             }
        //         }
        //     }
        // ]
      },
    },
    {
      //find likes    // calculate number of likes of that video
      $lookup: {
        from: "likes",
        localField: "_id",
        foreignField: "video",
        as: "like",
      },
    },
    {
      //calculate number of likes of that video
      $addFields: {
        numberOfLikes: {
          $size: "$like",
        },
      },
    },
    {
      //find comments     //comment Owner
      $lookup: {
        from: "comments",
        localField: "",
        foreignField: "",
        as: "comment",
        pipeline: [
          {
            $lookup: {
              from: "users",
              localField: "owner",
              foreignField: "_id",
              as: "commentOwer",
              pipeline: [
                {
                  $project: {
                    username: 1,
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ]);

  let updatedWatchHistory = null;
  if (findedVideo) {
    updatedWatchHistory = await User.findByIdAndUpdate(
      req.user._id,
      {
        $push: {
          watchHistory: new mongoose.Types.ObjectId(videoId),
        },
      },
      { new: true }
    );

    console.log(updatedWatchHistory)
  }

  console.log(`getVideoById: ${findedVideo}`);
  return res
    .status(200)
    .json(new ApiResponse(200, findedVideo, "Find Video Successfully"));
});

const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: update video details like title, description, thumbnail
  /**         LOGIC:
   *  check all the field
   *  if newThumbnail present upload that thumbnail to Cloudinary
   *  update the video model according to the given data
   */
  const { title, description } = req.body;
  const thumbnailLocalPath = req.file?.path;

  if (!title && !thumbnailLocalPath && !description)
    throw new ApiError(
      400,
      "fields are missing (title and newThumbnail and description"
    );

  let thumbnail;
  if (thumbnailLocalPath) {
    thumbnail = await uploadOnCloudinary(thumbnailLocalPath);
    if (!thumbnail) throw new ApiError(400, "Cloudiinary upload error");
  }
  //Update in the databsae
  const updateData = {
    ...(title && { title }),
    ...(description && { description }),
    ...(thumbnail && { thumbnail }),
  };
  console.log(updateData);
  const video = await Video.findByIdAndUpdate(
    videoId,
    {
      $set: updateData,
    },
    { new: true }
  );

  return res
    .status(200)
    .json(new ApiResponse(200, video, "Video update Successfully"));
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: delete video
  /**                     LOGIC:
   *  check the videoId empty or not
   *  find and delete the video in the database
   */

  if (!videoId)
    throw new ApiError(400, "VideoId field is missing for delete video");

  const video = await Video.findById(videoId);
  if (!video) throw new ApiError(400, "Video is not found!");

  const userId = req.user._id;

  if (video.owner.toString() !== userId?.toString())
    throw new ApiError(400, "Unathorized to delete that video");
  const deletedVideo = await Video.findByIdAndDelete(videoId);

  return new ApiResponse(200, deleteVideo, "video deleted Successfully");
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  /**                 LOGIC:
   *  check videoId and User field
   *  verify the User, is that User real ower of the vidoe or not
   *  change the publishStatus
   */
  console.log(req.user);
  const userId = req.user._id;
  const video = await Video.findById(videoId);
  console.log("Video data:");
  console.log(video);
  if (!video) throw new ApiError(400, "Video is not found!");

  if (video.owner.toString() !== userId?.toString())
    throw new ApiError(400, "Unathorized to update publish status");

  const updatedVideo = await Video.findByIdAndUpdate(
    videoId,
    { $set: { isPublished: !video.isPublished } },
    { new: true }
  );

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        updatedVideo,
        `Video ${updatedVideo.isPublished ? "Published" : "Unpublished"}`
      )
    );
});

export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
};
