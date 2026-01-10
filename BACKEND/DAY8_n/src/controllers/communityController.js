// controllers/communityController.js
const Post = require("../models/post");
const Comment = require("../models/comment");
const User = require("../models/user");

// Create a new post
const createPost = async (req, res) => {
    try {
        const userId = req.result._id;
        const { content, title, tags, relatedProblem } = req.body;

        if (!content || content.trim().length === 0) {
            return res.status(400).json({ 
                success: false, 
                message: "Content is required" 
            });
        }

        const newPost = new Post({
            author: userId,
            content,
            title: title || '',
            tags: tags || [],
            relatedProblem: relatedProblem || null
        });

        await newPost.save();

        // Add post to user's posts array
        await User.findByIdAndUpdate(userId, {
            $push: { posts: newPost._id }
        });

        const populatedPost = await Post.findById(newPost._id)
            .populate('author', 'firstname lastname avatar');

        res.status(201).json({
            success: true,
            message: "Post created successfully",
            data: populatedPost
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
};

// Get all posts (with pagination)
const getAllPosts = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const posts = await Post.find()
            .populate('author', 'firstname lastname avatar')
            .populate({
                path: 'comments',
                options: { limit: 3 }, // Show only first 3 comments
                populate: {
                    path: 'author',
                    select: 'firstname lastname avatar'
                }
            })
            .populate('relatedProblem', 'title difficulty')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Post.countDocuments();

        res.status(200).json({
            success: true,
            data: posts,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                totalPosts: total,
                hasMore: page < Math.ceil(total / limit)
            }
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
};

// Get single post with all comments
const getPostById = async (req, res) => {
    try {
        const { postId } = req.params;

        const post = await Post.findById(postId)
            .populate('author', 'firstname lastname avatar bio')
            .populate({
                path: 'comments',
                populate: [
                    {
                        path: 'author',
                        select: 'firstname lastname avatar'
                    },
                    {
                        path: 'replies',
                        populate: {
                            path: 'author',
                            select: 'firstname lastname avatar'
                        }
                    }
                ]
            })
            .populate('relatedProblem', 'title difficulty tags');

        if (!post) {
            return res.status(404).json({ 
                success: false, 
                message: "Post not found" 
            });
        }

        res.status(200).json({
            success: true,
            data: post
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
};

// Get posts by specific user
const getUserPosts = async (req, res) => {
    try {
        const { userId } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const posts = await Post.find({ author: userId })
            .populate('author', 'firstname lastname avatar')
            .populate('relatedProblem', 'title difficulty')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Post.countDocuments({ author: userId });

        res.status(200).json({
            success: true,
            data: posts,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                totalPosts: total
            }
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
};

// Update post
const updatePost = async (req, res) => {
    try {
        const userId = req.result._id;
        const { postId } = req.params;
        const { content, title, tags } = req.body;

        const post = await Post.findById(postId);
        
        if (!post) {
            return res.status(404).json({ 
                success: false, 
                message: "Post not found" 
            });
        }

        // Check if user is the author
        if (post.author.toString() !== userId) {
            return res.status(403).json({ 
                success: false, 
                message: "Unauthorized to update this post" 
            });
        }

        if (content) post.content = content;
        if (title !== undefined) post.title = title;
        if (tags) post.tags = tags;
        post.isEdited = true;

        await post.save();

        const updatedPost = await Post.findById(postId)
            .populate('author', 'firstname lastname avatar');

        res.status(200).json({
            success: true,
            message: "Post updated successfully",
            data: updatedPost
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
};

// Like/Unlike a post
const toggleLikePost = async (req, res) => {
    try {
        const userId = req.result._id;
        const { postId } = req.params;

        const post = await Post.findById(postId);
        
        if (!post) {
            return res.status(404).json({ 
                success: false, 
                message: "Post not found" 
            });
        }

        const likeIndex = post.likes.indexOf(userId);
        
        if (likeIndex > -1) {
            // Unlike
            post.likes.splice(likeIndex, 1);
        } else {
            // Like
            post.likes.push(userId);
        }

        await post.save();

        res.status(200).json({
            success: true,
            message: likeIndex > -1 ? "Post unliked" : "Post liked",
            data: { 
                likes: post.likes.length,
                isLiked: likeIndex === -1
            }
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
};

// Add comment to post
const addComment = async (req, res) => {
    try {
        const userId = req.result._id;
        const { postId } = req.params;
        const { content, parentComment } = req.body;

        if (!content || content.trim().length === 0) {
            return res.status(400).json({ 
                success: false, 
                message: "Comment content is required" 
            });
        }

        const post = await Post.findById(postId);
        
        if (!post) {
            return res.status(404).json({ 
                success: false, 
                message: "Post not found" 
            });
        }

        const newComment = new Comment({
            post: postId,
            author: userId,
            content,
            parentComment: parentComment || null
        });

        await newComment.save();

        // Add comment to post
        post.comments.push(newComment._id);
        await post.save();

        // If it's a reply, add to parent comment's replies
        if (parentComment) {
            await Comment.findByIdAndUpdate(parentComment, {
                $push: { replies: newComment._id }
            });
        }

        const populatedComment = await Comment.findById(newComment._id)
            .populate('author', 'firstname lastname avatar');

        res.status(201).json({
            success: true,
            message: "Comment added successfully",
            data: populatedComment
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
};

// Update comment
const updateComment = async (req, res) => {
    try {
        const userId = req.result._id;
        const { commentId } = req.params;
        const { content } = req.body;

        if (!content || content.trim().length === 0) {
            return res.status(400).json({ 
                success: false, 
                message: "Comment content is required" 
            });
        }

        const comment = await Comment.findById(commentId);
        
        if (!comment) {
            return res.status(404).json({ 
                success: false, 
                message: "Comment not found" 
            });
        }

        // Check if user is the author
            if (comment.author.toString() !== userId.toString())  {
            return res.status(403).json({ 
                success: false, 
                message: "Unauthorized to update this comment" 
            });
        }

        comment.content = content;
        await comment.save();

        res.status(200).json({
            success: true,
            message: "Comment updated successfully",
            data: comment
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
};

// Delete comment
const deleteComment = async (req, res) => {
    try {
        const userId = req.result._id;
        const { commentId } = req.params;

        const comment = await Comment.findById(commentId);
        
        if (!comment) {
            return res.status(404).json({ 
                success: false, 
                message: "Comment not found" 
            });
        }

        // Check if user is the author
        if (post.author.toString() !== userId.toString()) {
            return res.status(403).json({ 
                success: false, 
                message: "Unauthorized to delete this comment" 
            });
        }

        // Remove from post's comments array
        await Post.findByIdAndUpdate(comment.post, {
            $pull: { comments: commentId }
        });

        // If it's a reply, remove from parent comment
        if (comment.parentComment) {
            await Comment.findByIdAndUpdate(comment.parentComment, {
                $pull: { replies: commentId }
            });
        }

        // Delete all replies to this comment
        await Comment.deleteMany({ parentComment: commentId });

        // Delete the comment
        await Comment.findByIdAndDelete(commentId);

        res.status(200).json({
            success: true,
            message: "Comment deleted successfully"
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
};

// Like/Unlike a comment
const toggleLikeComment = async (req, res) => {
    try {
        const userId = req.result._id;
        const { commentId } = req.params;

        const comment = await Comment.findById(commentId);
        
        if (!comment) {
            return res.status(404).json({ 
                success: false, 
                message: "Comment not found" 
            });
        }

        const likeIndex = comment.likes.indexOf(userId);
        
        if (likeIndex > -1) {
            // Unlike
            comment.likes.splice(likeIndex, 1);
        } else {
            // Like
            comment.likes.push(userId);
        }

        await comment.save();

        res.status(200).json({
            success: true,
            message: likeIndex > -1 ? "Comment unliked" : "Comment liked",
            data: { 
                likes: comment.likes.length,
                isLiked: likeIndex === -1
            }
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
};

// Delete post
const deletePost = async (req, res) => {
    try {
        const userId = req.result._id;
        const { postId } = req.params;

        const post = await Post.findById(postId);
        
        if (!post) {
            return res.status(404).json({ 
                success: false, 
                message: "Post not found" 
            });
        }

        // Check if user is the author
               if (post.author.toString() !== userId.toString()) {
            return res.status(403).json({ 
                success: false, 
                message: "Unauthorized to delete this post" 
            });
        }

        // Delete all comments and their replies
        for (const commentId of post.comments) {
            const comment = await Comment.findById(commentId);
            if (comment) {
                // Delete all replies
                await Comment.deleteMany({ parentComment: commentId });
            }
        }

        // Delete all comments
        await Comment.deleteMany({ post: postId });

        // Delete post
        await Post.findByIdAndDelete(postId);

        // Remove from user's posts
        await User.findByIdAndUpdate(userId, {
            $pull: { posts: postId }
        });

        res.status(200).json({
            success: true,
            message: "Post deleted successfully"
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
};

// Follow/Unfollow user
const toggleFollowUser = async (req, res) => {
    try {
        const userId = req.result._id;
        const { targetUserId } = req.params;

       if (userId.toString() === targetUserId) {
            return res.status(400).json({ 
                success: false, 
                message: "Cannot follow yourself" 
            });
        }

        const currentUser = await User.findById(userId);
        const targetUser = await User.findById(targetUserId);

        if (!targetUser) {
            return res.status(404).json({ 
                success: false, 
                message: "User not found" 
            });
        }

        const isFollowing = currentUser.following.includes(targetUserId);

        if (isFollowing) {
            // Unfollow
            await User.findByIdAndUpdate(userId, {
                $pull: { following: targetUserId }
            });
            await User.findByIdAndUpdate(targetUserId, {
                $pull: { followers: userId }
            });
            
            res.status(200).json({
                success: true,
                message: "Unfollowed successfully",
                isFollowing: false
            });
        } else {
            // Follow
            await User.findByIdAndUpdate(userId, {
                $push: { following: targetUserId }
            });
            await User.findByIdAndUpdate(targetUserId, {
                $push: { followers: userId }
            });
            
            res.status(200).json({
                success: true,
                message: "Followed successfully",
                isFollowing: true
            });
        }
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
};

// Get user's followers
const getFollowers = async (req, res) => {
    try {
        const { userId } = req.params;

        const user = await User.findById(userId)
            .populate('followers', 'firstname lastname avatar bio');

        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: "User not found" 
            });
        }

        res.status(200).json({
            success: true,
            data: user.followers
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
};

// Get user's following
const getFollowing = async (req, res) => {
    try {
        const { userId } = req.params;

        const user = await User.findById(userId)
            .populate('following', 'firstname lastname avatar bio');

        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: "User not found" 
            });
        }

        res.status(200).json({
            success: true,
            data: user.following
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
};

// Search posts
const searchPosts = async (req, res) => {
    try {
        const { query, tags } = req.query;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const searchQuery = {};

        if (query) {
            searchQuery.$or = [
                { title: { $regex: query, $options: 'i' } },
                { content: { $regex: query, $options: 'i' } }
            ];
        }

        if (tags) {
            searchQuery.tags = { $in: tags.split(',') };
        }

        const posts = await Post.find(searchQuery)
            .populate('author', 'firstname lastname avatar')
            .populate('relatedProblem', 'title difficulty')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Post.countDocuments(searchQuery);

        res.status(200).json({
            success: true,
            data: posts,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                totalPosts: total
            }
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
};

module.exports = {
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
};