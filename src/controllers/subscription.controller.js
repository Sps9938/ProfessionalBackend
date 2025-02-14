import { Subscriptions } from "../models/subscription.models.js";
import mongoose, { isValidObjectId } from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const toggleSubscription = asyncHandler(async (req, res) => {
    //get channelId->userId that you want to subscribed
    //check valid channelId
    //chck before you are subscribed or not
    //if you have subscribed
    //  1. add subscriber->user id
    //  2. add channelid

    //if you have not subscribed then remove the userid in subscription ->toggel it

    const { channelId } = req.params
    if (!isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid channelId")
    }

    const subscribedAlready = await Subscriptions.findOne({
        subscriber: req.user?._id,
        channel: channelId
    })

    if (subscribedAlready) {
        await Subscriptions.findByIdAndDelete(subscribedAlready?._id)

        return res
            .status(200)
            .json(new ApiResponse(
                200,
                { isSubscribed: false },
                "Unsubscribed Successfully"
            ))

    }
    const updateSubscribed = await Subscriptions.create({
        subscriber: req.user?._id,
        channel: channelId
    })

    return res
    .status(200)
    .json(new ApiResponse(
        200,
        {isSubscribed: true},
        "subscribed successfully"
    ))
})

//Todo->again pratice those all things that i was facing problems like->understandeing the purpose of this controller
const getUserChannelSubscribers = asyncHandler(async(req, res) => {
    const {channelId} = req.params
    if(!isValidObjectId(channelId))
    {
        throw new ApiError(400, "Invalid channelId")
    }
    // channelId = new mongoose.Types.ObjectId(channelId);
    // const channel = await Subscriptions.channel.findById(channelId)
    // if(!channel)
    // {
    //     throw new ApiError(400, "Channel Not Found")
    // }
    const subscribersAggregate = await Subscriptions.aggregate([
        {
            $match: {
                channel: new mongoose.Types.ObjectId(channelId)
            }
        },
        {
            $lookup: {
                //it behaves to store subscribers->sub1,sub2,sub3......
                from: "users",
                localField: "subscriber",
                foreignField: "_id",
                as: "subscribers",
                pipeline: [
                    {
                        //it behave user details who are subscribed that channel->user1,user2,user3.....
                        $lookup: {
                            from: "subscriptions",
                            localField: "_id",
                            foreignField: "channel",
                            as: "subscribedToSubscriber" 
                        }
                    },
                    {
                        $addFields: {
                            subscribedToSubscriber: {
                            /*What is $subscribedToSubscriber?

                           -> It is an array of documents from "subscriptions", where the current user is a channel.

                           -> Each document in subscribedToSubscriber has a subscriber field (the user who subscribed to this person).*/


                                $cond: {
                                    if: {
                                        $in: [channelId, "$subscribedToSubscriber.subscriber"]
                                    },
                                    then: true,
                                    else: false
                                }
                            },
                            subscribersCount: {
                                $size: "$subscribedToSubscriber"
                            }
                        }
                    }

                ]

            }
        },
        {
            $unwind: "$subscriber"
        },
        {
            $project: {
                _id: 0,
                subscribers: {
                    _id: 1,
                    username: 1,
                    fullname: 1,
                    avatar: 1,
                    subscribedToSubscriber: 1,
                    subscribersCount: 1
                }

            }
        }
    ])

    console.log(subscribersAggregate.length);
    
    if(!subscribersAggregate.length)
    {
        throw new ApiError(500, "Failed Fetched subscribers")
    }
    return res
    .status(200)
    .json(new ApiResponse(
        200,
        subscribersAggregate,
        "subscribers fetched successfully"
    ))
   
})

//on the base of userId->who are subscribed -> take information 
const getsubscribedChannels = asyncHandler(async(req, res) => {
    /*
    It gets a list of channels that the user has subscribed to, including:

    Channel details (username, avatar, etc.)
    The latest video from each subscribed channel (if available)

    */
   const {subscriberId} = req.params
  if(!isValidObjectId(subscriberId))
   {
    throw new ApiError(400, "Invalid subscriberId")
   }

   const subscribedChannels = await Subscriptions.aggregate([
    {
        $match: {
            subscriber: new mongoose.Types.ObjectId(subscriberId)
        }
    },
    {
        $lookup: {
            from: "users",
            localField: "channel",
            foreignField: "_id",
            as: "subscribedChannel",
            pipeline: [
                {
                    $lookup: {
                        from: "videos",
                        localField: "_id",
                        foreignField: "owner",
                        as: "videos"
                    }
                    
                },
                {
                    $addFields: {
                        latestVideo: {
                            $last: "$videos"
                        }
                    }
                }
            ]
        }
    },
    {
        $unwind: "$subscribedChannel"
    },
    {
        $project: {
            _id: 0,
            subscribedChannel: {
                _id: 1,
                username: 1,
                fullname: 1,
                avatar: 1,
                latestVideo: {
                    _id: 1,
                    videoFile: 1,
                    thumbnail: 1,
                    owner: 1,
                    title: 1,
                    description: 1,
                    duration: 1,
                    createdAt: 1,
                    views: 1
                }
            }
        }
    }
   ])

   if(!subscribedChannels.length)
   {
    throw new ApiError(400, "Failed to Fatched subscribed channels")
   }
   return res
   .status(200)
   .json(new ApiResponse(
    200,
    subscribedChannels,
    "subscribedChannel Fetched Successfully"
   ))
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getsubscribedChannels
}
