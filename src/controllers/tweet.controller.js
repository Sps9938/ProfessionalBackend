import { Tweet } from "../models/tweet.models.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import mongoose, { isValidObjectId } from "mongoose";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.models.js";
const createTweet = asyncHandler(async (req, res) => {
    //get content
    //create tweet
    console.log(req.body);
    const { content } = req.body
    if (!content) {
        throw new ApiError(400, "Content Field is required")
    }
    const tweet = await Tweet.create({
        content,
        owner: req.user?._id
    })

    if (!tweet) {
        throw new ApiError(400, "Failed to create tweet")
    }

    return res
        .status(200)
        .json(new ApiResponse(
            200,
            tweet,
            "Tweet Created Successfully"
        ))
})
const updateTweet = asyncHandler(async (req, res) => {
    //get twwet id
    //check valid tweetid
    //update the content
    const { tweetId } = req.params
    const { content } = req.body

    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid tweetId")
    }
    const tweet = await Tweet.findById(tweetId)
    if (!tweet) {
        throw new ApiError(400, "tweetId Not Found")
    }

    if (!content) {
        throw new ApiError(400, "content field is required")
    }
    //update the content of tweet

    const updateTweet = await Tweet.findByIdAndUpdate(
        tweet?._id,
        {
            $set: {
                content
            }
        },
        { new: true }
    )
    if (!updateTweet) {
        throw new ApiError(500, "Faiied to update tweet please try again")
    }
    return res
        .status(200)
        .json(new ApiResponse(
            200,
            updateTweet,
            "Tweet Updated Successfully"
        ))
})

const deleteTweet = asyncHandler(async (req, res) => {
    //get tweetId
    //chaeck valid tweetId
    //delete tweetid
    const { tweetId } = req.params
    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid tweetId")
    }
    const tweet = await Tweet.findById(tweetId)
    if (!tweet) {
        throw new ApiError(400, "tweetId Not Found")
    }

    //delete tweet id
    const updateTweet = await Tweet.findByIdAndDelete(tweet?._id)
    if (!updateTweet) {
        throw new ApiError(500, "Failed to delete tweet")
    }

    return res
        .status(200)
        .json(new ApiResponse(
            200,
            {},
            "Tweet Deleted Successfully"
        ))
})

const getUserTweets = asyncHandler(async (req, res) => {
    //get userId
    //check vlaid userId
    //pipeline stages
    //1. get ownerdetails
    //2. likes deatails
    //3. projcect

    const { userId } = req.params
    if (!isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid userId")
    }

    const user = await User.findById(userId)
    if (!user) {
        throw new ApiError(400, "UserId Not Found")
    }

    const tweetAggregate = await Tweet.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(userId)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "ownerDetails",
                pipeline: [
                    {
                        $project: {
                            username: 1,
                            avatar: 1,
                            email: 1,
                        }
                    }
                ]
            }
        },
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "tweet",
                as: "likesDetails",
                pipeline: [
                    {
                        $project: {
                            likedBy: 1
                        }
                    }
                ]
            }
        },
        {
            $addFields: {
                likesCount: {
                    $size: "$likesDetails"
                },
                ownerDetails: {
                    $first: "$ownerDetails"
                },
                isLiked: {
                    $cond: {
                        if: {
                            $in: [req.user?._id, "$likesDetails.likedBy"]
                        },
                        then: true,
                        else: false
                    }
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
                content: 1,
                ownerDetails: 1,
                likesCount: 1,
                createdAt: 1,
                isLiked: 1
            }
        }
    ])

    if (!tweetAggregate.length) {
        throw new ApiError(400, "Failed to fetced user tweets")
    }

    return res
        .status(200)
        .json(new ApiResponse(
            200,
            tweetAggregate,
            "Tweets Fetched Successfully"
        ))
})

export {
    createTweet,
    updateTweet,
    deleteTweet,
    getUserTweets
}