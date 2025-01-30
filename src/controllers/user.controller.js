import { asyncHandler } from "../utils/asyncHandler.js"

import { ApiError } from "../utils/ApiError.js"

import { User } from "../models/user.models.js"

import { uploadOnCloudinary } from "../utils/cloudinary.js"
import bcrypt from "bcrypt";
import { ApiResponse } from "../utils/ApiResponse.js"

import jwt from "jsonwebtoken"
import mongoose from "mongoose";

const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()
        user.refreshToken = refreshToken

        await user.save({ validateBeforeSave: false })
        // console.log(refreshToken);


        return { accessToken, refreshToken }

    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating refresh and access token")
    }

}

const registerUser = asyncHandler(async (req, res) => {

    //get user details from frontend
    //validation - not empty
    //check if user already exists: username, email
    //check for images, check for avatar
    //upload them to cloudinary, avatar
    //create user object - create entry in db
    //remove password and refresh token field from response
    //check for user creation
    //return response

    /*getting user details */

    const { fullname, email, username, password } = req.body
    // console.log("email: ", email);

    /* check empty condition */

    // if(fullname === "") {  
    //     throw new ApiError(400, "fullname is required")
    // }

    //??-> extract
    if (
        [fullname, email, username, password].some((field) => (field ?? "").trim() === "")
    ) {
        throw new ApiError(400, "All fields are required");
    }


    /* check either username or email exist or not */

    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    })
    if (existedUser) {
        throw new ApiError(409, "User with email or username already exists")
    }



    /* check avatar and images Uploaded Sucessfully or  not */


    let avatarLocalPath;
    if (req.files && Array.isArray(req.files.avatar) && req.files.avatar.length > 0) {
        avatarLocalPath = req.files.avatar[0].path
    }
    // console.log(avatarLocalPath);

    // const coverImageLocalPath = req.files?.coverImage[0]?.path;
    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path
    }
    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required")
    }

    /* then upload them cloudinary */

    const avatar = await uploadOnCloudinary(avatarLocalPath)

    const coverImage = await uploadOnCloudinary(coverImageLocalPath)
    // console.log(avatar);

    if (!avatar) {
        throw new ApiError(400, "Avatar file is required on Cloudinary")

    }

    /* create user object - create entry in db */

    const user = await User.create({
        fullname,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()
    })

    /* remove password and refresh token field from response */

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    /* check for user creation */

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user")
    }

    /* return response */

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered Sucessfully")
    )

})

const loginUser = asyncHandler(async (req, res) => {
    //req.body
    //user name or email
    //find user
    //password check
    //access and refresh token generate
    //send cookie
    //send response
    /* get user detiails */
    const { email, username, password } = req.body
    // console.log(email);

    if (!(username || email)) {
        throw new ApiError(400, "username or email is required");
    }
    /* check username or email exist or not */
    //here we forget to using await keyword 
    const user = await User.findOne({
        $or: [{ username }, { email }]
    })
    if (!user) {
        throw new ApiError(404, "User does not exist")
    }
    // console.log(password);

    /* check password correct or not */
    const isPasswordValid = await user.isPasswordCorrect(password)

    // console.log(isPasswordValid);

    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid user Password")
    }
    /*generate access and refresh token */
    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id)
    // console.log({accessToken});
    // console.log({refreshToken});



    // console.log("Generated sucessfully");

    /*send cookies */
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken ")
    // console.log(loggedInUser);

    const options = {
        httpOnly: true,
        secure: true
    }

    // console.log(req.cookies.refreshToken);
    // console.log(req.cookies.accessToken);


    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    user: loggedInUser, accessToken,
                    refreshToken
                },
                "User logged in Sucessfully"
            )
        )

})

const logoutUser = asyncHandler(async (req, res) => {

    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined

            }
        },
        {
            new: true
        }
    )
    const options = {
        httpOnly: true,
        secure: true
    }

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, "User logged Out"))
})

const refreshAccessToken = asyncHandler(async (req, res) => {
    // console.log(req.cookies.refreshToken);
    // console.log(req.cookies.accessToken);
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if (!incomingRefreshToken) {
        throw new ApiError(401, "Unauthorized request, refreshToken is not available on cookies")
    }
    try {
        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)

        const user = await User.findById(decodedToken?._id)

        if (!user) {
            throw new ApiError(401, "Invalid refresh Token")
        }

        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Refresh token is expired or used")
        }

        const options = {
            httpOnly: true,
            secure: true
        }
        const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id)
        // console.log(refreshToken);

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)
            .json(
                new ApiResponse(
                    200,
                    {
                        accessToken, refreshToken
                    },
                    "Login Sucessfullry With refresh Token"

                )
            )
    } catch (error) {
        throw new ApiError(401, "Invalid refresh Token on decodedToken Part")
    }

})

const changeCurrentPassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword, renewPassword } = req.body
    if (newPassword !== renewPassword) {
        throw new ApiError(401, "newPassword is not Match with renewPassword")
    }
    const user = await User.findById(req.user?._id)

    // console.log(user);

    // console.log("user object has generated Successfully");


    //to check user object->password and refreshtoeken are not mentioned
    if (!user) {
        throw new ApiError(401, "User Not Found")
    }
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)
    if (!isPasswordCorrect) {
        throw new ApiError(401, "Invalid old Password")

    }
    user.password = newPassword

    await user.save({ validateBeforeSave: false })

    return res
        .status(200)
        .json(new ApiResponse(
            200,
            {},
            "Password changed Sucessfully"
        ))
})

