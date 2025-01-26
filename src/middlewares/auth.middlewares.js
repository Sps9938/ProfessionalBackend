import jwt from "jsonwebtoken"
import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import {User} from "../models/user.models.js"








export const verifyJWT = asyncHandler (async (req, _, next) => {
    // console.log("Entry in Authorization middleware");
    
    
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer", "").trim()
        // console.log(token);
        
        if( !token )
        {
            throw new ApiError(401, "Unauthorized request")
        }
    
        let decodedToken;
        try {
            decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        } catch (error) {
            throw new ApiError(401, "Invalid access token");
        }

    
        const user = await User.findById(decodedToken?._id).select("-password, -refreshToken")
        // console.log(user);
        
        if( !user )
        {
            throw new ApiError (401, "Invalid Access Token")
        }
        req.user = user;
        next();
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid access token")
    }
     

})