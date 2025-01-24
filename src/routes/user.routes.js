import { Router } from "express";
import { registerUser } from "../controllers/user.controller.js";

import { upload } from "../middlewares/multer.middlewares.js";
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

export { router }