import express from "express"

import cors from "cors"

import cookieParser from "cookie-parser"

const app = express()

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

app.use(express.json({limit: "16kb"}))

app.use(express.urlencoded({extended: true, limit: "16kb"}))

app.use(express.static("public"))

app.use(cookieParser())

 //routes import
 import userRouter from './routes/user.routes.js'; // Named import

 import videoRouter from "./routes/video.routes.js";

 import playlistRouter from "./routes/playlist.routes.js"

 import likedRouter from "./routes/like.routes.js"

 import commentedRouter from "./routes/comment.routes.js"


 import subscribedRouter from "./routes/subscription.routes.js"
 //routes declaration
 app.use("/api/v1/users", userRouter);
 app.use("/api/v1/video", videoRouter);
 app.use("/api/v1/playlist", playlistRouter);
 app.use("/api/v1/likes", likedRouter)
 app.use("/api/v1/comments", commentedRouter)
 app.use("/api/v1/subscription", subscribedRouter)

//  http://localhost:8000/api/v1/users/register

export { app } 