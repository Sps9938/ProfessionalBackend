import { upload } from "../middlewares/multer.middlewares.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";

import { Router } from "express";
import {
    getLikedVideos,
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike
}
    from "../controllers/like.controller.js";

const router = Router()

router.use(verifyJWT)


router.route("/toggle/like/:videoId").patch(toggleVideoLike)

router.route("/toggle/like/comment/:commentId").patch(toggleCommentLike)

router.route("/toggle/like/tweet/:tweetId").patch(toggleTweetLike)

router.route("/get-likedvideos").get(getLikedVideos)

export default router