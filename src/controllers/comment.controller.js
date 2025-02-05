import { Comment } from "../models/comment.models.js";
import mongoose, { isValidObjectId } from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Like } from "../models/like.models.js";
import { Video } from "../models/video.models.js";
const addComment = asyncHandler(async (req, res) => {
    //get videoId->which video that you want to comment
    //check valid videoId
    //update comment section and add comment 

    const { videoId } = req.params
    const { content } = req.body
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid videoId")
    }

    const video = await Video.findById(videoId)
    if (!video) {
        throw new ApiError(400, "videoId Not Found")
    }

    if (!content) {
        throw new ApiError(400, "content field required")
    }

    const updateComment = await Comment.create({
        content,
        video: videoId,
        owner: req.user?._id
    })

    if (!updateComment) {
        throw new ApiError(500, "failed to add comment please try again")
    }
    return res
        .status(200)
        .json(new ApiResponse(
            200,
            { comment: content },
            "commented on video Successfully"


        ))
})

const updateCommet = asyncHandler(async (req, res) => {
    //get commetId
    //check valid comment id
    //get contnt
    //update your comment in your content field
    const { commentId } = req.params
    const { content } = req.body

    if (!isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid commentId")
    }

    const comment = await Comment.findById(commentId)
    if (!comment) {
        throw new ApiError(400, "commentId Not Found")
    }
    if (!content) {
        throw new ApiError(400, "content field required")
    }
    const updateComment = await Comment.findByIdAndUpdate(
        // commentId
        comment?._id,
        {
            $set: {
                content
            }
        },
        { new: true }

    )
    if (!updateComment) {
        throw new ApiError(500, "Failed to update the comment please try again")
    }
    return res
        .status(200)
        .json(new ApiResponse(
            200,
            { content: content },
            "comment updated Successfully"
        ))

})
const deleteComment = asyncHandler(async (req, res) => {
    //get commentid
    //check validId
    //then delete the comment
    const { commentId } = req.params
    if (!isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid commentId")
    }
    const comment = await Comment.findById(commentId)
    if (!comment) {
        throw new ApiError(400, "commentId Not Found")
    }

    const updateComment = await Comment.findByIdAndDelete(comment?._id)
    if (!updateComment) {
        throw new ApiError(400, "comment Deleted Successfully")
    }

    return res
        .status(200)
        .json(new ApiResponse(
            200,
            {},
            "comment Deleted Successfully"
        ))
})

const getVideoCommets = asyncHandler(async (req, res) => {
    //get videoId
    //check valid videoId
    //used pipedline stages
    const { videoId } = req.params
    const { page = 1, limit = 10 } = req.query
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid videoId")
    }

    const video = await Video.findById(videoId)
    if (!video) {
        throw new ApiError(400, "videoId Not Found")
    }

    const commentsAggregate = Comment.aggregate([
        {
            $match: {
                video: new mongoose.Types.ObjectId(videoId)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owners"
            }
        },
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "comment",
                as: "likes"
            }
        },
        {
            $addFields: {
                likesCount: {
                    $size: "$likes"
                },
                owner: {
                    $first: "$owners"
                },
                isLiked: {
                    $cond: {
                        if: { $in: [req.user?._id, "$likes.likedBy"] },
                        then: true,
                        else: false
                    }
                }
            }
        },
        {
            $sort: {
                createdAt: -1,

            }
        },
        {
            $project: {
                content: 1,
                createdAt: 1,
                likesCount: 1,
                owner: {
                    username: 1,
                    fullname: 1,
                    avatar: 1

                },
                isLiked: 1
            }
        }
    ])

    // console.log((await commentsAggregate).length);
    if (!(await commentsAggregate).length) {
        throw new ApiError(500, "Failed to Aggregte pipeple")
    }
    const options = {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10)
    }



    const comments = await Comment.aggregatePaginate(commentsAggregate, options)

    // console.log(comments.page);
    // console.log(comments.totalDocs);
    
    if (!comments.totalDocs) {
        throw new ApiError(500, "Failed to get video comments please try again")
    }

    return res
        .status(200)
        .json(new ApiResponse(
            200,
            comments,
            "comments Fetched Sucessfully"
        ))
})

export {
    addComment,
    updateCommet,
    deleteComment,
    getVideoCommets
}