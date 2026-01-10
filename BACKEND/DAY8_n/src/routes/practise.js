const express = require("express");
const practiceRouter = express.Router();
const redisauth = require("../middleware/redisauth");
const {
    startAIPracticeSession,
    completeAIPracticeSession,
    getAIPracticeSessions,
    trackVisualizerUsage,
    getVisualizerHistory
} = require("../controllers/practiseController");

// AI Practice routes
practiceRouter.post("/ai-session/start", redisauth, startAIPracticeSession);
practiceRouter.post("/ai-session/complete", redisauth, completeAIPracticeSession);
practiceRouter.get("/ai-sessions", redisauth, getAIPracticeSessions);

// DSA Visualizer routes
practiceRouter.post("/visualizer/track", redisauth, trackVisualizerUsage);
practiceRouter.get("/visualizer/history", redisauth, getVisualizerHistory);

module.exports = practiceRouter;
