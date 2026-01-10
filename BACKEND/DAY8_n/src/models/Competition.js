const mongoose = require("mongoose");
const { Schema } = mongoose;

const competitionSchema = new Schema({
    roomId: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    problemId: {
        type: Schema.Types.ObjectId,
        ref: "problem",
        required: true
    },
    creator: {
        type: Schema.Types.ObjectId,
        ref: "user",
        required: true
    },
    participants: [{
        userId: {
            type: Schema.Types.ObjectId,
            ref: "user"
        },
        joinedAt: {
            type: Date,
            default: Date.now
        },
        submittedAt: Date,
        isCorrect: Boolean,
        code: String,
        language: String
    }],
    status: {
        type: String,
        enum: ['waiting', 'active', 'completed'],
        default: 'waiting'
    },
    winner: {
        type: Schema.Types.ObjectId,
        ref: "user"
    },
    startedAt: Date,
    completedAt: Date,
    maxParticipants: {
        type: Number,
        default: 2
    }
}, {
    timestamps: true
});

// Generate unique room ID
competitionSchema.statics.generateRoomId = function() {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
};

const Competition = mongoose.model("competition", competitionSchema);
module.exports = Competition;