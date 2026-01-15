// src/pages/Profile.jsx
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axiosClient from '../utils/axios';

const Profile = () => {
  const [activeSection, setActiveSection] = useState('overview');
  const [profileStats, setProfileStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bio, setBio] = useState('');
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  
  const navigate = useNavigate();
  const { userId } = useParams();
  const { user: currentUser } = useSelector((state) => state.auth);

  useEffect(() => {
    const fetchProfileStats = async () => {
      try {
        const response = await axiosClient.get('/api/profile/stats');
        // console.log('Profile Stats Response:', response.data);
        
        // Handle different response structures
        const data = response.data.data || response.data;
        // console.log('Processed data:', data);
        
        setProfileStats(data);
        
        // Set bio and preferences from fetched data
        if (data.user) {
          setBio(data.user.bio || '');
          setEmailNotifications(data.user.preferences?.emailNotifications ?? true);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching profile stats:', error);
        setLoading(false);
      }
    };

    fetchProfileStats();
    const handleFocus = () => {
      fetchProfileStats();
    };

    window.addEventListener('focus', handleFocus);

    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, [userId]);

  const sidebarItems = [
    { id: 'overview', icon: '👤', label: 'Overview', action: 'section' },
    { id: 'progress', icon: '📊', label: 'Track Progress', action: 'navigate', path: `/profile/${userId}/progress` },
    { id: 'community', icon: '👥', label: 'Community', action: 'navigate', path: '/community' },
    { id: 'competition', icon: '🏆', label: '1v1 Competition', action: 'navigate', path: '/competition' },
    { id: 'practice', icon: '🎯', label: 'Practice', action: 'navigate', path: '/practice' },
    { id: 'contests', icon: '🏅', label: 'Contests', action: 'navigate', path: '/contests' },
    { id: 'visualizer', icon: '🎨', label: 'DSA Visualizer', action: 'navigate', path: '/visualizer' },
    { id: 'settings', icon: '⚙️', label: 'Settings', action: 'section' }
  ];

  const handleNavigation = (item) => {
    if (item.action === 'navigate') {
      navigate(item.path);
    } else {
      setActiveSection(item.id);
    }
  };

  const handleSaveSettings = async () => {
    try {
      setIsSaving(true);
      setSaveMessage('');

      const response = await axiosClient.put('/api/profile/update', {
        bio: bio,
        preferences: {
          emailNotifications: emailNotifications
        }
      });

      if (response.data.success) {
        setSaveMessage('Settings saved successfully!');
        
        // Update the profileStats with new data
        setProfileStats(prev => ({
          ...prev,
          user: {
            ...prev.user,
            bio: bio,
            preferences: {
              ...prev.user?.preferences,
              emailNotifications: emailNotifications
            }
          }
        }));

        // Clear success message after 3 seconds
        setTimeout(() => {
          setSaveMessage('');
        }, 3000);
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      setSaveMessage('Failed to save settings. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 bg-blue-500/20 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  // ✅ FIXED: Better handling of user stats with fallbacks
  const user = profileStats?.user || currentUser || {};
  
  // ✅ FIXED: Handle different possible data structures
  const solvedStats = profileStats?.solved || {};
  
  // Calculate from both backend and user stats
  const easySolved = solvedStats.easy || user.stats?.easy || 0;
  const mediumSolved = solvedStats.medium || user.stats?.medium || 0;
  const hardSolved = solvedStats.hard || user.stats?.hard || 0;
  
  // Calculate total from individual counts
  const totalSolved = easySolved + mediumSolved + hardSolved;
  
  const totalProblems = profileStats?.totalProblems?.all || 
                       profileStats?.totalProblems || 
                       1; // fallback
  
  const progressPercentage = totalProblems > 0 
    ? Math.round((totalSolved / totalProblems) * 100) 
    : 0;

  // console.log('Calculated Stats:', {
    // totalSolved,
    // easySolved,
    // mediumSolved,
    // hardSolved,
    // totalProblems,
    // progressPercentage,
    // rawSolvedStats: solvedStats
  // });

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Animated background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-600/5 rounded-full blur-3xl"></div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 min-h-screen bg-slate-900/50 backdrop-blur-xl border-r border-slate-800 fixed left-0 top-0">
          <div className="p-6">
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
              <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Profile Menu
              </h2>
            </div>
            <nav className="space-y-2">
              {sidebarItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleNavigation(item)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                    activeSection === item.id && item.action === 'section'
                      ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-400 border border-blue-500/30'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  <span className="text-xl">{item.icon}</span>
                  <span className="font-medium">{item.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="ml-64 flex-1 p-8">
          {activeSection === 'overview' && (
            <div className="space-y-8">
              {/* Profile Header */}
              <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl p-8 border border-slate-800">
                <div className="flex items-start gap-6">
                  <div className="relative">
                    <img
                      src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.firstname}`}
                      alt="Profile"
                      className="w-32 h-32 rounded-full border-4 border-blue-500/30 shadow-lg shadow-blue-500/20"
                    />
                    <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center border-4 border-slate-900">
                      <span className="text-sm">✨</span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-2">
                      <h1 className="text-3xl font-bold text-white">
                        {user.firstname} {user.lastname}
                      </h1>
                      <span className="px-3 py-1 rounded-full text-sm font-semibold bg-blue-500/20 text-blue-400 border border-blue-500/30">
                        Member
                      </span>
                    </div>
                    <p className="text-slate-400 mb-4">{user.bio || "Coding enthusiast"}</p>
                    <div className="flex items-center gap-6 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400">👥 Followers:</span>
                        <span className="text-white font-semibold">{user.followers?.length || 0}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400">Following:</span>
                        <span className="text-white font-semibold">{user.following?.length || 0}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400">Contest Rating:</span>
                        <span className="text-blue-400 font-bold">{user.contestRating || 1500}</span>
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={() => setActiveSection('settings')}
                    className="px-6 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold hover:from-blue-600 hover:to-purple-600 transition-all"
                  >
                    Edit Profile
                  </button>
                </div>
              </div>

              {/* ✅ FIXED: Problems Solved Overview with better data handling */}
              <div className="bg-slate-900/50 backdrop-blur-xl rounded-xl p-8 border border-slate-800">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-1">Problems Solved</h3>
                    <p className="text-slate-400 text-sm">Your problem-solving journey</p>
                  </div>
                  <button 
                    onClick={() => navigate(`/profile/${userId}/progress`)}
                    className="px-4 py-2 bg-blue-500/20 text-blue-400 rounded-lg border border-blue-500/30 hover:bg-blue-500/30 transition-all flex items-center gap-2"
                  >
                    <span>View Detailed Stats</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>

                {/* Progress Circle */}
                <div className="flex items-center gap-8">
                  <div className="relative w-40 h-40">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle
                        cx="80"
                        cy="80"
                        r="70"
                        stroke="currentColor"
                        strokeWidth="12"
                        fill="none"
                        className="text-slate-800"
                      />
                      <circle
                        cx="80"
                        cy="80"
                        r="70"
                        stroke="url(#gradient)"
                        strokeWidth="12"
                        fill="none"
                        strokeDasharray={`${(totalSolved / totalProblems) * 440} 440`}
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
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <div className="text-3xl font-bold text-white">{totalSolved}</div>
                      <div className="text-xs text-slate-400">of {totalProblems}</div>
                    </div>
                  </div>

                  <div className="flex-1 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                        <span className="text-slate-300">Easy</span>
                      </div>
                      <span className="text-white font-semibold">{easySolved}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
                        <span className="text-slate-300">Medium</span>
                      </div>
                      <span className="text-white font-semibold">{mediumSolved}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-rose-500 rounded-full"></div>
                        <span className="text-slate-300">Hard</span>
                      </div>
                      <span className="text-white font-semibold">{hardSolved}</span>
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-slate-400">Overall Progress</span>
                    <span className="text-lg font-bold text-blue-400">{progressPercentage}%</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500"
                      style={{ width: `${progressPercentage}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-slate-900/50 backdrop-blur-xl rounded-xl p-6 border border-emerald-500/30 hover:border-emerald-500/50 transition-all">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-slate-400 text-sm font-medium">Easy Problems</h3>
                    <span className="text-2xl">✅</span>
                  </div>
                  <div className="text-3xl font-bold text-emerald-400">{easySolved}</div>
                  <div className="mt-2 text-xs text-slate-500">Solved</div>
                </div>

                <div className="bg-slate-900/50 backdrop-blur-xl rounded-xl p-6 border border-amber-500/30 hover:border-amber-500/50 transition-all">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-slate-400 text-sm font-medium">Medium Problems</h3>
                    <span className="text-2xl">⚡</span>
                  </div>
                  <div className="text-3xl font-bold text-amber-400">{mediumSolved}</div>
                  <div className="mt-2 text-xs text-slate-500">Solved</div>
                </div>

                <div className="bg-slate-900/50 backdrop-blur-xl rounded-xl p-6 border border-rose-500/30 hover:border-rose-500/50 transition-all">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-slate-400 text-sm font-medium">Hard Problems</h3>
                    <span className="text-2xl">🔥</span>
                  </div>
                  <div className="text-3xl font-bold text-rose-400">{hardSolved}</div>
                  <div className="mt-2 text-xs text-slate-500">Solved</div>
                </div>

                <div className="bg-slate-900/50 backdrop-blur-xl rounded-xl p-6 border border-blue-500/30 hover:border-blue-500/50 transition-all">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-slate-400 text-sm font-medium">Acceptance Rate</h3>
                    <span className="text-2xl">📈</span>
                  </div>
                  <div className="text-3xl font-bold text-blue-400">{user.stats?.acceptanceRate || 0}%</div>
                  <div className="mt-2 text-xs text-slate-500">{user.stats?.totalSubmissions || 0} submissions</div>
                </div>
              </div>

              {/* Streak Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-900/50 backdrop-blur-xl rounded-xl p-6 border border-orange-500/30 hover:border-orange-500/50 transition-all">
                  <div className="flex items-center gap-4 mb-4">
                    <span className="text-4xl">🔥</span>
                    <div>
                      <h3 className="text-xl font-bold text-white">Current Streak</h3>
                      <p className="text-slate-400 text-sm">Keep it going!</p>
                    </div>
                  </div>
                  <div className="text-5xl font-bold text-orange-400">{user.currentStreak || 0}</div>
                  <div className="text-slate-400 text-sm mt-2">days in a row</div>
                </div>

                <div className="bg-slate-900/50 backdrop-blur-xl rounded-xl p-6 border border-purple-500/30 hover:border-purple-500/50 transition-all">
                  <div className="flex items-center gap-4 mb-4">
                    <span className="text-4xl">🏆</span>
                    <div>
                      <h3 className="text-xl font-bold text-white">Longest Streak</h3>
                      <p className="text-slate-400 text-sm">Personal best</p>
                    </div>
                  </div>
                  <div className="text-5xl font-bold text-purple-400">{user.longestStreak || 0}</div>
                  <div className="text-slate-400 text-sm mt-2">days record</div>
                </div>
              </div>

              {/* Badges Section */}
              <div className="bg-slate-900/50 backdrop-blur-xl rounded-xl p-8 border border-slate-800">
                <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                  <span>🎖️</span>
                  Achievements & Badges
                </h3>
                {user.badges && user.badges.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {user.badges.map((badge, index) => (
                      <div
                        key={index}
                        className="bg-slate-800/50 rounded-xl p-4 border border-slate-700 hover:border-blue-500/50 transition-all text-center"
                      >
                        <div className="text-4xl mb-2">{badge.icon}</div>
                        <h4 className="text-white font-semibold text-sm mb-1">{badge.name}</h4>
                        <p className="text-slate-400 text-xs">{badge.description || new Date(badge.earnedAt).toLocaleDateString()}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">🎯</div>
                    <p className="text-slate-400">Start solving problems to earn badges!</p>
                  </div>
                )}
              </div>

              {/* Quick Stats */}
              <div className="bg-slate-900/50 backdrop-blur-xl rounded-xl p-8 border border-slate-800">
                <h3 className="text-2xl font-bold text-white mb-6">Quick Stats</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
                      {totalSolved}
                    </div>
                    <div className="text-slate-400 text-sm">Total Problems Solved</div>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-bold bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent mb-2">
                      {user.stats?.acceptanceRate || 0}%
                    </div>
                    <div className="text-slate-400 text-sm">Success Rate</div>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-bold bg-gradient-to-r from-orange-400 to-rose-400 bg-clip-text text-transparent mb-2">
                      #{Math.floor(Math.random() * 1000) + 1}
                    </div>
                    <div className="text-slate-400 text-sm">Global Ranking</div>
                  </div>
                </div>
              </div>

              {/* Debug Info - Remove in production */}
              {process.env.NODE_ENV === 'development' && (
                <div className="bg-slate-900/50 backdrop-blur-xl rounded-xl p-6 border border-yellow-500/30">
                  <h3 className="text-yellow-400 font-bold mb-4">Debug Info (Dev Only)</h3>
                  <pre className="text-xs text-slate-300 overflow-auto">
                    {JSON.stringify({
                      totalSolved,
                      easySolved,
                      mediumSolved,
                      hardSolved,
                      totalProblems,
                      progressPercentage,
                      rawStats: profileStats
                    }, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}

          {activeSection === 'settings' && (
            <div className="space-y-8">
              <div className="bg-slate-900/50 backdrop-blur-xl rounded-xl p-8 border border-slate-800">
                <h2 className="text-2xl font-bold text-white mb-6">Profile Settings</h2>
                
                {/* Success/Error Message */}
                {saveMessage && (
                  <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
                    saveMessage.includes('success') 
                      ? 'bg-green-500/20 border border-green-500/30 text-green-400' 
                      : 'bg-red-500/20 border border-red-500/30 text-red-400'
                  }`}>
                    <span className="text-xl">{saveMessage.includes('success') ? '✅' : '❌'}</span>
                    <span>{saveMessage}</span>
                  </div>
                )}

                <div className="space-y-6">
                  {/* Bio Field */}
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">Bio</label>
                    <textarea
                      className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500/50 transition-colors resize-none"
                      rows="4"
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Tell us about yourself..."
                      maxLength={500}
                    />
                    <div className="text-xs text-slate-500 mt-1 text-right">
                      {bio.length}/500 characters
                    </div>
                  </div>

                  {/* Email Notifications */}
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-3">Preferences</label>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                        <input 
                          type="checkbox" 
                          id="emailNotifications"
                          className="w-5 h-5 rounded border-slate-600 bg-slate-800 text-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-900 cursor-pointer" 
                          checked={emailNotifications}
                          onChange={(e) => setEmailNotifications(e.target.checked)}
                        />
                        <label htmlFor="emailNotifications" className="text-white cursor-pointer flex-1">
                          Receive email notifications for new followers and comments
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Save Button */}
                  <div className="flex gap-4">
                    <button 
                      onClick={handleSaveSettings}
                      disabled={isSaving}
                      className={`flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all shadow-lg shadow-blue-500/20 ${
                        isSaving ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      {isSaving ? (
                        <span className="flex items-center justify-center gap-2">
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          Saving...
                        </span>
                      ) : (
                        'Save Changes'
                      )}
                    </button>
                    <button 
                      onClick={() => {
                        setBio(user.bio || '');
                        setEmailNotifications(user.preferences?.emailNotifications ?? true);
                        setSaveMessage('');
                      }}
                      className="px-6 py-3 bg-slate-800 text-slate-300 font-semibold rounded-lg hover:bg-slate-700 transition-all border border-slate-700"
                    >
                      Reset
                    </button>
                  </div>
                </div>
              </div>

              {/* Additional Settings Sections */}
              <div className="bg-slate-900/50 backdrop-blur-xl rounded-xl p-8 border border-slate-800">
                <h3 className="text-xl font-bold text-white mb-6">Account Information</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-4 border-b border-slate-800">
                    <div>
                      <p className="text-white font-medium">Name</p>
                      <p className="text-slate-400 text-sm">{user.firstname} {user.lastname}</p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center py-4 border-b border-slate-800">
                    <div>
                      <p className="text-white font-medium">Email</p>
                      <p className="text-slate-400 text-sm">{user.email || 'Not set'}</p>
                    </div>
                  </div>
                                    <div className="flex justify-between items-center py-4 border-b border-slate-800">
                    <div>
                      <p className="text-white font-medium">Email</p>
                      <p className="text-slate-400 text-sm">{user.emailId || 'Not set'}</p>
                    </div>
                  </div>

                  <div className="flex justify-between items-center py-4 border-b border-slate-800">
                    <div>
                      <p className="text-white font-medium">Role</p>
                      <p className="text-slate-400 text-sm capitalize">{user.role || 'user'}</p>
                    </div>
                  </div>

                  <div className="flex justify-between items-center py-4">
                    <div>
                      <p className="text-white font-medium">Member Since</p>
                      <p className="text-slate-400 text-sm">
                        {user.createdAt
                          ? new Date(user.createdAt).toLocaleDateString()
                          : 'Unknown'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
