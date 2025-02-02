import { Playlist } from "../models/playlist.models.js";
import mongoose, { isValidObjectId } from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Video } from "../models/video.models.js"


const createPlaylist = asyncHandler(async (req, res) => {
    //get name and description
    //get owner from playlist
    //create playlist using mongoose

    const { name, description } = req.body

    if (!(name && description)) {
        throw new ApiError(400, "name and description both fields are required")
    }

    const playlist = await Playlist.create({
        name,
        description,
        owner: req.user?.id
    })
    if (!playlist) {
        throw new ApiError(400, "Failed to create Playlist Please try again")
    }

    return res
        .status(200)
        .json(new ApiResponse(
            200,
            playlist,
            "Playlist created Successfully"
        ))
})

const updatePlaylist = asyncHandler(async (req, res) => {
    //get new name and description
    //get playlistId
    //check ownerId match with userId
    //update playlist
    const { name, description } = req.body
    if (!(name && description)) {
        throw new ApiError(400, "name and description both fields are required")
    }


    const { playlistId } = req.params
    // console.log(playlistId);
    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, "Playlist Not Found, please enter valid playlistId")
    }

    const playlist = await Playlist.findById(playlistId)
    if (!playlist) {
        throw new ApiError(400, "Playlist not Found")
    }

    if (playlist?.owner.toString() !== req.user?._id.toString()) {
        throw new ApiError(400, "You can not edit the playlist as you are not the owner")
    }

    //this line ensure that now you have to do  update the playlist

    const updatePlaylist = await Playlist.findByIdAndUpdate(
        playlist?._id,
        {
            $set: {
                name,
                description,
            }
        },
        { new: true }
    )


    if (!updatePlaylist) {
        throw new ApiError(500, "Failed to Update the Playlist , Please try again")
    }

    return res
        .status(200)
        .json(new ApiResponse(
            200,
            updatePlaylist,
            "Playlist Updated Successfully"
        ))

})

const deletePlaylist = asyncHandler(async (req, res) => {
    //get playlistId
    //check valid playlistId
    //check owner id with user id
    //delete the playlist

    const { playlistId } = req.params
    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, "Playlist Not Found,please enter valid playlistId")
    }

    const playlist = await Playlist.findById(playlistId)
    if (!playlist) {
        throw new ApiError(400, "playlist Not Found on Playlist Collections")
    }
    if (playlist?.owner.toString() !== req.user?._id.toString()) {
        throw new ApiError(400, "You can not delete the playlist as you are not the owner")
    }

    //this line ensure that you can delete the playlist as you are owner
    const deleltPlalylist = await Playlist.findByIdAndDelete(playlist?._id)

    if (!deleltPlalylist) {
        throw new ApiError(500, "Failed to delete the playlist , Please try again")
    }

    return res
        .status(200)
        .json(new ApiResponse(
            200,
            {},
            "Playlist Deleted Successfully"
        ))

})

