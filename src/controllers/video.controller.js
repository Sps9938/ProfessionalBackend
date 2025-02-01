import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.models.js"
import { User } from "../models/user.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { getWatchHistory } from "./user.controller.js";

//get all videos based on query, sort, pagination
const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    console.log(req.query);

    //Full-text search(optional) by title and description
    //Filtering by userId(optional)
    //Filter only published videos
    //Sorting based on query parameters(sortBy, sortType)
    //Lookup for user details (like username, and avatar)
    //Pagination with aggregatePageinate
    //Respond with a paginated list of videos

    const pipeline = [];
    /*
        1. $search: MongoDB's Atlas full-text search feature.

        2. index: "search-videos": Refers to a pre-defined text search index in MongoDB.

        3. text: { query: query, path: ["title", "description"] }: Searches for the query in the title and description fields of video documents.
    */
    if (query) {
        pipeline.push({
            $search: {
                index: "search-videos",
                text: {
                    query: query,
                    path: ["title", "description"]//search only on title desciption
                }
            }
        })
    }

    /*
    1. If userId is provided → Returns only that user's uploaded videos.

    2. If userId is NOT provided → Returns all published videos from all users.

    3. No authentication (verifyJWT) is required, so anyone can access this API
    */
    if (userId) {
        if (!isValidObjectId(userId)) {
            //isValidObjectId(userId) is a built-in Mongoose function that checks whether a given userId is a valid MongoDB ObjectId.
            throw new ApiError(400, "Invalid userId")
        }

        pipeline.push({
            $match: {

                owner: new mongoose.Types.ObjectId(userId)

            }
        })
    }

    //$match filters the documents where isPublished is true, ensuring only published videos are returned.
    pipeline.push({ $match: { isPublished: true } })


    /*
    1. $sort: Sorts the results based on the sortBy field (like views, createdAt, etc.).

    2.sortType === "asc" ? 1 : -1: Determines the sort direction (1 for ascending, -1 for descending).

    3. If no sortBy or sortType is provided, it defaults to sorting by createdAt in descending order (-1).
    */
    if (sortBy && sortType) {
        pipeline.push({
            $sort: {
                [sortBy]: sortType === "asc" ? 1 : -1
            }
        })
    }
    else {
        pipeline.push({
            $sort: {
                createdAt: -1
            }
        })
    }


    /*
    1. $lookup joins the videos collection with the users collection.

    2. It finds the matching users._id where videos.owner = users._id.

    3. The matching user details are added to a new field called ownerDetails.

    */
    pipeline.push(
        {
            $lookup: {
                from: "users", // Join with the "users" collection
                localField: "owner",// Field in the video document
                foreignField: "_id", // Match with the `_id` in the "users" collection
                as: "ownerDetails",// Store the joined data in "ownerDetails" array
                pipeline: [
                    {
                        $project: {
                            username: 1,
                            avatar: 1
                        }
                    }
                ]

            }
        },
        {
            $unwind: "$ownerDetails"
        }
    )

    if (!pipeline.length) {
        throw new ApiError(400, "Aggregate pipeline is empty, Please add valid stages!!!")
    }
    const videoAggregate = Video.aggregate(pipeline)
    const options = {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10)
    }
    const video = await Video.aggregatePaginate(videoAggregate, options)

    return res
        .status(200)
        .json(new ApiResponse(
            200,
            video,
            "Video fetched Sucessfully"
        ))

})

//get video, upload to cloudinary, create video
const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description } = req.body
    if (
        [title, description].some((field) => (field ?? "").trim() === "")
    ) {
        throw new ApiError(400, "All fields are required");
    }

    let videoFileLocalPath;

    if (req.files && Array.isArray(req.files.videoFile) && req.files.videoFile.length > 0) {
        videoFileLocalPath = req.files.videoFile[0].path
    }

    let thumbnailLocalPath;

    if (req.files && Array.isArray(req.files.thumbnail) && req.files.thumbnail.length > 0) {
        thumbnailLocalPath = req.files.thumbnail[0].path
    }

    if (!videoFileLocalPath) {
        throw new ApiError(400, "videoFileLoclaPath is required");
    }
    if (!thumbnailLocalPath) {
        throw new ApiError(400, "thumbnailLocalPath is required");
    }

    const videoFile = await uploadOnCloudinary(videoFileLocalPath);
    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);

    if (!videoFile) {
        throw new ApiError(401, "Video file is Not Found while uploading on cloudinary");
    }

    if (!thumbnail) {
        throw new ApiError(401, "thumbnail is not Found While uploading on cloudinary")
    }

    const video = await Video.create({
        title,
        description,
        duration: videoFile.duration,
        videoFile: videoFile.url,
        thumbnail: thumbnail.url,
        owner: req.user?._id,
        isPublished: true
    });

    const videoUploaded = await Video.findById(video._id);

    if (!videoUploaded) {
        throw new ApiError(401, "videoUploaded failed please try again");
    }

    return res
        .status(200)
        .json(new ApiResponse(
            200,
            video,
            "Video uploaded Successfully"
        ));


})

