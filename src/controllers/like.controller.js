import mongoose, {isValidObjectId} from "mongoose"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    //TODO: toggle like on video
    const userId = req.user._id;

    if(!videoId) throw new ApiError(400,"videoId field is missing")
    
    const exisitingVideoLike = await Like.findOne({
        video:videoId,
        likedBy:userId
    });

    if(exisitingVideoLike) {
        await Like.findByIdAndDelete(exisitingLike._id);
        return res.status(200).json(200,{},"video unliked...")
    }

    const newLike = await Like.create({
        video:videoId,
        likedBy:userId,
    })

    return res.status(200).json(
        new ApiResponse(200,newLike,"video liked successfully!")
    )
    
})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    //TODO: toggle like on comment
    const userId = req.user._id;

    if(!commentId) throw new ApiError(400,"commentIf field is missing");

    const exisitingCommentLike = await Like.findOne({
        comment:commentId,
        likedBy:userId
    })

    if(exisitingCommentLike){
        await Like.findByIdAndDelete(exisitingCommentLike._id);
        return res.status(200).json(new ApiResponse(200,{},"Comment unliked..."))
    }

    const newCommentLike = await Like.create({
        comment:commentId,
        likedBy:userId,
    })

    return res.status(200).json(new ApiResponse(200,newCommentLike,"comment liked successfully"))
})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    //TODO: toggle like on tweet
    const userId = req.user?._id;

    if(!tweetId) throw new ApiError(400,"tweetId is missing")


    const exisitingTweetLike = await Like.findOne({
        tweet:tweetId,
        likedBy:userId
    })

    if(exisitingTweetLike){
        await Like.findByIdAndDelete(exisitingTweetLike._id);
        return res.status(200).json(new ApiResponse(200,{},"tweet disliked"))
    }

    const newTweetLike = await Like.create({
        tweet:tweetId,
        likedBy:userId
    })

    return res.status(200).json(new ApiResponse(200,newTweetLike,"tweet liked successfully"))
})

const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos


    /**                     LOGIC
     *  get userid
     *  find that user in the like model
     *  also get video details
     */

    const likedVideo = await Like.aggregate([
        {
            $match:{
                likedBy: new mongoose.Types.ObjectId(req.user?._id)
            }
        },
        {
            $lookup:{
                from: "videos",
                localField:"video",
                foreignField:"_id",
                as:"videoDetails"
            }
        }
    ])

    return res.status(200).json(new ApiResponse(200,likedVideo, "liked video"))
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}