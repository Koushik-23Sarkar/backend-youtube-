import mongoose from "mongoose"
import {Comment} from "../models/comment.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const {videoId} = req.params
    const {page = 1, limit = 10} = req.query

    if(!videoId) throw new ApiError(200,"VideoId is not Present!");

    const allSortedComment = await Comment.aggregate([
        {
            $match:{
                video: new mongoose.Types.ObjectId(videoId)
            }
        },{
            $sort: { createdAt: -1 },
        }
    ])

    //Paginate
    const paginateComment = await Comment.aggregatePaginate(allSortedComment,{
        page: parseInt(page),
        limit: parseInt(limit),
    })

    return res.status(200).json(new ApiResponse(200,paginateComment,"Get Comments of a Video Successfully!"))
})

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video
    /**                 LOGIC:
     *  content of the comment: req.body
     *  id of the Video: req.param
     *  owner of that comment: req.user._id
     * 
     *  create a field in the Comment table using above data.
     */
    
    const commentContent = req.body;
    if(!commentContent) throw new ApiError(400,"Enter comment content!")

    const {videoId} = req.params;
    if(!videoId) throw new ApiError(400,"Video is not present!")

    const newComment = await Comment.create({
        content: commentContent,
        video: videoId,
        owner: req.user._id
    })

    if(!newComment) throw new ApiError(400,"Failed to create comment")

    return res.status(200).json(new ApiResponse(200,newComment,"comment created Successfully!"))

})

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment

    /**             LOGIC:
     *  id of the comment: req.param
     *  Find that field in the comment table
     *  
     *  content of the comment: req.body
     *  update that field
     */

    const {commentId} = req.params;
    if(!commentId) throw new ApiError(400,"comment id is empty!");

    const {commentContent} = req.body;
    if (!commentContent) throw new ApiError(400,"commentContent is missing");

    const updatedComment = await Comment.findByIdAndUpdate(
        commentId,
        {
            $set:{
                content:commentContent
            }
        },{new:true}
    )

    return res
    .status(200)
    .json(
        new ApiResponse(200,updatedComment,"comment update successfully!")
    )
})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment

    /**             LOGIC:
     *  id of the comment: req.param
     *  find that field in the comment table
     * 
     *  delete that field
     */

    const {commentId} = req.params;
    if(!commentId) throw new ApiError(400,"comment id is empty!");

    const deletedComment = await Comment.findByIdAndDelete(commentId);

    return res.status(200).json(
        new ApiResponse(200,deletedComment,"comment is deleted")
    )
})

export {
    getVideoComments, 
    addComment, 
    updateComment,
    deleteComment
    }
