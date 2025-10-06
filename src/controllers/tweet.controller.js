import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweet.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet
    /**                 LOGIC:
     *  get userId from req.user
     *  get content from req.body
     *  create Tweet using it
     */
    const {content} = req.body;
    if(!content) throw new ApiError(400,"need content to create tweet")

    const createdTweet = await Tweet.create({
        owner: req.user._id,
        content: content
    })

    if(!createdTweet) throw new ApiError(400,"somthing wents wrong while creating tweet")

    return res.status(200).json(new ApiResponse(200,createdTweet,"new tweet is created"))
})

const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets
    /**                 LOGIC:
     *  get userId from params
     *  find that user in the Tweets table
     *  find likes of each Tweets (nested aggression)
     */

    const {userId} = req.params;

    if(!userId) throw new ApiError(200,"userId field is missing")

    const userTweets = await Tweet.aggregate([
        {
            $match:{
                owner: new mongoose.Types.ObjectId(userId)
            }
        }
    ])

    return res.status(200).json(new ApiResponse(200,userTweets,"user's tweets fetch successfully"))
})

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet
    /**                 LOGIC:      content and likes can updated
     *   get TweetId from params && content from req.body
     *  find that tweet and update it's content
     *      
     */

    const {tweetId} = req.params;
    const {content} = req.body;

    if(!tweetId) throw new ApiError(400,"tweetid field is missing")

    if(!content) throw new ApiError(200,"There is no content to update")

    const updatedTweet = await Tweet.findByIdAndUpdate(
        tweetId,
        {
            $set:{
                content
            }
        },{new:true}
    )

    if(!updatedTweet) throw new ApiError(400,"tweet is not found")

    return res.status(200).json(new ApiResponse(200,updatedTweet,"tweet update successfully"));
})

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet
    /**                 LOGIC:
     *  get TweetId from params 
     *  delete that Tweet 
     */

    const {tweetId} = req.params;
    if(!tweetId) throw new ApiError(400,"tweetId field is missing")

    const deletedTweet = await Tweet.findByIdAndDelete(tweetId);

    if(!deletedTweet) throw new ApiError(400,"that tweet does not exists")
    
    return res.status(200).json(new ApiResponse(200,deletedTweet,"tweet deleted successfully"));
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}
