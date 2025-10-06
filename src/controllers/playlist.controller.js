import mongoose, {isValidObjectId} from "mongoose"
import {Playlist} from "../models/playlist.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const createPlaylist = asyncHandler(async (req, res) => {
    const {name, description} = req.body

    //TODO: create playlist

    /**                 LOGIC
     *  create playlist using name, description, owner
     *  owner: userId
     *  
     */

    if(!name.trim() || !description.trim()) throw new ApiError(400,"all field is requied")

    const createdPlaylist = await Playlist.create({
        name,
        description,
        owner: req.user?._id,
    })

    return res.status(200).json(new ApiResponse(200,createdPlaylist,"playlist is created!"))

})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const {userId} = req.params
    //TODO: get user playlists

    if(!userId) throw new ApiError(400,"userId field is missing!")


    const userPlaylists = await Playlist.find({
        owner: userId
    })

    return res.status(200).json(new ApiResponse(200,userPlaylists,"all playlist created by user"))
})

const getPlaylistById = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    //TODO: get playlist by id

    if(!playlistId) throw new ApiError(400,"playlistId field is missing!")

    const playlist = await Playlist.findById(playlistId);

    if(!playlist) throw new ApiError(400,"that playlist does not existed!")

    return res.status(200).json(200,playlist,"playlist find successfully")
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params

    if(!playlistId || !videoId) throw new ApiError(400,"all fields are required!")

    const updatedPlaylist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $push:{
                videos: new mongoose.Types.ObjectId(videoId)
            }
        },
        {new:true}
    );

    return res.status(200).json(new ApiResponse(200,updatePlaylist,"playlist Update Successfully!"))

})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    // TODO: remove video from playlist
    if(!playlistId || !videoId) throw new ApiError(400,"all fields are required")

    const updatedPlaylist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $pull:{
                videos: new mongoose.Types.ObjectId(videoId)
            }
        },
        {new:true}
    );



    return res.status(200).json(new ApiResponse(200,updatePlaylist,"Playlist Update Successfully"))
})

const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    // TODO: delete playlist

    if(!playlistId) throw new ApiError(400,"all fields are required")

    const deletedPlaylist = await Playlist.findByIdAndDelete(playlistId)
    if(!deletePlaylist) throw new ApiError(400,"Playlist is not found!")
    return res.status(200).json(new ApiResponse(200,deletePlaylist,"Playlist delete successfully!"))
})

const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const {name, description} = req.body
    //TODO: update playlist

    if(!playlistId || !name || !description) throw new ApiError(400,"all fields are required")

    const updatedPlaylist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $set:{
                name,
                description
            }
        },
        {new:true}
    );
    if(!updatedPlaylist) throw new ApiError(400,"Playlist is not found!")

    return res.status(200).json(new ApiResponse(200,updatedPlaylist,"Playlist update successfully!"))
})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}
