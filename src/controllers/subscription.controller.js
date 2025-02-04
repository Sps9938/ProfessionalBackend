import { Subscriptions } from "../models/subscription.models.js";
import mongoose, { isObjectIdOrHexString } from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const toggleSubscription = asyncHandler(async (req, res) => {
    //get channelId->userId that you want to subscribed
    //check valid channelId
    //chck before you are subscribed or not
    //if subscribed
    //  1. add subscriber->user id
    //  2. add channelid

    //if not subscribed then remove userid in subscription ->toggel it

    const { channelId } = req.params
    if (!isObjectIdOrHexString(channelId)) {
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


export {
    toggleSubscription
}
