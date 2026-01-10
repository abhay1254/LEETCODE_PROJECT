const express = require('express');
const competitionrouter = express.Router();
const competitionController = require('../controllers/competitionController');
// const { } = require('../middleware/auth'); // Your auth middleware
const redisauth=require("../middleware/redisauth")
// Create new competition
competitionrouter.post('/create',redisauth, competitionController.createCompetition);

// Join competition by room ID
competitionrouter.post('/join/:roomId', redisauth, competitionController.joinCompetition);

// Get competition details
competitionrouter.get('/:roomId', redisauth, competitionController.getCompetition);

// Submit solution in competition
competitionrouter.post('/:roomId/submit', redisauth, competitionController.submitSolution);

// Get user's competitions
competitionrouter.get('/user/my-competitions', redisauth, competitionController.getUserCompetitions);

module.exports = competitionrouter;