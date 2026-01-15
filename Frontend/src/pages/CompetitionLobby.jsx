import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../utils/axios';

const CompetitionLobby = () => {
  const [roomId, setRoomId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [myCompetitions, setMyCompetitions] = useState([]);
  const [showProblemSelector, setShowProblemSelector] = useState(false);
  const [problems, setProblems] = useState([]);
  const [selectedProblem, setSelectedProblem] = useState(null);
  const [loadingProblems, setLoadingProblems] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    fetchMyCompetitions();
  }, []);

  const fetchMyCompetitions = async () => {
    try {
      const response = await axiosClient.get('/api/competition/user/my-competitions');
      setMyCompetitions(response.data.competitions || []);
    } catch (err) {
      console.error('Error fetching competitions:', err);
    }
  };

  const fetchProblems = async () => {
    setLoadingProblems(true);
    setError('');
    try {
      // Try different possible endpoints
      const response = await axiosClient.get('/problem');
      // console.log('Problems response:', response.data);
      
      // Handle different response structures
      let problemsArray = [];
      if (Array.isArray(response.data)) {
        problemsArray = response.data;
      } else if (response.data.problems && Array.isArray(response.data.problems)) {
        problemsArray = response.data.problems;
      } else if (response.data.data && Array.isArray(response.data.data)) {
        problemsArray = response.data.data;
      }
      
      // Filter out any null/undefined problems and ensure required fields exist
      const validProblems = problemsArray.filter(problem => 
        problem && 
        problem._id && 
        problem.title
      );
      
      setProblems(validProblems);
      
      if (validProblems.length === 0) {
        setError('No valid problems available');
      }
    } catch (err) {
      console.error('Error fetching problems:', err);
      setError('Failed to load problems: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoadingProblems(false);
    }
  };

  const handleCreateRoomClick = () => {
    setShowProblemSelector(true);
    fetchProblems();
  };

  const createRoom = async (problemId) => {
    setLoading(true);
    setError('');
    try {
      const response = await axiosClient.post('/api/competition/create', {
        problemId
      });
      if (response.data.success) {
        navigate(`/competition/${response.data.roomId}`);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create room');
      setLoading(false);
    }
  };

  const handleProblemSelect = (problem) => {
    setSelectedProblem(problem);
    setShowProblemSelector(false);
    createRoom(problem._id);
  };

  const joinRoom = async () => {
    if (!roomId.trim()) {
      setError('Please enter a room ID');
      return;
    }
    
    setLoading(true);
    setError('');
    try {
      const response = await axiosClient.post(`/api/competition/join/${roomId.toUpperCase()}`);
      if (response.data.success) {
        navigate(`/competition/${roomId.toUpperCase()}`);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to join room');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      waiting: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      active: 'bg-green-500/20 text-green-400 border-green-500/30',
      completed: 'bg-blue-500/20 text-blue-400 border-blue-500/30'
    };
    return styles[status] || styles.waiting;
  };

  const getDifficultyStyle = (difficulty) => {
    const normalizedDifficulty = (difficulty || 'medium').toLowerCase();
    
    switch(normalizedDifficulty) {
      case 'easy':
        return 'bg-green-500/20 text-green-400 border border-green-500/30';
      case 'medium':
        return 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30';
      case 'hard':
        return 'bg-red-500/20 text-red-400 border border-red-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border border-gray-500/30';
    }
  };

  // Filter problems based on search and difficulty
  const filteredProblems = problems.filter(problem => {
    if (!problem) return false;
    
    const title = problem.title || '';
    const difficulty = (problem.difficulity || '').toLowerCase();
    
    const matchesSearch = title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDifficulty = difficultyFilter === 'all' || difficulty === difficultyFilter.toLowerCase();
    
    return matchesSearch && matchesDifficulty;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8">
      {/* Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-600/5 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-4"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Home
          </button>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
            🏆 Competition Arena
          </h1>
          <p className="text-slate-400">Challenge others and prove your coding skills!</p>
        </div>

        {/* Problem Selector Modal */}
        {showProblemSelector && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-900 rounded-2xl max-w-4xl w-full max-h-[80vh] overflow-hidden border border-slate-800">
              <div className="p-6 border-b border-slate-800">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold">Select a Problem</h2>
                  <button
                    onClick={() => {
                      setShowProblemSelector(false);
                      setError('');
                    }}
                    className="text-slate-400 hover:text-white"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Search and Filter */}
                <div className="flex gap-4">
                  <input
                    type="text"
                    placeholder="Search problems..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-1 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:border-blue-500/50"
                  />
                  <select
                    value={difficultyFilter}
                    onChange={(e) => setDifficultyFilter(e.target.value)}
                    className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:border-blue-500/50"
                  >
                    <option value="all">All Difficulties</option>
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
              </div>

              {/* Problems List */}
              <div className="overflow-y-auto max-h-[calc(80vh-200px)] p-6">
                {loadingProblems ? (
                  <div className="text-center py-12">
                    <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mx-auto"></div>
                    <p className="text-slate-400 mt-4">Loading problems...</p>
                  </div>
                ) : error && problems.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-4xl mb-4">⚠️</div>
                    <p className="text-red-400">{error}</p>
                  </div>
                ) : filteredProblems.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-4xl mb-4">🔍</div>
                    <p className="text-slate-400">No problems found matching your criteria</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredProblems.map((problem) => (
                      <button
                        key={problem._id}
                        onClick={() => handleProblemSelect(problem)}
                        disabled={loading}
                        className="w-full bg-slate-800/50 hover:bg-slate-800 border border-slate-700 hover:border-blue-500/50 rounded-xl p-4 transition-all text-left disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-white mb-1">
                              {problem.title || 'Untitled Problem'}
                            </h3>
                            <p className="text-sm text-slate-400 line-clamp-1">
                              {problem.description || 'No description available'}
                            </p>
                          </div>
                          <div className="ml-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getDifficultyStyle(problem.difficulity)}`}>
                              {problem.difficulity || 'medium'}
                            </span>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Main Actions */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Create Room */}
          <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl p-8 border border-slate-800">
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">🎯</div>
              <h2 className="text-2xl font-bold mb-2">Create New Room</h2>
              <p className="text-slate-400 text-sm">Choose a problem and invite others to compete</p>
            </div>
            <button
              onClick={handleCreateRoomClick}
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl font-semibold hover:from-blue-600 hover:to-purple-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : 'Select Problem & Create'}
            </button>
          </div>

          {/* Join Room */}
          <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl p-8 border border-slate-800">
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">🚪</div>
              <h2 className="text-2xl font-bold mb-2">Join Room</h2>
              <p className="text-slate-400 text-sm">Enter a room ID to join an existing competition</p>
            </div>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Enter Room ID (e.g., ABC123)"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value.toUpperCase())}
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 uppercase"
                maxLength={6}
              />
              <button
                onClick={joinRoom}
                disabled={loading || !roomId.trim()}
                className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl font-semibold hover:from-emerald-600 hover:to-teal-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Joining...' : 'Join Room'}
              </button>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && !showProblemSelector && (
          <div className="mb-8 bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-red-400">
            {error}
          </div>
        )}

        {/* My Competitions */}
        <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl p-8 border border-slate-800">
          <h2 className="text-2xl font-bold mb-6">📜 My Competitions</h2>
          {myCompetitions.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🎮</div>
              <p className="text-slate-400">No competitions yet. Create or join one to get started!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {myCompetitions.map((comp) => (
                <div
                  key={comp._id}
                  className="bg-slate-800/50 rounded-xl p-6 border border-slate-700 hover:border-blue-500/50 transition-all cursor-pointer"
                  onClick={() => navigate(`/competition/${comp.roomId}`)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-white">Room: {comp.roomId}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusBadge(comp.status)}`}>
                          {comp.status}
                        </span>
                      </div>
                      <p className="text-slate-400 text-sm mb-2">{comp.problemId?.title || 'Problem'}</p>
                      <div className="flex items-center gap-4 text-xs text-slate-500">
                        <span>👥 {comp.participants?.length || 0} participants</span>
                        <span>📅 {new Date(comp.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    {comp.winner && (
                      <div className="text-center ml-4">
                        <div className="text-2xl mb-1">🏆</div>
                        <p className="text-xs text-slate-400">Winner</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CompetitionLobby;