import { Router } from "express";
import { upload } from "../middlewares/multer.middlewares.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";
import {
    getAllVideos,
    getVideoById,
    publishAVideo,
} from "../controllers/video.controller.js";

const router = Router();

// router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

router.route("/")
.post(verifyJWT,
    upload.fields([
        {
            name: "videoFile",
            maxCount: 1
        },
        {
            name: "thumbnail",
            maxCount: 1
        }
    ]),
    publishAVideo
);

router.route("/").get(getAllVideos);

router.route("/v/:videoId").get(verifyJWT, getVideoById)

export default router;