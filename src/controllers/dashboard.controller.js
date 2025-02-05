import { Subscriptions } from "../models/subscription.models.js";
import { Video } from "../models/video.models.js";
import { Like } from "../models/like.models.js";
import mongoose, { isValidObjectId } from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const getChannelStats = asyncHandler(async (req, res) => {
    //TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.

    const userId = req.user?._id
    if (!isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid userId")
    }

    const totalSubscribers = await Subscriptions.aggregate([
        {
            $match: {
                channel: new mongoose.Types.ObjectId(userId)
            }
        },
        {
            $group: {
                _id: null,
                subscribersCount: {
                    $sum: 1
                }
            }
        }
    ])

    const video = await Video.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(userId)
            }
        },
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "video",
                as: "likes"
            }
        },
        {
            $project: {
                totalLikes: {
                    $size: "$likes"
                },
                totalViews: "$views",

            }
        },
        {
            $group: {
                _id: null,
                totalLikes: {
                    $sum: "$totalLikes"
                },
                totalViews: {
                    $sum: "$totalViews"
                },
                totalVideos: {
                    $sum: 1
                }
            }
        }
    ])

    const channelStats = {
        totalSubscribers: totalSubscribers[0]?.subscribersCount || 0,
        totalLikes: video[0]?.totalLikes || 0,
        totalViews: video[0]?.totalViews || 0,
        totalVideos: video[0]?.totalVideos || 0
    }
    // console.log(totalSubscribers);
    //output->[ { _id: null, subscribersCount: 1 } ]
    //The reason for using [0] is because MongoDB's .aggregate() method returns an array, even if there's only one result.


    
    return res
        .status(200)
        .json(new ApiResponse(
            200,
            channelStats,
            "channelStats Fetched successfuly"

        ))


})

const getChannelVideos = asyncHandler(async(req, res) => {
    // TODO: Get all the videos uploaded by the channel
    //steps
    //get likes
    //then set the project
    const userId = req.user?._id
    if(!isValidObjectId(userId))
    {
        throw new ApiError(400, "Invalid userId")
    }
    const channelvideos = await Video.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(userId)
            }
        },
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "video",
                as: "likes"
            }
        },
        {
            $addFields: {
                createdAt: {
                    $dateToParts: {date: "$createdAt"}

                    //Converts createdAt to { year, month, day } for easier formatting.
                },
                likescount: {
                    $size: "$likes"
                }
            }
        },
        {
           $sort: {
            createdAt: -1
           } 
        },
        {
            $project: {
                _id: 1,
                videoFile: 1,
                thumbnail: 1,
                title: 1,
                description: 1,
                createdAt: {
                    year: 1,
                    month: 1,
                    day: 1
                },
                isPublished: 1,
                likescount: 1
            }
        }
    ])
    // console.log(channelvideos.length);
    
    if(!channelvideos.length)
    {
        throw new ApiError(400, "Failed to Fetched channel Videos")
    }
    return res
    .status(200)
    .json(new ApiResponse(
        200,
        channelvideos,
        "channel Videos Fetched Successfully"

    ))
})

export {
    getChannelStats,
    getChannelVideos
}