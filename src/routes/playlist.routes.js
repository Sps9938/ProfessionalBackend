import { Router } from "express";
import { upload } from "../middlewares/multer.middlewares.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js"
import {
    addVideoOnPlaylist,
    createPlaylist,
    deletePlaylist,
    updatePlaylist
} from "../controllers/playlist.controller.js"



const router = Router()

router.use(verifyJWT, upload.none())

router.route("/create-playlist").post(createPlaylist)

router.route("/update/playlist/:playlistId").patch(updatePlaylist)
router.route("/delete/playlist/:playlistId").delete(deletePlaylist)
router.route("/add/:playlistId/:videoId").patch(addVideoOnPlaylist)

export default router