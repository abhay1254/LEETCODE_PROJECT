// models/contest.js
const mongoose = require("mongoose");
const { Schema } = mongoose;

const contestSchema = new Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        maxLength: 1000,
        default: ''
    },
    startTime: {
        type: Date,
        required: true
    },
    endTime: {
        type: Date,
        required: true
    },
    duration: {
        type: Number, // in minutes
        required: true
    },
    problems: [{
        problem: {
            type: Schema.Types.ObjectId,
            ref: "problem",
            required: true
        },
        points: {
            type: Number,
            default: 100
        },
        order: {
            type: Number,
            default: 0
        }
    }],
    participants: [{
        user: {
            type: Schema.Types.ObjectId,
            ref: "user"
        },
        rank: {
            type: Number,
            default: 0
        },
        score: {
            type: Number,
            default: 0
        },
        submissions: [{
            problem: {
                type: Schema.Types.ObjectId,
                ref: "problem"
            },
            submittedAt: {
                type: Date,
                default: Date.now
            },
            status: {
                type: String,
                enum: ['accepted', 'wrong-answer', 'time-limit', 'runtime-error', 'pending'],
                default: 'pending'
            },
            points: {
                type: Number,
                default: 0
            },
            timeTaken: {
                type: Number, // time to solve in minutes from contest start
                default: 0
            },
            language: {
                type: String,
                default: 'javascript'
            }
        }],
        registeredAt: {
            type: Date,
            default: Date.now
        }
    }],
    status: {
        type: String,
        enum: ['upcoming', 'active', 'completed'],
        default: 'upcoming'
    },
    type: {
        type: String,
        enum: ['weekly', 'biweekly', 'monthly', 'special'],
        default: 'weekly'
    },
    totalParticipants: {
        type: Number,
        default: 0
    },
    // Contest rules and info
    rules: {
        type: String,
        default: 'Standard contest rules apply.'
    },
    // Prize/rewards info
    prizes: [{
        rank: Number,
        reward: String
    }],
    // Contest visibility
    isPublic: {
        type: Boolean,
        default: true
    },
    // Contest creator
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: "user"
    }
}, {
    timestamps: true
});

// Index for faster queries
contestSchema.index({ status: 1, startTime: -1 });
contestSchema.index({ 'participants.user': 1 });

// Virtual for checking if contest is live
contestSchema.virtual('isLive').get(function() {
    const now = new Date();
    return this.startTime <= now && now <= this.endTime;
});

// Method to calculate final rankings
contestSchema.methods.calculateRankings = function() {
    // Sort participants by score (descending) and then by time (ascending)
    this.participants.sort((a, b) => {
        if (b.score !== a.score) {
            return b.score - a.score;
        }
        // If scores are equal, sort by total time taken
        const aTime = a.submissions.reduce((sum, sub) => sum + (sub.timeTaken || 0), 0);
        const bTime = b.submissions.reduce((sum, sub) => sum + (sub.timeTaken || 0), 0);
        return aTime - bTime;
    });

    // Assign ranks
    this.participants.forEach((participant, index) => {
        participant.rank = index + 1;
    });

    return this.participants;
};

// Method to update contest status
contestSchema.methods.updateStatus = function() {
    const now = new Date();
    
    if (now < this.startTime) {
        this.status = 'upcoming';
    } else if (now >= this.startTime && now <= this.endTime) {
        this.status = 'active';
    } else {
        this.status = 'completed';
    }
    
    return this.status;
};

// Static method to get active contests
contestSchema.statics.getActiveContests = function() {
    const now = new Date();
    return this.find({
        status: 'active',
        startTime: { $lte: now },
        endTime: { $gte: now }
    }).populate('problems.problem', 'title difficulty');
};

// Static method to get upcoming contests
contestSchema.statics.getUpcomingContests = function() {
    const now = new Date();
    return this.find({
        status: 'upcoming',
        startTime: { $gt: now }
    }).sort({ startTime: 1 });
};

// Pre-save middleware to update total participants
contestSchema.pre('save', function(next) {
    this.totalParticipants = this.participants.length;
    next();
});

const Contest = mongoose.model("Contest", contestSchema);
module.exports = Contest;