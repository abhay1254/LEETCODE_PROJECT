const Competition = require("../models/Competition");
const Problem = require("../models/problem");
const User = require("../models/user");
const { getlanguageById, sumbitBatch, sumbittoken } = require("../utils/problemutility");

// CREATE COMPETITION
exports.createCompetition = async (req, res) => {
  try {
    const userId = req.result._id;
    const { problemId } = req.body; // ✅ NEW: Get problemId from request body
    
    let problem;
    
    // ✅ NEW: If problemId is provided, use it; otherwise random selection
    if (problemId) {
      problem = await Problem.findById(problemId);
      if (!problem) {
        return res.status(404).json({ 
          success: false,
          message: 'Problem not found' 
        });
      }
    } else {
      // Random selection (fallback for backward compatibility)
      const problemCount = await Problem.countDocuments();
      const random = Math.floor(Math.random() * problemCount);
      problem = await Problem.findOne().skip(random);
    }
    
    if (!problem) {
      return res.status(404).json({ 
        success: false,
        message: 'No problems available' 
      });
    }

    // Generate unique room ID
    let roomId;
    let isUnique = false;
    
    while (!isUnique) {
      roomId = Math.random().toString(36).substring(2, 8).toUpperCase();
      const existing = await Competition.findOne({ roomId });
      if (!existing) isUnique = true;
    }

    const competition = new Competition({
      roomId,
      problemId: problem._id,
      creator: userId,
      participants: [{
        userId,
        joinedAt: new Date()
      }]
    });

    await competition.save();
    await competition.populate('problemId creator');

    res.status(201).json({
      success: true,
      roomId,
      competition
    });
  } catch (err) {
    res.status(500).json({ 
      success: false,
      message: err.message 
    });
  }
};

// JOIN COMPETITION
exports.joinCompetition = async (req, res) => {
  try {
    const { roomId } = req.params;
    const userId = req.result._id;

    const competition = await Competition.findOne({ roomId })
      .populate('problemId creator');

    if (!competition) {
      return res.status(404).json({ 
        success: false,
        message: 'Competition room not found' 
      });
    }

    if (competition.status === 'completed') {
      return res.status(400).json({ 
        success: false,
        message: 'Competition already completed' 
      });
    }

    // Check if user already joined
    const alreadyJoined = competition.participants.some(
      p => p.userId.toString() === userId.toString()
    );

    if (alreadyJoined) {
      return res.json({ 
        success: true, 
        message: 'Already in room',
        competition 
      });
    }

    // Check max participants
    if (competition.participants.length >= competition.maxParticipants) {
      return res.status(400).json({ 
        success: false,
        message: 'Room is full' 
      });
    }

    // Add participant
    competition.participants.push({
      userId,
      joinedAt: new Date()
    });

    // Start competition if enough participants
    if (competition.participants.length === competition.maxParticipants) {
      competition.status = 'active';
      competition.startedAt = new Date();
    }

    await competition.save();
    await competition.populate('participants.userId');

    res.json({
      success: true,
      competition
    });
  } catch (err) {
    res.status(500).json({ 
      success: false,
      message: err.message 
    });
  }
};

// GET COMPETITION DETAILS
exports.getCompetition = async (req, res) => {
  try {
    const { roomId } = req.params;

    const competition = await Competition.findOne({ roomId })
      .populate('problemId creator winner')
      .populate('participants.userId', 'firstname lastname emailId avatar');

    if (!competition) {
      return res.status(404).json({ 
        success: false,
        message: 'Competition not found' 
      });
    }

    res.json({ 
      success: true, 
      competition 
    });
  } catch (err) {
    res.status(500).json({ 
      success: false,
      message: err.message 
    });
  }
};

