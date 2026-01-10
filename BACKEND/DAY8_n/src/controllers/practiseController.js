// controllers/practiceController.js
const User = require("../models/user");

// Start AI Practice Session
const startAIPracticeSession = async (req, res) => {
    try {
        const userId = req.userId;
        const { sessionType, topics } = req.body;

        // Validate session type
        if (!['dsa', 'behavioral', 'system-design', 'technical-interview', 'mock-hr'].includes(sessionType)) {
            return res.status(400).json({ 
                success: false, 
                message: "Invalid session type. Must be one of: dsa, behavioral, system-design, technical-interview, mock-hr" 
            });
        }

        const sessionData = {
            sessionType,
            startedAt: new Date(),
            topics: topics || [],
            score: null,
            feedback: null,
            completedAt: null
        };

        const user = await User.findByIdAndUpdate(
            userId,
            { $push: { aiPracticeSessions: sessionData } },
            { new: true }
        );

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // Get the newly created session
        const newSession = user.aiPracticeSessions[user.aiPracticeSessions.length - 1];

        res.status(200).json({
            success: true,
            message: "AI Practice session started",
            data: {
                sessionId: newSession._id,
                sessionType: newSession.sessionType,
                startedAt: newSession.startedAt,
                topics: newSession.topics
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Complete AI Practice Session
const completeAIPracticeSession = async (req, res) => {
    try {
        const userId = req.userId;
        const { sessionId, score, feedback } = req.body;

        if (!sessionId) {
            return res.status(400).json({ 
                success: false, 
                message: "Session ID is required" 
            });
        }

        const user = await User.findById(userId);
        
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // Find the session and update it
        const session = user.aiPracticeSessions.id(sessionId);
        
        if (!session) {
            return res.status(404).json({ success: false, message: "Session not found" });
        }

        // Check if session is already completed
        if (session.completedAt) {
            return res.status(400).json({ 
                success: false, 
                message: "Session already completed" 
            });
        }

        // Update session
        session.completedAt = new Date();
        session.score = score || 0;
        session.feedback = feedback || '';

        await user.save();

        res.status(200).json({
            success: true,
            message: "Session completed successfully",
            data: {
                sessionId: session._id,
                sessionType: session.sessionType,
                startedAt: session.startedAt,
                completedAt: session.completedAt,
                score: session.score,
                feedback: session.feedback,
                duration: Math.floor((session.completedAt - session.startedAt) / 1000 / 60) // in minutes
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get all AI practice sessions
const getAIPracticeSessions = async (req, res) => {
    try {
        const userId = req.userId;
        const { sessionType, completed } = req.query;

        const user = await User.findById(userId).select('aiPracticeSessions');

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        let sessions = user.aiPracticeSessions;

        // Filter by session type if provided
        if (sessionType) {
            sessions = sessions.filter(s => s.sessionType === sessionType);
        }

        // Filter by completion status if provided
        if (completed !== undefined) {
            const isCompleted = completed === 'true';
            sessions = sessions.filter(s => 
                isCompleted ? s.completedAt !== null : s.completedAt === null
            );
        }

        // Sort by most recent first
        sessions.sort((a, b) => b.startedAt - a.startedAt);

        // Calculate statistics
        const stats = {
            total: sessions.length,
            completed: sessions.filter(s => s.completedAt).length,
            inProgress: sessions.filter(s => !s.completedAt).length,
            averageScore: sessions.filter(s => s.score !== null).length > 0
                ? (sessions.filter(s => s.score !== null).reduce((acc, s) => acc + s.score, 0) / 
                   sessions.filter(s => s.score !== null).length).toFixed(2)
                : 0,
            byType: {
                dsa: sessions.filter(s => s.sessionType === 'dsa').length,
                behavioral: sessions.filter(s => s.sessionType === 'behavioral').length,
                systemDesign: sessions.filter(s => s.sessionType === 'system-design').length,
                technicalInterview: sessions.filter(s => s.sessionType === 'technical-interview').length,
                mockHr: sessions.filter(s => s.sessionType === 'mock-hr').length
            }
        };

        res.status(200).json({
            success: true,
            data: {
                sessions,
                stats
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get single session details
const getSessionById = async (req, res) => {
    try {
        const userId = req.userId;
        const { sessionId } = req.params;

        const user = await User.findById(userId).select('aiPracticeSessions');

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        const session = user.aiPracticeSessions.id(sessionId);

        if (!session) {
            return res.status(404).json({ success: false, message: "Session not found" });
        }

        res.status(200).json({
            success: true,
            data: session
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Track DSA Visualizer usage
const trackVisualizerUsage = async (req, res) => {
    try {
        const userId = req.userId;
        const { algorithm, timeSpent } = req.body;

        if (!algorithm) {
            return res.status(400).json({ 
                success: false, 
                message: "Algorithm name is required" 
            });
        }

        await User.findByIdAndUpdate(userId, {
            $push: {
                visualizerHistory: {
                    algorithm,
                    visualizedAt: new Date(),
                    timeSpent: timeSpent || 0
                }
            }
        });

        res.status(200).json({
            success: true,
            message: "Visualizer usage tracked successfully"
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get visualizer history
const getVisualizerHistory = async (req, res) => {
    try {
        const userId = req.userId;

        const user = await User.findById(userId).select('visualizerHistory');

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // Sort by most recent first
        const history = user.visualizerHistory.sort((a, b) => 
            b.visualizedAt - a.visualizedAt
        );

        // Calculate statistics
        const stats = {
            totalVisualizations: history.length,
            totalTimeSpent: history.reduce((acc, h) => acc + (h.timeSpent || 0), 0),
            mostUsedAlgorithms: {},
            recentAlgorithms: history.slice(0, 10).map(h => ({
                algorithm: h.algorithm,
                visualizedAt: h.visualizedAt,
                timeSpent: h.timeSpent
            }))
        };

        // Count algorithm usage
        history.forEach(h => {
            if (!stats.mostUsedAlgorithms[h.algorithm]) {
                stats.mostUsedAlgorithms[h.algorithm] = 0;
            }
            stats.mostUsedAlgorithms[h.algorithm]++;
        });

        res.status(200).json({
            success: true,
            data: {
                history,
                stats
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Delete a practice session
const deleteSession = async (req, res) => {
    try {
        const userId = req.userId;
        const { sessionId } = req.params;

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        const session = user.aiPracticeSessions.id(sessionId);

        if (!session) {
            return res.status(404).json({ success: false, message: "Session not found" });
        }

        session.remove();
        await user.save();

        res.status(200).json({
            success: true,
            message: "Session deleted successfully"
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    startAIPracticeSession,
    completeAIPracticeSession,
    getAIPracticeSessions,
    getSessionById,
    trackVisualizerUsage,
    getVisualizerHistory,
    deleteSession
};