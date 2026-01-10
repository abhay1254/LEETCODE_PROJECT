const mongoose = require("mongoose");
const { Schema } = mongoose;

const postSchema = new Schema({
    author: {
        type: Schema.Types.ObjectId,
        ref: "user",
        required: true
    },
    content: {
        type: String,
        required: true,
        maxLength: 5000
    },
    title: {
        type: String,
        maxLength: 200
    },
    tags: [{
        type: String
    }],
    likes: [{
        type: Schema.Types.ObjectId,
        ref: "user"
    }],
    comments: [{
        type: Schema.Types.ObjectId,
        ref: "Comment"
    }],
    isEdited: {
        type: Boolean,
        default: false
    },
    relatedProblem: {
        type: Schema.Types.ObjectId,
        ref: "problem"
    }
}, {
    timestamps: true
});

const Post = mongoose.model("Post", postSchema);
module.exports = Post;

