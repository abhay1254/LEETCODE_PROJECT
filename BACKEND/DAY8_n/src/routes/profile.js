const express = require("express");
const profileRouter = express.Router();
const redisauth = require("../middleware/redisauth");
const {
    getUserProfileStats,
    getUserProfile,
    updateProfile,
    getStreakData,
    getMonthlyProgress,
    getUserSkills,
    getUserBadges,
} = require("../controllers/profilecontroller");

profileRouter.get('/stats', redisauth,getUserProfileStats);
profileRouter.get("/", redisauth, getUserProfile);
profileRouter.put("/update", redisauth, updateProfile);
profileRouter.get("/streak", redisauth, getStreakData);
profileRouter.get("/monthly-progress", redisauth, getMonthlyProgress);
profileRouter.get("/skills", redisauth, getUserSkills);
profileRouter.get("/badges", redisauth, getUserBadges);


module.exports = profileRouter;