// require('dotenv).config{path: './env})

import dotenv from "dotenv"
import connectDB from "./db/index.js"

// import mongoose from "mongoose";
// import { DB_NAME } from "./constants";

dotenv.config({
    path: './env'
})


connectDB()
.then(() => {
    app.listen(process.env.PORT || 8000, () => {
        console.log(`Server is running at port : ${process.env.PORT}`);
        
    })
})
.catch((err) => {
    console.log("MONGO db connection Failed !!! ", err);
    
    
})
//after asynchronous complete then it technically returns promise












/*
import express from "express"
const app = express()
( async () => {
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        app.on("error", (error) => {
            console.log("ERROR: ", error);
            throw error
        })
        
        app.listen(process.env.PORT, () => {
            console.log(`App is listning on port ${process.env.PORT}`);
        })
    }
     catch (error) {

        console.log("ERROR: ", error)
        throw err
        
        
    }
})()
*/