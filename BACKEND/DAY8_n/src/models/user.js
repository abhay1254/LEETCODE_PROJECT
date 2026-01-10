const mongoose=require("mongoose");
const{Schema}=mongoose;
const Problem=require("./problem");

const userschema=new Schema({
    firstname:{
        type:String,
        required:true,
        minLength:3,
        maxLength:20
    },
    lastname:{
        type:String,
        minLength:3,
        maxLength:20
    },
    emailId:{
        type:String,
        require:true,
        unique:true,
        trim:true,
        lowercase:true,
        imuutable:true

    },
    age:{
        type:Number,
        min:6,
        max:80,

    },
    role:{
        type:String,
        enum:['user','admin'],
        default:'user',

    },
    // problemSolved:[{
        // type:Schema.Types.ObjectId,
        // ref:"problem",
        // 
    // }],

    password:{
        type:String,
        required:true
    },
      bio: {
        type: String,
        maxLength: 200,
        default: ''
    },
    avatar: {
        type: String,
        default: function() {
            return `https://api.dicebear.com/7.x/avataaars/svg?seed=${this.firstname}`;
        }
    },
    currentStreak: {
        type: Number,
        default: 0
    },
    longestStreak: {
        type: Number,
        default: 0
    },
    lastSolvedDate: {
        type: Date
    },
    badges: [{
        type: String
    }],
  stats: {
    easy: { type: Number, default: 0 },
    medium: { type: Number, default: 0 },
    hard: { type: Number, default: 0 },
    totalSubmissions: { type: Number, default: 0 },
    acceptanceRate: { type: Number, default: 0 }
},
  
  
  
  
    problemSolved: [{
        problemId: {
            type: Schema.Types.ObjectId,
            ref: "problem"
        },
        solvedAt: {
            type: Date,
            default: Date.now
        },
        difficulty: {
            type: String,
            enum: ['easy', 'medium', 'hard']
        },
        timeTaken: Number,
        language: String
    }],

    // For streak graph visualization
    streakHistory: [{
        date: {
            type: Date,
            default: Date.now
        },
        problemsSolved: {
            type: Number,
            default: 0
        }
    }],

    // For monthly progress bar
    monthlyProgress: [{
        month: String, // "2025-01"
        problemsSolved: { type: Number, default: 0 },
        easy: { type: Number, default: 0 },
        medium: { type: Number, default: 0 },
        hard: { type: Number, default: 0 }
    }],

    // Community - posts user created
    posts: [{
        type: Schema.Types.ObjectId,
        ref: "Post"
    }],

    // Community - following system
    following: [{
        type: Schema.Types.ObjectId,
        ref: "user"
    }],
    followers: [{
        type: Schema.Types.ObjectId,
        ref: "user"
    }],

aiPracticeSessions: [{
        sessionType: {
            type: String,
            enum: ['dsa', 'behavioral', 'system-design', 'technical-interview', 'mock-hr']
        },
        startedAt: Date,
        completedAt: Date,
        score: Number,
        feedback: String,
        topics: [String]
    }],

    // Contest participation
    contests: [{
        contestId: {
            type: Schema.Types.ObjectId,
            ref: "Contest"
        },
        rank: Number,
        score: Number,
        problemsSolved: Number,
        participatedAt: Date
    }],
    contestRating: {
        type: Number,
        default: 1500
    },

    // DSA Visualizer usage tracking
    visualizerHistory: [{
        algorithm: String,
        visualizedAt: {
            type: Date,
            default: Date.now
        },
        timeSpent: Number
    }],

    // Skills tracking
    skills: [{
        name: String, // "Arrays", "DP", etc.
        level: {
            type: String,
            enum: ['beginner', 'intermediate', 'advanced'],
            default: 'beginner'
        },
        problemsSolved: {
            type: Number,
            default: 0
        }
    }],

    // User preferences
    preferences: {
        theme: {
            type: String,
            enum: ['light', 'dark'],
            default: 'dark'
        },
        defaultLanguage: {
            type: String,
            default: 'javascript'
        },
        emailNotifications: {
            type: Boolean,
            default: true
        }
    },


},{
    timestamps:true
})
// userschema.index({ emailId: 1 });
userschema.index({ currentStreak: -1 });
userschema.index({ 'stats.easy': -1, 'stats.medium': -1, 'stats.hard': -1 });
const User=mongoose.model("user",userschema);
module.exports=User;
