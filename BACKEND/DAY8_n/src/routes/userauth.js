const express = require("express");
const redisauth = require("../middleware/redisauth")
const authrouter = express.Router();
const { register, login, logout, adminregister, deleteprofile } = require("../controllers/userauthent");
const admin = require("../middleware/admin");

authrouter.post("/register", register);
authrouter.post('/login', login);
authrouter.post('/logout', redisauth, logout);
authrouter.post('/admin', admin, adminregister);
authrouter.delete('/delete', redisauth, deleteprofile);

// ✅ FIXED VERSION - Corrected the bugs
authrouter.get("/check", redisauth, (req, res) => {
    try {
        const reply = {
            _id: req.result._id,              
            firstname: req.result.firstname,  
            lastname: req.result.lastname,    
            emailId: req.result.emailId,
            avatar: req.result.avatar,        
            bio: req.result.bio,              
            stats: req.result.stats,          
            currentStreak: req.result.currentStreak,
            longestStreak: req.result.longestStreak,
            followers: req.result.followers,
            following: req.result.following,
            contestRating: req.result.contestRating,
            contestBadge: req.result.contestBadge,
             role: req.result.role ,
        };
        
        res.status(200).json({
            success: true,  
            user: reply,
            message: "Valid User"
        });
    } catch (error) {
        res.status(401).json({
            success: false,
            message: "Authentication failed"
        });
    }
});

module.exports = authrouter;