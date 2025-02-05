import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middlewares.js";
// import { upload } from "../middlewares/multer.middlewares.js";
import { createTweet, deleteTweet, getUserTweets, updateTweet } from "../controllers/tweet.controller.js";

const router = Router()

router.use(verifyJWT)


router.route("/create-tweet").post(createTweet)

router.route("/update/tweet/:tweetId").patch(updateTweet)

router.route("/delete/tweet/:tweetId").delete(deleteTweet)

router.route("/get/user/tweets/:userId").get(getUserTweets)
export default router