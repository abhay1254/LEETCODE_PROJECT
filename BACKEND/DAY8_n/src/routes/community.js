// routes/community.js
const express = require("express");
const communityRouter = express.Router();
const redisauth = require("../middleware/redisauth");
const {
    createPost,
    getAllPosts,
    getPostById,
    getUserPosts,
    updatePost,
    toggleLikePost,
    addComment,
    updateComment,
    deleteComment,
    toggleLikeComment,
    deletePost,
    toggleFollowUser,
    getFollowers,
    getFollowing,
    searchPosts
} = require("../controllers/communityController");

// Post routes
communityRouter.post("/posts", redisauth, createPost);
communityRouter.get("/posts", redisauth, getAllPosts);
communityRouter.get("/posts/search", redisauth, searchPosts);
communityRouter.get("/posts/:postId", redisauth, getPostById);
communityRouter.get("/posts/user/:userId", redisauth, getUserPosts);
communityRouter.put("/posts/:postId", redisauth, updatePost);
communityRouter.delete("/posts/:postId", redisauth, deletePost);
communityRouter.post("/posts/:postId/like", redisauth, toggleLikePost);

// Comment routes
communityRouter.post("/posts/:postId/comment", redisauth, addComment);
communityRouter.put("/comments/:commentId", redisauth, updateComment);
communityRouter.delete("/comments/:commentId", redisauth, deleteComment);
communityRouter.post("/comments/:commentId/like", redisauth, toggleLikeComment);

// Follow routes
communityRouter.post("/follow/:targetUserId", redisauth, toggleFollowUser);
communityRouter.get("/followers/:userId", redisauth, getFollowers);
communityRouter.get("/following/:userId", redisauth, getFollowing);

module.exports = communityRouter;