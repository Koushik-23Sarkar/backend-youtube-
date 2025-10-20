import mongoose, {isValidObjectId} from "mongoose"
import {User} from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    // TODO: toggle subscription
    /**             LOGIC:
     *  find channelId while value is req.user._id 
     *  delete that field
     */

    if(!channelId) throw new ApiError(400, "channelId field is missing")

    const alreadySubscribed = await Subscription.aggregate([
        {
            $match:{
                channel:new mongoose.Types.ObjectId(channelId),
                subscriber: new mongoose.Types.ObjectId(req.user._id)
            }
        }
    ])

    if(alreadySubscribed){
        // delete that field
        await Subscription.findByIdAndDelete(alreadySubscribed[0]._id)
        return res.status(200).json(new ApiResponse(200,{},"unsubscribed successfully"))
    }

    const newSubscribed = await Subscription.create({
        subscriber: req.user._id,
        channel: channelId
    })

    return res.status(200).json(new ApiResponse(200,newSubscribed,"subscribed successfully"))
})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    /**             LOGIC:
     *  find channel:channelId  in the subscription table
     *  count number of fields
     */

    if(!channelId) throw new ApiError(400,"channelId field is missing")

    const subscribers = await Subscription.aggregate([
        {
            $match:{
                channel : new mongoose.Types.ObjectId(channelId)
            }
        }, {

            $count: "numberOfSubscribers"
        }
    ])

    return res.status(200).json(new ApiResponse(200,subscribers,"subscriber fetched successfully!"))
})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { channelId } = req.params
    /**             LOGIC:
     *  find subscriber:subscriberId in the subscription table
     *  count number of field
     */

    if(!channelId) throw new ApiError(400,"subscriberId is missing!")

    const subscribedChannels = await Subscription.aggregate([
        {
            $match:{
                subscriber: new mongoose.Types.ObjectId(channelId) 
            }
        },{
            $count: "numberOfSubscribedChannel"
        }
    ])

    return res.status(200).json(new ApiResponse(200,subscribedChannels,"subscribedChannels fetched successfully"))
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}