//requiring 3rd party modules
const mongoose = require("mongoose");

//declaring model for posts
const postSchema = mongoose.Schema({
    title: {
        type: String,
        required: [true,"Phone Number required"],
    },
    description: {
        type: String,
        required: true
    },
    featured_image: {
        type: String,
        required: true
    },
    images: [
        {
            type: String,      
        }
    ],
    _creator:{
        type: mongoose.Types.ObjectId,
        required: [true, "User should be logged in to create post"]
    },
    _created_at:{
        type: Date,
        default: Date.now
    }

});


const Post = mongoose.model("Post", postSchema);
module.exports = Post;