const addVideoOnPlaylist = asyncHandler(async (req, res) => {
    //get videoId, playlistId
    //check valid videoId and playlistId
    //check owner id match with user id
    //add videoid in playslisId

    const { playlistId, videoId } = req.params
    if (!(isValidObjectId(playlistId) && isValidObjectId(videoId))) {
        throw new ApiError(400, "Please enter valid playlistId and videoId")
    }

    const playlist = await Playlist.findById(playlistId)

    const video = await Video.findById(videoId)
    console.log(`${playlistId} and ${playlist?._id}`);

    if (!playlist) {
        throw new ApiError(400, "Playlist Not Found on Playlist Collections")
    }
    if (!video) {
        throw new ApiError(400, "Video Not Found on Videos Collections")
    }

   
    
    
    if (!(playlist?.owner.toString() && video?.owner.toString())) {
        throw new ApiError(400, "playlist and video both owner is requried")
    }

    if (playlist?.owner.toString() !== req.user?._id.toString()) {
        throw new ApiError(400, "You can not add video as you are not the owner")
    }
    //this line ensures that you can add video on your playlistId
    if (!videoId) {
        throw new ApiError(400, "videoFile not Found")
    }


    const updatePlaylist = await Playlist.findByIdAndUpdate(
        playlist?.id,
        {
            $addToSet: {
                videos: videoId

            }
        },
        { new: true }

    )
    if (!updatePlaylist) {
        throw new ApiError(500, "Failed to add video on playlist please try again")
    }

    return res
        .status(200)
        .json(new ApiResponse(
            200,
            updatePlaylist,
            "Added video on Playlist Successfully"
        ))
})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    //get videoId,  which videoId do you want remove from Playlist 
    //get playlistId
    //check valid videoId
    //find out the videoId  in playlist  provided by client
    //check owner id match with userid
    //remove the videoId in playlist

    const { playlistId, videoId } = req.params

    if (!((isValidObjectId(playlistId)) && isValidObjectId(videoId))) {
        throw new ApiError(400, "Invalid playlistId and videoId")
    }
    const playlist = await Playlist.findById(playlistId)

    const video = await Video.findById(videoId)

    if (!playlist) {
        throw new ApiError(400, "playlistId Not Found")
    }
    if (!video) {
        throw new ApiError(400, "videoId Not Found")
    }

    // console.log(playlist?.owner.toString());
    // console.log(video?.owner.toString());
    
    
    // const check = playlist?.owner.toString() && video?.owner.toString()
    // console.log(check);

    if (!(playlist?.owner.toString() && video?.owner.toString())) {
        throw new ApiError(400, "playlist and video Both owner is required")

    }
    if (playlist?.owner.toString() !== req.user?._id.toString()) {
        throw new ApiError(400, "You can not remove the video from playlist as you are not the owner")
    }

    //this line ensures that you can remove the videoId from your plylistId

    const updatePlaylist = await Playlist.findByIdAndUpdate(
        playlist?._id,
        {
            $pull: {
                videos: videoId
    //$pull Operator

    /* 
        $pull is a MongoDB update operator used to remove specific elements from an array.

        It removes all instances of videoId from the videos array in the playlist document.
            
    */
            }
        },
        { new: true }
    )


    if (!updatePlaylist) {
        throw new ApiError(500, "Failed to remove video from playlist Please try again")
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                updatePlaylist,
                "Removed video from playlist successfully"
            )
        )

})

const getPlaylistById = asyncHandler(async(req, res) => {
    //get playlistId
    //check valid playlistId
    //check playlist-> onwer id match with user id
    //used pipeline stages
        /*
            1. $match->if true ->collect all information on playlistId
            2. $lookup->
                1. from-> playlist
                2. loacalfiedl-> 
                3. foreignfield->
        */



    const { playlistId } = req.params
    if(!isValidObjectId(playlistId))
    {
        throw new ApiError(400, "Invalid PlaylistId")
    }

    const playlist = await Playlist.findById(playlistId)

    if(!playlist)
    {
        throw new ApiError(400, "Playlist not Found")
    }

    const playlistVideos = await Playlist.aggregate([
         {
            $match: {
                _id: new mongoose.Types.ObjectId(playlistId)
            }
        },
     
        {
            $lookup: {
                from: "videos",
                localField: "videos",
                foreignField: "_id",
                as: "videos"
            }
        },
        {
            $match: {
                "videos.isPublished": true
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner"
            }
        },
        {
            $addFields: {
                totalVideos: {
                    $size: "$videos"
                },
                totalViews: {
                    $sum: "$videos.views"
                },
                owner: {
                    $first: "$owner"
                }
            }
        },
        {
            $project: {
                name: 1,
                description: 1,
                createdAt: 1,
                updatedAt: 1,
                totalVideos: 1,
                totalViews: 1,
                videos: {
                    _id: 1,
                    videoFile: 1,
                    thumbnail: 1,
                    title: 1,
                    description: 1,
                    duration: 1,
                    createdAt: 1,
                    views: 1

                },
                owner: {
                    username: 1,
                    fullname: 1,
                    avatar: 1
                }
            }
        }

    ])
   if(!playlistVideos.length)
   {
    throw new ApiError(400, "No playlist data found")
   }
    
    return res
    .status(200)
    .json(new ApiResponse(
        200,
        playlistVideos[0],
        "playlist Fetched Successfully"
    ))
})


  

export {
    createPlaylist,
    updatePlaylist,
    deletePlaylist,
    addVideoOnPlaylist,
    removeVideoFromPlaylist,
    getPlaylistById
}