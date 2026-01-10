
// ========================================
// routes/contest.js - CREATE THIS FILE
// ========================================
const express = require("express");
const contestRouter = express.Router();
const redisauth = require("../middleware/redisauth");
const admin = require("../middleware/admin");
const {
    createContest,
    getAllContests,
    getContestById,
    registerForContest,
    submitContestProblem,
    getContestLeaderboard,
    getUserContestHistory
} = require("../controllers/contestController");

// Contest management (Admin)
contestRouter.post("/create", admin, createContest);

// Contest participation (Users)
contestRouter.get("/", redisauth, getAllContests);
contestRouter.get("/my-contests", redisauth, getUserContestHistory);
contestRouter.get("/:contestId", redisauth, getContestById);
contestRouter.post("/:contestId/register", redisauth, registerForContest);
contestRouter.post("/:contestId/submit/:problemId", redisauth, submitContestProblem);
contestRouter.get("/:contestId/leaderboard", redisauth, getContestLeaderboard);

module.exports = contestRouter;