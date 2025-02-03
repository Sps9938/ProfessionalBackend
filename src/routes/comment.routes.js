
import { verifyJWT } from "../middlewares/auth.middlewares.js";
import { upload } from "../middlewares/multer.middlewares.js";

import { Router } from "express";
import { 
    addComment,
    deleteComment,
    updateCommet
 } from "../controllers/comment.controller.js";

const router = Router()

router.use(verifyJWT)
router.use(upload.none())

router.route("/add/comment/:videoId").patch(addComment)

router.route("/update/comment/:commentId").post(updateCommet)

router.route("/delete/comment/:commentId").delete(deleteComment)
export default router