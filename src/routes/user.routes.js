import { Router } from "express";
import {
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
} from "../controllers/user.controller.js";

import { upload } from "../middlewares/multer.middlewares.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";
import { ApiError } from "../utils/ApiError.js";

const router = Router()

router.route("/register").post(
    //midddleware import
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        },
        {
            name: "coverImage",
            maxCount: 1
        }
    ]),
    registerUser
)

router.route("/login").post(loginUser)

//secured routes
router.route("/logout").post(verifyJWT, logoutUser)

router.route("/refresh-token").post(refreshAccessToken)

router.route("/change-password").post(verifyJWT, changeCurrentPassword)
router.route("/forget-password").post(verifyJWT, forgetUserPassword)
router.route("/current-user").get(verifyJWT, getCurrentUser)
router.route("/update-user-details").post(verifyJWT, updateUserAccountDetails)

router.route("/update-avatar").patch(
    verifyJWT,
    upload.single("avatar"),
    updateUserAvatar
)
router.route("/update-coverImage").patch(
    verifyJWT,
    upload.single("coverImage"),
    updatecoverImage
)
router.route("/c/:username").get(verifyJWT, getUserChannelProfile)

router.route("/history").get(verifyJWT, getWatchHistory)
export { router }