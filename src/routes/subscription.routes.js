import { 
    toggleSubscription
} from "../controllers/subscription.controller.js"

import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middlewares.js";

const router = Router();

router.use(verifyJWT); 
// Apply verifyJWT middleware to all routes in this file


router.route("/toggle/subscription/:channelId").patch(toggleSubscription)

export default router;