//get video by id

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    //1. videoId is provided and is a valid MongoDB ObjectId.
    //2. req.user?._id (authenticated user ID) is valid.
    //3. Check if videoId Exists & Fetch Video Details Using Aggregation Pipeline
    /*
        * using pipeline stages
        1. $match -> Filters documents based on the videoId

        2. $lookup->Fetches related data to check user interactions.
            -> Likes → Checks if the user has liked the video.

            -> Subscriptions → Determines if the user is subscribed to the video's owner.

            -> Subscribers Count → Counts total subscribers of the channel.

            -> Owner Details → Fetches relevant details of the video owner.

            -> Views → Ensures the view count is updated
         3. $project → Filters out unnecessary data and keeps only required fields.

    */
    //4. This steps ensure that user sucessfully watahed on this video ,update videoId->views and user wathHistory

    //5. return response

    //step 1
    console.log(videoId);
    
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "VideoId is not Extis")
    }

    //step 2
    if (!isValidObjectId(req.user?._id)) {
        throw new ApiError(400, "User Not Found , Plese SingIn Again")
    }

    //step 3

    const video = await Video.aggregate([
        {
            $match: {
                //Filters the collection to return only the video document that matches videoId
                _id: new mongoose.Types.ObjectId(videoId)
            }
        },
        {
            $lookup: {
                //Joins the likes collection where video field in likes collection matches _id of Video.
                from: "likes",
                localField: "_id",
                foreignField: "video",
                as: "likes"
            }
        },
        {
            $lookup: {
                //Joins the users collection to fetch the video owner's details.
                from: "users",
                localField: "owner",
                foreignField: "_id",
                /*
                -> localField: "owner" → This field exists in the videos collection and stores the reference (user ID).

                -> foreignField: "_id" → The field in the users collection that we match with (_id).

                */

                as: "owner",
                pipeline: [
                    {
                        //Fetches all subscriptions where channel field matches the owner's _id.
                        $lookup: {
                            from: "subscriptions",
                            localField: "_id",
                            foreignField: "channel",
                            as: "subscribers"

                        }
                    },
                        {
                        $addFields: {
                            countSubscribers: {
                                $size: "$subscribers"
                            },
                            isSubscribed: {
                                $cond: {
                                    if: {
                                        $in: [
                                            req.user?._id,
                                            "$subscribers.subscriber"]},
                                        then: true,
                                        else: false
                                }
                            }
                        }
                    },
                    {
                        $project: {
                            username: 1,
                            avatar: 1,
                            countSubscribers: 1,
                            isSubscribed: 1
                        }
                    }
                        
                    
                ]
            }
        },
        {
            $addFields: {
                likesCount: {
                    $size: "$likes"
                },
                owner: {
                    $first: "$owner"
                },
                isLiked: {
                    $cond: {
                        if: {$in: [
                            req.user?._id,
                            "$likes.likedBy"
                        ]},
                        then: true,
                        else: false
                    }
                }

            }
        },
        {
            $project: {
                videoFile: 1,
                title: 1,
                description: 1,
                views: 1,
                createdAt: 1,
                duration: 1,
                Comment: 1,
                owner: 1,
                likesCount: 1,
                isLiked: 1
            }
        }
    ])

    if(!video)
    {
        throw new ApiError(500, "failed to fetch video on server site, please try againg")
    }
    //update views and watchHistory
    await Video.findByIdAndUpdate(
        videoId,
         {
        $inc: {
            views: 1
        }
    })

    await User.findByIdAndUpdate(req.user?._id, {
        $addToSet: {
            getWatchHistory: videoId
        }
    })

    return res
    .status(200)
    .json(new ApiResponse(
        200,
        video[0],
        "Video details Fetched Successfully"
    ))
   
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: update video details like title, description, thumbnail

})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}