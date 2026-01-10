const mongoose = require("mongoose");
const { Schema } = mongoose;

const commentSchema = new Schema({
    post: {
        type: Schema.Types.ObjectId,
        ref: "Post",
        required: true
    },
    author: {
        type: Schema.Types.ObjectId,
        ref: "user",
        required: true
    },
    content: {
        type: String,
        required: true,
        maxLength: 2000
    },
    likes: [{
        type: Schema.Types.ObjectId,
        ref: "user"
    }],
    replies: [{
        type: Schema.Types.ObjectId,
        ref: "Comment"
    }],
    parentComment: {
        type: Schema.Types.ObjectId,
        ref: "Comment"
    }
}, {
    timestamps: true
});

const Comment = mongoose.model("Comment", commentSchema);
module.exports = Comment