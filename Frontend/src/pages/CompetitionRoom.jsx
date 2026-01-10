// src/pages/CompetitionRoom.jsx
import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { io } from 'socket.io-client';
import axiosClient from '../utils/axios';
import Editor from '@monaco-editor/react';

const CompetitionRoom = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const socketRef = useRef(null);

  const [competition, setCompetition] = useState(null);
  const [loading, setLoading] = useState(true);
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [opponentStatus, setOpponentStatus] = useState(null);

  useEffect(() => {
    fetchCompetition();
    initializeSocket();

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [roomId]);

  const initializeSocket = () => {
    socketRef.current = io('http://localhost:3000/competition', {
      transports: ['websocket']
    });

    socketRef.current.emit('join-room', { roomId, userId: user._id });

    socketRef.current.on('room-joined', ({ competition }) => {
      setCompetition(competition);
    });

    socketRef.current.on('participant-joined', ({ participantCount }) => {
      fetchCompetition();
    });

    socketRef.current.on('competition-started', () => {
      fetchCompetition();
    });

    socketRef.current.on('opponent-coding', () => {
      setOpponentStatus('typing...');
      setTimeout(() => setOpponentStatus(null), 2000);
    });

    socketRef.current.on('submission-made', ({ userId, isCorrect, winner }) => {
      if (userId !== user._id) {
        setOpponentStatus(isCorrect ? '✅ Submitted correct solution!' : '❌ Wrong answer');
      }
      fetchCompetition();
    });

    socketRef.current.on('competition-ended', ({ winner }) => {
      fetchCompetition();
    });
  };

  const fetchCompetition = async () => {
    try {
      const response = await axiosClient.get(`/api/competition/${roomId}`);
      setCompetition(response.data.competition);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching competition:', err);
      setLoading(false);
    }
  };

  const handleCodeChange = (value) => {
    setCode(value);
    if (socketRef.current) {
      socketRef.current.emit('coding', { roomId, userId: user._id });
    }
  };

  const submitSolution = async () => {
    setSubmitting(true);
    setResult(null);
    try {
      const response = await axiosClient.post(`/api/competition/${roomId}/submit`, {
        code,
        language
      });

      setResult(response.data);
      fetchCompetition();
    } catch (err) {
      setResult({
        success: false,
        errorMessage: err.response?.data?.message || 'Submission failed'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const copyRoomId = () => {
    navigator.clipboard.writeText(roomId);
    alert('Room ID copied to clipboard!');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-white text-xl">Loading competition...</div>
      </div>
    );
  }

  if (!competition) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">😕</div>
          <p className="text-white text-xl mb-4">Competition not found</p>
          <button
            onClick={() => navigate('/competition')}
            className="px-6 py-3 bg-blue-500 rounded-lg hover:bg-blue-600"
          >
            Back to Lobby
          </button>
        </div>
      </div>
    );
  }

  const problem = competition.problemId;
  const isWaiting = competition.status === 'waiting';
  const isActive = competition.status === 'active';
  const isCompleted = competition.status === 'completed';
  const isWinner = competition.winner?._id === user._id;

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <div className="bg-slate-900/50 backdrop-blur-xl border-b border-slate-800 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/competition')}
              className="text-slate-400 hover:text-white"
            >
              ← Back
            </button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold">Room: {roomId}</h1>
                <button
                  onClick={copyRoomId}
                  className="px-3 py-1 bg-slate-800 rounded-lg text-sm hover:bg-slate-700"
                >
                  📋 Copy
                </button>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  isWaiting ? 'bg-yellow-500/20 text-yellow-400' :
                  isActive ? 'bg-green-500/20 text-green-400' :
                  'bg-blue-500/20 text-blue-400'
                }`}>
                  {competition.status}
                </span>
              </div>
              <p className="text-slate-400 text-sm">
                {competition.participants.length}/{competition.maxParticipants} participants
              </p>
            </div>
          </div>
          {opponentStatus && (
            <div className="text-sm text-slate-400 italic">{opponentStatus}</div>
          )}
        </div>
      </div>

      {/* Waiting Screen */}
      {isWaiting && (
        <div className="max-w-4xl mx-auto mt-20 text-center">
          <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl p-12 border border-slate-800">
            <div className="text-8xl mb-6">⏳</div>
            <h2 className="text-3xl font-bold mb-4">Waiting for Opponent...</h2>
            <p className="text-slate-400 mb-6">
              Share the room ID with your friend to start the competition
            </p>
            <div className="bg-slate-800 rounded-xl p-6 mb-6">
              <p className="text-sm text-slate-400 mb-2">Room ID:</p>
              <div className="flex items-center justify-center gap-4">
                <p className="text-4xl font-mono font-bold tracking-wider">{roomId}</p>
                <button
                  onClick={copyRoomId}
                  className="px-4 py-2 bg-blue-500 rounded-lg hover:bg-blue-600"
                >
                  Copy
                </button>
              </div>
            </div>
            <p className="text-slate-500 text-sm">
              Competition will start automatically when both players join
            </p>
          </div>
        </div>
      )}

      {/* Active Competition */}
      {(isActive || isCompleted) && (
        <div className="flex h-[calc(100vh-80px)]">
          {/* Left Panel - Problem */}
          <div className="w-1/3 bg-slate-900/30 p-6 overflow-y-auto border-r border-slate-800">
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-2">{problem.title}</h2>
              <div className="flex items-center gap-2 mb-4">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  problem.difficulity === 'easy' ? 'bg-green-500/20 text-green-400' :
                  problem.difficulity === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                  'bg-red-500/20 text-red-400'
                }`}>
                  {problem.difficulity}
                </span>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Description</h3>
              <p className="text-slate-300 leading-relaxed">{problem.description}</p>
            </div>

            {problem.visibletestcases?.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3">Examples</h3>
                {problem.visibletestcases.map((tc, idx) => (
                  <div key={idx} className="bg-slate-800/50 rounded-lg p-4 mb-3">
                    <p className="text-sm text-slate-400 mb-1">Input:</p>
                    <pre className="text-sm text-white mb-2">{tc.input}</pre>
                    <p className="text-sm text-slate-400 mb-1">Output:</p>
                    <pre className="text-sm text-white">{tc.output}</pre>
                  </div>
                ))}
              </div>
            )}

            {/* Participants */}
            <div className="bg-slate-800/30 rounded-lg p-4">
              <h3 className="text-sm font-semibold mb-3">Participants</h3>
              {competition.participants.map((p) => (
                <div key={p.userId._id} className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-2">
                    <img
                      src={p.userId.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${p.userId.firstname}`}
                      alt={p.userId.firstname}
                      className="w-8 h-8 rounded-full"
                    />
                    <span className="text-sm">
                      {p.userId.firstname} {p.userId.lastname}
                      {p.userId._id === user._id && ' (You)'}
                    </span>
                  </div>
                  {p.isCorrect && <span className="text-green-400">✓</span>}
                </div>
              ))}
            </div>
          </div>

          {/* Right Panel - Editor */}
          <div className="flex-1 flex flex-col">
            <div className="bg-slate-900/30 p-4 border-b border-slate-800 flex items-center justify-between">
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="px-4 py-2 bg-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isCompleted}
              >
                <option value="javascript">JavaScript</option>
                <option value="python">Python</option>
                <option value="cpp">C++</option>
                <option value="java">Java</option>
              </select>
              <button
                onClick={submitSolution}
                disabled={submitting || !code || isCompleted}
                className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Submitting...' : 'Submit Solution'}
              </button>
            </div>

            <div className="flex-1">
              <Editor
                height="100%"
                language={language === 'cpp' ? 'cpp' : language}
                value={code}
                onChange={handleCodeChange}
                theme="vs-dark"
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  readOnly: isCompleted
                }}
              />
            </div>

            {/* Result Panel */}
            {result && (
              <div className={`p-4 border-t ${
                result.allPassed 
                  ? 'bg-green-500/10 border-green-500/30' 
                  : 'bg-red-500/10 border-red-500/30'
              }`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`font-semibold ${
                      result.allPassed ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {result.allPassed ? '✓ All test cases passed!' : '✗ Some test cases failed'}
                    </p>
                    <p className="text-sm text-slate-400">
                      {result.testCasesPassed}/{result.totalTestCases} test cases passed
                    </p>
                    {result.runtime && (
                      <p className="text-xs text-slate-500">
                        Runtime: {result.runtime.toFixed(2)}s | Memory: {result.memory}KB
                      </p>
                    )}
                  </div>
                  {result.winner && (
                    <div className="text-2xl">🏆</div>
                  )}
                </div>
                {result.errorMessage && (
                  <pre className="mt-2 text-xs text-red-400 overflow-x-auto">{result.errorMessage}</pre>
                )}
              </div>
            )}

            {/* Winner Announcement */}
            {isCompleted && competition.winner && (
              <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border-t border-yellow-500/30 p-6 text-center">
                <div className="text-6xl mb-4">🎉</div>
                <h2 className="text-2xl font-bold mb-2">
                  {isWinner ? 'Congratulations! You Won! 🏆' : 'Competition Ended'}
                </h2>
                <p className="text-slate-400">
                  Winner: {competition.winner.firstname} {competition.winner.lastname}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CompetitionRoom;