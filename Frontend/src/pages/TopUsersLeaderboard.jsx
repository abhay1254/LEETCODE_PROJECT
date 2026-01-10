import React, { useState, useEffect } from 'react';
import { Trophy, Medal, Award, TrendingUp } from 'lucide-react';
import axiosClient from '../utils/axios';

const TopUsersLeaderboard = () => {
  const [topUsers, setTopUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTopUsers();
  }, []);

  const fetchTopUsers = async () => {
    try {
      setLoading(true);
      const response = await axiosClient.get('/problem/users/top-rankers');
      
      if (response.data.success) {
        setTopUsers(response.data.data);
      } else {
        setError(response.data.message);
      }
    } catch (err) {
      setError('Failed to fetch top users');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getMedalIcon = (rank) => {
    switch(rank) {
      case 0:
        return <Trophy className="w-8 h-8 text-yellow-400" />;
      case 1:
        return <Medal className="w-7 h-7 text-gray-400" />;
      case 2:
        return <Medal className="w-6 h-6 text-amber-600" />;
      default:
        return <Award className="w-5 h-5 text-blue-500" />;
    }
  };

  const getRankBadge = (rank) => {
    const badges = ['1st', '2nd', '3rd', '4th', '5th'];
    const colors = [
      'bg-gradient-to-r from-yellow-400 to-yellow-600',
      'bg-gradient-to-r from-gray-300 to-gray-500',
      'bg-gradient-to-r from-amber-600 to-amber-800',
      'bg-gradient-to-r from-blue-400 to-blue-600',
      'bg-gradient-to-r from-blue-400 to-blue-600'
    ];
    
    return (
      <div className={`${colors[rank]} text-white font-bold px-3 py-1 rounded-full text-sm shadow-lg`}>
        {badges[rank]}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading leaderboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-lg shadow-lg">
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[400px] py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <TrendingUp className="w-10 h-10 text-indigo-600 mr-3" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Top Coders
            </h1>
          </div>
          <p className="text-gray-600 text-base">Champions who solved the most problems</p>
        </div>

        {/* Leaderboard */}
        <div className="space-y-3">
          {topUsers.map((user, index) => (
            <div
              key={user._id}
              className={`
                bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]
                ${index === 0 ? 'border-2 border-yellow-400' : ''}
                ${index === 1 ? 'border-2 border-gray-400' : ''}
                ${index === 2 ? 'border-2 border-amber-600' : ''}
              `}
            >
              <div className="p-4 flex items-center justify-between">
                {/* Left Section - Rank & Medal */}
                <div className="flex items-center space-x-4">
                  <div className="flex flex-col items-center">
                    {getMedalIcon(index)}
                    <div className="mt-2">
                      {getRankBadge(index)}
                    </div>
                  </div>

                  {/* User Info */}
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">
                      {user.firstname} {user.lastname}
                    </h3>
                    <p className="text-gray-500 text-xs mt-1">
                      {user.emailId}
                    </p>
                  </div>
                </div>

                {/* Right Section - Problem Count */}
                <div className="text-right">
                  <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg px-5 py-3 shadow-md">
                    <p className="text-2xl font-bold">{user.problemCount}</p>
                    <p className="text-xs opacity-90">Problems</p>
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              {topUsers.length > 0 && (
                <div className="px-4 pb-3">
                  <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-1.5 rounded-full transition-all duration-500 ${
                        index === 0 ? 'bg-gradient-to-r from-yellow-400 to-yellow-600' :
                        index === 1 ? 'bg-gradient-to-r from-gray-300 to-gray-500' :
                        index === 2 ? 'bg-gradient-to-r from-amber-600 to-amber-800' :
                        'bg-gradient-to-r from-blue-400 to-blue-600'
                      }`}
                      style={{
                        width: `${(user.problemCount / topUsers[0].problemCount) * 100}%`
                      }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Empty State */}
        {topUsers.length === 0 && (
          <div className="text-center py-12">
            <Trophy className="w-20 h-20 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No users found yet. Be the first!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TopUsersLeaderboard;