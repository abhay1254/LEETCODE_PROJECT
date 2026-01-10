import { useEffect, useState, useMemo } from 'react';
import { NavLink } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import axiosClient from '../utils/axios';
import { logoutUser } from '../authslice';
import { 
  Search, Grid3x3, List, User, Settings, LogOut, 
  Trophy, Target, TrendingUp, Zap, Code, BookOpen,
  Filter, CheckCircle2, Circle, Star, ChevronRight,
  Sparkles, Flame, Award
} from 'lucide-react';

function Homepage() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [problems, setProblems] = useState([]);
  const [solvedProblems, setSolvedProblems] = useState([]);
  const [filters, setFilters] = useState({
    difficulty: 'all',
    tags: 'all',
    status: 'all'
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [activeView, setActiveView] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [problemsRes, solvedRes] = await Promise.all([
          axiosClient.get('/problem/'),
          user ? axiosClient.get('/problem/problemsolvebyuser') : Promise.resolve({ data: [] })
        ]);
        
        setProblems(problemsRes.data);
        
        // Remove duplicates from solved problems
        const uniqueSolved = solvedRes.data.filter((problem, index, self) => 
          problem && index === self.findIndex(p => p && p._id === problem._id)
        );
        
        setSolvedProblems(uniqueSolved);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const handleLogout = () => {
    dispatch(logoutUser());
    setSolvedProblems([]);
  };

  const stats = useMemo(() => ({
    total: problems.length,
    solved: solvedProblems.length,
    easy: problems.filter(p => p.difficulty?.toLowerCase() === 'easy').length,
    medium: problems.filter(p => p.difficulty?.toLowerCase() === 'medium').length,
    hard: problems.filter(p => p.difficulty?.toLowerCase() === 'hard').length,
    progress: problems.length > 0 ? Math.round((solvedProblems.length / problems.length) * 100) : 0,
    streak: user?.currentStreak || 0,
    longestStreak: user?.longestStreak || 0,
    rank: user?.rank || 0
  }), [problems, solvedProblems, user]);

  const filteredProblems = useMemo(() => {
    return problems.filter(problem => {
      const matchesSearch = problem.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          problem.tags.toLowerCase().includes(searchTerm.toLowerCase());
      const difficultyMatch = filters.difficulty === 'all' || problem.difficulty === filters.difficulty;
      const tagMatch = filters.tags === 'all' || problem.tags === filters.tags;
      const statusMatch = filters.status === 'all' || 
                        (filters.status === 'solved' && solvedProblems.some(sp => sp && sp._id === problem._id)) ||
                        (filters.status === 'unsolved' && !solvedProblems.some(sp => sp && sp._id === problem._id));
      
      return matchesSearch && difficultyMatch && tagMatch && statusMatch;
    });
  }, [problems, solvedProblems, filters, searchTerm]);

  // Early return or show login prompt if no user
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4">Please Log In</h2>
          <p className="text-slate-400 mb-6">You need to be logged in to view problems</p>
          <NavLink to="/login" className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl font-semibold">
            Go to Login
          </NavLink>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      {/* Enhanced Animated Background */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-pink-600/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px]"></div>
      </div>

      {/* Modern Navigation */}
      <nav className="border-b border-slate-800/50 sticky top-0 z-50 backdrop-blur-xl bg-slate-950/80 shadow-2xl">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <NavLink to="/" className="flex items-center gap-3 group">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center font-bold text-lg group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-blue-500/25">
                  <Code className="w-6 h-6 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              </div>
              <div>
                <div className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  CodeCraft
                </div>
                <div className="text-xs text-slate-400">Master. Code. Conquer.</div>
              </div>
            </NavLink>

            <div className="flex items-center gap-4">
              {/* View Toggle */}
              <div className="hidden md:flex items-center gap-2 bg-slate-900/50 border border-slate-800 rounded-xl p-1.5 shadow-lg">
                <button
                  onClick={() => setActiveView('grid')}
                  className={`p-2.5 rounded-lg transition-all ${
                    activeView === 'grid' 
                      ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg' 
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <Grid3x3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setActiveView('list')}
                  className={`p-2.5 rounded-lg transition-all ${
                    activeView === 'list' 
                      ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg' 
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>

              {/* User Menu */}
              <div className="relative group">
                <div className="flex items-center gap-3 cursor-pointer bg-slate-900/50 border border-slate-800 rounded-xl px-4 py-2.5 hover:border-slate-700 transition-all shadow-lg">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center font-bold text-sm">
                    {user.firstname?.charAt(0).toUpperCase()}
                  </div>
                  <div className="hidden md:block">
                    <div className="text-sm font-semibold text-white">{user.firstname}</div>
                    <div className="text-xs text-slate-400">Level {Math.floor(stats.solved / 10) + 1}</div>
                  </div>
                </div>

                {/* Dropdown Menu */}
                <div className="absolute right-0 mt-2 w-80 bg-slate-900/95 border border-slate-800 rounded-2xl shadow-2xl backdrop-blur-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 overflow-hidden">
                  {/* User Info Header */}
                  <div className="p-6 bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-b border-slate-800">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg">
                        {user.firstname?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-white text-lg">{user.firstname}</p>
                        <p className="text-xs text-slate-400">{user.emailId}</p>
                      </div>
                    </div>
                    
                    {/* Mini Stats */}
                    <div className="grid grid-cols-3 gap-2">
                      <div className="bg-slate-800/50 rounded-lg p-2 text-center">
                        <div className="text-xs text-slate-400">Solved</div>
                        <div className="text-lg font-bold text-blue-400">{stats.solved}</div>
                      </div>
                      <div className="bg-slate-800/50 rounded-lg p-2 text-center">
                        <div className="text-xs text-slate-400">Streak</div>
                        <div className="text-lg font-bold text-orange-400">{stats.streak}</div>
                      </div>
                      <div className="bg-slate-800/50 rounded-lg p-2 text-center">
                        <div className="text-xs text-slate-400">Rank</div>
                        <div className="text-lg font-bold text-purple-400">#{stats.rank}</div>
                      </div>
                    </div>
                  </div>

                  {/* Menu Items */}
                  <div className="p-2">
                    <NavLink 
                      to={`/profile/${user._id}`} 
                      className="flex items-center gap-3 px-4 py-3 text-slate-300 hover:bg-slate-800 rounded-xl transition-all group/item"
                    >
                      <User className="w-5 h-5 text-blue-400" />
                      <span className="font-medium">View Profile</span>
                      <ChevronRight className="w-4 h-4 ml-auto opacity-0 group-hover/item:opacity-100 transition-opacity" />
                    </NavLink>
                    
                    {user.role === 'admin' && (
                      <NavLink 
                        to="/admin" 
                        className="flex items-center gap-3 px-4 py-3 text-slate-300 hover:bg-slate-800 rounded-xl transition-all group/item"
                      >
                        <Settings className="w-5 h-5 text-purple-400" />
                        <span className="font-medium">Admin Panel</span>
                        <ChevronRight className="w-4 h-4 ml-auto opacity-0 group-hover/item:opacity-100 transition-opacity" />
                      </NavLink>
                    )}

                    <div className="my-2 border-t border-slate-800"></div>

                    <button 
                      onClick={handleLogout} 
                      className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-xl transition-all group/item"
                    >
                      <LogOut className="w-5 h-5" />
                      <span className="font-medium">Logout</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>
      {/* Exclusive Interview Feature Banner */}
      <div className="max-w-7xl mx-auto px-6 pt-8 pb-4">
        <div className="relative group">
          {/* Refined glow effect - Blue/Purple theme */}
          <div className="absolute -inset-2 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-3xl blur-xl opacity-50 group-hover:opacity-75 animate-pulse transition-opacity duration-500"></div>
          
          {/* Main banner */}
          <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-2 border-blue-500/30 rounded-3xl p-8 backdrop-blur-xl overflow-hidden shadow-2xl hover:shadow-blue-500/20 transition-all duration-500">
            {/* Subtle animated background */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
              <div className="absolute -top-10 left-1/4 w-40 h-40 bg-blue-500/15 rounded-full blur-3xl animate-pulse"></div>
              <div className="absolute -bottom-10 right-1/4 w-40 h-40 bg-purple-500/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '0.7s' }}></div>
              <div className="absolute top-1/2 left-1/2 w-48 h-48 bg-indigo-500/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1.4s' }}></div>
            </div>

            {/* Content */}
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-6 flex-1">
                {/* Clean icon design */}
                <div className="relative flex-shrink-0">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl blur-md opacity-60 animate-pulse"></div>
                  <div className="relative w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-500/40 group-hover:scale-110 transition-transform duration-500">
                    <Sparkles className="w-10 h-10 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2">
                    <div className="w-5 h-5 bg-emerald-400 rounded-full animate-pulse shadow-lg shadow-emerald-400/50 flex items-center justify-center">
                      <span className="text-xs font-black text-white">!</span>
                    </div>
                  </div>
                </div>

                {/* Clean text content */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3 flex-wrap">
                    <span className="px-4 py-1.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs font-bold rounded-full uppercase tracking-wider shadow-lg border border-blue-400/30">
                      ⚡ Limited Time
                    </span>
                    <span className="px-4 py-1.5 bg-emerald-500/20 text-emerald-300 text-xs font-bold rounded-full border border-emerald-400/50 shadow-lg">
                      Free Access
                    </span>
                    <span className="px-3 py-1 bg-orange-500/20 text-orange-300 text-xs font-bold rounded-full border border-orange-400/50">
                      New Feature
                    </span>
                  </div>
                  <h2 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-blue-300 via-purple-300 to-indigo-300 bg-clip-text text-transparent mb-2 group-hover:scale-[1.02] transition-transform leading-tight">
                    AI-Powered Mock Interviews
                  </h2>
                  <p className="text-slate-300 text-base leading-relaxed">
                    Practice with our <span className="text-blue-400 font-bold">AI interviewer</span> and get 
                    <span className="text-purple-400 font-bold"> real-time feedback</span> on your performance
                    <span className="inline-block mx-2">✨</span>
                  </p>
                  <div className="flex items-center gap-4 mt-3 text-sm text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                      <span>1,234+ completed</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                      <span className="text-yellow-400 font-semibold">4.9/5</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Clean CTA Button */}
              <NavLink to="/interview" className="flex-shrink-0">
                <button className="relative group/btn">
                  {/* Button glow */}
                  <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl blur-lg opacity-60 group-hover/btn:opacity-100 transition-opacity"></div>
                  
                  {/* Main button */}
                  <div className="relative px-10 py-5 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-2xl shadow-2xl shadow-blue-500/50 hover:shadow-blue-500/75 hover:scale-105 transition-all duration-300 overflow-hidden">
                    {/* Shimmer effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000"></div>
                    
                    {/* Button content */}
                    <div className="relative flex flex-col items-center gap-1">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">Start Interview</span>
                        <ChevronRight className="w-5 h-5 group-hover/btn:translate-x-2 transition-transform" />
                      </div>
                      <span className="text-xs opacity-80 font-normal">Free for Limited Time </span>
                    </div>
                  </div>
                </button>
              </NavLink>
            </div>

            {/* Subtle corner elements */}
            <div className="absolute top-0 right-0 w-32 h-32 border-t-2 border-r-2 border-blue-400/10 rounded-tr-3xl"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 border-b-2 border-l-2 border-purple-400/10 rounded-bl-3xl"></div>
          </div>

          {/* Clean tooltip on hover */}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-6 w-96 bg-slate-900/98 border-2 border-blue-500/40 rounded-2xl p-7 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 shadow-2xl backdrop-blur-xl z-50">
            {/* Tooltip glow */}
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl blur-lg"></div>
            
            <div className="relative">
              <div className="flex items-start gap-4 mb-5">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-xl">
                  <Award className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-xl mb-1">
                    Why This Feature Rocks
                  </h3>
                  <p className="text-slate-400 text-sm">Everything you need to ace interviews</p>
                </div>
              </div>

              <ul className="space-y-3 mb-5">
                {[
                  { icon: "💼", text: "Real questions from top tech companies", color: "blue" },
                  { icon: "🤖", text: "Instant AI feedback on your answers", color: "purple" },
                  { icon: "♾️", text: "Unlimited practice sessions - 100% free", color: "emerald" },
                  { icon: "📊", text: "Track your progress and improvements", color: "indigo" },
                  { icon: "🎯", text: "Adaptive difficulty based on your level", color: "cyan" }
                ].map((item, index) => (
                  <li key={index} className="flex items-start gap-3 group/item">
                    <div className={`w-8 h-8 bg-${item.color}-500/10 border border-${item.color}-500/30 rounded-lg flex items-center justify-center flex-shrink-0 group-hover/item:scale-110 group-hover/item:bg-${item.color}-500/20 transition-all`}>
                      <span className="text-base">{item.icon}</span>
                    </div>
                    <span className="text-slate-300 text-sm leading-relaxed pt-1">{item.text}</span>
                  </li>
                ))}
              </ul>

              <div className="pt-5 border-t border-slate-700">
                <div className="flex items-center justify-between bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl p-4 border border-blue-400/30">
                  <div>
                    <p className="text-xs text-slate-400 mb-1">Usually costs</p>
                    <p className="text-2xl font-bold text-slate-400 line-through decoration-slate-600">$99<span className="text-sm">/mo</span></p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-emerald-400 font-bold mb-1">Limited offer</p>
                    <p className="text-3xl font-black bg-gradient-to-r from-emerald-400 to-green-400 bg-clip-text text-transparent">FREE</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8"></div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Enhanced Hero Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* Main Progress Card */}
          <div className="md:col-span-2 bg-gradient-to-br from-slate-900/80 to-slate-900/40 border border-slate-800/50 rounded-2xl p-8 hover:border-slate-700 transition-all backdrop-blur-xl shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl"></div>
            <div className="relative z-10">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Trophy className="w-5 h-5 text-yellow-400" />
                    <h3 className="text-slate-400 text-sm font-semibold uppercase tracking-wider">Your Progress</h3>
                  </div>
                  <div className="text-6xl font-black bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
                    {stats.progress}%
                  </div>
                  <p className="text-slate-400 text-sm">
                    <span className="text-white font-bold">{stats.solved}</span> of {stats.total} challenges conquered
                  </p>
                </div>
                
                {/* Circular Progress */}
                <div className="relative w-24 h-24">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="48"
                      cy="48"
                      r="40"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="none"
                      className="text-slate-800"
                    />
                    <circle
                      cx="48"
                      cy="48"
                      r="40"
                      stroke="url(#gradient)"
                      strokeWidth="8"
                      fill="none"
                      strokeDasharray={`${stats.progress * 2.51} 251`}
                      strokeLinecap="round"
                      className="transition-all duration-1000"
                    />
                    <defs>
                      <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#3b82f6" />
                        <stop offset="100%" stopColor="#a855f7" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Sparkles className="w-8 h-8 text-yellow-400" />
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="relative h-3 bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full transition-all duration-1000 shadow-lg shadow-blue-500/50"
                  style={{ width: `${stats.progress}%` }}
                >
                  <div className="absolute inset-0 bg-white/20 animate-shimmer"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Streak Card */}
          <div className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-500/30 rounded-2xl p-6 hover:scale-105 transition-all backdrop-blur-xl shadow-2xl relative overflow-hidden group cursor-pointer">
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-orange-500/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-3">
                <Flame className="w-8 h-8 text-orange-400" />
                <Star className="w-5 h-5 text-yellow-400" />
              </div>
              <div className="text-sm font-semibold text-orange-400 mb-1">Day Streak</div>
              <div className="text-4xl font-black text-white">{stats.streak}</div>
              <div className="text-xs text-slate-400 mt-1">Keep it up! 🔥</div>
            </div>
          </div>

          {/* Rank Card */}
          <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-2xl p-6 hover:scale-105 transition-all backdrop-blur-xl shadow-2xl relative overflow-hidden group cursor-pointer">
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-purple-500/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-3">
                <Award className="w-8 h-8 text-purple-400" />
                <TrendingUp className="w-5 h-5 text-green-400" />
              </div>
              <div className="text-sm font-semibold text-purple-400 mb-1">Global Rank</div>
              <div className="text-4xl font-black text-white">#{stats.rank}</div>
              <div className="text-xs text-slate-400 mt-1">Top 5% 🎯</div>
            </div>
          </div>
        </div>

        {/* Difficulty Stats Row */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Easy', count: stats.easy, icon: Target, color: 'emerald', gradient: 'from-emerald-500 to-green-500' },
            { label: 'Medium', count: stats.medium, icon: Zap, color: 'amber', gradient: 'from-amber-500 to-orange-500' },
            { label: 'Hard', count: stats.hard, icon: Flame, color: 'red', gradient: 'from-red-500 to-pink-500' },
          ].map((stat) => {
            const Icon = stat.icon;
            return (
              <div 
                key={stat.label} 
                className={`bg-slate-900/50 border border-slate-800 rounded-xl p-6 hover:scale-105 transition-all backdrop-blur-xl shadow-xl group cursor-pointer relative overflow-hidden`}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-10 transition-opacity`}></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Icon className="w-5 h-5 text-slate-400" />
                    </div>
                    <div className="text-sm font-semibold px-3 py-1 bg-slate-800 text-slate-400 rounded-full">
                      {stat.label}
                    </div>
                  </div>
                  <div className="text-4xl font-black text-white mb-1">{stat.count}</div>
                  <div className="text-xs text-slate-400">Problems available</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Search and Filters Section */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 mb-8 backdrop-blur-xl shadow-2xl">
          {/* Search Bar */}
          <div className="relative mb-6">
            <Search className="w-5 h-5 text-slate-500 absolute left-4 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by title, tag, or challenge type..."
              className="w-full pl-12 pr-6 py-4 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white"
              >
                ✕
              </button>
            )}
          </div>

          {/* Filter Buttons */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-slate-300 hover:text-white hover:border-slate-600 transition-all"
            >
              <Filter className="w-4 h-4" />
              Filters
            </button>

            {[
              { value: 'all', label: 'All', icon: BookOpen },
              { value: 'solved', label: 'Solved', icon: CheckCircle2 },
              { value: 'unsolved', label: 'Todo', icon: Circle }
            ].map((option) => {
              const Icon = option.icon;
              return (
                <button
                  key={option.value}
                  onClick={() => setFilters({...filters, status: option.value})}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                    filters.status === option.value
                      ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg shadow-blue-500/25'
                      : 'bg-slate-800/50 text-slate-400 border border-slate-700 hover:text-white hover:border-slate-600'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {option.label}
                </button>
              );
            })}
          </div>

          {/* Expanded Filters */}
          {showFilters && (
            <div className="mt-6 pt-6 border-t border-slate-800 space-y-4">
              <div>
                <div className="text-sm font-semibold text-slate-400 mb-3">Difficulty Level</div>
                <div className="flex flex-wrap gap-2">
                  {[
                    { value: 'all', label: 'All Levels' },
                    { value: 'easy', label: 'Easy' },
                    { value: 'medium', label: 'Medium' },
                    { value: 'hard', label: 'Hard' },
                  ].map((level) => (
                    <button
                      key={level.value}
                      onClick={() => setFilters({...filters, difficulty: level.value})}
                      className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                        filters.difficulty === level.value
                          ? 'bg-purple-600 text-white shadow-lg'
                          : 'bg-slate-800/50 text-slate-400 border border-slate-700 hover:text-white hover:border-slate-600'
                      }`}
                    >
                      {level.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Results Count */}
        <div className="flex items-center justify-between mb-6">
          <div className="text-slate-400">
            Showing <span className="text-white font-bold">{filteredProblems.length}</span> of {problems.length} problems
          </div>
          <div className="text-sm text-slate-500">
            {stats.solved > 0 && `You've solved ${stats.solved} problems! 🎉`}
          </div>
        </div>

        {/* Problems Grid/List */}
        {isLoading ? (
          <div className={`grid ${activeView === 'grid' ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1'} gap-4`}>
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 animate-pulse">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-slate-800 rounded-xl"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-slate-800 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-slate-800 rounded w-1/2"></div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <div className="h-6 bg-slate-800 rounded-full w-16"></div>
                  <div className="h-6 bg-slate-800 rounded-full w-20"></div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredProblems.length === 0 ? (
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-16 text-center backdrop-blur-xl">
            <div className="w-24 h-24 bg-slate-800/50 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-slate-700">
              <Search className="w-12 h-12 text-slate-600" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">No Challenges Found</h3>
            <p className="text-slate-400 mb-6">
              Try adjusting your search criteria or explore different difficulty levels.
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setFilters({ difficulty: 'all', tags: 'all', status: 'all' });
              }}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl font-semibold hover:shadow-lg hover:shadow-blue-500/25 transition-all"
            >
              Clear All Filters
            </button>
          </div>
        ) : activeView === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredProblems.map((problem, index) => (
              <ProblemGridCard 
                key={problem._id} 
                problem={problem} 
                index={index}
                isSolved={solvedProblems.some(sp => sp && sp._id === problem._id)}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredProblems.map((problem, index) => (
              <ProblemListCard 
                key={problem._id} 
                problem={problem} 
                index={index}
                isSolved={solvedProblems.some(sp => sp && sp._id === problem._id)}
              />
            ))}
          </div>
        )}
      </div>

      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
      `}</style>
    </div>
  );
}

// Enhanced Grid View Card
const ProblemGridCard = ({ problem, index, isSolved }) => {
  return (
    <NavLink to={`/problem/${problem._id}`}>
      <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 hover:border-slate-700 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/10 transition-all group cursor-pointer h-full flex flex-col backdrop-blur-xl relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
        
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-sm transition-all ${
                isSolved 
                  ? 'bg-gradient-to-br from-emerald-500 to-green-500 text-white shadow-lg shadow-emerald-500/25' 
                  : 'bg-slate-800 text-slate-400'
              }`}>
                {isSolved ? <CheckCircle2 className="w-6 h-6" /> : `#${index + 1}`}
              </div>
            </div>
            <span className={`px-3 py-1.5 rounded-lg text-xs font-bold shadow-lg ${
              problem.difficulty === 'easy' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
              problem.difficulty === 'medium' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
              'bg-red-500/20 text-red-400 border border-red-500/30'
            }`}>
              {problem.difficulty}
            </span>
          </div>
          
          <h3 className="text-lg font-bold text-white mb-3 group-hover:text-blue-400 transition-colors line-clamp-2 leading-tight">
            {problem.title}
          </h3>
          <p className="text-slate-400 text-sm mb-4 flex-grow line-clamp-2 leading-relaxed">
            {problem.description || 'Master this challenge to enhance your skills'}
          </p>

          <div className="flex items-center justify-between pt-4 border-t border-slate-800">
            <span className="px-3 py-1.5 bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-400 rounded-lg text-xs font-semibold border border-purple-400/30">
              {problem.tags}
            </span>
            <div className="flex items-center gap-2 text-slate-400 group-hover:text-blue-400 group-hover:translate-x-1 transition-all">
              <span className="text-xs font-medium">Solve</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>
    </NavLink>
  );
};

// Enhanced List View Card
const ProblemListCard = ({ problem, index, isSolved }) => {
  return (
    <NavLink to={`/problem/${problem._id}`}>
      <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 hover:border-slate-700 hover:bg-slate-900/80 hover:shadow-2xl hover:shadow-blue-500/10 transition-all group cursor-pointer backdrop-blur-xl relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
        
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-6 flex-1">
            <div className={`w-16 h-16 rounded-xl flex items-center justify-center font-bold text-lg transition-all ${
              isSolved 
                ? 'bg-gradient-to-br from-emerald-500 to-green-500 text-white shadow-lg shadow-emerald-500/25' 
                : 'bg-slate-800 text-slate-400'
            }`}>
              {isSolved ? <CheckCircle2 className="w-8 h-8" /> : `#${index + 1}`}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors truncate">
                  {problem.title}
                </h3>
                {isSolved && (
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-lg text-sm font-semibold border border-emerald-400/30">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Solved</span>
                  </div>
                )}
              </div>
              <p className="text-slate-400 text-sm mb-3 line-clamp-1">
                {problem.description || 'Challenge yourself with this problem'}
              </p>
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1.5 rounded-lg text-xs font-bold shadow-lg ${
                  problem.difficulty === 'easy' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                  problem.difficulty === 'medium' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                  'bg-red-500/20 text-red-400 border border-red-500/30'
                }`}>
                  {problem.difficulty}
                </span>
                <span className="px-3 py-1.5 bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-400 rounded-lg text-xs font-semibold border border-purple-400/30">
                  {problem.tags}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-slate-400 group-hover:text-blue-400 group-hover:translate-x-2 transition-all ml-4">
            <span className="text-sm font-medium hidden lg:block">Start Challenge</span>
            <ChevronRight className="w-6 h-6" />
          </div>
        </div>
      </div>
    </NavLink>
  );
};

export default Homepage;