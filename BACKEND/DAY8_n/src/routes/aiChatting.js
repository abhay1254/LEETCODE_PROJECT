const express = require('express');
const aiRouter =  express.Router();
// const userMiddleware = require("../middleware/userMiddleware");
// const redisauth=require("../middleware/redisauth");\
const solveDoubt=require("../controllers/solveDoubt");
// import redisauth from '../middleware/redisauth';
// import redisauth from "../middleware/redisauth"
const redisauth=require("../middleware/redisauth")
const hrInterview = require('../controllers/hrInterviewController');
const technicalInterview = require('../controllers/technicalInterviewController');
const interviewQuestions = require('../controllers/interviewQuestionsController');
// const redisauth=require("../middleware/redisauth")
aiRouter.post('/chat', redisauth, solveDoubt);
aiRouter.post('/hr-interview', hrInterview)
aiRouter.post('/technical-interview', technicalInterview);
aiRouter.post('/interview-questions', interviewQuestions);

module.exports = aiRouter;