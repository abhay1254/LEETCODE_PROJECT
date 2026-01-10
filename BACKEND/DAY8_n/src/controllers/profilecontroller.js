// controllers/profileController.js
const User = require("../models/user");
const Problem = require("../models/problem");

// Get user profile with all stats
const getUserProfile = async (req, res) => {
    try {
        const userId = req.result._id;
        
        const user = await User.findById(userId)
            .select('-password')
            .populate('problemSolved.problemId', 'title difficulity')
            .populate('posts')
            .populate('followers', 'firstname lastname avatar')
            .populate('following', 'firstname lastname avatar');

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        res.status(200).json({
            success: true,
            data: user
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get user profile stats for dashboard with REAL problem counts
const getUserProfileStats = async (req, res) => {
    try {
        const userId = req.result._id;

        const user = await User.findById(userId)
            .select('-password')
            .lean();

        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: "User not found" 
            });
        }

        // Use the solved stats from user.stats if available
        const solved = user.stats || {};

        // Get actual problem counts from database
        const [easyCount, mediumCount, hardCount] = await Promise.all([
            Problem.countDocuments({ difficulity: 'easy' }),
            Problem.countDocuments({ difficulity: 'medium' }),
            Problem.countDocuments({ difficulity: 'hard' })
        ]);

        const totalProblems = {
            easy: easyCount,
            medium: mediumCount,
            hard: hardCount,
            all: easyCount + mediumCount + hardCount
        };

        res.status(200).json({
            success: true,
            data: {
                user: user,
                solved: solved,
                totalProblems: totalProblems
            }
        });

    } catch (error) {
        console.error('Error in getUserProfileStats:', error);
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
};

// Update user profile (bio, avatar, etc.)
const updateProfile = async (req, res) => {
    try {
        const userId = req.result._id;
        const { bio, avatar, preferences } = req.body;

        const updateData = {};
        if (bio !== undefined) updateData.bio = bio;
        if (avatar !== undefined) updateData.avatar = avatar;
        if (preferences !== undefined) updateData.preferences = preferences;

        const user = await User.findByIdAndUpdate(
            userId,
            { $set: updateData },
            { new: true, runValidators: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            data: user
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get streak data for graph
const getStreakData = async (req, res) => {
    try {
        const userId = req.result._id;
        
        const user = await User.findById(userId)
            .select('streakHistory currentStreak longestStreak lastSolvedDate');

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // Get last 365 days of data
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

        const filteredHistory = user.streakHistory.filter(
            entry => entry.date >= oneYearAgo
        );

        res.status(200).json({
            success: true,
            data: {
                currentStreak: user.currentStreak,
                longestStreak: user.longestStreak,
                lastSolvedDate: user.lastSolvedDate,
                streakHistory: filteredHistory
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get monthly progress for bar chart
const getMonthlyProgress = async (req, res) => {
    try {
        const userId = req.result._id;
        
        const user = await User.findById(userId)
            .select('monthlyProgress stats');

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // Get last 12 months
        const last12Months = [];
        const now = new Date();
        
        for (let i = 11; i >= 0; i--) {
            const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const monthStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            
            const monthData = user.monthlyProgress.find(m => m.month === monthStr);
            
            last12Months.push({
                month: monthStr,
                problemsSolved: monthData?.problemsSolved || 0,
                easy: monthData?.easy || 0,
                medium: monthData?.medium || 0,
                hard: monthData?.hard || 0
            });
        }

        res.status(200).json({
            success: true,
            data: {
                monthlyProgress: last12Months,
                totalStats: user.stats
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get user's skills
const getUserSkills = async (req, res) => {
    try {
        const userId = req.result._id;
        
        const user = await User.findById(userId).select('skills');

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        res.status(200).json({
            success: true,
            data: user.skills
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get badges
const getUserBadges = async (req, res) => {
    try {
        const userId = req.result._id;
        
        const user = await User.findById(userId).select('badges');

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        res.status(200).json({
            success: true,
            data: user.badges
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    getUserProfile,
    getUserProfileStats,
    updateProfile,
    getStreakData,
    getMonthlyProgress,
    getUserSkills,
    getUserBadges
};