import { Like } from "../models/like.models.js";
import mongoose, { isValidObjectId } from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
    //get videoId
    //check valid videoId
    //check user liked alredy on this videoId or not 
    //if liked already toggle to false
    //if unliked then toggle to true and delete the User->liked._id(povided by mongoose each liked has unique id)
    const { videoId } = req.params

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid videoId")
    }

    const likedAlready = await Like.findOne(
        {
            video: videoId,
            likedBy: req.user?._id
        }
    )

    if (likedAlready) {
        await Like.findByIdAndDelete(likedAlready?._id)

        return res
            .status(200)
            .json(new ApiResponse(
                200,
                { isLiked: false },
                "Toggled Like Sucessfully"
            ))
    }
    const likedAvideo = await Like.create({
        video: videoId,
        likedBy: req.user?.id

    })

    if (!likedAvideo) {
        throw new ApiError(400, "Failed to like the Video please try again")
    }

    return res
        .status(200)
        .json(new ApiResponse(
            200,
            { isLiked: true },
            "Toggled Like Successfully"
        ))


})

const toggleCommentLike = asyncHandler(async (req, res) => {
    //get commentId
    //check valid commendId
    //check comment already or not 
    //if commentLike already then ->false
    //if non commentLike then->delete commentLike id->true

    const { commentId } = req.params

    if (!isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid commentId")
    }

    const likedAlready = await Like.findOne({
        commeent: commentId,
        likedBy: req.user?._id

    })
    if (likedBy) {
        await Like.findByIdAndDelete(likedAlready?._id)

        return res
            .status(200)
            .json(new ApiResponse(
                200,
                { isLiked: falae },
                "toggle CommentLiked Successfully"
            ))
    }

    const updateLike = await Like.create({
        commeent: commentId,
        likedBy: req.user?._id
    })
    if (!updateLike) {
        throw new ApiError(500, "Failed to create commentLike plase try again")
    }
    return res
        .status(200)
        .json(new ApiResponse(
            200,
            { isLiked: true },
            "commentLiked Successfully"
        ))
})

const toggleTweetLike = asyncHandler(async (req, res) => {
    //get commentId
    //check valid commendId
    //check comment already or not 
    //if commentLike already then ->false
    //if non commentLike then->delete commentLike id->true

    const { tweetId } = req.params

    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid commentId")
    }

    const likedAlready = await Like.findOne({
        tweet: tweetId,
        likedBy: req.user?._id

    })
    if (likedBy) {
        await Like.findByIdAndDelete(likedAlready?._id)

        return res
            .status(200)
            .json(new ApiResponse(
                200,
                { isLiked: falae },
                "toggle tweetLiked Successfully"
            ))
    }

    const updateLike = await Like.create({
        tweet: tweetId,
        likedBy: req.user?._id
    })
    if (!updateLike) {
        throw new ApiError(500, "Failed to create tweetLike plase try again")
    }
    return res
        .status(200)
        .json(new ApiResponse(
            200,
            { isLiked: true },
            "commentLiked Successfully"
        ))
})

const getLikedVideos = asyncHandler(async (req, res) => {
    const likedVideoAggregate = await Like.aggregate([
        {
            $match: {
                likedBy: new mongoose.Types.ObjectId(req.user?._id)
            }
        },
        {
            $lookup: {
                from: "videos",//videso collection
                localField: "video",//Likes collection
                foreignField: "_id",//videos collection id match with likes collection field in video id
                as: "likedVideo",
                pipeline: [

                    {
                        $lookup: {
                            from: "users",//user collections
                            localField: "owner",//videos collection the field owner
                            foreignField: "_id",//in user collection id match with videos collection the field in owner id-?jonin them cause they are same id ,user and owner are same join they are information 
                            as: "ownerDetails"
                        }
                    },

                    {
                        $unwind: "$ownerDetails"//ownerDetails is likely an array, and $unwind ensures that instead of an array of objects, each object inside it is treated as a separate document.
                    }

                ]
            }
        },
        {
            $unwind: "$likedVideo"
        },
        {
            $sort: {
                createdAt: -1
            }
        },
        {
            $project: {
                _id: 1,
                likedVideo: {
                    _id: 1,
                    videoFile: 1,
                    thumbnail: 1,
                    owner: 1,
                    title: 1,
                    description: 1,
                    views: 1,
                    duration: 1,
                    createdAt: 1,
                    ownerDetails: {
                        usernane: 1,
                        fullname: 1,
                        avatar: 1
                    }
                }
            }
        }

    ])
    if (!likedVideoAggregate.length) {
        throw new ApiError(400, "Failed to get likedVideo")
    }
    return res
        .status(200)
        .json(new ApiResponse(
            200,
            likedVideoAggregate,
            "LikedVideo Aggregate Fatched Successfully"
        ))
})


export {
    toggleVideoLike,
    toggleCommentLike,
    toggleTweetLike,
    getLikedVideos
}