//khud sai forget Password ka controller banao
const forgetUserPassword = asyncHandler(async (req, res) => {
    const { username, email, newPassword, renewPassword } = req.body
    // if(!user && !email)
    if (!(username || email)) {
        throw new ApiError(401, "username or email required")
    }
    //check user or email match with user Database
    const user = await User.findById(req.user?._id)
    if (!((user.username === username) || (user.email === email))) {
        throw new ApiError(401, "User Not Found,Enter Corret username or email")
    }

    if (newPassword !== renewPassword) {
        throw new ApiError(401, "oldPassword is not Match with renewPassword")
    }
    //this line indicate that ,you should carry to change your currentPassword
    user.password = newPassword

    user.save({ validateBeforeSave: false })

    return res
        .status(200)
        .json(new ApiResponse(
            200,
            {},
            "User changed Password Successfull with the help of ForgetPassword"
        ))

})

const getCurrentUser = asyncHandler(async (req, res) => {
    // const user = await User.findById(req.user?._id)
    // if(!user)
    // {
    //     throw new ApiError(401, "User NOt Found")
    // }
    const user = await User.findById(req.user?._id).select("-password")
    return res
        .status(200)
        .json(new ApiResponse(
            200,
            user,
            "Current User Fetched Succesfully"
        ))
})

const updateUserAccountDetails = asyncHandler(async (req, res) => {
    const { fullname, email } = req.body
    // console.log(fullname);
    // console.log(email);



    if (!fullname || !email) {
        throw new ApiError(401, "fullname or email required, fill it")
    }
    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                fullname,
                email
            }
        },
        { new: true }
    ).select("-password")

    return res
        .status(200)
        .json(new ApiResponse(
            200,
            {},
            "User Details Updated Successfully"
        ))
})

const updateUserAvatar = asyncHandler(async (req, res) => {


    const avatarLocalPath = req.file?.path
    // console.log(avatarLocalPath);

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is missing")
    }
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    if (!avatar.url) {
        throw new ApiError(400, "Avatar files is not Uploading on Cloudinnary")
    }


    await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                avatar: avatar.url
            }
        },
        { new: true }
    )

    return res
        .status(200)
        .json(new ApiResponse(
            200,
            {},
            "Your Avatar Update Successfully"
        ))


})

const updatecoverImage = asyncHandler(async (req, res) => {
    const coverImageLocalPath = req.file?.path
    console.log(coverImageLocalPath);

    if (!coverImageLocalPath) {
        throw new ApiError(400, "CoverImage is requred")
    }
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)
    if (!coverImage.url) {
        throw new ApiError(400, "Error while uploaing on Cloudinary")
    }
    await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                coverImage: coverImage.url
            }
        },
        { new: true }
    )
    return res
        .status(200)
        .json(new ApiResponse(
            200,
            {},
            "CoverImage update Successfully"
        ))
})


/*add aggrigate pipelines */
const getUserChannelProfile = asyncHandler(async (req, res) => {
    const { username } = req.params
    if (!username?.trim()) {
        throw new ApiError(400, "Username is missing")
    }

    const channel = await User.aggregate([
        //check username is availble or not
        {
            $match: {
                username: username?.toLowerCase()
            }
        },
        //to find subscribers
        {
            $lookup: {
                from: "subscriptions",
                //check this id
                localField: "_id",
                //check where you want to searching
                foreignField: "channel",
                as: "subsribers"

            }

        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "subscriber",
                as: "subscribedTo"
            }
        },
        {
            $addFields: {
                countSubscribers: {
                    $size: "$subsribers"
                },
                countSubscribedTo: {
                    $size: "$subscribedTo"
                },
                isSubscribed: {
                    $cond: {
                        if: { $in: [req.user?._id, "$subsribers.subscriber"] },
                        then: true,
                        else: false
                    }
                }
            }
        },
        {
            $project: {
                fullname: 1,
                username: 1,
                countSubscribers: 1,
                countSubscribedTo: 1,
                isSubscribed: 1,
                avatar: 1,
                coveImage: 1,
                email: 1

            }
        }


    ])

    if (!channel?.length) {
        throw new ApiError(400, "Channel doesn't exist")
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                channel[0],
                "User channel fetched Successfully"
            )
        )


})

const getWatchHistory = asyncHandler(async (req, res) => {
    const user = await User.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(req.user._id)

            },

        },
        {
            $lookup: {
                from: "videos",
                localField: "watchHistory",
                foreignField: "_id",
                as: "watchHistory",
                pipeline: [
                    {
                        $lookup: {
                            from: "user",
                            localField: "owner",
                            foreignField: "_id",
                            as: "owner",
                            pipeline: [
                                {
                                    $project: {
                                        fullname: 1,
                                        username: 1,
                                        avatar: 1
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields: {
                            owner: {
                                $first: "$owner"
                            }
                        }
                    }
                ]

            }
        }
    ])
    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                user[0].watchHistory,
                "Watch History Fetched Successfully"
            )
        )
})



export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    forgetUserPassword,
    getCurrentUser,
    updateUserAccountDetails,
    updateUserAvatar,
    updatecoverImage,
    getUserChannelProfile,
    getWatchHistory
}