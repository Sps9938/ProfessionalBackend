import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middlewares.js";
import { getChannelStats, getChannelVideos } from "../controllers/dashboard.controller.js";

const router = Router();

router.use(verifyJWT);

router.route("/get-channelStats").get(getChannelStats)


router.route("/get-channel-videos").get(getChannelVideos)

export default router