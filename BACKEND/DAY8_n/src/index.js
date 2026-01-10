const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const sumbitRouter = require("./routes/sumbit");
require("dotenv").config();
const main = require("./config/db");
const cookieparser = require("cookie-parser");
const authrouter = require("./routes/userauth");
const redisclient = require("./config/redis");
const problemRouter = require("./routes/problem");
const cors = require('cors');
const videoRouter = require("./routes/videoCreator");
const profileRouter = require("./routes/profile");
const community = require("./routes/community");
const practiceRouter = require("./routes/practise");
const contestRouter = require("./routes/contest");
const aiRouter = require("./routes/aiChatting");
const competitionRouter = require("./routes/competition"); // NEW

const app = express();
const server = http.createServer(app);

// Socket.IO setup
const io = socketIo(server, {
  cors: {
    origin: 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(express.json());
app.use(cookieparser());
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true 
}));

// Routes
app.use("/user", authrouter);
app.use("/video",videoRouter);
app.use("/problem", problemRouter);
app.use("/sumbit", sumbitRouter);
app.use('/ai', aiRouter);
app.use("/api/profile", profileRouter);
app.use("/api/community", community);
app.use("/api/practice", practiceRouter);
app.use("/api/contests", contestRouter);
app.use("/api/competition", competitionRouter); // NEW

// Initialize Socket.IO for competition
require("./utils/competitionSocket")(io);

// Make io accessible in controllers if needed
app.set('io', io);

const IntializeConnection = async () => {
    try {
        await Promise.all([main(), redisclient.connect()]);
        console.log("DB connected");
        server.listen(process.env.PORT, () => {
            console.log("Server is listening at port: " + process.env.PORT); 
        });
    } catch (err) {
        console.log("Errors: " + err.message);
    }
};

IntializeConnection();