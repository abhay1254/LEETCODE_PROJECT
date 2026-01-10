// utils/competitionSocket.js
const Competition = require('../models/Competition');

module.exports = (io) => {
  const competitionNamespace = io.of('/competition');

  competitionNamespace.on('connection', (socket) => {
    console.log('User connected to competition:', socket.id);

    // Join a competition room
    socket.on('join-room', async ({ roomId, userId }) => {
      try {
        socket.join(roomId);
        
        const competition = await Competition.findOne({ roomId })
          .populate('problemId creator')
          .populate('participants.userId', 'username');

        socket.emit('room-joined', { competition });

        // Notify others in the room
        socket.to(roomId).emit('participant-joined', {
          userId,
          participantCount: competition.participants.length
        });

        // If competition starts
        if (competition.status === 'active') {
          competitionNamespace.to(roomId).emit('competition-started', {
            startedAt: competition.startedAt
          });
        }
      } catch (error) {
        socket.emit('error', { message: error.message });
      }
    });

    // Notify typing/coding activity
    socket.on('coding', ({ roomId, userId }) => {
      socket.to(roomId).emit('opponent-coding', { userId });
    });

    // When someone submits
    socket.on('submission', async ({ roomId, userId, isCorrect }) => {
      try {
        const competition = await Competition.findOne({ roomId })
          .populate('winner', 'username');

        // Notify all participants
        competitionNamespace.to(roomId).emit('submission-made', {
          userId,
          isCorrect,
          winner: competition.winner
        });

        // If there's a winner
        if (competition.winner) {
          competitionNamespace.to(roomId).emit('competition-ended', {
            winner: competition.winner,
            completedAt: competition.completedAt
          });
        }
      } catch (error) {
        socket.emit('error', { message: error.message });
      }
    });

    // Leave room
    socket.on('leave-room', (roomId) => {
      socket.leave(roomId);
      socket.to(roomId).emit('participant-left');
    });

    socket.on('disconnect', () => {
      console.log('User disconnected from competition:', socket.id);
    });
  });
};

// In your main server file (server.js or app.js):
/*
const http = require('http');
const socketIo = require('socket.io');

const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST']
  }
});

require('./utils/competitionSocket')(io);

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
*/