import mongoose from "mongoose"
import {Video} from "../models/video.model.js"
import {Subscription} from "../models/subscription.model.js"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getChannelStats = asyncHandler(async (req, res) => {
    // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.

    /**                 LOGIC:
     *  user._id (given)
     *  totalVideoViews:
     *          find all videoes using userid
     */

    const userId = req.user._id;
    const videoDetails = await Video.aggregate([
        {   
            $match: {
                owner: new mongoose.Types.ObjectId(req.user._id)
            }
        },
        { // count number of videos
            $count: "numberOfvideos"
        },
        {   //Total views of the channel
            $group: {
                _id: null,
                totalViews: {
                    $sum: "$views"
                }
            }
        },
        {
            $lookup: {
                
            }
        }
        
    ])
    
})

const getChannelVideos = asyncHandler(async (req, res) => {
    // TODO: Get all the videos uploaded by the channel

    /**                 LOGIC:
     *  get owner name from req.body
     *  search owner name in the Video table
     *  also check isPublished, so that only publish video will show
     */
})

export {
    getChannelStats, 
    getChannelVideos
    }