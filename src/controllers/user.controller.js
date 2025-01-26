import { asyncHandler } from "../utils/asyncHandler.js"

import { ApiError } from "../utils/ApiError.js"

import { User } from "../models/user.models.js"

import { uploadOnCloudinary } from "../utils/cloudinary.js"
import bcrypt from "bcrypt";
import { ApiResponse } from "../utils/ApiResponse.js"

const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()
        user.refreshToken = refreshToken

        await user.save({ validateBeforeSave: false })
        // console.log(user.refreshToken);

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


    const avatarLocalPath = req.files?.avatar[0]?.path;
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

    console.log("Generated sucessfully");

    /*send cookies */
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken ")
    // console.log(loggedInUser);

    const options = {
        httpOnly: true,
        secure: true
    }


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
        .clearCookie("refreshToken",options)
        .json(new ApiResponse(200, "User logged Out"))
})

export {
    registerUser,
    loginUser,
    logoutUser
}