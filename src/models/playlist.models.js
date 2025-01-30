import mongoose, {Schema} from "mongoose";

const playlistSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        videos: {
            type: Schema.Types.ObjectId,
            ref: "Video",
        },
        //creater->who create the playlis
        owner: {
            type: Schema.Types.ObjectId,
            ref: "User",
        },


    }, {timeestamps: true}
)

export const Playlist = mongoose.model("Playlist", playlistSchema)