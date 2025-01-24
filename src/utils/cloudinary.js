import { v2 as cloudinary } from "cloudinary"
import { response } from "express";

import fs from "fs"

// import path from "path"

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadOnCloudinary = async (localFilePath) => {

    // localFilePath=path.resolve("localFilePath")
    // console.log(`lacal file path: ${localFilePath.url}`);
    
    try {
        if (!localFilePath) return null
        //upload the file on cloudinary
        const uploadResponse = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        })        
        //file has been uploaded sucessfully 
        // console.log("file is uploaded on cloudinary", uploadResponse.url);
        // console.log(response.url);

        fs.unlinkSync(localFilePath);
        return uploadResponse;
    } catch (error) {
        fs.unlinkSync(localFilePath) //remove the loacally save temprory file
        //operation got failed
        
        return null;
    }
}

export {uploadOnCloudinary}