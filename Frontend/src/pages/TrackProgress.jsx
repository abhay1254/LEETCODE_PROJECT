    // src/pages/TrackProgress.jsx
    import { useState, useEffect } from 'react';
    import { useNavigate, useParams } from 'react-router-dom';
    import axiosClient from '../utils/axios';

    const TrackProgress = () => {
    const [streakData, setStreakData] = useState(null);
    const [monthlyData, setMonthlyData] = useState(null);
    const [profileData, setProfileData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [allProblems, setAllProblems] = useState([]); 
    const navigate = useNavigate();
    const { userId } = useParams();

    useEffect(() => {
        const fetchProgressData = async () => {
        try {
            const [streakRes, monthlyRes, profileRes, problemsRes] = await Promise.all([
            axiosClient.get('/api/profile/streak'),
            axiosClient.get('/api/profile/monthly-progress'),
            axiosClient.get('/api/profile'),
            axiosClient.get('/problem/') ,
            ]);

            setStreakData(streakRes.data.data);
            setMonthlyData(monthlyRes.data.data);
            setProfileData(profileRes.data.data);
            setAllProblems(problemsRes.data || []);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching progress data:', error);
            setLoading(false);
        }
        };

        fetchProgressData();
    }, [userId]);
    
    

    if (loading) {
        return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center">
            <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
            </div>
        </div>
        );
    }

        const totalProblems = allProblems.length;
        const totalSolved = profileData?.stats?.easy + profileData?.stats?.medium + profileData?.stats?.hard || 0;
        const progressPercentage = totalProblems > 0 ? ((totalSolved / totalProblems) * 100).toFixed(1) : 0;

    return (
        <div className="min-h-screen bg-slate-950 text-white">
        {/* Background */}
        <div className="fixed inset-0 -z-10">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-600/5 rounded-full blur-3xl"></div>
        </div>

        {/* Header */}
        <div className="border-b border-slate-800/50 backdrop-blur-xl bg-slate-950/80">
            <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <button 
                onClick={() => navigate(`/profile/${userId}`)}
                className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Profile
            </button>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                📊 Track Your Progress
            </h1>
            <div className="w-24"></div>
            </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
            {/* Overall Progress Card */}
            <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl p-8 border border-slate-800">
            <div className="flex items-center justify-between mb-6">
                <div>
                <h2 className="text-3xl font-bold text-white mb-2">Your Journey</h2>
                <p className="text-slate-400">Keep pushing forward, you're doing great!</p>
                </div>
                <div className="text-5xl">🎯</div>
            </div>

            {/* Progress Bar */}
            <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-slate-400">Overall Progress</span>
                <span className="text-lg font-bold text-blue-400">{progressPercentage}%</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-4 overflow-hidden">
                <div 
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500"
                    style={{ width: `${progressPercentage}%` }}
                ></div>
                </div>
                <div className="flex items-center justify-between mt-2 text-sm text-slate-500">
                <span>{totalSolved} solved</span>
                <span>{totalProblems} total</span>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-4">
                <div className="bg-emerald-500/10 rounded-xl p-4 border border-emerald-500/30 text-center">
                <div className="text-3xl font-bold text-emerald-400">{profileData?.stats?.easy || 0}</div>
                <div className="text-sm text-slate-400 mt-1">Easy</div>
                </div>
                <div className="bg-amber-500/10 rounded-xl p-4 border border-amber-500/30 text-center">
                <div className="text-3xl font-bold text-amber-400">{profileData?.stats?.medium || 0}</div>
                <div className="text-sm text-slate-400 mt-1">Medium</div>
                </div>
                <div className="bg-rose-500/10 rounded-xl p-4 border border-rose-500/30 text-center">
                <div className="text-3xl font-bold text-rose-400">{profileData?.stats?.hard || 0}</div>
                <div className="text-sm text-slate-400 mt-1">Hard</div>
                </div>
            </div>
            </div>

            {/* Streak Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-900/50 backdrop-blur-xl rounded-xl p-6 border border-orange-500/30">
                <div className="flex items-center gap-4 mb-4">
                <div className="text-5xl">🔥</div>
                <div>
                    <h3 className="text-xl font-bold text-white">Current Streak</h3>
                    <p className="text-slate-400 text-sm">Days in a row</p>
                </div>
                </div>
                <div className="text-6xl font-bold text-orange-400">
                {streakData?.currentStreak || 0}
                </div>
                <p className="text-slate-500 text-sm mt-2">
                Last solved: {streakData?.lastSolvedDate ? new Date(streakData.lastSolvedDate).toLocaleDateString() : 'Never'}
                </p>
            </div>

            <div className="bg-slate-900/50 backdrop-blur-xl rounded-xl p-6 border border-purple-500/30">
                <div className="flex items-center gap-4 mb-4">
                <div className="text-5xl">🏆</div>
                <div>
                    <h3 className="text-xl font-bold text-white">Longest Streak</h3>
                    <p className="text-slate-400 text-sm">Personal best</p>
                </div>
                </div>
                <div className="text-6xl font-bold text-purple-400">
                {streakData?.longestStreak || 0}
                </div>
                <p className="text-slate-500 text-sm mt-2">Keep going to beat this record!</p>
            </div>
            </div>

            {/* Activity Heatmap */}
            <div className="bg-slate-900/50 backdrop-blur-xl rounded-xl p-8 border border-slate-800">
            <div className="flex items-center justify-between mb-6">
                <div>
                <h2 className="text-2xl font-bold text-white mb-1">Activity Heatmap</h2>
                <p className="text-slate-400 text-sm">Your problem-solving activity over the past year</p>
                </div>
                <div className="flex items-center gap-2 text-sm">
                <span className="text-slate-500">Less</span>
                <div className="flex gap-1">
                    <div className="w-4 h-4 bg-slate-800 rounded"></div>
                    <div className="w-4 h-4 bg-emerald-900/50 rounded"></div>
                    <div className="w-4 h-4 bg-emerald-700/70 rounded"></div>
                    <div className="w-4 h-4 bg-emerald-500 rounded"></div>
                    <div className="w-4 h-4 bg-emerald-400 rounded"></div>
                </div>
                <span className="text-slate-500">More</span>
                </div>
            </div>
            
            <StreakHeatmap streakHistory={streakData?.streakHistory || []} />
            </div>

            {/* Monthly Progress Chart */}
            <div className="bg-slate-900/50 backdrop-blur-xl rounded-xl p-8 border border-slate-800">
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-white mb-1">Monthly Progress</h2>
                <p className="text-slate-400 text-sm">Problems solved per month over the last year</p>
            </div>
            
            <MonthlyChart monthlyProgress={monthlyData?.monthlyProgress || []} />
            </div>

            {/* Difficulty Distribution */}
            <div className="bg-slate-900/50 backdrop-blur-xl rounded-xl p-8 border border-slate-800">
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-white mb-1">Difficulty Distribution</h2>
                <p className="text-slate-400 text-sm">Breakdown of problems by difficulty level</p>
            </div>
            
            <div className="space-y-4">
                <DifficultyBar 
                label="Easy" 
                count={profileData?.stats?.easy || 0}
                total={totalSolved}
                color="emerald"
                />
                <DifficultyBar 
                label="Medium" 
                count={profileData?.stats?.medium || 0}
                total={totalSolved}
                color="amber"
                />
                <DifficultyBar 
                label="Hard" 
                count={profileData?.stats?.hard || 0}
                total={totalSolved}
                color="rose"
                />
            </div>
            </div>
        </div>
        </div>
    );
    };

    // Heatmap Component
    const StreakHeatmap = ({ streakHistory }) => {
    const getColor = (count) => {
        if (count === 0) return 'bg-slate-800';
        if (count === 1) return 'bg-emerald-900/50';
        if (count === 2) return 'bg-emerald-700/70';
        if (count === 3) return 'bg-emerald-500';
        return 'bg-emerald-400';
    };

    // Generate last 365 days
    const days = [];
    const today = new Date();
    for (let i = 364; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        
        const dateStr = date.toISOString().split('T')[0];
        const dayData = streakHistory.find(h => 
        new Date(h.date).toISOString().split('T')[0] === dateStr
        );
        
        days.push({
        date: date,
        count: dayData?.problemsSolved || 0
        });
    }

    // Group by weeks
    const weeks = [];
    for (let i = 0; i < days.length; i += 7) {
        weeks.push(days.slice(i, i + 7));
    }

    return (
        <div className="overflow-x-auto">
        <div className="inline-flex gap-1">
            {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="flex flex-col gap-1">
                {week.map((day, dayIndex) => (
                <div
                    key={dayIndex}
                    className={`w-3 h-3 rounded-sm ${getColor(day.count)} hover:ring-2 hover:ring-blue-400 transition-all cursor-pointer`}
                    title={`${day.date.toLocaleDateString()}: ${day.count} problems`}
                ></div>
                ))}
            </div>
            ))}
        </div>
        </div>
    );
    };

    // Monthly Chart Component
    const MonthlyChart = ({ monthlyProgress }) => {
    const maxValue = Math.max(...monthlyProgress.map(m => m.problemsSolved), 1);

    return (
        <div className="space-y-6">
        <div className="flex items-end justify-between gap-2 h-64">
            {monthlyProgress.map((month, index) => {
            const height = (month.problemsSolved / maxValue) * 100;
            
            return (
                <div key={index} className="flex-1 flex flex-col items-center gap-2">
                <div className="relative w-full flex flex-col items-center group">
                    {/* Tooltip */}
                    <div className="absolute -top-16 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs whitespace-nowrap z-10">
                    <div className="font-bold text-white mb-1">{month.month}</div>
                    <div className="text-emerald-400">Easy: {month.easy}</div>
                    <div className="text-amber-400">Medium: {month.medium}</div>
                    <div className="text-rose-400">Hard: {month.hard}</div>
                    </div>
                    
                    {/* Bar */}
                    <div className="w-full bg-slate-800 rounded-t-lg overflow-hidden relative">
                    <div 
                        className="w-full bg-gradient-to-t from-blue-500 to-purple-500 transition-all duration-500 hover:from-blue-400 hover:to-purple-400"
                        style={{ height: `${height}%`, minHeight: height > 0 ? '4px' : '0' }}
                    ></div>
                    </div>
                    
                    {/* Value on top */}
                    {month.problemsSolved > 0 && (
                    <div className="absolute -top-6 text-xs font-bold text-blue-400">
                        {month.problemsSolved}
                    </div>
                    )}
                </div>
                
                {/* Month label */}
                <div className="text-xs text-slate-500 rotate-0 text-center">
                    {month.month.split('-')[1]}
                </div>
                </div>
            );
            })}
        </div>
        </div>
    );
    };

    // Difficulty Bar Component
    const DifficultyBar = ({ label, count, total, color }) => {
    const percentage = total > 0 ? ((count / total) * 100).toFixed(1) : 0;

    const colorClasses = {
        emerald: {
        bg: 'bg-emerald-500',
        text: 'text-emerald-400',
        border: 'border-emerald-500/30'
        },
        amber: {
        bg: 'bg-amber-500',
        text: 'text-amber-400',
        border: 'border-amber-500/30'
        },
        rose: {
        bg: 'bg-rose-500',
        text: 'text-rose-400',
        border: 'border-rose-500/30'
        }
    };

    const colors = colorClasses[color];

    return (
        <div className={`bg-slate-800/30 rounded-xl p-4 border ${colors.border}`}>
        <div className="flex items-center justify-between mb-3">
            <span className="text-lg font-semibold text-white">{label}</span>
            <div className="flex items-center gap-4">
            <span className={`text-2xl font-bold ${colors.text}`}>{count}</span>
            <span className="text-sm text-slate-500">{percentage}%</span>
            </div>
        </div>
        <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden">
            <div 
            className={`h-full ${colors.bg} transition-all duration-500 rounded-full`}
            style={{ width: `${percentage}%` }}
            ></div>
        </div>
        </div>
    );
    };

    export default TrackProgress;