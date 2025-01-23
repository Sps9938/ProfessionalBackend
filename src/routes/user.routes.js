import { Router } from "express";
import { registerUser } from "../controllers/user.controller.js";

import { upload } from "../middlewares/multer.middlewares.js";

const router = Router()

router.route("/register").post(
    //midddleware import
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        },
        {
            name: "converImage",
            maxCount: 1
        }
    ]),
    registerUser
)

export { router }