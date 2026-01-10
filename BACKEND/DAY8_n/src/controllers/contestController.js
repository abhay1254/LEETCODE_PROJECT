// controllers/contestController.js
const Contest = require("../models/contest");
const User = require("../models/user");

// Create contest (Admin only)
const createContest = async (req, res) => {
    try {
        const { title, description, startTime, endTime, duration, problems, type } = req.body;

        if (!title || !startTime || !endTime || !duration) {
            return res.status(400).json({ 
                success: false, 
                message: "Title, startTime, endTime, and duration are required" 
            });
        }

        const newContest = new Contest({
            title,
            description,
            startTime: new Date(startTime),
            endTime: new Date(endTime),
            duration,
            problems: problems || [],
            type: type || 'weekly'
        });

        await newContest.save();

        res.status(201).json({
            success: true,
            message: "Contest created successfully",
            data: newContest
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get all contests
const getAllContests = async (req, res) => {
    try {
        const { status } = req.query; // upcoming, active, completed

        const query = {};
        if (status) {
            query.status = status;
        }

        const contests = await Contest.find(query)
            .populate('problems.problem', 'title difficulty')
            .sort({ startTime: -1 });

        res.status(200).json({
            success: true,
            data: contests
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get single contest
const getContestById = async (req, res) => {
    try {
        const { contestId } = req.params;

        const contest = await Contest.findById(contestId)
            .populate('problems.problem')
            .populate('participants.user', 'firstname lastname avatar');

        if (!contest) {
            return res.status(404).json({ success: false, message: "Contest not found" });
        }

        res.status(200).json({
            success: true,
            data: contest
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Register for contest
const registerForContest = async (req, res) => {
    try {
        const userId = req.userId;
        const { contestId } = req.params;

        const contest = await Contest.findById(contestId);
        if (!contest) {
            return res.status(404).json({ success: false, message: "Contest not found" });
        }

        // Check if already registered
        const alreadyRegistered = contest.participants.some(
            p => p.user.toString() === userId
        );

        if (alreadyRegistered) {
            return res.status(400).json({ 
                success: false, 
                message: "Already registered for this contest" 
            });
        }

        contest.participants.push({
            user: userId,
            rank: 0,
            score: 0,
            submissions: []
        });

        await contest.save();

        res.status(200).json({
            success: true,
            message: "Successfully registered for contest"
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Submit problem in contest
const submitContestProblem = async (req, res) => {
    try {
        const userId = req.userId;
        const { contestId, problemId } = req.params;
        const { status, points } = req.body;

        const contest = await Contest.findById(contestId);
        if (!contest) {
            return res.status(404).json({ success: false, message: "Contest not found" });
        }

        const participant = contest.participants.find(
            p => p.user.toString() === userId
        );

        if (!participant) {
            return res.status(400).json({ 
                success: false, 
                message: "Not registered for this contest" 
            });
        }

        // Add submission
        participant.submissions.push({
            problem: problemId,
            submittedAt: new Date(),
            status,
            points: points || 0
        });

        // Update score
        if (status === 'accepted') {
            participant.score += points || 0;
        }

        await contest.save();

        // Update user's contest history
        await User.findByIdAndUpdate(userId, {
            $addToSet: {
                contests: {
                    contestId,
                    score: participant.score,
                    problemsSolved: participant.submissions.filter(s => s.status === 'accepted').length,
                    participatedAt: new Date()
                }
            }
        });

        res.status(200).json({
            success: true,
            message: "Submission recorded",
            data: participant
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get contest leaderboard
const getContestLeaderboard = async (req, res) => {
    try {
        const { contestId } = req.params;

        const contest = await Contest.findById(contestId)
            .populate('participants.user', 'firstname lastname avatar');

        if (!contest) {
            return res.status(404).json({ success: false, message: "Contest not found" });
        }

        // Sort participants by score
        const leaderboard = contest.participants
            .sort((a, b) => b.score - a.score)
            .map((p, index) => ({
                rank: index + 1,
                user: p.user,
                score: p.score,
                problemsSolved: p.submissions.filter(s => s.status === 'accepted').length
            }));

        res.status(200).json({
            success: true,
            data: leaderboard
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get user's contest history
const getUserContestHistory = async (req, res) => {
    try {
        const userId = req.userId;

        const user = await User.findById(userId)
            .select('contests contestRating contestBadge')
            .populate('contests.contestId', 'title startTime type');

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        res.status(200).json({
            success: true,
            data: {
                contests: user.contests,
                rating: user.contestRating,
                badge: user.contestBadge
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    createContest,
    getAllContests,
    getContestById,
    registerForContest,
    submitContestProblem,
    getContestLeaderboard,
    getUserContestHistory
};