// SUBMIT SOLUTION - WITH ACTUAL CODE EXECUTION
exports.submitSolution = async (req, res) => {
  try {
    const { roomId } = req.params;
    let { code, language } = req.body;
    const userId = req.result._id;

    // Normalize language
    if (language === "cpp") {
      language = "c++";
    }
    if (language === 'javascript') {
      language = 'js';
    }

    const competition = await Competition.findOne({ roomId })
      .populate('problemId');

    if (!competition) {
      return res.status(404).json({ 
        success: false,
        message: 'Competition not found' 
      });
    }

    if (competition.status === 'completed') {
      return res.status(400).json({ 
        success: false,
        message: 'Competition already completed' 
      });
    }

    // Find participant
    const participantIndex = competition.participants.findIndex(
      p => p.userId.toString() === userId.toString()
    );

    if (participantIndex === -1) {
      return res.status(403).json({ 
        success: false,
        message: 'Not a participant' 
      });
    }

    // Execute code against test cases
    const problem = competition.problemId;
    const languageId = getlanguageById(language);
    
    // Combine visible and hidden test cases
    const allTestCases = [...problem.visibletestcases, ...problem.hiddentestcases];
    
    // Prepare submissions for batch execution
    const submissions = allTestCases.map((testcase) => ({
      source_code: code,
      language_id: languageId,
      stdin: testcase.input,
      expected_output: testcase.output
    }));

    // Submit batch for execution
    const submitResult = await sumbitBatch(submissions);
    const resultTokens = submitResult.map((value) => value.token);
    const testResults = await sumbittoken(resultTokens);

    // Process results
    let testCasesPassed = 0;
    let runtime = 0;
    let memory = 0;
    let allPassed = true;
    let errorMessage = null;

    for (const test of testResults) {
      if (test.status_id === 3) { // Accepted
        testCasesPassed++;
        runtime += parseFloat(test.time || 0);
        memory = Math.max(memory, test.memory || 0);
      } else {
        allPassed = false;
        if (test.status_id === 4) { // Runtime Error
          errorMessage = test.stderr || test.compile_output || "Runtime Error";
        } else { // Wrong Answer or other
          errorMessage = test.stderr || test.compile_output || "Wrong Answer";
        }
        break; // Stop on first failure
      }
    }

    // Update participant submission
    competition.participants[participantIndex].submittedAt = new Date();
    competition.participants[participantIndex].isCorrect = allPassed;
    competition.participants[participantIndex].code = code;
    competition.participants[participantIndex].language = language;
    competition.participants[participantIndex].runtime = runtime;
    competition.participants[participantIndex].testCasesPassed = testCasesPassed;

    // Check if this is first correct submission
    if (allPassed && !competition.winner) {
      competition.winner = userId;
      competition.status = 'completed';
      competition.completedAt = new Date();
    }

    await competition.save();
    await competition.populate('winner', 'firstname lastname emailId avatar');

    // Emit socket event if io is available
    const io = req.app.get('io');
    if (io) {
      io.of('/competition').to(roomId).emit('submission-made', {
        userId,
        isCorrect: allPassed,
        winner: competition.winner,
        testCasesPassed,
        totalTestCases: allTestCases.length
      });

      if (competition.winner) {
        io.of('/competition').to(roomId).emit('competition-ended', {
          winner: competition.winner,
          completedAt: competition.completedAt
        });
      }
    }

    res.json({
      success: true,
      allPassed,
      testCasesPassed,
      totalTestCases: allTestCases.length,
      runtime,
      memory,
      errorMessage,
      winner: competition.winner,
      competition
    });
  } catch (err) {
    res.status(500).json({ 
      success: false,
      message: err.message 
    });
  }
};

// GET USER'S COMPETITIONS
exports.getUserCompetitions = async (req, res) => {
  try {
    const userId = req.result._id;

    const competitions = await Competition.find({
      'participants.userId': userId
    })
      .populate('problemId', 'title difficulity')
      .populate('winner', 'firstname lastname')
      .sort({ createdAt: -1 });

    res.json({ 
      success: true, 
      competitions 
    });
  } catch (err) {
    res.status(500).json({ 
      success: false,
      message: err.message 
    });
  }
};